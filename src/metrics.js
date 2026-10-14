// Operium Club — Métricas derivadas del estado y del historial
// Todo se calcula por contexto: 'all' (todo el grupo) o el id de un local.

import { getState, memberPoints } from './store.js';
import { VENUES } from './data/venues.js';
import { VENUE_HISTORY, PROMOTER_HISTORY, DEMO_TODAY, CURRENT_WEEKEND, promoterPoints } from './data/history.js';
import { REFERRAL_WINDOW_DAYS } from './data/loyalty.js';

export { memberPoints, promoterPoints };

export const pct = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);
export const fmt = (n) => Number(n || 0).toLocaleString('es-PE');
export const soles = (n) => `S/ ${fmt(Math.round(n || 0))}`;
// Fecha legible: "sáb 10 oct"
const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
const daysSince = (date) => Math.round((new Date(DEMO_TODAY) - new Date(date)) / 86400000);

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
  // Este fin de semana basta el día; más adelante hace falta la fecha completa
  if (days <= 2) return { key: 'upcoming', label: `${event.dayLabel.split(' ')[0]} · ${event.time}` };
  return { key: 'upcoming', label: `${event.dayLabel} · ${event.time}` };
}

// — Este fin de semana (16–17 oct), con los datos vivos del store —
const CURRENT_DATES = ['2026-10-16', '2026-10-17'];

export function currentWeekend(ctx) {
  const ids = ctxVenues(ctx).map(v => v.id);
  // Solo las noches de este fin de semana; las fechas creadas más adelante van aparte
  const events = getState().events.filter(e => ids.includes(e.venueId) && CURRENT_DATES.includes(e.date));
  const finished = events.filter(e => e.finished);
  const sum = (list, key) => list.reduce((acc, e) => acc + (e[key] || 0), 0);
  return {
    label: CURRENT_WEEKEND.label,
    events,
    receipts: sum(events, 'identifiedReceipts'),
    spend: sum(events, 'identifiedSpend'),
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

// — Fechas programadas después de este fin de semana —
export function laterEvents(ctx) {
  const ids = ctxVenues(ctx).map(v => v.id);
  return getState().events
    .filter(e => ids.includes(e.venueId) && e.date > CURRENT_DATES[1])
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
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
      receipts: total('receipts'),
      spend: total('spend'),
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
    points4: total('points'),
    spend4: total('spend'),
    // Consumo con DNI por cada referido que entró (últimas 4 semanas)
    spendPerReferral: total('attended') ? Math.round(total('spend') / total('attended')) : 0,
    live: promoterLive(promoter),
  };
}

// Referidos activos: se registraron con su enlace hace 90 días o menos
export function promoterReferrals(promoter) {
  return getState().members.filter(m => m.referredBy === promoter.id && daysSince(m.registeredDate) <= REFERRAL_WINDOW_DAYS);
}

// Este fin de semana, en vivo: ingresos con QR de sus referidos y sus boletas con DNI
export function promoterLive(promoter) {
  const referrals = promoterReferrals(promoter);
  const entries = referrals.flatMap(m => m.checkins.filter(c => CURRENT_DATES.includes(c.date)).map(c => ({ m, c })));
  const purchases = referrals.flatMap(m => m.purchases.filter(p => CURRENT_DATES.includes(p.date)).map(p => ({ m, p })));
  const base = promoter.fridayBase || { attended: 0, spend: 0 };
  const attended = base.attended + entries.length;
  const spend = base.spend + purchases.reduce((acc, { p }) => acc + p.amount, 0);
  return {
    referrals: referrals.length,
    attended,
    spend,
    points: promoterPoints(attended, spend),
    // Lo último con nombre, para la tarjeta del promotor
    feed: [
      ...entries.map(({ m, c }) => ({ kind: 'entry', m, date: c.date, time: c.time || '' })),
      ...purchases.map(({ m, p }) => ({ kind: 'purchase', m, date: p.date, amount: p.amount })),
    ].reverse(),
  };
}

export function ctxPromoters(ctx) {
  const ids = ctxVenues(ctx).map(v => v.id);
  return getState().promoters.filter(p => ids.includes(p.venue));
}

// — Clientes con puntos —
// En un local se ve solo lo consumido en ese local; los puntos valen en los cuatro.
export function clientRows(ctx) {
  const ids = ctxVenues(ctx).map(v => v.id);
  return getState().members
    .map(m => {
      const purchases = m.purchases.filter(p => ids.includes(p.venueId));
      const last = purchases.at(-1);
      return {
        m,
        nights: new Set(purchases.map(p => p.date)).size,
        spend: purchases.reduce((acc, p) => acc + p.amount, 0),
        points: memberPoints(m),
        lastDate: last?.date || '',
        lastVenue: last ? VENUES.find(v => v.id === last.venueId) : null,
      };
    })
    .filter(r => r.spend > 0)
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate) || b.spend - a.spend);
}
