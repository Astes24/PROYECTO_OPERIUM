// Operium Club — Pantalla B: Detalle del Evento (EventDetail)
// Vista en profundidad con arte visual, pase ilustrativo (NO entrada), beneficio exclusivo y métricas

import { getState, saveEvent, unsaveEvent, followVenue, subscribe } from '../../store.js';
import { getVenue } from '../../data/venues.js';

export default function EventDetail(params = {}) {
  // Parsear el ID del evento desde params o hash
  const hashParts = window.location.hash.split('/');
  const eventId = params?.id || hashParts[2];

  function render() {
    const state = getState();
    const { events, venues, members, currentMemberId } = state;
    const currentMember = members.find(m => m.id === currentMemberId);

    const event = events.find(e => e.id === eventId);
    if (!event) {
      return `
        <div class="container" style="padding: var(--space-3xl) var(--space-md); text-align: center;">
          <div class="empty-state animate-fade-in" style="max-width: 500px; margin: 0 auto;">
            <div class="empty-state__icon">🔍</div>
            <h2 class="empty-state__title">Evento no encontrado</h2>
            <p class="empty-state__desc">El identificador <code>${eventId || 'desconocido'}</code> no corresponde a ningún evento ficticio de la agenda.</p>
            <a href="#/discover" class="btn btn--primary btn--md">Volver a Descubrir</a>
          </div>
        </div>
      `;
    }

    const venue = venues.find(v => v.id === event.venueId) || getVenue(event.venueId) || {
      name: event.venueId,
      icon: '📍',
      accentColor: '#D4A857',
      schedule: 'Consulte horario',
      address: 'Miraflores, Lima',
      manager: 'Administración',
    };

    const isSaved = currentMember?.savedEvents?.includes(event.id);
    const isFollowed = currentMember?.following?.includes(venue.id);
    const memberName = currentMember ? currentMember.name : 'Miembro Invitado';
    const memberId = currentMember ? currentMember.id : 'M-DEMO';
    const memberSegment = currentMember ? currentMember.segment : 'nuevo';

    return `
      <div class="event-detail animate-fade-in">
        <!-- Botón Volver -->
        <a href="#/discover" class="event-detail__back" id="btn-back-discover">
          <span>←</span>
          <span>Volver a la agenda</span>
        </a>

        <!-- Hero Visual con Imagen a Pantalla Completa -->
        <div class="event-detail__hero" style="border-color: ${venue.accentColor}44;">
          <img 
            src="${event.image}" 
            alt="${event.title}" 
            class="event-detail__hero-img"
            onerror="this.onerror=null; this.src='/images/hero_principal.png';"
          />
          <div class="event-detail__hero-overlay"></div>

          <div class="event-detail__hero-meta">
            <div>
              <div style="display: flex; gap: var(--space-xs); margin-bottom: var(--space-xs); align-items: center; flex-wrap: wrap;">
                <span 
                  class="badge badge--venue" 
                  style="background-color: ${venue.accentColor}33; color: ${venue.accentColor}; border: 1px solid ${venue.accentColor}88;"
                >
                  <span>${venue.icon}</span>
                  <span>${venue.name}</span>
                </span>
                <span class="badge badge--accent">
                  📅 ${event.dayLabel} · ${event.time} hrs
                </span>
              </div>
              <h1 class="event-detail__title">${event.title}</h1>
              <p class="event-detail__subtitle">${event.subtitle}</p>
            </div>
          </div>
        </div>

        <!-- Banner de Demostración Obligatorio -->
        <div class="event-detail__disclaimer-box">
          <div class="event-detail__disclaimer-icon">⚠️</div>
          <div class="event-detail__disclaimer-text">
            <strong>Evento ficticio para demostración</strong> • Todos los datos de este evento, aforo y beneficios son simulados con fines de presentación para los 4 locales del grupo (Señor Perú, Mood, Adriá y Play). No representa venta comercial ni reserva de entradas.
          </div>
        </div>

        <!-- Contenedor de Contenido Principal -->
        <div class="event-detail__layout">
          <!-- Columna Izquierda: Información, Beneficios y Local -->
          <div class="event-detail__main">
            <!-- Tags de la Experiencia -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: var(--space-md);">
              ${(event.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
            </div>

            <!-- Botones de Acción Rápida -->
            <div class="event-actions-bar" style="display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-xl);">
              <!-- Botón Guardar -->
              <button 
                type="button" 
                class="btn btn--lg ${isSaved ? 'btn--primary' : 'btn--secondary'} btn-toggle-save" 
                id="btn-detail-save"
                data-event-id="${event.id}"
                style="flex: 1; min-width: 200px;"
              >
                <span class="btn-heart-icon" style="font-size: 1.25rem;">${isSaved ? '❤️' : '🤍'}</span>
                <span class="btn-save-text">${isSaved ? 'Guardado en Mi Club' : 'Guardar en Mi Club'}</span>
              </button>

              <!-- Botón Seguir Local -->
              <button 
                type="button" 
                class="btn btn--lg ${isFollowed ? 'btn--secondary' : 'btn--secondary'} btn-toggle-follow" 
                id="btn-detail-follow"
                data-venue-id="${venue.id}"
                style="border-color: ${venue.accentColor}66; color: ${isFollowed ? 'var(--color-text-muted)' : venue.accentColor};"
              >
                <span>${isFollowed ? '✓ Siguiendo a' : '+ Seguir a'}</span>
                <strong>${venue.name}</strong>
              </button>
            </div>

            <!-- Descripción de la Experiencia -->
            <div style="margin-bottom: var(--space-xl);">
              <h2 class="event-detail__section-title">Sobre esta noche</h2>
              <p class="event-detail__description">${event.description}</p>
            </div>

            <!-- Tarjeta de Beneficio Exclusivo del Club -->
            ${event.benefit ? `
              <div class="benefit-card">
                <div class="benefit-card__badge">
                  <span>🎁</span>
                  <span>Beneficio Exclusivo del Club</span>
                </div>
                <h3 class="benefit-card__title">${event.benefit.title}</h3>
                <p class="benefit-card__description">${event.benefit.description}</p>
                
                <div class="benefit-card__eligibility">
                  <span>🎯</span>
                  <div>
                    <strong>Elegibilidad:</strong> ${event.benefit.eligibility}
                  </div>
                </div>

                <div class="benefit-card__conditions">
                  <strong>Condiciones:</strong> ${event.benefit.conditions}
                </div>
              </div>
            ` : ''}

            <!-- Ficha del Local -->
            <div class="event-detail__venue-info" style="border-left: 3px solid ${venue.accentColor};">
              <div class="event-detail__venue-header">
                <div class="event-detail__venue-icon">${venue.icon}</div>
                <div>
                  <h3 class="event-detail__venue-name">${venue.name}</h3>
                  <p class="event-detail__venue-meta">${venue.tagline || venue.category}</p>
                </div>
              </div>
              <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-md);">
                ${venue.description}
              </p>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-sm); font-size: var(--font-size-xs); color: var(--color-text-dim);">
                <div>📍 <strong>Ubicación:</strong> ${venue.address}</div>
                <div>🕒 <strong>Horario:</strong> ${venue.schedule}</div>
                <div>👤 <strong>Responsable:</strong> ${venue.manager}</div>
                <div>👥 <strong>Aforo local:</strong> ${venue.capacity} personas</div>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Pase Ilustrativo y Métricas de Demostración -->
          <div class="event-detail__sidebar">
            <!-- PASE ILUSTRATIVO (Ticket-like design con marca de agua obligatoria) -->
            <div class="pass-card" style="border-color: ${venue.accentColor}88;">
              <!-- Marca de agua prominente -->
              <div style="background: rgba(212, 168, 87, 0.15); border: 1px dashed var(--color-accent); border-radius: var(--radius-sm); padding: 4px 8px; text-align: center; margin-bottom: var(--space-md); font-family: var(--font-display); font-size: 0.6875rem; font-weight: 800; letter-spacing: 0.12em; color: var(--color-accent); text-transform: uppercase;">
                PASE ILUSTRATIVO — DEMO
              </div>

              <div class="pass-card__header">
                <span class="pass-card__brand">OPERIUM CLUB</span>
                <span class="pass-card__type" style="background-color: ${venue.accentColor}22; color: ${venue.accentColor}; border-color: ${venue.accentColor}44;">
                  ${venue.icon} ${venue.name}
                </span>
              </div>

              <!-- Información del Miembro -->
              <div class="pass-card__member-info">
                <div style="font-size: var(--font-size-2xs); text-transform: uppercase; letter-spacing: var(--letter-spacing-wider); color: var(--color-text-dim);">
                  Titular del Pase:
                </div>
                <div class="pass-card__member-name">${memberName}</div>
                <div class="pass-card__member-id">
                  <span>ID: <code>${memberId}</code></span>
                  <span style="margin: 0 4px;">•</span>
                  <span style="text-transform: capitalize;">Perfil: ${memberSegment}</span>
                </div>
              </div>

              <!-- Detalle del Evento en el Pase -->
              <div style="padding: var(--space-sm) 0; border-top: 1px solid var(--color-border-subtle); border-bottom: 1px solid var(--color-border-subtle); margin-bottom: var(--space-md);">
                <div style="font-family: var(--font-display); font-weight: 700; font-size: var(--font-size-md); color: var(--color-text); margin-bottom: 2px;">
                  ${event.title}
                </div>
                <div style="font-size: var(--font-size-xs); color: var(--color-accent);">
                  📅 ${event.dayLabel} · 🕒 ${event.time} a ${event.endTime || 'cierre'}
                </div>
              </div>

              <!-- QR Simulado Estilizado -->
              <div class="pass-card__qr-simulation" title="Código QR Ilustrativo para Demostración">
                <svg viewBox="0 0 100 100" width="100%" height="100%" shape-rendering="crispEdges">
                  <rect width="100" height="100" fill="#FAF3E8" />
                  <!-- QR Finder Pattern Top-Left -->
                  <rect x="10" y="10" width="24" height="24" fill="#0D0D0D" />
                  <rect x="14" y="14" width="16" height="16" fill="#FAF3E8" />
                  <rect x="18" y="18" width="8" height="8" fill="#0D0D0D" />
                  <!-- QR Finder Pattern Top-Right -->
                  <rect x="66" y="10" width="24" height="24" fill="#0D0D0D" />
                  <rect x="70" y="14" width="16" height="16" fill="#FAF3E8" />
                  <rect x="74" y="18" width="8" height="8" fill="#0D0D0D" />
                  <!-- QR Finder Pattern Bottom-Left -->
                  <rect x="10" y="66" width="24" height="24" fill="#0D0D0D" />
                  <rect x="14" y="70" width="16" height="16" fill="#FAF3E8" />
                  <rect x="18" y="74" width="8" height="8" fill="#0D0D0D" />
                  <!-- Mock Matrix Bits -->
                  <rect x="38" y="14" width="6" height="6" fill="#0D0D0D" />
                  <rect x="48" y="10" width="6" height="6" fill="#0D0D0D" />
                  <rect x="40" y="28" width="8" height="6" fill="#0D0D0D" />
                  <rect x="52" y="24" width="6" height="8" fill="#0D0D0D" />
                  <rect x="14" y="42" width="6" height="6" fill="#0D0D0D" />
                  <rect x="28" y="42" width="8" height="6" fill="#0D0D0D" />
                  <rect x="42" y="42" width="16" height="16" fill="#0D0D0D" />
                  <rect x="46" y="46" width="8" height="8" fill="#FAF3E8" />
                  <rect x="66" y="42" width="6" height="12" fill="#0D0D0D" />
                  <rect x="78" y="46" width="12" height="6" fill="#0D0D0D" />
                  <rect x="38" y="66" width="8" height="6" fill="#0D0D0D" />
                  <rect x="52" y="66" width="6" height="12" fill="#0D0D0D" />
                  <rect x="66" y="66" width="12" height="6" fill="#0D0D0D" />
                  <rect x="42" y="82" width="8" height="8" fill="#0D0D0D" />
                  <rect x="58" y="80" width="8" height="8" fill="#0D0D0D" />
                  <rect x="74" y="78" width="14" height="12" fill="#0D0D0D" />
                </svg>
              </div>

              <!-- Microcopy de Advertencia del Pase -->
              <div class="pass-card__disclaimer">
                No es una entrada comercial ni garantiza acceso en puerta. Demostración de credencial digital del club.
              </div>
            </div>

            <!-- Métricas y Reglas de Demostración -->
            <div class="card card--accent" style="margin-bottom: var(--space-xl);">
              <h4 style="font-family: var(--font-display); font-size: var(--font-size-sm); text-transform: uppercase; letter-spacing: var(--letter-spacing-wider); color: var(--color-accent); margin-bottom: var(--space-md);">
                Métricas del Evento (DEMO)
              </h4>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md);">
                <div class="metric-card" style="padding: var(--space-md);">
                  <span class="metric-card__label">Interés previo</span>
                  <span class="metric-card__value" id="detail-saved-count" style="color: var(--color-accent);">
                    ${event.savedCount || 0}
                  </span>
                  <span class="metric-card__helper">Guardados en club</span>
                </div>

                <div class="metric-card" style="padding: var(--space-md);">
                  <span class="metric-card__label">Aforo proyectado</span>
                  <span class="metric-card__value">
                    ${event.capacity || 0}
                  </span>
                  <span class="metric-card__helper">Capacidad máxima</span>
                </div>
              </div>

              <div style="background-color: var(--color-surface-elevated); border-radius: var(--radius-md); padding: var(--space-sm); font-size: var(--font-size-2xs); color: var(--color-text-dim); line-height: var(--line-height-relaxed);">
                <strong>Regla de negocio:</strong> Guardar este evento incrementa el interés previo de la audiencia, pero no contabiliza como asistencia en puerta ni garantiza recaudación en caja sin validación presencial.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mount() {
    function setupEventListeners() {
      // 1. Botón Volver
      const backBtn = document.getElementById('btn-back-discover');
      if (backBtn) {
        backBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.hash = '#/discover';
        });
      }

      // 2. Botón Guardar / Desguardar
      const saveBtn = document.getElementById('btn-detail-save');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const state = getState();
          const memberId = state.currentMemberId;
          const member = state.members.find(m => m.id === memberId);
          if (!member) return;

          const isSaved = member.savedEvents.includes(eventId);
          if (isSaved) {
            unsaveEvent(memberId, eventId);
          } else {
            saveEvent(memberId, eventId);
          }
          // El store invocará notify()
        });
      }

      // 3. Botón Seguir Local
      const followBtn = document.getElementById('btn-detail-follow');
      if (followBtn) {
        followBtn.addEventListener('click', () => {
          const state = getState();
          const venueId = followBtn.dataset.venueId;
          const memberId = state.currentMemberId;
          const member = state.members.find(m => m.id === memberId);
          if (!member || !venueId) return;

          if (!member.following.includes(venueId)) {
            followVenue(memberId, venueId);
          }
        });
      }
    }

    setupEventListeners();

    // Suscripción al store reactivo para actualizar estado
    const unsubscribe = subscribe(() => {
      const detailContainer = document.querySelector('.event-detail');
      if (detailContainer && detailContainer.parentElement) {
        detailContainer.parentElement.innerHTML = render();
        setupEventListeners();
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
