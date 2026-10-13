// Operium Club — Main Bootstrap
import { route, alias, startRouter, navigate } from './router.js';
import { icon } from './icons.js';
import { 
  getState, 
  subscribe, 
  resetDemo, 
  startTour, 
  nextTourStep, 
  prevTourStep, 
  setTourStep, 
  endTour, 
  setCurrentVenue 
} from './store.js';

// Import pages
import Discover from './pages/club/Discover.js';
import EventDetail from './pages/club/EventDetail.js';
import MyClub from './pages/club/MyClub.js';
import Summary from './pages/panel/Summary.js';
import Events from './pages/panel/Events.js';
import Origin from './pages/panel/Origin.js';
import Marketing from './pages/panel/Marketing.js';
import Door from './pages/panel/Door.js';
import DemoControl from './pages/demo/DemoControl.js';
import { VENUES } from './data/venues.js';

// Import styles
// Display condensada para la app del público (self-hosted vía Fontsource)
import '@fontsource-variable/big-shoulders-display';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/club.css';
import './styles/panel.css';
import './styles/animations.css';
import './styles/editorial.css';

// Register routes
route('/discover', Discover);
route('/event/:id', (params) => EventDetail(params));
route('/myclub', MyClub);
route('/panel/resumen', Summary);
route('/panel/eventos', Events);
route('/panel/origen', Origin);
route('/panel/publico', Marketing);
route('/panel/puerta', Door);
route('/demo', DemoControl);

// Rutas de la versión anterior del panel
alias('/panel/venue', '/panel/resumen');
alias('/panel/group', '/panel/resumen');
alias('/panel/promoters', '/panel/origen');
alias('/panel/marketing', '/panel/publico');

// Recorrido guiado. En pantalla solo la acción a realizar; la frase para el
// cliente queda plegada como guion del presentador. Los pasos con `module`
// desaparecen si el presentador oculta ese módulo.
const TOUR_STEPS = [
  {
    title: 'Descubrir',
    route: '/discover',
    venueId: null,
    desc: 'Pulsa “Guardar” en un evento de Mood. Queda en el perfil del miembro como interés, no como asistencia ni venta.',
    phrase: 'No venimos a reemplazar su facturación ni su control de entradas. Queremos mostrar cómo podrían conectar público, promotores y marketing con decisiones útiles para sus locales.',
  },
  {
    title: 'Origen',
    route: '/panel/origen',
    venueId: 'mood',
    desc: 'En la tarjeta de Ricardo V., pulsa “Simular visita” y después “Repetir la misma”: la segunda no cuenta.',
    phrase: 'Cada promotor tiene su propio enlace. Medimos cuánto público trae de verdad, sin duplicar comisiones.',
  },
  {
    title: 'Público',
    route: '/panel/publico',
    venueId: 'mood',
    module: 'publico',
    desc: 'Mira cuántos recurrentes quedan fuera por falta de permiso y pulsa “Envío simulado”.',
    phrase: 'Verificamos canal y autorización para cada local. Nadie recibe invitaciones sin consentimiento previo.',
  },
  {
    title: 'Puerta',
    route: '/panel/puerta',
    venueId: 'mood',
    module: 'puerta',
    desc: 'Registra un ingreso desde el teléfono y repítelo con la misma persona: el segundo se rechaza.',
    phrase: 'Un guardado no es una venta. Primero vemos interés; después, asistencia validada una sola vez.',
  },
  {
    title: 'Eventos',
    route: '/panel/eventos',
    venueId: 'mood',
    desc: 'Antes de abrir solo hay interés; cuando cierra la noche aparecen asistencia y conversión. Las ventas nunca se estiman.',
    phrase: 'Una venta solo se mostrará cuando podamos enlazarla a una fuente confiable de POS o caja. Nunca por inferencia.',
  },
  {
    title: 'Resumen',
    route: '/panel/resumen',
    venueId: 'all',
    desc: 'Las cuatro marcas en una sola vista, de lo general al detalle, sin cruzar datos personales.',
    phrase: '¿Qué parte de esta experiencia ya resuelve su sistema, qué parte les falta y cuál valdría la pena comprobar en un piloto pequeño?',
  },
];

const activeSteps = () => {
  const hidden = getState().hiddenModules || [];
  return TOUR_STEPS.filter(s => !s.module || !hidden.includes(s.module));
};

