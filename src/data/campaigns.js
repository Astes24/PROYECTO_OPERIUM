// Operium Club — Campaigns Data
// DATOS FICTICIOS PARA DEMOSTRACIÓN

export const CAMPAIGNS = [
  {
    id: 'camp-01',
    name: 'Mood Sessions — Invitación especial',
    status: 'draft', // draft | sent | completed
    venueId: 'mood',
    eventId: 'ev-mood-01',
    channel: 'email',
    segment: 'recurrente',
    message: '¡Hola {{nombre}}! Este viernes tenemos Mood Sessions: Deep House en el rooftop. Como miembro recurrente del club, tienes acceso preferencial. ¿Te esperamos? 🌙',
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
    message: '¡Hola {{nombre}}! Septiembre fue increíble en Play. 🎉 Revive los mejores momentos y prepárate para octubre. ¡No te pierdas Play Neon Party!',
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
];

export function getCampaign(id) {
  return CAMPAIGNS.find(c => c.id === id);
}

export function getCampaignsByVenue(venueId) {
  return CAMPAIGNS.filter(c => c.venueId === venueId);
}
