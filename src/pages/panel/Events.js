// Operium Club — Negocio: Eventos
// Pregunta: ¿qué evento funciona y cuál no? Interés frente a aforo antes de abrir;
// asistencia y conversión cuando la noche ya se celebró.

import { getState, subscribe } from '../../store.js';
import { getVenue } from '../../data/venues.js';
import { icon } from '../../icons.js';
import { currentWeekend, history, eventStatus, eventsInsight, fmt, pct } from '../../metrics.js';
import { pageHeader, statusChip } from './ui.js';

export default function Events() {
  let dayFilter = 'all';

  function render() {
    const { currentVenueId: ctx } = getState();
    const now = currentWeekend(ctx);
    const events = now.events
      .filter(e => dayFilter === 'all' || e.date === dayFilter)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const hist = [...history(ctx)].reverse();

    return `
      <div class="panel-page nb-page events-page">
        ${pageHeader({ ctx, eyebrow: 'Eventos', title: 'Qué fechas funcionan', insight: eventsInsight(ctx) })}

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Este fin de semana <span class="nb-muted">· ${now.label}</span></h2>
            <div class="nb-filter" role="group" aria-label="Filtrar por día">
              ${[['all', 'Ambos días'], ['2026-10-16', 'Vie 16'], ['2026-10-17', 'Sáb 17']].map(([v, l]) => `
                <button type="button" class="nb-filter__opt ${dayFilter === v ? 'nb-filter__opt--active' : ''}" data-day="${v}">${l}</button>
              `).join('')}
            </div>
          </div>

          <ul class="nb-events">
            ${events.map(e => {
              const venue = getVenue(e.venueId);
              const status = eventStatus(e);
              const savedPct = pct(e.savedCount, e.capacity);
              const occ = pct(e.checkinCount, e.capacity);
              return `
                <li class="nb-event ${e.finished ? 'nb-event--finished' : ''}">
                  <div class="nb-event__main">
                    <span class="nb-event__meta">${venue?.icon || ''}${venue?.name || ''} · ${e.dayLabel} · ${e.time}</span>
                    <strong class="nb-event__title">${e.title}</strong>
                    ${statusChip(status)}
                  </div>
                  <div class="nb-event__bar" aria-label="${e.savedCount} guardados y ${e.checkinCount} asistencias sobre ${e.capacity} de aforo">
                    <div class="nb-event__track">
                      <span class="nb-event__fill nb-event__fill--saved" style="width: ${Math.min(100, savedPct)}%;"></span>
                      ${e.finished ? `<span class="nb-event__fill nb-event__fill--live" style="width: ${Math.min(100, occ)}%;"></span>` : ''}
                    </div>
                    <div class="nb-event__legend">
                      <span><i class="nb-dot nb-dot--saved"></i>${fmt(e.savedCount)} guardados</span>
                      ${e.finished ? `<span><i class="nb-dot nb-dot--live"></i>${fmt(e.checkinCount)} asistencias</span>` : ''}
                      <span class="nb-muted">Aforo ${fmt(e.capacity)}</span>
                    </div>
                  </div>
                  <dl class="nb-event__stats">
                    ${e.finished ? `
                      <div><dt>Ocupación</dt><dd>${occ}%</dd></div>
                      <div><dt>Conversión</dt><dd class="nb-accent">${pct(e.savedAttended, e.savedCount)}%</dd></div>
                    ` : `
                      <div><dt>Interés sobre aforo</dt><dd>${savedPct}%</dd></div>
                    `}
                  </dl>
                  <a href="#/event/${e.id}" class="nb-event__public" title="Ver como lo ve el público" aria-label="Ver ${e.title} como lo ve el público">${icon('phone', { size: 16 })}</a>
                </li>
              `;
            }).join('')}
          </ul>
          <p class="vt-panel__note">Antes de abrir solo hay interés. La asistencia y la conversión aparecen cuando la puerta cierra la noche.</p>
        </section>

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Fines de semana anteriores</h2>
          </div>
          <div class="table-responsive">
            <table class="vt-table nb-table">
              <thead>
                <tr><th>Fin de semana</th><th>Guardados</th><th>Asistencias</th><th>Conversión</th><th>Ocupación</th></tr>
              </thead>
              <tbody>
                ${hist.map(h => `
                  <tr>
                    <td data-label="Fin de semana"><strong>${h.label}</strong></td>
                    <td data-label="Guardados">${fmt(h.saved)}</td>
                    <td data-label="Asistencias">${fmt(h.checkins)}</td>
                    <td data-label="Conversión">${h.conversion}%</td>
                    <td data-label="Ocupación">${h.occupancy}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  function mount() {
    function rerender() {
      const el = document.querySelector('.events-page');
      if (el?.parentElement) {
        el.parentElement.innerHTML = render();
        setup();
      }
    }
    function setup() {
      document.querySelectorAll('.events-page [data-day]').forEach(btn => {
        btn.addEventListener('click', () => {
          dayFilter = btn.dataset.day;
          rerender();
        });
      });
    }
    setup();
    const unsubscribe = subscribe(rerender);
    return () => unsubscribe();
  }

  return { html: render(), mount };
}
