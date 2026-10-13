// Operium Club — Venue Data (4 locales)
// DATOS FICTICIOS PARA DEMOSTRACIÓN

export const VENUES = [
  {
    id: 'senor-peru',
    name: 'Señor Perú',
    shortName: 'S. Perú',
    tagline: 'Sabor, cultura y noche peruana',
    description: 'Gastronomía peruana de autor con música en vivo y cócteles de autor. Un espacio que celebra la tradición con una mirada contemporánea.',
    category: 'Restaurante & Bar',
    accentColor: '#C4513D',
    accentColorRGB: '196, 81, 61',
    heroImage: '/images/hero_senor_peru.png',
    manager: 'Carlos M.',
    schedule: 'Mar–Dom 19:00–02:00',
    address: 'Av. La Mar 1205, Miraflores',
    capacity: 120,
    icon: '🇵🇪',
  },
  {
    id: 'mood',
    name: 'Mood',
    shortName: 'Mood',
    tagline: 'Rooftop sessions & cocktails',
    description: 'Rooftop lounge con sesiones de DJ, cócteles de autor y vistas panorámicas. El lugar donde la noche comienza con estilo.',
    category: 'Lounge & Rooftop',
    accentColor: '#9B59B6',
    accentColorRGB: '155, 89, 182',
    heroImage: '/images/hero_mood.png',
    manager: 'Valentina R.',
    schedule: 'Jue–Sáb 20:00–03:00',
    address: 'Calle Berlín 480, Miraflores',
    capacity: 180,
    icon: '🌙',
  },
  {
    id: 'adria',
    name: 'Adriá',
    shortName: 'Adriá',
    tagline: 'Mediterráneo nocturno',
    description: 'Cocina mediterránea de autor con DJ sets y una carta de vinos selecta. Elegancia costera para noches memorables.',
    category: 'Restaurante & Lounge',
    accentColor: '#2E86AB',
    accentColorRGB: '46, 134, 171',
    heroImage: '/images/hero_adria.png',
    manager: 'Andrés P.',
    schedule: 'Mié–Dom 19:30–02:30',
    address: 'Malecón de la Reserva 610, Miraflores',
    capacity: 100,
    icon: '🌊',
  },
  {
    id: 'play',
    name: 'Play',
    shortName: 'Play',
    tagline: 'Where the night comes alive',
    description: 'Club de entretenimiento con los mejores DJs, shows en vivo y producción audiovisual de primer nivel. Energía pura.',
    category: 'Club & Entretenimiento',
    accentColor: '#7ED321',
    accentColorRGB: '126, 211, 33',
    heroImage: '/images/hero_play.png',
    manager: 'Diego F.',
    schedule: 'Vie–Sáb 22:00–05:00',
    address: 'Av. Del Ejército 250, Miraflores',
    capacity: 350,
    icon: '⚡',
  },
];

export function getVenue(id) {
  return VENUES.find(v => v.id === id);
}

export function getVenueColor(id) {
  const v = getVenue(id);
  return v ? v.accentColor : '#D4A857';
}
