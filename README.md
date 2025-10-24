
# PixiJS TypeScript Assignment

A modern, responsive PixiJS v7 application built with TypeScript, featuring three interactive scenes with comprehensive error handling, responsive design, and professional code architecture.

## 🎯 Features

### Interactive Scenes
1. **Ace of Shadows** — Card stacking animation with 144 sprites, smooth transitions, and responsive design
2. **Magic Words** — Dynamic chat interface with API integration, emoji support, and real-time dialogue
3. **Phoenix Flame** — Particle system fire simulation with interactive mouse/touch controls

### Technical Features
- ✅ **Modern Architecture** — Clean separation of concerns with TypeScript interfaces
- ✅ **Responsive Design** — Mobile-first approach with adaptive UI components
- ✅ **Error Handling** — Comprehensive error management and logging system
- ✅ **Performance Monitoring** — Real-time FPS counter with performance metrics
- ✅ **Type Safety** — Full TypeScript coverage with strict type checking
- ✅ **Documentation** — Extensive JSDoc comments and code documentation
- ✅ **Configuration Management** — Centralized configuration system
- ✅ **Animation System** — Advanced tweening with multiple easing functions

## 🚧 Development Challenges

This project was created as a **technical assessment for company recruitment**, presenting several interesting challenges that demonstrate problem-solving skills and technical depth:

### Ace of Shadows - Card Animation Complexity
The most challenging aspect was **correctly managing card order and positioning** during animations. With cards moving every 1 second but animations taking 2 seconds, ensuring proper stacking order and visual continuity required careful state management:

- **Timing Synchronization** — Cards must maintain correct z-index and visual order during overlapping animations
- **Position Calculation** — Dynamic positioning as cards move between stacks with varying heights
- **Animation State Management** — Tracking multiple concurrent animations while preserving game logic
- **Visual Continuity** — Ensuring smooth transitions without visual glitches or incorrect stacking

### Magic Words - Image Loading & Scrolling
Significant challenges in **asynchronous image loading** and **smooth scrolling implementation**:

- **Image Loading Race Conditions** — Managing multiple concurrent image loads with proper error handling
- **Scroll Performance** — Implementing smooth scrolling with large message lists while maintaining 60fps
- **Memory Management** — Efficiently handling image caching and cleanup for long-running conversations
- **Responsive Layout** — Adapting chat interface across different screen sizes while maintaining usability

### Phoenix Flame - Particle System Optimization
Balancing **visual quality with performance** while maintaining the 10-sprite limit:

- **Particle Lifecycle Management** — Efficient creation, update, and destruction of particles
- **Performance Optimization** — Maintaining smooth animations while respecting sprite constraints
- **Interactive Physics** — Realistic fire behavior with mouse/touch interaction
- **Visual Effects** — Creating convincing fire effects using minimal sprites
- **Constraint Creativity** — Due to the 10-particle limit, I had to focus on **efficient animation techniques** rather than quantity. While this produces beautiful, optimized animations, **with more particles available, I could create even more spectacular and realistic fire effects** with enhanced particle density, varied particle sizes, and more complex physics interactions.

## 💡 Technical Insights

This assignment showcases several **advanced programming concepts**:

- **Concurrent Animation Management** — Handling multiple overlapping animations with proper state tracking
- **Asynchronous Resource Loading** — Managing image loading with caching, error handling, and performance optimization
- **Real-time Performance Monitoring** — Implementing FPS tracking and performance metrics
- **Responsive Design Patterns** — Creating adaptive interfaces that work across device types
- **Error Boundary Implementation** — Graceful error handling with user-friendly fallbacks
- **Type-Safe Configuration** — Centralized configuration management with TypeScript strict mode

The project demonstrates **production-ready code quality** with comprehensive error handling, extensive documentation, and maintainable architecture suitable for team development.

## 🎮 Play Demo Online

