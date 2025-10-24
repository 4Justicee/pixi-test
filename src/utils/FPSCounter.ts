
/**
 * FPS Counter utility for performance monitoring
 * @fileoverview Displays real-time frame rate information with performance metrics
 */

import * as PIXI from 'pixi.js';
import { IUIComponent, PerformanceMetrics } from '../types';
import { CONFIG } from '../config';
import { safeSync, ErrorCode } from './ErrorHandler';

/**
 * FPS Counter component with enhanced performance monitoring
 */
export class FPSCounter implements IUIComponent {
  public view = new PIXI.Container();
  private app: PIXI.Application;
  private label!: PIXI.Text;
  private background!: PIXI.Graphics;
  private lastTime = performance.now();
  private frames = 0;
  private fps = 0;
  private frameTime = 0;
  private frameTimes: number[] = [];
  private maxFrameTimeSamples = 60; // Keep last 60 frame times
  private updateInterval: number = CONFIG.UI.FPS_COUNTER.updateInterval;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.createUI();
    this.setupTicker();
  }

  /**
   * Creates the FPS counter UI elements
   */
  private createUI(): void {
    const config = CONFIG.UI.FPS_COUNTER;
    
    // Create background
    this.background = new PIXI.Graphics();
    this.background.beginFill(config.backgroundColor, config.backgroundAlpha);
    this.background.drawRoundedRect(0, 0, config.width, config.height, config.cornerRadius);
    this.background.endFill();
    
    // Create text label
    this.label = new PIXI.Text('FPS: --', new PIXI.TextStyle({
      fill: 0xffffff,
      fontSize: config.fontSize,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 'bold',
    }));
    
    this.label.x = 8;
    this.label.y = 6;
    
    this.view.addChild(this.background, this.label);
  }

  /**
   * Sets up the performance monitoring ticker
   */
  private setupTicker(): void {
    this.app.ticker.add(this.tick);
  }

  /**
   * Updates FPS calculation and display
   */
  private tick = (): void => {
    try {
      this.frames++;
      const now = performance.now();
      const deltaTime = now - this.lastTime;
      
      // Track frame times for average calculation
      this.frameTimes.push(deltaTime);
      if (this.frameTimes.length > this.maxFrameTimeSamples) {
        this.frameTimes.shift();
      }
      
      // Update FPS every update interval
      if (deltaTime >= this.updateInterval) {
        this.fps = Math.round((this.frames * 1000) / deltaTime);
        this.frameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        
        this.updateDisplay();
        
        this.frames = 0;
        this.lastTime = now;
      }
    } catch (error) {
      safeSync(() => {
        console.error('Error in FPS counter tick:', error);
      }, ErrorCode.ANIMATION_ERROR);
    }
  };

  /**
   * Updates the display text with current performance metrics
   */
  private updateDisplay(): void {
    try {
      const frameTimeMs = Math.round(this.frameTime * 100) / 100;
      this.label.text = `FPS: ${this.fps}`;
      
      // Change color based on performance
      if (this.fps < 30) {
        this.label.style.fill = 0xff4444; // Red for poor performance
      } else if (this.fps < 50) {
        this.label.style.fill = 0xffaa44; // Orange for moderate performance
      } else {
        this.label.style.fill = 0x44ff44; // Green for good performance
      }
    } catch (error) {
      console.error('Error updating FPS display:', error);
    }
  }

  /**
   * Gets current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
    };
  }

  /**
   * Gets average frame time over the last N frames
   */
  public getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }

  /**
   * Gets the minimum frame time in the current sample
   */
  public getMinFrameTime(): number {
    return this.frameTimes.length > 0 ? Math.min(...this.frameTimes) : 0;
  }

  /**
   * Gets the maximum frame time in the current sample
   */
  public getMaxFrameTime(): number {
    return this.frameTimes.length > 0 ? Math.max(...this.frameTimes) : 0;
  }

  /**
   * Resets performance metrics
   */
  public reset(): void {
    this.frames = 0;
    this.fps = 0;
    this.frameTime = 0;
    this.frameTimes = [];
    this.lastTime = performance.now();
    this.updateDisplay();
  }

  /**
   * Sets the update interval for FPS calculation
   */
  public setUpdateInterval(interval: number): void {
    this.updateInterval = Math.max(100, interval); // Minimum 100ms
  }

  /**
   * Layout method for responsive positioning
   */
  public layout(): void {
    try {
      // Position FPS counter in top-left area, avoiding menu
      this.view.x = 110; // Leave space for menu
      this.view.y = 12;
    } catch (error) {
      safeSync(() => {
        console.error('Error in FPS counter layout:', error);
      }, ErrorCode.RESIZE_ERROR);
    }
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    try {
      this.app.ticker.remove(this.tick);
      this.view.removeChildren();
      this.frameTimes = [];
    } catch (error) {
      console.error('Error destroying FPS counter:', error);
    }
  }
}
