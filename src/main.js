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
import Promoters from './pages/panel/Promoters.js';
import Clients from './pages/panel/Clients.js';
import Marketing from './pages/panel/Marketing.js';
import Door from './pages/panel/Door.js';
import DemoControl from './pages/demo/DemoControl.js';
import { VENUES } from './data/venues.js';
import { simReceipt, simPromoterVisit, simFriday, hasLastVisit, fridayDone } from './sim.js';

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
route('/panel/promotores', Promoters);
route('/panel/clientes', Clients);
route('/panel/campanas', Marketing);
route('/panel/puerta', Door);
route('/demo', DemoControl);

// Rutas de la versión anterior del panel
alias('/panel/venue', '/panel/resumen');
alias('/panel/group', '/panel/resumen');
alias('/panel/promoters', '/panel/promotores');
alias('/panel/origen', '/panel/promotores');
alias('/panel/marketing', '/panel/campanas');
alias('/panel/publico', '/panel/campanas');
alias('/panel/events', '/panel/eventos');

// Recorrido guiado. En pantalla solo la acción a realizar; la frase para el
// cliente queda plegada como guion del presentador. Los pasos con `module`
// desaparecen si el presentador oculta ese módulo.
const TOUR_STEPS = [
  {
    title: 'Descubrir',
    route: '/discover',
    venueId: null,
    desc: 'Pulsa “Guardar” en “Viernes de Mood” y abre su ficha: el pase del miembro ya tiene su QR.',
    phrase: 'No venimos a reemplazar su caja ni su facturación. Queremos conectar público, promotores y consumo con decisiones útiles para sus locales.',
  },
  {
    title: 'Puerta',
    route: '/panel/puerta',
    venueId: 'mood',
    module: 'puerta',
    desc: 'Pulsa “Escanear”: entra quien guardó el evento. Después “Volver a escanear el mismo pase”: se rechaza.',
    phrase: 'Como en el cine: un QR por persona y noche. Cada ingreso queda validado una sola vez y con nombre propio.',
  },
  {
    title: 'Clientes',
    route: '/panel/clientes',
    venueId: 'mood',
    module: 'clientes',
    desc: 'Abre “Simular” (arriba) → “Boleta de un cliente con puntos”: la boleta con DNI de quien entró suma sus puntos. Prueba también la de un cliente sin puntos.',
    phrase: 'Solo leemos las boletas que ya emite su caja. Si el cliente lo autorizó, su consumo suma puntos que puede usar en cualquiera de sus cuatro locales.',
  },
  {
    title: 'Mi Club',
    route: '/myclub',
    venueId: null,
    module: 'clientes',
    desc: 'Así lo ve el cliente: sus puntos, lo que le falta para la siguiente recompensa y el canje desde el teléfono.',
    phrase: 'El cliente tiene un motivo para volver, y para volver a cualquiera de sus marcas, no solo a una.',
  },
  {
    title: 'Promotores',
    route: '/panel/promotores',
    venueId: 'mood',
    desc: 'Ricardo V. suma puntos por su referido: por entrar con su QR y por lo que consumió con su DNI.',
    phrase: 'Premiamos al promotor que trae gente que entra y consume, no al que reparte más enlaces. Sin QR no hay puntos.',
  },
  {
    title: 'Campañas',
    route: '/panel/campanas',
    venueId: 'mood',
    module: 'campanas',
    desc: 'Mira cuántos recurrentes quedan fuera por falta de permiso y pulsa “Envío simulado”.',
    phrase: 'Verificamos canal y autorización para cada local. Nadie recibe invitaciones sin consentimiento previo.',
  },
  {
    title: 'Resumen',
    route: '/panel/resumen',
    venueId: 'all',
    desc: 'Las cuatro marcas en una sola vista, de lo general al detalle, sin cruzar datos personales.',
    phrase: '¿Qué parte de esta experiencia ya resuelve su sistema, qué parte les falta y cuál valdría la pena comprobar en un piloto pequeño?',
  },
];

