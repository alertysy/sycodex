export const States = Object.freeze({
  ENTRY: "entry",
  TRIAGE: "triage",
  INTAKE: "intake",
  SAFETY_CHECK: "safety_check",
  ADVICE_READY: "advice_ready",
  SERVICE_DECISION: "service_decision",
  WATCHFUL_WAITING: "watchful_waiting",
  FOLLOWUP_ACTIVE: "followup_active",
  RESULT_INGESTED: "result_ingested",
  RE_EVALUATION: "re_evaluation",
  DOCTOR_HANDOFF: "doctor_handoff",
  VALUE_ELIGIBLE: "value_eligible",
  VALUE_BLOCKED: "value_blocked",
});

const transitions = {
  [States.ENTRY]: [States.TRIAGE],
  [States.TRIAGE]: [States.INTAKE, States.DOCTOR_HANDOFF],
  [States.INTAKE]: [States.SAFETY_CHECK],
  [States.SAFETY_CHECK]: [States.ADVICE_READY, States.DOCTOR_HANDOFF, States.VALUE_BLOCKED],
  [States.ADVICE_READY]: [States.SERVICE_DECISION, States.WATCHFUL_WAITING],
  [States.SERVICE_DECISION]: [States.WATCHFUL_WAITING, States.FOLLOWUP_ACTIVE, States.DOCTOR_HANDOFF],
  [States.WATCHFUL_WAITING]: [States.FOLLOWUP_ACTIVE, States.DOCTOR_HANDOFF],
  [States.FOLLOWUP_ACTIVE]: [States.RESULT_INGESTED, States.VALUE_ELIGIBLE, States.VALUE_BLOCKED, States.DOCTOR_HANDOFF],
  [States.RESULT_INGESTED]: [States.RE_EVALUATION],
  [States.RE_EVALUATION]: [States.ADVICE_READY, States.DOCTOR_HANDOFF, States.VALUE_ELIGIBLE, States.VALUE_BLOCKED],
  [States.VALUE_ELIGIBLE]: [States.FOLLOWUP_ACTIVE],
  [States.VALUE_BLOCKED]: [States.FOLLOWUP_ACTIVE, States.DOCTOR_HANDOFF],
  [States.DOCTOR_HANDOFF]: [],
};

export class ClinicalStateMachine {
  constructor(auditLogger) {
    this.currentState = States.ENTRY;
    this.auditLogger = auditLogger;
  }

  canTransition(to) {
    return (transitions[this.currentState] ?? []).includes(to);
  }

  transition(to, context = {}) {
    if (!this.canTransition(to)) {
      throw new Error(`Illegal transition ${this.currentState} -> ${to}`);
    }

    const from = this.currentState;
    this.currentState = to;

    this.auditLogger?.log({
      eventType: "state_transition",
      stateFrom: from,
      stateTo: to,
      decisionPayload: context,
    });

    return this.currentState;
  }
}

export function resolveValueState({ valueConfirmed, hasHighRisk, hasConflict, hasUncertainty }) {
  if (!valueConfirmed || hasHighRisk || hasConflict || hasUncertainty) {
    return States.VALUE_BLOCKED;
  }
  return States.VALUE_ELIGIBLE;
}
