
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
  rotSpeed: number;
  flickerSpeed: number;
  flickerPhase: number;
  colorPhase: number;
  intensity: number;
}

export class PhoenixFlameScene {
  public view = new PIXI.Container();
  private app: PIXI.Application;
  private particles: FlameParticle[] = [];
  private maxSprites = 10;
  private emitterX = 0;
  private emitterY = 0;
  private fireTexture!: PIXI.Texture;
  private smokeTexture!: PIXI.Texture;
  private sparkTexture!: PIXI.Texture;
  private windStrength = 0;
  private windDirection = 1;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.createFireTextures();
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

  private createFireTextures() {
    // Create realistic fire texture with gradient
    this.fireTexture = this.createFireTexture();
    this.smokeTexture = this.createSmokeTexture();
    this.sparkTexture = this.createSparkTexture();
  }

  private createFireTexture(): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Create flame-shaped texture
    ctx.save();
    
    // Create flame shape using multiple gradients
    for (let i = 0; i < 3; i++) {
      const flameGradient = ctx.createLinearGradient(24, 64, 24, 0);
      
      if (i === 0) {
        // Core flame - white hot
        flameGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        flameGradient.addColorStop(0.3, 'rgba(255, 255, 200, 0.8)');
        flameGradient.addColorStop(0.6, 'rgba(255, 200, 100, 0.6)');
        flameGradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
      } else if (i === 1) {
        // Middle flame - orange
        flameGradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
        flameGradient.addColorStop(0.4, 'rgba(255, 150, 50, 0.7)');
        flameGradient.addColorStop(0.8, 'rgba(255, 100, 0, 0.5)');
        flameGradient.addColorStop(1, 'rgba(255, 200, 100, 0.8)');
      } else {
        // Outer flame - red
        flameGradient.addColorStop(0, 'rgba(200, 0, 0, 0)');
        flameGradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.4)');
        flameGradient.addColorStop(0.8, 'rgba(255, 100, 0, 0.3)');
        flameGradient.addColorStop(1, 'rgba(255, 150, 50, 0.6)');
      }
      
      ctx.fillStyle = flameGradient;
      
      // Draw flame shape
      ctx.beginPath();
      const width = i === 0 ? 8 : i === 1 ? 16 : 24;
      const x = (48 - width) / 2;
      
