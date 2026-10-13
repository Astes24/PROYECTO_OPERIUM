// Operium Club — Promoters Data
// DATOS FICTICIOS PARA DEMOSTRACIÓN

export const PROMOTERS = [
  {
    id: 'promo-01',
    name: 'Ricardo V.',
    sourceId: 'SRC-RV-2026',
    code: 'RICARDO-MOOD',
    venue: 'mood',
    bio: 'Promotor independiente especializado en eventos de música electrónica. 3 años colaborando con locales de Miraflores.',
    signalCount: 12,
    registeredUsers: 8,
    link: 'https://operium.club/r/RICARDO-MOOD',
    signals: [
      { date: '2026-10-10', type: 'link_click', memberId: 'member-005', eventId: 'ev-mood-01' },
      { date: '2026-10-11', type: 'link_click', memberId: 'member-012', eventId: 'ev-mood-01' },
      { date: '2026-10-12', type: 'link_click', memberId: 'member-023', eventId: 'ev-mood-02' },
    ],
  },
  {
    id: 'promo-02',
    name: 'Lucía T.',
    sourceId: 'SRC-LT-2026',
    code: 'LUCIA-PLAY',
    venue: 'play',
    bio: 'Promotora de eventos y entretenimiento nocturno. Especialista en comunidades universitarias y after office.',
    signalCount: 18,
    registeredUsers: 14,
    link: 'https://operium.club/r/LUCIA-PLAY',
    signals: [
      { date: '2026-10-09', type: 'link_click', memberId: 'member-002', eventId: 'ev-play-01' },
      { date: '2026-10-10', type: 'link_click', memberId: 'member-008', eventId: 'ev-play-01' },
      { date: '2026-10-11', type: 'link_click', memberId: 'member-015', eventId: 'ev-play-02' },
      { date: '2026-10-12', type: 'link_click', memberId: 'member-031', eventId: 'ev-play-01' },
    ],
  },
];

export function getPromoter(id) {
  return PROMOTERS.find(p => p.id === id);
}

export function getPromotersByVenue(venueId) {
  return PROMOTERS.filter(p => p.venue === venueId);
}
