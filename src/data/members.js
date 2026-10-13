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

    members.push({
      id: `member-${String(i + 1).padStart(3, '0')}`,
      name: `${firstName} ${lastInit}`,
      firstName,
      segment,
      registeredDate: `2026-${String(7 + (i % 4)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
      consent: {
        email: hasEmailConsent,
        sms: hasSmsConsent,
        byVenue: consentByVenue,
      },
      interactions,
      savedEvents: [],
      following: [],
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
