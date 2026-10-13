// Operium Club — Pantalla G: Panel de Control de Demostración
// Selector de persona/rol/local/miembro, "Simular fin de semana", "Reiniciar demo",
// "Ver recorrido", "Cómo funciona" (acordeón), Resumen del estado y Log de notificaciones.

import { 
  getState, 
  subscribe, 
  setRole, 
  setCurrentVenue, 
  setCurrentMember, 
  simulateWeekend, 
  resetDemo, 
  startTour 
} from '../../store.js';
import { VENUES } from '../../data/venues.js';
import { navigate } from '../../router.js';

export default function DemoControl() {
  function render() {
    const state = getState();
    const { 
      currentRole, 
      currentVenueId, 
      currentMemberId, 
      members, 
      events, 
      promoters, 
      campaigns, 
      notifications 
    } = state;

    const currentMember = members.find(m => m.id === currentMemberId) || members[0];
    const currentVenue = VENUES.find(v => v.id === currentVenueId) || VENUES[1];

    // Cálculos del estado actual
    const totalSaved = events.reduce((sum, e) => sum + (e.savedCount || 0), 0);
    const totalCheckins = events.reduce((sum, e) => sum + (e.checkinCount || 0), 0);
    const totalSignals = promoters.reduce((sum, p) => sum + (p.signals?.length || 0), 0);
    const sentCampaigns = campaigns.filter(c => c.status === 'sent' || c.status === 'completed').length;

    // Roles disponibles con metadatos
    const ROLES = [
      { id: 'publico', name: 'Público / Miembro', persona: 'Camila A. (Miembro)', route: '/discover', desc: 'Descubrir eventos, guardar en Mi Club, seguir locales y consultar beneficios.' },
      { id: 'promotor', name: 'Promotor de Eventos', persona: 'Ricardo V. (Mood)', route: '/panel/promoters', desc: 'Compartir enlace de origen, monitorear señales y atribución sin liquidar comisiones.' },
      { id: 'marketing', name: 'Marketing & Audiencias', persona: 'Equipo Central', route: '/panel/marketing', desc: 'Segmentar base, verificar consentimientos (DS 016-2024-JUS) y simular envíos.' },
      { id: 'ventas', name: 'Ventas / Puerta', persona: 'Personal de Recepción', route: '/panel/venue', desc: 'Validar check-in físico en acceso. Idempotente: un ingreso por persona.' },
      { id: 'encargado', name: 'Encargado de Local', persona: `${currentVenue.manager} (${currentVenue.name})`, route: '/panel/venue', desc: 'Lectura de interés vs aforo real, control operativo de su establecimiento.' },
      { id: 'grupo', name: 'Dirección de Grupo / Conan', persona: 'Conan (Administrador)', route: '/panel/group', desc: 'Comparativa de las 4 marcas y métricas agregadas sin cruce de datos privados.' },
    ];

    const activeRoleData = ROLES.find(r => r.id === currentRole) || ROLES[0];

    return `
      <div class="panel-page demo-control-page">
        <!-- Encabezado de Página -->
        <header class="panel-page__header">
          <div class="panel-page__title-group">
            <div class="panel-page__badge-row">
              <span class="badge badge--gold">Pantalla G — Control Maestro</span>
              <span class="badge badge--outline">Entorno de Simulación</span>
              <span class="badge badge--warning">DATOS FICTICIOS — DEMO</span>
            </div>
            <h1 class="panel-page__title">Control de Demostración</h1>
            <p class="panel-page__subtitle">
              Configura el contexto activo de la reunión privada, conmuta de perspectiva entre actores del negocio, simula la actividad de un fin de semana completo o restablece el estado de prueba.
            </p>
          </div>
        </header>

        <!-- BANNER DE DATOS FICTICIOS PERSISTENTE -->
        <div class="demo-banner-strip">
          <div class="demo-banner-strip__inner">
            <span class="demo-banner-strip__icon">⚠️</span>
            <div class="demo-banner-strip__text">
              <strong>DATOS FICTICIOS — DEMOSTRACIÓN AUTÓNOMA OPERIUM:</strong>
              Todos los miembros, eventos, señales y métricas son sintéticos. Ninguna acción compromete datos reales de clientes ni genera cobros comerciales.
            </div>
          </div>
        </div>

        <!-- CONTENEDOR DE FEEDBACK DINÁMICO -->
        <div id="demo-feedback-container" class="demo-feedback-container"></div>

        <!-- SECCIÓN 1: Selectores de Contexto de Demostración -->
        <section class="demo-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Contexto Activo de la Sesión</h2>
              <p class="section-subtitle">Ajusta el rol y la identidad activa para evaluar la plataforma desde cada punto de vista.</p>
            </div>
          </div>

          <div class="card card--demo-context">
            <div class="card__body">
              <div class="demo-selectors-grid">
                <!-- Selector de Rol / Persona -->
                <div class="form-group">
                  <label class="form-label" for="demo-role-select">
                    🎭 Rol / Persona Activa:
                  </label>
                  <select id="demo-role-select" class="form-select form-select--highlight">
                    ${ROLES.map(r => `
                      <option value="${r.id}" ${r.id === currentRole ? 'selected' : ''}>
                        ${r.name} — ${r.persona}
                      </option>
                    `).join('')}
                  </select>
                  <div class="role-desc-preview" id="role-desc-preview">
                    <span>${activeRoleData.desc}</span>
                    <a href="#${activeRoleData.route}" class="role-jump-link">Ir a pantalla sugerida (${activeRoleData.route}) ➔</a>
                  </div>
                </div>

                <!-- Selector de Local Activo -->
                <div class="form-group">
                  <label class="form-label" for="demo-venue-select">
                    📍 Establecimiento en Foco:
                  </label>
                  <select id="demo-venue-select" class="form-select">
                    ${VENUES.map(v => `
                      <option value="${v.id}" ${v.id === currentVenueId ? 'selected' : ''}>
                        ${v.icon} ${v.name} (${v.category}) — Resp: ${v.manager}
                      </option>
                    `).join('')}
                  </select>
                  <span class="form-helper" style="color: ${currentVenue.accentColor}; font-weight: 500;">
                    Color de marca: <code>${currentVenue.accentColor}</code> • Encargado: ${currentVenue.manager}
                  </span>
                </div>

                <!-- Selector de Miembro Activo -->
                <div class="form-group">
                  <label class="form-label" for="demo-member-select">
                    👤 Miembro Activo en Club:
                  </label>
                  <select id="demo-member-select" class="form-select">
                    ${members.slice(0, 30).map(m => `
                      <option value="${m.id}" ${m.id === currentMemberId ? 'selected' : ''}>
                        ${m.name} (${m.id}) — [${m.segment}]
                      </option>
                    `).join('')}
                  </select>
                  <span class="form-helper">
                    ${currentMember.firstName} • Segmento: <strong>${currentMember.segment}</strong> • Guardados: ${currentMember.savedEvents?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 2: Grandes Acciones de Demostración -->
        <section class="demo-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Acciones Principales del Presentador</h2>
              <p class="section-subtitle">Ejecuta en un clic el flujo de demostración completo o restablece la semilla limpia.</p>
            </div>
          </div>

          <div class="demo-actions-grid">
            <!-- BOTÓN 1: Simular fin de semana -->
            <div class="action-card action-card--weekend">
              <div class="action-card__icon">🚀</div>
              <div class="action-card__info">
                <h3 class="action-card__title">Simular fin de semana completo</h3>
                <p class="action-card__desc">
                  Ejecuta en cadena: 10 eventos guardados por miembros en distintos locales, 3 señales captadas por promotores de Mood y Play, y 5 check-ins validados en puerta.
                </p>
              </div>
              <button type="button" class="btn btn--primary btn--lg btn-demo-action" id="btn-simulate-weekend">
                <span>⚡ Simular fin de semana</span>
              </button>
            </div>

            <!-- BOTÓN 2: Ver recorrido guiado -->
            <div class="action-card action-card--tour">
              <div class="action-card__icon">🗺️</div>
              <div class="action-card__info">
                <h3 class="action-card__title">Iniciar recorrido guiado</h3>
                <p class="action-card__desc">
                  Activa la secuencia paso a paso recomendada para la reunión: Descubrir ➔ Promotores ➔ Marketing ➔ Local Hoy ➔ Grupo.
                </p>
              </div>
              <button type="button" class="btn btn--accent btn--lg btn-demo-action" id="btn-start-tour">
                <span>🎯 Ver recorrido guiado</span>
              </button>
            </div>

            <!-- BOTÓN 3: Reiniciar demo -->
            <div class="action-card action-card--reset">
              <div class="action-card__icon">🔄</div>
              <div class="action-card__info">
                <h3 class="action-card__title">Reiniciar estado a valores iniciales</h3>
                <p class="action-card__desc">
                  Restaura toda la base de datos en memoria a la semilla original (SEED). Limpia check-ins y señales generadas durante la prueba.
                </p>
              </div>
              <button type="button" class="btn btn--outline btn--danger btn--lg btn-demo-action" id="btn-reset-demo">
                <span>↺ Reiniciar demo</span>
              </button>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 3: Resumen del Estado Actual del Sistema -->
        <section class="demo-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Resumen del Estado Actual en Memoria</h2>
              <p class="section-subtitle">Métricas vivas que alimentan todas las pantallas del club y paneles en tiempo real.</p>
            </div>
            <span class="badge badge--pill badge--live">Estado en Vivo</span>
          </div>

          <div class="metrics-grid metrics-grid--5">
            <div class="metric-card">
              <span class="metric-card__label">Eventos Guardados</span>
              <span class="metric-card__value text-gold" id="demo-stat-saved">${totalSaved}</span>
              <span class="metric-card__sub">En los 4 locales</span>
            </div>

            <div class="metric-card">
              <span class="metric-card__label">Check-ins en Puerta</span>
              <span class="metric-card__value text-success" id="demo-stat-checkins">${totalCheckins}</span>
              <span class="metric-card__sub">Asistencias validadas</span>
            </div>

            <div class="metric-card">
              <span class="metric-card__label">Señales de Promotores</span>
              <span class="metric-card__value" id="demo-stat-signals">${totalSignals}</span>
              <span class="metric-card__sub">Clics de atribución</span>
            </div>

            <div class="metric-card">
              <span class="metric-card__label">Campañas Enviadas</span>
              <span class="metric-card__value text-accent" id="demo-stat-campaigns">${sentCampaigns} / ${campaigns.length}</span>
              <span class="metric-card__sub">Con simulación activa</span>
            </div>

            <div class="metric-card">
              <span class="metric-card__label">Base de Miembros</span>
              <span class="metric-card__value">${members.length}</span>
              <span class="metric-card__sub">Perfiles ficticios</span>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 4: Cómo Funciona (Acordeón Explicativo) -->
        <section class="demo-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Cómo Funciona la Plataforma</h2>
              <p class="section-subtitle">Explicación detallada de cada pantalla, flujo de datos y reglas operativas de la demo.</p>
            </div>
          </div>

          <div class="accordion" id="demo-accordion">
            <!-- Pantalla A -->
            <div class="accordion-item">
              <button type="button" class="accordion-header" data-target="acc-body-a">
                <span class="accordion-header__title">
                  <span class="badge badge--gold">Pantalla A</span>
                  <strong>Club / Descubrir (Móvil & Desktop)</strong>
                </span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body" id="acc-body-a">
                <div class="accordion-content">
                  <p><strong>Propósito:</strong> Permitir que el público descubra las propuestas nocturnas de los 4 locales del consorcio (Señor Perú, Mood, Adriá y Play) para el fin de semana del 16 y 17 de octubre.</p>
                  <p><strong>Comportamiento clave:</strong> Cada establecimiento cuenta con identidad visual propia, fotografía de referencia y convocatorias destacadas. Al pulsar "Guardar", se incrementa el interés previo sin considerarlo automáticamente como asistencia confirmada ni venta.</p>
                  <p><strong>Regla de negocio:</strong> No requiere aplicación móvil instalada; funciona como WebApp ligera accesible por enlace directo.</p>
                </div>
              </div>
            </div>

            <!-- Pantalla B -->
            <div class="accordion-item">
              <button type="button" class="accordion-header" data-target="acc-body-b">
                <span class="accordion-header__title">
                  <span class="badge badge--gold">Pantalla B</span>
                  <strong>Evento & Mi Club</strong>
                </span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body" id="acc-body-b">
                <div class="accordion-content">
                  <p><strong>Propósito:</strong> Ficha detallada del evento con arte, información de horarios, ubicación y beneficio de cortesía.</p>
                  <p><strong>Comportamiento clave:</strong> Muestra un pase ilustrativo del club con código QR de demostración y condiciones de elegibilidad del beneficio (ej. "Pisco Sour de bienvenida", "2x1 en cóctel signature").</p>
                  <p><strong>Regla de negocio:</strong> El pase no se denomina "entrada" ni promete acceso si se alcanza el aforo máximo del establecimiento.</p>
                </div>
              </div>
            </div>

            <!-- Pantalla C -->
            <div class="accordion-item">
              <button type="button" class="accordion-header" data-target="acc-body-c">
                <span class="accordion-header__title">
                  <span class="badge badge--gold">Pantalla C</span>
                  <strong>Promotores (Atribución de Origen)</strong>
                </span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body" id="acc-body-c">
                <div class="accordion-content">
                  <p><strong>Propósito:</strong> Medir con precisión de qué enlaces y promotores proviene el interés del público.</p>
                  <p><strong>Comportamiento clave:</strong> Cada promotor (Ricardo V., Lucía T.) tiene un <code>source_id</code> único y un enlace copyable. El botón "Simular interacción" genera una señal verificable vinculada a un evento del local.</p>
                  <p><strong>Regla de negocio:</strong> No se atribuye el mismo evento dos veces al mismo usuario y no se simula liquidación de comisiones en esta fase.</p>
                </div>
              </div>
            </div>

            <!-- Pantalla D -->
            <div class="accordion-item">
              <button type="button" class="accordion-header" data-target="acc-body-d">
                <span class="accordion-header__title">
                  <span class="badge badge--gold">Pantalla D</span>
                  <strong>Marketing (Audiencias & Consentimiento)</strong>
                </span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body" id="acc-body-d">
                <div class="accordion-content">
                  <p><strong>Propósito:</strong> Segmentar la audiencia (nuevo, recurrente, inactivo) y preparar invitaciones personalizadas.</p>
                  <p><strong>Comportamiento clave:</strong> Verifica rigurosamente el consentimiento explícito de canal (email) y establecimiento antes de permitir cualquier envío simulado (DS 016-2024-JUS).</p>
                  <p><strong>Regla de negocio:</strong> Los perfiles sin opt-in son bloqueados y listados como excluidos transparentemente. El envío calcula tasas estimadas de apertura (65%), clics (35%) y guardados (15%).</p>
                </div>
              </div>
            </div>

            <!-- Pantalla E -->
            <div class="accordion-item">
              <button type="button" class="accordion-header" data-target="acc-body-e">
                <span class="accordion-header__title">
                  <span class="badge badge--gold">Pantalla E</span>
                  <strong>Local: Hoy + Eventos</strong>
                </span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body" id="acc-body-e">
                <div class="accordion-content">
                  <p><strong>Propósito:</strong> Tablero operativo del encargado (Valentina R., Carlos M., etc.) con selector de los 4 locales.</p>
                  <p><strong>Comportamiento clave:</strong> Separación categórica entre <em>Guardado (Interés)</em>, <em>Asistencia (Check-in en puerta)</em> y <em>Ventas (Transacciones)</em>. El check-in en puerta es estrictamente <strong>idempotente</strong>: un segundo intento para el mismo miembro avisa que ya fue validado y bloquea la duplicación.</p>
                  <p><strong>Regla de negocio:</strong> Muestra explícitamente "Ventas no disponibles" al no existir integración de caja/POS.</p>
                </div>
              </div>
            </div>

            <!-- Pantalla F -->
            <div class="accordion-item">
              <button type="button" class="accordion-header" data-target="acc-body-f">
                <span class="accordion-header__title">
                  <span class="badge badge--gold">Pantalla F</span>
                  <strong>Resumen del Grupo — Operium</strong>
                </span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body" id="acc-body-f">
                <div class="accordion-content">
                  <p><strong>Propósito:</strong> Vista para Conan y la directiva general con los 4 establecimientos en paralelo.</p>
                  <p><strong>Comportamiento clave:</strong> Comparación de métricas de desempeño, calendario simultáneo del 16-17 de octubre, tasas de conversión (check-in / guardado) y aforo combinado de 750 personas.</p>
                  <p><strong>Regla de negocio:</strong> Silos de privacidad: ningún local ni usuario puede ver fichas personales de clientes de otra marca.</p>
                </div>
              </div>
            </div>

            <!-- Pantalla G -->
            <div class="accordion-item">
              <button type="button" class="accordion-header" data-target="acc-body-g">
                <span class="accordion-header__title">
                  <span class="badge badge--gold">Pantalla G</span>
                  <strong>Control de Demostración (Esta Pantalla)</strong>
                </span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body" id="acc-body-g">
                <div class="accordion-content">
                  <p><strong>Propósito:</strong> Facilitar la operación y navegabilidad durante la reunión de 60 minutos.</p>
                  <p><strong>Comportamiento clave:</strong> Conmutador de roles, disparador de simulación rápida de fin de semana, restablecimiento completo del estado y auditoría de eventos en el log de notificaciones.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 5: Registro de Notificaciones en Tiempo Real -->
        <section class="demo-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Registro de Eventos y Notificaciones (Log)</h2>
              <p class="section-subtitle">Últimas acciones registradas en el estado reactivo durante la sesión.</p>
            </div>
            <span class="badge badge--subtle">${notifications.length} registros recientes</span>
          </div>

          <div class="card card--notification-log">
            <div class="card__body">
              ${notifications.length === 0 ? `
                <div class="log-empty">
                  No se han generado eventos aún. Pulsa "Simular fin de semana" o ejecuta acciones en el club o paneles para ver el flujo en tiempo real.
                </div>
              ` : `
                <div class="log-feed">
                  ${notifications.map(n => `
                    <div class="log-item">
                      <div class="log-item__icon">⚡</div>
                      <div class="log-item__content">
                        <span class="log-item__message">${n.message}</span>
                        <span class="log-item__time">${n.time}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function mount() {
    function setupInteractions() {
      // 1. Selector de Rol
      const roleSelect = document.getElementById('demo-role-select');
      if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
          setRole(e.target.value);
        });
      }

      // 2. Selector de Local
      const venueSelect = document.getElementById('demo-venue-select');
      if (venueSelect) {
        venueSelect.addEventListener('change', (e) => {
          setCurrentVenue(e.target.value);
        });
      }

      // 3. Selector de Miembro
      const memberSelect = document.getElementById('demo-member-select');
      if (memberSelect) {
        memberSelect.addEventListener('change', (e) => {
          setCurrentMember(e.target.value);
        });
      }

      // 4. Botón Simular fin de semana
      const simWeekendBtn = document.getElementById('btn-simulate-weekend');
      if (simWeekendBtn) {
        simWeekendBtn.addEventListener('click', () => {
          simulateWeekend();
          const feedbackContainer = document.getElementById('demo-feedback-container');
          if (feedbackContainer) {
            feedbackContainer.innerHTML = `
              <div class="alert alert--success animate-fade-in">
                <span class="alert__icon">✓</span>
                <div class="alert__body">
                  <strong>¡Fin de semana simulado con éxito!</strong>
                  <span>Se registraron 10 guardados en Mi Club, 3 señales de atribución de promotores y 5 asistencias validadas en puerta. Visita el panel de cada local o el resumen de grupo para comprobar las cifras actualizadas.</span>
                </div>
              </div>
            `;
            feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }

      // 5. Botón Ver recorrido guiado
      const tourBtn = document.getElementById('btn-start-tour');
      if (tourBtn) {
        tourBtn.addEventListener('click', () => {
          startTour();
          navigate('/discover');
        });
      }

      // 6. Botón Reiniciar demo
      const resetBtn = document.getElementById('btn-reset-demo');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          const confirmReset = window.confirm(
            '¿Deseas restablecer el estado inicial de la demo? Se limpiarán las simulaciones actuales y volverá a los valores semilla.'
          );
          if (confirmReset) {
            resetDemo();
            const feedbackContainer = document.getElementById('demo-feedback-container');
            if (feedbackContainer) {
              feedbackContainer.innerHTML = `
                <div class="alert alert--info animate-fade-in">
                  <span class="alert__icon">🔄</span>
                  <div class="alert__body">
                    <strong>Demo restablecida a valores semilla (SEED).</strong>
                    <span>El estado en memoria ha sido reinicializado limpiamente.</span>
                  </div>
                </div>
              `;
            }
          }
        });
      }

      // 7. Acordeón
      document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', (e) => {
          const btn = e.currentTarget;
          const targetId = btn.dataset.target;
          const body = document.getElementById(targetId);
          const icon = btn.querySelector('.accordion-icon');
          const isOpen = body?.classList.contains('accordion-body--open');

          // Cerrar otros
          document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('accordion-body--open'));
          document.querySelectorAll('.accordion-icon').forEach(i => i.textContent = '+');

          if (!isOpen && body) {
            body.classList.add('accordion-body--open');
            if (icon) icon.textContent = '−';
          }
        });
      });
    }

    setupInteractions();

    const unsubscribe = subscribe(() => {
      const pageEl = document.querySelector('.demo-control-page');
      if (pageEl && pageEl.parentElement) {
        pageEl.parentElement.innerHTML = render();
        setupInteractions();
      }
    });

    return () => {
      unsubscribe();
    };
  }

  return {
    html: render(),
    mount,
  };
}
