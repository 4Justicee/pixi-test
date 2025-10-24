
import * as PIXI from 'pixi.js';

interface FlameParticle {
  spr: PIXI.Sprite;
  vx: number;
  vy: number;
  life: number;
  lifeMax: number;
  scaleStart: number;
  scaleEnd: number;
  rot: number;
}

export class PhoenixFlameScene {
  public view = new PIXI.Container();
  private app: PIXI.Application;
  private particles: FlameParticle[] = [];
  private maxSprites = 10;
  private emitterX = 0;
  private emitterY = 0;
  private tex: PIXI.Texture;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.tex = this.makeFlameTexture();
    this.view.eventMode = 'static';
    this.view.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
      const pos = e.global;
      const local = this.view.toLocal(pos);
      this.emitterX = local.x; this.emitterY = local.y;
    });
    this.view.on('pointertap', () => {});
    app.ticker.add(this.tick);
    this.layout();
  }

  private makeFlameTexture(): PIXI.Texture {
    // radial gradient-like blur circle
    const g = new PIXI.Graphics();
    const base = 40;
    g.beginFill(0xff7a00);
    g.drawCircle(base, base, base);
    g.endFill();
    const tex = this.app.renderer.generateTexture(g);
    g.destroy(true);
    return tex;
  }

  private spawn() {
    if (this.particles.length >= this.maxSprites) return;
    const spr = new PIXI.Sprite(this.tex);
    spr.anchor.set(0.5);
    spr.blendMode = PIXI.BLEND_MODES.ADD;
    spr.alpha = 0.9;
    spr.x = this.emitterX;
    spr.y = this.emitterY;
    const p: FlameParticle = {
      spr,
      vx: (Math.random() - 0.5) * 0.6,
      vy: - (1.0 + Math.random() * 1.2),
      life: 0,
      lifeMax: 1200 + Math.random() * 800, // ms
      scaleStart: 0.4 + Math.random() * 0.25,
      scaleEnd: 0.05,
      rot: (Math.random() - 0.5) * 0.1
    };
    spr.scale.set(p.scaleStart);
    this.particles.push(p);
    this.view.addChild(spr);
  }

  private tick = (frames: number) => {
    // spawn rate tied to time
    if (Math.random() < 0.35) this.spawn();

    const dt = this.app.ticker.deltaMS; // ms
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      const t = Math.min(1, p.life / p.lifeMax);
      // motion
      p.spr.x += p.vx * dt;
      p.spr.y += p.vy * dt;
      p.spr.rotation += p.rot * dt * 0.001;
      // scale & alpha
      const s = p.scaleStart + (p.scaleEnd - p.scaleStart) * t;
      p.spr.scale.set(s);
      p.spr.alpha = (1 - t) * 0.9;
      // color shift toward red/yellow
      if (Math.random() < 0.1) {
        p.spr.tint = 0xffb300 + Math.floor(Math.random()*0x003300);
      }

      if (t >= 1) {
        this.view.removeChild(p.spr);
        p.spr.destroy();
        this.particles.splice(i, 1);
      }
    }
  };

  show() { this.view.visible = true; this.layout(); }
  hide() { this.view.visible = false; }

  restart() {
    // Clear all existing particles
    this.particles.forEach(particle => {
      this.view.removeChild(particle.spr);
      particle.spr.destroy();
    });
    this.particles = [];
    
    // Reset emitter position
    this.emitterX = 0;
    this.emitterY = 0;
    
    // Layout the scene
    this.layout();
  }
  layout() {
    this.view.x = this.app.renderer.width * 0.5;
    this.view.y = this.app.renderer.height * 0.6;
    this.emitterX = 0; this.emitterY = 0;
  }
}
