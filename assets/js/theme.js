(function () {
  var root = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  // Follow OS changes while in auto mode (no stored preference).
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onChange = function (e) {
    try {
      if (!localStorage.getItem('theme')) {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    } catch (err) { /* ignore */ }
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (err) { /* ignore */ }
  });
})();
