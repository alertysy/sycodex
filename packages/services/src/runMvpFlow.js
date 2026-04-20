import { ClinicalStateMachine, States, resolveValueState } from "../../domain/src/stateMachine.js";
import { createClinicalState, createSessionContext, createUserProfile } from "../../domain/src/models.js";
import {
  AuditAgent,
  CarePlanAgent,
  FollowupTriggerAgent,
  MedicalAssistantAgent,
  MemoryManagerAgent,
  OrchestratorAgent,
  SafetyAgent,
  ServiceOrchestrationAgent,
  TriageAgent,
  ValueConversionAgent,
} from "../../agents/src/agents.js";
import { AuditLogger } from "../../observability/src/auditLogger.js";

export function buildMvpRuntime() {
  const logger = new AuditLogger();
  const orchestrator = new OrchestratorAgent({
    triage: new TriageAgent(),
    safety: new SafetyAgent(),
    assistant: new MedicalAssistantAgent(),
    carePlan: new CarePlanAgent(),
    service: new ServiceOrchestrationAgent(),
    followup: new FollowupTriggerAgent(),
    value: new ValueConversionAgent(),
    memory: new MemoryManagerAgent(),
    audit: new AuditAgent(logger),
  });

  return { orchestrator, logger };
}

export function runMvpFlow(input) {
  const { orchestrator, logger } = buildMvpRuntime();
  const sm = new ClinicalStateMachine(logger);

  const user = createUserProfile(input.userProfile);
  const session = createSessionContext(input.session);
  let clinical = createClinicalState();

  sm.transition(States.TRIAGE, { reason: "entry_started" });
  const triage = orchestrator.triage.run(input);

  if (input.forceDoctorHandoff) {
    sm.transition(States.DOCTOR_HANDOFF, { reason: "forced" });
    return { state: sm.currentState, triage, events: logger.events };
  }

  sm.transition(States.INTAKE, { reason: "triage_completed" });
  sm.transition(States.SAFETY_CHECK, { reason: "intake_completed" });

  const safety = orchestrator.safety.run({ ...input, history: user, rawUserInput: session.rawUserInput });
  clinical = { ...clinical, ...safety };

  if (safety.hasHighRisk) {
    sm.transition(States.DOCTOR_HANDOFF, { reason: "red_flag" });
    return { state: sm.currentState, triage, safety, clinical, events: logger.events };
  }

  sm.transition(States.ADVICE_READY, { reason: "safety_check_passed" });
  const advice = orchestrator.assistant.run({ hasHighRisk: safety.hasHighRisk });

  sm.transition(States.SERVICE_DECISION, { reason: "advice_rendered" });
  const serviceDecision = orchestrator.service.run({ riskLevel: advice.riskLevel, blocked: safety.blocked });

  if (serviceDecision.action === "doctor_handoff") {
    sm.transition(States.DOCTOR_HANDOFF, { reason: "service_blocked" });
    return { state: sm.currentState, triage, safety, advice, serviceDecision, events: logger.events };
  }

  sm.transition(States.WATCHFUL_WAITING, { reason: "watchful_waiting" });
  sm.transition(States.FOLLOWUP_ACTIVE, { reason: "followup_started" });

  const plan = orchestrator.carePlan.run({ riskLevel: advice.riskLevel, overmedicalizationFlags: safety.overmedicalizationFlags });
  const followup = orchestrator.followup.run();

  if (input.ingestedResult) {
    sm.transition(States.RESULT_INGESTED, { reason: "result_ingested" });
    sm.transition(States.RE_EVALUATION, { reason: "re_evaluation_completed" });
  }

  const valueDecision = orchestrator.value.run({ valueConfirmed: Boolean(input.valueConfirmed), blocked: safety.blocked });
  const valueState = resolveValueState({
    valueConfirmed: Boolean(input.valueConfirmed),
    hasHighRisk: safety.hasHighRisk,
    hasConflict: safety.conflictFlags.length > 0,
    hasUncertainty: input.hasUncertainty ?? false,
  });

  if (valueState === States.VALUE_ELIGIBLE && sm.canTransition(States.VALUE_ELIGIBLE)) {
    sm.transition(States.VALUE_ELIGIBLE, { reason: "value_confirmed" });
  } else if (sm.canTransition(States.VALUE_BLOCKED)) {
    sm.transition(States.VALUE_BLOCKED, { reason: "value_blocked" });
  }

  const memory = orchestrator.memory.run({
    session,
    clinical,
    plan,
    value: valueDecision,
  });

  orchestrator.audit.run({
    state: sm.currentState,
    riskLevel: advice.riskLevel,
    offerEligible: valueDecision.offerEligible,
  });

  return {
    state: sm.currentState,
    triage,
    safety,
    advice,
    serviceDecision,
    followup,
    plan,
    valueDecision,
    memory,
    events: logger.events,
  };
}
