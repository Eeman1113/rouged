// Co-op server: drop-in matchmaking, one authoritative Run per group, 30Hz tick, 20Hz snapshots.
// Usage: npm run server   (PORT env overrides the default)

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'node:http';
import { Run, RunHost } from './run';
import type { ClientMsg, ServerMsg } from '../shared/protocol';
import * as C from '../shared/constants';

const PORT = Number(process.env.PORT ?? C.DEFAULT_PORT);
const runs = new Map<string, Run>();
const sockets = new Map<string, WebSocket>();
const playerRun = new Map<string, Run>();
let nextPlayer = 1;

const http = createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: true, runs: runs.size, players: sockets.size })); return; }
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('ROUGED co-op server. It was never training.\n');
});
const wss = new WebSocketServer({ server: http });

function makeHost(): RunHost {
  return {
    send(id: string, msg: ServerMsg) {
      const ws = sockets.get(id);
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    },
    broadcast(msg: ServerMsg) {
      const s = JSON.stringify(msg);
      for (const run of runs.values()) {
        if (run.host !== this) continue;
        for (const id of run.players.keys()) {
          const ws = sockets.get(id);
          if (ws && ws.readyState === WebSocket.OPEN) ws.send(s);
        }
      }
    },
    ended(run: Run) {
      setTimeout(() => runs.delete(run.id), 1000);
    },
  };
}

/** Find a run in lobby with space, else create one. Solo players get their own run immediately. */
function matchmake(hello: Extract<ClientMsg, { t: 'hello' }>): Run {
  if (!hello.solo && !hello.seed) {
    for (const r of runs.values()) {
      if (r.state === 'lobby' && !r.solo && r.players.size < C.MAX_PLAYERS && r.difficulty === hello.difficulty) return r;
    }
    // drop-in: join a run in progress that has space
    for (const r of runs.values()) {
      if (r.state !== 'lobby' && r.state !== 'ended' && !r.solo && r.players.size < C.MAX_PLAYERS && r.difficulty === hello.difficulty && !r.ended) return r;
    }
  }
  if (hello.seed && !hello.solo) {
    for (const r of runs.values()) if (r.seedStr === hello.seed.toUpperCase() && r.state === 'lobby' && r.players.size < C.MAX_PLAYERS) return r;
  }
  const run = new Run(makeHost(), { solo: hello.solo, difficulty: hello.difficulty, seed: hello.seed, snapshotEvery: Math.round(C.TICK_RATE / C.SNAPSHOT_RATE) });
  runs.set(run.id, run);
  return run;
}

wss.on('connection', (ws) => {
  const id = 'p' + nextPlayer++;
  sockets.set(id, ws);
  ws.on('message', (data) => {
    let msg: ClientMsg;
    try { msg = JSON.parse(String(data)) as ClientMsg; } catch { return; }
    if (!msg || typeof msg !== 'object') return;
    if (msg.t === 'hello') {
      if (playerRun.has(id)) return;
      const run = matchmake(msg);
      playerRun.set(id, run);
      run.addPlayer(id, msg);
      console.log(`[${new Date().toISOString()}] ${id} (${msg.name}) → ${run.id} seed ${run.seedStr} (${run.players.size} players)`);
      return;
    }
    playerRun.get(id)?.handle(id, msg);
  });
  ws.on('close', () => {
    sockets.delete(id);
    const run = playerRun.get(id);
    playerRun.delete(id);
    run?.removePlayer(id);
    if (run && run.players.size === 0) runs.delete(run.id);
  });
});

// fixed 30Hz tick
let last = performance.now();
let acc = 0;
setInterval(() => {
  const now = performance.now();
  acc += Math.min(0.25, (now - last) / 1000);
  last = now;
  while (acc >= C.TICK_DT) {
    for (const run of runs.values()) {
      try { run.tick(C.TICK_DT); } catch (err) { console.error('run tick error', run.id, err); }
    }
    acc -= C.TICK_DT;
  }
}, 1000 / 60);

http.listen(PORT, () => console.log(`ROUGED co-op server listening on :${PORT}`));
