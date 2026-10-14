// Operium Club — Members Data (80 miembros ficticios)
// DATOS FICTICIOS PARA DEMOSTRACIÓN
// Nombres generados, no representan personas reales

const FIRST_NAMES = [
  'Alejandra', 'Bruno', 'Camila', 'Daniel', 'Elena', 'Fernando', 'Gabriela', 'Hugo',
  'Isabella', 'Javier', 'Karla', 'Leonardo', 'Mariana', 'Nicolás', 'Olivia', 'Pablo',
  'Renata', 'Santiago', 'Tatiana', 'Ulises', 'Valeria', 'Walter', 'Ximena', 'Yuri',
  'Zara', 'Adrián', 'Bianca', 'Cristóbal', 'Diana', 'Emilio', 'Fabiola', 'Gonzalo',
  'Helena', 'Ignacio', 'Julia', 'Kevin', 'Lorena', 'Martín', 'Natalia', 'Oscar',
  'Paola', 'Raúl', 'Sofía', 'Tomás', 'Ursula', 'Vicente', 'Wendy', 'Xavier',
  'Yamila', 'Zacarías', 'Andrea', 'Bernardo', 'Carolina', 'Diego', 'Estela', 'Franco',
  'Giselle', 'Hernán', 'Inés', 'Joaquín', 'Karina', 'Lucas', 'Melissa', 'Néstor',
  'Oriana', 'Pedro', 'Rafaela', 'Sebastián', 'Teresa', 'Umberto', 'Viviana', 'William',
  'Xiomara', 'Yolanda', 'Zenón', 'Alicia', 'Boris', 'Celeste', 'Darío', 'Eva',
];

const LAST_INITIALS = [
  'A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'I.', 'J.',
  'K.', 'L.', 'M.', 'N.', 'O.', 'P.', 'Q.', 'R.', 'S.', 'T.',
];

import { AVG_TICKET, RECEIPT_SERIES, getReward } from './loyalty.js';

// Segments: nuevo (never attended), recurrente (2+ interactions), sin_interaccion (registered but inactive)
const SEGMENTS = ['nuevo', 'recurrente', 'sin_interaccion'];

