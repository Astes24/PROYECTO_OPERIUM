// Operium Club — Negocio: Origen del público
// Pregunta: ¿de dónde llega mi público? Promotores, campañas o directo.
// La simulación son dos botones discretos: una visita nueva y repetir la misma
// (para mostrar que no se atribuye dos veces).

import { getState, subscribe, simulatePromoterSignal } from '../../store.js';
import { getVenue } from '../../data/venues.js';
import { icon } from '../../icons.js';
import { ctxVenues, ctxPromoters, promoterStats, lastWeekend, originInsight, fmt } from '../../metrics.js';
import { pageHeader, simButton, sourceBar, trendBars } from './ui.js';

export default function Origin() {
  // Última visita simulada y resultado por promotor (sobreviven al re-render)
  const lastSim = {};
  const feedback = {};

  function render() {
    const { currentVenueId: ctx, members, events } = getState();
    const promoters = ctxPromoters(ctx).map(p => ({ p, s: promoterStats(p) }));
    const venues = ctxVenues(ctx);

    const weekendVisits = promoters.reduce((acc, { s }) => acc + s.weekendVisits, 0);
    const lastAttended = promoters.reduce((acc, { s }) => acc + s.last.attended, 0);
    const newMembers = promoters.reduce((acc, { s }) => acc + s.registered4, 0);

    return `
      <div class="panel-page nb-page origin-page">
        ${pageHeader({
          ctx,
          eyebrow: 'Origen',
          title: 'De dónde llega el público',
          insight: originInsight(ctx),
          aside: `
            <dl class="vt-kpis">
              <div><dt>Visitas por enlace</dt><dd>${fmt(weekendVisits)}</dd><small>este fin de semana</small></div>
              <div><dt>Asistentes por promotor</dt><dd>${fmt(lastAttended)}</dd><small>fin de semana pasado</small></div>
              <div><dt>Nuevos miembros</dt><dd>${fmt(newMembers)}</dd><small>últimas 4 semanas</small></div>
            </dl>
          `,
        })}

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Origen de las asistencias <span class="nb-muted">· ${lastWeekend(ctx).label}</span></h2>
          </div>
          <div class="nb-sources">
            ${venues.map(v => `
              <div class="nb-sources__row">
                <span class="gr-venue">${v.icon}<strong>${v.name}</strong></span>
                ${sourceBar(lastWeekend(v.id).bySource)}
              </div>
            `).join('')}
          </div>
          <p class="vt-panel__note">Directo: llegaron sin enlace de promotor ni campaña (Instagram, recomendación, de paso).</p>
        </section>

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Promotores</h2>
            <span class="vt-panel__hint">Una visita por miembro y evento. Sin comisiones en esta fase.</span>
          </div>
          <div class="nb-promoters">
            ${promoters.map(({ p, s }) => {
              const venue = getVenue(p.venue);
              const recent = (p.signals || []).slice(-3).reverse();
              return `
                <article class="vt-panel pr-card" data-promoter-id="${p.id}">
                  <div class="pr-card__head">
                    <div class="pr-card__avatar">${p.name.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <h3 class="vt-panel__title">${p.name}</h3>
                      <p class="pr-card__meta">${venue?.icon || ''}${venue?.name || ''} · <code>${p.code}</code></p>
                      <p class="pr-card__bio">${p.bio}</p>
                    </div>
                  </div>

                  <dl class="nb-stats">
                    <div><dt>Visitas este finde</dt><dd id="signal-count-${p.id}">${fmt(s.weekendVisits)}</dd></div>
                    <div><dt>Asistentes (pasado)</dt><dd>${fmt(s.last.attended)}</dd><small>${s.shareOfVenue}% del público de ${venue?.name}</small></div>
                    <div><dt>De visita a asistencia</dt><dd class="nb-accent">${s.visitToAttend}%</dd><small>últimas 4 semanas</small></div>
                  </dl>

                  <div class="pr-card__trend">
                    <span class="form-label">Asistentes por semana</span>
                    ${trendBars(s.history.map(h => ({ ...h, short: h.label.split('–')[0] + ' ' + h.label.split(' ').at(-1) })), 'attended')}
                  </div>

                  <div class="pr-link pr-link--compact">
                    <code>${p.link.replace('https://', '')}</code>
                    <button type="button" class="btn btn--ghost btn--sm btn-copy-link" data-link="${p.link}">
                      ${icon('copy', { size: 14 })} <span class="btn-copy-text">Copiar enlace</span>
                    </button>
                  </div>

                  <div class="pr-card__sim">
                    ${simButton('Simular visita', `data-sim="new" data-promoter-id="${p.id}"`)}
                    ${simButton('Repetir la misma', `data-sim="repeat" data-promoter-id="${p.id}" ${lastSim[p.id] ? '' : 'disabled'}`)}
                  </div>
                  <div class="pr-sim__result" aria-live="polite">${feedback[p.id] || ''}</div>

                  <div class="pr-history">
                    <span class="form-label">Últimas visitas</span>
                    <ol class="vt-feed">
                      ${recent.map(sig => {
                        const m = members.find(x => x.id === sig.memberId);
                        const e = events.find(x => x.id === sig.eventId);
                        return `
                          <li class="vt-feed__item">
                            <span class="vt-feed__icon">${icon('link', { size: 14 })}</span>
                            <div><div><strong>${m ? m.name : sig.memberId}</strong> abrió ${e ? e.title : sig.eventId}</div><small>${sig.date}</small></div>
                          </li>
                        `;
                      }).join('')}
                    </ol>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
          ${promoters.length === 0 ? `<p class="vt-panel__note">Sin promotores asignados a ${venues[0]?.name}.</p>` : ''}
        </section>
      </div>
    `;
  }

  function mount() {
    function rerender() {
      const el = document.querySelector('.origin-page');
      if (el?.parentElement) {
        el.parentElement.innerHTML = render();
        setup();
      }
    }

    function setup() {
      document.querySelectorAll('.origin-page .btn-copy-link').forEach(btn => {
        btn.addEventListener('click', async () => {
          const text = btn.querySelector('.btn-copy-text');
          try {
            await navigator.clipboard?.writeText(btn.dataset.link);
            if (text) text.textContent = 'Copiado';
            setTimeout(() => { if (text) text.textContent = 'Copiar enlace'; }, 2000);
          } catch (err) {
            console.error('Error al copiar:', err);
          }
        });
      });

      document.querySelectorAll('.origin-page [data-sim]').forEach(btn => {
        btn.addEventListener('click', () => {
          const promoterId = btn.dataset.promoterId;
          const state = getState();
          const promoter = state.promoters.find(p => p.id === promoterId);
          if (!promoter) return;

          let pick = lastSim[promoterId];
          if (btn.dataset.sim === 'new') {
            // Primer miembro que aún no llegó por este enlace al próximo evento del local
            const event = state.events.find(e => e.venueId === promoter.venue && !e.finished)
              || state.events.find(e => e.venueId === promoter.venue);
            const member = state.members.find(m => !promoter.signals.some(sg => sg.memberId === m.id && sg.eventId === event.id));
            if (!event || !member) return;
            pick = { memberId: member.id, eventId: event.id };
          }
          if (!pick) return;

          const member = state.members.find(m => m.id === pick.memberId);
          const name = member ? member.name : pick.memberId;
          lastSim[promoterId] = pick;
          const ok = simulatePromoterSignal(promoterId, pick.memberId, pick.eventId);
          feedback[promoterId] = ok
            ? `<div class="vt-result vt-result--ok">${icon('check', { size: 16 })}<div><strong>Visita atribuida.</strong> ${name} llegó por este enlace.</div></div>`
            : `<div class="vt-result vt-result--blocked">${icon('lock', { size: 16 })}<div><strong>Ya estaba atribuida.</strong> ${name} no cuenta dos veces para el mismo evento.</div></div>`;
          // Si hubo visita nueva el store re-renderiza; si no, se pinta aquí
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
