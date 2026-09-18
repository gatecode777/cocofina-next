// src/lib/inquiryEvents.js
import { EventEmitter } from 'events';

// Maintain a global singleton instance so Next.js route handlers share the same event bus
if (!global.__inquiryEmitter) {
  global.__inquiryEmitter = new EventEmitter();
  // Allow multiple admin panel tabs / connections without node max listeners warning
  global.__inquiryEmitter.setMaxListeners(100);
}

const inquiryEmitter = global.__inquiryEmitter;
export default inquiryEmitter;
