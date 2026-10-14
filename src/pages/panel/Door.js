// Operium Club — Negocio: Puerta
// Simula la app del portero dentro de un marco de teléfono. Al lado, lo que el
// encargado ve en vivo de esa noche. Modo principal: escanear el pase QR del
// miembro (como en el cine); respaldo: buscar por nombre. El check-in es
// idempotente: un ingreso por miembro y evento.

import { getState, subscribe, checkIn } from '../../store.js';
import { VENUES, getVenue } from '../../data/venues.js';
import { icon } from '../../icons.js';
import { pct, fmt, soles } from '../../metrics.js';
import { qrSvg, passPayload } from '../../qr.js';
import { pageHeader } from './ui.js';

export default function Door() {
  // Estado de la "app": sobrevive a los re-render del store
  let doorVenueId = null;
  let eventId = '';
  let memberId = '';
  let feedback = '';
  let mode = 'scan'; // scan | search
  let lastScanned = '';

  function render() {
    const { currentVenueId: ctx, events, members } = getState();
    if (ctx !== 'all') doorVenueId = ctx;
    const venue = doorVenueId ? getVenue(doorVenueId) : null;

    const venueEvents = venue ? events.filter(e => e.venueId === venue.id) : [];
    if (!venueEvents.some(e => e.id === eventId)) {
      eventId = (venueEvents.find(e => !e.finished) || venueEvents[0])?.id || '';
      memberId = '';
      feedback = '';
      lastScanned = '';
    }
    const event = venueEvents.find(e => e.id === eventId);
    const { currentMemberId, promoters } = getState();

    // Fila con pase: quien guardó el evento y aún no entró. El miembro de la
    // vista público va primero, para seguir la historia del recorrido.
    const queue = members
      .filter(m => m.savedEvents.includes(eventId) && !m.checkins.some(c => c.eventId === eventId))
      .sort((a, b) => Number(b.id === currentMemberId) - Number(a.id === currentMemberId));
    const next = queue[0];

    // Primero quien guardó el evento: es a quien el portero buscará antes
    const candidates = members.slice(0, 40).map(m => ({
      m,
      saved: m.savedEvents.includes(eventId),
      inside: m.checkins.some(c => c.eventId === eventId),
    })).sort((a, b) => Number(b.saved) - Number(a.saved));
    if (!memberId && candidates[0]) memberId = candidates[0].m.id;

    const inside = members
      .flatMap(m => m.checkins.filter(c => c.eventId === eventId).map(c => ({ m, c })))
      .reverse();

    return `
      <div class="panel-page nb-page door-page">
        ${pageHeader({ title: 'Puerta' })}

        <div class="door-layout">
          <div class="door-device" aria-label="Simulación de la app del portero">
            <span class="door-device__tag">${icon('zap', { size: 12 })} Simulación de la app de puerta</span>
            <div class="door-phone">
              ${!venue ? `
                <div class="door-app">
                  <div class="door-app__bar"><strong>Operium Puerta</strong></div>
                  <p class="door-app__ask">¿En qué local estás?</p>
                  <div class="door-app__venues">
                    ${VENUES.map(v => `<button type="button" class="door-app__venue" data-door-venue="${v.id}">${v.icon}${v.name}</button>`).join('')}
                  </div>
                </div>
              ` : `
                <div class="door-app">
                  <div class="door-app__bar">
                    <strong>${venue.icon}Puerta · ${venue.name}</strong>
                    ${ctx === 'all' ? `<button type="button" class="door-app__change" data-door-venue="">Cambiar</button>` : ''}
                  </div>

                  <label class="door-app__label" for="door-event">Evento</label>
                  <select id="door-event" class="form-select">
                    ${venueEvents.map(e => `<option value="${e.id}" ${e.id === eventId ? 'selected' : ''}>${e.dayLabel.split(' ')[0]} ${e.time} · ${e.title}</option>`).join('')}
                  </select>

                  <div class="door-modes" role="tablist" aria-label="Forma de registro">
                    <button type="button" role="tab" class="door-modes__opt ${mode === 'scan' ? 'is-active' : ''}" aria-selected="${mode === 'scan'}" data-door-mode="scan">${icon('camera', { size: 15 })} Escanear QR</button>
                    <button type="button" role="tab" class="door-modes__opt ${mode === 'search' ? 'is-active' : ''}" aria-selected="${mode === 'search'}" data-door-mode="search">${icon('search', { size: 15 })} Buscar</button>
                  </div>

                  ${mode === 'scan' ? `
                    <div class="door-scan">
                      <div class="door-scan__view">
                        ${next ? `${qrSvg(passPayload(next.id, eventId), { size: 132, label: 'Pase QR frente a la cámara' })}<span class="door-scan__line" aria-hidden="true"></span>` : `<span class="door-scan__empty">Nadie más en la fila con pase</span>`}
                        <span class="door-scan__corner door-scan__corner--tl"></span><span class="door-scan__corner door-scan__corner--tr"></span>
                        <span class="door-scan__corner door-scan__corner--bl"></span><span class="door-scan__corner door-scan__corner--br"></span>
                      </div>
                      <p class="door-scan__hint">${next ? `${fmt(queue.length)} ${queue.length === 1 ? 'persona' : 'personas'} en la fila con pase` : 'Quien no guardó el evento entra con “Buscar”.'}</p>
                    </div>
                    <button type="button" class="btn btn--primary btn--lg door-app__go" id="door-scan" ${next ? '' : 'disabled'}>
                      ${icon('camera', { size: 18 })} Escanear
                    </button>
                    ${lastScanned ? `<button type="button" class="door-app__again" id="door-scan-again">Volver a escanear el mismo pase</button>` : ''}
                    <div class="door-app__result" aria-live="polite">${feedback}</div>
                  ` : `
                  <label class="door-app__label" for="door-search">Buscar miembro</label>
                  <input id="door-search" class="form-input" type="search" placeholder="Nombre…" autocomplete="off" />

                  <ul class="door-app__list" id="door-list">
                    ${candidates.map(({ m, saved, inside: isIn }) => `
                      <li>
                        <button type="button" class="door-app__member ${m.id === memberId ? 'is-selected' : ''}" data-member="${m.id}" data-name="${m.name.toLowerCase()}">
                          <span>${m.name}</span>
                          ${isIn ? '<em class="door-tag door-tag--in">Ya ingresó</em>' : saved ? '<em class="door-tag">Guardó</em>' : ''}
                        </button>
                      </li>
                    `).join('')}
                  </ul>

                  <button type="button" class="btn btn--primary btn--lg door-app__go" id="door-checkin" ${memberId ? '' : 'disabled'}>
                    ${icon('ticket', { size: 18 })} Registrar ingreso
                  </button>
                  <div class="door-app__result" aria-live="polite">${feedback}</div>
                  `}
                </div>
              `}
            </div>
          </div>

          <section class="vt-panel door-live">
            ${event ? `
              <span class="section-title__eyebrow">Esta noche en la puerta</span>
              <h2 class="vt-panel__title">${event.title}</h2>
              <dl class="nb-stats">
                <div><dt>Ingresos</dt><dd>${fmt(event.checkinCount)}</dd><small>de ${fmt(event.capacity)} de aforo</small></div>
                <div><dt>Guardaron y vinieron</dt><dd class="nb-accent">${fmt(event.savedAttended)}</dd><small>de ${fmt(event.savedCount)} que guardaron (${pct(event.savedAttended, event.savedCount)}%)</small></div>
                <div><dt>Consumo registrado</dt>${event.identifiedReceipts
                  ? `<dd>${soles(event.identifiedSpend)}</dd><small>${fmt(event.identifiedReceipts)} boletas de caja</small>`
                  : '<dd class="nb-muted">—</dd><small>llega de caja durante la noche</small>'}</div>
              </dl>
              <h3 class="nb-subtitle">Últimos ingresos con nombre</h3>
              ${inside.length ? `
                <ol class="vt-feed">
                  ${inside.slice(0, 6).map(({ m, c }) => `
                    <li class="vt-feed__item vt-feed__item--checkin">
                      <span class="vt-feed__icon">${icon('check', { size: 14 })}</span>
                      <div><div><strong>${m.name}</strong>${m.referredBy ? ` · referido por ${promoters.find(p => p.id === m.referredBy)?.name || ''}` : ''}</div><small>${c.time} · ${c.method === 'qr' ? 'pase QR' : 'búsqueda manual'} · validó ${c.validatedBy}</small></div>
                    </li>
                  `).join('')}
                </ol>
              ` : '<p class="vt-panel__note">Sin ingresos todavía.</p>'}
            ` : '<p class="vt-panel__note">Elige un local en el teléfono para empezar.</p>'}
          </section>
        </div>
      </div>
    `;
  }

  function mount() {
    function rerender() {
      const el = document.querySelector('.door-page');
      if (el?.parentElement) {
        el.parentElement.innerHTML = render();
        setup();
      }
    }

    function setup() {
      document.querySelectorAll('.door-page [data-door-venue]').forEach(btn => {
        btn.addEventListener('click', () => {
          doorVenueId = btn.dataset.doorVenue || null;
          eventId = '';
          rerender();
        });
      });

      document.getElementById('door-event')?.addEventListener('change', (e) => {
        eventId = e.target.value;
        memberId = '';
        feedback = '';
        lastScanned = '';
        rerender();
      });

      document.querySelectorAll('.door-page [data-door-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          mode = btn.dataset.doorMode;
          feedback = '';
          rerender();
        });
      });

      // Escaneo simulado: lee el pase de quien está frente a la cámara
      const scan = (id) => {
        const state = getState();
        const member = state.members.find(m => m.id === id);
        if (!member) return;
        const venue = getVenue(doorVenueId);
        const result = checkIn(id, eventId, venue?.manager || 'Puerta', 'qr');
        lastScanned = id;
        const promoter = state.promoters.find(p => p.id === member.referredBy);
        feedback = result.success
          ? `<div class="door-verdict door-verdict--ok">${icon('check', { size: 28 })}<strong>Ingreso válido</strong><span>${member.name}</span><small>${result.checkin?.time}${promoter ? ` · referido por ${promoter.name}` : ''}</small></div>`
          : result.duplicate
            ? `<div class="door-verdict door-verdict--dup">${icon('lock', { size: 28 })}<strong>Ya ingresó</strong><span>${member.name}</span><small>Este pase ya se usó esta noche. El conteo no cambia.</small></div>`
            : `<div class="door-verdict door-verdict--bad">${icon('x', { size: 28 })}<strong>Pase no válido</strong><small>${result.reason}</small></div>`;
        rerender();
      };
      document.getElementById('door-scan')?.addEventListener('click', () => {
        const { members, currentMemberId } = getState();
        const next = members
          .filter(m => m.savedEvents.includes(eventId) && !m.checkins.some(c => c.eventId === eventId))
          .sort((a, b) => Number(b.id === currentMemberId) - Number(a.id === currentMemberId))[0];
        if (next) scan(next.id);
      });
      document.getElementById('door-scan-again')?.addEventListener('click', () => scan(lastScanned));

      // Filtro en el propio DOM para no perder el foco del buscador
      document.getElementById('door-search')?.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        document.querySelectorAll('#door-list [data-name]').forEach(btn => {
          btn.parentElement.hidden = q && !btn.dataset.name.includes(q);
        });
      });

      document.querySelectorAll('.door-page [data-member]').forEach(btn => {
        btn.addEventListener('click', () => {
          memberId = btn.dataset.member;
          feedback = '';
          document.querySelectorAll('.door-page [data-member]').forEach(b => b.classList.toggle('is-selected', b === btn));
          const box = document.querySelector('.door-app__result');
          if (box) box.innerHTML = '';
          const go = document.getElementById('door-checkin');
          if (go) go.disabled = false;
        });
      });

      document.getElementById('door-checkin')?.addEventListener('click', () => {
        const state = getState();
        const member = state.members.find(m => m.id === memberId);
        const venue = getVenue(doorVenueId);
        const result = checkIn(memberId, eventId, venue?.manager || 'Puerta', 'manual');
        const name = member ? member.name : memberId;
        feedback = result.success
          ? `<div class="vt-result vt-result--ok">${icon('check', { size: 16 })}<div><strong>Ingreso registrado.</strong> ${name} · ${result.checkin?.time}</div></div>`
          : result.duplicate
            ? `<div class="vt-result vt-result--blocked">${icon('lock', { size: 16 })}<div><strong>Duplicado bloqueado.</strong> ${name} ya ingresó. El conteo no cambia.</div></div>`
            : `<div class="vt-result vt-result--error">${icon('alert', { size: 16 })}<div>${result.reason}</div></div>`;
        rerender();
      });
    }

    setup();
    const unsubscribe = subscribe(rerender);
    return () => unsubscribe();
  }

  return { html: render(), mount };
}
