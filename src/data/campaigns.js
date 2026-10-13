// Operium Club — Campaigns Data
// DATOS FICTICIOS PARA DEMOSTRACIÓN

export const CAMPAIGNS = [
  {
    id: 'camp-01',
    name: 'Viernes de Mood — Invitación especial',
    status: 'draft', // draft | sent | completed
    venueId: 'mood',
    eventId: 'ev-mood-01',
    channel: 'email',
    segment: 'recurrente',
    message: 'Hola {{nombre}}: este viernes Mood presenta Beefeater DJ Session en el rooftop. Como miembro recurrente del club, entras por la puerta preferencial. ¿Te esperamos?',
    eligibleCount: 0, // calculated from store
    excludedCount: 0,
    excludedReasons: [
      { reason: 'Sin consentimiento de email', count: 0 },
      { reason: 'Sin autorización para Mood', count: 0 },
    ],
    sentAt: null,
    responses: { opened: 0, clicked: 0, saved: 0 },
    createdAt: '2026-10-13',
  },
  {
    id: 'camp-02',
    name: 'Play Neon — Recap septiembre',
    status: 'completed',
    venueId: 'play',
    eventId: null,
    channel: 'email',
    segment: 'recurrente',
    message: 'Hola {{nombre}}: así se vivió septiembre en Play. En octubre vuelve el show láser con Play Neon Laser Experience.',
    eligibleCount: 18,
    excludedCount: 7,
    excludedReasons: [
      { reason: 'Sin consentimiento de email', count: 4 },
      { reason: 'Sin autorización para Play', count: 3 },
    ],
    sentAt: '2026-10-01T10:00:00',
    responses: { opened: 12, clicked: 7, saved: 3 },
    createdAt: '2026-09-30',
  },
  {
    id: 'camp-03',
    name: 'Señor Perú — Bienvenida a la peña',
    status: 'draft',
    venueId: 'senor-peru',
    eventId: 'ev-sp-01',
    channel: 'email',
    segment: 'nuevo',
    message: 'Hola {{nombre}}: este viernes Señor Perú celebra el Tributo a Arjona y Feliciano. Si es tu primera vez, te reservamos un Pisco Sour de bienvenida.',
    eligibleCount: 0,
    excludedCount: 0,
    excludedReasons: [],
    sentAt: null,
    responses: { opened: 0, clicked: 0, saved: 0 },
    createdAt: '2026-10-14',
  },
  {
    id: 'camp-04',
    name: 'Adriá — Te extrañamos',
    status: 'draft',
    venueId: 'adria',
    eventId: 'ev-adria-01',
    channel: 'email',
    segment: 'sin_interaccion',
    message: 'Hola {{nombre}}: hace semanas que no te vemos por Adriá. Este viernes vuelve #AdriaNights; trae a tus amigos y la primera ronda de cócteles corre por la casa.',
    eligibleCount: 0,
    excludedCount: 0,
    excludedReasons: [],
    sentAt: null,
    responses: { opened: 0, clicked: 0, saved: 0 },
    createdAt: '2026-10-14',
  },
];

export function getCampaign(id) {
  return CAMPAIGNS.find(c => c.id === id);
}

export function getCampaignsByVenue(venueId) {
  return CAMPAIGNS.filter(c => c.venueId === venueId);
}
