// Autopilot navigation: Dijkstra distance fields over the room's nav grid, cached per goal cell,
// plus a string-pulled steering point (the farthest path cell in clear line of sight).

import type { NavGrid, RoomGeo } from '../../shared/mapData';
import * as C from '../../shared/constants';

/**
 * Our own walkability grid (same layout as the room's nav grid): the enemy nav blocks anything
 * taller than 0.3m, but a player steps up 0.55m (arena rims, low plinths), so those stay open.
 */
function walkGrid(geo: RoomGeo): NavGrid & { climb: Uint8Array } {
  const src = geo.nav;
  const { ox, oz, cell, cols, rows } = src;
  const blocked = new Uint8Array(cols * rows);
  const climb = new Uint8Array(cols * rows);
  const boxes = geo.boxes.concat(geo.doors.map((d) => d.panel));
  const mark = (bx: { x0: number; z0: number; x1: number; z1: number }, arr: Uint8Array) => {
    const pad = 0.28;
    const c0 = Math.max(0, Math.floor((bx.x0 - pad - ox) / cell)), c1 = Math.min(cols - 1, Math.floor((bx.x1 + pad - ox) / cell - 1e-6));
    const r0 = Math.max(0, Math.floor((bx.z0 - pad - oz) / cell)), r1 = Math.min(rows - 1, Math.floor((bx.z1 + pad - oz) / cell - 1e-6));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) arr[r * cols + c] = 1;
  };
  for (const bx of boxes) {
    if (bx.y0 > 1.6 || bx.y1 <= C.STEP_UP - 0.05) continue;
    // waist-high: mantle over it (costly, but never a dead end)
    if (bx.y0 < 0.3 && bx.y1 <= 1.3 && bx.mat !== 'door' && bx.mat !== 'wall') mark(bx, climb);
    else mark(bx, blocked);
  }
  for (let i = 0; i < blocked.length; i++) if (blocked[i]) climb[i] = 0;
  const b = geo.bounds;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = ox + (c + 0.5) * cell, z = oz + (r + 0.5) * cell;
    if (x < b.x0 + 0.3 || x > b.x1 - 0.3 || z < b.z0 + 0.3 || z > b.z1 - 0.3) blocked[r * cols + c] = 1;
  }
  return { ox, oz, cell, cols, rows, blocked, climb };
}

const SQ2 = Math.SQRT2;

interface Field { dist: Float32Array; t: number }

export class Nav {
  private geo: RoomGeo | null = null;
  private nav: (NavGrid & { climb: Uint8Array }) | null = null;
  private fields = new Map<number, Field>();
  /** extra temporary blocks (cells we got stuck on), cleared on room change */
  private soft = new Map<number, number>();
  /** cells inside open doorways (the nav grid keeps every door panel blocked) */
  private openCells = new Set<number>();
  private openKey = '';
  private clock = 0;

  setGeo(geo: RoomGeo) {
    if (geo === this.geo) return;
    this.geo = geo;
    this.nav = walkGrid(geo);
    this.fields.clear();
    this.soft.clear();
    this.openCells.clear();
    this.openKey = '';
  }

  /** Let paths run out through open doorways. */
  setOpenDoors(doors: { slot: number; x: number; z: number; nx: number; nz: number }[]) {
    const key = doors.map((d) => d.slot).join(',');
    if (key === this.openKey || !this.nav) return;
    this.openKey = key;
    this.openCells.clear();
    const n = this.nav;
    for (const d of doors) {
      const tx = d.nz, tz = -d.nx;
      for (let r = 0; r < n.rows; r++) for (let c = 0; c < n.cols; c++) {
        const x = n.ox + (c + 0.5) * n.cell, z = n.oz + (r + 0.5) * n.cell;
        const lat = (x - d.x) * tx + (z - d.z) * tz;
        const depth = -((x - d.x) * d.nx + (z - d.z) * d.nz); // >0 outside the room
        if (Math.abs(lat) < 1.2 && depth > -1.2 && depth < 3.5) this.openCells.add(r * n.cols + c);
      }
    }
    this.fields.clear();
  }

  tick(dt: number) {
    this.clock += dt;
    if (this.soft.size) for (const [k, t] of this.soft) if (t < this.clock) { this.soft.delete(k); this.fields.clear(); }
  }

