document.addEventListener('DOMContentLoaded', function () {
  var toggles = document.querySelectorAll('.pub-abstract-toggle');
  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = this.closest('.pub-card');
      var details = card.querySelector('.pub-details');
      var isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      details.setAttribute('aria-hidden', isExpanded);
    });
  });

  var pills = document.querySelectorAll('.filter-pill');
  var cards = document.querySelectorAll('.pub-card');
  var yearSections = document.querySelectorAll('.pub-year-section');

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var tag = this.getAttribute('data-tag');

      pills.forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');

      pills.forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
      this.setAttribute('aria-pressed', 'true');

      cards.forEach(function (card) {
        var cardTags = (card.getAttribute('data-tags') || '').split(',');
        if (tag === 'all' || cardTags.indexOf(tag) !== -1) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      yearSections.forEach(function (section) {
        var anyVisible = Array.prototype.some.call(
          section.querySelectorAll('.pub-card'),
          function (c) { return c.style.display !== 'none'; }
        );
        section.style.display = anyVisible ? '' : 'none';
      });
    });
  });
});
