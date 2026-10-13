// Operium Club — Centralized Store
// Estado reactivo en memoria con deep clone para reset

import { EVENTS } from './data/events.js';
import { MEMBERS } from './data/members.js';
import { PROMOTERS } from './data/promoters.js';
import { CAMPAIGNS } from './data/campaigns.js';
import { VENUES } from './data/venues.js';

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
  currentVenueId: 'mood',
  // Notifications / toast
  notifications: [],
  // Tour state
  tourStep: -1, // -1 = not active
  tourCompleted: false,
};

// The live state
let state = deepClone(SEED);
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
  listeners.forEach(fn => fn(state));
}

// ========================
// ACTIONS
// ========================

// — Demo control —
export function resetDemo() {
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
    date: '2026-10-16',
    type: 'link_click',
    memberId,
    eventId,
    sourceId: promoter.sourceId,
  };

  promoter.signals.push(signal);
  promoter.signalCount = promoter.signals.length;

  addNotification(`Señal registrada: ${promoter.name} → ${memberId}`);
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

  addNotification(`Campaña "${campaign.name}" enviada (DEMO) a ${eligible.length} miembros`);
  notify();
  return true;
}

// — Check-in (idempotent) —
export function checkIn(memberId, eventId, validatedBy = 'Sistema') {
  const member = state.members.find(m => m.id === memberId);
  const event = state.events.find(e => e.id === eventId);
  if (!member || !event) return { success: false, reason: 'Miembro o evento no encontrado' };

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
    date: '2026-10-16',
    time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    validatedBy,
  };

  member.checkins.push(checkin);
  event.checkinCount = (event.checkinCount || 0) + 1;

  addNotification(`Check-in: ${member.firstName} → "${event.title}" ✓`);
  notify();
  return { success: true, checkin };
}

// — Tour —
export function startTour() {
  state.tourStep = 0;
  notify();
}

export function nextTourStep() {
  state.tourStep++;
  if (state.tourStep > 5) {
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

export function setTourStep(step) {
  state.tourStep = Math.max(0, Math.min(5, step));
  notify();
}

export function endTour() {
  state.tourStep = -1;
  notify();
}

// — Simulate full weekend —
export function simulateWeekend() {
  // Step 1: Some members save events
  const savePairs = [
    ['member-001', 'ev-mood-01'],
    ['member-002', 'ev-play-01'],
    ['member-003', 'ev-sp-01'],
    ['member-004', 'ev-adria-01'],
    ['member-005', 'ev-mood-02'],
    ['member-010', 'ev-sp-02'],
    ['member-015', 'ev-play-02'],
    ['member-020', 'ev-adria-02'],
    ['member-025', 'ev-mood-01'],
    ['member-030', 'ev-play-01'],
  ];
  savePairs.forEach(([mid, eid]) => saveEvent(mid, eid));

  // Step 2: Promoter signals
  simulatePromoterSignal('promo-01', 'member-006', 'ev-mood-01');
  simulatePromoterSignal('promo-01', 'member-007', 'ev-mood-01');
  simulatePromoterSignal('promo-02', 'member-009', 'ev-play-01');

  // Step 3: Some check-ins
  const checkinPairs = [
    ['member-001', 'ev-mood-01', 'Valentina R.'],
    ['member-003', 'ev-sp-01', 'Carlos M.'],
    ['member-004', 'ev-adria-01', 'Andrés P.'],
    ['member-002', 'ev-play-01', 'Diego F.'],
    ['member-025', 'ev-mood-01', 'Valentina R.'],
  ];
  checkinPairs.forEach(([mid, eid, by]) => checkIn(mid, eid, by));

  addNotification('Simulación de fin de semana completada');
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

export function getVenueMetrics(venueId) {
  const venueEvents = state.events.filter(e => e.venueId === venueId);
  const totalSaved = venueEvents.reduce((sum, e) => sum + (e.savedCount || 0), 0);
  const totalCheckins = venueEvents.reduce((sum, e) => sum + (e.checkinCount || 0), 0);
  const totalCapacity = venueEvents.reduce((sum, e) => sum + (e.capacity || 0), 0);

  // Members who follow this venue
  const followers = state.members.filter(m => m.following.includes(venueId)).length;

  // Promoter signals for this venue
  const venuePromoters = state.promoters.filter(p => p.venue === venueId);
  const totalSignals = venuePromoters.reduce((sum, p) => sum + p.signals.length, 0);

  return {
    events: venueEvents.length,
    totalSaved,
    totalCheckins,
    totalCapacity,
    followers,
    totalSignals,
    conversionRate: totalSaved > 0 ? ((totalCheckins / totalSaved) * 100).toFixed(1) : '0.0',
  };
}

export function getGroupMetrics() {
  return state.venues.map(v => ({
    venue: v,
    metrics: getVenueMetrics(v.id),
  }));
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
