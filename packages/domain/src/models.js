/**
 * Core domain model factories and constants.
 */

export const FollowupLevel = Object.freeze({
  PRIMORDIAL_PREVENTION: 0,
  PRIMARY_PREVENTION: 1,
  SECONDARY_PREVENTION: 2,
  TERTIARY_PREVENTION: 3,
  QUATERNARY_PROTECTION: 4,
});

export function createUserProfile(input = {}) {
  return {
    userId: input.userId ?? "",
    age: input.age ?? null,
    sex: input.sex ?? "unknown",
    contact: input.contact ?? {},
    familyRole: input.familyRole ?? "self",
    channelSource: input.channelSource ?? "unknown",
    chronicConditions: input.chronicConditions ?? [],
    surgeries: input.surgeries ?? [],
    allergies: input.allergies ?? [],
    longTermMeds: input.longTermMeds ?? [],
    resourceAccessibility: input.resourceAccessibility ?? "normal",
    followupPreference: input.followupPreference ?? "app",
    privacyConsentState: input.privacyConsentState ?? "pending",
  };
}

export function createSessionContext(input = {}) {
  return {
    sessionId: input.sessionId ?? crypto.randomUUID(),
    entryType: input.entryType ?? "symptom",
    currentIntent: input.currentIntent ?? "assessment",
    rawUserInput: input.rawUserInput ?? "",
    structuredAnswers: input.structuredAnswers ?? {},
    conversationSummary: input.conversationSummary ?? "",
    latestUploadedResultIds: input.latestUploadedResultIds ?? [],
  };
}

export function createClinicalState(input = {}) {
  return {
    currentRiskLevel: input.currentRiskLevel ?? "unknown",
    certaintyLevel: input.certaintyLevel ?? "low",
    followupLevel: input.followupLevel ?? FollowupLevel.SECONDARY_PREVENTION,
    followupLevelName: input.followupLevelName ?? "secondary_prevention",
    diseaseStage: input.diseaseStage ?? "undetermined",
    redFlagHits: input.redFlagHits ?? [],
    conflictFlags: input.conflictFlags ?? [],
    overmedicalizationFlags: input.overmedicalizationFlags ?? [],
    primaryGoal: input.primaryGoal ?? "clarify_risk",
    secondaryGoals: input.secondaryGoals ?? [],
  };
}

export function createValueState(input = {}) {
  return {
    valueConfirmed: input.valueConfirmed ?? false,
    trustStage: input.trustStage ?? "unknown",
    offerEligible: input.offerEligible ?? false,
    offerBlockedReason: input.offerBlockedReason ?? null,
    purchaseHistory: input.purchaseHistory ?? [],
    renewalWindow: input.renewalWindow ?? null,
  };
}
