const assert = require('node:assert/strict');
const test = require('node:test');
const { isSourceUrl, sanitizeMarkdown } = require('../site/assets/markdown.js');

const source = 'https://www.douyin.com/video/7555437898573548810';

test('only canonical source URLs are retained', () => {
  assert.equal(isSourceUrl(source), true);
  assert.equal(isSourceUrl('https://example.org/story'), false);
  assert.equal(isSourceUrl(source + '?ref=gallery'), false);
  assert.equal(isSourceUrl(source + '\n'), false);
});

test('preserve text elements and only restore approved link attributes', () => {
  function node(tagName, values) {
    return {
      tagName,
      get attributes() { return Object.keys(values).map(name => ({ name })); },
      getAttribute(name) { return values[name]; },
      removeAttribute(name) { delete values[name]; },
      remove() { this.removed = true; },
    };
  }
  const link = node('A', { href: source, class: 'sample' });
  const unrelated = node('A', { href: 'https://example.org/story' });
  const paragraph = node('P', { id: 'sample' });
  const widget = node('BUTTON', {});
  sanitizeMarkdown({ querySelectorAll: () => [link, unrelated, paragraph, widget] });
  assert.deepEqual(link.attributes, []);
  assert.equal(link.href, source);
  assert.equal(link.rel, 'noopener noreferrer');
  assert.equal(unrelated.href, undefined);
  assert.deepEqual(paragraph.attributes, []);
  assert.equal(widget.removed, true);
});
