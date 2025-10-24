/**
 * Application configuration management
 * @fileoverview Centralized configuration for the PixiJS application
 */

import type { AppConfig, MagicWordsApiConfig } from '../types';
import { DeviceBreakpoint } from '../types';

/**
 * Application configuration constants
 */
export const CONFIG = {
  // Application settings
  APP: {
    backgroundColor: 0x101015,
    antialias: true,
    resizeTo: window,
  } as AppConfig,

  // Device breakpoints
  BREAKPOINTS: {
    MOBILE: DeviceBreakpoint.MOBILE,
    TABLET: DeviceBreakpoint.TABLET,
    DESKTOP: DeviceBreakpoint.DESKTOP,
  },

  // Scene configurations
  SCENES: {
    ACE_OF_SHADOWS: {
      totalCards: 144,
      cardsPerStack: 36,
      cardWidth: 90,
      cardHeight: 124,
      cardOverlap: 18,
      moveInterval: 1000, // ms
      animationDuration: 2000, // ms
    },
    MAGIC_WORDS: {
      messageDelay: 1500, // ms
      scrollSpeed: 0.1,
      avatarSize: 40,
      emojiSize: 24,
      maxMessages: 50,
    },
    PHOENIX_FLAME: {
      maxParticles: 10,
      particleLifetime: 2000, // ms
      emissionRate: 0.1, // particles per frame
      windStrength: 0.5,
    },
  },

  // UI configurations
  UI: {
    MENU: {
      buttonWidth: 220,
      buttonHeight: 44,
      buttonPadding: 12,
      cornerRadius: 10,
      fontSize: 16,
      backgroundColor: 0x1e293b,
      backgroundAlpha: 0.9,
    },
    FPS_COUNTER: {
      width: 80,
      height: 28,
      cornerRadius: 8,
      backgroundColor: 0x000000,
      backgroundAlpha: 0.35,
      fontSize: 14,
      updateInterval: 1000, // ms
    },
  },

  // Responsive design
  RESPONSIVE: {
    MOBILE: {
      menuButtonWidth: 160,
      menuButtonHeight: 36,
      menuButtonPadding: 12,
      menuCornerRadius: 8,
      menuFontSize: 14,
      cardWidth: 60,
      cardHeight: 80,
      cardOverlap: 12,
    },
    TABLET: {
      menuButtonWidth: 180,
      menuButtonHeight: 40,
      menuButtonPadding: 14,
      menuCornerRadius: 9,
      menuFontSize: 15,
      cardWidth: 75,
      cardHeight: 100,
      cardOverlap: 15,
    },
  },

  // API configuration
  API: {
    MAGIC_WORDS: {
      baseUrl: 'https://api.example.com',
      timeout: 10000, // ms
      retryAttempts: 3,
    } as MagicWordsApiConfig,
  },

  // Animation settings
  ANIMATION: {
    DEFAULT_DURATION: 300, // ms
    DEFAULT_EASING: 'easeInOutQuad',
    TWEEN_UPDATE_INTERVAL: 16, // ms (60fps)
  },

  // Performance settings
  PERFORMANCE: {
    TARGET_FPS: 60,
    MAX_FRAME_TIME: 16.67, // ms
    MEMORY_WARNING_THRESHOLD: 100 * 1024 * 1024, // 100MB
  },
} as const;

/**
 * Get responsive configuration based on current screen width
 */
export function getResponsiveConfig() {
  const width = window.innerWidth;
  
  if (width < CONFIG.BREAKPOINTS.MOBILE) {
    return CONFIG.RESPONSIVE.MOBILE;
  } else if (width < CONFIG.BREAKPOINTS.TABLET) {
    return CONFIG.RESPONSIVE.TABLET;
  } else {
    return CONFIG.UI.MENU; // Desktop uses default UI config
  }
}

/**
 * Check if current device is mobile
 */
export function isMobile(): boolean {
  return window.innerWidth < CONFIG.BREAKPOINTS.MOBILE;
}

/**
 * Check if current device is tablet
 */
export function isTablet(): boolean {
  const width = window.innerWidth;
  return width >= CONFIG.BREAKPOINTS.MOBILE && width < CONFIG.BREAKPOINTS.TABLET;
}

/**
 * Check if current device is desktop
 */
export function isDesktop(): boolean {
  return window.innerWidth >= CONFIG.BREAKPOINTS.DESKTOP;
}

/**
 * Get device type string
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}
