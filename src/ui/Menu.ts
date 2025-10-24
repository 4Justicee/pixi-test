
import * as PIXI from 'pixi.js';
import type { SceneKey } from '../sceneManager';

interface MenuItem { label: string; sceneKey: SceneKey; }

export class Menu {
  public view = new PIXI.Container();
  private items: MenuItem[];
  private app: PIXI.Application;
  private onSelect: (k: SceneKey) => void;

  private buttons: PIXI.Container[] = [];
  
  // Mobile responsive properties
  private get isMobile() {
    return window.innerWidth < 768;
  }

  constructor(app: PIXI.Application, items: MenuItem[], onSelect: (k: SceneKey) => void) {
    this.app = app;
    this.items = items;
    this.onSelect = onSelect;
    this.build();
    
    // Add resize handler for mobile responsiveness
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  private handleResize() {
    // Rebuild menu with new responsive dimensions
    this.view.removeChildren();
    this.buttons = [];
    this.build();
    this.layout();
  }

  private build() {
    const padding = 12;
    let y = 16;
    for (const item of this.items) {
      const btn = this.makeButton(item.label, () => this.onSelect(item.sceneKey));
      btn.y = y;
      y += btn.height + padding;
      this.view.addChild(btn);
      this.buttons.push(btn);
    }
  }

  private makeButton(label: string, onClick: () => void) {
    const c = new PIXI.Container();
    const bg = new PIXI.Graphics();
    
    // Mobile responsive button sizing
    const buttonWidth = this.isMobile ? Math.min(160, window.innerWidth * 0.4) : 220;
    const buttonHeight = this.isMobile ? 36 : 44;
    const cornerRadius = this.isMobile ? 8 : 10;
    const fontSize = this.isMobile ? 14 : 16;
    const paddingX = this.isMobile ? 12 : 16;
    const paddingY = this.isMobile ? 8 : 12;
    
    bg.beginFill(0x1e293b, 0.9);
    bg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, cornerRadius);
    bg.endFill();
    
    const txt = new PIXI.Text(label, new PIXI.TextStyle({
      fill: 0xffffff,
      fontSize: fontSize,
      fontFamily: 'system-ui, sans-serif'
    }));
    txt.x = paddingX; 
    txt.y = paddingY;

    c.addChild(bg, txt);
    c.interactive = true;
    c.on('pointertap', onClick);
    c.on('pointerover', () => (bg.alpha = 1));
    c.on('pointerout', () => (bg.alpha = 0.9));
    return c;
  }

  layout() {
    // Mobile responsive positioning
    if (this.isMobile) {
      // On mobile, position menu at top-right to avoid overlapping game area
      this.view.x = window.innerWidth - Math.min(180, window.innerWidth * 0.45);
      this.view.y = 8;
    } else {
      // Desktop: stick to top-left with some padding
      this.view.x = 12;
      this.view.y = 12;
    }
  }
  
  destroy() {
    // Clean up resize listener
    window.removeEventListener('resize', this.handleResize);
  }
}
