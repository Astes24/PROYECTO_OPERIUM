// Operium Club — Pantalla F: Gestión de Eventos & Demanda
// Control de fechas, creación/edición de eventos y tarjeta de recomendación inteligente basada en señales

import { getState, subscribe, createEvent, updateEvent, deleteEvent } from '../../store.js';
import { getVenue, VENUES } from '../../data/venues.js';

export default function Events() {
  let currentVenueFilter = 'all';
  let editingEventId = null; // null = creando nuevo, string = editando existente
  let isModalOpen = false;

  // Algoritmo de recomendación inteligente de eventos
  function computeRecommendation(events, venues, promoters, members) {
    // Analizar la demanda por local:
    // Demanda = guardados + seguidores + señales de promotores
    const demandScores = venues.map(venue => {
      const venueEvents = events.filter(e => e.venueId === venue.id);
      const totalSaved = venueEvents.reduce((s, e) => s + (e.savedCount || 0), 0);
      const followers = members.filter(m => (m.following || []).includes(venue.id)).length;
      const venuePromoters = promoters.filter(p => p.venue === venue.id);
      const signals = venuePromoters.reduce((s, p) => s + (p.signals || []).length, 0);

      // Score ponderado
      const score = (totalSaved * 2) + (followers * 1.5) + (signals * 3);

      return {
        venue,
        eventsCount: venueEvents.length,
        totalSaved,
        followers,
        signals,
        score,
      };
    });

    // Ordenar de mayor a menor demanda
    demandScores.sort((a, b) => b.score - a.score);
    const topVenue = demandScores[0].venue;

    // Sugerencia contextual
    const suggestions = {
      'mood': {
        title: 'Sunset to Deep: Rooftop Experience',
        subtitle: 'Special Guest DJ & Beefeater Lounge',
        time: '21:00',
        endTime: '04:00',
        date: '2026-10-24',
        dayLabel: 'Sábado 24 Oct',
        capacity: 240,
        benefitTitle: 'Cóctel Sunset de bienvenida',
        benefitDesc: 'Ingreso preferencial por ascensor VIP y cóctel de bienvenida hasta las 23:00 hrs.',
        reason: 'Mood registra el mayor ratio de señales activas de promotores (12 señales) y alta demanda en música electrónica.',
      },
      'play': {
        title: 'Play Neon Sessions: Electro-Pop Night',
        subtitle: 'Show de lásers sincronizado & barra libre de shots',
        time: '22:00',
        endTime: '04:30',
        date: '2026-10-24',
        dayLabel: 'Sábado 24 Oct',
        capacity: 350,
        benefitTitle: 'Pulsera luminosa VIP + Shot de bienvenida',
        benefitDesc: 'Acceso por carril exclusivo para miembros del club con pase activo.',
        reason: 'Play acumula la mayor capacidad y tracción de comunidad universitaria con alta recurrencia de señales.',
      },
      'senor-peru': {
        title: 'Peña Criolla & Salsa Brava en Vivo',
        subtitle: 'Orquesta de primer nivel & gastronomía norteña',
        time: '20:30',
        endTime: '03:30',
        date: '2026-10-24',
        dayLabel: 'Sábado 24 Oct',
        capacity: 250,
        benefitTitle: 'Piqueo criollo + Pisco Sour de cortesía',
        benefitDesc: 'Mesa con vista al escenario reservada para miembros que confirmen antes de las 21:30.',
        reason: 'Señor Perú tiene la mayor conversión de asistentes mayores de 25 años en busca de espectáculos en vivo.',
      },
      'adria': {
        title: '#AdriaNights: Premium Lounge & Cocktails',
        subtitle: 'Coctelería de autor, maridaje y DJ residente',
        time: '20:00',
        endTime: '03:00',
        date: '2026-10-24',
        dayLabel: 'Sábado 24 Oct',
        capacity: 160,
        benefitTitle: 'Copa de espumante + Tabla de autor',
        benefitDesc: 'Atención personalizada en zona lounge para grupos con reserva en el club.',
        reason: 'Adriá presenta el mayor índice de exclusividad y fidelidad entre miembros recurrentes del segmento gastronómico.',
      },
    };

    return {
      topVenue,
      metrics: demandScores[0],
      suggestion: suggestions[topVenue.id] || suggestions['mood'],
    };
  }

  function render() {
    const state = getState();
    const { events, venues, promoters, members } = state;

    const recommendation = computeRecommendation(events, venues, promoters, members);

    // Filtrar eventos por local
    const filteredEvents = events.filter(e => {
      return currentVenueFilter === 'all' || e.venueId === currentVenueFilter;
    });

    const totalEvents = events.length;
    const totalCapacity = events.reduce((s, e) => s + (e.capacity || 0), 0);
    const totalSaved = events.reduce((s, e) => s + (e.savedCount || 0), 0);
    const totalCheckins = events.reduce((s, e) => s + (e.checkinCount || 0), 0);

    // Evento en edición si modal está abierto
    const editingEvent = editingEventId ? events.find(e => e.id === editingEventId) : null;

    return `
      <div class="panel-page events-admin-page">
        <!-- Encabezado de Página -->
        <header class="panel-page__header">
          <div class="panel-page__title-group">
            <div class="panel-page__badge-row">
              <span class="badge badge--gold">Gestión de Eventos</span>
              <span class="badge badge--outline">Agenda & Demanda</span>
              <span class="badge badge--warning">DATOS FICTICIOS — DEMO</span>
            </div>
            <h1 class="panel-page__title">Eventos & Convocatorias</h1>
            <p class="panel-page__subtitle">
              Programa, edita y supervisa las fechas de los 4 locales (Señor Perú, Mood, Adriá y Play). Recomendaciones basadas en señales de interés anticipado.
            </p>
          </div>

          <div style="display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn--primary btn--md" id="btn-open-create-modal">
              <span>+ Nuevo Evento</span>
            </button>
            <div class="panel-page__stats-pill">
              <div class="stat-pill">
                <span class="stat-pill__label">Eventos</span>
                <span class="stat-pill__value">${totalEvents}</span>
              </div>
              <div class="stat-pill">
                <span class="stat-pill__label">Interés (Guardados)</span>
                <span class="stat-pill__value text-gold">${totalSaved}</span>
              </div>
              <div class="stat-pill">
                <span class="stat-pill__label">Check-ins</span>
                <span class="stat-pill__value text-success">${totalCheckins}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- TARJETA DE RECOMENDACIÓN INTELIGENTE (P4) -->
        <section class="marketing-section" style="margin-bottom: var(--space-xl);">
          <div class="card card--recommendation" style="border: 2px solid var(--color-accent); background: linear-gradient(135deg, rgba(212, 168, 87, 0.08) 0%, rgba(13, 13, 13, 0.95) 100%);">
            <div class="card__header card__header--split">
              <div style="display: flex; gap: var(--space-md); align-items: flex-start;">
                <div class="recommendation-badge-icon" style="font-size: 2.2rem; background: rgba(212, 168, 87, 0.15); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-accent);">
                  💡
                </div>
                <div>
                  <div class="badge-row">
                    <span class="badge badge--gold">Algoritmo de Demanda</span>
                    <span class="badge badge--venue" style="color: ${recommendation.topVenue.accentColor}; background: ${recommendation.topVenue.accentColor}22;">
                      ${recommendation.topVenue.icon} ${recommendation.topVenue.name}
                    </span>
                    <span class="badge badge--success">Oportunidad Detectada</span>
                  </div>
                  <h3 class="card-title" style="margin: 6px 0 4px; font-size: var(--font-size-lg);">
                    Próxima Convocatoria Sugerida: ${recommendation.suggestion.title}
                  </h3>
                  <p class="card-subtitle" style="color: var(--color-text-muted); font-size: var(--font-size-xs);">
                    ${recommendation.suggestion.reason}
                  </p>
                </div>
              </div>

              <div>
                <button 
                  type="button" 
                  class="btn btn--accent btn--md btn-apply-recommendation" 
                  id="btn-apply-rec"
                  data-venue="${recommendation.topVenue.id}"
                  data-title="${recommendation.suggestion.title}"
                  data-subtitle="${recommendation.suggestion.subtitle}"
                  data-date="${recommendation.suggestion.date}"
                  data-daylabel="${recommendation.suggestion.dayLabel}"
                  data-time="${recommendation.suggestion.time}"
                  data-endtime="${recommendation.suggestion.endTime}"
                  data-capacity="${recommendation.suggestion.capacity}"
                  data-benefit-title="${recommendation.suggestion.benefitTitle}"
                  data-benefit-desc="${recommendation.suggestion.benefitDesc}"
                >
                  <span>⚡ Aplicar a la Agenda</span>
                </button>
              </div>
            </div>

            <div class="card__body" style="padding-top: var(--space-sm);">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); background: rgba(0,0,0,0.3); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
                <div>
                  <span style="font-size: var(--font-size-2xs); color: var(--color-text-dim); text-transform: uppercase; letter-spacing: 0.05em; display: block;">Local con mayor tracción</span>
                  <strong style="color: ${recommendation.topVenue.accentColor}; font-size: var(--font-size-sm);">${recommendation.topVenue.name}</strong>
                  <small style="display: block; color: var(--color-text-dim);">Score de demanda: ${recommendation.metrics.score} pts</small>
                </div>
                <div>
                  <span style="font-size: var(--font-size-2xs); color: var(--color-text-dim); text-transform: uppercase; letter-spacing: 0.05em; display: block;">Fecha y Hora recomendada</span>
                  <strong style="font-size: var(--font-size-sm);">${recommendation.suggestion.dayLabel} • ${recommendation.suggestion.time} hrs</strong>
                  <small style="display: block; color: var(--color-text-dim);">Ventana de máxima afluencia</small>
                </div>
                <div>
                  <span style="font-size: var(--font-size-2xs); color: var(--color-text-dim); text-transform: uppercase; letter-spacing: 0.05em; display: block;">Aforo óptimo sugerido</span>
                  <strong style="font-size: var(--font-size-sm);">${recommendation.suggestion.capacity} personas</strong>
                  <small style="display: block; color: var(--color-text-dim);">Evita sobrecupo y cuida experiencia</small>
                </div>
                <div>
                  <span style="font-size: var(--font-size-2xs); color: var(--color-text-dim); text-transform: uppercase; letter-spacing: 0.05em; display: block;">Beneficio Club para conversión</span>
                  <strong style="color: var(--color-accent); font-size: var(--font-size-sm);">${recommendation.suggestion.benefitTitle}</strong>
                  <small style="display: block; color: var(--color-text-dim);">Incentivo de asistencia preferencial</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- FILTROS POR LOCAL -->
        <section class="marketing-section">
          <div class="section-header-row" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h2 class="section-title">Agenda Activa de Locales</h2>
              <p class="section-subtitle">Visualiza y gestiona las fechas programadas en toda la red de locales.</p>
            </div>
            
            <div class="venue-filters" id="events-venue-filter-bar">
              <button 
                type="button" 
                class="venue-chip ${currentVenueFilter === 'all' ? 'venue-chip--active' : ''}" 
                data-venue="all"
              >
                <span>✨ Todos (${events.length})</span>
              </button>
              ${VENUES.map(v => {
                const count = events.filter(e => e.venueId === v.id).length;
                return `
                  <button 
                    type="button" 
                    class="venue-chip ${currentVenueFilter === v.id ? 'venue-chip--active' : ''}" 
                    data-venue="${v.id}"
                    style="--chip-color: ${v.accentColor};"
                  >
                    <span>${v.icon} ${v.name} (${count})</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- LISTADO DE EVENTOS -->
          <div class="events-admin-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-lg); margin-top: var(--space-md);">
            ${filteredEvents.map(event => {
              const venue = getVenue(event.venueId) || { name: event.venueId, icon: '📍', accentColor: '#D4A857' };
              const capRatio = event.capacity ? Math.round(((event.checkinCount || 0) / event.capacity) * 100) : 0;

              return `
                <div class="card card--event-manage" style="border-top: 3px solid ${venue.accentColor}; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div class="card__header card__header--split" style="padding-bottom: var(--space-sm);">
                      <div class="badge-row">
                        <span class="badge badge--venue" style="color: ${venue.accentColor}; background: ${venue.accentColor}22;">
                          ${venue.icon} ${venue.name}
                        </span>
                        <span class="badge badge--subtle">
                          🗓️ ${event.dayLabel || event.date}
                        </span>
                      </div>
                      <div style="display: flex; gap: 4px;">
                        <button type="button" class="btn btn--xs btn--outline btn-edit-event" data-event-id="${event.id}" title="Editar evento">
                          ✏️ Editar
                        </button>
                        <button type="button" class="btn btn--xs btn--danger-outline btn-delete-event" data-event-id="${event.id}" title="Eliminar evento">
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div style="padding: 0 var(--space-md);">
                      <h3 style="font-size: var(--font-size-md); margin: 0 0 4px; font-weight: 700;">${event.title}</h3>
                      <p style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0 0 var(--space-xs);">${event.subtitle || ''}</p>
                      <p style="font-size: var(--font-size-2xs); color: var(--color-text-dim); line-height: 1.4; margin-bottom: var(--space-md);">${event.description || ''}</p>
                    </div>
                  </div>

                  <div>
                    <!-- Métricas de Demanda vs Operación -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: var(--space-sm) var(--space-md); background: rgba(255,255,255,0.02); border-top: 1px solid var(--color-border-subtle); border-bottom: 1px solid var(--color-border-subtle);">
                      <div style="text-align: center;">
                        <span style="font-size: var(--font-size-2xs); color: var(--color-text-dim); display: block;">Guardados</span>
                        <strong style="color: var(--color-accent); font-size: var(--font-size-sm);">⭐ ${event.savedCount || 0}</strong>
                      </div>
                      <div style="text-align: center;">
                        <span style="font-size: var(--font-size-2xs); color: var(--color-text-dim); display: block;">Check-ins</span>
                        <strong style="color: ${venue.accentColor}; font-size: var(--font-size-sm);">🎟️ ${event.checkinCount || 0}</strong>
                      </div>
                      <div style="text-align: center;">
                        <span style="font-size: var(--font-size-2xs); color: var(--color-text-dim); display: block;">Capacidad</span>
                        <strong style="font-size: var(--font-size-sm);">${event.capacity || 0}</strong>
                      </div>
                    </div>

                    <!-- Footer con Beneficio -->
                    <div style="padding: var(--space-sm) var(--space-md); font-size: var(--font-size-2xs); color: var(--color-text-muted);">
                      <span style="color: var(--color-accent); font-weight: 600;">🎁 Beneficio:</span> ${event.benefit?.title || 'Acceso preferencial'}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- MODAL DE CREACIÓN / EDICIÓN DE EVENTOS -->
        ${isModalOpen ? `
          <div class="modal-backdrop animate-fade-in" id="event-modal-backdrop">
            <div class="modal-dialog animate-slide-up" style="max-width: 600px; width: 90%; background: var(--color-surface); border: 1px solid var(--color-border-accent); border-radius: var(--radius-lg); padding: var(--space-xl); max-height: 90vh; overflow-y: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); border-bottom: 1px solid var(--color-border-subtle); padding-bottom: var(--space-sm);">
                <div>
                  <h3 style="margin: 0; font-size: var(--font-size-lg);">${editingEvent ? '✏️ Editar Evento' : '+ Crear Nuevo Evento'}</h3>
                  <p style="margin: 4px 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
                    Configuración de fecha para demostración interactiva
                  </p>
                </div>
                <button type="button" class="btn btn--xs btn--outline" id="btn-close-modal" style="font-size: 1.1rem; padding: 4px 8px;">✕</button>
              </div>

              <form id="event-editor-form">
                <div class="form-group" style="margin-bottom: var(--space-md);">
                  <label class="form-label" for="ev-venue">Establecimiento / Local:</label>
                  <select id="ev-venue" class="form-select" required>
                    ${VENUES.map(v => `
                      <option value="${v.id}" ${editingEvent?.venueId === v.id ? 'selected' : ''}>
                        ${v.icon} ${v.name}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group" style="margin-bottom: var(--space-md);">
                  <label class="form-label" for="ev-title">Título del Evento:</label>
                  <input type="text" id="ev-title" class="form-input" value="${editingEvent?.title || ''}" placeholder="Ej: Mood Sessions: Tech House Night" required />
                </div>

                <div class="form-group" style="margin-bottom: var(--space-md);">
                  <label class="form-label" for="ev-subtitle">Subtítulo / Descripción corta:</label>
                  <input type="text" id="ev-subtitle" class="form-input" value="${editingEvent?.subtitle || ''}" placeholder="Ej: DJ residente & barra signature" />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md);">
                  <div class="form-group">
                    <label class="form-label" for="ev-date">Fecha (YYYY-MM-DD):</label>
                    <input type="date" id="ev-date" class="form-input" value="${editingEvent?.date || '2026-10-24'}" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="ev-daylabel">Etiqueta de Día:</label>
                    <input type="text" id="ev-daylabel" class="form-input" value="${editingEvent?.dayLabel || 'Sábado 24 Oct'}" placeholder="Ej: Sábado 24 Oct" required />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md);">
                  <div class="form-group">
                    <label class="form-label" for="ev-time">Hora Inicio:</label>
                    <input type="text" id="ev-time" class="form-input" value="${editingEvent?.time || '21:00'}" placeholder="21:00" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="ev-endtime">Hora Fin:</label>
                    <input type="text" id="ev-endtime" class="form-input" value="${editingEvent?.endTime || '04:00'}" placeholder="04:00" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="ev-capacity">Aforo:</label>
                    <input type="number" id="ev-capacity" class="form-input" value="${editingEvent?.capacity || 200}" min="50" max="1000" />
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: var(--space-md);">
                  <label class="form-label" for="ev-benefit-title">Beneficio Club (Título):</label>
                  <input type="text" id="ev-benefit-title" class="form-input" value="${editingEvent?.benefit?.title || 'Cóctel de cortesía'}" placeholder="Ej: Pisco Sour de cortesía" />
                </div>

                <div class="form-group" style="margin-bottom: var(--space-lg);">
                  <label class="form-label" for="ev-benefit-desc">Condiciones del beneficio:</label>
                  <input type="text" id="ev-benefit-desc" class="form-input" value="${editingEvent?.benefit?.description || 'Presentar el pase activo del club al ingresar.'}" placeholder="Condiciones para el socio..." />
                </div>

                <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-md);">
                  <button type="button" class="btn btn--secondary btn--md" id="btn-cancel-modal">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn--primary btn--md" id="btn-save-event">
                    <span>${editingEvent ? 'Guardar Cambios' : 'Crear Evento'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function mount() {
    function setupInteractions() {
      // 1. Filtros por local
      document.querySelectorAll('#events-venue-filter-bar .venue-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          currentVenueFilter = e.currentTarget.dataset.venue || 'all';
          rerender();
        });
      });

      // 2. Abrir modal para crear
      const createBtn = document.getElementById('btn-open-create-modal');
      if (createBtn) {
        createBtn.addEventListener('click', () => {
          editingEventId = null;
          isModalOpen = true;
          rerender();
        });
      }

      // 3. Abrir modal para editar
      document.querySelectorAll('.btn-edit-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eventId = e.currentTarget.dataset.eventId;
          editingEventId = eventId;
          isModalOpen = true;
          rerender();
        });
      });

      // 4. Eliminar evento
      document.querySelectorAll('.btn-delete-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eventId = e.currentTarget.dataset.eventId;
          if (confirm('¿Deseas eliminar este evento de la demostración?')) {
            deleteEvent(eventId);
          }
        });
      });

      // 5. Aplicar recomendación algorítmica
      const applyRecBtn = document.getElementById('btn-apply-rec');
      if (applyRecBtn) {
        applyRecBtn.addEventListener('click', (e) => {
          const ds = e.currentTarget.dataset;
          createEvent({
            venueId: ds.venue,
            title: ds.title,
            subtitle: ds.subtitle,
            date: ds.date,
            dayLabel: ds.daylabel,
            time: ds.time,
            endTime: ds.endtime,
            capacity: parseInt(ds.capacity, 10),
            benefit: {
              title: ds.benefitTitle,
              description: ds.benefitDesc,
              eligibility: 'Miembros con perfil activo',
              conditions: 'Sujeto a aforo disponible.',
            },
          });
        });
      }

      // 6. Cerrar modal
      const closeBtn = document.getElementById('btn-close-modal');
      const cancelBtn = document.getElementById('btn-cancel-modal');
      const backdrop = document.getElementById('event-modal-backdrop');

      [closeBtn, cancelBtn].forEach(el => {
        if (el) {
          el.addEventListener('click', () => {
            isModalOpen = false;
            editingEventId = null;
            rerender();
          });
        }
      });

      if (backdrop) {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            isModalOpen = false;
            editingEventId = null;
            rerender();
          }
        });
      }

      // 7. Guardar formulario de evento
      const form = document.getElementById('event-editor-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const venueId = document.getElementById('ev-venue').value;
          const title = document.getElementById('ev-title').value;
          const subtitle = document.getElementById('ev-subtitle').value;
          const date = document.getElementById('ev-date').value;
          const dayLabel = document.getElementById('ev-daylabel').value;
          const time = document.getElementById('ev-time').value;
          const endTime = document.getElementById('ev-endtime').value;
          const capacity = parseInt(document.getElementById('ev-capacity').value, 10) || 200;
          const benefitTitle = document.getElementById('ev-benefit-title').value;
          const benefitDesc = document.getElementById('ev-benefit-desc').value;

          const payload = {
            venueId,
            title,
            subtitle,
            date,
            dayLabel,
            time,
            endTime,
            capacity,
            benefit: {
              title: benefitTitle,
              description: benefitDesc,
              eligibility: 'Miembros con pase vigente',
              conditions: 'Válido durante el evento.',
            },
          };

          if (editingEventId) {
            updateEvent(editingEventId, payload);
          } else {
            createEvent(payload);
          }

          isModalOpen = false;
          editingEventId = null;
          rerender();
        });
      }
    }

    function rerender() {
      const pageEl = document.querySelector('.events-admin-page');
      if (pageEl && pageEl.parentElement) {
        pageEl.parentElement.innerHTML = render();
        setupInteractions();
      }
    }

    setupInteractions();

    const unsubscribe = subscribe(() => {
      rerender();
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

