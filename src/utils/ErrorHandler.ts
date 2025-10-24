/**
 * Error handling and logging utilities
 * @fileoverview Centralized error management for the PixiJS application
 */

import type { AppError } from '../types';

/**
 * Custom error types for the application
 */
export enum ErrorCode {
  SCENE_LOAD_FAILED = 'SCENE_LOAD_FAILED',
  TEXTURE_LOAD_FAILED = 'TEXTURE_LOAD_FAILED',
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  ANIMATION_ERROR = 'ANIMATION_ERROR',
  RESIZE_ERROR = 'RESIZE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Application error class with enhanced error information
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly timestamp: number;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.timestamp = Date.now();
    this.context = context;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert error to plain object for logging
   */
  toObject(): AppError {
    return {
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Error logger with different log levels
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: AppError[] = [];
  private maxErrors = 100; // Keep last 100 errors

  private constructor() {}

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with optional context
   */
  public logError(error: Error | AppError, context?: Record<string, any>): void {
    const appError = error instanceof AppError 
      ? error 
      : new AppError(error.message, ErrorCode.UNKNOWN_ERROR, context);

    this.errors.push(appError);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[AppError]', appError.toObject());
    }

    // In production, you might want to send errors to a logging service
    this.handleProductionError(appError);
  }

  /**
   * Log a warning message
   */
  public logWarning(message: string, context?: Record<string, any>): void {
    const warning = {
      message,
      context,
      timestamp: Date.now(),
      level: 'warning' as const,
    };

    if (process.env.NODE_ENV === 'development') {
      console.warn('[AppWarning]', warning);
    }
  }

  /**
   * Log an info message
   */
  public logInfo(message: string, context?: Record<string, any>): void {
    const info = {
      message,
      context,
      timestamp: Date.now(),
      level: 'info' as const,
    };

    if (process.env.NODE_ENV === 'development') {
      console.info('[AppInfo]', info);
    }
  }

  /**
   * Get all logged errors
   */
  public getErrors(): AppError[] {
    return [...this.errors];
  }

  /**
   * Clear all logged errors
   */
  public clearErrors(): void {
    this.errors = [];
  }

  /**
   * Handle errors in production environment
   */
  private handleProductionError(error: AppError): void {
    // In production, you might want to:
    // - Send errors to a logging service (Sentry, LogRocket, etc.)
    // - Show user-friendly error messages
    // - Track error metrics
    
    // For now, we'll just store them locally
    // You can implement actual error reporting here
  }
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandling(): void {
  const logger = ErrorLogger.getInstance();

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.logError(
      new Error(`Unhandled promise rejection: ${event.reason}`),
      { type: 'unhandledRejection', reason: event.reason }
    );
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    logger.logError(
      new Error(`Global error: ${event.message}`),
      {
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });
}

/**
 * Utility function to safely execute async operations with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  context?: Record<string, any>
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const logger = ErrorLogger.getInstance();
    logger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { ...context, operation: operation.name }
    );
    return null;
  }
}

/**
 * Utility function to safely execute synchronous operations with error handling
 */
export function safeSync<T>(
  operation: () => T,
  errorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  context?: Record<string, any>
): T | null {
  try {
    return operation();
  } catch (error) {
    const logger = ErrorLogger.getInstance();
    logger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { ...context, operation: operation.name }
    );
    return null;
  }
}

// Export singleton instance for easy access
export const errorLogger = ErrorLogger.getInstance();
