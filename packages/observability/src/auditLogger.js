export class AuditLogger {
  constructor() {
    this.events = [];
  }

  log(event) {
    const normalized = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      traceId: event.traceId ?? crypto.randomUUID(),
      ...event,
    };
    this.events.push(normalized);
    return normalized;
  }
}
