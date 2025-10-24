import * as PIXI from 'pixi.js';
import { Tween, easeInOutQuad } from '../utils/Tween'; // assuming Tween.ts is next to this file

export class AceOfShadowsScene {
  public view = new PIXI.Container();
  private app: PIXI.Application;
  private stacks: PIXI.Container[] = [];
  private stacksCount: number[] = [];
  private cardsPerStack = 36;
  private totalCards = 144;
  private topMoveInterval?: number;
  private cardW = 90;
  private cardH = 124;
  private overlap = 18;
  
  // Mobile responsive properties
  private get isMobile() {
    return window.innerWidth < 768;
  }
  
  private get responsiveCardW() {
    return this.isMobile ? Math.min(60, window.innerWidth / 8) : this.cardW;
  }
  
  private get responsiveCardH() {
    return this.isMobile ? Math.min(80, this.responsiveCardW * 1.4) : this.cardH;
  }
  
  private get responsiveOverlap() {
    return this.isMobile ? Math.min(12, this.responsiveCardH * 0.15) : this.overlap;
  }

  // Track running tweens → to update their Y if destination stack height changes
  private activeTweens: {
    sprite: PIXI.Sprite;
    tween: Tween;
    dstIndex: number;
  }[] = [];

  constructor(app: PIXI.Application) {
    this.app = app;
    this.build();
    
    // Add resize handler for mobile responsiveness
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  private handleResize() {
    // Rebuild scene with new responsive dimensions
    this.view.removeChildren();
    this.stacks = [];
    clearInterval(this.topMoveInterval);
    this.topMoveInterval = undefined;
    this.stacksCount = [];
    this.activeTweens = [];
    this.build();
  }

  private makeCardTexture(): PIXI.Texture {
    const cardW = this.responsiveCardW;
    const cardH = this.responsiveCardH;
    const cornerRadius = this.isMobile ? 8 : 12;
    const padding = this.isMobile ? 6 : 8;
    
    const g = new PIXI.Graphics();
    g.beginFill(0xffffff);
    g.drawRoundedRect(0, 0, cardW, cardH, cornerRadius);
    g.endFill();
    g.lineStyle(this.isMobile ? 1 : 2, 0x111111);
    g.drawRoundedRect(0, 0, cardW, cardH, cornerRadius);

    const p = new PIXI.Graphics();
    p.beginFill(0xf5f7ff);
    p.drawRoundedRect(0, 0, cardW - padding * 2, cardH - padding * 2, cornerRadius - 2);
    p.endFill();
    p.x = padding;
    p.y = padding;

    const root = new PIXI.Container();
    root.addChild(g, p);
    const tex = this.app.renderer.generateTexture(root);
    g.destroy(true);
    p.destroy(true);
    root.destroy(true);
    return tex;
  }

  private build() {
    // Create 4 stacks
    const stackCount = 4;
    const cardTex = this.makeCardTexture();

    for (let i = 0; i < stackCount; i++) {
      const stack = new PIXI.Container();
      stack.sortableChildren = true;
      this.view.addChild(stack);
      this.stacks.push(stack);
    }

    // Fill each stack with cards
    for (let s = 0; s < stackCount; s++) {
      for (let i = 0; i < this.cardsPerStack; i++) {
        const spr = new PIXI.Sprite(cardTex);
        spr.anchor.set(0.5);
        spr.x = 0;
        spr.y = i * this.responsiveOverlap;
        spr.rotation = (Math.random() - 0.5) * 0.05;
        spr.alpha = 1 - Math.min(0.75, i * 0.004);
        spr.zIndex = i;
        this.stacks[s].addChild(spr);
        this.stacksCount[s] = this.cardsPerStack;
      }
    }

    this.startCycling();
  }

  private startCycling() {
    const moveTop = () => {
      // pick source and destination stacks
      const nonEmptyStacks = this.stacks
        .map((st, i) => ({ stack: st, index: i }))
        .filter((x) => x.stack.children.length > 0);
      if (nonEmptyStacks.length === 0) return;

      const srcData =
        nonEmptyStacks[Math.floor(Math.random() * nonEmptyStacks.length)];
      const src = srcData.stack;
      const srcIndex = srcData.index;

      const otherStacks = this.stacks
        .map((st, i) => ({ stack: st, index: i }))
        .filter((x) => x.index !== srcIndex);
      const dstData = otherStacks[Math.floor(Math.random() * otherStacks.length)];
      const dst = dstData.stack;
      const dstIndex = dstData.index;

      const top = src.children[src.children.length - 1] as PIXI.Sprite;
      if (!top) return;

      console.log(`move card from ${srcIndex} → ${dstIndex}`);

      const dstLocalTopY = this.stacksCount[dstIndex] * this.responsiveOverlap;
      const dstPos = new PIXI.Point(0, dstLocalTopY);
      const dstGlobal = dst.toGlobal(dstPos);
      const dstInView = this.view.toLocal(dstGlobal);

      // calculate world coordinates for animation
      const srcGlobal = src.toGlobal(top.position);
      const localPosInView = this.view.toLocal(srcGlobal);
      top.parent.removeChild(top);
      top.position.copyFrom(localPosInView);
      this.stacksCount[srcIndex]--;
      this.stacksCount[dstIndex]++;
      this.view.addChild(top);
      const tmpPoint = new PIXI.Point();
      // create tween to move card
      const tween = new Tween(
        top,
        {
          x: dstInView.x,
          y: dstInView.y,
          rotation: (Math.random() - 0.5) * 0.05,
        },
        2000,
        easeInOutQuad,
        () => {
          for (const { tween, dstIndex } of this.activeTweens) {
            const dst = this.stacks[dstIndex];
             tmpPoint.set(0, dst.children.length * this.responsiveOverlap);
            const dstGlobal = dst.toGlobal(tmpPoint, tmpPoint);
            const dstInView = this.view.toLocal(dstGlobal, undefined, tmpPoint);
            tween.updateTarget({ y: dstInView.y });
          }
          return true;
        },
        () => {
          const local = dst.toLocal(top.position, this.view);
          this.view.removeChild(top);
          top.position.copyFrom(local);
          dst.addChild(top);
          top.zIndex = dst.children.length - 1;  
          this.activeTweens = this.activeTweens.filter((t) => t.tween !== tween); 
        }
      );
      this.activeTweens.push({ sprite: top, tween, dstIndex });
    };

    //moveTop();
    this.topMoveInterval = window.setInterval(moveTop, 1000);
  }


  show() {
    this.view.visible = true;
    this.layout();
  }

  hide() {
    this.view.visible = false;
    // Clean up resize listener
    window.removeEventListener('resize', this.handleResize);
  }

  layout() {
    const W = this.app.renderer.width;
    const H = this.app.renderer.height;
    
    // Mobile responsive layout
    const margin = this.isMobile ? 20 : 40;
    const cardW = this.responsiveCardW;
    const overlap = this.responsiveOverlap;
    
    // Adjust layout for mobile - stack cards more vertically
    const totalWidth = (cardW + margin) * this.stacks.length;
    let startX = (W - totalWidth) / 2 + cardW / 2;
    
    // Mobile: position stacks higher to avoid bottom UI
    const centerY = this.isMobile 
      ? H * 0.4 - (this.cardsPerStack * overlap) / 2
      : H * 0.55 - (this.cardsPerStack * overlap) / 2;

    for (const stack of this.stacks) {
      stack.x = startX;
      stack.y = centerY;
      startX += cardW + margin;
    }
  }
}