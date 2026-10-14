// Operium Club — Negocio: Promotores
// Ranking y detalle del promotor elegido. Un promotor suma
// puntos solo por lo verificado: el ingreso con el QR de su referido y las
// boletas con DNI de ese referido (90 días desde que se registró con su enlace).
// Las visitas a los enlaces de la demo se simulan desde el menú "Simular".

import { getState, subscribe } from '../../store.js';
import { getVenue } from '../../data/venues.js';
import { PROMO_POINTS_PER_ENTRY, PROMO_SOLES_PER_POINT, REFERRAL_WINDOW_DAYS } from '../../data/loyalty.js';
import { icon } from '../../icons.js';
import { ctxVenues, ctxPromoters, promoterStats, lastWeekend, fmt, fmtDate, soles } from '../../metrics.js';
import { pageHeader, sourceBar } from './ui.js';

export default function Promoters() {
  let selectedId = null;

  function render() {
    const { currentVenueId: ctx, members, events } = getState();
    const promoters = ctxPromoters(ctx)
      .map(p => ({ p, s: promoterStats(p) }))
      .sort((a, b) => b.s.last.points - a.s.last.points);
    const venues = ctxVenues(ctx);
    if (!promoters.some(({ p }) => p.id === selectedId)) selectedId = promoters[0]?.p.id || null;
    const sel = promoters.find(({ p }) => p.id === selectedId);

    return `
      <div class="panel-page nb-page promoters-page">
        ${pageHeader({ title: 'Promotores' })}

        ${promoters.length > 1 ? `<section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Ranking <span class="nb-muted">${lastWeekend(ctx).label}</span></h2>
            <span class="vt-panel__hint">+${PROMO_POINTS_PER_ENTRY} por ingreso con QR · +1 por cada S/ ${PROMO_SOLES_PER_POINT} de consumo con DNI · ${REFERRAL_WINDOW_DAYS} días</span>
          </div>
          <div class="table-responsive">
            <table class="vt-table nb-table nb-table--clickable nb-table--compact">
              <thead>
                <tr><th>Promotor</th><th>Entraron con QR</th><th>Consumo de referidos</th><th>Por referido</th><th>Puntos</th><th>Este finde</th></tr>
              </thead>
              <tbody>
                ${promoters.map(({ p, s }, i) => {
                  const venue = getVenue(p.venue);
                  return `
                    <tr data-select="${p.id}" tabindex="0" class="${p.id === selectedId && promoters.length > 1 ? 'is-selected' : ''}">
                      <td data-label="Promotor"><span class="pm-rank">${i + 1}</span><strong>${p.name}</strong><small><span class="mk-venue">${venue?.icon || ''}${venue?.name || ''}</span></small></td>
                      <td data-label="Entraron con QR">${fmt(s.last.attended)}</td>
                      <td data-label="Consumo de referidos">${soles(s.last.spend)}</td>
                      <td data-label="Por referido">${soles(s.spendPerReferral)}</td>
                      <td data-label="Puntos" class="nb-table__primary">${fmt(s.last.points)}<span class="nb-table__unit"> pts</span></td>
                      <td data-label="Este finde">${s.live.points ? `${fmt(s.live.points)} pts` : '<span class="nb-muted">—</span>'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </section>` : ''}
        ${promoters.length === 0 ? `<p class="vt-panel__note">Sin promotores en ${venues[0]?.name}.</p>` : ''}

        ${sel ? (() => {
          const { p, s } = sel;
          const venue = getVenue(p.venue);
          const feed = [
            ...s.live.feed.map(item => ({
              icon: item.kind === 'entry' ? 'ticket' : 'card',
              text: `<strong>${item.m.firstName}</strong> ${item.kind === 'entry' ? 'entró con su QR' : 'consumió con su DNI'}`,
              meta: item.kind === 'entry' ? `+${PROMO_POINTS_PER_ENTRY} pts` : `+${Math.floor(item.amount / PROMO_SOLES_PER_POINT)} pts`,
              date: item.date,
            })),
            ...(p.signals || []).slice().reverse().map(sig => {
              const m = members.find(x => x.id === sig.memberId);
              const e = events.find(x => x.id === sig.eventId);
              return { icon: 'link', text: `<strong>${m ? m.firstName : sig.memberId}</strong> abrió ${e ? e.title : sig.eventId}`, meta: 'visita', date: sig.date };
            }),
          ].slice(0, 5);
          return `
            <section class="vt-panel pm-detail" data-promoter-id="${p.id}">
              <div class="pm-detail__main">
                <div class="pr-card__head">
                  <div>
                    <h2 class="vt-panel__title">${p.name}</h2>
                    <p class="pr-card__meta">${venue?.icon || ''}${venue?.name || ''} · <code>${p.code}</code></p>
                  </div>
                </div>
                ${promoters.length === 1 ? `
                  <dl class="nb-stats">
                    <div><dt>Puntos</dt><dd>${fmt(s.last.points)}</dd><small>${lastWeekend(ctx).label}</small></div>
                    <div><dt>Entraron con QR</dt><dd>${fmt(s.last.attended)}</dd></div>
                    <div><dt>Consumo de referidos</dt><dd>${soles(s.last.spend)}</dd><small>${soles(s.spendPerReferral)} por referido</small></div>
                  </dl>
                ` : ''}
                <dl class="nb-stats">
                  <div><dt>Puntos este finde</dt>${s.live.attended || s.live.spend
                    ? `<dd>${fmt(s.live.points)}</dd><small>${fmt(s.live.attended)} con QR · ${soles(s.live.spend)}</small>`
                    : '<dd class="nb-muted">—</dd><small>desde el viernes 16</small>'}</div>
                  <div><dt>Referidos activos</dt><dd>${fmt(s.live.referrals)}</dd></div>
                  <div><dt>Visitas al enlace</dt><dd id="signal-count-${p.id}">${fmt(s.weekendVisits)}</dd><small>este finde</small></div>
                </dl>
                ${promoters.length === 1 ? `<p class="vt-panel__note">+${PROMO_POINTS_PER_ENTRY} por ingreso con QR · +1 por cada S/ ${PROMO_SOLES_PER_POINT} de consumo con DNI · ${REFERRAL_WINDOW_DAYS} días</p>` : ''}
              </div>
              <div class="pm-detail__side">
                <div class="pr-link pr-link--compact">
                  <code>${p.link.replace('https://', '')}</code>
                  <button type="button" class="btn btn--ghost btn--sm btn-copy-link" data-link="${p.link}">
                    ${icon('copy', { size: 14 })} <span class="btn-copy-text">Copiar</span>
                  </button>
                </div>
                <ol class="vt-feed">
                  ${feed.map(f => `
                    <li class="vt-feed__item">
                      <span class="vt-feed__icon">${icon(f.icon, { size: 14 })}</span>
                      <div><div>${f.text}</div><small>${fmtDate(f.date)} · ${f.meta}</small></div>
                    </li>
                  `).join('')}
                </ol>
              </div>
            </section>
          `;
        })() : ''}

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Origen del público <span class="nb-muted">${lastWeekend(ctx).label}</span></h2>
          </div>
          <div class="nb-sources">
            ${venues.map(v => `
              <div class="nb-sources__row">
                <span class="gr-venue">${v.icon}<strong>${v.name}</strong></span>
                ${sourceBar(lastWeekend(v.id).bySource)}
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function mount() {
    function rerender() {
      const el = document.querySelector('.promoters-page');
      if (el?.parentElement) {
        el.parentElement.innerHTML = render();
        setup();
      }
    }

    function setup() {
      document.querySelectorAll('.promoters-page [data-select]').forEach(row => {
        const go = () => { selectedId = row.dataset.select; rerender(); };
        row.addEventListener('click', go);
        row.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      });

      document.querySelectorAll('.promoters-page .btn-copy-link').forEach(btn => {
        btn.addEventListener('click', async () => {
          const text = btn.querySelector('.btn-copy-text');
          try {
            await navigator.clipboard?.writeText(btn.dataset.link);
            if (text) text.textContent = 'Copiado';
            setTimeout(() => { if (text) text.textContent = 'Copiar'; }, 2000);
          } catch (err) {
            console.error('Error al copiar:', err);
          }
        });
      });
    }

    setup();
    const unsubscribe = subscribe(rerender);
    return () => unsubscribe();
  }

  return { html: render(), mount };
}
