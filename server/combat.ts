// Damage model, kills, glory kills, streaks, on-kill effects. Server-authoritative.

import type { ShotMsg, WeaponId } from '../shared/protocol';
import { WEAPONS } from '../shared/weaponDefs';
import { hasLOS } from '../shared/mapData';
import * as C from '../shared/constants';
import type { Run } from './run';
import type { SimPlayer } from './player';
import type { Enemy } from './enemies/base';

const MUT_SCORE: Record<string, number> = { darkness: 1.5, overclock: 1.4, lowgrav: 1.25, bloodmoon: 1.6, silence: 1.35, swarm: 1.45 };

export function handleShot(run: Run, p: SimPlayer, m: ShotMsg) {
  if (!p.alive || !p.unlocked.includes(m.weapon)) return;
  const def = WEAPONS[m.weapon];
  if (def.kind === 'melee') return;
  const rate = p.mods.fireRateMult * (p.overclockT > 0 ? 2 : 1);
  const minInterval = (def.interval / rate) * 0.55;
  if (run.time - p.lastShot[m.weapon] < minInterval) return;
  p.lastShot[m.weapon] = run.time;
  const charge = def.kind === 'charge' ? Math.max(0, Math.min(1, m.charge ?? 0)) : 1;
  const cost = def.ammoCost * (def.kind === 'charge' ? 0.4 + 0.6 * charge : 1);
  if (p.ammo[m.weapon] < cost * 0.5) return;
  p.ammo[m.weapon] = Math.max(0, p.ammo[m.weapon] - cost);
  p.shots++;
  if (m.hits.length) p.shotHits++;

  // origin sanity: must be near the player's eye
  if (Math.hypot(m.ox - p.x, m.oz - p.z) > 3 || Math.abs(m.oy - (p.y + 1.6)) > 2.5) return;
  const dl = Math.hypot(m.dx, m.dy, m.dz) || 1;
  const dx = m.dx / dl, dy = m.dy / dl, dz = m.dz / dl;

  const pellets = def.pellets + (def.kind === 'shotgun' ? p.mods.extraPellets : 0);
  let maxHits = def.kind === 'charge' ? 99 : def.kind === 'shotgun' ? pellets * (1 + p.mods.pierce) : (1 + p.mods.pierce) * (m.weapon === 'pulse' && p.mods.hydra ? 3 : 1);
  let pelletBudget = def.kind === 'shotgun' ? pellets * (1 + p.mods.pierce) : 999;
  let first: Enemy | null = null;
  for (const h of m.hits) {
    if (maxHits-- <= 0) break;
    const e = run.enemies.get(h.id);
    if (!e || !e.alive || e.spawnT > 0) continue;
    const ex = e.x - m.ox, ey = e.cy - m.oy, ez = e.z - m.oz;
    const dist = Math.hypot(ex, ey, ez);
    if (dist > def.range + e.def.radius + 3) continue;
    // angle tolerance: generous (client sees interpolated positions)
    const cos = (ex * dx + ey * dy + ez * dz) / (dist || 1);
    const tol = Math.atan((e.def.radius * 2 + e.def.height * 0.6 + 2.2) / Math.max(1, dist)) + 0.12 + def.spread * 2;
    if (Math.acos(Math.max(-1, Math.min(1, cos))) > tol) continue;
    if (!hasLOS(run.solids, m.ox, m.oy, m.oz, e.x, e.cy, e.z) && !hasLOS(run.solids, m.ox, m.oy, m.oz, e.x, e.y + e.def.headY, e.z)) continue;
    let n = 1;
    if (def.kind === 'shotgun') { n = Math.max(1, Math.min(h.n, pelletBudget)); pelletBudget -= n; }
    let dmg = def.kind === 'charge' ? def.damage + ((def.maxDamage ?? def.damage) - def.damage) * charge : def.damage * n;
    if (m.weapon === 'pulse') dmg *= 1 + p.mods.pulseAmp;
    if (m.weapon === 'lance') dmg *= p.mods.lanceDmg;
    dmg *= p.mods.damageMult;
    const head = h.head && e.def.headR > 0;
    if (head) dmg *= p.mods.headshotMult;
    if (e.marked) dmg *= 1.15;
    // knockback (server-side shove)
    if (def.knockback && e.type !== 'warden') {
      const k = (def.knockback * n) / (e.type === 'brute' ? 6 : 1) / Math.max(1, dist * 0.3);
      e.vx += dx * k; e.vz += dz * k;
    }
    if (p.mods.tesla || (m.weapon === 'pulse' && p.mods.pulseAmp > 0 && p.synergies.includes('tesla'))) { e.marked = true; e.markT = 6; }
    damageEnemy(run, e, dmg, p.id, head, dx, dy, dz, m.weapon);
    if (!first) first = e;
  }
  // ricochet: bounce to the nearest other enemy
  if (first && p.mods.ricochet > 0) {
    let best: Enemy | null = null, bd = 12;
    for (const e of run.enemies.values()) {
      if (e === first || !e.alive || e.spawnT > 0) continue;
      const d = Math.hypot(e.x - first.x, e.z - first.z);
      if (d < bd && hasLOS(run.solids, first.x, first.cy, first.z, e.x, e.cy, e.z)) { bd = d; best = e; }
    }
    if (best) {
      const base = def.kind === 'charge' ? def.damage : def.damage * (def.kind === 'shotgun' ? 3 : 1);
      run.emit({ e: 'arc', x1: first.x, y1: first.cy, z1: first.z, x2: best.x, y2: best.cy, z2: best.z });
      damageEnemy(run, best, base * p.mods.damageMult * p.mods.ricochetDmg, p.id, false, best.x - first.x, 0, best.z - first.z, m.weapon);
    }
  }
}