// Secciones del negocio (barra lateral en escritorio, barra inferior en móvil)
const PANEL_NAV = [
  { route: '/panel/resumen', label: 'Resumen', icon: 'chart' },
  { route: '/panel/eventos', label: 'Eventos', icon: 'calendar' },
  { route: '/panel/puerta', label: 'Puerta', icon: 'ticket', module: 'puerta' },
  { route: '/panel/clientes', label: 'Clientes', icon: 'gift', module: 'clientes' },
  { route: '/panel/promotores', label: 'Promotores', icon: 'megaphone' },
  { route: '/panel/campanas', label: 'Campañas', icon: 'target', module: 'campanas' },
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
        <div class="sim-menu" id="sim-menu" hidden>
          <button type="button" class="app-header__sim" id="btn-header-sim" title="Simular" aria-haspopup="true" aria-expanded="false" aria-controls="sim-menu-panel">
            ${icon('zap', { size: 15 })}<span>Simular</span>
          </button>
          <div class="sim-menu__panel" id="sim-menu-panel" hidden></div>
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
        <a href="#/panel/puerta" class="panel-sidebar__item" data-route="/panel/puerta" data-module="puerta">
          ${icon('ticket', { size: 17 })}
          <span>Puerta</span>
        </a>
        <a href="#/panel/clientes" class="panel-sidebar__item" data-route="/panel/clientes" data-module="clientes">
          ${icon('gift', { size: 17 })}
          <span>Clientes</span>
        </a>
        <a href="#/panel/promotores" class="panel-sidebar__item" data-route="/panel/promotores">
          ${icon('megaphone', { size: 17 })}
          <span>Promotores</span>
        </a>
        <a href="#/panel/campanas" class="panel-sidebar__item" data-route="/panel/campanas" data-module="campanas">
          ${icon('target', { size: 17 })}
          <span>Campañas</span>
        </a>
      </nav>
    </aside>

    <main class="app-main" id="page-content"></main>

    <!-- Barra inferior del negocio (móvil) -->
    <nav class="panel-tabbar" id="panel-tabbar" aria-label="Secciones del negocio"></nav>
    <div class="panel-more" id="panel-more" hidden></div>

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

  setupSimMenu();
  setupPanelTabbar();
}

// — Menú "Simular": todo lo que en producción llegaría de fuera —
let simResult = null;

function renderSimMenu() {
  const panel = document.getElementById('sim-menu-panel');
  if (!panel) return;
  const { currentVenueId: ctx } = getState();
  const where = VENUES.find(v => v.id === ctx)?.name || 'todo el grupo';
  const item = (action, label, hint, disabled = false) => `
    <button type="button" class="sim-menu__item" data-sim-action="${action}" ${disabled ? 'disabled' : ''}>
      <strong>${label}</strong><small>${hint}</small>
    </button>`;
  panel.innerHTML = `
    <p class="sim-menu__head">Simulaciones de la demo · ${where}</p>
    <div class="sim-menu__group">
      <span class="sim-menu__label">Caja</span>
      ${item('receipt', 'Boleta de un cliente con puntos', 'Llega con DNI y suma puntos')}
      ${item('receipt-off', 'Boleta de un cliente sin puntos', 'No se vincula a nadie')}
    </div>
    <div class="sim-menu__group">
      <span class="sim-menu__label">Promotores</span>
      ${item('visit', 'Visita a un enlace', 'Alguien abre el enlace de un promotor')}
      ${item('visit-repeat', 'Repetir la última visita', 'No se atribuye dos veces', !hasLastVisit())}
    </div>
    <div class="sim-menu__group">
      <span class="sim-menu__label">Noche</span>
      ${item('friday', 'Cerrar la noche del viernes', fridayDone() ? 'Ya cerrada' : 'Asistencia, conversión y consumo', fridayDone())}
    </div>
    ${simResult ? `<p class="sim-menu__result sim-menu__result--${simResult.kind}" aria-live="polite">${simResult.text}</p>` : ''}
  `;
}

