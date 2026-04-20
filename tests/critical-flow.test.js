import test from 'node:test';
import assert from 'node:assert/strict';
import { runMvpFlow } from '../packages/services/src/runMvpFlow.js';
import { States } from '../packages/domain/src/stateMachine.js';
import { evaluateOvermedicalization } from '../packages/rules/src/medicalRules.js';

test('1) low risk symptom -> watchful waiting/value blocked by default', () => {
  const result = runMvpFlow({ symptoms: ['cough'], session: { rawUserInput: '轻微咳嗽' } });
  assert.equal(result.state, States.VALUE_BLOCKED);
  assert.equal(result.serviceDecision.action, 'watchful_waiting');
});

test('2) medium symptom path still reaches service decision', () => {
  const result = runMvpFlow({ symptoms: ['cough', 'fatigue', 'headache', 'sore_throat'], session: { rawUserInput: '不舒服' } });
  assert.equal(result.triage.severityHint, 'medium');
  assert.equal(result.serviceDecision.action, 'watchful_waiting');
});

test('3) high-risk symptom forces doctor handoff', () => {
  const result = runMvpFlow({ symptoms: ['chest_pain', 'dyspnea'], session: { rawUserInput: '胸痛气短' } });
  assert.equal(result.state, States.DOCTOR_HANDOFF);
  assert.equal(result.safety.hasHighRisk, true);
});

test('4) conflict data blocks value eligibility', () => {
  const result = runMvpFlow({
    symptoms: ['cough'],
    structuredAnswers: { hasFever: false },
    session: { rawUserInput: '我高热三天' },
  });
  assert.ok(result.safety.conflictFlags.includes('structured_text_conflict'));
  assert.equal(result.state, States.VALUE_BLOCKED);
});

test('5) ingested result must trigger re-evaluation path', () => {
  const result = runMvpFlow({ symptoms: ['cough'], ingestedResult: true, session: { rawUserInput: '咳嗽' } });
  const transitions = result.events.filter((e) => e.eventType === 'state_transition').map((e) => e.stateTo);
  assert.ok(transitions.includes(States.RESULT_INGESTED));
  assert.ok(transitions.includes(States.RE_EVALUATION));
});

test('6) overmedicalization flags can be evaluated', () => {
  const flags = evaluateOvermedicalization({ repeatedTests: 2, followupDays: 1, polypharmacyCount: 6 });
  assert.ok(flags.includes('repeated_tests'));
  assert.ok(flags.includes('over_dense_followup'));
  assert.ok(flags.includes('polypharmacy_risk'));
});

test('7) value confirmed can enable offer', () => {
  const result = runMvpFlow({ symptoms: ['cough'], valueConfirmed: true, session: { rawUserInput: '咳嗽' } });
  assert.equal(result.valueDecision.offerEligible, true);
  assert.equal(result.state, States.VALUE_ELIGIBLE);
});

test('8) high risk blocks commercial offer', () => {
  const result = runMvpFlow({ symptoms: ['chest_pain', 'cold_sweat'], valueConfirmed: true, session: { rawUserInput: '胸痛' } });
  assert.equal(result.state, States.DOCTOR_HANDOFF);
});

test('9) payment/order state is represented in value memory when eligible', () => {
  const result = runMvpFlow({ symptoms: ['cough'], valueConfirmed: true, session: { rawUserInput: '咳嗽' } });
  assert.equal(result.memory.value.offerType, 'light_followup_plan');
});

test('10) followup plan/tasks visible after flow', () => {
  const result = runMvpFlow({ symptoms: ['cough'], session: { rawUserInput: '咳嗽' } });
  assert.equal(result.followup.followupStarted, true);
  assert.equal(result.plan.taskItems.length > 0, true);
});
