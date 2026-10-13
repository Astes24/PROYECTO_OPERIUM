// Operium Club — Pantalla A: Descubrir (Discover)
// Experiencia pública mobile-first para el Club de Entretenimiento
// Permite explorar eventos de los 4 locales, filtrar por local y fecha, y guardar interés

import { getState, saveEvent, unsaveEvent, subscribe } from '../../store.js';
import { getVenue, VENUES } from '../../data/venues.js';

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
          <div class="empty-state__icon">🔍</div>
          <h3 class="empty-state__title">No hay eventos con estos filtros</h3>
          <p class="empty-state__desc">
            No encontramos eventos que coincidan con la combinación seleccionada. Prueba cambiando el local o la fecha.
          </p>
          <button type="button" class="btn btn--secondary btn--sm btn-reset-filters">
            Mostrar todos los eventos
          </button>
        </div>
      `;
    }

    return filteredEvents.map(event => {
      const venue = getVenue(event.venueId) || {
        name: event.venueId,
        icon: '📍',
        accentColor: '#D4A857',
      };
      const isSaved = savedEventIds.has(event.id);

      return `
        <article 
          class="event-card" 
          data-venue="${event.venueId}" 
          style="--venue-accent: ${venue.accentColor};"
        >
          <!-- Contenedor de Imagen -->
          <div class="event-card__image-wrap">
            <img 
              src="${event.image}" 
              alt="${event.title}" 
              class="event-card__image" 
              loading="lazy"
              onerror="this.onerror=null; this.src='/images/hero_principal.png';"
            />
            <div class="event-card__image-overlay"></div>

            <!-- Badges superiores -->
            <div class="event-card__badges">
              <span 
                class="badge badge--venue" 
                style="background-color: ${venue.accentColor}26; color: ${venue.accentColor}; border: 1px solid ${venue.accentColor}66;"
              >
                <span>${venue.icon}</span>
                <span>${venue.name}</span>
              </span>
              <span class="badge badge--demo" title="Demostración ficticia">DEMO</span>
            </div>

            <!-- Botón de Guardado (Corazón) -->
            <button 
              type="button" 
              class="event-card__save-btn ${isSaved ? 'event-card__save-btn--active' : ''}" 
              data-event-id="${event.id}" 
              aria-label="${isSaved ? 'Quitar de guardados' : 'Guardar evento'}"
              title="${isSaved ? 'Guardado en Mi Club' : 'Guardar en Mi Club'}"
            >
              ${isSaved ? `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ` : `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              `}
            </button>
          </div>

          <!-- Contenido de la Tarjeta -->
          <div class="event-card__content">
            <div class="event-card__date">
              <span>📅</span>
              <span>${event.dayLabel} · ${event.time} hrs</span>
            </div>

            <h3 class="event-card__title">
              <a href="#/event/${event.id}" class="event-card__title-link">${event.title}</a>
            </h3>

            <p class="event-card__subtitle">${event.subtitle}</p>

            <!-- Tags -->
            <div class="event-card__tags">
              ${(event.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>

            <!-- Pie de Tarjeta -->
            <div class="event-card__footer">
              <span class="event-card__saved-count">
                <span style="color: ${isSaved ? 'var(--color-accent)' : 'inherit'};">♥</span>
                <strong class="save-count-num">${event.savedCount || 0}</strong> guardados
              </span>
              <a href="#/event/${event.id}" class="btn btn--sm btn--primary event-card__cta">
                Ver detalle
              </a>
            </div>

            <div class="event-card__disclaimer">
              Evento ficticio para demostración
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
          <img 
            src="/images/hero_principal.png" 
            alt="Operium Noche" 
            class="club-hero__bg" 
          />
          <div class="club-hero__overlay"></div>

          <div class="club-hero__content">
            <div class="club-hero__eyebrow">
              <span>◆</span>
              <span>Operium Club • 16 y 17 de Octubre 2026</span>
            </div>

            <h1 class="club-hero__title">Este fin de semana</h1>

            <p class="club-hero__subtitle">
              Descubre lo mejor de la noche en cuatro experiencias únicas: Señor Perú, Mood, Adriá y Play.
            </p>

            <div class="club-hero__actions">
              <a href="#/myclub" class="btn btn--secondary btn--md">
                <span>⭐ Mi Club</span>
                <span class="badge badge--accent">${savedCountTotal} guardados</span>
              </a>
              <a href="#/event/ev-mood-01" class="btn btn--primary btn--md">
                <span>Explorar Mood Sessions</span>
                <span>➔</span>
              </a>
            </div>
          </div>
        </section>

        <!-- Contenedor Principal de Contenido -->
        <div class="container" style="padding-top: var(--space-xl);">
          <!-- Nota pedagógica de diferenciación de métricas -->
          <div class="panel-callout panel-callout--info" style="margin-bottom: var(--space-lg); border-left: 3px solid var(--color-accent);">
            <div class="panel-callout__icon">💡</div>
            <div class="panel-callout__content" style="font-size: var(--font-size-xs); color: var(--color-text-muted);">
              <strong>Diferenciación de Demostración:</strong> 
              Guardar un evento registra tu <em>señal de interés</em> en el club. 
              <strong>Guardado ≠ Asistencia verificada ≠ Venta en caja</strong>.
            </div>
          </div>

          <!-- Filtros de Locales -->
          <div class="filter-section" style="margin-bottom: var(--space-md);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xs); padding: 0 4px;">
              <span class="form-label" style="margin: 0; font-size: var(--font-size-2xs); color: var(--color-text-dim);">
                Filtrar por local:
              </span>
              <span class="text-xs" id="filter-venue-status" style="color: var(--color-text-dim);">
                ${currentVenueFilter === 'all' ? 'Todos los locales' : getVenue(currentVenueFilter)?.name || ''}
              </span>
            </div>

            <div class="venue-filters" id="venue-filter-bar">
              <button 
                type="button" 
                class="venue-chip venue-chip--all ${currentVenueFilter === 'all' ? 'venue-chip--active' : ''}" 
                data-venue="all"
              >
                <span>✨</span>
                <span>Todos</span>
              </button>

              ${VENUES.map(v => `
                <button 
                  type="button" 
                  class="venue-chip venue-chip--${v.id} ${currentVenueFilter === v.id ? 'venue-chip--active' : ''}" 
                  data-venue="${v.id}"
                  style="--chip-color: ${v.accentColor};"
                >
                  <span class="venue-chip__dot" style="background-color: ${v.accentColor};"></span>
                  <span>${v.icon}</span>
                  <span>${v.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Filtros de Fechas -->
          <div class="filter-section" style="margin-bottom: var(--space-xl);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xs); padding: 0 4px;">
              <span class="form-label" style="margin: 0; font-size: var(--font-size-2xs); color: var(--color-text-dim);">
                Filtrar por fecha:
              </span>
              <span class="text-xs" style="color: var(--color-text-dim);">Octubre 2026</span>
            </div>

            <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">
              <button 
                type="button" 
                class="chip ${currentDateFilter === 'all' ? 'chip--active' : ''}" 
                data-date="all"
              >
                <span>🗓️ Todas las fechas</span>
              </button>
              <button 
                type="button" 
                class="chip ${currentDateFilter === '2026-10-16' ? 'chip--active' : ''}" 
                data-date="2026-10-16"
              >
                <span>Viernes 16 Oct</span>
              </button>
              <button 
                type="button" 
                class="chip ${currentDateFilter === '2026-10-17' ? 'chip--active' : ''}" 
                data-date="2026-10-17"
              >
                <span>Sábado 17 Oct</span>
              </button>
            </div>
          </div>

          <!-- Cabecera de la sección de eventos -->
          <div class="section-header" style="margin-bottom: var(--space-md);">
            <div class="section-title">
              <span class="section-title__eyebrow">Agenda Exclusiva</span>
              <h2 class="section-title__heading">Experiencias y Eventos</h2>
              <span class="section-title__desc">Explora la propuesta nocturna de los 4 locales del grupo</span>
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
      document.querySelectorAll('#venue-filter-bar .venue-chip').forEach(chip => {
        const venue = chip.dataset.venue;
        if (venue === currentVenueFilter) {
          chip.classList.add('venue-chip--active');
        } else {
          chip.classList.remove('venue-chip--active');
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
    document.querySelectorAll('#venue-filter-bar .venue-chip').forEach(chip => {
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

    // Inicializar listeners de tarjetas
    attachCardListeners();

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
