
import * as PIXI from 'pixi.js';

export function setupAutoResize(app: PIXI.Application, onResize?: () => void) {
  const handle = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    onResize?.();
  };
  window.addEventListener('resize', handle);
  handle();
}
