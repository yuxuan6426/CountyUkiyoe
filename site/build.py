"""Build the public gallery and optionally stage a GitHub Pages directory."""

import argparse
import json
import re
from pathlib import Path
from shutil import copy2

from release_checks import check_vendored, finish_release, prepare_output


ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
GALLERY = ROOT / 'gallery'
DOUYIN = re.compile(r'https://www\.douyin\.com/video/\d{18,20}')
SLUG = re.compile(r'\d{4}-[a-z0-9-]+')
IMAGE = re.compile(r'(?:variants/)?[a-z0-9-]+\.jpg')
PAGES_ROOT = 'https://yuxuan6426.github.io/'
CARD_FIELDS = (
    'id', 'slug', 'name', 'category', 'aliases', 'appearance_count', 'summary',
    'validated', 'image_status', 'art_note', 'face_design', 'story', 'sources',
    'blurb', 'tags',
)


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def asset(directory, name):
    path = directory / name
    if not path.is_file() or path.is_symlink() or not path.resolve().is_relative_to(ROOT):
        raise ValueError(f'Asset missing: {path.relative_to(ROOT)}')
    return path


def build(output, platform='wiki'):
    check_vendored(ROOT, {'site/assets/marked.min.js':
        '15fabce5b65898b32b03f5ed25e9f891a729ad4c0d6d877110a7744aa847a894'})
    output = prepare_output(ROOT, output)
    data = read_json(GALLERY / 'index.json')
    public_cards = []
    staged_assets = [SITE / 'assets' / name for name in
                     ('app.js', 'style.css', 'marked.min.js', 'markdown.js', 'character-entry.js')]
    seen = set()
    variant_count = 0
    for card in data['cards']:
        slug = card['slug']
        if not SLUG.fullmatch(slug) or slug in seen:
            raise ValueError(f'Invalid or duplicate character slug: {slug}')
        seen.add(slug)
        directory = GALLERY / 'characters' / slug
        base = f'../gallery/characters/{slug}'
        portrait = card['portrait']
        variants = card['variants']
        for name in (portrait, *(v['image'] for v in variants)):
            if not IMAGE.fullmatch(name):
                raise ValueError(f'Invalid image path for {slug}: {name}')
            staged_assets.append(asset(directory, name))
        if not all(DOUYIN.fullmatch(source['url']) for source in card['sources']):
            raise ValueError(f'Invalid source URL for {slug}')
        variant_count += len(variants)
        dossier_json = asset(directory, 'dossier.json')
        staged_assets.extend((asset(directory, 'dossier.md'), dossier_json))
        dossier = read_json(dossier_json)
        profile = {key: card[key] for key in CARD_FIELDS if key in card}
        public_cards.append({**profile, 'dossier': dossier, 'image': f'{base}/{portrait}',
                             'md_path': f'{base}/dossier.md', 'json_path': f'{base}/dossier.json',
                             'variants': [{**v, 'image': f"{base}/{v['image']}"} for v in variants]})

    if len(public_cards) != 427:
        raise ValueError("Expected 427 published gallery profiles")
    staged_assets.extend(ROOT / name for name in ('index.html', 'LICENSE', 'ASSET-LICENSE.md', 'THIRD-PARTY-NOTICES.md'))
    for path in staged_assets:
        target = output / path.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        copy2(path, target)

    payload = json.dumps({'meta': data['meta'], 'cards': public_cards}, ensure_ascii=False, separators=(',', ':'))
    (output / 'site/data.js').write_text('window.COUNTY_DATA=' + payload + ';\n',
                                         encoding='utf-8', newline='\n')
    shell = (SITE / 'shell.html').read_text(encoding='utf-8')
    if platform == 'pages':
        shell = shell.replace('https://card.yuxuan.wiki/', PAGES_ROOT + 'CountyUkiyoe-Play/')
        shell = shell.replace('https://quiz.yuxuan.wiki/', PAGES_ROOT + 'CountyUkiyoe-Quiz/')
    (output / 'site/index.html').write_text(shell, encoding='utf-8')
    character = shell.replace('</body>', '<script src="assets/character-entry.js"></script>\n</body>')
    (output / 'site/character.html').write_text(character, encoding='utf-8')
    wiki = platform == 'wiki'
    site_url = 'https://xian.yuxuan.wiki/' if wiki else PAGES_ROOT + 'CountyUkiyoe/'
    guide = (ROOT / 'docs/agent-guide.md').read_text(encoding='utf-8')
    (output / 'agent-guide.md').write_text(guide.replace('https://xian.yuxuan.wiki/', site_url),
                                           encoding='utf-8', newline='\n')
    expected = [path.relative_to(ROOT).as_posix() for path in staged_assets]
    expected.extend(('site/data.js', 'site/index.html', 'site/character.html', 'agent-guide.md'))
    finish_release(output, expected, site_url, wiki=wiki)
    print(f'Built {len(public_cards)} character cards and {variant_count} variant images.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist', help='empty directory for the static site')
    parser.add_argument('--platform', choices=('wiki', 'pages'), default='wiki',
                        help='deployment used for links to the quiz and card sites')
    args = parser.parse_args()
    build(args.output.resolve(), args.platform)
