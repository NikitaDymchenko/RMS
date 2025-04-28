// src/queue/queue.js
import EventEmitter from 'events';

class Queue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
  }
  enqueue(item) {
    this.queue.push(item);
    this.emit('enqueue');
  }
  async process(handler) {
    while (true) {
      if (!this.queue.length) await new Promise(res => this.once('enqueue', res));
      const item = this.queue.shift();
      try { await handler(item); } catch (err) { console.error('Queue error:', err); }
    }
  }
}
export const queue = new Queue();