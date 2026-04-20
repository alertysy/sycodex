# Architecture (MVP)

- `packages/domain`: 实体与状态机
- `packages/rules`: 医学规则引擎（红旗/冲突/过度医疗）
- `packages/agents`: Agent mock 编排层
- `packages/services`: 主流程 orchestration
- `packages/contracts`: 外部接口契约
- `packages/mocks`: 外部接口 mock
- `packages/observability`: 审计日志
- `tests`: 关键流程测试
