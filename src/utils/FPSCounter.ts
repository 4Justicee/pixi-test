
import * as PIXI from 'pixi.js';

export class FPSCounter {
  public view = new PIXI.Container();
  private app: PIXI.Application;
  private label: PIXI.Text;
  private lastTime = performance.now();
  private frames = 0;
  private fps = 0;

  constructor(app: PIXI.Application) {
    this.app = app;
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.35);
    bg.drawRoundedRect(0,0,80,28,8);
    bg.endFill();
    this.label = new PIXI.Text('FPS: --', new PIXI.TextStyle({ fill: 0xffffff, fontSize: 14, fontFamily: 'system-ui, sans-serif' }));
    this.label.x = 8; this.label.y = 6;
    this.view.addChild(bg, this.label);

    app.ticker.add(this.tick);
  }

  private tick = () => {
    this.frames++;
    const now = performance.now();
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round( (this.frames * 1000) / (now - this.lastTime) );
      this.frames = 0;
      this.lastTime = now;
      this.label.text = `FPS: ${this.fps}`;
    }
  };

  layout() {
    this.view.x = 110; // leave space for menu left
    this.view.y = 12;
  }
}