function setupSimMenu() {
  const wrap = document.getElementById('sim-menu');
  const btn = document.getElementById('btn-header-sim');
  const panel = document.getElementById('sim-menu-panel');
  if (!wrap || !btn || !panel) return;

  const setOpen = (open) => {
    if (open) { simResult = null; renderSimMenu(); }
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => setOpen(panel.hidden));
  // composedPath: el contenido del menú se redibuja al pulsar una acción y el
  // elemento pulsado ya no está en el documento cuando llega este evento
  document.addEventListener('click', (e) => { if (!e.composedPath().includes(wrap)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('hashchange', () => setOpen(false));

  panel.addEventListener('click', (e) => {
    const action = e.target.closest('[data-sim-action]')?.dataset.simAction;
    if (!action) return;
    simResult = {
      receipt: () => simReceipt(true),
      'receipt-off': () => simReceipt(false),
      visit: () => simPromoterVisit(false),
      'visit-repeat': () => simPromoterVisit(true),
      friday: () => simFriday(),
    }[action]();
    renderSimMenu();
  });
}

// — Barra inferior del negocio en móvil: cuatro secciones y "Más" —
function renderPanelTabbar() {
  const bar = document.getElementById('panel-tabbar');
  const more = document.getElementById('panel-more');
  if (!bar || !more) return;
  const hash = window.location.hash.slice(1);
  const hidden = getState().hiddenModules || [];
  const visible = PANEL_NAV.filter(n => !n.module || !hidden.includes(n.module));
  const primary = visible.length <= 5 ? visible : visible.slice(0, 4);
  const rest = visible.length <= 5 ? [] : visible.slice(4);
  const link = (n, cls) => `
    <a href="#${n.route}" class="${cls} ${hash.startsWith(n.route) ? `${cls}--active` : ''}" ${hash.startsWith(n.route) ? 'aria-current="page"' : ''}>
      ${icon(n.icon, { size: 20 })}<span>${n.label}</span>
    </a>`;
  bar.innerHTML = primary.map(n => link(n, 'panel-tabbar__item')).join('') + (rest.length ? `
    <button type="button" class="panel-tabbar__item ${rest.some(n => hash.startsWith(n.route)) ? 'panel-tabbar__item--active' : ''}" id="panel-more-btn" aria-expanded="${!more.hidden}" aria-controls="panel-more">
      ${icon('sliders', { size: 20 })}<span>Más</span>
    </button>` : '');
  more.innerHTML = rest.map(n => link(n, 'panel-more__item')).join('');
}

function setupPanelTabbar() {
  const more = document.getElementById('panel-more');
  document.getElementById('panel-tabbar')?.addEventListener('click', (e) => {
    if (!e.composedPath().some(el => el.id === 'panel-more-btn')) return;
    more.hidden = !more.hidden;
    renderPanelTabbar();
  });
  document.addEventListener('click', (e) => {
    const path = e.composedPath();
    if (more && !more.hidden && !path.includes(more) && !path.some(el => el.id === 'panel-more-btn')) {
      more.hidden = true;
      renderPanelTabbar();
    }
  });
  window.addEventListener('hashchange', () => { if (more) more.hidden = true; });
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

  const simWrap = document.getElementById('sim-menu');
  if (simWrap) simWrap.hidden = !isPanel || isDemo;
  if (!document.getElementById('sim-menu-panel')?.hidden) renderSimMenu();
  renderPanelTabbar();

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
  // En el negocio, un solo aviso breve; en el público, hasta tres
  const panel = document.body.classList.contains('mode-panel');
  if (panel) container.innerHTML = '';

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
  }, panel ? 2400 : 3200);
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
  // Con el menú Simular abierto, el resultado ya se ve en el propio menú
  if (document.getElementById('sim-menu-panel')?.hidden === false) return;
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
