/**
 * Animation and tweening utilities
 * @fileoverview Provides smooth animations and easing functions for PIXI.js objects
 */

import { EasingFunction, TweenConfig } from '../types';
import { safeSync, ErrorCode } from './ErrorHandler';

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

/**
 * Linear easing (no easing)
 */
export const linear: EasingFunction = (t: number) => t;

/**
 * Ease in quadratic
 */
export const easeInQuad: EasingFunction = (t: number) => t * t;

/**
 * Ease out quadratic
 */
export const easeOutQuad: EasingFunction = (t: number) => t * (2 - t);

/**
 * Ease in-out quadratic
 */
export const easeInOutQuad: EasingFunction = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/**
 * Ease in cubic
 */
export const easeInCubic: EasingFunction = (t: number) => t * t * t;

/**
 * Ease out cubic
 */
export const easeOutCubic: EasingFunction = (t: number) => (--t) * t * t + 1;

/**
 * Ease in-out cubic
 */
export const easeInOutCubic: EasingFunction = (t: number) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

/**
 * Ease in-out sine
 */
export const easeInOutSine: EasingFunction = (t: number) =>
  -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Ease in-out back (with overshoot)
 */
export const easeInOutBack: EasingFunction = (t: number) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

// ============================================================================
// TWEEN CLASS
// ============================================================================

/**
 * Tween animation class for smooth property transitions
 */
export class Tween {
  private static tweens: Tween[] = [];
  private static animationId?: number;
  private static isRunning = false;

  private startTime: number;
  private duration: number;
  private from: Record<string, number>;
  private to: Record<string, number>;
  private target: any;
  private easing: EasingFunction;
  private onComplete?: () => void;
  private onUpdate?: (progress: number) => void;
  private checkTarget?: () => boolean;
  private finished = false;
  private paused = false;
  private pauseTime = 0;

  /**
   * Creates a new tween animation
   * 
   * @param config - Tween configuration object
   */
  constructor(config: TweenConfig) {
    const {
      target,
      to,
      duration,
      easing = easeInOutQuad,
      checkTarget,
      onComplete,
    } = config;

    this.target = target;
    this.duration = duration;
    this.easing = easing;
    this.onComplete = onComplete;
    this.checkTarget = checkTarget;
    this.from = {};
    this.to = { ...to };

    // Initialize from values
    for (const key of Object.keys(to)) {
      this.from[key] = Number(target[key]) || 0;
    }

    this.startTime = performance.now();
    Tween.tweens.push(this);

    // Start animation loop if not already running
    if (!Tween.isRunning) {
      Tween.startAnimationLoop();
    }
  }

  /**
   * Creates a tween with simplified parameters (backward compatibility)
   */
  static create(
    target: any,
    to: Record<string, number>,
    duration: number,
    easing: EasingFunction = easeInOutQuad,
    checkTarget?: () => boolean,
    onComplete?: () => void
  ): Tween {
    return new Tween({
      target,
      to,
      duration,
      easing,
      checkTarget,
      onComplete,
    });
  }

  /**
   * Dynamically update one or more destination values
   * 
   * @param newTo - New destination values
   * @param resetTime - Whether to restart the animation timing
   */
  updateTarget(newTo: Record<string, number>, resetTime = false): void {
    try {
      // Update destination values
      for (const key of Object.keys(newTo)) {
        this.to[key] = newTo[key];
        this.from[key] = Number(this.target[key]) || 0;
      }

      if (resetTime) {
        this.startTime = performance.now();
        this.pauseTime = 0;
      }
    } catch (error) {
      console.error('Error updating tween target:', error);
    }
  }

  /**
   * Pause the tween animation
   */
  pause(): void {
    if (!this.paused) {
      this.pauseTime = performance.now();
      this.paused = true;
    }
  }

  /**
   * Resume the tween animation
   */
  resume(): void {
    if (this.paused) {
      this.startTime += performance.now() - this.pauseTime;
      this.paused = false;
    }
  }

  /**
   * Stop and remove the tween
   */
  stop(): void {
    this.finished = true;
    const index = Tween.tweens.indexOf(this);
    if (index > -1) {
      Tween.tweens.splice(index, 1);
    }
  }

