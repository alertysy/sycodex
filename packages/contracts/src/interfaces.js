export const ExternalContracts = {
  auth: { request: ["credential"], response: ["userId", "roles", "tokenExpiry"] },
  doctorHandoff: { request: ["handoffCase", "urgencyLevel"], response: ["status", "doctorId"] },
  consultation: { request: ["structuredAnswers", "riskTags"], response: ["suggestionDraft", "riskRevision"] },
  resultIngestion: { request: ["sessionId", "files"], response: ["resultId", "abnormalFlags"] },
  payment: { request: ["offerId", "amount"], response: ["orderId", "status"] },
};