// Build app shell
function buildAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Franja de vista: dice siempre qué mundo se está viendo. También es el aviso único de datos ficticios. -->
    <div class="demo-banner view-bar" id="demo-banner">
      <div class="view-bar__who" id="view-bar-who"></div>
      <span class="view-bar__demo">Datos ficticios</span>
    </div>

    <header class="app-header" id="app-header">
      <div class="app-header__left">
        <a href="#/discover" class="app-header__logo">
          ${icon('diamond', { size: 14, filled: true, cls: 'app-header__logo-mark' })}
          <span class="app-header__logo-text">OPERIUM</span>
        </a>
        <span class="app-header__divider">/</span>
        <span class="app-header__subtitle" id="app-header-subtitle">Club</span>
        <!-- Pestañas del público en escritorio (en móvil hace lo mismo la barra inferior) -->
        <nav class="club-tabs" aria-label="App del público">
          <a href="#/discover" class="club-tabs__item" data-tab="agenda">${icon('calendar', { size: 16 })}Agenda</a>
          <a href="#/myclub" class="club-tabs__item" data-tab="myclub">${icon('user', { size: 16 })}Mi Club<span class="club-tabs__count" id="club-tabs-count"></span></a>
        </nav>
      </div>
      <nav class="app-header__nav" id="header-nav" aria-label="Cambiar de vista">
        <div class="view-switch" role="group" aria-label="Vista">
          <a href="#/discover" class="view-switch__opt" data-world="club">${icon('phone', { size: 15 })}<span>Público</span></a>
          <a href="#/panel/resumen" class="view-switch__opt" data-world="panel">${icon('chart', { size: 15 })}<span>Negocio</span></a>
        </div>
        <button type="button" class="btn btn--sm btn--primary" id="btn-header-tour" aria-label="Recorrido guiado">
          ${icon('map', { size: 15 })}<span class="app-header__tour-label">Recorrido</span>
        </button>
        <a href="#/demo" class="app-header__icon-btn" id="btn-header-demo" aria-label="Control del presentador" title="Control del presentador">
          ${icon('sliders', { size: 17 })}
        </a>
      </nav>
    </header>

    <aside class="panel-sidebar" id="panel-sidebar">
      <!-- Contexto global: filtra todas las pantallas del negocio -->
      <div class="ctx-picker">
        <label class="ctx-picker__label" for="ctx-select">Viendo</label>
        <select id="ctx-select" class="form-select ctx-picker__select">
          <option value="all">Todo el grupo</option>
          ${VENUES.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
        </select>
      </div>
      <nav class="panel-sidebar__nav">
        <a href="#/panel/resumen" class="panel-sidebar__item" data-route="/panel/resumen">
          ${icon('chart', { size: 17 })}
          <span>Resumen</span>
        </a>
        <a href="#/panel/eventos" class="panel-sidebar__item" data-route="/panel/eventos">
          ${icon('calendar', { size: 17 })}
          <span>Eventos</span>
        </a>
        <a href="#/panel/origen" class="panel-sidebar__item" data-route="/panel/origen">
          ${icon('megaphone', { size: 17 })}
          <span>Origen</span>
        </a>
        <a href="#/panel/publico" class="panel-sidebar__item" data-route="/panel/publico" data-module="publico">
          ${icon('target', { size: 17 })}
          <span>Público</span>
        </a>
        <a href="#/panel/puerta" class="panel-sidebar__item" data-route="/panel/puerta" data-module="puerta">
          ${icon('ticket', { size: 17 })}
          <span>Puerta</span>
        </a>
      </nav>
    </aside>

    <main class="app-main" id="page-content"></main>

    <!-- Barra inferior de la app del público (móvil) -->
    <nav class="club-nav" id="club-nav" aria-label="App del público">
      <a href="#/discover" class="club-nav__item" data-route="/discover">
        ${icon('calendar', { size: 21 })}
        <span class="club-nav__label">Agenda</span>
      </a>
      <a href="#/myclub" class="club-nav__item" data-route="/myclub">
        ${icon('user', { size: 21 })}
        <span class="club-nav__label">Mi Club</span>
      </a>
    </nav>

    <div id="tour-dock-container"></div>
    <div class="toast-container" id="toast-container"></div>
  `;

  document.getElementById('ctx-select')?.addEventListener('change', (e) => setCurrentVenue(e.target.value));

  document.getElementById('btn-header-tour')?.addEventListener('click', () => {
    startTour();
    navigate('/discover');
  });
}

// Móvil: la cabecera se esconde al bajar y vuelve al subir, para ganar pantalla.
// Solo actúa por debajo de 720px; en escritorio la clase nunca se aplica.
function setupAutoHideHeader() {
  const mq = window.matchMedia('(max-width: 720px)');
  let lastY = window.scrollY;
  let ticking = false;

  function update() {
    ticking = false;
    const y = window.scrollY;
    const delta = y - lastY;
    if (!mq.matches || y < 80) {
      document.body.classList.remove('header-hidden');
    } else if (delta > 6) {
      document.body.classList.add('header-hidden');
    } else if (delta < -6) {
      document.body.classList.remove('header-hidden');
    }
    if (Math.abs(delta) > 6 || y < 80) lastY = y;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  // Al cambiar de pantalla, la cabecera siempre vuelve a verse
  window.addEventListener('hashchange', () => {
    document.body.classList.remove('header-hidden');
    lastY = 0;
  });
}

// Texto de la franja de vista según la ruta y el local activo
function renderViewBar() {
  const hash = window.location.hash.slice(1) || '/discover';
  const isDemo = hash.startsWith('/demo');
  const isPanel = hash.startsWith('/panel') || isDemo;
  const { currentVenueId: ctx, hiddenModules = [] } = getState();
  const ctxVenue = VENUES.find(v => v.id === ctx);

  let who;
  if (isDemo) {
    who = `${icon('sliders', { size: 13 })}<strong>Vista presentador</strong><span>Solo tú ves esta pantalla</span>`;
  } else if (isPanel) {
    const scope = ctxVenue ? `${ctxVenue.name} · Encargado: ${ctxVenue.manager}` : 'Todo el grupo · Dirección';
    who = `${icon('chart', { size: 13 })}<strong>Vista negocio</strong><span>${scope}</span>`;
  } else {
    who = `${icon('phone', { size: 13 })}<strong>Vista público</strong><span>Así lo ve un cliente en su teléfono</span>`;
  }

  const ctxSelect = document.getElementById('ctx-select');
  if (ctxSelect && ctxSelect.value !== ctx) ctxSelect.value = ctx;

  // Módulos ocultos por el presentador
  document.querySelectorAll('.panel-sidebar__item[data-module]').forEach(item => {
    item.hidden = hiddenModules.includes(item.dataset.module);
  });

  const whoEl = document.getElementById('view-bar-who');
  if (whoEl) whoEl.innerHTML = who;

  const subtitle = document.getElementById('app-header-subtitle');
  if (subtitle) subtitle.textContent = isDemo ? 'Presentador' : isPanel ? 'Panel de negocio' : 'Club';

  document.querySelectorAll('.view-switch__opt').forEach(opt => {
    // En la pantalla del presentador no se marca ningún mundo
    const active = !isDemo && (opt.dataset.world === 'panel') === isPanel;
    opt.classList.toggle('view-switch__opt--active', active);
    opt.setAttribute('aria-current', active ? 'page' : 'false');
  });
  document.getElementById('btn-header-demo')?.classList.toggle('app-header__icon-btn--active', isDemo);

  // Pestañas de escritorio: la ficha de un evento cuenta como Agenda
  const tab = hash.startsWith('/myclub') ? 'myclub' : (hash.startsWith('/discover') || hash.startsWith('/event/')) ? 'agenda' : null;
  document.querySelectorAll('.club-tabs__item').forEach(el => {
    const active = el.dataset.tab === tab;
    el.classList.toggle('club-tabs__item--active', active);
    el.setAttribute('aria-current', active ? 'page' : 'false');
  });
  const { members, currentMemberId } = getState();
  const savedCount = members.find(m => m.id === currentMemberId)?.savedEvents?.length || 0;
  const countEl = document.getElementById('club-tabs-count');
  if (countEl) countEl.textContent = savedCount ? String(savedCount) : '';

  // La ficha de un evento pertenece a la pestaña Agenda de la barra inferior
  if (hash.startsWith('/event/')) {
    document.querySelector('.club-nav__item[data-route="/discover"]')?.classList.add('club-nav__item--active');
  }
}

// Render Tour Dock
function renderTourDock(state) {
  const container = document.getElementById('tour-dock-container');
  if (!container) return;

  const { tourStep } = state;
  const STEPS = activeSteps();
  if (tourStep < 0 || tourStep >= STEPS.length) {
    container.innerHTML = '';
    return;
  }

  const current = STEPS[tourStep];
  const isFirst = tourStep === 0;
  const isLast = tourStep === STEPS.length - 1;

  container.innerHTML = `
    <div class="tour-dock animate-slide-up" id="guided-tour-dock">
      <div class="tour-dock__header">
        <div class="tour-dock__step-badge">
          <span>Recorrido</span>
          <strong>${tourStep + 1} / ${STEPS.length}</strong>
        </div>
        <button type="button" class="tour-dock__close-btn" id="tour-btn-close" aria-label="Cerrar recorrido">${icon('x', { size: 18 })}</button>
      </div>

      <div class="tour-dock__progress-bar">
        ${STEPS.map((s, idx) => `
          <div 
            class="tour-dock__progress-dot ${idx === tourStep ? 'tour-dock__progress-dot--active' : idx < tourStep ? 'tour-dock__progress-dot--passed' : ''}"
            data-step="${idx}"
            title="${s.title}"
          ></div>
        `).join('')}
      </div>

      <div class="tour-dock__body">
        <h4 class="tour-dock__title">${current.title}</h4>
        <p class="tour-dock__desc">${current.desc}</p>
        <details class="tour-dock__script">
          <summary>${icon('message', { size: 14 })} Guion para el cliente</summary>
          <p>“${current.phrase}”</p>
        </details>
      </div>

      <div class="tour-dock__footer">
        <div class="tour-dock__alternatives">
          <span>Ver:</span>
          <button type="button" class="tour-dock__alt-btn" data-alt-venue="all">Grupo</button>
          ${VENUES.map(v => `<button type="button" class="tour-dock__alt-btn" data-alt-venue="${v.id}">${v.icon} ${v.shortName}</button>`).join('')}
        </div>

        <div class="tour-dock__controls">
          ${!isFirst ? `
            <button type="button" class="btn btn--secondary btn--sm" id="tour-btn-prev">
              ${icon('left', { size: 15 })} Anterior
            </button>
          ` : ''}
          <button type="button" class="btn btn--primary btn--sm" id="tour-btn-next">
            ${isLast ? 'Finalizar' : `Siguiente ${icon('right', { size: 15 })}`}
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners to tour controls
  const closeBtn = document.getElementById('tour-btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      endTour();
    });
  }

  const prevBtn = document.getElementById('tour-btn-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const prevIdx = tourStep - 1;
      if (prevIdx >= 0) {
        prevTourStep();
        if (STEPS[prevIdx].venueId) {
          setCurrentVenue(STEPS[prevIdx].venueId);
        }
        navigate(STEPS[prevIdx].route);
      }
    });
  }

  const nextBtn = document.getElementById('tour-btn-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (isLast) {
        endTour();
        navigate('/panel/resumen');
      } else {
        const nextIdx = tourStep + 1;
        nextTourStep(STEPS.length);
        if (STEPS[nextIdx].venueId) {
          setCurrentVenue(STEPS[nextIdx].venueId);
        }
        navigate(STEPS[nextIdx].route);
      }
    });
  }

  // Progress dots click to jump
  container.querySelectorAll('.tour-dock__progress-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const stepIdx = parseInt(e.currentTarget.dataset.step, 10);
      setTourStep(stepIdx, STEPS.length);
      if (STEPS[stepIdx].venueId) {
        setCurrentVenue(STEPS[stepIdx].venueId);
      }
      navigate(STEPS[stepIdx].route);
    });
  });

  // Alternative venue buttons click
  container.querySelectorAll('[data-alt-venue]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const vId = e.currentTarget.dataset.altVenue;
      setCurrentVenue(vId);
      if (!window.location.hash.startsWith('#/panel')) navigate('/panel/resumen');
    });
  });
}

