// Operium Club — Events Data (8 eventos con activos reales de Piura)
// DATOS REALES DE IDENTIDAD PARA LA PRESENTACIÓN
// Calendario de muestra: Viernes 16 y Sábado 17 de octubre de 2026

export const EVENTS = [
  // ===== SEÑOR PERÚ =====
  {
    id: 'ev-sp-01',
    venueId: 'senor-peru',
    title: 'Flechazo al Amor: Tributo Arjona & Feliciano',
    subtitle: 'Sebastián Landa & Emanuel Ugaz en vivo',
    description: 'Una noche única de tributo en vivo en Señor Perú Piura (Mz. V Lt. 4B, Zona Industrial II). Baladas, recuerdos y grandes éxitos en una velada inolvidable. Evento ficticio para demostración.',
    date: '2026-10-16',
    dayLabel: 'Viernes 16 Oct',
    time: '21:00',
    endTime: '03:00',
    image: '/images/real_senor_peru_flyer.jpg',
    video: '/videos/senor_peru.mp4',
    capacity: 250,
    savedCount: 52,
    checkinCount: 0,
    savedAttended: 0, // de quienes guardaron, cuántos ingresaron
    finished: false,
    tags: ['Tributo', 'Música en vivo', 'Piura'],
    fictitious: true,
    benefit: {
      title: 'Pisco Sour de bienvenida',
      description: 'Miembros del club reciben un pisco sour de cortesía al presentar su pase en Señor Perú.',
      eligibility: 'Miembros con perfil activo en el club',
      conditions: 'Sujeto a disponibilidad. No acumulable. Válido solo la noche del evento.',
    },
  },
  {
    id: 'ev-sp-02',
    venueId: 'senor-peru',
    title: 'Jhon Kelvin & Orquestas en Vivo',
    subtitle: 'Oficiales de la Salsa & Los Bandidos',
    description: '¡La mejor peña del norte en el país! Señor Perú & Adriá Lounge Bar presentan a Jhon Kelvin con grandes éxitos en su voz: Tu Hipocresía, Me Olvidé de tu Amor y más. Ingreso libre toda la noche.',
    date: '2026-10-17',
    dayLabel: 'Sábado 17 Oct',
    time: '21:30',
    endTime: '04:00',
    image: '/images/real_senor_peru_jhon_kelvin.jpg',
    video: '/videos/senor_peru.mp4',
    capacity: 220,
    savedCount: 38,
    checkinCount: 0,
    savedAttended: 0, // de quienes guardaron, cuántos ingresaron
    finished: false,
    tags: ['Salsa & Cumbia', 'Jhon Kelvin', 'Orquesta en vivo'],
    fictitious: true,
    benefit: {
      title: 'Ubicación preferencial',
      description: 'Mesa reservada en zona preferencial para miembros del club.',
      eligibility: 'Miembros con al menos 1 interacción previa',
      conditions: 'Sujeto a aforo disponible antes de las 22:30. Presentar pase del club.',
    },
  },

  // ===== MOOD =====
  {
    id: 'ev-mood-01',
    venueId: 'mood',
    title: 'Viernes de Mood: Beefeater DJ Session',
    subtitle: 'Electronic sessions & rooftop party',
    description: 'La fiesta insignia de Mood Piura con sesión exclusiva de DJ en cabina, show de pirotecnia y coctelería signature Beefeater London. El lugar donde la noche de Piura comienza con estilo.',
    date: '2026-10-16',
    dayLabel: 'Viernes 16 Oct',
    time: '21:00',
    endTime: '04:00',
    image: '/images/real_mood_dj.jpg',
    video: null,
    reelUrl: 'https://www.instagram.com/reel/DYn8VVMNQZq/',
    capacity: 220,
    savedCount: 67,
    checkinCount: 0,
    savedAttended: 0, // de quienes guardaron, cuántos ingresaron
    finished: false,
    tags: ['DJ Set', 'Deep House', 'Rooftop Piura'],
    fictitious: true,
    benefit: {
      title: 'Acceso preferencial al rooftop',
      description: 'Miembros del club acceden sin espera por puerta VIP en Mood.',
      eligibility: 'Todos los miembros del club con pase vigente',
      conditions: 'Hasta agotar cupo preferencial (30 lugares). Presentar pase.',
    },
  },
  {
    id: 'ev-mood-02',
    venueId: 'mood',
    title: 'Viernes de Mood: Combinación de la Habana',
    subtitle: 'Música en vivo & orquesta en tarima',
    description: 'Toda la energía de Combinación de la Habana en tarima en Mood Piura. Espectáculo bailable en vivo, luces y la mejor vista de la ciudad. Evento ficticio para demostración.',
    date: '2026-10-17',
    dayLabel: 'Sábado 17 Oct',
    time: '22:00',
    endTime: '04:30',
    image: '/images/real_mood_habana.jpg',
    video: null,
    capacity: 200,
    savedCount: 45,
    checkinCount: 0,
    savedAttended: 0, // de quienes guardaron, cuántos ingresaron
    finished: false,
    tags: ['Salsa en vivo', 'Orquesta', 'Mood Live'],
    fictitious: true,
    benefit: {
      title: '2x1 en cóctel signature',
      description: 'Dos cócteles de la carta especial por el precio de uno.',
      eligibility: 'Miembros del club que guardaron el evento',
      conditions: 'Válido de 22:00 a 00:00. Máximo 2 redenciones por persona.',
    },
  },

  // ===== ADRIÁ =====
  {
    id: 'ev-adria-01',
    venueId: 'adria',
    title: '#AdriaNights: Noche de Amigos & Coctelería',
    subtitle: 'La noche perfecta tiene una dirección',
    description: 'La noche perfecta tiene una dirección: Adriá Lounge Bar Piura (#adrianights). Comparte con tu grupo de amigos los mejores cócteles y la música que marca tendencia.',
    date: '2026-10-16',
    dayLabel: 'Viernes 16 Oct',
    time: '20:30',
    endTime: '03:00',
    image: '/images/real_adria_amigos.jpg',
    // Captura de Instagram: recorta franjas negras y la flecha del carrusel
    imageZoom: 1.5,
    imagePosition: '45% 58%',
    video: '/videos/adria.mp4',
    reelUrl: 'https://www.instagram.com/reel/Dch2iPpNi4y/',
    capacity: 150,
    savedCount: 36,
    checkinCount: 0,
    savedAttended: 0, // de quienes guardaron, cuántos ingresaron
    finished: false,
    tags: ['#adrianights', 'Lounge Bar', 'Coctelería'],
    fictitious: true,
    benefit: {
      title: 'Copa de bienvenida',
      description: 'Una copa de cortesía para miembros del club al llegar a Adriá.',
      eligibility: 'Miembros del club con perfil completo',
      conditions: 'Una copa por persona. Sujeto a disponibilidad.',
    },
  },
  {
    id: 'ev-adria-02',
    venueId: 'adria',
    title: 'Adriá Party & DJ Late Night',
    subtitle: 'Ambiente exclusivo & afterdinner',
    description: 'La celebración sigue en Adriá Lounge Bar con sesiones de DJ en vivo, coctelería de autor y la gente más top de Piura. Experiencia nocturna premium.',
    date: '2026-10-17',
    dayLabel: 'Sábado 17 Oct',
    time: '22:00',
    endTime: '03:30',
    image: '/images/real_adria_selfie.jpg',
    // Captura de Instagram: recorta franjas negras y la flecha del carrusel
    imageZoom: 1.5,
    imagePosition: '45% 58%',
    video: '/videos/adria.mp4',
    capacity: 120,
    savedCount: 29,
    checkinCount: 0,
    savedAttended: 0, // de quienes guardaron, cuántos ingresaron
    finished: false,
    tags: ['Party', 'DJ Live', 'Afterdinner'],
    fictitious: true,
    benefit: {
      title: 'Tapa de autor de cortesía',
      description: 'Selección de bocadillos para acompañar tu cóctel.',
      eligibility: 'Miembros que sigan a Adriá en el club',
      conditions: 'Válido después de las 23:00. Sujeto a disponibilidad.',
    },
  },

  // ===== PLAY =====
  {
    id: 'ev-play-01',
    venueId: 'play',
    title: 'Play Neon Laser Experience',
    subtitle: 'Mega pantalla LED & show de luces',
    description: 'La fiesta más electrizante de Piura en Play Club. Pantalla LED gigante, luces láser de neón y los ritmos más intensos de la noche. Evento ficticio para demostración.',
    date: '2026-10-16',
    dayLabel: 'Viernes 16 Oct',
    time: '23:00',
    endTime: '05:00',
    image: '/images/real_play_neon.jpg',
    video: '/videos/play.mp4',
    capacity: 400,
    savedCount: 94,
    checkinCount: 0,
    savedAttended: 0, // de quienes guardaron, cuántos ingresaron
    finished: false,
    tags: ['Láser Show', 'Neón', 'Play Piura'],
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
    title: 'Play DJ Live Session: Electro & Urban',
    subtitle: 'DJ en cabina principal de Play Piura',
    description: 'Sesión en vivo de DJ en la cabina principal de Play Piura con mezclas urbanas, reggaetón y electro. Producción audiovisual de primer nivel hasta el amanecer.',
    date: '2026-10-17',
    dayLabel: 'Sábado 17 Oct',
    time: '22:30',
    endTime: '05:00',
    image: '/images/real_play_dj.jpg',
    video: '/videos/play.mp4',
    capacity: 350,
    savedCount: 48,
    checkinCount: 0,
    savedAttended: 0, // de quienes guardaron, cuántos ingresaron
    finished: false,
    tags: ['DJ Session', 'Club Live', 'Electro & Urban'],
    fictitious: true,
    benefit: {
      title: 'Bebida de bienvenida',
      description: 'Una bebida a elección al presentar el pase del club.',
      eligibility: 'Miembros que guardaron el evento con anticipación',
      conditions: 'Guardar el evento antes de las 20:00. Una bebida por persona.',
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
