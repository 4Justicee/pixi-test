
/**
 * Scene management system
 * @fileoverview Handles scene lifecycle, transitions, and state management
 */

import * as PIXI from 'pixi.js';
import { AceOfShadowsScene } from './scenes/AceOfShadowsScene';
import { MagicWordsScene } from './scenes/MagicWordsScene';
import { PhoenixFlameScene } from './scenes/PhoenixFlameScene';
import { SceneKey, IScene } from './types';
import { safeSync, ErrorCode } from './utils/ErrorHandler';

/**
 * Scene manager class for handling scene transitions and lifecycle
 */
export class SceneManager {
  public view = new PIXI.Container();
  private app: PIXI.Application;
  private scenes!: Record<SceneKey, IScene>;
  private currentScene?: IScene;
  private sceneHistory: SceneKey[] = [];
  private maxHistorySize = 10;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.initializeScenes();
  }

  /**
   * Initializes all available scenes
   */
  private initializeScenes(): void {
    try {
      this.scenes = {
        ace: new AceOfShadowsScene(this.app),
        magic: new MagicWordsScene(this.app),
        phoenix: new PhoenixFlameScene(this.app),
      };

      // Add all scenes to the view and hide them initially
      for (const [key, scene] of Object.entries(this.scenes)) {
        scene.hide();
        this.view.addChild(scene.view);
      }

      console.log('Scenes initialized successfully');
    } catch (error) {
      console.error('Failed to initialize scenes:', error);
      throw error;
    }
  }

  /**
   * Shows a specific scene and hides the current one
   * 
   * @param key - The scene key to show
   * @param addToHistory - Whether to add this transition to history
   */
  public show(key: SceneKey, addToHistory = true): void {
    try {
      const targetScene = this.scenes[key];
      if (!targetScene) {
        throw new Error(`Scene '${key}' not found`);
      }

      // Hide current scene
      if (this.currentScene) {
        safeSync(() => this.currentScene!.hide(), ErrorCode.SCENE_LOAD_FAILED);
      }

      // Show target scene
      this.currentScene = targetScene;
      safeSync(() => targetScene.show(), ErrorCode.SCENE_LOAD_FAILED);

      // Add to history if requested
      if (addToHistory) {
        this.addToHistory(key);
      }

      // Restart scene if it has a restart method
      if ('restart' in targetScene && typeof targetScene.restart === 'function') {
        safeSync(() => (targetScene as any).restart(), ErrorCode.SCENE_LOAD_FAILED);
      }

      // Update layout
      this.layout();

      console.log(`Switched to scene: ${key}`);
    } catch (error) {
      console.error(`Failed to show scene '${key}':`, error);
    }
  }

  /**
   * Gets the current active scene key
   */
  public getCurrentSceneKey(): SceneKey | null {
    for (const [key, scene] of Object.entries(this.scenes)) {
      if (scene === this.currentScene) {
        return key as SceneKey;
      }
    }
    return null;
  }

  /**
   * Gets the current active scene
   */
  public getCurrentScene(): IScene | undefined {
    return this.currentScene;
  }

  /**
   * Checks if a scene is currently active
   */
  public isSceneActive(key: SceneKey): boolean {
    return this.currentScene === this.scenes[key];
  }

  /**
   * Gets all available scene keys
   */
  public getAvailableScenes(): SceneKey[] {
    return Object.keys(this.scenes) as SceneKey[];
  }

  /**
   * Adds a scene transition to history
   */
  private addToHistory(key: SceneKey): void {
    this.sceneHistory.push(key);
    
    // Keep history size manageable
    if (this.sceneHistory.length > this.maxHistorySize) {
      this.sceneHistory.shift();
    }
  }

  /**
   * Gets the scene history
   */
  public getHistory(): SceneKey[] {
    return [...this.sceneHistory];
  }

  /**
   * Clears the scene history
   */
  public clearHistory(): void {
    this.sceneHistory = [];
  }

  /**
   * Goes back to the previous scene in history
   */
  public goBack(): boolean {
    if (this.sceneHistory.length < 2) {
      return false;
    }

    // Remove current scene from history
    this.sceneHistory.pop();
    
    // Get previous scene
    const previousScene = this.sceneHistory[this.sceneHistory.length - 1];
    if (previousScene) {
      this.show(previousScene, false);
      return true;
    }

    return false;
  }

  /**
   * Updates layout for the current scene
   */
  public layout(): void {
    try {
      if (this.currentScene) {
        safeSync(() => this.currentScene!.layout(), ErrorCode.RESIZE_ERROR);
      }
    } catch (error) {
      console.error('Error during scene layout:', error);
    }
  }

  /**
   * Pauses all scenes (if they support it)
   */
  public pauseAll(): void {
    for (const scene of Object.values(this.scenes)) {
      if ('pause' in scene && typeof scene.pause === 'function') {
        safeSync(() => (scene as any).pause(), ErrorCode.SCENE_LOAD_FAILED);
      }
    }
  }

  /**
   * Resumes all scenes (if they support it)
   */
  public resumeAll(): void {
    for (const scene of Object.values(this.scenes)) {
      if ('resume' in scene && typeof scene.resume === 'function') {
        safeSync(() => (scene as any).resume(), ErrorCode.SCENE_LOAD_FAILED);
      }
    }
  }

  /**
   * Restarts all scenes (if they support it)
   */
  public restartAll(): void {
    for (const scene of Object.values(this.scenes)) {
      if ('restart' in scene && typeof scene.restart === 'function') {
        safeSync(() => (scene as any).restart(), ErrorCode.SCENE_LOAD_FAILED);
      }
    }
  }

  /**
   * Cleanup method for proper resource management
   */
  public destroy(): void {
    try {
      // Hide current scene
      if (this.currentScene) {
        this.currentScene.hide();
      }

      // Destroy all scenes
      for (const scene of Object.values(this.scenes)) {
        if ('destroy' in scene && typeof scene.destroy === 'function') {
          safeSync(() => (scene as any).destroy(), ErrorCode.SCENE_LOAD_FAILED);
        }
      }

      // Clear history
      this.sceneHistory = [];
      this.currentScene = undefined;

      console.log('Scene manager destroyed successfully');
    } catch (error) {
      console.error('Error during scene manager cleanup:', error);
    }
  }
}