let ripperAcc = new WeakMap<SimPlayer, number>();
export function ripperTick(run: Run, p: SimPlayer, dt: number) {
  const acc = (ripperAcc.get(p) ?? 0) + dt;
  if (acc < 0.1) { ripperAcc.set(p, acc); return; }
  ripperAcc.set(p, 0);
  const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
  for (const e of run.enemies.values()) {
    if (!e.alive || e.spawnT > 0) continue;
    const dx = e.x - p.x, dz = e.z - p.z;
    const d = Math.hypot(dx, dz);
    if (d > C.RIPPER_RANGE * Math.sqrt(p.mods.ripperMult) + e.def.radius) continue;
    if (e.y > p.y + 3 || e.y + e.def.height < p.y) continue;
    if (d > 0.5 && (dx * fx + dz * fz) / d < 0.55) continue;
    if (e.staggered) {
      // the Ripper turns any stagger into an execution
      gloryKill(run, p, e);
      continue;
    }
    damageEnemy(run, e, C.RIPPER_DPS * acc * p.mods.damageMult * p.mods.ripperMult * (e.type === 'warden' ? 1.5 : 1), p.id, false, fx, 0.2, fz, 'ripper');
  }
}

export function damageEnemy(run: Run, e: Enemy, dmg: number, by: string, head: boolean, dx: number, dy: number, dz: number, weapon: WeaponId, silent = false) {
  if (!e.alive || e.spawnT > 0 || dmg <= 0) return;
  if (!silent) dmg = e.modifyDamage(run, dmg, dx, dz, head);
  e.hp -= dmg;
  e.lastHitBy = by;
  const p = run.players.get(by) ?? null;
  if (p && p.alive && p.mods.lifesteal > 0 && !p.mods.martyr && !p.mods.glassCannon) p.heal(dmg * p.mods.lifesteal);
  if (!silent) {
    const l = Math.hypot(dx, dy, dz) || 1;
    run.emit({ e: 'hit', enemy: e.id, by, dmg: Math.round(dmg), head, x: e.x, y: head ? e.y + e.def.headY : e.cy, z: e.z, dx: dx / l, dy: dy / l, dz: dz / l, weapon });
  }
  if (e.hp <= 0) { killEnemy(run, e, by, head, false, dx, dy, dz, weapon); return; }
  if (e.def.staggerable && !e.staggered && e.hp <= e.maxHp * C.GLORY_THRESHOLD) {
    e.staggered = true;
    e.staggerT = C.STAGGER_TIME;
    e.vx = 0; e.vz = 0;
    run.emit({ e: 'stagger', enemy: e.id });
  }
  e.onDamaged(run, p);
}

