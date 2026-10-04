# ROUGED

> "You were scanned. You were copied. You were told this was training. It was never training."

**Play: https://eeman1113.github.io/rouged/**

A DOOM-style first-person roguelike shooter. Three.js + TypeScript client, Node + `ws` co-op server, shared deterministic sim.

## Run

```bash
npm install
npm run dev        # http://localhost:5173  (solo works with no server)
npm run server     # co-op server on :8787 (PORT env to override)
npm run build      # typecheck + production build to dist/
npm run simtest    # headless bot plays a full run against the sim
```

Co-op: **CO-OP DEPLOY** in the menu, enter your server address (`ws://host:8787`, or `wss://` from HTTPS pages like GitHub Pages). Up to 4 players, 15s lobby, drop-in mid-run.

## Controls

WASD move · mouse aim · LMB fire (hold to charge LANCE / run RIPPER) · SPACE jump (hold = auto bunny-hop) · SHIFT dash · CTRL/C slide · F or RMB glory kill · E use/pick · 1–4 / wheel / Q weapons · ESC pause. Touch controls appear automatically on mobile.

## The descent

Seven biomes — **FOUNDRY, ARCHIVE, THE CORE, THE NURSERY, THE CANOPY** (jungle), **THE FRONT, THE MIRROR** — five rooms each, a Warden at the end of every one. From room 15 on, every Warden offers a choice: **EXTRACT** (end the run and bank it) or **GO DEEPER**. The Handler waits at room 35. Past it is the Endless: the biomes cycle forever and everything keeps getting harder.

- 13 enemy types: drone, grunt, brute, stalker, spider, replica, leech, sentinel, bomber, mortar, bulwark, wraith, plus 7 Wardens
- Rooms: combat, arena, gauntlet, anomaly, **Broker's shop** (spend scrap), **Sanctuary** (heal + Mara's logs), **Trial** (beat the clock for a legendary)
- Mutators on doors: Lights Out, Overclock, Low Gravity, Blood Moon, Dead Air, Swarm, each with a score bonus
- 37 powerups, 9 hidden synergies, 92 story fragments, two endings
- Every character speaks in a synthetic voice: the Handler, the announcer, the Broker, Mara, the Wardens, the whispering enemies, the terminals

## DualSense

Plug in or pair a DualSense and press any button. Every button, analog triggers and rumble work out of the box (Gamepad API), with aim assist and full menu navigation.
In Chrome/Edge, **Controls → Enable Pro Features** (WebHID, USB or Bluetooth) adds per-weapon adaptive triggers, a lightbar that tracks your health, player LEDs showing your multiplier, and gyro aiming (hold L2 by default).

R2 fire · L2 focus aim / glory · R3 glory · ✕ jump · ◯ slide · □ use · △ last weapon · R1 next weapon · L1/L3 dash · D-pad weapons · Options/touchpad pause

## Layout

- `shared/` — constants (GDD §18), protocol, seeded RNG, room generator, physics, weapon/enemy/powerup defs
- `server/` — the authoritative `Run` sim (enemies, Warden, combat, powerups, progression). Runs in Node for co-op *and* in the browser for solo (`LocalTransport`); `server/index.ts` is the ws entry
- `client/` — renderer (480p nearest-neighbour + bloom), procedural pixel art (`render/art`), gore, effects, HUD, procedural WebAudio sfx + layered music, Handler voice (Web Speech API), story content, hub, meta progression (localStorage)
- `client/spritetest.html` — dev page showing every generated sprite
