// Transports: solo runs the authoritative sim in-page (LocalTransport); co-op talks to the Node server.

import type { ClientMsg, Difficulty, ServerMsg } from '../shared/protocol';
import { Run } from '../server/run';
import * as C from '../shared/constants';

export interface Transport {
  readonly local: boolean;
  send(msg: ClientMsg): void;
  onMessage: (msg: ServerMsg) => void;
  onClose: (reason: string) => void;
  /** advance the local sim (solo only). dt = real seconds, scale = time scale (slow-mo). */
  update(dt: number, scale: number): void;
  close(): void;
  rtt: number;
}

export class LocalTransport implements Transport {
  readonly local = true;
  onMessage: (msg: ServerMsg) => void = () => {};
  onClose: (reason: string) => void = () => {};
  rtt = 0;
  run: Run;
  private acc = 0;
  private inbox: ServerMsg[] = [];
  private closed = false;

  constructor(opts: { difficulty: Difficulty; seed?: string }) {
    this.run = new Run(
      {
        send: (_id, m) => this.inbox.push(m),
        broadcast: (m) => this.inbox.push(m),
        ended: () => {},
      },
      { solo: true, difficulty: opts.difficulty, seed: opts.seed, snapshotEvery: 1 },
    );
  }

  send(msg: ClientMsg) {
    if (this.closed) return;
    this.run.handle('local', msg);
    if (msg.t === 'hello') this.run.addPlayer('local', msg);
    this.drain();
  }

  update(dt: number, scale: number) {
    if (this.closed) return;
    this.acc += Math.min(0.25, dt) * scale;
    let n = 0;
    while (this.acc >= C.TICK_DT && n < 8) {
      this.run.tick(C.TICK_DT);
      this.acc -= C.TICK_DT;
      n++;
    }
    this.drain();
  }

  private drain() {
    const msgs = this.inbox;
    this.inbox = [];
    for (const m of msgs) this.onMessage(m);
  }

  close() { this.closed = true; }
}

export class WsTransport implements Transport {
  readonly local = false;
  onMessage: (msg: ServerMsg) => void = () => {};
  onClose: (reason: string) => void = () => {};
  rtt = 80;
  private ws: WebSocket;
  private queue: string[] = [];
  private pingT = 0;
  private open = false;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.open = true;
      for (const q of this.queue) this.ws.send(q);
      this.queue = [];
    };
    this.ws.onmessage = (ev) => {
      try {
        const m = JSON.parse(ev.data as string) as ServerMsg;
        if (m.t === 'pong') this.rtt = this.rtt * 0.7 + (performance.now() - m.c) * 0.3;
        this.onMessage(m);
      } catch { /* ignore malformed */ }
    };
    this.ws.onclose = () => this.onClose(this.open ? 'Connection lost' : 'Could not reach the co-op server');
    this.ws.onerror = () => {};
  }

  send(msg: ClientMsg) {
    const s = JSON.stringify(msg);
    if (this.open && this.ws.readyState === WebSocket.OPEN) this.ws.send(s);
    else if (!this.open) this.queue.push(s);
  }

  update(dt: number) {
    this.pingT -= dt;
    if (this.pingT <= 0) { this.pingT = 2; this.send({ t: 'ping', c: performance.now() }); }
  }

  close() { try { this.ws.close(); } catch { /* */ } }
}

export function defaultServerUrl(): string {
  const q = new URLSearchParams(location.search).get('server');
  if (q) return q;
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.hostname || 'localhost'}:${C.DEFAULT_PORT}`;
}
