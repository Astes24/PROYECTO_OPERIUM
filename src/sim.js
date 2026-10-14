// Operium Club — Simulaciones de la demo
// Todo lo que en producción llegaría de fuera (boletas de caja, visitas a los
// enlaces de promotor, el cierre de una noche) se dispara desde el menú
// "Simular" de la cabecera, para que las pantallas del negocio se vean como
// el producto real. Cada acción devuelve un resultado para mostrarlo en el menú.

import { getState, recordPurchase, simulatePromoterSignal, simulateFriday } from './store.js';
import { ctxVenues, ctxPromoters, soles } from './metrics.js';
import { AVG_TICKET } from './data/loyalty.js';

const CURRENT_DATES = ['2026-10-16', '2026-10-17'];
let lastVisit = null; // { promoterId, memberId, eventId }

// — Boleta de caja —
// Primero quien entró este fin de semana (empezando por el miembro de la vista
// público, para seguir la historia del recorrido); si no, cualquier cliente.
function pickPurchase(linked) {
  const { members, events, currentMemberId, currentVenueId: ctx, receiptSeq } = getState();
  const venueIds = ctxVenues(ctx).map(v => v.id);
  const eventOf = (id) => events.find(e => e.id === id);

  if (linked) {
    const inside = [...members]
      .sort((a, b) => Number(b.id === currentMemberId) - Number(a.id === currentMemberId))
      .flatMap(m => m.checkins.map(c => ({ m, e: eventOf(c.eventId) })))
      .find(({ m, e }) => e && m.consent.loyalty && venueIds.includes(e.venueId) && CURRENT_DATES.includes(e.date)
        && !m.purchases.some(p => p.eventId === e.id));
    if (inside) return { member: inside.m, event: inside.e, venueId: inside.e.venueId };
  }

  const pool = members.filter(m => Boolean(m.consent.loyalty) === linked && venueIds.some(v => m.consent.byVenue[v]));
  const member = pool[(receiptSeq || 0) % (pool.length || 1)];
  if (!member) return null;
  const venueId = venueIds.find(v => member.consent.byVenue[v]);
  const event = events.find(e => e.venueId === venueId && CURRENT_DATES.includes(e.date) && !e.finished)
    || events.find(e => e.venueId === venueId && CURRENT_DATES.includes(e.date));
  return { member, event, venueId };
}

export function simReceipt(linked) {
  const pick = pickPurchase(linked);
  if (!pick) return { kind: 'error', text: 'No hay clientes para simular en este local.' };
  const seq = getState().receiptSeq || 0;
  const amount = Math.round(AVG_TICKET[pick.venueId] * (0.8 + ((seq * 37) % 9) / 10));
  const result = recordPurchase(pick.member.id, pick.venueId, amount, pick.event?.id || null);
  const venue = getState().venues.find(v => v.id === pick.venueId);
  return result.linked
    ? { kind: 'ok', text: `Boleta ${result.receipt} de ${soles(amount)} en ${venue?.name}: ${pick.member.name} suma ${result.points} puntos.` }
    : { kind: 'blocked', text: `Boleta ${result.receipt} de ${soles(amount)} sin vincular: el cliente no tiene los puntos activos.` };
}

// — Visita al enlace de un promotor —
export function simPromoterVisit(repeat = false) {
  const state = getState();
  let pick = repeat ? lastVisit : null;
  if (!pick) {
    const promoters = ctxPromoters(state.currentVenueId);
    if (!promoters.length) return { kind: 'error', text: 'No hay promotores en este local.' };
    const total = promoters.reduce((acc, p) => acc + p.signals.length, 0);
    const promoter = promoters[total % promoters.length];
    const event = state.events.find(e => e.venueId === promoter.venue && !e.finished)
      || state.events.find(e => e.venueId === promoter.venue);
    const member = state.members.find(m => !promoter.signals.some(sg => sg.memberId === m.id && sg.eventId === event?.id));
    if (!event || !member) return { kind: 'error', text: 'No quedan visitas por simular.' };
    pick = { promoterId: promoter.id, memberId: member.id, eventId: event.id };
  }
  lastVisit = pick;
  const promoter = state.promoters.find(p => p.id === pick.promoterId);
  const member = state.members.find(m => m.id === pick.memberId);
  const ok = simulatePromoterSignal(pick.promoterId, pick.memberId, pick.eventId);
  return ok
    ? { kind: 'ok', text: `${member?.name} abrió el enlace de ${promoter?.name}. Visita atribuida.` }
    : { kind: 'blocked', text: `${member?.name} ya había llegado por el enlace de ${promoter?.name}: no cuenta dos veces.` };
}

export const hasLastVisit = () => Boolean(lastVisit);

// — Cerrar la noche del viernes —
export const fridayDone = () => getState().events.some(e => e.finished);

export function simFriday() {
  if (fridayDone()) return { kind: 'blocked', text: 'La noche del viernes ya está cerrada. Reinicia la demo para repetirla.' };
  simulateFriday();
  return { kind: 'ok', text: 'Noche del viernes cerrada: asistencia, conversión y consumo registrados.' };
}