// Toast notifications
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast animate-slide-up';
  toast.innerHTML = `
    <span class="toast__icon">${icon('check', { size: 16 })}</span>
    <span class="toast__message">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast--exit');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Avisos: se sigue la última notificación vista (el store guarda solo 20, así que
// contar no sirve) y las ráfagas, como "Simular fin de semana", salen en un solo aviso.
let lastSeenNotificationId = null;
let toastFlushPending = false;
let lastTourStep = -1;

function flushToasts() {
  toastFlushPending = false;
  const { notifications } = getState();
  if (!notifications.length) {
    lastSeenNotificationId = null;
    return;
  }
  const seenIdx = notifications.findIndex(n => n.id === lastSeenNotificationId);
  const fresh = seenIdx === -1 ? notifications.length : seenIdx;
  lastSeenNotificationId = notifications[0].id;
  if (fresh === 0) return;
  showToast(notifications[0].message);
  // No más de tres avisos a la vez
  const container = document.getElementById('toast-container');
  while (container && container.children.length > 3) container.firstElementChild.remove();
}

subscribe((state) => {
  if (!toastFlushPending && state.notifications[0]?.id !== lastSeenNotificationId) {
    toastFlushPending = true;
    setTimeout(flushToasts, 0);
  }

  renderViewBar();

  if (state.tourStep !== lastTourStep) {
    renderTourDock(state);
    lastTourStep = state.tourStep;
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  buildAppShell();
  lastSeenNotificationId = getState().notifications[0]?.id ?? null;
  startRouter(document.getElementById('page-content'));
  window.addEventListener('hashchange', renderViewBar);
  setupAutoHideHeader();
  renderViewBar();
  renderTourDock(getState());
});
