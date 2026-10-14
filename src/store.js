// Operium Club — Centralized Store
// Estado reactivo en memoria con deep clone para reset
// Persistencia en sessionStorage para sobrevivir recargas de página

import { EVENTS } from './data/events.js';
import { MEMBERS } from './data/members.js';
import { PROMOTERS } from './data/promoters.js';
import { CAMPAIGNS } from './data/campaigns.js';
import { VENUES } from './data/venues.js';
import { PROMOTER_HISTORY } from './data/history.js';
import { AVG_TICKET, RECEIPT_SERIES, POINTS_PER_SOL, getReward } from './data/loyalty.js';

// Deep clone utility
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Initial seed data
const SEED = {
  events: deepClone(EVENTS),
  members: deepClone(MEMBERS),
  promoters: deepClone(PROMOTERS),
  campaigns: deepClone(CAMPAIGNS),
  venues: deepClone(VENUES),
  // Current demo context
  currentMemberId: 'member-001',
  currentRole: 'publico', // publico | promotor | marketing | ventas | encargado | grupo
  currentVenueId: 'all', // 'all' = todo el grupo; si no, id del local en foco
  // Módulos del negocio ocultos por el presentador (p. ej. si el cliente ya tiene uno)
  hiddenModules: [],
  // Correlativo de las boletas que llegan de caja en esta sesión
  receiptSeq: 4870,
  // Notifications / toast (transient, not persisted)
  notifications: [],
  // Tour state
  tourStep: -1, // -1 = not active
  tourCompleted: false,
};

// ========================
// SESSION STORAGE PERSISTENCE
// ========================
// v4: QR en puerta, boletas con DNI, puntos, referidos y recompensas actuales.
// Cambiar la clave evita restaurar un estado guardado con la forma anterior.
const STORAGE_KEY = 'operium_demo_state_v4';

function saveToSession() {
  try {
    // Excluir notifications (transitorias) de la persistencia
    const { notifications, ...persistable } = state;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch (_) {
    // Silenciar errores de almacenamiento (quota, private mode, etc.)
  }
}

function loadFromSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Restaurar notifications como array vacío (transitorio)
    saved.notifications = [];
    return saved;
  } catch (_) {
    return null;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (_) { /* noop */ }
}

// The live state — restore from sessionStorage if available
const restored = loadFromSession();
let state = restored || deepClone(SEED);
const listeners = new Set();

// ========================
// STORE API
// ========================

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  saveToSession();
  listeners.forEach(fn => fn(state));
}

// ========================
// ACTIONS
// ========================

// — Demo control —
export function resetDemo() {
  clearSession();
  state = deepClone(SEED);
  notify();
}

export function setRole(role) {
  state.currentRole = role;
  notify();
}

export function setCurrentVenue(venueId) {
  state.currentVenueId = venueId;
  notify();
}

export function setCurrentMember(memberId) {
  state.currentMemberId = memberId;
  notify();
}

// — Club actions —
export function saveEvent(memberId, eventId) {
  const member = state.members.find(m => m.id === memberId);
  const event = state.events.find(e => e.id === eventId);
  if (!member || !event) return false;

  // Don't double-save
  if (member.savedEvents.includes(eventId)) return false;

  member.savedEvents.push(eventId);
  event.savedCount = (event.savedCount || 0) + 1;

  addNotification(`${member.firstName} guardó "${event.title}"`);
  notify();
  return true;
}

export function unsaveEvent(memberId, eventId) {
  const member = state.members.find(m => m.id === memberId);
  const event = state.events.find(e => e.id === eventId);
  if (!member || !event) return false;

  const idx = member.savedEvents.indexOf(eventId);
  if (idx === -1) return false;

  member.savedEvents.splice(idx, 1);
  event.savedCount = Math.max(0, (event.savedCount || 0) - 1);
  notify();
  return true;
}

export function followVenue(memberId, venueId) {
  const member = state.members.find(m => m.id === memberId);
  if (!member) return false;
  if (member.following.includes(venueId)) return false;

  member.following.push(venueId);
  addNotification(`${member.firstName} sigue a ${state.venues.find(v => v.id === venueId)?.name}`);
  notify();
  return true;
}

