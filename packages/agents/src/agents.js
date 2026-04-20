import { evaluateConflicts, evaluateOvermedicalization, evaluateRedFlags } from "../../rules/src/medicalRules.js";

export class TriageAgent {
  run(input) {
    return { intent: input.entryType ?? "symptom", severityHint: (input.symptoms || []).length > 3 ? "medium" : "low" };
  }
}

export class SafetyAgent {
  run(input) {
    const redFlagHits = evaluateRedFlags(input);
    const conflictFlags = evaluateConflicts(input);
    const overmedicalizationFlags = evaluateOvermedicalization(input);
    return {
      redFlagHits,
      conflictFlags,
      overmedicalizationFlags,
      hasHighRisk: redFlagHits.length > 0,
      blocked: redFlagHits.length > 0 || conflictFlags.length > 0,
    };
  }
}

export class MedicalAssistantAgent {
  run({ hasHighRisk }) {
    if (hasHighRisk) {
      return { riskLevel: "high", summary: "请立即转人工/医生接管" };
    }
    return { riskLevel: "low_or_medium", summary: "可进入观察或服务承接决策" };
  }
}

export class CarePlanAgent {
  run({ riskLevel, overmedicalizationFlags }) {
    const followupLevel = overmedicalizationFlags.length > 0 ? 4 : riskLevel === "high" ? 3 : 2;
    return {
      stageGoal: "stabilize_and_followup",
      followupLevel,
      taskItems: [
        { taskId: "t1", title: "记录关键症状变化", dueAt: "D+1" },
        { taskId: "t2", title: "3天随访回访", dueAt: "D+3" },
      ],
    };
  }
}

export class ServiceOrchestrationAgent {
  run({ riskLevel, blocked }) {
    if (riskLevel === "high") return { action: "doctor_handoff" };
    if (blocked) return { action: "watchful_waiting", blocked: true };
    return { action: riskLevel === "low_or_medium" ? "watchful_waiting" : "service_intake" };
  }
}

export class FollowupTriggerAgent {
  run() {
    return { followupStarted: true, schedule: "3d" };
  }
}

export class ValueConversionAgent {
  run({ valueConfirmed, blocked }) {
    return {
      offerEligible: valueConfirmed && !blocked,
      offerType: valueConfirmed && !blocked ? "light_followup_plan" : null,
      blockedReason: blocked ? "safety_or_conflict_block" : null,
    };
  }
}

export class MemoryManagerAgent {
  run(snapshot) {
    return {
      session_memory: snapshot.session,
      clinical_state_memory: snapshot.clinical,
      plan_memory: snapshot.plan,
      value_memory: snapshot.value,
      value: snapshot.value,
    };
  }
}

export class AuditAgent {
  constructor(logger) {
    this.logger = logger;
  }

  run(event) {
    return this.logger.log({ eventType: "decision", ...event });
  }
}

export class OrchestratorAgent {
  constructor(deps) {
    this.triage = deps.triage;
    this.safety = deps.safety;
    this.assistant = deps.assistant;
    this.carePlan = deps.carePlan;
    this.service = deps.service;
    this.followup = deps.followup;
    this.value = deps.value;
    this.memory = deps.memory;
    this.audit = deps.audit;
  }
}
