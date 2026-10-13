// Operium Club — Pantalla B: Mi Club (MyClub)
// Perfil de miembro, eventos guardados, locales seguidos e historial de actividad
// Diferenciación clara: interés (guardado) vs asistencia verificada (check-in)

import { getState, unsaveEvent, setCurrentMember, subscribe } from '../../store.js';
import { getVenue } from '../../data/venues.js';
import { icon } from '../../icons.js';

export default function MyClub() {
  function formatSpanishDate(dateStr) {
    if (!dateStr) return 'Fecha no disponible';
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} de ${months[monthIdx] || parts[1]} de ${year}`;
    }
    return dateStr;
  }

  function getSegmentBadge(segment) {
    switch (segment) {
      case 'recurrente':
        return '<span class="badge badge--accent">Recurrente</span>';
      case 'nuevo':
        return '<span class="badge badge--success">Nuevo</span>';
      case 'sin_interaccion':
        return '<span class="badge badge--warning">Sin actividad reciente</span>';
      default:
        return `<span class="badge">${segment}</span>`;
    }
  }

  function render() {
    const state = getState();
    const { members, currentMemberId, events, venues } = state;
    const member = members.find(m => m.id === currentMemberId) || members[0];

    const savedEventsList = (member.savedEvents || [])
      .map(id => events.find(e => e.id === id))
      .filter(Boolean);

    const followedVenuesList = (member.following || [])
      .map(id => venues.find(v => v.id === id) || getVenue(id))
      .filter(Boolean);

    // Unificar historial de actividad (interacciones previas + check-ins en vivo + guardados)
    const activityTimeline = [];

    // 1. Check-ins confirmados
    (member.checkins || []).forEach(chk => {
      const ev = events.find(e => e.id === chk.eventId);
      const ven = ev ? (venues.find(v => v.id === ev.venueId) || getVenue(ev.venueId)) : null;
      activityTimeline.push({
        type: 'checkin',
        title: ev ? ev.title : chk.eventId,
        subtitle: `Validado en puerta por ${chk.validatedBy || 'Sistema'}`,
        date: chk.date || '2026-10-16',
        venue: ven,
        icon: 'ticket',
        badgeClass: 'badge--success',
        badgeText: 'Asistencia',
      });
    });

    // 2. Eventos guardados actualmente
    savedEventsList.forEach(ev => {
      const ven = venues.find(v => v.id === ev.venueId) || getVenue(ev.venueId);
      activityTimeline.push({
        type: 'saved',
        title: ev.title,
        subtitle: `Guardado para el ${ev.dayLabel.toLowerCase()} a las ${ev.time}`,
        date: '2026-10-16',
        venue: ven,
        icon: 'heart',
        badgeClass: 'badge--accent',
        badgeText: 'Interés',
      });
    });

    // 3. Interacciones históricas registradas en semilla
    (member.interactions || []).forEach(int => {
      const ev = events.find(e => e.id === int.eventId);
      const ven = ev ? (venues.find(v => v.id === ev.venueId) || getVenue(ev.venueId)) : null;
      activityTimeline.push({
        type: int.type,
        title: ev ? ev.title : int.eventId,
        subtitle: int.type === 'checkin' 
          ? 'Visita validada en local' 
          : 'Guardado en agenda de septiembre',
        date: int.date,
        venue: ven,
        icon: int.type === 'checkin' ? 'check' : 'clock',
        badgeClass: '',
        badgeText: int.type === 'checkin' ? 'Visita pasada' : 'Interés pasado',
      });
    });

    // Ordenar cronológicamente descendente
    activityTimeline.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    // Garantiza que el miembro activo aparezca en el selector aunque no esté entre los 5 primeros
    const m0 = (seg) => (member.segment === seg && members.filter(m => m.segment === seg).slice(0, 5).every(m => m.id !== member.id)) ? [member] : [];

    const initials = (member.name || 'Miembro')
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return `
      <div class="profile-section animate-fade-in">
        <div class="profile-switcher">
          <label for="member-switcher">${icon('sliders', { size: 13 })} Presentador · ver como</label>
          <select id="member-switcher" class="form-select form-select--sm">
            ${[['recurrente', 'Recurrentes'], ['nuevo', 'Nuevos'], ['sin_interaccion', 'Sin actividad']].map(([seg, label]) => `
              <optgroup label="${label}">
                ${members.filter(m => m.segment === seg).slice(0, 5).concat(m0(seg)).map(m => `
                  <option value="${m.id}" ${m.id === member.id ? 'selected' : ''}>${m.name}</option>
                `).join('')}
              </optgroup>
            `).join('')}
          </select>
        </div>

        <header class="profile-card">
          <div class="profile-card__avatar">${initials}</div>
          <div class="profile-card__info">
            <div class="profile-card__top">
              <h1 class="profile-card__name">${member.name}</h1>
              ${getSegmentBadge(member.segment)}
            </div>
            <p class="profile-card__email">
              Miembro desde el ${formatSpanishDate(member.registeredDate)} · <code>${member.id}</code>
            </p>
            <p class="profile-card__consent">
              <span class="${member.consent.email ? 'is-on' : 'is-off'}">${icon(member.consent.email ? 'check' : 'x', { size: 13 })} Email</span>
              <span class="${member.consent.sms ? 'is-on' : 'is-off'}">${icon(member.consent.sms ? 'check' : 'x', { size: 13 })} SMS</span>
            </p>
          </div>
          <dl class="profile-card__stats">
            <div><dt>Guardados</dt><dd>${savedEventsList.length}</dd></div>
            <div><dt>Locales</dt><dd>${followedVenuesList.length}</dd></div>
            <div><dt>Check-ins</dt><dd>${(member.checkins || []).length}</dd></div>
          </dl>
        </header>

        <section class="profile-block">
          <div class="section-header">
            <div class="section-title">
              <h2 class="section-title__heading">Guardados</h2>
            </div>
            <a href="#/discover" class="btn btn--secondary btn--sm">Ver agenda</a>
          </div>

          ${savedEventsList.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state__icon">${icon('heart', { size: 26 })}</div>
              <h3 class="empty-state__title">Todavía nada guardado</h3>
              <p class="empty-state__desc">Guarda eventos de la agenda y aparecerán aquí con su pase.</p>
              <a href="#/discover" class="btn btn--primary btn--md">Ir a la agenda</a>
            </div>
          ` : `
            <div class="saved-list">
              ${savedEventsList.map(event => {
                const venue = venues.find(v => v.id === event.venueId) || getVenue(event.venueId) || { name: event.venueId, icon: '' };
                return `
                  <article class="saved-item">
                    <img 
                      src="${event.image}" 
                      alt="${event.title}" 
                      class="saved-item__thumb"
                      style="object-position: ${event.imagePosition || 'center'};"
                      onerror="this.onerror=null; this.src='/images/hero_principal.png';"
                    />
                    <div class="saved-item__details">
                      <div class="saved-item__venue">${venue.icon}${venue.name} · ${event.dayLabel} · ${event.time}</div>
                      <div class="saved-item__title"><a href="#/event/${event.id}">${event.title}</a></div>
                    </div>
                    <div class="saved-item__actions">
                      <a href="#/event/${event.id}" class="btn btn--sm btn--secondary">Ver pase</a>
                      <button 
                        type="button" 
                        class="btn btn--sm btn--ghost btn-unsave-event" 
                        data-event-id="${event.id}"
                        aria-label="Quitar de guardados"
                        title="Quitar de guardados"
                      >${icon('x', { size: 16 })}</button>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          `}
        </section>

        <section class="profile-block">
          <div class="section-header">
            <div class="section-title">
              <h2 class="section-title__heading">Locales que sigo</h2>
            </div>
          </div>

          ${followedVenuesList.length === 0 ? `
            <p class="profile-block__empty">Aún no sigues ningún local. Puedes hacerlo desde el detalle de cualquier evento.</p>
          ` : `
            <div class="followed-venues">
              ${followedVenuesList.map(venue => `
                <div class="followed-venue-item">
                  <div>
                    <div class="followed-venue-item__name">${venue.icon}${venue.name}</div>
                    <div class="followed-venue-item__meta">${venue.category} · ${venue.schedule}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </section>

        <section class="profile-block">
          <div class="section-header">
            <div class="section-title">
              <h2 class="section-title__heading">Actividad</h2>
            </div>
            <p class="discover-note">El interés se registra al guardar. La asistencia, solo con check-in en puerta.</p>
          </div>

          ${activityTimeline.length === 0 ? `
            <p class="profile-block__empty">Sin actividad todavía.</p>
          ` : `
            <ol class="activity-list">
              ${activityTimeline.map(item => `
                <li class="activity-list__item activity-list__item--${item.type}">
                  <span class="activity-list__icon">${icon(item.icon, { size: 16 })}</span>
                  <div class="activity-list__body">
                    <strong>${item.title}</strong>
                    <span>${item.subtitle}${item.venue ? ` · ${item.venue.name}` : ''}</span>
                  </div>
                  <div class="activity-list__meta">
                    <span class="badge ${item.badgeClass}">${item.badgeText}</span>
                    <time>${item.date}</time>
                  </div>
                </li>
              `).join('')}
            </ol>
          `}
        </section>
      </div>
    `;
  }

  function mount() {
    function setupEventListeners() {
      // 1. Botones para desguardar evento
      document.querySelectorAll('.btn-unsave-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const eventId = btn.dataset.eventId;
          const state = getState();
          if (eventId && state.currentMemberId) {
            unsaveEvent(state.currentMemberId, eventId);
          }
        });
      });

      // 2. Switcher de miembro en tiempo de demo
      const switcher = document.getElementById('member-switcher');
      if (switcher) {
        switcher.addEventListener('change', (e) => {
          const newMemberId = e.target.value;
          setCurrentMember(newMemberId);
        });
      }
    }

    setupEventListeners();

    // Suscripción al store
    const unsubscribe = subscribe(() => {
      const profileContainer = document.querySelector('.profile-section');
      if (profileContainer && profileContainer.parentElement) {
        profileContainer.parentElement.innerHTML = render();
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