export function handleGlory(run: Run, p: SimPlayer, enemyId: number) {
  if (!p.alive) return;
  const e = run.enemies.get(enemyId);
  if (!e || !e.alive || !e.staggered) return;
  const d = Math.hypot(e.x - p.x, e.z - p.z);
  if (d > C.GLORY_RANGE + e.def.radius + 1.2) return;
  gloryKill(run, p, e);
}

function gloryKill(run: Run, p: SimPlayer, e: Enemy) {
  run.emit({ e: 'glory', enemy: e.id, by: p.id, type: e.type, x: e.x, y: e.cy, z: e.z });
  const dx = e.x - p.x, dz = e.z - p.z;
  killEnemy(run, e, p.id, false, true, dx, 0.6, dz, p.weapon);
}

export function killEnemy(run: Run, e: Enemy, by: string, head: boolean, glory: boolean, dx: number, dy: number, dz: number, weapon: WeaponId) {
  if (!e.alive) return;
  e.alive = false;
  e.hp = 0;
  const p = run.players.get(by) ?? null;
  if (p && weapon === 'ripper' && p.mods.butcher && !glory) { glory = true; run.emit({ e: 'glory', enemy: e.id, by: p.id, type: e.type, x: e.x, y: e.cy, z: e.z }); }
  run.combo = Math.min(C.COMBO_MAX, run.combo + 1);
  run.comboTimer = C.COMBO_DECAY_TIME;
  let score = 0;
  if (p) {
    // executioner: every 5th kill is a glory kill from any range
    if (p.mods.executioner) { p.executionerCount++; if (p.executionerCount % 5 === 0 && !glory) { glory = true; run.emit({ e: 'glory', enemy: e.id, by: p.id, type: e.type, x: e.x, y: e.cy, z: e.z }); } }
    p.kills++;
    if (head) p.headshots++;
    if (glory) p.glories++;
    p.weaponKills[weapon]++;
    p.peakCombo = Math.max(p.peakCombo, run.combo);
    score = Math.round(e.def.score * (run.mutator ? MUT_SCORE[run.mutator] : 1) * run.combo * (head ? 1.5 : 1) * (glory ? 2 : 1) * (e.elite ? 1.5 : 1));
    p.score += score;
    p.xp += C.XP_PER_KILL * Math.min(run.combo, 6) * (e.elite ? 1.5 : 1) + (e.type === 'warden' ? 0 : 0);
    for (const w of ['pulse', 'breacher', 'lance'] as WeaponId[]) p.ammo[w] = Math.min(1, p.ammo[w] + C.AMMO_ON_KILL * (weapon === 'ripper' ? 4 : 1));
    p.privDirty = true;
    if (p.mods.vampire > 0 && !p.mods.martyr) p.heal(p.mods.vampire);
    if (p.mods.bloodbath) { p.heal(4); run.explodeAt(e.x, e.cy, e.z, 3.2, 25 * p.mods.damageMult, p.id, 'kill'); }
    if (glory && p.mods.reaper) { p.hp = p.mods.maxHp; p.reaperRefill = true; }
    if (glory) {
      if (!p.mods.martyr) p.heal(C.GLORY_HEAL * p.mods.gloryHealMult);
      p.addArmor(C.GLORY_ARMOR * (e.type === 'brute' ? 10 : 3));
    }
    if (p.mods.glassCannon) p.heal(8);
    if (p.mods.overclock) p.overclockT = 3;
    if (p.mods.ghost) p.ghostT = 1;
    updateStreak(run, p);
    onKillEffects(run, p, e);
  }
  e.onDeath(run, by);
  // scrap: the currency of deleted minds
  const scrapN = Math.max(1, Math.round(e.def.score / 40 * (e.elite ? 1.6 : 1)));
  if (e.type !== 'warden') run.spawnDrop('scrap', e.x + (run.rng.next() - 0.5), e.z + (run.rng.next() - 0.5), scrapN);
  else for (let i = 0; i < 8; i++) run.spawnDrop('scrap', e.x + run.rng.range(-3, 3), e.z + run.rng.range(-3, 3), 12);
  // drops
  if (e.def.armorDrop && !(p && p.mods.noArmor)) run.spawnDrop('armor', e.x, e.z, e.def.armorDrop);
  if (p && p.mods.scavenger) {
    run.spawnDrop('ammo', e.x + 0.6, e.z, 0.25);
    if (!p.mods.noHealthDrops) run.spawnDrop('hp', e.x - 0.6, e.z, 10);
  } else {
    if (!glory && run.rng.chance(e.type === 'brute' ? 0.8 : 0.16) && !(p && p.mods.noHealthDrops)) run.spawnDrop('hp', e.x, e.z, e.type === 'brute' ? 25 : 10);
    if (run.rng.chance(0.1)) run.spawnDrop('ammo', e.x + 0.5, e.z + 0.3, 0.3);
  }
  const l = Math.hypot(dx, dy, dz) || 1;
  run.emit({
    e: 'kill', enemy: e.id, type: e.type, by, head, glory, x: e.x, y: e.cy, z: e.z,
    dx: dx / l, dy: dy / l, dz: dz / l, score, combo: run.combo, elite: e.elite, weapon,
  });
  if (e.type === 'warden') {
    run.emit({ e: 'explosion', x: e.x, y: 3, z: e.z, r: 10, kind: 'boss' });
    for (const other of run.enemies.values()) if (other !== e && other.alive) killEnemy(run, other, by, false, false, other.x - e.x, 1, other.z - e.z, weapon);
    run.projectiles = [];
  }
}