  /**
   * Update the tween animation
   * 
   * @param now - Current timestamp
   * @returns Whether the tween is still active
   */
  update(now: number): boolean {
    if (this.finished || this.paused) return !this.finished;

    // Check if target is still valid
    if (this.checkTarget && !this.checkTarget()) {
      this.stop();
      return false;
    }

    const elapsed = now - this.startTime;
    const progress = Math.min(1, elapsed / this.duration);
    const easedProgress = this.easing(progress);

    // Update target properties
    for (const key of Object.keys(this.to)) {
      const value = this.from[key] + (this.to[key] - this.from[key]) * easedProgress;
      this.target[key] = value;
    }

    // Call update callback
    if (this.onUpdate) {
      safeSync(() => this.onUpdate!(progress), ErrorCode.ANIMATION_ERROR);
    }

    // Check if animation is complete
    if (progress >= 1) {
      this.finished = true;
      if (this.onComplete) {
        safeSync(this.onComplete, ErrorCode.ANIMATION_ERROR);
      }
      return false;
    }

    return true;
  }

  /**
   * Get the current progress of the tween (0-1)
   */
  getProgress(): number {
    if (this.finished) return 1;
    if (this.paused) return (this.pauseTime - this.startTime) / this.duration;
    return Math.min(1, (performance.now() - this.startTime) / this.duration);
  }

  /**
   * Check if the tween is finished
   */
  isFinished(): boolean {
    return this.finished;
  }

  /**
   * Check if the tween is paused
   */
  isPaused(): boolean {
    return this.paused;
  }

  // ============================================================================
  // STATIC METHODS
  // ============================================================================

  /**
   * Update all active tweens
   */
  static tick(): void {
    const now = performance.now();
    Tween.tweens = Tween.tweens.filter(tween => tween.update(now));
  }

  /**
   * Start the animation loop
   */
  private static startAnimationLoop(): void {
    if (Tween.isRunning) return;
    
    Tween.isRunning = true;
    
    const animate = () => {
      Tween.tick();
      
      if (Tween.tweens.length > 0) {
        Tween.animationId = requestAnimationFrame(animate);
      } else {
        Tween.isRunning = false;
        Tween.animationId = undefined;
      }
    };
    
    Tween.animationId = requestAnimationFrame(animate);
  }

  /**
   * Stop all tweens
   */
  static stopAll(): void {
    Tween.tweens.forEach(tween => tween.stop());
    Tween.tweens = [];
  }

  /**
   * Pause all tweens
   */
  static pauseAll(): void {
    Tween.tweens.forEach(tween => tween.pause());
  }

  /**
   * Resume all tweens
   */
  static resumeAll(): void {
    Tween.tweens.forEach(tween => tween.resume());
  }

  /**
   * Get the number of active tweens
   */
  static getActiveCount(): number {
    return Tween.tweens.length;
  }

  /**
   * Clean up resources
   */
  static destroy(): void {
    Tween.stopAll();
    if (Tween.animationId) {
      cancelAnimationFrame(Tween.animationId);
      Tween.animationId = undefined;
    }
    Tween.isRunning = false;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Animate a single property
 */
export function animateProperty(
  target: any,
  property: string,
  toValue: number,
  duration: number,
  easing: EasingFunction = easeInOutQuad
): Tween {
  return new Tween({
    target,
    to: { [property]: toValue },
    duration,
    easing,
  });
}

/**
 * Animate multiple properties
 */
export function animateProperties(
  target: any,
  properties: Record<string, number>,
  duration: number,
  easing: EasingFunction = easeInOutQuad
): Tween {
  return new Tween({
    target,
    to: properties,
    duration,
    easing,
  });
}

/**
 * Create a delayed tween
 */
export function delayedTween(
  config: TweenConfig,
  delay: number
): Tween {
  const tween = new Tween({
    ...config,
    duration: config.duration + delay,
  });
  
  // Override the easing to add delay
  const originalEasing = config.easing || easeInOutQuad;
  tween['easing'] = (t: number) => {
    if (t < delay / (config.duration + delay)) {
      return 0;
    }
    const adjustedT = (t - delay / (config.duration + delay)) / (config.duration / (config.duration + delay));
    return originalEasing(adjustedT);
  };
  
  return tween;
}