// Operium Club — Negocio: Resumen
// Separa lo que pasa ahora (interés) de lo que ya pasó (asistencia,
// conversión y consumo con DNI).

import { getState, subscribe, setCurrentVenue } from '../../store.js';
import { VENUES } from '../../data/venues.js';
import { icon } from '../../icons.js';
import { currentWeekend, history, venueRow, eventStatus, fmt, pct, soles } from '../../metrics.js';
import { pageHeader, statusChip, delta } from './ui.js';

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
        ${pageHeader({ title: 'Resumen' })}

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Este fin de semana <span class="nb-muted">${now.label}</span></h2>
            ${now.started
              ? `<span class="nb-status nb-status--finished">${now.finishedCount} de ${now.events.length} noches celebradas</span>`
              : nextEvent ? statusChip({ key: 'upcoming', label: `Empieza ${eventStatus(nextEvent).label.toLowerCase()}` }) : ''}
          </div>
          ${now.started ? `
            <div class="nb-kpis">
              <div class="nb-kpi">
                <span class="nb-kpi__label">Guardados</span>
                <span class="nb-kpi__value">${fmt(now.saved)}</span>
                ${delta(now.saved, last.saved)}
              </div>
              <div class="nb-kpi">
                <span class="nb-kpi__label">Asistencias</span>
                <span class="nb-kpi__value">${fmt(now.checkins)}</span>
                <span class="nb-kpi__note">Ocupación ${now.occupancy}%</span>
              </div>
              <div class="nb-kpi">
                <span class="nb-kpi__label">Conversión</span>
                <span class="nb-kpi__value nb-kpi__value--accent">${now.conversion}%</span>
                <span class="nb-kpi__note">de quienes guardaron</span>
              </div>
              <div class="nb-kpi">
                <span class="nb-kpi__label">Consumo registrado</span>
                <span class="nb-kpi__value">${soles(now.spend)}</span>
                <span class="nb-kpi__note">${fmt(now.receipts)} boletas de caja</span>
              </div>
            </div>
          ` : `
            <div class="nb-kpis nb-kpis--3">
              <div class="nb-kpi">
                <span class="nb-kpi__label">Guardados</span>
                <span class="nb-kpi__value">${fmt(now.saved)}</span>
                ${delta(now.saved, last.saved)}
              </div>
              <div class="nb-kpi">
                <span class="nb-kpi__label">Interés sobre aforo</span>
                <span class="nb-kpi__value">${pct(now.saved, now.capacity)}%</span>
                <span class="nb-kpi__note">de ${fmt(now.capacity)} plazas</span>
              </div>
              <div class="nb-kpi">
                <span class="nb-kpi__label">Fechas</span>
                <span class="nb-kpi__value">${now.events.length}</span>
                <span class="nb-kpi__note">viernes y sábado</span>
              </div>
            </div>
          `}
        </section>

        <section class="nb-block">
          <div>
            <div class="nb-block__head">
              <h2 class="vt-panel__title">Fin de semana pasado <span class="nb-muted">${last.label}</span></h2>
            </div>
            <div class="nb-kpis">
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
              <div class="nb-kpi">
                <span class="nb-kpi__label">Consumo registrado</span>
                <span class="nb-kpi__value">${soles(last.spend)}</span>
                ${delta(last.spend, prev.spend)}
              </div>
            </div>
          </div>
        </section>

        ${ctx === 'all' ? `
          <section class="nb-block">
            <div class="nb-block__head">
              <h2 class="vt-panel__title">Los cuatro locales</h2>
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
          <section class="vt-panel">
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
