// Operium Club — Promoters Data
// DATOS FICTICIOS PARA DEMOSTRACIÓN
//
// weekendVisitsBase: visitas al enlace este fin de semana registradas antes de la demo.
// signals: las visitas más recientes con miembro y evento (se muestran como "últimas visitas").
// El historial de semanas anteriores está en history.js (PROMOTER_HISTORY).

export const PROMOTERS = [
  {
    id: 'promo-01',
    name: 'Ricardo V.',
    sourceId: 'SRC-RV-2026',
    code: 'RICARDO-MOOD',
    venue: 'mood',
    bio: 'Promotor independiente de música electrónica. 3 años con locales de Piura.',
    link: 'https://operium.club/r/RICARDO-MOOD',
    weekendVisitsBase: 61,
    signals: [
      { date: '2026-10-12', type: 'link_click', memberId: 'member-005', eventId: 'ev-mood-01' },
      { date: '2026-10-13', type: 'link_click', memberId: 'member-012', eventId: 'ev-mood-01' },
      { date: '2026-10-14', type: 'link_click', memberId: 'member-023', eventId: 'ev-mood-02' },
    ],
  },
  {
    id: 'promo-02',
    name: 'Lucía T.',
    sourceId: 'SRC-LT-2026',
    code: 'LUCIA-PLAY',
    venue: 'play',
    bio: 'Promotora de entretenimiento nocturno. Comunidades universitarias y after office.',
    link: 'https://operium.club/r/LUCIA-PLAY',
    weekendVisitsBase: 138,
    signals: [
      { date: '2026-10-12', type: 'link_click', memberId: 'member-002', eventId: 'ev-play-01' },
      { date: '2026-10-13', type: 'link_click', memberId: 'member-008', eventId: 'ev-play-01' },
      { date: '2026-10-13', type: 'link_click', memberId: 'member-015', eventId: 'ev-play-02' },
      { date: '2026-10-14', type: 'link_click', memberId: 'member-031', eventId: 'ev-play-01' },
    ],
  },
  {
    id: 'promo-03',
    name: 'Martín Q.',
    sourceId: 'SRC-MQ-2026',
    code: 'MARTIN-PERU',
    venue: 'senor-peru',
    bio: 'Relacionista de peñas y orquestas. Grupos de empresa y celebraciones.',
    link: 'https://operium.club/r/MARTIN-PERU',
    weekendVisitsBase: 37,
    signals: [
      { date: '2026-10-13', type: 'link_click', memberId: 'member-034', eventId: 'ev-sp-01' },
      { date: '2026-10-14', type: 'link_click', memberId: 'member-041', eventId: 'ev-sp-02' },
    ],
  },
  {
    id: 'promo-04',
    name: 'Daniela S.',
    sourceId: 'SRC-DS-2026',
    code: 'DANIELA-ADRIA',
    venue: 'adria',
    bio: 'Creadora de contenido local. Reservas de mesa para grupos de amigos.',
    link: 'https://operium.club/r/DANIELA-ADRIA',
    weekendVisitsBase: 24,
    signals: [
      { date: '2026-10-13', type: 'link_click', memberId: 'member-047', eventId: 'ev-adria-01' },
      { date: '2026-10-14', type: 'link_click', memberId: 'member-052', eventId: 'ev-adria-02' },
    ],
  },
];

export function getPromoter(id) {
  return PROMOTERS.find(p => p.id === id);
}

export function getPromotersByVenue(venueId) {
  return PROMOTERS.filter(p => p.venue === venueId);
}