  cellOf(x: number, z: number): number {
    const n = this.nav!;
    const c = Math.floor((x - n.ox) / n.cell), r = Math.floor((z - n.oz) / n.cell);
    if (c < 0 || r < 0 || c >= n.cols || r >= n.rows) return -1;
    return r * n.cols + c;
  }

  center(i: number): { x: number; z: number } {
    const n = this.nav!;
    return { x: n.ox + ((i % n.cols) + 0.5) * n.cell, z: n.oz + (Math.floor(i / n.cols) + 0.5) * n.cell };
  }

  blocked(i: number): boolean {
    if (i < 0) return true;
    return (this.nav!.blocked[i] === 1 && !this.openCells.has(i)) || this.soft.has(i);
  }

  blockedAt(x: number, z: number): boolean { return this.blocked(this.cellOf(x, z)); }

  /** waist-high obstacle here (walkable by mantling) */
  climbAt(x: number, z: number): boolean { const i = this.cellOf(x, z); return i >= 0 && !!this.nav?.climb[i] && !this.openCells.has(i); }

  /** temporarily avoid a cell (we keep getting stuck there) */
  avoid(x: number, z: number, secs = 6) {
    const i = this.cellOf(x, z);
    if (i < 0) return;
    this.soft.set(i, this.clock + secs);
    this.fields.clear();
  }