      ctx.moveTo(x, 64);
      ctx.quadraticCurveTo(x + width/2, 40, x + width/4, 20);
      ctx.quadraticCurveTo(x + width/2, 10, x + width/4, 0);
      ctx.quadraticCurveTo(x + width/2, 10, x + 3*width/4, 20);
      ctx.quadraticCurveTo(x + width/2, 40, x + width, 64);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
    return PIXI.Texture.from(canvas);
  }

  private createSmokeTexture(): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d')!;
    
    // Create more realistic smoke with irregular shape
    const smokeGradient = ctx.createRadialGradient(20, 20, 0, 20, 20, 20);
    smokeGradient.addColorStop(0, 'rgba(120, 120, 120, 0.6)');
    smokeGradient.addColorStop(0.5, 'rgba(100, 100, 100, 0.4)');
    smokeGradient.addColorStop(0.8, 'rgba(80, 80, 80, 0.2)');
    smokeGradient.addColorStop(1, 'rgba(60, 60, 60, 0)');
    
    ctx.fillStyle = smokeGradient;
    
    // Draw irregular smoke shape
    ctx.beginPath();
    ctx.ellipse(20, 20, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some turbulence
    ctx.beginPath();
    ctx.ellipse(15, 25, 8, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(25, 15, 6, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    return PIXI.Texture.from(canvas);
  }

  private createSparkTexture(): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 12;
    canvas.height = 12;
    const ctx = canvas.getContext('2d')!;
    
    // Create sparkle effect
    const sparkGradient = ctx.createRadialGradient(6, 6, 0, 6, 6, 6);
    sparkGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sparkGradient.addColorStop(0.3, 'rgba(255, 255, 150, 0.9)');
    sparkGradient.addColorStop(0.6, 'rgba(255, 200, 100, 0.6)');
    sparkGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
    
    ctx.fillStyle = sparkGradient;
    ctx.fillRect(0, 0, 12, 12);
    
    // Add sparkle lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(6, 2);
    ctx.lineTo(6, 10);
    ctx.moveTo(2, 6);
    ctx.lineTo(10, 6);
    ctx.stroke();
    
    return PIXI.Texture.from(canvas);
  }

  private spawn() {
    if (this.particles.length >= this.maxSprites) return;
    
    // Randomly choose particle type (85% fire, 10% smoke, 5% sparks)
    const particleType = Math.random();
    let texture: PIXI.Texture;
    let blendMode: PIXI.BLEND_MODES;
    
    if (particleType < 0.85) {
      texture = this.fireTexture;
      blendMode = PIXI.BLEND_MODES.ADD;
    } else if (particleType < 0.95) {
      texture = this.smokeTexture;
      blendMode = PIXI.BLEND_MODES.NORMAL;
    } else {
      texture = this.sparkTexture;
      blendMode = PIXI.BLEND_MODES.ADD;
    }
    
    const spr = new PIXI.Sprite(texture);
    spr.anchor.set(0.5);
    spr.blendMode = blendMode;
    spr.x = this.emitterX + (Math.random() - 0.5) * 30;
    spr.y = this.emitterY + (Math.random() - 0.5) * 10;
    
    const p: FlameParticle = {
      spr,
      vx: (Math.random() - 0.5) * 0.8 + this.windStrength * this.windDirection,
      vy: -(1.5 + Math.random() * 1.0),
      life: 0,
      lifeMax: 1500 + Math.random() * 1000,
      scaleStart: 1.0 + Math.random() * 1.2,
      scaleEnd: 0.1,
      rot: (Math.random() - 0.5) * 0.2,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      flickerSpeed: 0.02 + Math.random() * 0.03,
      flickerPhase: Math.random() * Math.PI * 2,
      colorPhase: Math.random() * Math.PI * 2,
      intensity: 0.8 + Math.random() * 0.2
    };
    
    spr.scale.set(p.scaleStart);
    spr.alpha = p.intensity;
    this.particles.push(p);
    this.view.addChild(spr);
  }

  private tick = (frames: number) => {
    // Dynamic wind effect
    this.windStrength = Math.sin(frames * 0.001) * 0.3;
    this.windDirection = Math.sin(frames * 0.002) > 0 ? 1 : -1;
    
    // High spawn rate to compensate for lower particle count
    const spawnChance = 0.9 + Math.sin(frames * 0.003) * 0.1;
    if (Math.random() < spawnChance) this.spawn();

    const dt = this.app.ticker.deltaMS;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      const t = Math.min(1, p.life / p.lifeMax);
      
      // Enhanced physics
      p.vx += this.windStrength * dt * 0.001;
      p.vy += 0.0002 * dt; // Gravity effect
      
      // Motion with turbulence
      const turbulence = Math.sin(p.life * 0.005) * 0.0001;
      p.spr.x += p.vx * dt + turbulence * dt;
      p.spr.y += p.vy * dt;
      
      // Rotation with varying speed
      p.rot += p.rotSpeed * dt;
      p.spr.rotation += p.rot * dt * 0.001;
      
      // Flickering effect
      p.flickerPhase += p.flickerSpeed * dt;
      const flicker = 0.8 + 0.2 * Math.sin(p.flickerPhase);
      
      // Scale with realistic fire behavior
      const s = p.scaleStart + (p.scaleEnd - p.scaleStart) * t;
      p.spr.scale.set(s * flicker);
      
      // Alpha with realistic fade
      const alpha = (1 - t) * p.intensity * flicker;
      p.spr.alpha = alpha;
      
      // Color transitions for fire particles
      if (p.spr.texture === this.fireTexture) {
        p.colorPhase += 0.002 * dt;
        const colorIntensity = 0.8 + 0.2 * Math.sin(p.colorPhase);
        p.spr.tint = this.getFireColor(t, colorIntensity);
      } else if (p.spr.texture === this.sparkTexture) {
        // Sparks fade to white
        p.spr.tint = 0xffffff;
      }

      if (t >= 1) {
        this.view.removeChild(p.spr);
        p.spr.destroy();
        this.particles.splice(i, 1);
      }
    }
  };

  private getFireColor(lifeProgress: number, intensity: number): number {
    // Color progression: white -> yellow -> orange -> red -> dark red
    if (lifeProgress < 0.2) {
      return 0xffffff; // White hot
    } else if (lifeProgress < 0.4) {
      return 0xffaa00; // Yellow
    } else if (lifeProgress < 0.6) {
      return 0xff6600; // Orange
    } else if (lifeProgress < 0.8) {
      return 0xff3300; // Red-orange
    } else {
      return 0xcc0000; // Dark red
    }
  }

  show() { this.view.visible = true; this.layout(); }
  hide() { this.view.visible = false; }

  restart() {
    // Clear all existing particles
    this.particles.forEach(particle => {
      this.view.removeChild(particle.spr);
      particle.spr.destroy();
    });
    this.particles = [];
    
    // Reset emitter position and wind
    this.emitterX = 0;
    this.emitterY = 0;
    this.windStrength = 0;
    this.windDirection = 1;
    
    // Layout the scene
    this.layout();
  }
  layout() {
    this.view.x = this.app.renderer.width * 0.5;
    this.view.y = this.app.renderer.height * 0.6;
    this.emitterX = 0; this.emitterY = 0;
  }
}
