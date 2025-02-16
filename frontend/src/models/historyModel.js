
/**
 * @class History
 * @classdesc Represents the history of events related to user profiles and certificates.
 * @param {Object} params - The parameters for the History.
 * @param {string} params.event - Name of the event (e.g., `UserRegistered`, `CertificateActivated`, `StateUpdated`).
 * @param {number} params.timestamp - Timestamp of the event.
 * @param {string} params.details - Additional details about the event.
 */
export class History {
  constructor({ event, timestamp, details }) {
    this.event = event;
    this.timestamp = timestamp;
    this.details = details;
  }
}
