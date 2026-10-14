// Operium Club — Negocio: Eventos
// Interés frente a aforo antes de abrir; asistencia y conversión cuando la
// noche ya se celebró. Gestión de fechas (crear, editar, borrar).

import { getState, subscribe, createEvent, updateEvent, deleteEvent } from '../../store.js';
import { VENUES, getVenue } from '../../data/venues.js';
import { icon } from '../../icons.js';
import { currentWeekend, laterEvents, history, eventStatus, fmt, pct } from '../../metrics.js';
import { pageHeader, statusChip } from './ui.js';

// Fecha por defecto al crear un evento: el sábado siguiente al fin de semana en curso
const NEXT_SATURDAY = '2026-10-24';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function dayLabelFor(date) {
  const d = new Date(`${date}T12:00:00`);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const esc = (v = '') => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function Events() {
  let dayFilter = 'all';
  let modal = null; // null | { mode: 'create' } | { mode: 'edit', id }

  function eventRow(e) {
    const venue = getVenue(e.venueId);
    const savedPct = pct(e.savedCount, e.capacity);
    const occ = pct(e.checkinCount, e.capacity);
    return `
      <li class="nb-event ${e.finished ? 'nb-event--finished' : ''}">
        <div class="nb-event__main">
          <span class="nb-event__meta">${venue?.icon || ''}${venue?.name || ''} · ${e.dayLabel} · ${e.time}</span>
          <strong class="nb-event__title">${esc(e.title)}</strong>
          ${statusChip(eventStatus(e))}
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
        <div class="nb-event__actions">
          <a href="#/event/${e.id}" class="nb-icon-btn" title="Ver como lo ve el público" aria-label="Ver ${esc(e.title)} como lo ve el público">${icon('phone', { size: 16 })}</a>
          <button type="button" class="nb-icon-btn" data-edit="${e.id}" title="Editar" aria-label="Editar ${esc(e.title)}">${icon('edit', { size: 16 })}</button>
          <button type="button" class="nb-icon-btn nb-icon-btn--danger" data-delete="${e.id}" title="Eliminar" aria-label="Eliminar ${esc(e.title)}">${icon('trash', { size: 16 })}</button>
        </div>
      </li>
    `;
  }

  function modalHtml(ctx) {
    if (!modal) return '';
    const ev = modal.mode === 'edit' ? getState().events.find(e => e.id === modal.id) : null;
    const v = ev || { venueId: ctx === 'all' ? 'mood' : ctx, date: NEXT_SATURDAY, time: '21:00', endTime: '04:00', capacity: 200, benefit: { title: 'Cóctel de cortesía', description: 'Presentar el pase activo del club al ingresar.' } };
    return `
      <div class="modal-backdrop" id="event-modal-backdrop">
        <div class="nb-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
          <div class="nb-modal__head">
            <h2 class="vt-panel__title" id="event-modal-title">${ev ? 'Editar evento' : 'Nuevo evento'}</h2>
            <button type="button" class="nb-icon-btn" data-close-modal aria-label="Cerrar">${icon('x', { size: 18 })}</button>
          </div>
          <form id="event-editor-form" class="nb-form">
            <div class="form-group">
              <label class="form-label" for="ev-venue">Local</label>
              <select id="ev-venue" class="form-select">
                ${VENUES.map(x => `<option value="${x.id}" ${v.venueId === x.id ? 'selected' : ''}>${x.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="ev-title">Título</label>
              <input id="ev-title" class="form-input" required value="${esc(v.title)}" placeholder="Ej: Mood Sessions: Tech House Night" />
            </div>
            <div class="form-group">
              <label class="form-label" for="ev-subtitle">Subtítulo</label>
              <input id="ev-subtitle" class="form-input" value="${esc(v.subtitle)}" placeholder="Ej: DJ residente y barra signature" />
            </div>
            <div class="nb-form__row">
              <div class="form-group"><label class="form-label" for="ev-date">Fecha</label><input id="ev-date" type="date" class="form-input" required value="${esc(v.date)}" /></div>
              <div class="form-group"><label class="form-label" for="ev-time">Inicio</label><input id="ev-time" type="time" class="form-input" value="${esc(v.time)}" /></div>
              <div class="form-group"><label class="form-label" for="ev-endtime">Fin</label><input id="ev-endtime" type="time" class="form-input" value="${esc(v.endTime)}" /></div>
              <div class="form-group"><label class="form-label" for="ev-capacity">Aforo</label><input id="ev-capacity" type="number" min="50" max="1000" class="form-input" value="${esc(v.capacity)}" /></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="ev-benefit-title">Beneficio para miembros</label>
              <input id="ev-benefit-title" class="form-input" value="${esc(v.benefit?.title)}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="ev-benefit-desc">Condiciones</label>
              <input id="ev-benefit-desc" class="form-input" value="${esc(v.benefit?.description)}" />
            </div>
            <div class="nb-modal__foot">
              <button type="button" class="btn btn--secondary btn--md" data-close-modal>Cancelar</button>
              <button type="submit" class="btn btn--primary btn--md">${ev ? 'Guardar cambios' : 'Crear evento'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function render() {
    const { currentVenueId: ctx } = getState();
    const now = currentWeekend(ctx);
    const events = now.events
      .filter(e => dayFilter === 'all' || now.events.length <= 4 || e.date === dayFilter)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const later = laterEvents(ctx);
    const hist = [...history(ctx)].reverse();

    return `
      <div class="panel-page nb-page events-page">
        ${pageHeader({
          title: 'Eventos',
          aside: `<button type="button" class="btn btn--primary btn--md nb-header__action" id="btn-open-create-modal">${icon('calendar', { size: 16 })} Nuevo evento</button>`,
        })}

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Este fin de semana <span class="nb-muted">${now.label}</span></h2>
            ${now.events.length > 4 ? `
              <div class="nb-filter" role="group" aria-label="Filtrar por día">
                ${[['all', 'Ambos días'], ['2026-10-16', 'Vie 16'], ['2026-10-17', 'Sáb 17']].map(([v, l]) => `
                  <button type="button" class="nb-filter__opt ${dayFilter === v ? 'nb-filter__opt--active' : ''}" data-day="${v}">${l}</button>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <ul class="nb-events">${events.map(eventRow).join('')}</ul>
        </section>

        ${later.length ? `
          <section class="nb-block">
            <div class="nb-block__head">
              <h2 class="vt-panel__title">Más adelante</h2>
            </div>
            <ul class="nb-events">${later.map(eventRow).join('')}</ul>
          </section>
        ` : ''}

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Fines de semana anteriores</h2>
          </div>
          <div class="table-responsive">
            <table class="vt-table nb-table nb-table--compact">
              <thead>
                <tr><th>Fin de semana</th><th>Guardados</th><th>Asistencias</th><th>Conversión</th><th>Ocupación</th></tr>
              </thead>
              <tbody>
                ${hist.map(h => `
                  <tr>
                    <td data-label="Fin de semana"><strong>${h.label}</strong><small class="nb-table__mobile">${h.conversion}% conversión · ${h.occupancy}% ocupación</small></td>
                    <td data-label="Guardados">${fmt(h.saved)}</td>
                    <td data-label="Asistencias" class="nb-table__primary">${fmt(h.checkins)}<span class="nb-table__unit nb-table__mobile"> asistencias</span></td>
                    <td data-label="Conversión">${h.conversion}%</td>
                    <td data-label="Ocupación">${h.occupancy}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>

        ${modalHtml(ctx)}
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

    function closeModal() {
      modal = null;
      rerender();
    }

    function setup() {
      document.querySelectorAll('.events-page [data-day]').forEach(btn => {
        btn.addEventListener('click', () => { dayFilter = btn.dataset.day; rerender(); });
      });

      document.getElementById('btn-open-create-modal')?.addEventListener('click', () => { modal = { mode: 'create' }; rerender(); });
      document.querySelectorAll('.events-page [data-edit]').forEach(btn => {
        btn.addEventListener('click', () => { modal = { mode: 'edit', id: btn.dataset.edit }; rerender(); });
      });
      document.querySelectorAll('.events-page [data-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
          const ev = getState().events.find(e => e.id === btn.dataset.delete);
          if (ev && window.confirm(`¿Eliminar "${ev.title}" de la agenda de la demo?`)) deleteEvent(ev.id);
        });
      });

      // Modal
      document.querySelectorAll('.events-page [data-close-modal]').forEach(btn => btn.addEventListener('click', closeModal));
      const backdrop = document.getElementById('event-modal-backdrop');
      backdrop?.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
      if (backdrop) {
        document.getElementById('ev-title')?.focus();
        backdrop.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
      }

      document.getElementById('event-editor-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = (id) => document.getElementById(id)?.value.trim();
        const date = val('ev-date');
        const data = {
          venueId: val('ev-venue'),
          title: val('ev-title'),
          subtitle: val('ev-subtitle'),
          date,
          dayLabel: dayLabelFor(date),
          time: val('ev-time'),
          endTime: val('ev-endtime'),
          capacity: parseInt(val('ev-capacity'), 10) || 200,
        };
        const benefit = { title: val('ev-benefit-title'), description: val('ev-benefit-desc') };
        const editing = modal?.mode === 'edit' ? getState().events.find(x => x.id === modal.id) : null;
        modal = null;
        if (editing) {
          updateEvent(editing.id, { ...data, benefit: { ...editing.benefit, ...benefit } });
        } else {
          createEvent({ ...data, benefit: { ...benefit, eligibility: 'Miembros con perfil activo', conditions: 'Sujeto a aforo disponible.' } });
        }
      });
    }

    setup();
    const unsubscribe = subscribe(rerender);
    return () => unsubscribe();
  }

  return { html: render(), mount };
}
