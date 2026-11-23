'use strict';

const storyTags = new Set(['A', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'DIV', 'EM',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'LI', 'OL', 'P', 'PRE', 'STRONG',
  'TABLE', 'TBODY', 'TD', 'TH', 'THEAD', 'TR', 'UL']);

function isSourceUrl(url) {
  return typeof url === 'string' && url === url.trim() &&
    /^https:\/\/www\.douyin\.com\/video\/\d{18,20}$/.test(url);
}

function sanitizeMarkdown(fragment) {
  for (const element of fragment.querySelectorAll('*')) {
    if (!storyTags.has(element.tagName)) {
      element.remove();
      continue;
    }
    const href = element.getAttribute('href');
    for (const attribute of [...element.attributes]) element.removeAttribute(attribute.name);
    if (element.tagName === 'A' && isSourceUrl(href)) {
      element.href = href;
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    }
  }
}

if (typeof module === 'object') module.exports = { isSourceUrl, sanitizeMarkdown };
