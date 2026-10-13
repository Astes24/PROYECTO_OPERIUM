// Operium Club — Negocio: Resumen
// Pregunta: ¿cómo va el fin de semana? Separa lo que pasa ahora (interés)
// de lo que ya pasó (asistencia y conversión reales).

import { getState, subscribe, setCurrentVenue } from '../../store.js';
import { VENUES } from '../../data/venues.js';
import { icon } from '../../icons.js';
import { currentWeekend, history, venueRow, followers, summaryInsight, eventStatus, fmt, pct } from '../../metrics.js';
import { pageHeader, statusChip, delta, trendBars, sourceBar } from './ui.js';

export default function Summary() {
  function render() {
    const { currentVenueId: ctx } = getState();
    const now = currentWeekend(ctx);
    const hist = history(ctx);
    const last = hist.at(-1);
    const prev = hist.at(-2);
    const nextEvent = now.events.filter(e => !e.finished).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

    return `
      <div class="panel-page nb-page summary-page">
        ${pageHeader({ ctx, eyebrow: 'Resumen', title: 'Cómo va el fin de semana', insight: summaryInsight(ctx) })}

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Este fin de semana <span class="nb-muted">· ${now.label}</span></h2>
            ${now.started
              ? `<span class="nb-status nb-status--finished">${now.finishedCount} de ${now.events.length} noches celebradas</span>`
              : nextEvent ? statusChip({ key: 'upcoming', label: `Empieza ${eventStatus(nextEvent).label.toLowerCase()}` }) : ''}
          </div>
          <div class="nb-kpis">
            <div class="nb-kpi">
              <span class="nb-kpi__label">Guardados</span>
              <span class="nb-kpi__value">${fmt(now.saved)}</span>
              ${delta(now.saved, last.saved)}
            </div>
            <div class="nb-kpi">
              <span class="nb-kpi__label">Asistencias</span>
              <span class="nb-kpi__value ${now.started ? '' : 'nb-kpi__value--off'}">${now.started ? fmt(now.checkins) : '—'}</span>
              <span class="nb-kpi__note">${now.started ? `Ocupación ${now.occupancy}% en las noches celebradas` : 'Se cuentan en puerta desde el viernes'}</span>
            </div>
            <div class="nb-kpi">
              <span class="nb-kpi__label">Conversión</span>
              <span class="nb-kpi__value ${now.started ? 'nb-kpi__value--accent' : 'nb-kpi__value--off'}">${now.started ? `${now.conversion}%` : '—'}</span>
              <span class="nb-kpi__note">${now.started ? 'De quienes guardaron, llegó' : 'Se calcula al cerrar cada noche'}</span>
            </div>
            <div class="nb-kpi nb-kpi--muted">
              <span class="nb-kpi__label">Ventas</span>
              <span class="nb-kpi__value nb-kpi__value--off">—</span>
              <span class="nb-kpi__note">Sin conexión a caja. Operium no las estima.</span>
            </div>
          </div>
        </section>

        <section class="nb-block nb-grid-2">
          <div>
            <div class="nb-block__head">
              <h2 class="vt-panel__title">Fin de semana pasado <span class="nb-muted">· ${last.label}</span></h2>
            </div>
            <div class="nb-kpis nb-kpis--3">
              <div class="nb-kpi">
                <span class="nb-kpi__label">Asistencias</span>
                <span class="nb-kpi__value">${fmt(last.checkins)}</span>
                ${delta(last.checkins, prev.checkins)}
              </div>
              <div class="nb-kpi">
                <span class="nb-kpi__label">Conversión</span>
                <span class="nb-kpi__value nb-kpi__value--accent">${last.conversion}%</span>
                <span class="nb-kpi__note">${fmt(last.savedAttended)} de ${fmt(last.saved)} que guardaron</span>
              </div>
              <div class="nb-kpi">
                <span class="nb-kpi__label">Ocupación</span>
                <span class="nb-kpi__value">${last.occupancy}%</span>
                <span class="nb-kpi__note">de ${fmt(last.capacity)} de aforo</span>
              </div>
            </div>
          </div>
          <div class="vt-panel">
            <div class="nb-block__head">
              <h3 class="nb-subtitle">Asistencias, últimas 4 semanas</h3>
            </div>
            ${trendBars(hist, 'checkins')}
          </div>
        </section>

        ${ctx === 'all' ? `
          <section class="nb-block">
            <div class="nb-block__head">
              <h2 class="vt-panel__title">Los cuatro locales</h2>
              <span class="vt-panel__hint">Pulsa un local para ver solo sus datos</span>
            </div>
            <div class="table-responsive">
              <table class="vt-table nb-table nb-table--clickable">
                <thead>
                  <tr>
                    <th>Local</th>
                    <th>Guardados ahora</th>
                    <th>Asistencias (pasado)</th>
                    <th>Conversión (pasado)</th>
                    <th>Ocupación (pasado)</th>
                    <th>Seguidores</th>
                    <th aria-label="Abrir"></th>
                  </tr>
                </thead>
                <tbody>
                  ${VENUES.map(v => {
                    const row = venueRow(v.id);
                    return `
                      <tr data-ctx="${v.id}" tabindex="0">
                        <td data-label="Local"><span class="gr-venue">${v.icon}<strong>${v.name}</strong></span><small>${v.category} · ${v.manager}</small></td>
                        <td data-label="Guardados ahora">${fmt(row.now.saved)}</td>
                        <td data-label="Asistencias (pasado)">${fmt(row.last.checkins)}</td>
                        <td data-label="Conversión (pasado)">
                          <span class="gr-conv"><span class="gr-conv__num">${row.last.conversion}%</span><span class="gr-conv__track"><span style="width: ${row.last.conversion}%;"></span></span></span>
                        </td>
                        <td data-label="Ocupación (pasado)">${row.last.occupancy}%</td>
                        <td data-label="Seguidores">${fmt(row.followers)}</td>
                        <td class="nb-table__go">${icon('right', { size: 16 })}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </section>
        ` : `
          <section class="nb-block nb-grid-2">
            <div class="vt-panel">
              <div class="nb-block__head">
                <h3 class="nb-subtitle">Fechas de este fin de semana</h3>
                <a href="#/panel/eventos" class="vt-panel__link">Ver eventos ${icon('right', { size: 14 })}</a>
              </div>
              <ul class="nb-list">
                ${now.events.map(e => `
                  <li>
                    <div>
                      <strong>${e.title}</strong>
                      <small>${e.dayLabel} · ${e.time} · ${fmt(e.savedCount)} guardados de ${fmt(e.capacity)} de aforo</small>
                    </div>
                    ${statusChip(eventStatus(e))}
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="vt-panel">
              <div class="nb-block__head">
                <h3 class="nb-subtitle">De dónde vino el público <span class="nb-muted">· ${last.label}</span></h3>
                <a href="#/panel/origen" class="vt-panel__link">Ver origen ${icon('right', { size: 14 })}</a>
              </div>
              ${sourceBar(last.bySource)}
              <p class="vt-panel__note">${fmt(followers(ctx))} miembros siguen a ${VENUES.find(v => v.id === ctx)?.name}. El ${pct(last.bySource.promotor + last.bySource.campana, last.checkins)}% del público llegó por un promotor o una campaña.</p>
            </div>
          </section>
        `}
      </div>
    `;
  }

  function mount() {
    function setup() {
      document.querySelectorAll('.summary-page [data-ctx]').forEach(row => {
        const go = () => setCurrentVenue(row.dataset.ctx);
        row.addEventListener('click', go);
        row.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      });
    }
    setup();
    const unsubscribe = subscribe(() => {
      const el = document.querySelector('.summary-page');
      if (el?.parentElement) {
        el.parentElement.innerHTML = render();
        setup();
      }
    });
    return () => unsubscribe();
  }

  return { html: render(), mount };
}
