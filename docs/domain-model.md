# 核心领域模型（MVP）

> 约定：所有实体字段需标注 `required`、`source`、`sensitive`、`editable`、`updatable_by_result_ingestion`。

## 1. UserProfile
核心字段：
- userId, age, sex, contact, familyRole, channelSource
- chronicConditions, surgeries, allergies, longTermMeds
- resourceAccessibility, followupPreference, privacyConsentState

## 2. SessionContext
- sessionId, entryType, currentIntent
- rawUserInput, structuredAnswers, conversationSummary
- latestUploadedResultIds

## 3. ClinicalState
- currentRiskLevel, certaintyLevel
- followupLevel, followupLevelName
- diseaseStage
- redFlagHits, conflictFlags, overmedicalizationFlags
- primaryGoal, secondaryGoals

## 4. RiskAssessment
- riskLevel, riskReasons, confidence
- recommendedNextAction
- requiresDoctorHandoff

## 5. FollowupLevel
- `0 = primordial_prevention`
- `1 = primary_prevention`
- `2 = secondary_prevention`
- `3 = tertiary_prevention`
- `4 = quaternary_protection`

统一字段：
- `followup_level`
- `followup_level_name`
- `secondary_protection_flags`

## 6. TaskPlan / TaskItem
TaskPlan：
- planId, stageGoal, taskItems
- reminderPolicy, burdenLimit
- escalationConditions, reviewAt

TaskItem：
- taskId, title, description, dueAt, status, completionEvidence

## 7. ServiceAction
- actionId, actionType, rationale
- prerequisites, blockedReasons
- selectedProvider

## 8. FulfillmentResult
- resultId, resultType, source, summary
- structuredData, abnormalFlags
- requiresReEvaluation, attachedFiles

## 9. ValueState / PaymentOffer
ValueState：
- valueConfirmed, trustStage
- offerEligible, offerBlockedReason
- purchaseHistory, renewalWindow

PaymentOffer：
- offerId, offerType, eligibilityRuleId, price, currency, expiresAt

## 10. AuditEvent
- eventId, eventType, timestamp
- actorType, actorId
- stateFrom, stateTo
- decisionPayload, traceId

## 11. HandoffCase
- handoffId, handoffReason
- urgencyLevel, targetRole
- summaryForClinician, attachments
- acceptedAt, resolvedAt
