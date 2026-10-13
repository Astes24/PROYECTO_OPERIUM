// Operium Club — Pantalla A: Descubrir (Discover)
// Experiencia pública mobile-first para el Club de Entretenimiento
// Permite explorar eventos de los 4 locales, filtrar por local y fecha, y guardar interés

import { getState, saveEvent, unsaveEvent, subscribe } from '../../store.js';
import { getVenue, VENUES } from '../../data/venues.js';
import { icon } from '../../icons.js';

export default function Discover() {
  // Estado local para los filtros de navegación
  let currentVenueFilter = 'all';
  let currentDateFilter = 'all';

  function renderEventsGrid() {
    const state = getState();
    const { events, currentMemberId, members } = state;
    const currentMember = members.find(m => m.id === currentMemberId);
    const savedEventIds = new Set(currentMember?.savedEvents || []);

    // Filtrar eventos por local y fecha
    const filteredEvents = events.filter(event => {
      const matchVenue = currentVenueFilter === 'all' || event.venueId === currentVenueFilter;
      const matchDate = currentDateFilter === 'all' || event.date === currentDateFilter;
      return matchVenue && matchDate;
    });

    if (filteredEvents.length === 0) {
      return `
        <div class="empty-state animate-fade-in" style="grid-column: 1 / -1; margin: var(--space-xl) auto; max-width: 500px;">
          <div class="empty-state__icon">${icon('search', { size: 28 })}</div>
          <h3 class="empty-state__title">Nada para esta combinación</h3>
          <p class="empty-state__desc">Prueba con otro local u otra fecha.</p>
          <button type="button" class="btn btn--secondary btn--sm btn-reset-filters">
            Mostrar todos los eventos
          </button>
        </div>
      `;
    }

    return filteredEvents.map(event => {
      const venue = getVenue(event.venueId) || {
        name: event.venueId,
        icon: '',
        accentColor: '#D4A857',
      };
      const isSaved = savedEventIds.has(event.id);

      return `
        <article 
          class="event-card ${isSaved ? 'event-card--saved' : ''}" 
          data-venue="${event.venueId}" 
          style="--venue-accent: ${venue.accentColor};"
        >
          <a href="#/event/${event.id}" class="event-card__image-wrap" tabindex="-1" aria-hidden="true">
            <img 
              src="${event.image}" 
              alt="" 
              class="event-card__image" 
              style="--img-zoom: ${event.imageZoom || 1.04}; object-position: ${event.imagePosition || 'center'};"
              loading="lazy"
              onerror="this.onerror=null; this.src='/images/hero_principal.png';"
            />
            <div class="event-card__image-overlay"></div>
            <div class="event-card__badges">
              <span class="event-card__venue">${venue.icon}${venue.name}</span>
            </div>
          </a>

          <div class="event-card__content">
            <div class="event-card__date">${event.dayLabel} · ${event.time}</div>
            <h3 class="event-card__title">
              <a href="#/event/${event.id}" class="event-card__title-link">${event.title}</a>
            </h3>
            <p class="event-card__subtitle">${event.subtitle}</p>
            <p class="event-card__saved-count"><span class="save-count-num">${event.savedCount || 0}</span> personas lo guardaron</p>

            <div class="event-card__footer">
              <button 
                type="button" 
                class="btn btn--sm ${isSaved ? 'btn--saved' : 'btn--secondary'} event-card__save-btn" 
                data-event-id="${event.id}" 
                aria-pressed="${isSaved}"
              >
                ${icon(isSaved ? 'check' : 'heart', { size: 15 })}
                <span>${isSaved ? 'Guardado' : 'Guardar'}</span>
              </button>
              <a href="#/event/${event.id}" class="event-card__cta">
                Ver evento ${icon('right', { size: 14 })}
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function render() {
    const state = getState();
    const currentMember = state.members.find(m => m.id === state.currentMemberId);
    const savedCountTotal = currentMember?.savedEvents?.length || 0;

    return `
      <div class="discover-page animate-fade-in">
        <!-- Hero Section -->
        <section class="club-hero">
          <video 
            class="club-hero__bg" 
            autoplay 
            muted 
            loop 
            playsinline 
            webkit-playsinline 
            preload="auto" 
            poster="/images/hero_principal.png"
            id="club-hero-ambient-video"
          >
            <source src="/videos/hero_ambient_slow.mp4" type="video/mp4" />
          </video>
          <div class="club-hero__overlay"></div>

          <div class="club-hero__content">
            <div class="club-hero__eyebrow">Operium Club · Piura · 16 y 17 de octubre</div>

            <h1 class="club-hero__title">Este fin de semana</h1>

            <p class="club-hero__subtitle">
              Cuatro locales, una sola agenda: Señor Perú, Mood, Adriá y Play.
            </p>

            <div class="club-hero__actions">
              <button type="button" class="btn btn--primary btn--md" id="btn-hero-agenda">
                Ver la agenda ${icon('right', { size: 16 })}
              </button>
              <a href="#/myclub" class="btn btn--secondary btn--md">
                Mi Club${savedCountTotal ? ` · ${savedCountTotal} ${savedCountTotal === 1 ? 'guardado' : 'guardados'}` : ''}
              </a>
            </div>
          </div>
        </section>

        <!-- Contenedor Principal de Contenido -->
        <div class="container" style="padding-top: var(--space-xl);">
          <div class="section-header" id="discover-agenda">
            <div class="section-title">
              <span class="section-title__eyebrow">Agenda</span>
              <h2 class="section-title__heading">Qué pasa este fin de semana</h2>
            </div>
            <p class="discover-note">Guardar un evento es una señal de interés. No es asistencia ni venta.</p>
          </div>

          <div class="discover-filters">
            <div class="venue-filters" id="venue-filter-bar">
              <button 
                type="button" 
                class="chip ${currentVenueFilter === 'all' ? 'chip--active' : ''}" 
                data-venue="all"
              >Todos</button>
              ${VENUES.map(v => `
                <button 
                  type="button" 
                  class="chip ${currentVenueFilter === v.id ? 'chip--active' : ''}" 
                  data-venue="${v.id}"
                >${v.icon}${v.name}</button>
              `).join('')}
            </div>
            <span class="discover-filters__sep" aria-hidden="true"></span>
            <div class="date-filters">
              <button type="button" class="chip ${currentDateFilter === 'all' ? 'chip--active' : ''}" data-date="all">Ambos días</button>
              <button type="button" class="chip ${currentDateFilter === '2026-10-16' ? 'chip--active' : ''}" data-date="2026-10-16">Vie 16</button>
              <button type="button" class="chip ${currentDateFilter === '2026-10-17' ? 'chip--active' : ''}" data-date="2026-10-17">Sáb 17</button>
            </div>
          </div>

          <!-- Grilla de Eventos -->
          <div class="event-grid" id="discover-event-grid">
            ${renderEventsGrid()}
          </div>
        </div>
      </div>
    `;
  }

  function mount() {
    function refreshGrid() {
      const grid = document.getElementById('discover-event-grid');
      if (grid) {
        grid.innerHTML = renderEventsGrid();
        attachCardListeners();
      }

      // Actualizar estado del texto de filtro
      const venueStatus = document.getElementById('filter-venue-status');
      if (venueStatus) {
        venueStatus.textContent = currentVenueFilter === 'all' 
          ? 'Todos los locales' 
          : getVenue(currentVenueFilter)?.name || '';
      }
    }

    function updateVenueChipsUI() {
      document.querySelectorAll('#venue-filter-bar .chip').forEach(chip => {
        const venue = chip.dataset.venue;
        if (venue === currentVenueFilter) {
          chip.classList.add('chip--active');
        } else {
          chip.classList.remove('chip--active');
        }
      });
    }

    function updateDateChipsUI() {
      document.querySelectorAll('.chip[data-date]').forEach(chip => {
        const date = chip.dataset.date;
        if (date === currentDateFilter) {
          chip.classList.add('chip--active');
        } else {
          chip.classList.remove('chip--active');
        }
      });
    }

    function attachCardListeners() {
      // 1. Botones de guardar (corazón)
      document.querySelectorAll('.event-card__save-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const eventId = btn.dataset.eventId;
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
          // El store disparará notify() que llamará al subscriber
        });
      });

      // 2. Botón de reset de filtros en estado vacío
      const resetBtn = document.querySelector('.btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          currentVenueFilter = 'all';
          currentDateFilter = 'all';
          updateVenueChipsUI();
          updateDateChipsUI();
          refreshGrid();
        });
      }
    }

    // Filtros de Local
    document.querySelectorAll('#venue-filter-bar .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        currentVenueFilter = chip.dataset.venue || 'all';
        updateVenueChipsUI();
        refreshGrid();
      });
    });

    // Filtros de Fecha
    document.querySelectorAll('.chip[data-date]').forEach(chip => {
      chip.addEventListener('click', () => {
        currentDateFilter = chip.dataset.date || 'all';
        updateDateChipsUI();
        refreshGrid();
      });
    });

    // El router usa el hash, así que el salto a la agenda se hace por JS
    document.getElementById('btn-hero-agenda')?.addEventListener('click', () => {
      document.getElementById('discover-agenda')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Inicializar listeners de tarjetas
    attachCardListeners();

    // Asegurar reproducción fluida del video de fondo ambiental
    const ambientVid = document.getElementById('club-hero-ambient-video');
    if (ambientVid) {
      ambientVid.play().catch(() => {
        // Si el navegador bloquea autoplay sin interacción, el poster estático actúa como respaldo elegante
      });
    }

    // Suscripción al store reactivo
    const unsubscribe = subscribe(() => {
      refreshGrid();
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