  /** nearest free cell to a point (spiral search) */
  nearestFree(x: number, z: number, maxR = 6): number {
    const n = this.nav!;
    const i0 = this.cellOf(x, z);
    if (i0 >= 0 && !this.blocked(i0)) return i0;
    const c0 = Math.floor((x - n.ox) / n.cell), r0 = Math.floor((z - n.oz) / n.cell);
    let best = -1, bd = Infinity;
    for (let rad = 1; rad <= maxR && best < 0; rad++) {
      for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
        const c = c0 + dc, r = r0 + dr;
        if (c < 0 || r < 0 || c >= n.cols || r >= n.rows) continue;
        const i = r * n.cols + c;
        if (this.blocked(i)) continue;
        const p = this.center(i);
        const d = Math.hypot(p.x - x, p.z - z);
        if (d < bd) { bd = d; best = i; }
      }
    }
    return best;
  }

  private field(goal: number): Field {
    const cached = this.fields.get(goal);
    if (cached) return cached;
    const n = this.nav!;
    const N = n.cols * n.rows;
    const dist = new Float32Array(N).fill(Infinity);
    // binary heap of (cost, index)
    const hc: number[] = [], hi: number[] = [];
    const push = (c: number, i: number) => {
      hc.push(c); hi.push(i);
      let k = hc.length - 1;
      while (k > 0) {
        const p = (k - 1) >> 1;
        if (hc[p] <= hc[k]) break;
        [hc[p], hc[k]] = [hc[k], hc[p]]; [hi[p], hi[k]] = [hi[k], hi[p]];
        k = p;
      }
    };
    const pop = (): [number, number] => {
      const c = hc[0], i = hi[0];
      const lc = hc.pop()!, li = hi.pop()!;
      if (hc.length) {
        hc[0] = lc; hi[0] = li;
        let k = 0;
        for (;;) {
          const a = 2 * k + 1, b = a + 1;
          let m = k;
          if (a < hc.length && hc[a] < hc[m]) m = a;
          if (b < hc.length && hc[b] < hc[m]) m = b;
          if (m === k) break;
          [hc[m], hc[k]] = [hc[k], hc[m]]; [hi[m], hi[k]] = [hi[k], hi[m]];
          k = m;
        }
      }
      return [c, i];
    };
    dist[goal] = 0;
    push(0, goal);
    while (hc.length) {
      const [cst, i] = pop();
      if (cst > dist[i]) continue;
      const c = i % n.cols, r = (i / n.cols) | 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const cc = c + dc, rr = r + dr;
        if (cc < 0 || rr < 0 || cc >= n.cols || rr >= n.rows) continue;
        const j = rr * n.cols + cc;
        if (this.blocked(j)) continue;
        if (dr && dc && (this.blocked(r * n.cols + cc) || this.blocked(rr * n.cols + c))) continue; // no corner cutting
        const nd = cst + (dr && dc ? SQ2 : 1) * (n.climb[j] ? 5 : 1);
        if (nd < dist[j]) { dist[j] = nd; push(nd, j); }
      }
    }
    const f = { dist, t: this.clock };
    if (this.fields.size > 40) this.fields.clear();
    this.fields.set(goal, f);
    return f;
  }

  /** path distance (m) from (x,z) to the goal point, Infinity if unreachable */
  pathDist(x: number, z: number, gx: number, gz: number): number {
    if (!this.nav) return Infinity;
    const g = this.nearestFree(gx, gz, 4);
    const s = this.nearestFree(x, z, 3);
    if (g < 0 || s < 0) return Infinity;
    return this.field(g).dist[s];
  }

  /** Is the straight segment walkable with body clearance? (samples the grid every 0.3m, ±0.3m lateral) */
  clearLine(x0: number, z0: number, x1: number, z1: number, clearance = 0.3): boolean {
    const dx = x1 - x0, dz = z1 - z0;
    const L = Math.hypot(dx, dz);
    if (L < 0.01) return true;
    const ux = dx / L, uz = dz / L;
    const px = -uz * clearance, pz = ux * clearance;
    for (let s = 0.3; s < L; s += 0.3) {
      const x = x0 + ux * s, z = z0 + uz * s;
      if (this.blockedAt(x, z) || this.blockedAt(x + px, z + pz) || this.blockedAt(x - px, z - pz)) return false;
    }
    return !this.blockedAt(x1, z1);
  }

  /**
   * Steering target toward (gx,gz). Returns a point to walk at (string-pulled along the
   * descent path) and the remaining path length, or null if unreachable.
   */
  steer(x: number, z: number, gx: number, gz: number): { x: number; z: number; dist: number; direct: boolean } | null {
    if (!this.nav) return null;
    if (this.clearLine(x, z, gx, gz)) return { x: gx, z: gz, dist: Math.hypot(gx - x, gz - z), direct: true };
    const g = this.nearestFree(gx, gz, 5);
    if (g < 0) return null;
    const f = this.field(g);
    let cur = this.cellOf(x, z);
    if (cur < 0 || this.blocked(cur) || !isFinite(f.dist[cur])) {
      // standing in a padded cell: step to the nearest reachable free cell
      const n = this.nav;
      const c0 = Math.floor((x - n.ox) / n.cell), r0 = Math.floor((z - n.oz) / n.cell);
      let best = -1, bd = Infinity;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        const c = c0 + dc, r = r0 + dr;
        if (c < 0 || r < 0 || c >= n.cols || r >= n.rows) continue;
        const i = r * n.cols + c;
        if (this.blocked(i) || !isFinite(f.dist[i])) continue;
        const p = this.center(i);
        const score = Math.hypot(p.x - x, p.z - z) * 2 + f.dist[i] * 0.1;
        if (score < bd) { bd = score; best = i; }
      }
      if (best < 0) return null;
      const p = this.center(best);
      return { x: p.x, z: p.z, dist: f.dist[best] + Math.hypot(p.x - x, p.z - z), direct: false };
    }
    // walk the descent path, keep the farthest cell still in clear line
    const n = this.nav;
    let pick = cur;
    let i = cur;
    for (let step = 0; step < 18; step++) {
      if (f.dist[i] === 0) break;
      const c = i % n.cols, r = (i / n.cols) | 0;
      let nb = -1, nv = f.dist[i];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const cc = c + dc, rr = r + dr;
        if (cc < 0 || rr < 0 || cc >= n.cols || rr >= n.rows) continue;
        const j = rr * n.cols + cc;
        if (f.dist[j] < nv) { nv = f.dist[j]; nb = j; }
      }
      if (nb < 0) break;
      i = nb;
      const p = this.center(i);
      if (this.clearLine(x, z, p.x, p.z, 0.32)) pick = i; else if (step > 2) break;
    }
    if (pick === cur) {
      // adjacent cell fallback
      const c = cur % n.cols, r = (cur / n.cols) | 0;
      let nv = f.dist[cur];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const cc = c + dc, rr = r + dr;
        if (cc < 0 || rr < 0 || cc >= n.cols || rr >= n.rows) continue;
        const j = rr * n.cols + cc;
        if (f.dist[j] < nv) { nv = f.dist[j]; pick = j; }
      }
    }
    const p = pick === g ? { x: gx, z: gz } : this.center(pick);
    return { x: p.x, z: p.z, dist: f.dist[cur], direct: false };
  }
}