// — Event management actions —
export function createEvent(eventData) {
  const venue = state.venues.find(v => v.id === eventData.venueId);
  const id = eventData.id || `ev-${eventData.venueId}-${Date.now().toString(36)}`;
  const newEvent = {
    id,
    venueId: eventData.venueId,
    title: eventData.title || 'Nuevo Evento Operium',
    subtitle: eventData.subtitle || 'Experiencia exclusiva del club',
    description: eventData.description || 'Evento programado para los miembros del club.',
    date: eventData.date || '2026-10-17',
    dayLabel: eventData.dayLabel || 'Sábado 17 Oct',
    time: eventData.time || '21:00',
    endTime: eventData.endTime || '03:30',
    image: eventData.image || (venue?.id === 'senor-peru' ? '/images/real_senor_peru_flyer.jpg' : venue?.id === 'mood' ? '/images/real_mood_dj.jpg' : venue?.id === 'adria' ? '/images/real_adria_amigos.jpg' : '/images/real_play_dj.jpg'),
    video: eventData.video || null,
    capacity: parseInt(eventData.capacity, 10) || 200,
    savedCount: 0,
    checkinCount: 0,
    savedAttended: 0,
    identifiedReceipts: 0,
    identifiedSpend: 0,
    finished: false,
    tags: Array.isArray(eventData.tags) ? eventData.tags : (eventData.tags ? eventData.tags.split(',').map(t => t.trim()) : ['Club Demo']),
    fictitious: true,
    benefit: eventData.benefit || {
      title: 'Beneficio de cortesía',
      description: 'Acceso preferencial para miembros del club.',
      eligibility: 'Miembros con perfil activo',
      conditions: 'Sujeto a aforo disponible. Presentar pase.',
    },
  };

  state.events.push(newEvent);
  addNotification(`Evento "${newEvent.title}" creado en ${venue?.name || 'el local'} (DEMO)`);
  notify();
  return newEvent;
}

export function updateEvent(eventId, fields) {
  const event = state.events.find(e => e.id === eventId);
  if (!event) return null;

  Object.assign(event, fields);
  if (fields.capacity) event.capacity = parseInt(fields.capacity, 10);
  if (typeof fields.tags === 'string') {
    event.tags = fields.tags.split(',').map(t => t.trim());
  }

  addNotification(`Evento "${event.title}" actualizado (DEMO)`);
  notify();
  return event;
}

export function deleteEvent(eventId) {
  const idx = state.events.findIndex(e => e.id === eventId);
  if (idx === -1) return false;

  const title = state.events[idx].title;
  state.events.splice(idx, 1);
  addNotification(`Evento "${title}" eliminado de la agenda`);
  notify();
  return true;
}

// — Promoter actions —
export function simulatePromoterSignal(promoterId, memberId, eventId) {
  const promoter = state.promoters.find(p => p.id === promoterId);
  if (!promoter) return false;

  // Check for duplicate attribution
  const existing = promoter.signals.find(
    s => s.memberId === memberId && s.eventId === eventId
  );
  if (existing) return false;

  const signal = {
    date: '2026-10-15',
    type: 'link_click',
    memberId,
    eventId,
    sourceId: promoter.sourceId,
  };

  promoter.signals.push(signal);

  const member = state.members.find(m => m.id === memberId);
  addNotification(`Visita atribuida a ${promoter.name}: ${member ? member.name : memberId}`);
  notify();
  return true;
}

