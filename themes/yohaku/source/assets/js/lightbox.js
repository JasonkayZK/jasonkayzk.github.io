/* Minimal dependency-free lightbox for post figures.
 * Figures render as <a href="full.jpg"><img …></a>; on post pages the link
 * opens an overlay instead of navigating. ESC / click on backdrop closes. */
(function () {
  var overlay = null;

  function open(href, caption) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'lightbox';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      var img = document.createElement('img');
      img.alt = caption || '';
      var cap = document.createElement('p');
      cap.className = 'lightbox-caption';

      overlay.appendChild(img);
      overlay.appendChild(cap);
      overlay.addEventListener('click', close);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
      overlay._img = img;
      overlay._cap = cap;
      document.body.appendChild(overlay);
    }
    overlay._img.src = href;
    overlay._img.onload = function () { overlay.classList.add('loaded'); };
    overlay._cap.textContent = caption || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('open', 'loaded');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('.post-figure a') : null;
    if (!link) return;
    var img = link.querySelector('img');
    var cap = link.parentElement.querySelector('figcaption');
    e.preventDefault();
    open(link.getAttribute('href'), cap ? cap.textContent : (img ? img.alt : ''));
  });
})();
