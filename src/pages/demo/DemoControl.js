// Operium Club — Control de demostración (solo presentador)
// Recorrido, simulación del fin de semana, reinicio, contexto activo,
// estado en memoria, explicación de pantallas y registro de acciones.

import { 
  getState, 
  subscribe, 
  setRole, 
  setCurrentVenue, 
  setCurrentMember, 
  simulateFriday, 
  setModuleHidden, 
  resetDemo, 
  startTour 
} from '../../store.js';
import { VENUES } from '../../data/venues.js';
import { navigate } from '../../router.js';
import { icon } from '../../icons.js';

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

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
    const currentVenue = VENUES.find(v => v.id === currentVenueId) || null; // null = todo el grupo
    const hidden = state.hiddenModules || [];

    // Cálculos del estado actual
    const totalSaved = events.reduce((sum, e) => sum + (e.savedCount || 0), 0);
    const totalCheckins = events.reduce((sum, e) => sum + (e.checkinCount || 0), 0);
    const totalSignals = promoters.reduce((sum, p) => sum + (p.weekendVisitsBase || 0) + (p.signals?.length || 0), 0);
    const fridayDone = events.some(e => e.finished);
    const sentCampaigns = campaigns.filter(c => c.status === 'sent' || c.status === 'completed').length;

    // Roles disponibles con metadatos
    const ROLES = [
      { id: 'publico', name: 'Público', persona: 'Miembro del club', route: '/discover', desc: 'Descubre eventos, guarda en Mi Club y sigue locales.' },
      { id: 'promotor', name: 'Promotor', persona: 'Ricardo V. (Mood)', route: '/panel/origen', desc: 'Comparte su enlace y ve cuántas visitas trae.' },
      { id: 'marketing', name: 'Marketing', persona: 'Equipo Central', route: '/panel/publico', desc: 'Segmenta la base y envía solo a quien dio permiso.' },
      { id: 'ventas', name: 'Puerta', persona: 'Personal de Recepción', route: '/panel/puerta', desc: 'Registra ingresos; uno por persona y evento.' },
      { id: 'encargado', name: 'Encargado de local', persona: currentVenue ? `${currentVenue.manager} (${currentVenue.name})` : 'Encargado de cada local', route: '/panel/eventos', desc: 'Compara interés, asistencia y aforo de su local.' },
      { id: 'grupo', name: 'Dirección del grupo', persona: 'Conan (Administrador)', route: '/panel/resumen', desc: 'Compara las cuatro marcas con cifras agregadas.' },
    ];

    const activeRoleData = ROLES.find(r => r.id === currentRole) || ROLES[0];

    const HOW = [
      { title: 'Descubrir', body: 'El público ve la agenda de los cuatro locales y guarda lo que le interesa. Guardar suma interés; no cuenta como asistencia ni como venta. Funciona en el navegador, sin instalar nada.' },
      { title: 'Evento y Mi Club', body: 'Ficha del evento con su beneficio para miembros y un pase ilustrativo. El pase no es una entrada ni garantiza acceso si el local llega al aforo.' },
      { title: 'Resumen', body: 'Entrada del negocio. Separa este fin de semana (interés) del anterior (asistencia y conversión reales) y compara los cuatro locales. Las ventas nunca se estiman.' },
      { title: 'Eventos', body: 'Cada fecha con su estado. Antes de abrir solo hay guardados frente al aforo; cuando la noche cierra aparecen asistencia y conversión.' },
      { title: 'Origen', body: 'De dónde llega el público: promotores, campañas o directo. Cada promotor tiene un enlace propio; una visita por miembro y evento, sin comisiones en esta fase.' },
      { title: 'Público', body: 'Segmentos nuevo, recurrente y sin actividad. Antes de cualquier envío se verifica el permiso del canal y del local; quien no lo dio queda fuera. Las respuestas se simulan con tasas de referencia (65% / 35% / 15%).' },
      { title: 'Puerta', body: 'La app del portero, simulada en un teléfono. El check-in es idempotente: el segundo intento con el mismo miembro se rechaza y el conteo no cambia.' },
      { title: 'Contexto', body: 'El selector “Viendo” de la barra lateral cambia entre todo el grupo y cada local, y filtra todas las pantallas. Ningún local ve datos personales de otra marca.' },
    ];

    return `
      <div class="panel-page demo-control-page">
        <header class="vt-header">
          <div>
            <span class="section-title__eyebrow">Solo para el presentador</span>
            <h1 class="panel-page__title">Control de demostración</h1>
            <p class="vt-header__meta">Todos los miembros, eventos y cifras son ficticios. Nada de lo que hagas aquí sale de este navegador.</p>
          </div>
        </header>

        <div id="demo-feedback-container" class="demo-feedback-container" aria-live="polite"></div>

        <section class="dc-actions">
          <div class="dc-action">
            <div>
              <h2 class="dc-action__title">Recorrido guiado</h2>
              <p>${hidden.length ? `${6 - hidden.length} pasos` : 'Seis pasos'}: Descubrir, Origen${hidden.includes('publico') ? '' : ', Público'}${hidden.includes('puerta') ? '' : ', Puerta'}, Eventos y Resumen.</p>
            </div>
            <button type="button" class="btn btn--primary btn--md" id="btn-start-tour">${icon('map', { size: 16 })} Empezar</button>
          </div>
          <div class="dc-action">
            <div>
              <h2 class="dc-action__title">Simular la noche del viernes</h2>
              <p>${fridayDone ? 'Ya simulada. Reinicia para volver al jueves.' : 'Cierra las cuatro noches del viernes con asistencia y conversión realistas.'}</p>
            </div>
            <button type="button" class="sim-btn sim-btn--md" id="btn-simulate-weekend" ${fridayDone ? 'disabled' : ''}>${icon('zap', { size: 16 })} Simular viernes</button>
          </div>
          <div class="dc-action">
            <div>
              <h2 class="dc-action__title">Reiniciar</h2>
              <p>Vuelve a los datos iniciales. Borra check-ins, visitas y envíos de esta sesión.</p>
            </div>
            <button type="button" class="btn btn--ghost btn--md dc-reset" id="btn-reset-demo">${icon('undo', { size: 16 })} Reiniciar</button>
          </div>
        </section>

        <section>
          <div class="vt-panel__head">
            <h2 class="vt-panel__title">Contexto</h2>
          </div>
          <div class="dc-context">
            <div class="form-group">
              <label class="form-label" for="demo-role-select">Punto de vista</label>
              <select id="demo-role-select" class="form-select">
                ${ROLES.map(r => `<option value="${r.id}" ${r.id === currentRole ? 'selected' : ''}>${r.name}</option>`).join('')}
              </select>
              <p class="dc-context__hint" id="role-desc-preview">
                ${activeRoleData.desc}
                <a href="#${activeRoleData.route}" class="role-jump-link">Abrir ${icon('right', { size: 13 })}</a>
              </p>
            </div>
            <div class="form-group">
              <label class="form-label" for="demo-venue-select">Contexto del negocio</label>
              <select id="demo-venue-select" class="form-select">
                <option value="all" ${currentVenueId === 'all' ? 'selected' : ''}>Todo el grupo</option>
                ${VENUES.map(v => `<option value="${v.id}" ${v.id === currentVenueId ? 'selected' : ''}>${v.name} · ${v.category}</option>`).join('')}
              </select>
              <p class="dc-context__hint">${currentVenue ? `Encargado: ${currentVenue.manager}` : 'Vista de dirección: los cuatro locales'}</p>
            </div>
            <div class="form-group">
              <label class="form-label" for="demo-member-select">Miembro</label>
              <select id="demo-member-select" class="form-select">
                ${members.slice(0, 30).map(m => `<option value="${m.id}" ${m.id === currentMemberId ? 'selected' : ''}>${m.name} · ${m.segment}</option>`).join('')}
              </select>
              <p class="dc-context__hint">${plural(currentMember.savedEvents?.length || 0, 'guardado', 'guardados')} · ${plural((currentMember.checkins || []).length, 'check-in', 'check-ins')}</p>
            </div>
          </div>
        </section>

        <section>
          <div class="vt-panel__head">
            <h2 class="vt-panel__title">Adaptar al cliente</h2>
            <span class="vt-panel__hint">Si ya resuelven algo con otra herramienta, quítalo del menú y del recorrido</span>
          </div>
          <div class="dc-modules">
            ${[['publico', 'Público', 'Segmentos y campañas con consentimiento'], ['puerta', 'Puerta', 'Registro de ingresos (si ya tienen check-in con QR)']].map(([id, name, hint]) => `
              <label class="dc-module">
                <input type="checkbox" data-module-toggle="${id}" ${hidden.includes(id) ? '' : 'checked'} />
                <span><strong>${name}</strong><small>${hint}</small></span>
              </label>
            `).join('')}
          </div>
        </section>

        <section>
          <dl class="vt-kpis dc-state">
            <div><dt>Guardados</dt><dd id="demo-stat-saved">${totalSaved}</dd></div>
            <div><dt>Ingresos</dt><dd id="demo-stat-checkins">${totalCheckins}</dd></div>
            <div><dt>Visitas por enlace</dt><dd id="demo-stat-signals">${totalSignals}</dd></div>
            <div><dt>Campañas enviadas</dt><dd id="demo-stat-campaigns">${sentCampaigns}/${campaigns.length}</dd></div>
            <div><dt>Miembros</dt><dd>${members.length}</dd></div>
          </dl>
        </section>

        <div class="vt-grid">
          <section>
            <div class="vt-panel__head">
              <h2 class="vt-panel__title">Cómo funciona cada pantalla</h2>
            </div>
            <div class="dc-how" id="demo-accordion">
              ${HOW.map(h => `
                <details class="dc-how__item">
                  <summary>${h.title}<span aria-hidden="true">${icon('right', { size: 14 })}</span></summary>
                  <p>${h.body}</p>
                </details>
              `).join('')}
            </div>
          </section>

          <section>
            <div class="vt-panel__head">
              <h2 class="vt-panel__title">Registro</h2>
              <span class="vt-panel__hint">${plural(notifications.length, 'acción', 'acciones')}</span>
            </div>
            ${notifications.length === 0 ? `
              <p class="vt-panel__note">Todavía no hay acciones en esta sesión.</p>
            ` : `
              <ol class="vt-feed dc-log">
                ${notifications.map(n => `
                  <li class="vt-feed__item">
                    <div><div>${n.message}</div><small>${n.time}</small></div>
                  </li>
                `).join('')}
              </ol>
            `}
          </section>
        </div>
      </div>
    `;
  }

  function mount() {
    function feedback(kind, html) {
      const box = document.getElementById('demo-feedback-container');
      if (!box) return;
      box.innerHTML = `<div class="vt-result vt-result--${kind}">${icon(kind === 'ok' ? 'check' : 'refresh', { size: 18 })}<div>${html}</div></div>`;
    }

    function setupInteractions() {
      document.getElementById('demo-role-select')?.addEventListener('change', (e) => setRole(e.target.value));
      document.getElementById('demo-venue-select')?.addEventListener('change', (e) => setCurrentVenue(e.target.value));
      document.getElementById('demo-member-select')?.addEventListener('change', (e) => setCurrentMember(e.target.value));

      document.getElementById('btn-simulate-weekend')?.addEventListener('click', () => {
        simulateFriday();
        feedback('ok', '<strong>Noche del viernes simulada.</strong> Revisa Resumen o Eventos para ver asistencia y conversión.');
      });

      document.querySelectorAll('[data-module-toggle]').forEach(input => {
        input.addEventListener('change', () => setModuleHidden(input.dataset.moduleToggle, !input.checked));
      });

      document.getElementById('btn-start-tour')?.addEventListener('click', () => {
        startTour();
        navigate('/discover');
      });

      document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
        if (window.confirm('¿Volver a los datos iniciales? Se borran las simulaciones de esta sesión.')) {
          resetDemo();
          feedback('blocked', '<strong>Demo reiniciada.</strong> Todo vuelve a los datos iniciales.');
        }
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

    return () => unsubscribe();
  }

  return {
    html: render(),
    mount,
  };
}
