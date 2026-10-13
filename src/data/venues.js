// Operium Club — Venue Data (4 locales reales en Piura)
// DATOS REALES DE IDENTIDAD PARA LA PRESENTACIÓN

export const VENUES = [
  {
    id: 'senor-peru',
    name: 'Señor Perú',
    shortName: 'S. Perú',
    tagline: '¡La mejor peña del norte en el país!',
    description: 'La peña y restobar emblemático de Piura con grandes orquestas, gastronomía de autor y shows en vivo. Sabor y tradición.',
    category: 'Peña & Restobar',
    accentColor: '#C4513D',
    accentColorRGB: '196, 81, 61',
    heroImage: '/images/real_senor_peru_flyer.jpg',
    video: '/videos/senor_peru.mp4',
    instagram: '@senor_peru_oficial',
    manager: 'Carlos M.',
    schedule: 'Vie–Dom 20:00–04:00',
    address: 'Mz. V Lt. 4B, Zona Industrial II, C. 6, Piura',
    capacity: 250,
    icon: '<span class="venue-dot" style="--dot: #C4513D" aria-hidden="true"></span>',
  },
  {
    id: 'mood',
    name: 'Mood',
    shortName: 'Mood',
    tagline: 'Viernes de Mood & Rooftop Sessions',
    description: 'Rooftop lounge y club exclusivo con las mejores sesiones de DJ, coctelería signature y orquestas invitadas. La noche de Piura.',
    category: 'Lounge & Rooftop',
    accentColor: '#A67BC4',
    accentColorRGB: '166, 123, 196',
    heroImage: '/images/real_mood_dj.jpg',
    video: null,
    instagram: '@mood_piura',
    reelUrl: 'https://www.instagram.com/reel/DYn8VVMNQZq/',
    manager: 'Valentina R.',
    schedule: 'Jue–Sáb 21:00–04:00',
    address: 'Piura',
    capacity: 220,
    icon: '<span class="venue-dot" style="--dot: #A67BC4" aria-hidden="true"></span>',
  },
  {
    id: 'adria',
    name: 'Adriá',
    shortName: 'Adriá',
    tagline: 'La noche perfecta tiene una dirección #adrianights',
    description: 'Lounge bar sofisticado para compartir con amigos, disfrutar cócteles premium y vibrar con la mejor atmósfera nocturna de Piura.',
    category: 'Lounge Bar',
    accentColor: '#4E97B8',
    accentColorRGB: '78, 151, 184',
    heroImage: '/images/real_adria_amigos.jpg',
    video: '/videos/adria.mp4',
    instagram: '@adria.loungebar',
    reelUrl: 'https://www.instagram.com/reel/Dch2iPpNi4y/',
    manager: 'Andrés P.',
    schedule: 'Mié–Dom 20:00–03:00',
    address: 'Piura',
    capacity: 150,
    icon: '<span class="venue-dot" style="--dot: #4E97B8" aria-hidden="true"></span>',
  },
  {
    id: 'play',
    name: 'Play',
    shortName: 'Play',
    tagline: 'Where the night comes alive in Piura',
    description: 'El club más energético de Piura. Producción audiovisual de nivel mundial, pantallas LED gigantes, shows láser y los DJs top.',
    category: 'Club & Discoteca',
    accentColor: '#9CCB4A',
    accentColorRGB: '156, 203, 74',
    heroImage: '/images/real_play_neon.jpg',
    video: '/videos/play.mp4',
    instagram: '@play_piura',
    manager: 'Diego F.',
    schedule: 'Vie–Sáb 22:00–05:00',
    address: 'Piura',
    capacity: 400,
    icon: '<span class="venue-dot" style="--dot: #9CCB4A" aria-hidden="true"></span>',
  },
];

export function getVenue(id) {
  return VENUES.find(v => v.id === id);
}

export function getVenueColor(id) {
  const v = getVenue(id);
  return v ? v.accentColor : '#D4A857';
}