**Live Demo**: [View the application in action](https://pixidemo.luckyverse.club)

Experience all three interactive scenes:
- **Ace of Shadows** — Watch 144 cards smoothly animate between stacks
- **Magic Words** — See real-time chat with dynamic image loading
- **Phoenix Flame** — Control the fire particle system with your mouse/touch

*Note: The demo requires fullscreen mode for optimal experience. Click the overlay to enter fullscreen when prompted.*

- **Runtime**: Node.js + TypeScript
- **Graphics**: PixiJS v7
- **Build Tool**: Vite
- **Development**: Hot reload, TypeScript strict mode
- **Architecture**: Modular component system with dependency injection

## 📁 Project Structure

```
src/
├── types/           # TypeScript type definitions
├── config/          # Application configuration
├── utils/           # Utility functions and helpers
│   ├── ErrorHandler.ts    # Error management system
│   ├── ImageLoader.ts     # Texture loading with caching
│   ├── Resize.ts          # Responsive layout management
│   ├── Tween.ts           # Animation system
│   └── FPSCounter.ts      # Performance monitoring
├── scenes/          # Scene implementations
│   ├── AceOfShadowsScene.ts
│   ├── MagicWordsScene.ts
│   └── PhoenixFlameScene.ts
├── ui/              # UI components
│   └── Menu.ts            # Navigation menu
├── sceneManager.ts  # Scene lifecycle management
└── main.ts          # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd pixi-ts-assignment

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

## 🎮 Usage

1. **Start the application** — Run `npm run dev` and open your browser
2. **Enter fullscreen** — Click the overlay to enable fullscreen mode (required by browsers)
3. **Navigate scenes** — Use the menu to switch between different scenes
4. **Monitor performance** — Watch the FPS counter in the top-left corner

### Scene Controls

#### Ace of Shadows
- Cards automatically move between stacks every 1 second
- 2-second smooth animation transitions
- Responsive card sizing for mobile devices

#### Magic Words
- Fetches dialogue from external API
- Displays chat messages with avatars and emojis
- Scrollable message history

#### Phoenix Flame
- Move mouse/touch to control fire emitter position
- Particle system with realistic fire effects
- Wind effects and particle physics

## 🏗️ Architecture

### Core Components

#### Application Class (`main.ts`)
- Centralized application initialization
- Error handling and recovery
- Resource management and cleanup

#### Scene Manager (`sceneManager.ts`)
- Scene lifecycle management
- Transition handling
- History tracking and navigation

#### Configuration System (`config/`)
- Centralized configuration management
- Responsive breakpoint definitions
- Environment-specific settings

#### Error Handling (`utils/ErrorHandler.ts`)
- Global error catching and logging
- User-friendly error messages
- Development vs production error handling

### Design Patterns

- **Singleton Pattern** — Error logger, resize manager
- **Observer Pattern** — Event handling and notifications
- **Factory Pattern** — Scene creation and management
- **Strategy Pattern** — Responsive design configurations

## 📱 Responsive Design

The application automatically adapts to different screen sizes:

- **Mobile** (< 768px) — Compact UI, touch-optimized controls
- **Tablet** (768px - 1024px) — Medium-sized elements, hybrid interaction
- **Desktop** (> 1024px) — Full-sized UI, mouse-optimized controls

## 🔧 Configuration

### Environment Variables
```bash
# Development mode
NODE_ENV=development

# Production mode  
NODE_ENV=production
```

### Customization
Edit `src/config/index.ts` to modify:
- Scene parameters
- UI styling
- Performance settings
- API endpoints

## 🐛 Error Handling

The application includes comprehensive error handling:

- **Global Error Catching** — Unhandled errors are caught and logged
- **Graceful Degradation** — Fallbacks for failed operations
- **User Feedback** — Clear error messages for users
- **Development Logging** — Detailed error information in development mode

## 📊 Performance

### Monitoring
- Real-time FPS counter
- Frame time tracking
- Memory usage monitoring
- Performance metrics collection

### Optimization
- Texture caching and reuse
- Efficient animation loops
- Responsive resource management
- Memory leak prevention

## 🧪 Testing

### Manual Testing
1. Test all three scenes for functionality
2. Verify responsive behavior on different screen sizes
3. Check error handling with network failures
4. Validate performance on various devices

### Performance Testing
- Monitor FPS during intensive scenes
- Test memory usage over time
- Verify smooth animations
- Check mobile performance

## 📚 API Documentation

### Scene Interface
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

### Menu Component
```typescript
interface MenuItem {
  label: string;
  sceneKey: SceneKey;
}
```

### Configuration API
```typescript
// Get responsive configuration
const config = getResponsiveConfig();

// Check device type
const isMobile = isMobile();
const isTablet = isTablet();
const isDesktop = isDesktop();
```

## 🎯 Recruitment Context

This project was developed as a **technical assessment** to evaluate:

- **Problem-Solving Skills** — Handling complex animation timing and state management
- **Technical Depth** — Implementing advanced features like concurrent animations and performance optimization
- **Code Quality** — Writing maintainable, well-documented, and type-safe code
- **Architecture Design** — Creating scalable and modular application structure
- **Performance Awareness** — Optimizing for smooth 60fps animations and efficient resource management

### Key Technical Demonstrations
- **Complex State Management** — Managing overlapping animations with proper synchronization
- **Asynchronous Programming** — Handling image loading with race conditions and error recovery
- **Performance Optimization** — Maintaining smooth animations while respecting resource constraints
- **Error Handling** — Implementing comprehensive error boundaries and graceful degradation
- **Type Safety** — Full TypeScript strict mode compliance with proper interface design

## 🔮 Potential Improvements

While the current implementation meets all requirements, several enhancements could further demonstrate technical expertise:

### Advanced Features
- **Scene Transitions** — Smooth fade/slide transitions between scenes
- **Particle System Enhancements** — More sophisticated fire physics with wind effects
- **Card Game Logic** — Implement actual card game rules and win conditions
- **Chat Features** — Message timestamps, user typing indicators, message reactions
- **Performance Profiling** — Memory usage tracking and optimization suggestions

### Technical Enhancements
- **WebGL Shaders** — Custom shaders for enhanced visual effects
- **Web Workers** — Offload heavy computations to background threads
- **Service Workers** — Offline functionality and caching strategies
- **WebSocket Integration** — Real-time multiplayer or live chat features
- **Progressive Web App** — Mobile app-like experience with offline support

### Code Quality Improvements
- **Unit Testing** — Comprehensive test coverage for all components
- **E2E Testing** — Automated testing of user interactions
- **Performance Testing** — Automated performance regression testing
- **Code Coverage** — Ensure all code paths are tested
- **Linting Rules** — Stricter ESLint configuration for code quality

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add JSDoc comments for new functions
3. Update tests for new features
4. Maintain responsive design principles
5. Follow the established error handling patterns

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- PixiJS team for the excellent graphics library
- TypeScript team for the robust type system
- Vite team for the fast build tool
- Contributors and testers

---

**Built with ❤️ using PixiJS v7 and TypeScript**
