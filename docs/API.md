# API Reference

Complete API documentation for the PixiJS TypeScript Assignment project.

## 📚 Table of Contents

- [Core Types](#core-types)
- [Configuration](#configuration)
- [Scene Management](#scene-management)
- [UI Components](#ui-components)
- [Utilities](#utilities)
- [Animation System](#animation-system)
- [Error Handling](#error-handling)

## 🔧 Core Types

### SceneKey
```typescript
type SceneKey = 'ace' | 'magic' | 'phoenix';
```
Available scene identifiers for the application.

### IScene
```typescript
interface IScene {
  view: PIXI.Container;
  show(): void;
  hide(): void;
  layout(): void;
  destroy?(): void;
  restart?(): void;
}
```
Base interface for all scenes in the application.

### IUIComponent
```typescript
interface IUIComponent {
  view: PIXI.Container;
  layout(): void;
  destroy?(): void;
}
```
Base interface for UI components.

### MenuItem
```typescript
interface MenuItem {
  label: string;
  sceneKey: SceneKey;
}
```
Configuration for menu items.

## ⚙️ Configuration

### CONFIG
```typescript
const CONFIG = {
  APP: AppConfig,
  BREAKPOINTS: DeviceBreakpoint,
  SCENES: SceneConfigs,
  UI: UIConfigs,
  RESPONSIVE: ResponsiveConfigs,
  API: ApiConfigs,
  ANIMATION: AnimationConfigs,
  PERFORMANCE: PerformanceConfigs
};
```

### Device Detection
```typescript
function isMobile(): boolean
function isTablet(): boolean
function isDesktop(): boolean
function getDeviceType(): 'mobile' | 'tablet' | 'desktop'
function getResponsiveConfig(): ResponsiveConfig
```

## 🎭 Scene Management

### SceneManager Class

#### Constructor
```typescript
constructor(app: PIXI.Application)
```

#### Methods
```typescript
// Scene navigation
show(key: SceneKey, addToHistory?: boolean): void
goBack(): boolean

// Scene information
getCurrentSceneKey(): SceneKey | null
getCurrentScene(): IScene | undefined
isSceneActive(key: SceneKey): boolean
getAvailableScenes(): SceneKey[]

// History management
getHistory(): SceneKey[]
clearHistory(): void

// Scene control
pauseAll(): void
resumeAll(): void
restartAll(): void

// Layout and cleanup
layout(): void
destroy(): void
```

## 🎨 UI Components

### Menu Class

#### Constructor
```typescript
constructor(
  app: PIXI.Application,
  items: MenuItem[],
  onSelect: (key: SceneKey) => void
)
```

#### Methods
```typescript
// Layout and visibility
layout(): void
setVisible(visible: boolean): void

// Item management
updateItems(newItems: MenuItem[]): void
getItems(): MenuItem[]

// Visual feedback
highlightItem(sceneKey: SceneKey): void
clearHighlight(): void

// Cleanup
destroy(): void
```

### FPSCounter Class

#### Constructor
```typescript
constructor(app: PIXI.Application)
```

#### Methods
```typescript
// Performance metrics
getMetrics(): PerformanceMetrics
getAverageFrameTime(): number
getMinFrameTime(): number
getMaxFrameTime(): number

// Control
reset(): void
setUpdateInterval(interval: number): void

// Layout and cleanup
layout(): void
destroy(): void
```

## 🛠️ Utilities

### ImageLoader Class

#### Static Methods
```typescript
// Texture loading
static async loadTexture(
  url: string,
  options?: ImageLoadOptions
): Promise<PIXI.Texture>

// Batch loading
static async preloadTextures(
  urls: string[],
  options?: ImageLoadOptions
): Promise<PIXI.Texture[]>

// Cache management
static clearCache(): void
static getCacheSize(): number
static removeFromCache(url: string): boolean
```

### ResizeManager Class

#### Static Methods
```typescript
static getInstance(): ResizeManager
```

#### Instance Methods
```typescript
// Handler management
addResizeHandler(handler: () => void): () => void
triggerResize(): void

// Global setup
setupGlobalResize(options?: ResizeOptions): void

// Cleanup
destroy(): void
```

### Utility Functions
```typescript
// Resize handling
function setupAutoResize(
  app: PIXI.Application,
  onResize?: () => void,
  options?: ResizeOptions
): () => void

// Viewport utilities
function getViewportDimensions(): { width: number; height: number }
function isLandscape(): boolean
function isPortrait(): boolean
```

## 🎬 Animation System

### Tween Class

#### Constructor
```typescript
constructor(config: TweenConfig)
```

#### Static Methods
```typescript
// Creation
static create(
  target: any,
  to: Record<string, number>,
  duration: number,
  easing?: EasingFunction,
  checkTarget?: () => boolean,
  onComplete?: () => void
): Tween

// Global control
static stopAll(): void
static pauseAll(): void
static resumeAll(): void
static getActiveCount(): number
static destroy(): void
```

#### Instance Methods
```typescript
// Animation control
updateTarget(newTo: Record<string, number>, resetTime?: boolean): void
pause(): void
resume(): void
stop(): void

// Status
getProgress(): number
isFinished(): boolean
isPaused(): boolean
```

### Convenience Functions
```typescript
// Single property animation
function animateProperty(
  target: any,
  property: string,
  toValue: number,
  duration: number,
  easing?: EasingFunction
): Tween

// Multiple properties animation
function animateProperties(
  target: any,
  properties: Record<string, number>,
  duration: number,
  easing?: EasingFunction
): Tween

// Delayed animation
function delayedTween(
  config: TweenConfig,
  delay: number
): Tween
```

### Easing Functions
```typescript
const linear: EasingFunction
const easeInQuad: EasingFunction
const easeOutQuad: EasingFunction
const easeInOutQuad: EasingFunction
const easeInCubic: EasingFunction
const easeOutCubic: EasingFunction
const easeInOutCubic: EasingFunction
const easeInOutSine: EasingFunction
const easeInOutBack: EasingFunction
```

## 🐛 Error Handling

### ErrorLogger Class

#### Static Methods
```typescript
static getInstance(): ErrorLogger
```

#### Instance Methods
```typescript
// Logging
logError(error: Error | AppError, context?: Record<string, any>): void
logWarning(message: string, context?: Record<string, any>): void
logInfo(message: string, context?: Record<string, any>): void

// Error management
getErrors(): AppError[]
clearErrors(): void
```

### Error Types
```typescript
enum ErrorCode {
  SCENE_LOAD_FAILED = 'SCENE_LOAD_FAILED',
  TEXTURE_LOAD_FAILED = 'TEXTURE_LOAD_FAILED',
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  ANIMATION_ERROR = 'ANIMATION_ERROR',
  RESIZE_ERROR = 'RESIZE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

class AppError extends Error {
  code: ErrorCode
  timestamp: number
  context?: Record<string, any>
}
```

### Utility Functions
```typescript
// Safe operations
function safeAsync<T>(
  operation: () => Promise<T>,
  errorCode?: ErrorCode,
  context?: Record<string, any>
): Promise<T | null>

function safeSync<T>(
  operation: () => T,
  errorCode?: ErrorCode,
  context?: Record<string, any>
): T | null

// Global error handling
function setupGlobalErrorHandling(): void
```

## 📊 Performance Metrics

### PerformanceMetrics Interface
```typescript
interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
}
```

### Performance Configuration
```typescript
PERFORMANCE: {
  TARGET_FPS: 60,
  MAX_FRAME_TIME: 16.67,
  MEMORY_WARNING_THRESHOLD: 100 * 1024 * 1024
}
```

## 🔧 Configuration Options

### ImageLoadOptions
```typescript
interface ImageLoadOptions {
  crossOrigin?: boolean;
  timeout?: number;
  cache?: boolean;
}
```

### ResizeOptions
```typescript
interface ResizeOptions {
  debounce?: boolean;
  debounceDelay?: number;
  handleOrientation?: boolean;
}
```

### TweenConfig
```typescript
interface TweenConfig {
  target: any;
  to: Record<string, number>;
  duration: number;
  easing?: EasingFunction;
  checkTarget?: () => boolean;
  onComplete?: () => void;
}
```

## 📱 Responsive Configuration

### ResponsiveConfig Interface
```typescript
interface ResponsiveConfig {
  mobile: Record<string, any>;
  tablet: Record<string, any>;
  desktop: Record<string, any>;
}
```

### Device Breakpoints
```typescript
enum DeviceBreakpoint {
  MOBILE = 768,
  TABLET = 1024,
  DESKTOP = 1200
}
```

## 🎯 Scene-Specific Types

### Ace of Shadows
```typescript
interface CardConfig {
  width: number;
  height: number;
  overlap: number;
  totalCards: number;
  cardsPerStack: number;
}
```

### Magic Words
```typescript
interface ChatMessage {
  name: string;
  text: string;
}

interface Avatar {
  name: string;
  url: string;
  position: 'left' | 'right';
}

interface Emoji {
  name: string;
  url: string;
}

interface ChatData {
  dialogue: ChatMessage[];
  emojies: Emoji[];
  avatars: Avatar[];
}
```

### Phoenix Flame
```typescript
interface ParticleConfig {
  maxSprites: number;
  emitterX: number;
  emitterY: number;
  windStrength: number;
  windDirection: number;
}

interface FlameParticle {
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
```

## 🔗 External Dependencies

### PixiJS
- **Version**: 7.4.0
- **Documentation**: https://pixijs.download/dev/docs/
- **Main Classes Used**: Application, Container, Graphics, Text, Sprite, Texture

### TypeScript
- **Version**: 5.6.3
- **Configuration**: Strict mode enabled
- **Target**: ES2022

### Vite
- **Version**: 5.4.0
- **Features**: Hot reload, TypeScript support, ES modules
