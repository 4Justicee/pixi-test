
import * as PIXI from 'pixi.js';
import { AceOfShadowsScene } from './scenes/AceOfShadowsScene';
import { MagicWordsScene } from './scenes/MagicWordsScene';
import { PhoenixFlameScene } from './scenes/PhoenixFlameScene';

export type SceneKey = 'ace' | 'magic' | 'phoenix';
export interface IScene {
  view: PIXI.Container;
  show(): void;
  hide(): void;
  layout(): void;
}

export class SceneManager {
  public view = new PIXI.Container();
  private app: PIXI.Application;
  private scenes: Record<SceneKey, IScene>;

  private _current?: IScene;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.scenes = {
      ace: new AceOfShadowsScene(app),
      magic: new MagicWordsScene(app),
      phoenix: new PhoenixFlameScene(app),
    };
    for (const s of Object.values(this.scenes)) {
      s.hide();
      this.view.addChild(s.view);
    }
  }

  show(key: SceneKey) {
    if (this._current) this._current.hide();
    const next = this.scenes[key];
    this._current = next;
    next.show();
    this.layout();
  }

  layout() {
    this._current?.layout();
  }
}
