// Operium Club — Pantalla E: Panel Local Hoy + Eventos
// Desktop-first, Selector de 4 locales, Próximo evento, Lectura de interés,
// Check-in idempotente, Distinción guardado ≠ asistencia ≠ venta, Atribución de promotores.

import { getState, subscribe, setCurrentVenue, checkIn, getVenueMetrics } from '../../store.js';
import { getVenue, VENUES } from '../../data/venues.js';

export default function VenueToday() {
  function render() {
    const state = getState();
    const { currentVenueId, events, members, promoters, notifications } = state;

    const selectedVenue = getVenue(currentVenueId) || VENUES[1]; // default mood
    const metrics = getVenueMetrics(selectedVenue.id);
    const venueEvents = events.filter(e => e.venueId === selectedVenue.id);
    const nextEvent = venueEvents[0] || null;

    // Promotores asignados a este local
    const venuePromoters = promoters.filter(p => p.venue === selectedVenue.id);
    const venueSignals = venuePromoters.flatMap(p => 
      (p.signals || []).map(s => ({ ...s, promoterName: p.name, promoterCode: p.code }))
    );

    // Actividad reciente para este local (check-ins de miembros en este local)
    const recentCheckins = [];
    members.forEach(m => {
      (m.checkins || []).forEach(c => {
        const ev = events.find(e => e.id === c.eventId);
        if (ev && ev.venueId === selectedVenue.id) {
          recentCheckins.push({
            memberName: m.name,
            memberId: m.id,
            eventTitle: ev.title,
            date: c.date,
            time: c.time,
            validatedBy: c.validatedBy,
          });
        }
      });
    });

    // Ratio de guardados vs asistencias
    const totalSaved = metrics.totalSaved;
    const totalCheckins = metrics.totalCheckins;
    const maxBar = Math.max(totalSaved, totalCheckins, 100);
    const savedPct = Math.min(100, Math.round((totalSaved / maxBar) * 100));
    const checkinsPct = Math.min(100, Math.round((totalCheckins / maxBar) * 100));

    return `
      <div class="panel-page venue-today-page" style="--venue-color: ${selectedVenue.accentColor};">
        <!-- Encabezado de Página -->
        <header class="panel-page__header">
          <div class="panel-page__title-group">
            <div class="panel-page__badge-row">
              <span class="badge badge--gold">Pantalla E — Panel de Negocio</span>
              <span class="badge badge--venue" style="background-color: ${selectedVenue.accentColor}22; color: ${selectedVenue.accentColor}; border: 1px solid ${selectedVenue.accentColor}55;">
                ${selectedVenue.icon} ${selectedVenue.name}
              </span>
              <span class="badge badge--warning">DATOS FICTICIOS — DEMO</span>
            </div>
            <h1 class="panel-page__title">Local: Hoy + Eventos</h1>
            <p class="panel-page__subtitle">
              Tablero operativo por establecimiento: lectura de interés anticipado, validación de acceso en puerta (check-in) y separación estricta entre intención, asistencia física y ventas.
            </p>
          </div>
        </header>

        <!-- Selector de Locales (Pestañas de los 4 Locales) -->
        <nav class="venue-tabs" aria-label="Selección de local">
          ${VENUES.map(v => {
            const isActive = v.id === selectedVenue.id;
            return `
              <button 
                type="button" 
                class="venue-tab ${isActive ? 'venue-tab--active' : ''}" 
                data-venue-id="${v.id}"
                style="--tab-color: ${v.accentColor};"
              >
                <span class="venue-tab__icon">${v.icon}</span>
                <div class="venue-tab__info">
                  <span class="venue-tab__name">${v.name}</span>
                  <span class="venue-tab__role">Resp: ${v.manager}</span>
                </div>
                ${isActive ? '<span class="venue-tab__indicator"></span>' : ''}
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Barra de Información del Local Seleccionado -->
        <div class="venue-info-bar" style="border-left: 4px solid ${selectedVenue.accentColor};">
          <div class="venue-info-bar__left">
            <div class="venue-avatar" style="border-color: ${selectedVenue.accentColor};">
              <span>${selectedVenue.icon}</span>
            </div>
            <div>
              <div class="venue-title-row">
                <h2 class="venue-heading">${selectedVenue.name}</h2>
                <span class="badge badge--outline">${selectedVenue.category}</span>
                <span class="badge badge--subtle">Aforo: ${selectedVenue.capacity} personas</span>
              </div>
              <p class="venue-tagline">${selectedVenue.tagline} • <em>${selectedVenue.description}</em></p>
              <div class="venue-details-row">
                <span>📍 ${selectedVenue.address}</span>
                <span class="divider-dot">•</span>
                <span>🕒 ${selectedVenue.schedule}</span>
                <span class="divider-dot">•</span>
                <span>👤 <strong>Encargado del local:</strong> ${selectedVenue.manager}</span>
              </div>
            </div>
          </div>
          <div class="venue-info-bar__right">
            <div class="stat-pill">
              <span class="stat-pill__label">Seguidores</span>
              <span class="stat-pill__value" style="color: ${selectedVenue.accentColor};">${metrics.followers}</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill__label">Conversión</span>
              <span class="stat-pill__value">${metrics.conversionRate}%</span>
            </div>
          </div>
        </div>

        <!-- SECCIÓN OBLIGATORIA: Distinción Conceptual de los 3 Hechos -->
        <div class="facts-distinction-grid">
          <div class="fact-card fact-card--saved">
            <div class="fact-card__header">
              <span class="fact-card__icon">⭐</span>
              <div>
                <h4 class="fact-card__title">1. Guardado (Interés)</h4>
                <span class="fact-card__status">Planificación personal</span>
              </div>
            </div>
            <div class="fact-card__body">
              <div class="fact-card__metric">${totalSaved} miembros</div>
              <p class="fact-card__desc">
                Agregaron la fecha a sus planes en Mi Club. Señal de <strong>interés anticipado</strong>.
              </p>
              <div class="fact-card__warning">
                ⚠️ <strong>No es asistencia:</strong> No garantiza que la persona acuda ni reserva mesa.
              </div>
            </div>
          </div>

          <div class="fact-card fact-card--checkin">
            <div class="fact-card__header">
              <span class="fact-card__icon">🎟️</span>
              <div>
                <h4 class="fact-card__title">2. Asistencia (Check-in)</h4>
                <span class="fact-card__status">Validado en puerta</span>
              </div>
            </div>
            <div class="fact-card__body">
              <div class="fact-card__metric" style="color: ${selectedVenue.accentColor};">${totalCheckins} accesos</div>
              <p class="fact-card__desc">
                Lectura física confirmada por el personal de recepción (<strong>${selectedVenue.manager}</strong>).
              </p>
              <div class="fact-card__rule">
                🔒 <strong>Idempotente:</strong> Registra una sola asistencia por miembro y evento.
              </div>
            </div>
          </div>

          <div class="fact-card fact-card--sales">
            <div class="fact-card__header">
              <span class="fact-card__icon">💳</span>
              <div>
                <h4 class="fact-card__title">3. Ventas (Transacción)</h4>
                <span class="fact-card__status badge badge--subtle">Sin integración POS</span>
              </div>
            </div>
            <div class="fact-card__body">
              <div class="fact-card__metric fact-card__metric--unavailable">Ventas no disponibles</div>
              <p class="fact-card__desc">
                El club no reemplaza terminales POS ni inventa ingresos por inferencia.
              </p>
              <div class="fact-card__notice">
                ℹ️ Requiere enlace directo con cobro/caja para certificar consumo real.
              </div>
            </div>
          </div>
        </div>

        <!-- CONTENEDOR DE FEEDBACK PARA CHECK-IN -->
        <div id="checkin-feedback-container" class="checkin-feedback-container"></div>

        <!-- FILA PRINCIPAL: 'Hoy' Dashboard & Operación de Check-in -->
        <div class="venue-main-grid">
          <!-- Columna 1: Tablero 'Hoy' y Próximo Evento -->
          <div class="venue-col">
            <!-- Tarjeta Próximo Evento -->
            ${nextEvent ? `
              <div class="card card--next-event">
                <div class="card__header card__header--split">
                  <div>
                    <span class="badge badge--pill badge--live">🔴 Próxima Fecha</span>
                    <h3 class="event-headline">${nextEvent.title}</h3>
                    <p class="event-subheadline">${nextEvent.subtitle}</p>
                  </div>
                  <div class="countdown-badge">
                    <span class="countdown-badge__label">Horario</span>
                    <span class="countdown-badge__time">${nextEvent.dayLabel} • ${nextEvent.time} hrs</span>
                  </div>
                </div>

                <div class="card__body">
                  <div class="event-fictitious-banner">
                    ⚠️ Evento ficticio para demostración • Calendario de muestra: Octubre 2026
                  </div>

                  <!-- Lectura de Interés Comparativa (Visual) -->
                  <div class="interest-reading-box">
                    <div class="interest-reading-header">
                      <span class="reading-title">Lectura de Interés vs. Asistencia Real</span>
                      <span class="reading-ratio">Tasa actual: <strong>${nextEvent.savedCount > 0 ? Math.round(((nextEvent.checkinCount || 0) / nextEvent.savedCount) * 100) : 0}%</strong></span>
                    </div>

                    <div class="comparison-bar-wrap">
                      <div class="comparison-row">
                        <div class="comparison-row__label">
                          <span>Guardados (Interés previo)</span>
                          <strong>${nextEvent.savedCount}</strong>
                        </div>
                        <div class="progress-bar">
                          <div class="progress-bar__fill progress-bar__fill--saved" style="width: ${savedPct}%;"></div>
                        </div>
                      </div>

                      <div class="comparison-row">
                        <div class="comparison-row__label">
                          <span>Check-ins validados (Puerta)</span>
                          <strong style="color: ${selectedVenue.accentColor};">${nextEvent.checkinCount || 0}</strong>
                        </div>
                        <div class="progress-bar">
                          <div class="progress-bar__fill" style="width: ${checkinsPct}%; background-color: ${selectedVenue.accentColor};"></div>
                        </div>
                      </div>

                      <div class="comparison-row">
                        <div class="comparison-row__label">
                          <span>Capacidad total estimada</span>
                          <strong>${nextEvent.capacity} personas</strong>
                        </div>
                        <div class="progress-bar">
                          <div class="progress-bar__fill progress-bar__fill--capacity" style="width: 100%;"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Beneficio Simulado del Evento -->
                  <div class="benefit-box">
                    <div class="benefit-box__header">
                      <span class="benefit-badge">🎁 Beneficio Club:</span>
                      <strong>${nextEvent.benefit?.title}</strong>
                    </div>
                    <p class="benefit-box__desc">${nextEvent.benefit?.description}</p>
                    <div class="benefit-box__conditions">
                      <small><strong>Elegibilidad:</strong> ${nextEvent.benefit?.eligibility} | <strong>Condiciones:</strong> ${nextEvent.benefit?.conditions}</small>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Línea de Actividad Reciente del Local -->
            <div class="card card--activity-feed">
              <div class="card__header">
                <h3 class="card-title">Línea de Actividad Reciente en ${selectedVenue.name}</h3>
                <span class="badge badge--subtle">Trazabilidad en tiempo real</span>
              </div>
              <div class="card__body">
                <div class="timeline" id="venue-activity-timeline">
                  ${recentCheckins.length === 0 && venueSignals.length === 0 ? `
                    <div class="timeline__empty">No se registran check-ins ni señales hoy para este local. Usa el validador a la derecha o simula el fin de semana.</div>
                  ` : `
                    <div class="timeline__list">
                      ${recentCheckins.slice(-5).reverse().map(c => `
                        <div class="timeline__item">
                          <div class="timeline__marker" style="background-color: ${selectedVenue.accentColor};"></div>
                          <div class="timeline__content">
                            <div class="timeline__meta">
                              <span class="timeline__date">${c.date} ${c.time}</span>
                              <span class="badge badge--xs badge--success">✓ Check-in verificado</span>
                            </div>
                            <div class="timeline__title">
                              <strong>${c.memberName}</strong> validó ingreso en puerta para <em>${c.eventTitle}</em>
                            </div>
                            <div class="timeline__source">
                              Operador responsable: <strong>${c.validatedBy}</strong>
                            </div>
                          </div>
                        </div>
                      `).join('')}

                      ${venueSignals.slice(-3).reverse().map(s => {
                        const m = members.find(mem => mem.id === s.memberId);
                        const ev = events.find(event => event.id === s.eventId);
                        return `
                          <div class="timeline__item">
                            <div class="timeline__marker timeline__marker--signal"></div>
                            <div class="timeline__content">
                              <div class="timeline__meta">
                                <span class="timeline__date">${s.date}</span>
                                <span class="badge badge--xs badge--outline">🔗 Señal de promotor</span>
                              </div>
                              <div class="timeline__title">
                                <strong>${m ? m.name : s.memberId}</strong> abrió enlace de <em>${s.promoterName}</em>
                              </div>
                              <div class="timeline__source">
                                Promotor: <code>${s.promoterCode}</code> (${s.sourceId})
                              </div>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>

          <!-- Columna 2: Validador de Check-in en Puerta & Atribución -->
          <div class="venue-col">
            <!-- MÓDULO DE CHECK-IN EN PUERTA (IDEMPOTENTE) -->
            <div class="card card--checkin-form">
              <div class="card__header">
                <div>
                  <span class="badge badge--pill badge--accent">Control de Acceso</span>
                  <h3 class="card-title">Validación de Check-in en Puerta</h3>
                  <p class="card-subtitle">Registra la asistencia física del miembro al presentar su pase del club.</p>
                </div>
              </div>

              <div class="card__body">
                <form id="checkin-form" class="checkin-form">
                  <div class="form-group">
                    <label class="form-label" for="checkin-member-select">
                      Seleccionar miembro en puerta:
                    </label>
                    <select id="checkin-member-select" class="form-select" required>
                      <option value="">-- Seleccionar miembro del club --</option>
                      ${members.slice(0, 40).map(m => {
                        const isSaved = m.savedEvents?.includes(nextEvent?.id);
                        return `
                          <option value="${m.id}">
                            ${m.name} (${m.id}) ${isSaved ? '⭐ [Guardó evento]' : ''}
                          </option>
                        `;
                      }).join('')}
                    </select>
                    <span class="form-helper">Miembros ficticios registrados en la base de datos de la demo.</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="checkin-event-select">
                      Evento de ${selectedVenue.name}:
                    </label>
                    <select id="checkin-event-select" class="form-select" required>
                      ${venueEvents.map(e => `
                        <option value="${e.id}">${e.title} (${e.dayLabel} - ${e.time})</option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="checkin-validator-input">
                      Personal que valida el acceso:
                    </label>
                    <input 
                      type="text" 
                      id="checkin-validator-input" 
                      class="form-input" 
                      value="${selectedVenue.manager}" 
                      readonly 
                    />
                    <span class="form-helper">Asignado automáticamente al encargado actual del local.</span>
                  </div>

                  <div class="checkin-action-area">
                    <button 
                      type="submit" 
                      class="btn btn--primary btn--lg btn-submit-checkin"
                      style="--btn-color: ${selectedVenue.accentColor};"
                    >
                      <span class="btn-checkin-icon">🎟️</span>
                      <span>Registrar Check-in en Puerta</span>
                    </button>
                    <small class="checkin-idempotency-note">
                      🔒 <strong>Prueba de Idempotencia:</strong> Pulsa el botón dos veces seguidas con el mismo miembro para comprobar el bloqueo automático de duplicados.
                    </small>
                  </div>
                </form>
              </div>
            </div>

            <!-- MÓDULO DE ATRIBUCIÓN DE ORIGEN / PROMOTORES ASIGNADOS -->
            <div class="card card--attribution">
              <div class="card__header">
                <h3 class="card-title">Atribución de Promotores de ${selectedVenue.name}</h3>
                <span class="badge badge--pill">${venuePromoters.length} asignados</span>
              </div>
              <div class="card__body">
                ${venuePromoters.length === 0 ? `
                  <p class="text-muted">No hay promotores externos asignados a ${selectedVenue.name} actualmente.</p>
                ` : `
                  <div class="venue-promoters-list">
                    ${venuePromoters.map(p => `
                      <div class="venue-promoter-row">
                        <div class="promoter-row-left">
                          <span class="promoter-row-avatar">${p.name.slice(0, 2).toUpperCase()}</span>
                          <div>
                            <strong>${p.name}</strong>
                            <div class="promoter-row-code">Código: <code>${p.code}</code> | ${p.sourceId}</div>
                          </div>
                        </div>
                        <div class="promoter-row-right">
                          <div class="promoter-stat-badge">
                            <span class="badge-num">${(p.signals || []).length}</span>
                            <span class="badge-label">señales</span>
                          </div>
                          <div class="promoter-stat-badge">
                            <span class="badge-num">${p.registeredUsers}</span>
                            <span class="badge-label">registrados</span>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN DE AGENDA: Eventos del Local con Estadísticas -->
        <section class="venue-events-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Agenda y Eventos de ${selectedVenue.name}</h2>
              <p class="section-subtitle">Gestión de convocatorias de muestra para el fin de semana del 16-17 de octubre de 2026.</p>
            </div>
            <span class="badge badge--subtle">${venueEvents.length} eventos programados</span>
          </div>

          <div class="venue-events-grid">
            ${venueEvents.map(event => {
              const capRatio = event.capacity ? Math.round(((event.checkinCount || 0) / event.capacity) * 100) : 0;
              return `
                <div class="card card--event-admin">
                  <div class="event-admin-top">
                    <div class="event-admin-meta">
                      <span class="badge badge--venue" style="color: ${selectedVenue.accentColor}; background-color: ${selectedVenue.accentColor}22;">
                        ${event.dayLabel} • ${event.time} - ${event.endTime}
                      </span>
                      <span class="badge badge--warning">Ficticio DEMO</span>
                    </div>
                    <h3 class="event-admin-title">${event.title}</h3>
                    <p class="event-admin-subtitle">${event.subtitle}</p>
                    <p class="event-admin-desc">${event.description}</p>
                  </div>

                  <div class="event-admin-metrics">
                    <div class="admin-metric-pill">
                      <span class="admin-metric-label">Guardados</span>
                      <span class="admin-metric-val">⭐ ${event.savedCount}</span>
                    </div>
                    <div class="admin-metric-pill">
                      <span class="admin-metric-label">Check-ins</span>
                      <span class="admin-metric-val" style="color: ${selectedVenue.accentColor};">🎟️ ${event.checkinCount || 0}</span>
                    </div>
                    <div class="admin-metric-pill">
                      <span class="admin-metric-label">Aforo estimado</span>
                      <span class="admin-metric-val">👥 ${event.capacity}</span>
                    </div>
                    <div class="admin-metric-pill">
                      <span class="admin-metric-label">Ocupación puerta</span>
                      <span class="admin-metric-val">${capRatio}%</span>
                    </div>
                  </div>

                  <div class="event-admin-footer">
                    <div class="event-tags-list">
                      ${(event.tags || []).map(t => `<span class="badge badge--xs badge--outline">${t}</span>`).join('')}
                    </div>
                    <div class="event-benefit-pill">
                      🎁 <strong>${event.benefit?.title}</strong>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function mount() {
    function setupInteractions() {
      // 1. Selector de Pestañas de Locales
      document.querySelectorAll('.venue-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          const venueId = e.currentTarget.dataset.venueId;
          if (venueId) {
            setCurrentVenue(venueId);
          }
        });
      });

      // 2. Formulario de Check-in en Puerta
      const form = document.getElementById('checkin-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const memberSelect = document.getElementById('checkin-member-select');
          const eventSelect = document.getElementById('checkin-event-select');
          const validatorInput = document.getElementById('checkin-validator-input');
          const feedbackContainer = document.getElementById('checkin-feedback-container');

          if (!memberSelect || !eventSelect) return;

          const memberId = memberSelect.value;
          const eventId = eventSelect.value;
          const validatedBy = validatorInput?.value || 'Sistema';

          if (!memberId || !eventId) {
            if (feedbackContainer) {
              feedbackContainer.innerHTML = `
                <div class="alert alert--warning animate-fade-in">
                  <span class="alert__icon">⚠️</span>
                  <div class="alert__body">Por favor selecciona un miembro de la lista.</div>
                </div>
              `;
            }
            return;
          }

          const state = getState();
          const member = state.members.find(m => m.id === memberId);
          const event = state.events.find(e => e.id === eventId);

          const result = checkIn(memberId, eventId, validatedBy);

          if (feedbackContainer) {
            if (result.success) {
              feedbackContainer.innerHTML = `
                <div class="alert alert--success animate-fade-in">
                  <span class="alert__icon">✓</span>
                  <div class="alert__body">
                    <strong>¡Check-in registrado con éxito!</strong>
                    <span>Asistencia validada para <strong>${member ? member.name : memberId}</strong> en <em>"${event ? event.title : eventId}"</em>. Registrado por <strong>${validatedBy}</strong> a las ${result.checkin?.time}.</span>
                  </div>
                </div>
              `;
            } else if (result.duplicate) {
              feedbackContainer.innerHTML = `
                <div class="alert alert--warning animate-fade-in" style="border-left-color: #D4A857;">
                  <span class="alert__icon">🔒</span>
                  <div class="alert__body">
                    <strong>Check-in Duplicado Bloqueado (Idempotente):</strong>
                    <span>${result.reason}</span>
                    <small style="display:block; margin-top: 4px; color: var(--text-muted, #A0988A);">
                      Regla DEMO: Un miembro no puede sumar dos asistencias al mismo evento. El aforo y el conteo no sufren alteraciones redundantes.
                    </small>
                  </div>
                </div>
              `;
            } else {
              feedbackContainer.innerHTML = `
                <div class="alert alert--danger animate-fade-in">
                  <span class="alert__icon">✕</span>
                  <div class="alert__body">
                    <strong>Error:</strong> ${result.reason}
                  </div>
                </div>
              `;
            }

            feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }
    }

    setupInteractions();

    const unsubscribe = subscribe(() => {
      const pageEl = document.querySelector('.venue-today-page');
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
