// Operium Club — Main Bootstrap
import { route, startRouter, navigate, getCurrentRoute } from './router.js';
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
import Promoters from './pages/panel/Promoters.js';
import Marketing from './pages/panel/Marketing.js';
import VenueToday from './pages/panel/VenueToday.js';
import Events from './pages/panel/Events.js';
import Group from './pages/panel/Group.js';
import DemoControl from './pages/demo/DemoControl.js';

// Import styles
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/club.css';
import './styles/panel.css';
import './styles/animations.css';

// Register routes
route('/discover', Discover);
route('/event/:id', (params) => EventDetail(params));
route('/myclub', MyClub);
route('/panel/venue', VenueToday);
route('/panel/events', Events);
route('/panel/promoters', Promoters);
route('/panel/marketing', Marketing);
route('/panel/group', Group);
route('/demo', DemoControl);

// Tour Steps Definitions (Sec 02 & 08 del encargo Operium)
const TOUR_STEPS = [
  {
    step: 0,
    number: '1 de 6',
    title: 'Paso 1: Descubrir (Club)',
    route: '/discover',
    venueId: 'mood',
    desc: 'Explora la oferta de los 4 locales (Señor Perú, Mood, Adriá y Play). Prueba guardar "Mood Sessions: Deep House". Se añade al perfil sin incrementar asistencia física ni ventas.',
    phrase: 'APERTURA: "No venimos a reemplazar su facturación ni su control de entradas. Queremos mostrar cómo podrían conectar público, promotores y marketing con decisiones útiles para sus locales."',
    targetAction: 'Guarda el evento de Mood pulsando el corazón ❤️ en la agenda.',
  },
  {
    step: 1,
    number: '2 de 6',
    title: 'Paso 2: Origen (Promotores)',
    route: '/panel/promoters',
    venueId: 'mood',
    desc: 'Ricardo V. (promotor asignado a Mood) comparte su enlace único. Al pulsar "Simular visita desde enlace" se genera una señal de atribución verificable sin liquidar comisiones comerciales.',
    phrase: 'ATRIBUCIÓN: "Cada promotor tiene su source_id. Medimos la respuesta previa de captación sin duplicar comisiones."',
    targetAction: 'Pulsa "Simular visita desde enlace" en la tarjeta de Ricardo V.',
  },
  {
    step: 2,
    number: '3 de 6',
    title: 'Paso 3: Marketing (Tu Público)',
    route: '/panel/marketing',
    venueId: 'mood',
    desc: 'Marketing analiza el segmento "recurrente" (25 miembros) y prepara una invitación contextual. El motor aplica filtros estrictos de consentimiento por canal y local (DS 016-2024-JUS).',
    phrase: 'PRIVACIDAD: "Verificamos canal y autorización para el local específico. Nadie recibe invitaciones sin consentimiento previo."',
    targetAction: 'Revisa los excluidos por motivo legal y haz clic en "⚡ Envío simulado DEMO".',
  },
  {
    step: 3,
    number: '4 de 6',
    title: 'Paso 4: Operación (Check-in en Puerta)',
    route: '/panel/venue',
    venueId: 'mood',
    desc: 'Simula el ingreso en puerta para Valentina R. El check-in es idempotente: un segundo intento para el mismo evento es bloqueado inmediatamente sin alterar el aforo ni duplicar cifras.',
    phrase: 'IDEMPOTENCIA: "Aquí no estamos diciendo que un guardado sea una venta. Primero vemos interés; después, asistencia validada una sola vez."',
    targetAction: 'Registra el check-in en puerta y luego intenta registrar al mismo miembro otra vez.',
  },
  {
    step: 4,
    number: '5 de 6',
    title: 'Paso 5: Decisión (Mood: Hoy)',
    route: '/panel/venue',
    venueId: 'mood',
    desc: 'Mood examina sus métricas en vivo: guardados vs. asistencias. La métrica de ventas muestra honestamente "Ventas no disponibles" porque nunca se inventan ingresos sin transacción enlazada.',
    phrase: 'TRANSPARENCIA: "Una venta solo se mostrará cuando podamos enlazarla a una fuente confiable de POS o caja. Nunca por inferencia."',
    targetAction: 'Examina la barra de ratio guardados vs asistencias y el panel de ventas no disponibles.',
  },
  {
    step: 5,
    number: '6 de 6',
    title: 'Paso 6: Grupo (Resumen de Conan)',
    route: '/panel/group',
    venueId: null,
    desc: 'Conan y la dirección abren la comparativa consolidada de los 4 locales (Señor Perú, Mood, Adriá y Play). Silos de privacidad: métricas consolidadas sin cruzar datos personales.',
    phrase: 'CIERRE: "¿Qué parte de esta experiencia ya resuelve su sistema, qué parte les falta y cuál valdría la pena comprobar en un piloto pequeño?"',
    targetAction: 'Revisa las 4 marcas lado a lado y usa los botones de abajo para explorar Play, Señor Perú o Adriá.',
  },
];

