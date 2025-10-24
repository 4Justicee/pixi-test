type Easing = (t: number) => number;

export const easeInOutQuad: Easing = (t) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export class Tween {
  static tweens: Tween[] = [];
  private startTime: number;
  private duration: number;
  private from: Record<string, number>;
  private to: Record<string, number>;
  private target: any;
  private easing: Easing;
  private onComplete?: () => void;
  private checkTarget?: () => boolean;
  private finished = false;
  constructor(
    target: any,
    to: Record<string, number>,
    duration: number,
    easing: Easing = easeInOutQuad,
    checkTarget?: () => boolean,
    onComplete?: () => void
  ) {
    this.target = target;
    this.duration = duration;
    this.easing = easing;
    this.onComplete = onComplete;
    this.checkTarget = checkTarget;
    this.from = {};
    this.to = { ...to };

    for (const k of Object.keys(to)) {
      this.from[k] = Number(target[k]) || 0;
    }
    this.startTime = performance.now();

    Tween.tweens.push(this);
  }

  /**
   * Dynamically update one or more destination values.
   * Optional `resetTime` lets you choose if the animation should restart timing.
   */
  updateTarget(newTo: Record<string, number>, resetTime = false) {
    // recompute diffs from current values
    for (const k of Object.keys(newTo)) {
      this.to[k] = newTo[k];
      this.from[k] = Number(this.target[k]) || 0;
    }
    if (resetTime) this.startTime = performance.now();
  }

  update(now: number) {
    if (this.finished) return false;

    if (this.checkTarget && !this.checkTarget()) {
      // If your checkTarget returns false, stop this tween
      this.checkTarget();
    }

    const t = Math.min(1, (now - this.startTime) / this.duration);
    const e = this.easing(t);

    for (const k of Object.keys(this.to)) {
      const v = this.from[k] + (this.to[k] - this.from[k]) * e;
      this.target[k] = v;
    }

    if (t >= 1) {
      if (this.onComplete) this.onComplete();
      this.finished = true;
      return false;
    }
    return true;
  }

  static tick() {
    const now = performance.now();
    Tween.tweens = Tween.tweens.filter((t) => t.update(now));
  }
}

// Drive tweens via RAF
(function loop() {
  Tween.tick();
  requestAnimationFrame(loop);
})();