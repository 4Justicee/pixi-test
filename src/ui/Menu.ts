
/**
 * Menu UI component
 * @fileoverview Responsive navigation menu for scene selection
 */

import * as PIXI from 'pixi.js';
import { SceneKey, MenuItem, IUIComponent } from '../types';
import { CONFIG, getResponsiveConfig, isMobile } from '../config';
import { safeSync, ErrorCode } from '../utils/ErrorHandler';

/**
 * Menu component for scene navigation
 */
export class Menu implements IUIComponent {
  public view = new PIXI.Container();
  private items: MenuItem[];
  private app: PIXI.Application;
  private onSelect: (key: SceneKey) => void;
  private buttons: PIXI.Container[] = [];
  private resizeHandler?: () => void;

  constructor(app: PIXI.Application, items: MenuItem[], onSelect: (key: SceneKey) => void) {
    this.app = app;
    this.items = items;
    this.onSelect = onSelect;
    
    this.build();
    this.setupResizeHandling();
  }

  /**
   * Builds the menu UI elements
   */
  private build(): void {
    try {
      // Clear existing buttons
      this.view.removeChildren();
      this.buttons = [];

      const config = getResponsiveConfig();
      const padding = 12;
      let y = 16;

      for (const item of this.items) {
        const button = this.createButton(item.label, () => {
          this.handleButtonClick(item.sceneKey);
        });
        
        button.y = y;
        y += button.height + padding;
        
        this.view.addChild(button);
        this.buttons.push(button);
      }

      console.log(`Menu built with ${this.items.length} items`);
    } catch (error) {
      console.error('Error building menu:', error);
    }
  }

  /**
   * Creates a single menu button
   */
  private createButton(label: string, onClick: () => void): PIXI.Container {
    const container = new PIXI.Container();
    const background = new PIXI.Graphics();
    
    const config = getResponsiveConfig();
    
    // Button dimensions based on device type
    const buttonWidth = isMobile() 
      ? Math.min(160, window.innerWidth * 0.4)
      : CONFIG.UI.MENU.buttonWidth;
    
    const buttonHeight = isMobile() ? 36 : CONFIG.UI.MENU.buttonHeight;
    const cornerRadius = isMobile() ? 8 : CONFIG.UI.MENU.cornerRadius;
    const fontSize = isMobile() ? 14 : CONFIG.UI.MENU.fontSize;
    const paddingX = isMobile() ? 12 : CONFIG.UI.MENU.buttonPadding;
    const paddingY = isMobile() ? 8 : CONFIG.UI.MENU.buttonPadding;
    
    // Draw button background
    background.beginFill(CONFIG.UI.MENU.backgroundColor, CONFIG.UI.MENU.backgroundAlpha);
    background.drawRoundedRect(0, 0, buttonWidth, buttonHeight, cornerRadius);
    background.endFill();
    
    // Create text
    const text = new PIXI.Text(label, new PIXI.TextStyle({
      fill: 0xffffff,
      fontSize: fontSize,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '500',
    }));
    
    text.x = paddingX;
    text.y = paddingY;

    container.addChild(background, text);
    
    // Make interactive
    container.interactive = true;
    container.cursor = 'pointer';
    
    // Event handlers
    container.on('pointertap', onClick);
    container.on('pointerover', () => {
      background.alpha = 1;
      text.style.fill = 0xffffff;
    });
    container.on('pointerout', () => {
      background.alpha = CONFIG.UI.MENU.backgroundAlpha;
      text.style.fill = 0xffffff;
    });
    container.on('pointerdown', () => {
      background.alpha = 0.8;
    });
    container.on('pointerup', () => {
      background.alpha = 1;
    });

    return container;
  }

  /**
   * Handles button click events
   */
  private handleButtonClick(sceneKey: SceneKey): void {
    try {
      safeSync(() => this.onSelect(sceneKey), ErrorCode.UNKNOWN_ERROR);
    } catch (error) {
      console.error(`Error handling menu click for scene '${sceneKey}':`, error);
    }
  }

  /**
   * Sets up responsive resize handling
   */
  private setupResizeHandling(): void {
    this.resizeHandler = () => {
      this.handleResize();
    };
    
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Handles window resize events
   */
  private handleResize(): void {
    try {
      // Rebuild menu with new responsive dimensions
      this.build();
      this.layout();
    } catch (error) {
      console.error('Error handling menu resize:', error);
    }
  }

  /**
   * Updates menu layout for responsive positioning
   */
  public layout(): void {
    try {
      if (isMobile()) {
        // Mobile: position menu at top-right to avoid overlapping game area
        this.view.x = window.innerWidth - Math.min(180, window.innerWidth * 0.45);
        this.view.y = 8;
      } else {
        // Desktop: stick to top-left with some padding
        this.view.x = 12;
        this.view.y = 12;
      }
    } catch (error) {
      safeSync(() => {
        console.error('Error in menu layout:', error);
      }, ErrorCode.RESIZE_ERROR);
    }
  }

  /**
   * Updates menu items
   */
  public updateItems(newItems: MenuItem[]): void {
    try {
      this.items = newItems;
      this.build();
      this.layout();
    } catch (error) {
      console.error('Error updating menu items:', error);
    }
  }

  /**
   * Highlights a specific menu item
   */
  public highlightItem(sceneKey: SceneKey): void {
    try {
      const itemIndex = this.items.findIndex(item => item.sceneKey === sceneKey);
      if (itemIndex >= 0 && itemIndex < this.buttons.length) {
        const button = this.buttons[itemIndex];
        const background = button.children[0] as PIXI.Graphics;
        background.alpha = 1;
      }
    } catch (error) {
      console.error('Error highlighting menu item:', error);
    }
  }

  /**
   * Removes highlight from all menu items
   */
  public clearHighlight(): void {
    try {
      for (const button of this.buttons) {
        const background = button.children[0] as PIXI.Graphics;
        background.alpha = CONFIG.UI.MENU.backgroundAlpha;
      }
    } catch (error) {
      console.error('Error clearing menu highlight:', error);
    }
  }

  /**
   * Shows/hides the menu
   */
  public setVisible(visible: boolean): void {
    this.view.visible = visible;
  }

  /**
   * Gets the current menu items
   */
  public getItems(): MenuItem[] {
    return [...this.items];
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    try {
      // Remove resize listener
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
      }
      
      // Clear buttons
      this.buttons = [];
      
      // Remove all children
      this.view.removeChildren();
      
      console.log('Menu destroyed successfully');
    } catch (error) {
      console.error('Error destroying menu:', error);
    }
  }
}
