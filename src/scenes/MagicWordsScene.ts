
import * as PIXI from 'pixi.js';

interface MagicLine {
  speaker: string;
  content: string; // can contain image tokens like [img:url] or :emoji:
  images?: Record<string, string>; // optional mapping
}

export class MagicWordsScene {
  public view = new PIXI.Container();
  private app: PIXI.Application;
  private lines: MagicLine[] = [];
  private textStyle = new PIXI.TextStyle({
    fill: 0xffffff,
    fontSize: 18,
    fontFamily: 'system-ui, sans-serif',
    wordWrap: true,
    wordWrapWidth: 680,
    lineHeight: 28,
  });

  constructor(app: PIXI.Application) {
    this.app = app;
    this.build();
  }

  private async build() {
    // Title
    const title = new PIXI.Text('Magic Words — Dialogue', new PIXI.TextStyle({ fill: 0xffe999, fontSize: 24, fontFamily: 'system-ui, sans-serif' }));
    this.view.addChild(title);

    // Fetch dialogue
    try {
      const resp = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
      if (!resp.ok) throw new Error('Bad response');
      const data = await resp.json();
      // Expecting something like: [{ speaker, content, images? }, ...]
      this.lines = Array.isArray(data) ? data : (data?.lines ?? []);
    } catch (e) {
      // Fallback demo data if CORS or network fails
      this.lines = [
        { speaker: 'Ava', content: 'We found the relic! :sparkle:' },
        { speaker: 'Bo', content: 'Careful... it\'s hot :fire:' },
        { speaker: 'Ava', content: 'Then we hurry! :dash: :sparkle:' },
      ];
    }
    this.renderDialogue();
  }

  private parseTokens(str: string): (PIXI.Text | PIXI.Sprite)[] {
    // support :emoji: tokens mapped to simple colored circles via generated textures,
    // and [img:url] tokens to load external images.
    const parts: (PIXI.Text | PIXI.Sprite)[] = [];
    const regex = /(:[a-z0-9_]+:)|\[img:(.+?)\]/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        const t = str.slice(lastIndex, match.index);
        parts.push(new PIXI.Text(t, this.textStyle));
      }
      if (match[1]) {
        // :emoji:
        const name = match[1].slice(1, -1);
        const spr = new PIXI.Sprite(this.getEmojiTexture(name));
        spr.width = 22; spr.height = 22;
        spr.y = 6; // baseline tweak
        parts.push(spr);
      } else if (match[2]) {
        const url = match[2];
        const spr = new PIXI.Sprite();
        spr.width = 28; spr.height = 28; spr.y = 4;
        PIXI.Assets.load(url).then(tex => { spr.texture = tex; }).catch(()=>{});
        parts.push(spr);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) {
      parts.push(new PIXI.Text(str.slice(lastIndex), this.textStyle));
    }
    return parts;
  }

  private emojiCache: Record<string, PIXI.Texture> = {};
  private getEmojiTexture(name: string): PIXI.Texture {
    if (this.emojiCache[name]) return this.emojiCache[name];
    // generate a tiny pictogram per name (different hue)
    const g = new PIXI.Graphics();
    const hue = Math.abs([...name].reduce((a,c)=>a + c.charCodeAt(0), 0)) % 360;
    const color = hslToHex(hue, 70, 55);
    g.beginFill(color);
    g.drawCircle(12, 12, 10);
    g.endFill();
    g.lineStyle(2, 0x000000, 0.5);
    g.drawCircle(12, 12, 10);
    const tex = this.app.renderer.generateTexture(g);
    g.destroy(true);
    this.emojiCache[name] = tex;
    return tex;
  }

  private renderDialogue() {
    // Clear old
    this.view.removeChildren();
    const title = new PIXI.Text('Magic Words — Dialogue', new PIXI.TextStyle({ fill: 0xffe999, fontSize: 24, fontFamily: 'system-ui, sans-serif' }));
    this.view.addChild(title);

    const bubblePad = 12;
    let y = 60;
    const maxWidth = Math.min(this.app.renderer.width * 0.8, 700);
    for (const line of this.lines) {
      // Speaker
      const speaker = new PIXI.Text(line.speaker, new PIXI.TextStyle({ fill: 0xa7f3d0, fontSize: 14 }));
      speaker.x = 20; speaker.y = y;
      this.view.addChild(speaker);
      y += 18;

      // Bubble container
      const bubble = new PIXI.Container();
      bubble.x = 20;
      bubble.y = y;

      // Compose tokens inline with wrapping
      let x = bubblePad;
      let innerY = bubblePad;
      const lineH = 28;
      const tokens = this.parseTokens(line.content);
      for (const node of tokens) {
        const w = (node as any).width ?? 0;
        if (x + w > maxWidth - bubblePad) {
          x = bubblePad;
          innerY += lineH;
        }
        (node as any).x = x;
        (node as any).y = (node as any).y ? (node as any).y + innerY : innerY;
        bubble.addChild(node as any);
        x += w + 6;
      }

      // Bubble background
      const bg = new PIXI.Graphics();
      const bW = maxWidth;
      const bH = innerY + lineH + bubblePad * 0.5;
      bg.beginFill(0x1f2937);
      bg.drawRoundedRect(0, 0, bW, bH, 14);
      bg.endFill();
      bg.lineStyle(2, 0x374151);
      bg.drawRoundedRect(0, 0, bW, bH, 14);
      bubble.addChildAt(bg, 0);

      this.view.addChild(bubble);
      y += bH + 16;
    }
    this.layout();
  }

  show() { this.view.visible = true; this.layout(); }
  hide() { this.view.visible = false; }
  layout() {
    const W = this.app.renderer.width;
    // center content
    this.view.x = Math.round((W - Math.min(W * 0.8, 700)) / 2);
    this.view.y = 80;
  }
}

function hslToHex(h:number, s:number, l:number) {
  s/=100; l/=100;
  const k = (n:number) => (n + h/30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n:number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  return (r<<16) + (g<<8) + b;
}
