import * as PIXI from 'pixi.js';
import { SceneManager } from './sceneManager';
import { Menu } from './ui/Menu';
import { FPSCounter } from './utils/FPSCounter';
import { setupAutoResize } from './utils/Resize';

// Create PixiJS 7 Application
const app = new PIXI.Application({
  backgroundColor: 0x101015,
  resizeTo: window,
  antialias: true,
});

const appDiv = document.getElementById('app')!;
// In Pixi 7 the canvas element is .view, not .canvas
appDiv.appendChild(app.view as HTMLCanvasElement);


// Fullscreen overlay
const fsOverlay = document.getElementById('enter-fullscreen')!;
const enterFullscreen = async () => {
  fsOverlay.classList.add('hidden');
  const elem = document.documentElement as any;
  if (elem.requestFullscreen) await elem.requestFullscreen();
};
fsOverlay.addEventListener('click', enterFullscreen);
fsOverlay.addEventListener('touchstart', enterFullscreen, { passive: true });

// Scene manager
const sceneManager = new SceneManager(app);
app.stage.addChild(sceneManager.view);

// Menu
const menu = new Menu(app, [
  { label: 'Ace of Shadows', sceneKey: 'ace' },
  { label: 'Magic Words', sceneKey: 'magic' },
  { label: 'Phoenix Flame', sceneKey: 'phoenix' },
], (sceneKey) => sceneManager.show(sceneKey));
app.stage.addChild(menu.view);

// FPS Counter
const fps = new FPSCounter(app);
app.stage.addChild(fps.view);

// Resize/layout handling
setupAutoResize(app, () => {
  menu.layout();
  fps.layout();
  sceneManager.layout();
});

// Start default scene
sceneManager.show('ace');