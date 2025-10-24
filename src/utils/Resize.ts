
/**
 * Resize handling utilities for PIXI.js applications
 * @fileoverview Manages responsive behavior and layout updates
 */

import * as PIXI from 'pixi.js';
import { safeSync, ErrorCode } from './ErrorHandler';

/**
 * Configuration options for auto-resize functionality
 */
export interface ResizeOptions {
  /** Whether to debounce resize events */
  debounce?: boolean;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Whether to handle orientation changes */
  handleOrientation?: boolean;
}

/**
 * Resize manager for handling responsive behavior
 */
export class ResizeManager {
  private static instance: ResizeManager;
  private resizeHandlers: Set<() => void> = new Set();
  private debounceTimer?: number;
  private readonly DEFAULT_DEBOUNCE_DELAY = 100; // ms

  private constructor() {}

  public static getInstance(): ResizeManager {
    if (!ResizeManager.instance) {
      ResizeManager.instance = new ResizeManager();
    }
    return ResizeManager.instance;
  }

  /**
   * Adds a resize handler to be called when the window resizes
   * 
   * @param handler - Function to call on resize
   * @returns Function to remove the handler
   */
  public addResizeHandler(handler: () => void): () => void {
    this.resizeHandlers.add(handler);
    
    return () => {
      this.resizeHandlers.delete(handler);
    };
  }

  /**
   * Triggers all registered resize handlers
   */
  public triggerResize(): void {
    this.resizeHandlers.forEach(handler => {
      safeSync(handler, ErrorCode.RESIZE_ERROR, { handler: handler.name });
    });
  }

  /**
   * Debounced resize handler
   */
  private debouncedResize = (): void => {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.triggerResize();
    }, this.DEFAULT_DEBOUNCE_DELAY);
  };

  /**
   * Sets up global resize handling
   */
  public setupGlobalResize(options: ResizeOptions = {}): void {
    const { debounce = true, handleOrientation = true } = options;
    
    const resizeHandler = debounce ? this.debouncedResize : this.triggerResize;
    
    window.addEventListener('resize', resizeHandler);
    
    if (handleOrientation) {
      window.addEventListener('orientationchange', () => {
        // Delay to ensure orientation change is complete
        setTimeout(resizeHandler, 100);
      });
    }
  }

  /**
   * Cleans up resize handlers
   */
  public destroy(): void {
    this.resizeHandlers.clear();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

/**
 * Sets up automatic resize handling for a PIXI Application
 * 
 * @param app - The PIXI Application instance
 * @param onResize - Optional callback to execute on resize
 * @param options - Configuration options for resize handling
 */
export function setupAutoResize(
  app: PIXI.Application,
  onResize?: () => void,
  options: ResizeOptions = {}
): () => void {
  const resizeManager = ResizeManager.getInstance();
  
  const handleResize = () => {
    try {
      // Resize the renderer to match window dimensions
      app.renderer.resize(window.innerWidth, window.innerHeight);
      
      // Call the provided callback
      onResize?.();
    } catch (error) {
      console.error('Error during resize:', error);
    }
  };

  // Add the resize handler
  const removeHandler = resizeManager.addResizeHandler(handleResize);
  
  // Set up global resize handling
  resizeManager.setupGlobalResize(options);
  
  // Trigger initial resize
  handleResize();
  
  // Return cleanup function
  return () => {
    removeHandler();
  };
}

/**
 * Utility function to get current viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Utility function to check if device is in landscape orientation
 */
export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight;
}

/**
 * Utility function to check if device is in portrait orientation
 */
export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}
