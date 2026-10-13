// Operium Club — Métricas derivadas del estado y del historial
// Todo se calcula por contexto: 'all' (todo el grupo) o el id de un local.
// Las frases de conclusión salen de estos mismos números: nunca se inventan.

import { getState } from './store.js';
import { VENUES } from './data/venues.js';
import { VENUE_HISTORY, PROMOTER_HISTORY, DEMO_TODAY, CURRENT_WEEKEND } from './data/history.js';

export const pct = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);
export const fmt = (n) => Number(n || 0).toLocaleString('es-PE');

export function ctxVenues(ctx) {
  return ctx === 'all' ? VENUES : VENUES.filter(v => v.id === ctx);
}

export function ctxLabel(ctx) {
  if (ctx === 'all') return 'Todo el grupo';
  return VENUES.find(v => v.id === ctx)?.name || ctx;
}

// — Estado de un evento respecto al "hoy" de la demo (jueves 15) —
export function eventStatus(event) {
  if (event.finished) return { key: 'finished', label: 'Finalizado' };
  if (event.checkinCount > 0) return { key: 'live', label: 'En curso' };
  const days = Math.round((new Date(event.date) - new Date(DEMO_TODAY)) / 86400000);
  if (days <= 0) return { key: 'live', label: 'Esta noche' };
  if (days === 1) return { key: 'upcoming', label: `Mañana · ${event.time}` };
  return { key: 'upcoming', label: `${event.dayLabel.split(' ')[0]} · ${event.time}` };
}

// — Este fin de semana (16–17 oct), con los datos vivos del store —
export function currentWeekend(ctx) {
  const ids = ctxVenues(ctx).map(v => v.id);
  const events = getState().events.filter(e => ids.includes(e.venueId));
  const finished = events.filter(e => e.finished);
  const sum = (list, key) => list.reduce((acc, e) => acc + (e[key] || 0), 0);
  return {
    label: CURRENT_WEEKEND.label,
    events,
    saved: sum(events, 'savedCount'),
    checkins: sum(events, 'checkinCount'),
    capacity: sum(events, 'capacity'),
    started: finished.length > 0,
    finishedCount: finished.length,
    // La conversión solo tiene sentido en eventos ya celebrados
    conversion: pct(sum(finished, 'savedAttended'), sum(finished, 'savedCount')),
    occupancy: pct(sum(finished, 'checkinCount'), sum(finished, 'capacity')),
  };
}

// — Historial agregado por fin de semana —
export function history(ctx) {
  const ids = ctxVenues(ctx).map(v => v.id);
  const base = VENUE_HISTORY[ids[0]];
  return base.map((week, i) => {
    const rows = ids.map(id => VENUE_HISTORY[id][i]);
    const total = (key) => rows.reduce((acc, r) => acc + r[key], 0);
    const source = (key) => rows.reduce((acc, r) => acc + r.bySource[key], 0);
    const saved = total('saved');
    const checkins = total('checkins');
    const capacity = total('capacity');
    return {
      weekend: week.weekend,
      label: week.label,
      short: week.short,
      saved,
      savedAttended: total('savedAttended'),
      checkins,
      capacity,
      conversion: pct(total('savedAttended'), saved),
      occupancy: pct(checkins, capacity),
      bySource: { promotor: source('promotor'), campana: source('campana'), directo: source('directo') },
    };
  });
}

export const lastWeekend = (ctx) => history(ctx).at(-1);

export function followers(ctx) {
  const ids = ctxVenues(ctx).map(v => v.id);
  return getState().members.filter(m => m.following.some(v => ids.includes(v))).length;
}

// — Fila resumida por local (tabla del grupo) —
export function venueRow(venueId) {
  const now = currentWeekend(venueId);
  const last = lastWeekend(venueId);
  return { now, last, followers: followers(venueId) };
}

// — Promotores —
export function promoterStats(promoter) {
  const hist = PROMOTER_HISTORY[promoter.id] || [];
  const total = (key) => hist.reduce((acc, r) => acc + r[key], 0);
  const last = hist.at(-1) || { visits: 0, registered: 0, attended: 0 };
  const venueLast = VENUE_HISTORY[promoter.venue]?.at(-1);
  return {
    weekendVisits: (promoter.weekendVisitsBase || 0) + (promoter.signals?.length || 0),
    last,
    visits4: total('visits'),
    attended4: total('attended'),
    registered4: total('registered'),
    visitToAttend: pct(total('attended'), total('visits')),
    shareOfVenue: venueLast ? pct(last.attended, venueLast.checkins) : 0,
    history: hist,
  };
}

