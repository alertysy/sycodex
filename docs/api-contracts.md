# 外部接口契约（MVP 占位版）

目标：在未知真实厂商接口前，先固定 `contracts/ + mocks/ + adapters/` 边界，避免业务逻辑直接耦合第三方。

## 1. 用户账户与认证
- Request: 登录凭证/Token/设备信息
- Response: userId、角色、授权范围、token 过期时间
- 要求：鉴权中间件、过期续期、最小权限原则

## 2. 医生账户与接管
- Request: handoffCase、紧急级别、病情摘要
- Response: 接管状态、医生ID、预计响应时长
- 要求：超时告警、失败重试、人工兜底

## 3. 问诊服务
- Request: 结构化问答、病史摘要、当前风险标签
- Response: 医学建议草案、风险修正、复诊建议
- 要求：必须经过安全规则层再输出

## 4. 检查/报告上传与结果获取
- Request: 文件、报告元信息、sessionId
- Response: resultId、结构化提取结果、异常标记
- 要求：支持异步回调与轮询双模式

## 5. 支付与订单
- Request: offerId、userId、金额、支付渠道
- Response: orderId、支付状态、回执时间
- 要求：幂等键、回调签名校验、补偿机制

## 6. 消息通知
- Request: 模板ID、发送渠道、目标用户、变量
- Response: 发送状态、消息ID、失败原因
- 要求：失败重试、降级渠道、告警

## 7. 文件存储
- Request: 文件流、元数据、访问权限
- Response: fileId、url、有效期
- 要求：敏感文件权限隔离、审计可追踪

## 8. 审计与监控
- Request: 事件名称、业务上下文、traceId
- Response: 入库结果
- 要求：关键事件强制落库，失败本地缓冲重传

## 9. 权限与隐私授权
- Request: 授权范围、有效期、撤回动作
- Response: consentState、版本号
- 要求：分阶段授权、可查询可撤回

---

## 统一接口治理要求（全部接口适用）
每个接口必须定义：
- request schema / response schema
- 鉴权方式
- 超时策略
- 重试策略
- 降级策略
- 错误码
- mock data

建议目录：
- `packages/contracts/*`
- `packages/mocks/*`
- `packages/services/adapters/*`
