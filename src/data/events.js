// Operium Club — Events Data (8+ eventos ficticios)
// DATOS FICTICIOS PARA DEMOSTRACIÓN
// Calendario de muestra: Viernes 16 y Sábado 17 de octubre de 2026

export const EVENTS = [
  // ===== SEÑOR PERÚ =====
  {
    id: 'ev-sp-01',
    venueId: 'senor-peru',
    title: 'Noche Criolla',
    subtitle: 'Música en vivo & cena peruana',
    description: 'Una velada de música criolla en vivo con lo mejor de la gastronomía peruana. Cajón, guitarra y sabor en cada plato. Evento ficticio para demostración.',
    date: '2026-10-16',
    dayLabel: 'Viernes 16 Oct',
    time: '20:00',
    endTime: '01:00',
    image: '/images/event_noche_criolla.png',
    capacity: 120,
    savedCount: 34,
    checkinCount: 0,
    tags: ['Música en vivo', 'Gastronomía', 'Criolla'],
    fictitious: true,
    benefit: {
      title: 'Pisco Sour de bienvenida',
      description: 'Miembros del club reciben un pisco sour cortesía al presentar su pase.',
      eligibility: 'Miembros con perfil activo en el club',
      conditions: 'Sujeto a disponibilidad. No acumulable. Válido solo la noche del evento.',
    },
  },
  {
    id: 'ev-sp-02',
    venueId: 'senor-peru',
    title: 'Brunch Fusión',
    subtitle: 'Gastronomía de autor & cócteles matinales',
    description: 'Brunch de fin de semana con platos fusión peruano-asiática y cócteles de autor. Ambiente relajado con DJ set suave. Evento ficticio para demostración.',
    date: '2026-10-17',
    dayLabel: 'Sábado 17 Oct',
    time: '11:00',
    endTime: '16:00',
    image: '/images/event_brunch_fusion.png',
    capacity: 80,
    savedCount: 22,
    checkinCount: 0,
    tags: ['Brunch', 'Fusión', 'Cócteles'],
    fictitious: true,
    benefit: {
      title: 'Postre de la casa',
      description: 'Un postre de autor incluido para miembros del club.',
      eligibility: 'Miembros que hayan asistido a al menos 1 evento previo',
      conditions: 'Sujeto a disponibilidad. Presentar pase del club.',
    },
  },

  // ===== MOOD =====
  {
    id: 'ev-mood-01',
    venueId: 'mood',
    title: 'Mood Sessions: Deep House',
    subtitle: 'DJ Set en el rooftop',
    description: 'Sesión de deep house con vista panorámica de la ciudad. Cócteles signature y ambiente envolvente. Evento ficticio para demostración.',
    date: '2026-10-16',
    dayLabel: 'Viernes 16 Oct',
    time: '21:00',
    endTime: '03:00',
    image: '/images/event_mood_deep_house.png',
    capacity: 180,
    savedCount: 67,
    checkinCount: 0,
    tags: ['DJ Set', 'Deep House', 'Rooftop'],
    fictitious: true,
    benefit: {
      title: 'Acceso preferencial al rooftop',
      description: 'Miembros del club acceden sin espera y con ubicación reservada.',
      eligibility: 'Todos los miembros del club con pase vigente',
      conditions: 'Hasta agotar cupo preferencial (30 lugares). Presentar pase.',
    },
  },
  {
    id: 'ev-mood-02',
    venueId: 'mood',
    title: 'Mood Rooftop Sunset',
    subtitle: 'Atardecer, cócteles & chillout',
    description: 'La mejor puesta de sol de la ciudad con cócteles artesanales y música chillout. El preludio perfecto para la noche. Evento ficticio para demostración.',
    date: '2026-10-17',
    dayLabel: 'Sábado 17 Oct',
    time: '17:00',
    endTime: '22:00',
    image: '/images/event_mood_sunset.png',
    capacity: 150,
    savedCount: 45,
    checkinCount: 0,
    tags: ['Sunset', 'Cócteles', 'Chillout'],
    fictitious: true,
    benefit: {
      title: '2x1 en cóctel signature',
      description: 'Dos cócteles de la carta especial por el precio de uno.',
      eligibility: 'Miembros del club que guardaron el evento',
      conditions: 'Válido de 17:00 a 19:00. Máximo 2 redenciones por persona.',
    },
  },

  // ===== ADRIÁ =====
  {
    id: 'ev-adria-01',
    venueId: 'adria',
    title: 'Cena Mediterránea con DJ',
    subtitle: 'Gastronomía costera & sesión musical',
    description: 'Menú degustación mediterráneo acompañado de sesiones musicales selectas. Maridaje de vinos incluido. Evento ficticio para demostración.',
    date: '2026-10-16',
    dayLabel: 'Viernes 16 Oct',
    time: '20:30',
    endTime: '01:30',
    image: '/images/event_adria_cena.png',
    capacity: 100,
    savedCount: 28,
    checkinCount: 0,
    tags: ['Cena', 'Mediterránea', 'Maridaje'],
    fictitious: true,
    benefit: {
      title: 'Copa de cava de bienvenida',
      description: 'Una copa de cava al llegar para miembros del club.',
      eligibility: 'Miembros del club con perfil completo',
      conditions: 'Una copa por persona. Sujeto a disponibilidad.',
    },
  },
  {
    id: 'ev-adria-02',
    venueId: 'adria',
    title: 'Adriá Late Night',
    subtitle: 'Coctelería de autor & afterdinner',
    description: 'La noche continúa en la barra de Adriá con cócteles de autor y música selecta. El mejor afterdinner de la costa. Evento ficticio para demostración.',
    date: '2026-10-17',
    dayLabel: 'Sábado 17 Oct',
    time: '22:00',
    endTime: '03:00',
    image: '/images/event_adria_late.png',
    capacity: 80,
    savedCount: 19,
    checkinCount: 0,
    tags: ['Late Night', 'Cócteles', 'Afterdinner'],
    fictitious: true,
    benefit: {
      title: 'Tapa mediterránea de cortesía',
      description: 'Una selección de tapas para acompañar tu cóctel.',
      eligibility: 'Miembros que sigan a Adriá en el club',
      conditions: 'Válido después de las 23:00. Sujeto a disponibilidad.',
    },
  },

  // ===== PLAY =====
  {
    id: 'ev-play-01',
    venueId: 'play',
    title: 'Play Neon Party',
    subtitle: 'La fiesta más energética de la ciudad',
    description: 'Noche de neón con los mejores DJs, producción audiovisual de primer nivel y la mejor energía. Evento ficticio para demostración.',
    date: '2026-10-16',
    dayLabel: 'Viernes 16 Oct',
    time: '23:00',
    endTime: '05:00',
    image: '/images/event_play_neon.png',
    capacity: 350,
    savedCount: 89,
    checkinCount: 0,
    tags: ['Fiesta', 'Neón', 'DJ'],
    fictitious: true,
    benefit: {
      title: 'Fast pass de ingreso',
      description: 'Ingreso por fila preferencial para miembros del club.',
      eligibility: 'Todos los miembros del club',
      conditions: 'Válido hasta la 01:00. No garantiza ingreso si se alcanza aforo.',
    },
  },
  {
    id: 'ev-play-02',
    venueId: 'play',
    title: 'Play Unplugged',
    subtitle: 'Sesión acústica íntima',
    description: 'Una noche diferente en Play: sesión acústica con artistas locales, velas y una atmósfera íntima. Evento ficticio para demostración.',
    date: '2026-10-17',
    dayLabel: 'Sábado 17 Oct',
    time: '20:00',
    endTime: '00:00',
    image: '/images/event_play_unplugged.png',
    capacity: 150,
    savedCount: 31,
    checkinCount: 0,
    tags: ['Acústico', 'Live', 'Íntimo'],
    fictitious: true,
    benefit: {
      title: 'Bebida de bienvenida',
      description: 'Una bebida a elección al presentar el pase del club.',
      eligibility: 'Miembros que guardaron el evento con anticipación',
      conditions: 'Guardar el evento al menos 24h antes. Una bebida por persona.',
    },
  },
];

export function getEvent(id) {
  return EVENTS.find(e => e.id === id);
}

export function getEventsByVenue(venueId) {
  return EVENTS.filter(e => e.venueId === venueId);
}

export function getEventsByDate(date) {
  return EVENTS.filter(e => e.date === date);
}
