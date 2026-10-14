// Operium Club — Historial de fines de semana anteriores
// DATOS FICTICIOS PARA DEMOSTRACIÓN
//
// Cifras agregadas por local y fin de semana (viernes + sábado). Sirven para
// mostrar tendencias y conversión real sin inventar ventas: solo interés
// (guardados) y asistencia validada en puerta.
//
//   saved          guardados en Mi Club para ese fin de semana
//   savedAttended  de quienes guardaron, cuántos ingresaron  → conversión
//   checkins       ingresos validados en puerta (incluye a quien no guardó) → ocupación
//   capacity       aforo sumado de las dos noches
//   bySource       origen de los ingresos: promotor, campaña o directo
//   receipts       boletas leídas de caja con DNI de un miembro que autorizó puntos
//   spend          importe de esas boletas (S/). Nunca se estima el consumo de nadie más.

import { AVG_TICKET, PROMO_POINTS_PER_ENTRY, PROMO_SOLES_PER_POINT } from './loyalty.js';

export const DEMO_TODAY = '2026-10-15'; // jueves: el fin de semana 16–17 aún no empieza

export const WEEKENDS = [
  { id: '2026-09-18', label: '18–19 sep', short: '18 sep' },
  { id: '2026-09-25', label: '25–26 sep', short: '25 sep' },
  { id: '2026-10-02', label: '2–3 oct', short: '2 oct' },
  { id: '2026-10-09', label: '9–10 oct', short: '9 oct' },
];

export const CURRENT_WEEKEND = { id: '2026-10-16', label: '16–17 oct', short: '16 oct' };

// Parte de los asistentes que dan su DNI en caja: crece a medida que se usan los puntos
const IDENTIFIED_SHARE = [0.27, 0.30, 0.33, 0.36];
const TICKET_VARIATION = [0.97, 1.02, 0.99, 1.04];

// [saved, savedAttended, checkins, promotor, campaña] por fin de semana (mismo orden que WEEKENDS)
const RAW = {
  'senor-peru': { capacity: 470, rows: [[70, 32, 300, 22, 10], [78, 37, 318, 26, 12], [81, 38, 326, 25, 15], [88, 43, 341, 31, 14]] },
  mood:         { capacity: 420, rows: [[82, 48, 268, 41, 18], [90, 55, 281, 46, 20], [95, 59, 290, 52, 24], [98, 63, 302, 57, 26]] },
  adria:        { capacity: 270, rows: [[41, 22, 168, 14, 9], [46, 26, 175, 17, 10], [44, 25, 171, 16, 8], [52, 30, 186, 20, 12]] },
  play:         { capacity: 750, rows: [[118, 47, 496, 88, 21], [126, 53, 512, 94, 24], [131, 52, 538, 99, 22], [139, 58, 561, 108, 27]] },
};

export const VENUE_HISTORY = Object.fromEntries(
  Object.entries(RAW).map(([venueId, { capacity, rows }]) => [
    venueId,
    rows.map(([saved, savedAttended, checkins, promotor, campana], i) => {
      const receipts = Math.round(checkins * IDENTIFIED_SHARE[i]);
      return {
        weekend: WEEKENDS[i].id,
        label: WEEKENDS[i].label,
        short: WEEKENDS[i].short,
        saved,
        savedAttended,
        checkins,
        capacity,
        bySource: { promotor, campana, directo: checkins - promotor - campana },
        receipts,
        spend: Math.round(receipts * AVG_TICKET[venueId] * TICKET_VARIATION[i]),
      };
    }),
  ])
);

// Por promotor y fin de semana: visitas al enlace, nuevos miembros registrados
// y asistentes que llegaron por su enlace (coincide con bySource.promotor del local).
// spend: consumo con DNI de esos referidos (son miembros: tres de cada cuatro dan su DNI en caja).
// Unos promotores traen público que consume más que otros.
const REFERRAL_IDENTIFIED = 0.75;
const PROMO_VENUE = { 'promo-01': 'mood', 'promo-02': 'play', 'promo-03': 'senor-peru', 'promo-04': 'adria' };
const PROMO_SPEND_FACTOR = { 'promo-01': 1.18, 'promo-02': 0.82, 'promo-03': 1.0, 'promo-04': 1.06 };

export const promoterPoints = (attended, spend) =>
  attended * PROMO_POINTS_PER_ENTRY + Math.floor(spend / PROMO_SOLES_PER_POINT);

const PROMO_RAW = {
  'promo-01': [[96, 12, 41], [104, 14, 46], [118, 15, 52], [121, 17, 57]],
  'promo-02': [[210, 25, 88], [226, 28, 94], [240, 31, 99], [251, 30, 108]],
  'promo-03': [[61, 6, 22], [70, 8, 26], [66, 7, 25], [79, 9, 31]],
  'promo-04': [[38, 5, 14], [45, 7, 17], [41, 6, 16], [50, 8, 20]],
};

export const PROMOTER_HISTORY = Object.fromEntries(
  Object.entries(PROMO_RAW).map(([promoterId, rows]) => [
    promoterId,
    rows.map(([visits, registered, attended], i) => {
      const spend = Math.round(attended * REFERRAL_IDENTIFIED * AVG_TICKET[PROMO_VENUE[promoterId]] * PROMO_SPEND_FACTOR[promoterId] * TICKET_VARIATION[i]);
      return {
        weekend: WEEKENDS[i].id,
        label: WEEKENDS[i].label,
        visits,
        registered,
        attended,
        spend,
        points: promoterPoints(attended, spend),
      };
    }),
  ])
);
