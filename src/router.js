// Operium Club — SPA Hash Router

const routes = {};
let currentCleanup = null;

export function route(path, handler) {
  routes[path] = handler;
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function getCurrentRoute() {
  return window.location.hash.slice(1) || '/discover';
}

export function getRouteParams() {
  const hash = getCurrentRoute();
  const parts = hash.split('/').filter(Boolean);
  return parts;
}

function matchRoute(hash) {
  // Exact match first
  if (routes[hash]) return { handler: routes[hash], params: {} };

  // Pattern match (e.g., /event/:id)
  for (const pattern of Object.keys(routes)) {
    const patternParts = pattern.split('/').filter(Boolean);
    const hashParts = hash.split('/').filter(Boolean);

    if (patternParts.length !== hashParts.length) continue;

    const params = {};
    let match = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = hashParts[i];
      } else if (patternParts[i] !== hashParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler: routes[pattern], params };
  }

  return null;
}

export function startRouter(appEl) {
  async function render() {
    const hash = getCurrentRoute();
    const matched = matchRoute(hash);

    if (!matched) {
      // Default to discover
      navigate('/discover');
      return;
    }

    // Cleanup previous page
    if (currentCleanup && typeof currentCleanup === 'function') {
      currentCleanup();
    }

    const page = matched.handler(matched.params);
    const contentEl = document.getElementById('page-content');
    if (contentEl) {
      // Add page transition
      contentEl.classList.add('page-exit');
      await new Promise(r => setTimeout(r, 150));
      contentEl.innerHTML = page.html;
      contentEl.classList.remove('page-exit');
      contentEl.classList.add('page-enter');

      // Scroll to top
      contentEl.scrollTop = 0;
      window.scrollTo(0, 0);

      setTimeout(() => contentEl.classList.remove('page-enter'), 400);

      if (page.mount) {
        currentCleanup = page.mount();
      }
    }

    // Update nav active states
    updateNavState(hash);
  }

  window.addEventListener('hashchange', render);
  render();
}

function updateNavState(hash) {
  // Update club nav
  document.querySelectorAll('.club-nav__item').forEach(item => {
    const target = item.dataset.route;
    if (target && hash.startsWith(target)) {
      item.classList.add('club-nav__item--active');
    } else {
      item.classList.remove('club-nav__item--active');
    }
  });

  // Update panel sidebar
  document.querySelectorAll('.panel-sidebar__item').forEach(item => {
    const target = item.dataset.route;
    if (target && hash.startsWith(target)) {
      item.classList.add('panel-sidebar__item--active');
    } else {
      item.classList.remove('panel-sidebar__item--active');
    }
  });

  // Determine if we're in club or panel mode
  const isPanel = hash.startsWith('/panel') || hash.startsWith('/demo');
  document.body.classList.toggle('mode-panel', isPanel);
  document.body.classList.toggle('mode-club', !isPanel);
}