// — Marketing actions —
export function sendCampaign(campaignId) {
  const campaign = state.campaigns.find(c => c.id === campaignId);
  if (!campaign) return false;
  if (campaign.status === 'sent' || campaign.status === 'completed') return false;

  // Calculate eligible
  const eligible = state.members.filter(m => {
    if (campaign.segment && m.segment !== campaign.segment) return false;
    if (campaign.channel === 'email' && !m.consent.email) return false;
    if (campaign.channel === 'sms' && !m.consent.sms) return false;
    if (campaign.venueId && !m.consent.byVenue[campaign.venueId]) return false;
    return true;
  });

  const excluded = state.members.filter(m => {
    if (campaign.segment && m.segment !== campaign.segment) return false;
    // Meets segment but fails consent
    if (campaign.channel === 'email' && !m.consent.email) return true;
    if (campaign.venueId && !m.consent.byVenue[campaign.venueId]) return true;
    return false;
  });

  campaign.eligibleCount = eligible.length;
  campaign.excludedCount = excluded.length;
  campaign.excludedReasons = [
    {
      reason: `Sin consentimiento de ${campaign.channel}`,
      count: state.members.filter(m => {
        if (campaign.segment && m.segment !== campaign.segment) return false;
        return campaign.channel === 'email' ? !m.consent.email : !m.consent.sms;
      }).length,
    },
    {
      reason: `Sin autorización para ${state.venues.find(v => v.id === campaign.venueId)?.name || 'local'}`,
      count: state.members.filter(m => {
        if (campaign.segment && m.segment !== campaign.segment) return false;
        return campaign.venueId && !m.consent.byVenue[campaign.venueId];
      }).length,
    },
  ];

  campaign.status = 'sent';
  campaign.sentAt = new Date().toISOString();
  // Simulate responses
  campaign.responses = {
    opened: Math.floor(eligible.length * 0.65),
    clicked: Math.floor(eligible.length * 0.35),
    saved: Math.floor(eligible.length * 0.15),
  };

  addNotification(`Campaña enviada a ${eligible.length} miembros (simulado)`);
  notify();
  return true;
}

// — Check-in (idempotent) —
// method 'qr': el portero escanea el pase del miembro (existe solo si guardó el evento).
// method 'manual': búsqueda por nombre, como respaldo.
export function checkIn(memberId, eventId, validatedBy = 'Sistema', method = 'manual') {
  const member = state.members.find(m => m.id === memberId);
  const event = state.events.find(e => e.id === eventId);
  if (!member || !event) return { success: false, reason: 'Miembro o evento no encontrado' };
  if (method === 'qr' && !member.savedEvents.includes(eventId)) {
    return { success: false, reason: 'Este pase no corresponde a este evento.' };
  }

  // Idempotent: check if already checked in
  const alreadyCheckedIn = member.checkins.find(c => c.eventId === eventId);
  if (alreadyCheckedIn) {
    return {
      success: false,
      reason: `Ya registrado para este evento (${alreadyCheckedIn.date}, validado por ${alreadyCheckedIn.validatedBy})`,
      duplicate: true,
    };
  }

  const checkin = {
    eventId,
    date: event.date,
    time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    validatedBy,
    method,
  };

  member.checkins.push(checkin);
  event.checkinCount = (event.checkinCount || 0) + 1;
  // Conversión: solo cuenta si este miembro había guardado el evento
  if (member.savedEvents.includes(eventId)) {
    event.savedAttended = (event.savedAttended || 0) + 1;
  }

  addNotification(`${method === 'qr' ? 'Ingreso con QR' : 'Ingreso'}: ${member.firstName} → "${event.title}"`);
  notify();
  return { success: true, checkin };
}

// — Boletas de caja (solo lectura) —
// Llega una boleta electrónica con DNI desde la caja del local. Si el DNI es de
// un miembro que autorizó usar sus consumos, se vincula y suma puntos; si no,
// Operium no guarda nada personal de esa boleta.
export function recordPurchase(memberId, venueId, amount, eventId = null) {
  const member = state.members.find(m => m.id === memberId);
  if (!member) return { linked: false, reason: 'Miembro no encontrado' };
  const event = eventId ? state.events.find(e => e.id === eventId) : null;
  state.receiptSeq = (state.receiptSeq || 4870) + 1;
  const receipt = `${RECEIPT_SERIES[venueId] || 'B000'}-${String(state.receiptSeq).padStart(6, '0')}`;
  const venueName = state.venues.find(v => v.id === venueId)?.name || venueId;

  if (!member.consent.loyalty) {
    addNotification(`Boleta ${receipt} de ${venueName} sin vincular: el cliente no activó sus puntos`);
    notify();
    return { linked: false, receipt, amount };
  }

  const purchase = {
    receipt,
    venueId,
    eventId,
    date: event?.date || '2026-10-15',
    amount,
    points: Math.floor(amount * POINTS_PER_SOL),
  };
  member.purchases.push(purchase);
  if (event) {
    event.identifiedReceipts = (event.identifiedReceipts || 0) + 1;
    event.identifiedSpend = (event.identifiedSpend || 0) + amount;
  }
  addNotification(`Boleta ${receipt}: ${member.firstName} suma ${purchase.points} puntos en ${venueName}`);
  notify();
  return { linked: true, receipt, amount, points: purchase.points };
}

