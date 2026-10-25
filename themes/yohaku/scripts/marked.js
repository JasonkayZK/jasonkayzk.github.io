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

  // Wrap images (with optional figcaption from alt text) in a link to the
  // full-size source, opened in a new tab — a lightweight stand-in for the
  // reference site's PhotoSwipe lightbox. Renderer options supply lazyload
  // and figcaption, so `src`/`alt`/title are already assembled here.
  renderer.image = function ({ href, title: _title, text }) {
    var out = '<figure class="post-figure">' +
      '<a href="' + href + '" target="_blank" rel="noopener">' +
      '<img src="' + href + '" alt="' + String(text || '').replace(/"/g, '&quot;') + '" loading="lazy">' +
      '</a>';
    if (text) out += '<figcaption>' + text + '</figcaption>';
    return out + '</figure>';
  };
  return renderer;
});

// Group consecutive figures (same-paragraph sequences, or paragraphs that
// contain only figures) into horizontal photo rows. Build-time pass over
// rendered post HTML.
hexo.extend.filter.register('after_render:html', function (html, data) {
  if (!data) return html;
  var p = data.path || '';
  if (html.indexOf('post-figure') < 0 || p.indexOf('blog/') !== 0) return html;

  // A run is: figure, then any number of immediately-adjacent figures
  // (only whitespace may separate them — same paragraph or empty paragraph).
  var figRun = /<figure class="post-figure">[\s\S]*?<\/figure>(?:\s*<figure class="post-figure">[\s\S]*?<\/figure>)*/g;
  var runs = [];
  var m;
  while ((m = figRun.exec(html)) !== null) runs.push({ start: m.index, end: m.index + m[0].length, text: m[0] });

  if (!runs.length) return html;

  var figSplit = /<figure class="post-figure">[\s\S]*?<\/figure>/g;
  var out = [];
  var cursor = 0;
  for (var i = 0; i < runs.length; i++) {
    var cur = runs[i];
    out.push(html.slice(cursor, cur.start));

    var figs = cur.text.match(figSplit) || [];
    // absorb following runs separated only by </p>…<p> (empty paragraph edges)
    var j = i + 1;
    while (j < runs.length && /^<\/p>\s*<p>$/.test(html.slice(runs[j - 1].end, runs[j].start))) {
      figs = figs.concat(runs[j].text.match(figSplit) || []);
      j++;
    }
    i = j - 1;

    out.push(figs.length > 1
      ? '<div class="image-row">' + figs.join('') + '</div>'
      : figs[0]);
    cursor = runs[i].end;
  }
  out.push(html.slice(cursor));
  return out.join('');
});
