/**
 * CRAFTNEST — CURSOR.JS
 * Custom cursor for all pages.
 * Usage: <script type="module" src="../js/cursor.js"></script>
 */

// Only run on non-touch devices
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  // Inject cursor elements if not already in DOM
  if (!document.getElementById('cursor')) {
    const c = document.createElement('div');
    c.id = 'cursor';
    c.className = 'cursor';
    document.body.appendChild(c);
  }
  if (!document.getElementById('cursorFollower')) {
    const f = document.createElement('div');
    f.id = 'cursorFollower';
    f.className = 'cursor-follower';
    document.body.appendChild(f);
  }

  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx}px, ${my}px)`;
  });

  function animateFollower() {
    fx += (mx - fx) * 0.1;
    fy += (my - fy) * 0.1;
    follower.style.transform = `translate(${fx}px, ${fy}px)`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover states on interactive elements
  function bindHover() {
    document.querySelectorAll('a, button, [role="button"], input, select, textarea, label').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
      });
    });
  }

  // Bind on load + re-bind when DOM changes (for dynamically rendered cards)
  bindHover();
  const observer = new MutationObserver(bindHover);
  observer.observe(document.body, { childList: true, subtree: true });

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity   = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity   = '1';
    follower.style.opacity = '0.5';
  });
}