// — Puntos del miembro —
export function memberPoints(member) {
  const earned = (member.purchases || []).reduce((acc, p) => acc + p.points, 0);
  const spent = (member.redemptions || []).reduce((acc, r) => acc + r.points, 0);
  return earned - spent;
}

export function redeemReward(memberId, rewardId) {
  const member = state.members.find(m => m.id === memberId);
  const reward = getReward(rewardId);
  if (!member || !reward) return { success: false, reason: 'Recompensa no encontrada' };
  if (memberPoints(member) < reward.points) return { success: false, reason: 'Aún no tienes puntos suficientes' };

  const redemption = {
    code: `CJ-${String(2400 + (state.receiptSeq % 1000) + member.redemptions.length).padStart(4, '0')}`,
    rewardId,
    points: reward.points,
    date: '2026-10-15',
    status: 'pendiente',
  };
  member.redemptions.push(redemption);
  addNotification(`${member.firstName} canjeó "${reward.title}" (${reward.points} puntos)`);
  notify();
  return { success: true, redemption };
}

export function setLoyaltyConsent(memberId, value) {
  const member = state.members.find(m => m.id === memberId);
  if (!member) return;
  member.consent.loyalty = value;
  addNotification(value ? `${member.firstName} activó sus puntos` : `${member.firstName} desactivó sus puntos`);
  notify();
}

// — Tour —
export function startTour() {
  state.tourStep = 0;
  notify();
}

export function nextTourStep(total = 6) {
  state.tourStep++;
  if (state.tourStep > total - 1) {
    state.tourStep = -1;
    state.tourCompleted = true;
  }
  notify();
}

export function prevTourStep() {
  if (state.tourStep > 0) {
    state.tourStep--;
    notify();
  }
}

export function setTourStep(step, total = 6) {
  state.tourStep = Math.max(0, Math.min(total - 1, step));
  notify();
}

export function endTour() {
  state.tourStep = -1;
  notify();
}

// — Simular la noche del viernes —
// Ritmo realista por local: ocupación del aforo y % de quienes guardaron que llegan.
const FRIDAY_RATES = {
  'senor-peru': { occupancy: 0.72, conversion: 0.48 },
  mood: { occupancy: 0.74, conversion: 0.62 },
  adria: { occupancy: 0.70, conversion: 0.58 },
  play: { occupancy: 0.77, conversion: 0.43 },
};

