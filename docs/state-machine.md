# 业务状态机（MVP）

状态集合：
`entry -> triage -> intake -> safety_check -> advice_ready -> service_decision -> watchful_waiting -> followup_active -> result_ingested -> re_evaluation -> (value_eligible | value_blocked) | doctor_handoff`

关键强约束：
- 高危命中必须进入 `doctor_handoff`
- 冲突数据阻断商业化资格
- 结果回流后必须 `result_ingested -> re_evaluation`
