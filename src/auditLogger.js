/**
 * Audit Logger Utility
 * Manages all timestamped behavioral events
 * All timestamps are relative to landing_load (set to 0)
 */

export function createAuditLogger() {
  const auditTrail = [];
  let landingLoadTime = null;

  return {
    /**
     * Initialize the audit trail with landing_load event
     */
    init() {
      landingLoadTime = Date.now();
      auditTrail.length = 0;
      this.logEvent('landing_load');
    },

    /**
     * Log an event with optional value
     * Timestamp is milliseconds since landing_load
     */
    logEvent(type, value) {
      if (landingLoadTime === null) {
        console.error('Audit logger not initialized. Call init() first.');
        return;
      }

      const timestamp = type === 'landing_load' ? 0 : Date.now() - landingLoadTime;

      const event = {
        type,
        timestamp,
      };

      if (value !== undefined && value !== null) {
        event.value = value;
      }

      auditTrail.push(event);
    },

    /**
     * Get a copy of the entire audit trail
     */
    getTrail() {
      return [...auditTrail];
    },

    /**
     * Get the current relative timestamp
     */
    getCurrentTimestamp() {
      if (landingLoadTime === null) return 0;
      return Date.now() - landingLoadTime;
    },
  };
}