// Build app shell
function buildAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Demo Banner -->
    <div class="demo-banner" id="demo-banner">
      <div class="demo-banner__content">
        <span class="demo-banner__icon">⚠️</span>
        <span class="demo-banner__text">DATOS FICTICIOS — DEMO</span>
        <span class="demo-banner__subtitle">Todos los datos son simulados para demostración</span>
      </div>
      <div class="demo-banner__actions">
        <button type="button" class="btn btn--sm btn--accent" id="btn-banner-tour">
          🗺️ Ver recorrido (P0)
        </button>
      </div>
    </div>

    <!-- Header -->
    <header class="app-header" id="app-header">
      <div class="app-header__left">
        <a href="#/discover" class="app-header__logo">
          <span class="app-header__logo-mark">◆</span>
          <span class="app-header__logo-text">OPERIUM</span>
        </a>
        <span class="app-header__divider">|</span>
        <span class="app-header__subtitle">Club de Entretenimiento</span>
      </div>
      <nav class="app-header__nav" id="header-nav">
        <a href="#/discover" class="app-header__link" data-route="/discover">Club</a>
        <a href="#/panel/venue" class="app-header__link" data-route="/panel">Panel</a>
        <a href="#/demo" class="app-header__link app-header__link--accent" data-route="/demo">Demo</a>
        <button type="button" class="btn btn--xs btn--outline" id="btn-header-tour" style="margin-left: 8px;">
          🗺️ Recorrido Guiado
        </button>
      </nav>
    </header>

    <!-- Panel Sidebar (visible only in panel mode) -->
    <aside class="panel-sidebar" id="panel-sidebar">
      <div class="panel-sidebar__header">
        <span class="panel-sidebar__title">Panel</span>
      </div>
      <nav class="panel-sidebar__nav">
        <a href="#/panel/venue" class="panel-sidebar__item" data-route="/panel/venue">
          <span class="panel-sidebar__icon">📍</span>
          <span>Local: Hoy</span>
        </a>
        <a href="#/panel/events" class="panel-sidebar__item" data-route="/panel/events">
          <span class="panel-sidebar__icon">📅</span>
          <span>Eventos</span>
        </a>
        <a href="#/panel/promoters" class="panel-sidebar__item" data-route="/panel/promoters">
          <span class="panel-sidebar__icon">📣</span>
          <span>Promotores</span>
        </a>
        <a href="#/panel/marketing" class="panel-sidebar__item" data-route="/panel/marketing">
          <span class="panel-sidebar__icon">🎯</span>
          <span>Marketing</span>
        </a>
        <a href="#/panel/group" class="panel-sidebar__item" data-route="/panel/group">
          <span class="panel-sidebar__icon">📊</span>
          <span>Grupo</span>
        </a>
        <div class="panel-sidebar__divider"></div>
        <a href="#/demo" class="panel-sidebar__item" data-route="/demo">
          <span class="panel-sidebar__icon">⚙️</span>
          <span>Control Demo</span>
        </a>
        <a href="#/discover" class="panel-sidebar__item">
          <span class="panel-sidebar__icon">🌐</span>
          <span>Ver Club</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="app-main" id="page-content">
      <!-- Pages render here -->
    </main>

    <!-- Club Bottom Nav (visible only in club mode) -->
    <nav class="club-nav" id="club-nav">
      <a href="#/discover" class="club-nav__item" data-route="/discover">
        <span class="club-nav__icon">🔍</span>
        <span class="club-nav__label">Descubrir</span>
      </a>
      <a href="#/myclub" class="club-nav__item" data-route="/myclub">
        <span class="club-nav__icon">⭐</span>
        <span class="club-nav__label">Mi Club</span>
      </a>
      <a href="#/panel/venue" class="club-nav__item" data-route="/panel">
        <span class="club-nav__icon">📊</span>
        <span class="club-nav__label">Panel</span>
      </a>
      <a href="#/demo" class="club-nav__item" data-route="/demo">
        <span class="club-nav__icon">⚙️</span>
        <span class="club-nav__label">Demo</span>
      </a>
    </nav>

    <!-- Guided Tour Dock (appears when tourStep >= 0) -->
    <div id="tour-dock-container"></div>

    <!-- Toast Container -->
    <div class="toast-container" id="toast-container"></div>
  `;

  // Attach header & banner tour triggers
  const bannerTourBtn = document.getElementById('btn-banner-tour');
  if (bannerTourBtn) {
    bannerTourBtn.addEventListener('click', () => {
      startTour();
      navigate('/discover');
    });
  }

  const headerTourBtn = document.getElementById('btn-header-tour');
  if (headerTourBtn) {
    headerTourBtn.addEventListener('click', () => {
      startTour();
      navigate('/discover');
    });
  }
}

// Render Tour Dock
function renderTourDock(state) {
  const container = document.getElementById('tour-dock-container');
  if (!container) return;

  const { tourStep } = state;
  if (tourStep < 0 || tourStep >= TOUR_STEPS.length) {
    container.innerHTML = '';
    return;
  }

  const current = TOUR_STEPS[tourStep];
  const isFirst = tourStep === 0;
  const isLast = tourStep === TOUR_STEPS.length - 1;

  container.innerHTML = `
    <div class="tour-dock animate-slide-up" id="guided-tour-dock">
      <div class="tour-dock__header">
        <div class="tour-dock__step-badge">
          <span>🗺️ RECORRIDO P0</span>
          <span>•</span>
          <span>PASO ${current.number}</span>
        </div>
        <button type="button" class="tour-dock__close-btn" id="tour-btn-close" title="Cerrar recorrido">✕</button>
      </div>

      <div class="tour-dock__progress-bar">
        ${TOUR_STEPS.map((s, idx) => `
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
        <div class="tour-dock__phrase">
          <span>💬</span>
          <span>${current.phrase}</span>
        </div>
      </div>

      <div class="tour-dock__footer">
        <div class="tour-dock__alternatives">
          <span>Explorar local:</span>
          <button type="button" class="tour-dock__alt-btn" data-alt-venue="mood">🌙 Mood</button>
          <button type="button" class="tour-dock__alt-btn" data-alt-venue="senor-peru">🇵🇪 S. Perú</button>
          <button type="button" class="tour-dock__alt-btn" data-alt-venue="adria">🌊 Adriá</button>
          <button type="button" class="tour-dock__alt-btn" data-alt-venue="play">⚡ Play</button>
        </div>

        <div class="tour-dock__controls">
          ${!isFirst ? `
            <button type="button" class="btn btn--secondary btn--sm" id="tour-btn-prev">
              ← Anterior
            </button>
          ` : ''}
          <button type="button" class="btn btn--accent btn--sm" id="tour-btn-next">
            ${isLast ? '✓ Finalizar Recorrido' : 'Siguiente Paso →'}
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
        if (TOUR_STEPS[prevIdx].venueId) {
          setCurrentVenue(TOUR_STEPS[prevIdx].venueId);
        }
        navigate(TOUR_STEPS[prevIdx].route);
      }
    });
  }

  const nextBtn = document.getElementById('tour-btn-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (isLast) {
        endTour();
        navigate('/panel/group');
      } else {
        const nextIdx = tourStep + 1;
        nextTourStep();
        if (TOUR_STEPS[nextIdx].venueId) {
          setCurrentVenue(TOUR_STEPS[nextIdx].venueId);
        }
        navigate(TOUR_STEPS[nextIdx].route);
      }
    });
  }

  // Progress dots click to jump
  container.querySelectorAll('.tour-dock__progress-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const stepIdx = parseInt(e.currentTarget.dataset.step, 10);
      setTourStep(stepIdx);
      if (TOUR_STEPS[stepIdx].venueId) {
        setCurrentVenue(TOUR_STEPS[stepIdx].venueId);
      }
      navigate(TOUR_STEPS[stepIdx].route);
    });
  });

  // Alternative venue buttons click
  container.querySelectorAll('[data-alt-venue]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const vId = e.currentTarget.dataset.altVenue;
      setCurrentVenue(vId);
      navigate('/panel/venue');
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
    <span class="toast__icon">✓</span>
    <span class="toast__message">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast--exit');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Watch for notifications and tour changes
let lastNotificationCount = 0;
let lastTourStep = -1;

subscribe((state) => {
  if (state.notifications.length > lastNotificationCount) {
    const newest = state.notifications[0];
    if (newest) showToast(newest.message);
  }
  lastNotificationCount = state.notifications.length;

  if (state.tourStep !== lastTourStep) {
    renderTourDock(state);
    lastTourStep = state.tourStep;
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  buildAppShell();
  startRouter(document.getElementById('page-content'));
  renderTourDock(getState());
});
