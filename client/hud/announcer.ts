// Big center-screen text: streaks, room clear, boss intros, legendary reveals.
export class Announcer {
  private queue: { text: string; cls: string; sub?: string }[] = [];
  private busyUntil = 0;
  constructor(private el: HTMLElement) {}

  /** Streak announcements interrupt immediately; others queue briefly. */
  show(text: string, cls = '', sub?: string, interrupt = false) {
    if (interrupt) { this.queue = []; this.busyUntil = 0; }
    this.queue.push({ text, cls, sub });
    this.pump();
  }

  private pump() {
    const now = performance.now();
    if (now < this.busyUntil || !this.queue.length) {
      if (this.queue.length) setTimeout(() => this.pump(), this.busyUntil - now + 5);
      return;
    }
    const a = this.queue.shift()!;
    this.el.innerHTML = '';
    const d = document.createElement('div');
    d.className = 'ann ' + a.cls;
    d.textContent = a.text;
    this.el.appendChild(d);
    if (a.sub) {
      const s = document.createElement('div');
      s.className = 'ann-line';
      s.textContent = a.sub;
      this.el.appendChild(s);
    }
    this.busyUntil = now + (a.cls.includes('big') ? 1500 : 650);
    setTimeout(() => this.pump(), this.busyUntil - now + 5);
  }

  clear() { this.queue = []; this.el.innerHTML = ''; }
}
