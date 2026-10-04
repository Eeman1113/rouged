import * as C from '../../shared/constants';

export class KillFeed {
  constructor(private el: HTMLElement) {}
  push(killer: string, victim: string, tags: string[], self: boolean) {
    const d = document.createElement('div');
    d.className = 'kf';
    d.innerHTML = `<span class="${self ? 'you' : ''}">${esc(killer)}</span><span class="arrow">⟶</span><span class="victim">${esc(victim)}</span>${tags.map((t) => `<span class="tag">[${t}]</span>`).join('')}`;
    this.el.prepend(d);
    while (this.el.children.length > 6) this.el.lastElementChild?.remove();
    setTimeout(() => d.classList.add('out'), C.KILLFEED_DURATION * 1000);
    setTimeout(() => d.remove(), C.KILLFEED_DURATION * 1000 + 450);
  }
  clear() { this.el.innerHTML = ''; }
}

export function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}
