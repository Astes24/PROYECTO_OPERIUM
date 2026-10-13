// Operium Club — Pantalla C: Panel de Promotores
// Desktop-first, atribución de origen y señales de interés sin liquidar comisiones

import { getState, subscribe, simulatePromoterSignal } from '../../store.js';
import { getVenue } from '../../data/venues.js';

export default function Promoters() {
  function render() {
    const state = getState();
    const { promoters, members, events } = state;

    return `
      <div class="panel-page promoters-page">
        <!-- Encabezado de Página -->
        <header class="panel-page__header">
          <div class="panel-page__title-group">
            <div class="panel-page__badge-row">
              <span class="badge badge--gold">Pantalla C — Panel de Negocio</span>
              <span class="badge badge--outline">Atribución de Origen</span>
              <span class="badge badge--warning">DATOS FICTICIOS — DEMO</span>
            </div>
            <h1 class="panel-page__title">Promotores</h1>
            <p class="panel-page__subtitle">
              Atribución de origen y señales de interés sin liquidación de comisiones. Medición transparente de captación previa para entender de dónde llega el público a cada local.
            </p>
          </div>
          <div class="panel-page__stats-pill">
            <div class="stat-pill">
              <span class="stat-pill__label">Promotores activos</span>
              <span class="stat-pill__value">${promoters.length}</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill__label">Señales totales</span>
              <span class="stat-pill__value">${promoters.reduce((acc, p) => acc + (p.signals?.length || p.signalCount || 0), 0)}</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill__label">Usuarios atribuidos</span>
              <span class="stat-pill__value">${promoters.reduce((acc, p) => acc + new Set((p.signals || []).map(s => s.memberId)).size, 0)}</span>
            </div>
          </div>
        </header>

        <!-- Regla de Negocio Informativa -->
        <div class="panel-callout panel-callout--info">
          <div class="panel-callout__icon">ℹ️</div>
          <div class="panel-callout__content">
            <strong>Regla de Atribución y Privacidad:</strong>
            Cada promotor cuenta con un identificador único (<code>source_id</code>). Una interacción registra únicamente una señal de interés verificable (clic/visita). 
            <strong>No se atribuye el mismo evento dos veces al mismo usuario</strong> y no se liquidan comisiones comerciales en esta fase de demostración.
          </div>
        </div>

        <!-- Feedback Dinámico de Simulación -->
        <div id="promoter-feedback-container" class="promoter-feedback-container"></div>

        <!-- Cuadrícula de Promotores -->
        <div class="promoters-grid">
          ${promoters.map(promoter => {
            const venue = getVenue(promoter.venue) || { name: promoter.venue, accentColor: '#D4A857', icon: '📍' };
            const promoterEvents = events.filter(e => e.venueId === promoter.venue);
            const signalsList = promoter.signals || [];

            return `
              <section class="card card--promoter" style="--venue-color: ${venue.accentColor};" data-promoter-id="${promoter.id}">
                <!-- Cabecera de la Tarjeta del Promotor -->
                <div class="card__header card__header--venue">
                  <div class="promoter-header-info">
                    <div class="promoter-avatar" style="border-color: ${venue.accentColor};">
                      <span class="promoter-avatar__initials">${promoter.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <div class="promoter-name-row">
                        <h2 class="promoter-name">${promoter.name}</h2>
                        <span class="badge badge--venue" style="background-color: ${venue.accentColor}22; color: ${venue.accentColor}; border: 1px solid ${venue.accentColor}55;">
                          ${venue.icon} ${venue.name}
                        </span>
                      </div>
                      <p class="promoter-source-code">
                        <span>Código: <strong>${promoter.code}</strong></span>
                        <span class="divider-dot">•</span>
                        <span>Source ID: <code>${promoter.sourceId}</code></span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="card__body">
                  <!-- Biografía -->
                  <p class="promoter-bio">${promoter.bio}</p>

                  <!-- Métricas Clave del Promotor -->
                  <div class="metrics-row">
                    <div class="metric-card">
                      <span class="metric-card__label">Señales captadas</span>
                      <span class="metric-card__value" id="signal-count-${promoter.id}" style="color: ${venue.accentColor};">
                        ${signalsList.length}
                      </span>
                      <span class="metric-card__sub">Clics de enlace validados</span>
                    </div>
                    <div class="metric-card">
                      <span class="metric-card__label">Usuarios registrados</span>
                      <span class="metric-card__value">
                        ${new Set((promoter.signals || []).map(s => s.memberId)).size}
                      </span>
                      <span class="metric-card__sub">Miembros vinculados</span>
                    </div>
                  </div>

                  <!-- Enlace Personalizado Copiable -->
                  <div class="form-group promoter-link-group">
                    <label class="form-label" for="link-${promoter.id}">Enlace exclusivo de origen:</label>
                    <div class="copy-input-group">
                      <input 
                        type="text" 
                        id="link-${promoter.id}" 
                        class="form-input form-input--code" 
                        value="${promoter.link}" 
                        readonly 
                      />
                      <button 
                        type="button" 
                        class="btn btn--outline btn-copy-link" 
                        data-link="${promoter.link}"
                        title="Copiar enlace al portapapeles"
                      >
                        <span class="btn-copy-icon">📋</span>
                        <span class="btn-copy-text">Copiar</span>
                      </button>
                    </div>
                    <span class="form-helper">Comparte este enlace para atribuir tráfico y señales a este promotor.</span>
                  </div>

                  <!-- Simulación de Interacción -->
                  <div class="simulation-box">
                    <div class="simulation-box__header">
                      <span class="simulation-box__title">⚡ Simular visita desde enlace (DEMO)</span>
                      <span class="badge badge--subtle">Generador de señal</span>
                    </div>
                    <p class="simulation-box__desc">
                      Simula la acción de un usuario abriendo la agenda con el enlace de este promotor.
                    </p>

                    <div class="simulation-form-row">
                      <div class="form-group">
                        <label class="form-label" for="member-select-${promoter.id}">Seleccionar miembro:</label>
                        <select id="member-select-${promoter.id}" class="form-select">
                          ${members.slice(0, 30).map(m => `
                            <option value="${m.id}">
                              ${m.name} (${m.id}) — [${m.segment}]
                            </option>
                          `).join('')}
                        </select>
                      </div>

                      <div class="form-group">
                        <label class="form-label" for="event-select-${promoter.id}">Evento de ${venue.name}:</label>
                        <select id="event-select-${promoter.id}" class="form-select">
                          ${promoterEvents.map(e => `
                            <option value="${e.id}">${e.title} (${e.dayLabel})</option>
                          `).join('')}
                        </select>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      class="btn btn--primary btn--simulate-signal" 
                      data-promoter-id="${promoter.id}"
                      style="--btn-color: ${venue.accentColor};"
                    >
                      <span>Simular interacción de origen</span>
                      <span class="btn-icon">➔</span>
                    </button>
                  </div>

                  <!-- Historial de Señales Recientes -->
                  <div class="signals-timeline-section">
                    <div class="signals-timeline-section__header">
                      <h3 class="signals-timeline-section__title">Línea de tiempo de señales recientes</h3>
                      <span class="badge badge--pill">${signalsList.length} registradas</span>
                    </div>

                    <div class="timeline" id="timeline-${promoter.id}">
                      ${signalsList.length === 0 ? `
                        <div class="timeline__empty">No se han registrado señales para este promotor aún.</div>
                      ` : `
                        <div class="timeline__list">
                          ${signalsList.slice(-6).reverse().map(signal => {
                            const member = members.find(m => m.id === signal.memberId);
                            const memberName = member ? member.name : signal.memberId;
                            const event = events.find(e => e.id === signal.eventId);
                            const eventTitle = event ? event.title : signal.eventId;

                            return `
                              <div class="timeline__item">
                                <div class="timeline__marker" style="background-color: ${venue.accentColor};"></div>
                                <div class="timeline__content">
                                  <div class="timeline__meta">
                                    <span class="timeline__date">${signal.date || '2026-10-16'}</span>
                                    <span class="badge badge--xs badge--subtle">
                                      ${signal.type === 'link_click' ? '🔗 Clic en enlace' : signal.type}
                                    </span>
                                  </div>
                                  <div class="timeline__title">
                                    <strong>${memberName}</strong> exploró <em>${eventTitle}</em>
                                  </div>
                                  <div class="timeline__source">
                                    Origen: <code>${signal.sourceId || promoter.sourceId}</code>
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
              </section>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function mount() {
    function setupInteractions() {
      // 1. Botones de copiar enlace
      document.querySelectorAll('.btn-copy-link').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const button = e.currentTarget;
          const link = button.dataset.link;
          const textSpan = button.querySelector('.btn-copy-text');
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(link);
            } else {
              const input = button.closest('.copy-input-group').querySelector('input');
              input.select();
              document.execCommand('copy');
            }
            if (textSpan) textSpan.textContent = '¡Copiado! ✓';
            button.classList.add('btn--success');
            setTimeout(() => {
              if (textSpan) textSpan.textContent = 'Copiar';
              button.classList.remove('btn--success');
            }, 2000);
          } catch (err) {
            console.error('Error al copiar:', err);
          }
        });
      });

      // 2. Botones de simulación de interacción
      document.querySelectorAll('.btn--simulate-signal').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const button = e.currentTarget;
          const promoterId = button.dataset.promoterId;
          const memberSelect = document.getElementById(`member-select-${promoterId}`);
          const eventSelect = document.getElementById(`event-select-${promoterId}`);
          const feedbackContainer = document.getElementById('promoter-feedback-container');

          if (!memberSelect || !eventSelect) return;

          const memberId = memberSelect.value;
          const eventId = eventSelect.value;

          const state = getState();
          const member = state.members.find(m => m.id === memberId);
          const promoter = state.promoters.find(p => p.id === promoterId);
          const event = state.events.find(e => e.id === eventId);

          const result = simulatePromoterSignal(promoterId, memberId, eventId);

          if (feedbackContainer) {
            if (result) {
              feedbackContainer.innerHTML = `
                <div class="alert alert--success animate-fade-in">
                  <span class="alert__icon">✓</span>
                  <div class="alert__body">
                    <strong>¡Señal registrada con éxito!</strong>
                    <span>Se atribuyó la visita de <strong>${member ? member.name : memberId}</strong> al evento <em>"${event ? event.title : eventId}"</em> bajo el promotor <strong>${promoter ? promoter.name : promoterId}</strong> (${promoter?.sourceId}).</span>
                  </div>
                </div>
              `;
            } else {
              feedbackContainer.innerHTML = `
                <div class="alert alert--warning animate-fade-in">
                  <span class="alert__icon">⚠️</span>
                  <div class="alert__body">
                    <strong>Atribución duplicada omitida:</strong>
                    <span>El miembro <strong>${member ? member.name : memberId}</strong> ya cuenta con una señal previa para <em>"${event ? event.title : eventId}"</em> con este promotor. Regla DEMO: no doble atribución.</span>
                  </div>
                </div>
              `;
            }

            feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setTimeout(() => {
              if (feedbackContainer) {
                const alertEl = feedbackContainer.querySelector('.alert');
                if (alertEl) {
                  alertEl.style.opacity = '0';
                  setTimeout(() => { feedbackContainer.innerHTML = ''; }, 400);
                }
              }
            }, 6000);
          }
        });
      });
    }

    setupInteractions();

    // Suscripción al store para re-renderizar ante cambios externos (p. ej. simulateWeekend)
    const unsubscribe = subscribe(() => {
      const pageEl = document.querySelector('.promoters-page');
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