function generateMembers() {
  const members = [];
  for (let i = 0; i < 80; i++) {
    const firstName = FIRST_NAMES[i];
    const lastInit = LAST_INITIALS[i % LAST_INITIALS.length];
    const segmentIndex = i < 30 ? 0 : i < 55 ? 1 : 2; // 30 new, 25 recurring, 25 inactive
    const segment = SEGMENTS[segmentIndex];

    // Consent varies by channel and venue
    const hasEmailConsent = i % 5 !== 0; // 80% have email consent
    const hasSmsConsent = i % 3 === 0; // ~33% have SMS consent
    const consentByVenue = {
      'senor-peru': i % 4 !== 3,
      'mood': i % 3 !== 2,
      'adria': i % 5 !== 4,
      'play': i % 2 === 0,
    };

    // Interaction history (only for recurrente)
    const interactions = [];
    if (segment === 'recurrente') {
      const possibleEvents = ['ev-sp-01', 'ev-mood-01', 'ev-adria-01', 'ev-play-01', 'ev-sp-02', 'ev-mood-02'];
      const numInteractions = 2 + (i % 4);
      for (let j = 0; j < numInteractions; j++) {
        interactions.push({
          eventId: possibleEvents[j % possibleEvents.length],
          type: j === 0 ? 'saved' : j === 1 ? 'checkin' : 'saved',
          date: `2026-09-${String(15 + j).padStart(2, '0')}`,
        });
      }
    }

    // Locales que sigue: los recurrentes siguen todos los que autorizaron;
    // los nuevos, uno (y Play a menudo, por ser el más masivo); los inactivos, ninguno.
    const venueIds = ['senor-peru', 'mood', 'adria', 'play'];
    const following = segment === 'recurrente'
      ? venueIds.filter(v => consentByVenue[v])
      : segment === 'nuevo'
        ? [...new Set([venueIds[i % 4], ...(i % 3 === 0 ? ['play'] : [])])].filter(v => consentByVenue[v])
        : [];

    // Algunos recurrentes ya guardaron la primera fecha de los locales que siguen.
    // Forman parte de los totales savedCount de events.js (no se suman de nuevo).
    const FIRST_EVENT = { 'senor-peru': 'ev-sp-01', mood: 'ev-mood-01', adria: 'ev-adria-01', play: 'ev-play-01' };
    const savedEvents = segment === 'recurrente' && i % 2 === 0 ? following.map(v => FIRST_EVENT[v]) : [];

    // Uno de cada tres llegó por el enlace de un promotor y se registró ese día.
    // La atribución dura 90 días, así que todos se registraron hace menos de dos meses.
    const PROMOTER_IDS = ['promo-01', 'promo-02', 'promo-03', 'promo-04'];
    const referredBy = i % 3 === 0 ? PROMOTER_IDS[i % 4] : null;
    const registeredDate = referredBy
      ? `2026-${i % 2 ? '09' : '10'}-${String(1 + (i % 9)).padStart(2, '0')}`
      : `2026-${String(7 + (i % 4)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`;

    // Puntos: solo quien autorizó usar sus consumos tiene boletas vinculadas.
    // Boletas leídas de la caja de cada local (fines de semana anteriores).
    const hasLoyaltyConsent = i % 4 !== 3;
    const purchases = [];
    if (hasLoyaltyConsent && segment !== 'nuevo') {
      const NIGHTS = ['2026-08-28', '2026-08-29', '2026-09-04', '2026-09-05', '2026-09-11', '2026-09-12', '2026-09-18', '2026-09-19', '2026-09-25', '2026-09-26', '2026-10-02', '2026-10-03', '2026-10-09', '2026-10-10'];
      const FACTORS = [0.8, 1.3, 0.9, 1.5, 1.1, 0.85, 1.2, 1.0, 1.4];
      const count = segment === 'recurrente' ? 3 + (i % 6) : 1;
      for (let j = 0; j < count; j++) {
        const venueId = following[j % (following.length || 1)] || venueIds[(i + j) % 4];
        const amount = Math.round(AVG_TICKET[venueId] * FACTORS[(i * 7 + j * 13) % 9]);
        purchases.push({
          receipt: `${RECEIPT_SERIES[venueId]}-${String(4100 + i * 11 + j * 3).padStart(6, '0')}`,
          venueId,
          eventId: null,
          date: segment === 'recurrente' ? NIGHTS[(i + j * 3) % NIGHTS.length] : `2026-08-${String(8 + (i % 20)).padStart(2, '0')}`,
          amount,
          points: amount,
        });
      }
      purchases.sort((a, b) => a.date.localeCompare(b.date));
    }
    // Algunos recurrentes ya canjearon un descuento de S/ 10
    const earned = purchases.reduce((acc, p) => acc + p.points, 0);
    const redemptions = segment === 'recurrente' && i % 5 === 0 && earned >= 300
      ? [{ code: `CJ-${String(2300 + i).padStart(4, '0')}`, rewardId: 'rw-10', points: getReward('rw-10').points, date: '2026-10-09', status: 'usado' }]
      : [];

    members.push({
      id: `member-${String(i + 1).padStart(3, '0')}`,
      name: `${firstName} ${lastInit}`,
      firstName,
      segment,
      registeredDate,
      // DNI enmascarado: en la demo nunca se muestra completo
      dniLast4: String(1000 + ((i * 7919) % 9000)),
      referredBy,
      consent: {
        email: hasEmailConsent,
        sms: hasSmsConsent,
        byVenue: consentByVenue,
        loyalty: hasLoyaltyConsent,
      },
      purchases,
      redemptions,
      interactions,
      savedEvents,
      following,
      checkins: [],
    });
  }
  return members;
}

export const MEMBERS = generateMembers();

export function getMember(id) {
  return MEMBERS.find(m => m.id === id);
}

export function getMembersBySegment(segment) {
  return MEMBERS.filter(m => m.segment === segment);
}

export function getEligibleMembers(venueId, channel = 'email') {
  return MEMBERS.filter(m => {
    if (channel === 'email' && !m.consent.email) return false;
    if (channel === 'sms' && !m.consent.sms) return false;
    if (!m.consent.byVenue[venueId]) return false;
    return true;
  });
}

export function getExcludedMembers(venueId, channel = 'email') {
  return MEMBERS.filter(m => {
    if (channel === 'email' && !m.consent.email) return true;
    if (channel === 'sms' && !m.consent.sms) return true;
    if (!m.consent.byVenue[venueId]) return true;
    return false;
  });
}
