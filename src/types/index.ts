/**
 * Core application types and interfaces
 * @fileoverview Centralized type definitions for the PixiJS TypeScript assignment
 */

import * as PIXI from 'pixi.js';

// ============================================================================
// SCENE MANAGEMENT TYPES
// ============================================================================

/**
 * Available scene keys for the application
 */
export type SceneKey = 'ace' | 'magic' | 'phoenix';

/**
 * Base interface for all scenes in the application
 * Ensures consistent scene lifecycle management
 */
export interface IScene {
  /** PIXI Container representing the scene's visual hierarchy */
  view: PIXI.Container;
  
  /** Called when scene becomes active */
  show(): void;
  
  /** Called when scene becomes inactive */
  hide(): void;
  
  /** Called when application layout changes (resize, orientation) */
  layout(): void;
  
  /** Optional cleanup method for scene resources */
  destroy?(): void;
  
  /** Optional restart method for scene reset */
  restart?(): void;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

/**
 * Menu item configuration
 */
export interface MenuItem {
  /** Display label for the menu item */
  label: string;
  /** Scene key to navigate to when selected */
  sceneKey: SceneKey;
}

/**
 * Base interface for UI components
 */
export interface IUIComponent {
  /** PIXI Container representing the component's visual hierarchy */
  view: PIXI.Container;
  
  /** Called when application layout changes */
  layout(): void;
  
  /** Optional cleanup method */
  destroy?(): void;
}

// ============================================================================
// RESPONSIVE DESIGN TYPES
// ============================================================================

/**
 * Device breakpoint definitions
 */
export enum DeviceBreakpoint {
  MOBILE = 768,
  TABLET = 1024,
  DESKTOP = 1200
}

/**
 * Device type classification
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Responsive configuration for UI elements
 */
export interface ResponsiveConfig {
  mobile: Record<string, any>;
  tablet: Record<string, any>;
  desktop: Record<string, any>;
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

/**
 * Easing function type for animations
 */
export type EasingFunction = (t: number) => number;

/**
 * Tween animation configuration
 */
export interface TweenConfig {
  /** Target object to animate */
  target: any;
  /** Destination values */
  to: Record<string, number>;
  /** Animation duration in milliseconds */
  duration: number;
  /** Easing function */
  easing?: EasingFunction;
  /** Optional condition to check during animation */
  checkTarget?: () => boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
}

// ============================================================================
// SCENE-SPECIFIC TYPES
// ============================================================================

/**
 * Card configuration for Ace of Shadows scene
 */
export interface CardConfig {
  width: number;
  height: number;
  overlap: number;
  totalCards: number;
  cardsPerStack: number;
}

/**
 * Chat message structure for Magic Words scene
 */
export interface ChatMessage {
  name: string;
  text: string;
}

/**
 * Avatar configuration for Magic Words scene
 */
export interface Avatar {
  name: string;
  url: string;
  position: 'left' | 'right';
}

/**
 * Emoji configuration for Magic Words scene
 */
export interface Emoji {
  name: string;
  url: string;
}

/**
 * Chat data structure from API
 */
export interface ChatData {
  dialogue: ChatMessage[];
  emojies: Emoji[];
  avatars: Avatar[];
}

/**
 * Particle configuration for Phoenix Flame scene
 */
export interface ParticleConfig {
  maxSprites: number;
  emitterX: number;
  emitterY: number;
  windStrength: number;
  windDirection: number;
}

/**
 * Individual flame particle properties
 */
export interface FlameParticle {
  spr: PIXI.Sprite;
  vx: number;
  vy: number;
  life: number;
  lifeMax: number;
  scaleStart: number;
  scaleEnd: number;
  rot: number;
  rotSpeed: number;
  flickerSpeed: number;
  flickerPhase: number;
  colorPhase: number;
  intensity: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Application configuration
 */
export interface AppConfig {
  backgroundColor: number;
  antialias: boolean;
  resizeTo: Window | HTMLElement;
}

/**
 * Error handling types
 */
export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  timestamp: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

/**
 * Magic Words API endpoint configuration
 */
export interface MagicWordsApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}