function updateStreak(run: Run, p: SimPlayer) {
  const t = run.time;
  if (t - p.lastKillT > 3) p.streakLevel = 0;
  p.lastKillT = t;
  p.killTimes.push(t);
  p.killTimes = p.killTimes.filter((k) => t - k <= C.MEGA_KILL_WINDOW);
  const within = (w: number) => p.killTimes.filter((k) => t - k <= w).length;
  let level: 0 | 1 | 2 | 3 | 4 = 0;
  if (within(C.MEGA_KILL_WINDOW) >= C.RAMPAGE_THRESHOLD) level = 4;
  else if (within(C.MEGA_KILL_WINDOW) >= 4) level = 3;
  else if (within(C.TRIPLE_KILL_WINDOW) >= 3) level = 2;
  else if (within(C.DOUBLE_KILL_WINDOW) >= 2) level = 1;
  const kills = p.killTimes.length;
  p.bestStreak = Math.max(p.bestStreak, kills);
  if (level > p.streakLevel || (level === 4 && kills > C.RAMPAGE_THRESHOLD)) {
    p.streakLevel = Math.max(p.streakLevel, level);
    if (level > 0) {
      run.emit({ e: 'streak', id: p.id, level: level as 1 | 2 | 3 | 4, kills });
      if (p.mods.streakShield > 0) p.addArmor(p.mods.streakShield);
    }
  }
}

function onKillEffects(run: Run, p: SimPlayer, e: Enemy) {
  const m = p.mods;
  if (m.detonate > 0) run.explodeAt(e.x, e.cy, e.z, 4, m.detonate * m.damageMult, p.id, 'kill');
  for (const o of run.enemies.values()) {
    if (o === e || !o.alive) continue;
    const d = Math.hypot(o.x - e.x, o.z - e.z);
    if (m.cryo > 0 && d < 5 && o.type !== 'warden') o.frozenT = Math.max(o.frozenT, m.cryo);
    if (m.immolate > 0 && d < 5) { o.burnT = 3; o.burnDps = m.immolate; o.burnBy = p.id; }
    if (m.chainRadius > 0 && d < m.chainRadius) { o.marked = true; o.markT = 8; }
  }
}

