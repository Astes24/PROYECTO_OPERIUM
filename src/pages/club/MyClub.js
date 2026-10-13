// Operium Club — Pantalla B: Mi Club (MyClub)
// Perfil de miembro, eventos guardados, locales seguidos e historial de actividad
// Diferenciación clara: interés (guardado) vs asistencia verificada (check-in)

import { getState, unsaveEvent, setCurrentMember, subscribe } from '../../store.js';
import { getVenue, VENUES } from '../../data/venues.js';

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
        return '<span class="badge badge--accent">Miembro Recurrente</span>';
      case 'nuevo':
        return '<span class="badge badge--success">Miembro Nuevo</span>';
      case 'sin_interaccion':
        return '<span class="badge badge--warning">Sin Interacción Reciente</span>';
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
        title: `Check-in confirmado: ${ev ? ev.title : chk.eventId}`,
        subtitle: `Validado en puerta por ${chk.validatedBy || 'Sistema'} (${chk.time || 'Noche'})`,
        date: chk.date || '2026-10-16',
        venue: ven,
        icon: '🎟️',
        badgeClass: 'badge--success',
        badgeText: 'Asistencia Verificada',
      });
    });

    // 2. Eventos guardados actualmente
    savedEventsList.forEach(ev => {
      const ven = venues.find(v => v.id === ev.venueId) || getVenue(ev.venueId);
      activityTimeline.push({
        type: 'saved',
        title: `Interés registrado: "${ev.title}"`,
        subtitle: `Guardado en Mi Club para ${ev.dayLabel} (${ev.time} hrs)`,
        date: '2026-10-16',
        venue: ven,
        icon: '❤️',
        badgeClass: 'badge--accent',
        badgeText: 'Interés Previo (Guardado)',
      });
    });

    // 3. Interacciones históricas registradas en semilla
    (member.interactions || []).forEach(int => {
      const ev = events.find(e => e.id === int.eventId);
      const ven = ev ? (venues.find(v => v.id === ev.venueId) || getVenue(ev.venueId)) : null;
      activityTimeline.push({
        type: int.type,
        title: int.type === 'checkin' 
          ? `Asistencia histórica: ${ev ? ev.title : int.eventId}` 
          : `Interés previo: ${ev ? ev.title : int.eventId}`,
        subtitle: int.type === 'checkin' 
          ? 'Visita validada en local' 
          : 'Guardado en agenda de septiembre',
        date: int.date,
        venue: ven,
        icon: int.type === 'checkin' ? '✓' : '📌',
        badgeClass: int.type === 'checkin' ? 'badge--info' : 'badge--subtle',
        badgeText: int.type === 'checkin' ? 'Visita Pasada' : 'Historial',
      });
    });

    // Ordenar cronológicamente descendente
    activityTimeline.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const initials = (member.name || 'Miembro')
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return `
      <div class="profile-section animate-fade-in">
        <!-- Banner de Contexto de Demostración -->
        <div class="panel-callout panel-callout--info" style="margin-bottom: var(--space-lg); border-left: 3px solid var(--color-accent);">
          <div class="panel-callout__icon">👤</div>
          <div class="panel-callout__content">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-xs);">
              <div>
                <strong>Modo Demostración Activo:</strong> Perfil simulado para la presentación comercial.
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-xs);">
                <label for="member-switcher" style="font-size: var(--font-size-2xs); color: var(--color-text-dim); text-transform: uppercase;">
                  Cambiar Miembro:
                </label>
                <select id="member-switcher" class="form-select form-select--sm" style="padding: 2px 8px; font-size: var(--font-size-xs); background: var(--color-surface-elevated); color: var(--color-text); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                  ${members.slice(0, 15).map(m => `
                    <option value="${m.id}" ${m.id === member.id ? 'selected' : ''}>
                      ${m.name} (${m.segment})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta de Perfil del Miembro -->
        <div class="profile-card">
          <div class="profile-card__avatar-wrap">
            <div class="avatar avatar--xl avatar--accent">
              <span class="avatar__fallback" style="font-size: var(--font-size-2xl); font-weight: 800;">
                ${initials}
              </span>
            </div>
          </div>

          <div class="profile-card__info">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: 4px;">
              <h1 class="profile-card__name">${member.name}</h1>
              ${getSegmentBadge(member.segment)}
            </div>

            <p class="profile-card__email">
              Código de Miembro: <code>${member.id}</code>
            </p>

            <div class="profile-card__meta">
              <span class="badge badge--subtle" title="Fecha de alta">
                🗓️ Registrado: ${formatSpanishDate(member.registeredDate)}
              </span>
              <span class="badge ${member.consent.email ? 'badge--success' : 'badge--danger'}" title="Consentimiento de invitaciones por correo">
                📧 Email: ${member.consent.email ? 'Autorizado' : 'Sin permiso'}
              </span>
              <span class="badge ${member.consent.sms ? 'badge--success' : 'badge--subtle'}" title="Consentimiento de mensajes de texto">
                📱 SMS: ${member.consent.sms ? 'Autorizado' : 'No activo'}
              </span>
            </div>

            <!-- Resumen de Métricas del Usuario -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-xs); margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--color-border-subtle); text-align: center;">
              <div>
                <span class="text-xs" style="color: var(--color-text-dim); text-transform: uppercase;">Guardados</span>
                <div style="font-family: var(--font-display); font-size: var(--font-size-xl); font-weight: 800; color: var(--color-accent);">
                  ${savedEventsList.length}
                </div>
              </div>
              <div>
                <span class="text-xs" style="color: var(--color-text-dim); text-transform: uppercase;">Locales</span>
                <div style="font-family: var(--font-display); font-size: var(--font-size-xl); font-weight: 800; color: var(--color-text);">
                  ${followedVenuesList.length}
                </div>
              </div>
              <div>
                <span class="text-xs" style="color: var(--color-text-dim); text-transform: uppercase;">Check-ins</span>
                <div style="font-family: var(--font-display); font-size: var(--font-size-xl); font-weight: 800; color: var(--color-success);">
                  ${(member.checkins || []).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 1: MIS EVENTOS GUARDADOS -->
        <section style="margin-bottom: var(--space-2xl);">
          <div class="section-header" style="margin-bottom: var(--space-md);">
            <div class="section-title">
              <span class="section-title__eyebrow">Mi Selección</span>
              <h2 class="section-title__heading">Mis Eventos Guardados</h2>
              <span class="section-title__desc">Eventos marcados con señal de interés en los 4 locales</span>
            </div>
            <a href="#/discover" class="btn btn--secondary btn--sm">
              + Explorar más eventos
            </a>
          </div>

          ${savedEventsList.length === 0 ? `
            <div class="empty-state animate-fade-in">
              <div class="empty-state__icon">⭐</div>
              <h3 class="empty-state__title">Aún no tienes eventos guardados</h3>
              <p class="empty-state__desc">
                Explora la cartelera de este fin de semana en Señor Perú, Mood, Adriá y Play, y guarda los que quieras disfrutar.
              </p>
              <a href="#/discover" class="btn btn--primary btn--md">
                Ir a Descubrir Eventos
              </a>
            </div>
          ` : `
            <div class="saved-list">
              ${savedEventsList.map(event => {
                const venue = venues.find(v => v.id === event.venueId) || getVenue(event.venueId) || {
                  name: event.venueId,
                  icon: '📍',
                  accentColor: '#D4A857',
                };

                return `
                  <article class="saved-item" style="border-left: 3px solid ${venue.accentColor};">
                    <img 
                      src="${event.image}" 
                      alt="${event.title}" 
                      class="saved-item__thumb"
                      onerror="this.onerror=null; this.src='/images/hero_principal.png';"
                    />

                    <div class="saved-item__details">
                      <div class="saved-item__title">
                        <a href="#/event/${event.id}">${event.title}</a>
                      </div>
                      <div class="saved-item__venue" style="color: ${venue.accentColor}; font-weight: 600;">
                        ${venue.icon} ${venue.name}
                      </div>
                      <div class="saved-item__date">
                        📅 ${event.dayLabel} · ⏰ ${event.time} hrs
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: var(--space-xs);">
                      <a href="#/event/${event.id}" class="btn btn--sm btn--primary">
                        Ver pase
                      </a>
                      <button 
                        type="button" 
                        class="btn btn--sm btn--ghost btn-unsave-event" 
                        data-event-id="${event.id}"
                        title="Quitar de guardados"
                        aria-label="Quitar de guardados"
                        style="color: var(--color-danger);"
                      >
                        ✕
                      </button>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          `}
        </section>

        <!-- SECCIÓN 2: LOCALES QUE SIGO -->
        <section style="margin-bottom: var(--space-2xl);">
          <div class="section-header" style="margin-bottom: var(--space-md);">
            <div class="section-title">
              <span class="section-title__eyebrow">Comunidad</span>
              <h2 class="section-title__heading">Locales que Sigo</h2>
              <span class="section-title__desc">Marcas favoritas del grupo para recibir beneficios preferenciales</span>
            </div>
          </div>

          ${followedVenuesList.length === 0 ? `
            <div class="empty-state animate-fade-in">
              <div class="empty-state__icon">📍</div>
              <h3 class="empty-state__title">No sigues a ningún local todavía</h3>
              <p class="empty-state__desc">
                Sigue a Señor Perú, Mood, Adriá o Play desde el detalle de sus eventos para acceder a cortesías y accesos exclusivos.
              </p>
              <a href="#/discover" class="btn btn--secondary btn--sm">
                Conocer los locales
              </a>
            </div>
          ` : `
            <div class="followed-venues">
              ${followedVenuesList.map(venue => `
                <div class="followed-venue-item" style="border-left: 3px solid ${venue.accentColor};">
                  <div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                      <span style="font-size: 1.25rem;">${venue.icon}</span>
                      <strong style="font-family: var(--font-display); font-size: var(--font-size-md); color: var(--color-text);">
                        ${venue.name}
                      </strong>
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">
                      ${venue.category || venue.tagline}
                    </div>
                    <div style="font-size: var(--font-size-2xs); color: var(--color-text-dim); margin-top: 4px;">
                      🕒 ${venue.schedule}
                    </div>
                  </div>

                  <a 
                    href="#/discover" 
                    class="btn btn--sm btn--secondary" 
                    title="Ver eventos de ${venue.name}"
                    style="border-color: ${venue.accentColor}55; color: ${venue.accentColor};"
                  >
                    Ver agenda
                  </a>
                </div>
              `).join('')}
            </div>
          `}
        </section>

        <!-- SECCIÓN 3: MI ACTIVIDAD (LÍNEA DE TIEMPO) -->
        <section style="margin-bottom: var(--space-2xl);">
          <div class="section-header" style="margin-bottom: var(--space-md);">
            <div class="section-title">
              <span class="section-title__eyebrow">Trazabilidad</span>
              <h2 class="section-title__heading">Mi Actividad</h2>
              <span class="section-title__desc">Historial cronológico diferenciando interés previo de asistencia en puerta</span>
            </div>
          </div>

          <div class="panel-callout panel-callout--info" style="margin-bottom: var(--space-md); font-size: var(--font-size-xs);">
            <div class="panel-callout__icon">ℹ️</div>
            <div class="panel-callout__content">
              <strong>Regla Operativa:</strong> Un guardado refleja intención o consulta en el club. 
              La asistencia solo se acredita cuando el personal de puerta realiza un <strong>check-in presencial</strong>.
            </div>
          </div>

          ${activityTimeline.length === 0 ? `
            <div class="empty-state animate-fade-in">
              <div class="empty-state__icon">⏳</div>
              <h3 class="empty-state__title">Sin actividad registrada</h3>
              <p class="empty-state__desc">
                Guarda un evento o asiste a una sesión para ver tu historial de interacción en esta sección.
              </p>
            </div>
          ` : `
            <div class="saved-list">
              ${activityTimeline.map(item => `
                <div class="saved-item" style="padding: var(--space-sm) var(--space-md);">
                  <div style="display: flex; align-items: center; gap: var(--space-md); width: 100%;">
                    <div style="font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; background: var(--color-surface-elevated); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      ${item.icon}
                    </div>

                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-xs); flex-wrap: wrap;">
                        <strong style="font-family: var(--font-display); font-size: var(--font-size-sm); color: var(--color-text);">
                          ${item.title}
                        </strong>
                        <span class="badge ${item.badgeClass}">
                          ${item.badgeText}
                        </span>
                      </div>

                      <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
                        ${item.subtitle}
                      </div>

                      <div style="font-size: var(--font-size-2xs); color: var(--color-text-dim); margin-top: 2px;">
                        🗓️ ${item.date} ${item.venue ? `• ${item.venue.icon} ${item.venue.name}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
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
