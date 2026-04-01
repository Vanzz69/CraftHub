/**
 * CRAFTNEST — CURSOR.JS
 * Plain script (not a module) — works on all pages.
 * Add at bottom of <body>:
 *   <script src="../js/cursor.js"></script>
 */
(function() {
  // Skip on touch devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // Inject cursor divs if not already in page
  function ensureEl(id, cls) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.className = cls;
      document.body.appendChild(el);
    }
    return el;
  }

  var cursor   = ensureEl('cursor', 'cursor');
  var follower = ensureEl('cursorFollower', 'cursor-follower');

  var mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
  });

  (function loop() {
    fx += (mx - fx) * 0.1;
    fy += (my - fy) * 0.1;
    follower.style.transform = 'translate(' + fx + 'px,' + fy + 'px)';
    requestAnimationFrame(loop);
  })();

  function bindHover() {
    document.querySelectorAll('a, button, input, select, textarea, label, [role="button"]').forEach(function(el) {
      if (el._cursorBound) return;
      el._cursorBound = true;
      el.addEventListener('mouseenter', function() { cursor.classList.add('hover'); follower.classList.add('hover'); });
      el.addEventListener('mouseleave', function() { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
    });
  }

  // Bind immediately + watch for dynamically added elements
  bindHover();
  var obs = new MutationObserver(bindHover);
  obs.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('mouseleave', function() { cursor.style.opacity = '0'; follower.style.opacity = '0'; });
  document.addEventListener('mouseenter', function() { cursor.style.opacity = '1'; follower.style.opacity = '0.5'; });
})();