export function simulateFriday() {
  // 1. Últimos guardados y visitas por enlace antes de abrir
  [
    ['member-001', 'ev-mood-01'], ['member-025', 'ev-mood-01'], ['member-003', 'ev-sp-01'],
    ['member-004', 'ev-adria-01'], ['member-002', 'ev-play-01'], ['member-030', 'ev-play-01'],
  ].forEach(([mid, eid]) => saveEvent(mid, eid));
  simulatePromoterSignal('promo-01', 'member-006', 'ev-mood-01');
  simulatePromoterSignal('promo-02', 'member-009', 'ev-play-01');
  simulatePromoterSignal('promo-03', 'member-011', 'ev-sp-01');

  // 2. Cifras de la noche: ingresos y conversión agregados por evento
  state.events.filter(e => e.date === '2026-10-16' && !e.finished).forEach(event => {
    const rate = FRIDAY_RATES[event.venueId] || { occupancy: 0.7, conversion: 0.5 };
    event.checkinCount = Math.max(event.checkinCount || 0, Math.round(event.capacity * rate.occupancy));
    event.savedAttended = Math.max(event.savedAttended || 0, Math.round(event.savedCount * rate.conversion));
    // Boletas con DNI que llegaron de caja esa noche (algo más de un tercio del público)
    event.identifiedReceipts = Math.max(event.identifiedReceipts || 0, Math.round(event.checkinCount * 0.37));
    event.identifiedSpend = Math.max(event.identifiedSpend || 0, Math.round(event.identifiedReceipts * AVG_TICKET[event.venueId]));
    event.finished = true;
  });

  // Referidos de cada promotor que entraron con QR y lo que consumieron, en agregado
  state.promoters.forEach(p => {
    const last = PROMOTER_HISTORY[p.id]?.at(-1);
    if (last && !p.fridayBase) {
      p.fridayBase = { attended: Math.round(last.attended * 0.48), spend: Math.round(last.spend * 0.47) };
    }
  });

  // 3. Algunos ingresos con nombre propio para la actividad reciente
  [
    ['member-001', 'ev-mood-01', 'Valentina R.'],
    ['member-025', 'ev-mood-01', 'Valentina R.'],
    ['member-003', 'ev-sp-01', 'Carlos M.'],
    ['member-004', 'ev-adria-01', 'Andrés P.'],
    ['member-002', 'ev-play-01', 'Diego F.'],
  ].forEach(([mid, eid, by]) => {
    const member = state.members.find(m => m.id === mid);
    if (member && !member.checkins.some(c => c.eventId === eid)) {
      member.checkins.push({ eventId: eid, date: '2026-10-16', time: '23:40', validatedBy: by, method: 'qr' });
      // Su boleta de esa noche, si autorizó los puntos (ya incluida en el agregado del evento)
      if (member.consent.loyalty && !member.purchases.some(p => p.eventId === eid)) {
        const venueId = state.events.find(e => e.id === eid)?.venueId;
        const amount = Math.round(AVG_TICKET[venueId] * (1 + (Number(mid.slice(-2)) % 5) / 10));
        state.receiptSeq += 1;
        member.purchases.push({
          receipt: `${RECEIPT_SERIES[venueId]}-${String(state.receiptSeq).padStart(6, '0')}`,
          venueId, eventId: eid, date: '2026-10-16', amount, points: amount,
        });
      }
    }
  });

  addNotification('Noche del viernes simulada');
  notify();
}

// — Módulos visibles en el negocio —
export function setModuleHidden(moduleId, hidden) {
  const set = new Set(state.hiddenModules);
  if (hidden) set.add(moduleId); else set.delete(moduleId);
  state.hiddenModules = [...set];
  notify();
}

// — Notifications —
function addNotification(message) {
  state.notifications.unshift({
    id: Date.now() + Math.random(),
    message,
    time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
  });
  // Keep last 20
  if (state.notifications.length > 20) {
    state.notifications = state.notifications.slice(0, 20);
  }
}

// ========================
// COMPUTED METRICS
// ========================

// Métricas por local (compatibilidad con verify_operium.js; la interfaz usa src/metrics.js)
export function getVenueMetrics(venueId) {
  const venueEvents = state.events.filter(e => e.venueId === venueId);
  const totalSaved = venueEvents.reduce((sum, e) => sum + (e.savedCount || 0), 0);
  const totalCheckins = venueEvents.reduce((sum, e) => sum + (e.checkinCount || 0), 0);
  return {
    events: venueEvents.length,
    totalSaved,
    totalCheckins,
    totalCapacity: venueEvents.reduce((sum, e) => sum + (e.capacity || 0), 0),
    followers: state.members.filter(m => m.following.includes(venueId)).length,
    totalSignals: state.promoters.filter(p => p.venue === venueId).reduce((sum, p) => sum + p.signals.length, 0),
    conversionRate: totalSaved > 0 ? ((totalCheckins / totalSaved) * 100).toFixed(1) : '0.0',
  };
}

export function getGroupMetrics() {
  return state.venues.map(v => ({ venue: v, metrics: getVenueMetrics(v.id) }));
}

export function getCampaignMetrics(campaignId) {
  const campaign = state.campaigns.find(c => c.id === campaignId);
  if (!campaign) return null;

  // Recalculate eligible/excluded from current state
  const eligible = state.members.filter(m => {
    if (campaign.segment && m.segment !== campaign.segment) return false;
    if (campaign.channel === 'email' && !m.consent.email) return false;
    if (campaign.channel === 'sms' && !m.consent.sms) return false;
    if (campaign.venueId && !m.consent.byVenue[campaign.venueId]) return false;
    return true;
  });

  return {
    eligibleCount: eligible.length,
    ...campaign.responses,
  };
}
