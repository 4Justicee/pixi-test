# Development Guide

This guide provides detailed information for developers working on the PixiJS TypeScript Assignment project.

## 🏗️ Architecture Overview

### Core Principles
- **Separation of Concerns** — Each module has a single responsibility
- **Type Safety** — Full TypeScript coverage with strict type checking
- **Error Handling** — Comprehensive error management throughout the application
- **Responsive Design** — Mobile-first approach with adaptive components
- **Performance** — Optimized rendering and memory management

### Project Structure

```
src/
├── types/              # Type definitions and interfaces
│   └── index.ts       # Centralized type definitions
├── config/            # Configuration management
│   └── index.ts       # Application configuration
├── utils/             # Utility functions
│   ├── ErrorHandler.ts    # Error management system
│   ├── ImageLoader.ts     # Texture loading utilities
│   ├── Resize.ts          # Responsive layout management
│   ├── Tween.ts           # Animation system
│   └── FPSCounter.ts      # Performance monitoring
├── scenes/            # Scene implementations
│   ├── AceOfShadowsScene.ts
│   ├── MagicWordsScene.ts
│   └── PhoenixFlameScene.ts
├── ui/                # UI components
│   └── Menu.ts        # Navigation menu component
├── sceneManager.ts    # Scene lifecycle management
└── main.ts           # Application entry point
```

## 🔧 Development Setup

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager
- Modern web browser with WebGL support

### Environment Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

### IDE Configuration
Recommended VS Code extensions:
- TypeScript Importer
- Prettier
- ESLint
- PixiJS Snippets

## 📝 Coding Standards

### TypeScript Guidelines
- Use strict type checking
- Prefer interfaces over types for object shapes
- Use enums for constants
- Avoid `any` type - use proper typing
- Use JSDoc comments for public APIs

### Code Style
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_CASE for constants
- Use meaningful variable names
- Keep functions small and focused

### Error Handling
- Always wrap async operations in try-catch
- Use the centralized error handler
- Provide meaningful error messages
- Log errors appropriately for environment

## 🎨 Scene Development

### Scene Interface
All scenes must implement the `IScene` interface:

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

### Scene Lifecycle
1. **Constructor** — Initialize scene resources
2. **show()** — Activate scene, start animations
3. **hide()** — Deactivate scene, pause animations
4. **layout()** — Handle resize events
5. **destroy()** — Clean up resources

### Best Practices
- Initialize resources in constructor
- Handle cleanup in destroy method
- Use responsive design patterns
- Implement proper error handling
- Add performance monitoring

## 🎭 Animation System

### Tween Class
The `Tween` class provides smooth animations:

```typescript
// Basic usage
new Tween({
  target: sprite,
  to: { x: 100, y: 200 },
  duration: 1000,
  easing: easeInOutQuad,
  onComplete: () => console.log('Animation complete')
});

// Convenience functions
animateProperty(sprite, 'x', 100, 1000);
animateProperties(sprite, { x: 100, y: 200 }, 1000);
```

### Easing Functions
Available easing functions:
- `linear` — No easing
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeInOutSine`
- `easeInOutBack` — With overshoot

## 📱 Responsive Design

### Breakpoints
```typescript
enum DeviceBreakpoint {
  MOBILE = 768,
  TABLET = 1024,
  DESKTOP = 1200
}
```

### Responsive Utilities
```typescript
// Check device type
const isMobile = isMobile();
const isTablet = isTablet();
const isDesktop = isDesktop();

// Get responsive configuration
const config = getResponsiveConfig();
```

### Implementation Guidelines
- Design mobile-first
- Use relative units where possible
- Test on multiple screen sizes
- Consider touch vs mouse interactions
- Optimize for performance on mobile

## 🐛 Error Handling

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
```

### Error Handling Patterns
```typescript
// Safe async operations
const result = await safeAsync(
  () => loadTexture(url),
  ErrorCode.TEXTURE_LOAD_FAILED,
  { url }
);

// Safe sync operations
const value = safeSync(
  () => calculateValue(),
  ErrorCode.UNKNOWN_ERROR
);
```

### Logging
```typescript
// Error logging
errorLogger.logError(error, { context: 'additional info' });

// Warning logging
errorLogger.logWarning('Warning message', { data });

// Info logging
errorLogger.logInfo('Info message', { data });
```

## ⚡ Performance Optimization

### Best Practices
- Use object pooling for frequently created objects
- Cache textures and reuse them
- Minimize draw calls
- Use efficient data structures
- Monitor memory usage

### Performance Monitoring
```typescript
// FPS counter provides metrics
const metrics = fpsCounter.getMetrics();
console.log(`FPS: ${metrics.fps}, Frame Time: ${metrics.frameTime}`);
```

### Memory Management
- Clean up event listeners
- Destroy unused textures
- Remove unused display objects
- Use weak references where appropriate

## 🧪 Testing

### Manual Testing Checklist
- [ ] All scenes load and function correctly
- [ ] Responsive design works on different screen sizes
- [ ] Error handling works for network failures
- [ ] Performance is acceptable on target devices
- [ ] Animations are smooth and responsive
- [ ] Memory usage remains stable over time

### Performance Testing
- Monitor FPS during intensive operations
- Test memory usage patterns
- Verify smooth animations
- Check mobile performance
- Test on various devices and browsers

## 🔍 Debugging

### Debug Tools
- Browser DevTools for performance profiling
- PixiJS DevTools extension
- Console logging for debugging
- FPS counter for performance monitoring

### Common Issues
- **Memory leaks** — Check for proper cleanup
- **Performance issues** — Profile with DevTools
- **Layout problems** — Test responsive design
- **Animation glitches** — Check easing functions
- **Error handling** — Verify error boundaries

## 📚 Resources

### Documentation
- [PixiJS Documentation](https://pixijs.download/dev/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

### Tools
- [PixiJS DevTools](https://chrome.google.com/webstore/detail/pixijs-devtools/aamddddknhcagpehecnhphigffljadon)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [PixiJS Examples](https://pixijs.io/examples/)

## 🤝 Contributing

### Pull Request Process
1. Create feature branch from main
2. Implement changes following coding standards
3. Add tests and documentation
4. Ensure all checks pass
5. Submit pull request with description

### Code Review Guidelines
- Check for proper error handling
- Verify responsive design implementation
- Ensure performance considerations
- Review code style and documentation
- Test functionality thoroughly
