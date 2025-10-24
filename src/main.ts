/**
 * Main application entry point
 * @fileoverview Initializes the PixiJS application and sets up the scene management system
 */

import * as PIXI from 'pixi.js';
import { SceneManager } from './sceneManager';
import { Menu } from './ui/Menu';
import { FPSCounter } from './utils/FPSCounter';
import { setupAutoResize } from './utils/Resize';
import { setupGlobalErrorHandling } from './utils/ErrorHandler';
import { CONFIG } from './config';
import type { SceneKey } from './types';

/**
 * Main application class
 */
class PixiApplication {
  private app!: PIXI.Application;
  private sceneManager!: SceneManager;
  private menu!: Menu;
  private fpsCounter!: FPSCounter;
  private fullscreenOverlay!: HTMLElement;
  private cleanupResize?: () => void;

  constructor() {
    this.initializeApplication();
    this.setupFullscreen();
    this.setupSceneManagement();
    this.setupUI();
    this.setupResizeHandling();
    this.startDefaultScene();
  }

  /**
   * Initializes the PIXI Application with configuration
   */
  private initializeApplication(): void {
    try {
      this.app = new PIXI.Application({
        backgroundColor: CONFIG.APP.backgroundColor,
        resizeTo: CONFIG.APP.resizeTo,
        antialias: CONFIG.APP.antialias,
      });

      // Append canvas to DOM
      const appDiv = document.getElementById('app');
      if (!appDiv) {
        throw new Error('App container element not found');
      }
      
      appDiv.appendChild(this.app.view as HTMLCanvasElement);
      
      console.log('PIXI Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PIXI Application:', error);
      throw error;
    }
  }

  /**
   * Sets up fullscreen functionality
   */
  private setupFullscreen(): void {
    const overlay = document.getElementById('enter-fullscreen');
    if (!overlay) {
      console.warn('Fullscreen overlay element not found');
      return;
    }
    this.fullscreenOverlay = overlay;

    const enterFullscreen = async (): Promise<void> => {
      try {
        this.fullscreenOverlay.classList.add('hidden');
        
        // Always try to enter fullscreen
        const elem = document.documentElement as any;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        }
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    };

    // Add event listeners for both click and touch
    this.fullscreenOverlay.addEventListener('click', enterFullscreen);
    this.fullscreenOverlay.addEventListener('touchstart', enterFullscreen, { passive: true });
  }

  /**
   * Sets up scene management system
   */
  private setupSceneManagement(): void {
    this.sceneManager = new SceneManager(this.app);
    this.app.stage.addChild(this.sceneManager.view);
  }

  /**
   * Sets up UI components (menu and FPS counter)
   */
  private setupUI(): void {
    // Create menu with scene options
    const menuItems = [
      { label: 'Ace of Shadows', sceneKey: 'ace' as SceneKey },
      { label: 'Magic Words', sceneKey: 'magic' as SceneKey },
      { label: 'Phoenix Flame', sceneKey: 'phoenix' as SceneKey },
    ];

    this.menu = new Menu(this.app, menuItems, (sceneKey: SceneKey) => {
      this.sceneManager.show(sceneKey);
    });
    this.app.stage.addChild(this.menu.view);

    // Create FPS counter
    this.fpsCounter = new FPSCounter(this.app);
    this.app.stage.addChild(this.fpsCounter.view);
  }

  /**
   * Sets up responsive resize handling
   */
  private setupResizeHandling(): void {
    this.cleanupResize = setupAutoResize(this.app, () => {
      this.menu.layout();
      this.fpsCounter.layout();
      this.sceneManager.layout();
    });
  }

  /**
   * Starts the default scene
   */
  private startDefaultScene(): void {
    this.sceneManager.show('ace');
  }

  /**
   * Cleanup method for proper resource management
   */
  public destroy(): void {
    try {
      // Cleanup resize handler
      this.cleanupResize?.();
      
      // Cleanup UI components
      this.menu.destroy?.();
      this.fpsCounter.destroy();
      
      // Cleanup scene manager
      this.sceneManager.destroy?.();
      
      // Destroy PIXI application
      this.app.destroy(true, { children: true });
      
      console.log('Application destroyed successfully');
    } catch (error) {
      console.error('Error during application cleanup:', error);
    }
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initialize the application when DOM is ready
 */
function initializeApp(): void {
  try {
    // Set up global error handling
    setupGlobalErrorHandling();
    
    // Create and initialize the application
    const app = new PixiApplication();
    
    // Make app globally accessible for debugging
    (window as any).pixiApp = app;
    
    console.log('PixiJS TypeScript Assignment initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      text-align: center;
      z-index: 1000;
    `;
    errorDiv.textContent = 'Failed to initialize application. Please refresh the page.';
    document.body.appendChild(errorDiv);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}