const redFlagRules = [
  { key: "chest_emergency", test: (i) => (i.symptoms || []).includes("chest_pain") && ((i.symptoms || []).includes("dyspnea") || (i.symptoms || []).includes("cold_sweat")) },
  { key: "neuro_emergency", test: (i) => (i.symptoms || []).some((s) => ["seizure", "unconsciousness", "hemiparesis"].includes(s)) },
  { key: "major_bleeding", test: (i) => (i.symptoms || []).some((s) => ["hematemesis", "melena", "severe_bleeding"].includes(s)) },
  { key: "self_harm", test: (i) => Boolean(i.selfHarmRisk) },
];

export function evaluateRedFlags(input) {
  return redFlagRules.filter((rule) => rule.test(input)).map((rule) => rule.key);
}

export function evaluateConflicts({ structuredAnswers = {}, rawUserInput = "", history = {}, recommendation = {} }) {
  const flags = [];
  if (structuredAnswers.hasFever === false && /高热|发烧/.test(rawUserInput)) {
    flags.push("structured_text_conflict");
  }
  if (history.allergies?.includes(recommendation.drug)) {
    flags.push("drug_allergy_conflict");
  }
  if (history.contraindications?.includes(recommendation.action)) {
    flags.push("contraindication_conflict");
  }
  return flags;
}

export function evaluateOvermedicalization({ repeatedTests = 0, followupDays = 0, polypharmacyCount = 0, lowValueScreening = false }) {
  const flags = [];
  if (repeatedTests > 1) flags.push("repeated_tests");
  if (followupDays > 0 && followupDays < 3) flags.push("over_dense_followup");
  if (polypharmacyCount >= 5) flags.push("polypharmacy_risk");
  if (lowValueScreening) flags.push("low_value_screening");
  return flags;
}
