"""Build the public gallery and optionally stage a GitHub Pages directory."""

import argparse
import json
import re
from pathlib import Path
from shutil import copy2


ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
GALLERY = ROOT / 'gallery'
DOUYIN = re.compile(r'https://www\.douyin\.com/video/\d{18,20}')
SLUG = re.compile(r'\d{4}-[a-z0-9-]+')
IMAGE = re.compile(r'(?:variants/)?[a-z0-9-]+\.jpg')


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def asset(directory, name):
    path = directory / name
    if not path.is_file():
        raise ValueError(f'Asset missing: {path.relative_to(ROOT)}')
    return path


def build(output):
    data = read_json(GALLERY / 'index.json')
    public_cards = []
    staged_assets = [SITE / 'assets' / name for name in ('app.js', 'style.css', 'marked.min.js')]
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
        public_cards.append({**card, 'dossier': dossier, 'image': f'{base}/{portrait}',
                             'md_path': f'{base}/dossier.md', 'json_path': f'{base}/dossier.json',
                             'variants': [{**v, 'image': f"{base}/{v['image']}"} for v in variants]})

    if output != ROOT:
        if output.exists() and any(output.iterdir()):
            raise ValueError(f'Choose an empty output directory: {output}')
        staged_assets.extend(ROOT / name for name in ('index.html', 'LICENSE', 'ASSET-LICENSE.md', 'THIRD-PARTY-NOTICES.md'))
        for path in staged_assets:
            target = output / path.relative_to(ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            copy2(path, target)

    payload = json.dumps({'meta': data['meta'], 'cards': public_cards}, ensure_ascii=False, separators=(',', ':'))
    (output / 'site/data.js').write_text('window.COUNTY_DATA=' + payload + ';\n', encoding='utf-8')
    shell = (SITE / 'shell.html').read_text(encoding='utf-8')
    (output / 'site/index.html').write_text(shell, encoding='utf-8')
    print(f'Built {len(public_cards)} character cards and {variant_count} variant images.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT, help='empty directory for the static site')
    args = parser.parse_args()
    build(args.output.resolve())