/** Tesla protocol: lightning arcs between marked enemies. */
export function updateTesla(run: Run, dt: number) {
  run.teslaT -= dt;
  if (run.teslaT > 0) return;
  run.teslaT = 0.6;
  let owner: SimPlayer | null = null;
  for (const p of run.players.values()) if (p.alive && p.mods.tesla) { owner = p; break; }
  if (!owner) return;
  const marked = [...run.enemies.values()].filter((e) => e.alive && e.marked && e.spawnT <= 0);
  if (marked.length < 2) return;
  // nearest-neighbour chain
  const chain: Enemy[] = [marked.shift()!];
  while (marked.length && chain.length < 7) {
    const last = chain[chain.length - 1];
    let bi = 0, bd = Infinity;
    marked.forEach((e, i) => { const d = Math.hypot(e.x - last.x, e.z - last.z); if (d < bd) { bd = d; bi = i; } });
    if (bd > 16) break;
    chain.push(marked.splice(bi, 1)[0]);
  }
  for (let i = 1; i < chain.length; i++) {
    const a = chain[i - 1], b = chain[i];
    run.emit({ e: 'arc', x1: a.x, y1: a.cy, z1: a.z, x2: b.x, y2: b.cy, z2: b.z });
  }
  for (const e of chain) damageEnemy(run, e, 14 * owner.mods.damageMult, owner.id, false, 0, 1, 0, 'pulse');
}

export function damagePlayer(run: Run, p: SimPlayer, dmg: number, sx: number, sy: number, sz: number, melee: boolean, attacker: Enemy | null, knock?: { x: number; y: number; z: number }) {
  if (!p.alive || p.invuln > 0 || dmg <= 0) return;
  p.lastHurtT = run.time;
  if (melee && attacker && attacker.alive && p.mods.thorns > 0) damageEnemy(run, attacker, dmg * p.mods.thorns * 2, p.id, false, attacker.x - p.x, 0, attacker.z - p.z, 'ripper');
  if (p.mods.martyr) {
    const allies = [...run.players.values()].filter((o) => o !== p && o.alive && Math.hypot(o.x - p.x, o.z - p.z) < 18);
    if (allies.length) for (const a of allies) a.heal(dmg * 0.6);
    else run.explodeAt(p.x, p.y + 1, p.z, 5, dmg * 1.2 * p.mods.damageMult, p.id, 'tesla');
  }
  const hadArmor = p.armor > 0;
  const absorbed = Math.min(p.armor, dmg);
  p.armor -= absorbed;
  dmg -= absorbed;
  p.hp -= dmg;
  run.emit({ e: 'playerHit', id: p.id, dmg: Math.round(dmg + absorbed), x: sx, y: sy, z: sz, armorBroke: hadArmor && p.armor <= 0, kx: knock?.x, ky: knock?.y, kz: knock?.z });
  if (p.hp <= 0 && p.mods.phoenix && !p.phoenixUsed) {
    // PHOENIX CORE: not yet.
    p.phoenixUsed = true;
    p.hp = Math.round(p.mods.maxHp * 0.5);
    p.invuln = 1.5;
    run.explodeAt(p.x, p.y + 1, p.z, 7, 120 * p.mods.damageMult, p.id, 'boss');
    run.emit({ e: 'phoenix', id: p.id });
    return;
  }
  if (p.hp <= 0) {
    p.hp = 0;
    p.alive = false;
    p.died = true;
    p.ripperOn = false;
    p.pedestals = null;
    run.combo = 1;
    run.comboTimer = 0;
    run.emit({ e: 'playerDeath', id: p.id, by: attacker ? attacker.type : 'sim' });
    run.checkAllDead();
  }
}

export function resetCombatState() { ripperAcc = new WeakMap(); }
