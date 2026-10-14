// Operium Club — Pantalla B: Detalle del Evento (EventDetail)
// Vista en profundidad con arte visual, pase QR de puerta (no es una entrada pagada), beneficio exclusivo y métricas

import { getState, saveEvent, unsaveEvent, followVenue, subscribe } from '../../store.js';
import { getVenue } from '../../data/venues.js';
import { icon } from '../../icons.js';
import { qrSvg, passPayload } from '../../qr.js';

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
            <div class="empty-state__icon">${icon('search', { size: 28 })}</div>
            <h2 class="empty-state__title">Evento no encontrado</h2>
            <p class="empty-state__desc">El identificador <code>${eventId || 'desconocido'}</code> no corresponde a ningún evento ficticio de la agenda.</p>
            <a href="#/discover" class="btn btn--primary btn--md">Volver a Descubrir</a>
          </div>
        </div>
      `;
    }

    const venue = venues.find(v => v.id === event.venueId) || getVenue(event.venueId) || {
      name: event.venueId,
      icon: '',
      accentColor: '#D4A857',
      schedule: 'Consulte horario',
      address: 'Piura',
      manager: 'Administración',
    };

    const isSaved = currentMember?.savedEvents?.includes(event.id);
    const isFollowed = currentMember?.following?.includes(venue.id);
    const memberName = currentMember ? currentMember.name : 'Miembro Invitado';
    const memberId = currentMember ? currentMember.id : 'M-DEMO';
    const memberSegment = currentMember ? { recurrente: 'Recurrente', nuevo: 'Nuevo', sin_interaccion: 'Sin actividad' }[currentMember.segment] : 'Nuevo';
    const checkin = currentMember?.checkins?.find(c => c.eventId === event.id);

    return `
      <div class="event-detail animate-fade-in">
        <a href="#/discover" class="event-detail__back" id="btn-back-discover">
          ${icon('left', { size: 16 })} Agenda
        </a>

        <div class="event-detail__hero">
          <img 
            src="${event.image}" 
            alt="${event.title}" 
            class="event-detail__hero-img"
            style="--img-zoom: ${event.imageZoom || 1.04}; object-position: ${event.imagePosition || 'center'};"
            onerror="this.onerror=null; this.src='/images/hero_principal.png';"
          />
          <div class="event-detail__hero-overlay"></div>
          <div class="event-detail__hero-meta">
            <div class="event-detail__kicker">
              <span>${venue.icon}${venue.name}</span>
              <span>${event.dayLabel} · ${event.time}</span>
            </div>
            <h1 class="event-detail__title">${event.title}</h1>
            <p class="event-detail__subtitle">${event.subtitle}</p>
          </div>
        </div>

        <div class="event-detail__layout">
          <div class="event-detail__main">
            <div class="event-actions-bar">
              <button 
                type="button" 
                class="btn btn--lg ${isSaved ? 'btn--secondary' : 'btn--primary'} btn-toggle-save" 
                id="btn-detail-save"
                data-event-id="${event.id}"
              >
                ${icon(isSaved ? 'check' : 'heart', { size: 18 })}
                <span class="btn-save-text">${isSaved ? 'Guardado en Mi Club' : 'Guardar en Mi Club'}</span>
              </button>
              <button 
                type="button" 
                class="btn btn--lg btn--secondary btn-toggle-follow" 
                id="btn-detail-follow"
                data-venue-id="${venue.id}"
                ${isFollowed ? 'disabled' : ''}
              >
                ${isFollowed ? `${icon('check', { size: 16 })} Sigues a ${venue.name}` : `Seguir a ${venue.name}`}
              </button>
            </div>

            <section class="event-detail__block">
              <h2 class="event-detail__section-title">Sobre esta noche</h2>
              <p class="event-detail__description">${event.description}</p>
              <div class="event-detail__tags">
                ${(event.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
              </div>
            </section>

            ${event.benefit ? `
              <section class="event-detail__block benefit-card">
                <span class="section-title__eyebrow">Beneficio para miembros</span>
                <h3 class="benefit-card__title">${event.benefit.title}</h3>
                <p class="benefit-card__description">${event.benefit.description}</p>
                <dl class="event-detail__facts">
                  <div><dt>Quién</dt><dd>${event.benefit.eligibility}</dd></div>
                  <div><dt>Condiciones</dt><dd>${event.benefit.conditions}</dd></div>
                </dl>
              </section>
            ` : ''}

            ${event.video ? `
              <section class="event-detail__block">
                <h2 class="event-detail__section-title">El local en video</h2>
                <video 
                  class="event-detail__video"
                  src="${event.video}" 
                  controls 
                  playsinline
                  poster="${event.image}"
                ></video>
              </section>
            ` : ''}

            <section class="event-detail__block event-detail__venue-info">
              <span class="section-title__eyebrow">El local</span>
              <h3 class="event-detail__venue-name">${venue.name}</h3>
              <p class="event-detail__venue-meta">${venue.description}</p>
              <dl class="event-detail__facts">
                <div><dt>Dirección</dt><dd>${venue.address}</dd></div>
                <div><dt>Horario</dt><dd>${venue.schedule}</dd></div>
                <div><dt>Aforo</dt><dd>${venue.capacity} personas</dd></div>
                ${venue.instagram ? `<div><dt>Instagram</dt><dd><a href="${event.reelUrl || venue.reelUrl || `https://instagram.com/${venue.instagram.replace('@', '')}`}" target="_blank" rel="noopener noreferrer">${venue.instagram} ${icon('external', { size: 13 })}</a></dd></div>` : ''}
              </dl>
            </section>
          </div>

          <aside class="event-detail__sidebar">
            <div class="pass-card ${isSaved ? '' : 'pass-card--locked'}">
              <div class="pass-card__header">
                <span class="pass-card__brand">Operium Club</span>
                <span class="pass-card__type">Pase de puerta</span>
              </div>
              <div class="pass-card__member-info">
                <div class="pass-card__member-name">${memberName}</div>
                <div class="pass-card__member-id">${currentMember?.dniLast4 ? `DNI ••••${currentMember.dniLast4}` : memberId} · ${memberSegment}</div>
              </div>
              <div class="pass-card__event">
                <div class="pass-card__event-title">${event.title}</div>
                <div class="pass-card__event-meta">${venue.name} · ${event.dayLabel} · ${event.time}–${event.endTime || 'cierre'}</div>
              </div>
              ${!isSaved ? `
                <div class="pass-card__qr pass-card__qr--locked">
                  ${icon('lock', { size: 22 })}
                  <span>Guarda el evento para activar tu QR</span>
                </div>
              ` : checkin ? `
                <div class="pass-card__qr pass-card__qr--used">
                  ${qrSvg(passPayload(memberId, event.id), { size: 148, label: 'Pase QR ya usado' })}
                  <span class="pass-card__stamp">${icon('check', { size: 16 })} Ya ingresaste</span>
                </div>
              ` : `
                <div class="pass-card__qr">
                  ${qrSvg(passPayload(memberId, event.id), { size: 148, label: `Pase QR para ${event.title}` })}
                </div>
              `}
              <div class="pass-card__disclaimer">
                Muéstralo en la puerta. Vale para una persona y una noche; el acceso depende del aforo.
              </div>
            </div>

            <div class="event-detail__stats">
              <div>
                <span class="metric-card__label">Guardados</span>
                <span class="metric-card__value" id="detail-saved-count">${event.savedCount || 0}</span>
              </div>
              <div>
                <span class="metric-card__label">Aforo</span>
                <span class="metric-card__value">${event.capacity || 0}</span>
              </div>
              <p>Guardar suma interés. La asistencia solo cuenta tras el check-in en puerta.</p>
            </div>
          </aside>
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
