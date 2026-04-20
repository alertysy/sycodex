# AI 医疗产品操作系统（生产级 MVP）项目指令

## 角色与目标
你不是在做演示页。你要交付一个可运行、可测试、可部署、可监控、可审计、可扩展的 AI 医疗 MVP。

系统定位：
- 系统名称：AI 医疗产品操作系统
- 产品定位：健康寿命代理人
- 统一主链路：进入 → 识别 → 判断 → 建议 → 执行 → 回流 → 再管理
- 最高原则：安全、有效、最小代价、有尊严

## 首期实现范围（必须）
1. 主链路闭环：
   症状进入 → 首轮识别 → 结构化追问 → 风险判断 → 建议结果 → 服务承接/观察等待 → 3天随访 → 结果回流 → 再管理
2. 主动管理链：优先实现随访 level 2/3/4，level 0/1 预留枚举与接口。
3. 结果回流链：至少打通问诊结果回流或检查结果回流之一；回流后自动更新临床状态、随访级别、任务、服务判断、商业表达状态。
4. 首单闭环：价值确认 → 信任建立 → 个体化轻量随访方案首单触发。

## AI / 医学边界
- AI可直接完成：结构化采集、选项化追问、基础风险提示、任务生成、随访提醒、结果展示。
- AI不可独立拍板：诊断排序、治疗建议、检查建议、复诊建议、复杂慢病策略。
- 必须升级医生/人工：高危症状、复杂病史、冲突数据、紧急情况、明确医疗责任结论、明显不确定高风险场景。
- 风险未澄清或高危状态下，禁止商业表达。

## 强制安全规则
- 实现 `medical_red_flags`（可配置）。
- 实现冲突规则：主诉vs病史、结构化vs文本、检查vs推荐、用药冲突、禁忌冲突。
- 实现 `overmedicalization_risk`（第四级预防，允许首版占位但逻辑必须存在）。

## 强制状态机
至少包含状态：
`entry, triage, intake, safety_check, advice_ready, service_decision, watchful_waiting, followup_active, result_ingested, re_evaluation, doctor_handoff, value_eligible, value_blocked`

强约束：
- 高危必须转 `doctor_handoff`
- 冲突时不能直接服务承接
- 结果回流后必须进入 `re_evaluation`
- `value_eligible` 必须晚于价值确认
- `value_blocked` 禁止付费推荐

## 核心实体（必须类型化）
`UserProfile, SessionContext, ClinicalState, RiskAssessment, FollowupLevel, TaskPlan, TaskItem, ServiceAction, FulfillmentResult, ValueState, PaymentOffer, AuditEvent, HandoffCase`

每个实体必须定义：
- 字段及中文注释
- 必填/可选
- 来源
- 是否敏感
- 是否可编辑
- 是否可回流更新

## Agent 编排层（必须）
必须包含：
`OrchestratorAgent, TriageAgent, SafetyAgent, MedicalAssistantAgent, CarePlanAgent, ServiceOrchestrationAgent, FollowupTriggerAgent, ValueConversionAgent, MemoryManagerAgent, AuditAgent`

约束：
- 统一由 `OrchestratorAgent` 调度
- `SafetyAgent` 优先级最高
- `ValueConversionAgent` 仅在安全且价值确认后触发
- `AuditAgent` 对关键决策留痕

## 工程结构建议
优先采用：
- `apps/web`
- `packages/domain`
- `packages/agents`
- `packages/rules`
- `packages/services`
- `packages/contracts`
- `packages/mocks`
- `packages/observability`
- `docs`

## 交付顺序
1. 扫描仓库并输出理解与实施计划
2. 固化状态机与领域模型
3. 搭建 contracts/mocks/adapters/agents/rules 分层
4. 跑通主链路
5. 跑通回流与再管理
6. 接入首单闭环
7. 补齐测试、审计、监控、文档

## 编码前必须先输出 7 项
1) 仓库理解
2) 技术实现路径
3) 新增/修改文件清单
4) 业务状态机定义
5) 核心领域模型定义
6) 风险点与未决项
7) 分阶段提交计划

## 完成标准
- 业务闭环完成
- 安全边界成立
- 工程质量达标
- 可继续扩展（模型、外部服务、专家审核/CMD、多入口）
