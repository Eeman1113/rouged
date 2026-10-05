// /test entry: flag the autopilot BEFORE the app boots (so the meta loads from the AI's own save
// slot), boot the normal game, then hand the controls to the autopilot and mount the spectator HUD.

(globalThis as { __ROUGED_AUTOPILOT__?: boolean }).__ROUGED_AUTOPILOT__ = true;

const { saveMeta, AI_META_KEY, loadMeta } = await import('../meta');
const { levelFromXp } = await import('../../server/progression');
await import('../main');
const { Autopilot, clearRunLog } = await import('../autopilot');
const { mountOverlay } = await import('./overlay');
const { audio } = await import('../audio/engine');

type AppAny = import('../autopilot').AppLike & { splashDone: boolean };
const app = (window as unknown as { rouged: AppAny }).rouged;

// the AI's identity lives in its own save
if (!app.meta.name || app.meta.name === 'CANDIDATE') { app.meta.name = 'AUTOPILOT'; saveMeta(app.meta); }
app.world.applySettings(app.meta);

const ap = new Autopilot(app);
const q = new URLSearchParams(location.search);
let saved = 0;
try { saved = Number(sessionStorage.getItem('rouged.autopilot.speed')); sessionStorage.removeItem('rouged.autopilot.speed'); } catch { /* */ }
const sp = Number(q.get('speed')) || saved;
if (sp === 2 || sp === 4) ap.speed = sp;
app.autopilot = ap;
// skip the splash + menu: straight to the hub
app.splashDone = true;
app.enterHub();

mountOverlay(ap, app, {
  level: () => levelFromXp(app.meta.xp + (app.mode === 'run' && app.game ? app.game.runXp : 0)).level,
  reset: () => {
    try { localStorage.removeItem(AI_META_KEY); } catch { /* */ }
    clearRunLog();
    app.meta = loadMeta();
    app.meta.name = 'AUTOPILOT';
    saveMeta(app.meta);
    location.reload();
  },
  unlockAudio: () => audio.unlock(),
});

export {};
