// Automated Verification Script for Operium Demo
import { 
  getState, 
  resetDemo, 
  saveEvent, 
  unsaveEvent, 
  simulatePromoterSignal, 
  sendCampaign, 
  checkIn, 
  getVenueMetrics, 
  getGroupMetrics 
} from './src/store.js';
import { VENUES } from './src/data/venues.js';
import { EVENTS } from './src/data/events.js';
import { MEMBERS } from './src/data/members.js';
import { PROMOTERS } from './src/data/promoters.js';
import { CAMPAIGNS } from './src/data/campaigns.js';

console.log('=== TEST SUITE: OPERIUM DEMO VERIFICATION ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

// 1. DATASET INTEGRITY
assert(VENUES.length === 4, 'Dataset has exactly 4 venues');
const venueIds = VENUES.map(v => v.id);
assert(venueIds.includes('senor-peru') && venueIds.includes('mood') && venueIds.includes('adria') && venueIds.includes('play'), 'All 4 named venues are present: Señor Perú, Mood, Adriá, Play');

assert(EVENTS.length >= 8, `Dataset has at least 8 events (actual: ${EVENTS.length})`);
for (const vId of venueIds) {
  const count = EVENTS.filter(e => e.venueId === vId).length;
  assert(count >= 2, `Venue "${vId}" has at least 2 events (actual: ${count})`);
}

assert(MEMBERS.length === 80, `Dataset has exactly 80 members (actual: ${MEMBERS.length})`);
assert(PROMOTERS.length >= 2, `Dataset has at least 2 promoters (actual: ${PROMOTERS.length})`);
assert(CAMPAIGNS.length >= 2, `Dataset has at least 2 campaigns (actual: ${CAMPAIGNS.length})`);

// 2. STORY STEP 1: SAVE EVENT (INTENT ≠ CHECKIN ≠ SALE)
resetDemo();
const initialMoodMetrics = getVenueMetrics('mood');
const initialMoodSaved = initialMoodMetrics.totalSaved;
const initialMoodCheckins = initialMoodMetrics.totalCheckins;

const member001 = getState().members.find(m => m.id === 'member-001');
const alreadySaved = member001.savedEvents.includes('ev-mood-01');
if (!alreadySaved) {
  const saveSuccess = saveEvent('member-001', 'ev-mood-01');
  assert(saveSuccess === true, 'Step 1: Member-001 can save Mood event "ev-mood-01"');
}
const postSaveMoodMetrics = getVenueMetrics('mood');
assert(postSaveMoodMetrics.totalSaved > initialMoodSaved || alreadySaved, 'Step 1: Mood savedCount increased');
assert(postSaveMoodMetrics.totalCheckins === initialMoodCheckins, 'Step 1: Saving does NOT increase physical check-ins');

// Double save prevention
const doubleSave = saveEvent('member-001', 'ev-mood-01');
assert(doubleSave === false, 'Step 1: Double-saving same event is prevented');

// 3. STORY STEP 2: PROMOTER ATTRIBUTION SIGNAL
const initialPromoSignals = getState().promoters.find(p => p.id === 'promo-01').signals.length;
const promoSignal1 = simulatePromoterSignal('promo-01', 'member-050', 'ev-mood-01');
assert(promoSignal1 === true, 'Step 2: Promoter Ricardo V. captures signal for member-050');
const promoSignal2 = simulatePromoterSignal('promo-01', 'member-050', 'ev-mood-01');
assert(promoSignal2 === false, 'Step 2: Duplicate attribution signal is blocked');
const postPromoSignals = getState().promoters.find(p => p.id === 'promo-01').signals.length;
assert(postPromoSignals === initialPromoSignals + 1, 'Step 2: Signal count incremented by exactly 1');

// 4. STORY STEP 3: MARKETING CONSENT FILTER (DS 016-2024-JUS)
const camp01 = getState().campaigns.find(c => c.id === 'camp-01');
assert(camp01.status === 'draft', 'Step 3: Campaign camp-01 starts as draft');
const sendResult = sendCampaign('camp-01');
assert(sendResult === true, 'Step 3: Campaign sent successfully in DEMO mode');
const updatedCamp01 = getState().campaigns.find(c => c.id === 'camp-01');
assert(updatedCamp01.status === 'sent', 'Step 3: Campaign status updated to "sent"');
assert(updatedCamp01.eligibleCount > 0, `Step 3: Eligible members calculated (>0, actual: ${updatedCamp01.eligibleCount})`);
assert(updatedCamp01.excludedCount > 0, `Step 3: Ineligible members properly excluded (>0, actual: ${updatedCamp01.excludedCount})`);
assert(updatedCamp01.responses.opened > 0, 'Step 3: Simulated responses generated (opens > 0)');

// 5. STORY STEP 4: CHECK-IN IDEMPOTENCY
const checkin1 = checkIn('member-005', 'ev-mood-01', 'Valentina R.');
assert(checkin1.success === true, 'Step 4: Check-in registered successfully for member-005');
assert(checkin1.checkin.validatedBy === 'Valentina R.', 'Step 4: Validator recorded accurately');

const checkin2 = checkIn('member-005', 'ev-mood-01', 'Valentina R.');
assert(checkin2.success === false && checkin2.duplicate === true, 'Step 4: Second check-in for same event is blocked (idempotent)');

const postCheckinMood = getVenueMetrics('mood');
assert(postCheckinMood.totalCheckins === initialMoodCheckins + 1, 'Step 4: Mood checkin total increased by exactly 1');

// 6. STORY STEP 5: ISOLATION OF VENUES & AGGREGATE GROUP
const playMetrics = getVenueMetrics('play');
const senorPeruMetrics = getVenueMetrics('senor-peru');
const adriaMetrics = getVenueMetrics('adria');
assert(playMetrics.totalCheckins === 0, 'Step 5: Play data remained untouched by Mood check-in');
assert(senorPeruMetrics.totalCheckins === 0, 'Step 5: Señor Perú data remained untouched');
assert(adriaMetrics.totalCheckins === 0, 'Step 5: Adriá data remained untouched');

const groupMetrics = getGroupMetrics();
assert(groupMetrics.length === 4, 'Step 6: Group summary aggregates exactly 4 venues');
const totalGroupCheckins = groupMetrics.reduce((sum, g) => sum + g.metrics.totalCheckins, 0);
assert(totalGroupCheckins === postCheckinMood.totalCheckins, 'Step 6: Group checkins equals sum of venue checkins');

// 7. RESET INTEGRITY
resetDemo();
const resetState = getState();
assert(resetState.campaigns.find(c => c.id === 'camp-01').status === 'draft', 'Reset: Campaign reverted to draft');
assert(resetState.events.find(e => e.id === 'ev-mood-01').checkinCount === 0, 'Reset: Check-ins reset to 0');
assert(resetState.tourStep === -1, 'Reset: Tour state reset');

console.log(`\n=== RESULTS: ${passedTests}/${totalTests} TESTS PASSED ===`);