export function ctxPromoters(ctx) {
  const ids = ctxVenues(ctx).map(v => v.id);
  return getState().promoters.filter(p => ids.includes(p.venue));
}

// ========================
// Conclusiones (una frase por pantalla)
// ========================

export function summaryInsight(ctx) {
  if (ctx === 'all') {
    const rows = VENUES.map(v => ({ v, now: currentWeekend(v.id), last: lastWeekend(v.id) }));
    const byInterest = [...rows].sort((a, b) => b.now.saved - a.now.saved)[0];
    const byConversion = [...rows].sort((a, b) => b.last.conversion - a.last.conversion)[0];
    if (byInterest.v.id === byConversion.v.id) {
      return `${byInterest.v.name} lidera en interés (${fmt(byInterest.now.saved)} guardados) y en conversión (${byConversion.last.conversion}% el fin de semana pasado).`;
    }
    return `${byInterest.v.name} tiene más interés este fin de semana (${fmt(byInterest.now.saved)} guardados), pero ${byConversion.v.name} convierte mejor: llegó el ${byConversion.last.conversion}% de quienes guardaron, frente al ${byInterest.last.conversion}% de ${byInterest.v.name}.`;
  }
  const name = ctxLabel(ctx);
  const now = currentWeekend(ctx);
  const last = lastWeekend(ctx);
  const change = pct(now.saved - last.saved, last.saved);
  const trend = change >= 0 ? `${change}% más` : `${Math.abs(change)}% menos`;
  if (now.started) {
    return `${name} ya celebró ${now.finishedCount === 1 ? 'una noche' : `${now.finishedCount} noches`}: llegó el ${now.conversion}% de quienes guardaron (el fin de semana pasado, ${last.conversion}%).`;
  }
  return `${name} lleva ${fmt(now.saved)} guardados para este fin de semana, ${trend} que el anterior (${fmt(last.saved)}). La última vez llegó el ${last.conversion}% de quienes guardaron.`;
}

export function eventsInsight(ctx) {
  const now = currentWeekend(ctx);
  const finished = now.events.filter(e => e.finished && e.savedCount);
  if (finished.length) {
    const best = [...finished].sort((a, b) => b.savedAttended / b.savedCount - a.savedAttended / a.savedCount)[0];
    return `${best.title} fue la noche que mejor convirtió: llegó el ${pct(best.savedAttended, best.savedCount)}% de quienes la guardaron.`;
  }
  const top = [...now.events].sort((a, b) => b.savedCount / b.capacity - a.savedCount / a.capacity)[0];
  if (!top) return '';
  return `${top.title} es la fecha más esperada: ${fmt(top.savedCount)} guardados, el ${pct(top.savedCount, top.capacity)}% de su aforo antes de abrir.`;
}

export function originInsight(ctx) {
  const promoters = ctxPromoters(ctx).map(p => ({ p, s: promoterStats(p) }));
  if (!promoters.length) return '';
  if (ctx !== 'all') {
    const { p, s } = promoters[0];
    return `${p.name} trajo ${fmt(s.last.attended)} de los ${fmt(lastWeekend(ctx).checkins)} asistentes de ${ctxLabel(ctx)} el fin de semana pasado (${s.shareOfVenue}%).`;
  }
  const byVolume = [...promoters].sort((a, b) => b.s.last.attended - a.s.last.attended)[0];
  const byRate = [...promoters].sort((a, b) => b.s.visitToAttend - a.s.visitToAttend)[0];
  if (byVolume.p.id === byRate.p.id) {
    return `${byVolume.p.name} es el promotor que más público trae y el que mejor convierte sus visitas (${byRate.s.visitToAttend}%).`;
  }
  return `${byVolume.p.name} trae más público (${fmt(byVolume.s.last.attended)} asistentes el fin de semana pasado), pero ${byRate.p.name} convierte mejor sus visitas: ${byRate.s.visitToAttend}% frente a ${byVolume.s.visitToAttend}%.`;
}
