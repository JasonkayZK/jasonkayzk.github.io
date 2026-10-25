'use strict';

// kramdown-parity headings: id on the heading element, no headerlink anchor.
// hexo-renderer-marked v7 exposes the marked token-object renderer API:
// heading({ tokens, depth }) with this.parser.parseInline(tokens).
hexo.extend.filter.register('marked:renderer', function (renderer) {
  renderer.heading = function ({ tokens, depth: level }) {
    var text = this.parser.parseInline(tokens);
    var id = String(text)
      .replace(/<[^>]*>/g, '')
      .toLowerCase()
      .replace(/[^一-龥a-z0-9\- ]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>';
  };
  return renderer;
});
