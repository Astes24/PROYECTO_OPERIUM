// Operium Club — Puntos y consumo (conectado a caja, solo lectura)
// DATOS FICTICIOS PARA DEMOSTRACIÓN
//
// Operium no cobra ni emite boletas. Lee las boletas electrónicas que ya emite
// la caja del local y, si llevan el DNI de un miembro que autorizó usar sus
// consumos, las vincula a su perfil y suma puntos.

// Reglas del miembro
export const POINTS_PER_SOL = 1; // 1 punto por cada S/ 1 de la boleta
export const POINTS_VALID_MONTHS = 6;

// Reglas del promotor: gente que entra con QR y lo que esa gente consume
export const PROMO_POINTS_PER_ENTRY = 10; // por cada referido que entra con su QR
export const PROMO_SOLES_PER_POINT = 10; // 1 punto por cada S/ 10 que consume su referido
export const REFERRAL_WINDOW_DAYS = 90; // desde que el referido se registró con su enlace

// Ticket medio por persona y noche (boletas con DNI)
export const AVG_TICKET = { 'senor-peru': 74, mood: 92, adria: 118, play: 58 };

// Serie de boletas de cada local
export const RECEIPT_SERIES = { 'senor-peru': 'B001', mood: 'B002', adria: 'B003', play: 'B004' };

// Recompensas: valen en los cuatro locales del grupo. Devuelven en torno al 5%
// de lo consumido (200 pts = S/ 200 gastados → S/ 10); el escalón más alto
// premia algo más la fidelidad (≈6%).
export const REWARDS = [
  { id: 'rw-10', points: 200, title: 'S/ 10 de descuento', desc: 'Se descuenta de tu cuenta en barra.' },
  { id: 'rw-desc', points: 600, title: 'S/ 30 de descuento', desc: 'Se descuenta de tu cuenta en barra.' },
  { id: 'rw-70', points: 1200, title: 'S/ 70 de descuento', desc: 'Se descuenta de tu cuenta en barra.' },
];

export const getReward = (id) => REWARDS.find(r => r.id === id);
