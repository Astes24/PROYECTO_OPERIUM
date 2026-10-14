// Operium Club — Negocio: Clientes
// ¿Quién consume en mis locales y cuántos puntos tiene? Operium no cobra ni
// emite boletas: lee las boletas con DNI que ya emite la caja (solo lectura) y,
// si el cliente autorizó sus puntos, las vincula a su perfil. Las boletas de la
// demo se simulan desde el menú "Simular" de la cabecera.

import { getState, subscribe } from '../../store.js';
import { getVenue } from '../../data/venues.js';
import { REWARDS, POINTS_VALID_MONTHS, getReward } from '../../data/loyalty.js';
import { icon } from '../../icons.js';
import { ctxVenues, ctxLabel, currentWeekend, lastWeekend, clientRows, memberPoints, fmt, fmtDate, soles } from '../../metrics.js';
import { pageHeader } from './ui.js';

const PAGE = 8;
const SEGMENTS = { recurrente: 'Recurrente', nuevo: 'Nuevo', sin_interaccion: 'Sin actividad' };

export default function Clients() {
  let showAll = false;
  let query = '';
  let openId = null; // ficha abierta

  function clientModal(member, promoterName) {
    const purchases = [...member.purchases].reverse();
    const points = memberPoints(member);
    return `
      <div class="modal-backdrop" id="client-modal-backdrop">
        <div class="nb-modal cl-modal" role="dialog" aria-modal="true" aria-labelledby="client-modal-title">
          <div class="nb-modal__head">
            <div>
              <h2 class="vt-panel__title" id="client-modal-title">${member.name}</h2>
              <p class="cl-modal__meta">DNI ••••${member.dniLast4} · ${SEGMENTS[member.segment] || member.segment}${member.referredBy ? ` · referido por ${promoterName(member.referredBy)}` : ''}</p>
            </div>
            <button type="button" class="nb-icon-btn" data-close-client aria-label="Cerrar">${icon('x', { size: 18 })}</button>
          </div>
          <dl class="nb-stats">
            <div><dt>Puntos</dt><dd>${member.consent.loyalty ? fmt(points) : '—'}</dd><small>${member.consent.loyalty ? 'en los cuatro locales' : 'no activó sus puntos'}</small></div>
            <div><dt>Consumo total</dt><dd>${soles(member.purchases.reduce((acc, p) => acc + p.amount, 0))}</dd><small>${fmt(member.purchases.length)} boletas</small></div>
            <div><dt>Ingresos con QR</dt><dd>${fmt(member.checkins.length)}</dd></div>
          </dl>
          <h3 class="nb-subtitle cl-modal__title">Boletas</h3>
          ${purchases.length ? `
            <ul class="cl-modal__list">
              ${purchases.map(p => `
                <li>
                  <span>${fmtDate(p.date)}</span>
                  <span>${getVenue(p.venueId)?.name || p.venueId}<small>${p.receipt}</small></span>
                  <span>${soles(p.amount)}</span>
                  <span class="cl-modal__pts">+${fmt(p.points)}</span>
                </li>
              `).join('')}
            </ul>
          ` : '<p class="vt-panel__note">Sin boletas vinculadas.</p>'}
          ${member.redemptions.length ? `
            <h3 class="nb-subtitle cl-modal__title">Canjes</h3>
            <ul class="cl-modal__list">
              ${member.redemptions.map(r => `
                <li>
                  <span>${fmtDate(r.date)}</span>
                  <span>${getReward(r.rewardId)?.title || r.rewardId}<small>${r.code}</small></span>
                  <span>${r.status === 'pendiente' ? 'Pendiente' : 'Usado'}</span>
                  <span class="cl-modal__pts">−${fmt(r.points)}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `;
  }

  function render() {
    const { currentVenueId: ctx, members, promoters } = getState();
    const venues = ctxVenues(ctx);
    const last = lastWeekend(ctx);
    const now = currentWeekend(ctx);
    const rows = clientRows(ctx);
    const active = members.filter(m => m.consent.loyalty).length;
    const redemptions = members.flatMap(m => m.redemptions);
    const promoterName = (id) => promoters.find(p => p.id === id)?.name || '';
    const open = members.find(m => m.id === openId);

    return `
      <div class="panel-page nb-page clients-page">
        ${pageHeader({
          title: 'Clientes',
          aside: `
            <dl class="vt-kpis">
              <div><dt>Consumo registrado</dt><dd>${soles(last.spend)}</dd><small>fin de semana pasado · ${fmt(last.receipts)} boletas</small></div>
              <div><dt>Gasto medio</dt><dd>${soles(last.spend / (last.receipts || 1))}</dd><small>por cliente y noche</small></div>
              <div><dt>Clientes con puntos</dt><dd>${fmt(active)}</dd><small>de ${fmt(members.length)} del club</small></div>
            </dl>
          `,
        })}

        <div class="cl-pos">
          <span class="cl-pos__badge">${icon('card', { size: 15 })} Conectado a caja${venues.length > 1 ? '' : ` de ${venues[0].name}`} · solo lectura</span>
          <span class="cl-pos__now">${now.receipts
            ? `Este fin de semana: <strong>${fmt(now.receipts)} ${now.receipts === 1 ? 'boleta' : 'boletas'}</strong> · <strong>${soles(now.spend)}</strong>`
            : 'Las boletas de este fin de semana llegan desde el viernes 16'}</span>
        </div>

        <div class="nb-grid-2">
          <section class="nb-block">
            <div class="nb-block__head">
              <h2 class="vt-panel__title">Clientes <span class="nb-muted">${fmt(rows.length)}</span></h2>
              <span class="vt-panel__hint">${ctx === 'all' ? 'Los cuatro locales' : `Consumo en ${ctxLabel(ctx)} · puntos del grupo`}</span>
            </div>
            <input type="search" class="form-input cl-search" id="cl-search" placeholder="Buscar por nombre o DNI" value="${query.replace(/"/g, '&quot;')}" autocomplete="off" aria-label="Buscar cliente por nombre o DNI" />
            <div class="table-responsive">
              <table class="vt-table nb-table nb-table--clickable nb-table--compact">
                <thead>
                  <tr><th>Cliente</th><th>Noches</th><th>Consumo</th><th>Puntos</th><th>Último consumo</th></tr>
                </thead>
                <tbody>
                  ${rows.map((r, i) => `
                    <tr data-client="${r.m.id}" data-search="${r.m.name.toLowerCase()} ${r.m.dniLast4}" data-extra="${i >= PAGE}" tabindex="0">
                      <td data-label="Cliente"><strong>${r.m.name}</strong><small>DNI ••••${r.m.dniLast4}${r.m.referredBy ? ` · referido por ${promoterName(r.m.referredBy)}` : ''}</small></td>
                      <td data-label="Noches">${r.nights}</td>
                      <td data-label="Consumo">${soles(r.spend)}</td>
                      <td data-label="Puntos" class="nb-table__primary">${fmt(r.points)}<span class="nb-table__unit"> pts</span></td>
                      <td data-label="Último consumo">${fmtDate(r.lastDate)}<small><span class="mk-venue">${r.lastVenue?.icon || ''}${r.lastVenue?.name || ''}</span></small></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <p class="vt-panel__note cl-empty" hidden>Ningún cliente coincide con la búsqueda.</p>
            ${rows.length > PAGE ? `<button type="button" class="btn btn--ghost btn--sm cl-more" id="cl-more">${showAll ? 'Ver menos' : `Ver los ${fmt(rows.length)}`}</button>` : ''}
          </section>

          <section class="vt-panel">
            <div class="nb-block__head">
              <h3 class="nb-subtitle">Recompensas</h3>
              <span class="vt-panel__hint">1 punto por S/ 1 · válidos ${POINTS_VALID_MONTHS} meses</span>
            </div>
            <ul class="cl-rewards">
              ${REWARDS.map(rw => `
                <li>
                  <span class="cl-rewards__pts">${fmt(rw.points)}<small>pts</small></span>
                  <span><strong>${rw.title}</strong><small>${rw.desc}</small></span>
                  <span class="cl-rewards__count">${fmt(redemptions.filter(r => r.rewardId === rw.id).length)} canjes</span>
                </li>
              `).join('')}
            </ul>
          </section>
        </div>

        ${open ? clientModal(open, promoterName) : ''}
      </div>
    `;
  }

  function mount() {
    function rerender() {
      const el = document.querySelector('.clients-page');
      if (el?.parentElement) {
        el.parentElement.innerHTML = render();
        setup();
      }
    }

    // Filtra en el DOM para no perder el foco del buscador
    function applyFilter() {
      const q = query.trim().toLowerCase();
      let shown = 0;
      document.querySelectorAll('.clients-page [data-client]').forEach(row => {
        const visible = q ? row.dataset.search.includes(q) : (showAll || row.dataset.extra === 'false');
        row.hidden = !visible;
        if (visible) shown++;
      });
      const empty = document.querySelector('.clients-page .cl-empty');
      if (empty) empty.hidden = shown > 0;
      const more = document.getElementById('cl-more');
      if (more) more.hidden = Boolean(q);
    }

    function setup() {
      applyFilter();
      document.getElementById('cl-search')?.addEventListener('input', (e) => {
        query = e.target.value;
        applyFilter();
      });
      document.getElementById('cl-more')?.addEventListener('click', () => {
        showAll = !showAll;
        rerender();
      });
      document.querySelectorAll('.clients-page [data-client]').forEach(row => {
        const go = () => { openId = row.dataset.client; rerender(); };
        row.addEventListener('click', go);
        row.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      });

      const backdrop = document.getElementById('client-modal-backdrop');
      if (backdrop) {
        const close = () => { openId = null; rerender(); };
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
        backdrop.querySelector('[data-close-client]')?.addEventListener('click', close);
        backdrop.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
        backdrop.querySelector('[data-close-client]')?.focus();
      }
    }

    setup();
    const unsubscribe = subscribe(rerender);
    return () => unsubscribe();
  }

  return { html: render(), mount };
}
