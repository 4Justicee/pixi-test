/**
 * Image loading utilities for PIXI.js textures
 * @fileoverview Handles loading and caching of images with error handling
 */

import * as PIXI from 'pixi.js';
import { safeAsync, ErrorCode } from './ErrorHandler';

/**
 * Configuration options for image loading
 */
export interface ImageLoadOptions {
  /** Whether to enable CORS for cross-origin images */
  crossOrigin?: boolean;
  /** Timeout in milliseconds for loading */
  timeout?: number;
  /** Whether to cache the loaded texture */
  cache?: boolean;
}

/**
 * Image loader utility with caching and error handling
 */
export class ImageLoader {
  private static textureCache = new Map<string, PIXI.Texture>();
  private static readonly DEFAULT_TIMEOUT = 10000; // 10 seconds

  /**
   * Loads an image from a remote URL and returns a PIXI.Texture.
   * Automatically handles crossOrigin, caching, and load errors.
   * 
   * @param url - The URL of the image to load
   * @param options - Optional configuration for loading
   * @returns Promise that resolves to a PIXI.Texture
   * @throws AppError if loading fails
   */
  static async loadTexture(
    url: string, 
    options: ImageLoadOptions = {}
  ): Promise<PIXI.Texture> {
    const {
      crossOrigin = true,
      timeout = ImageLoader.DEFAULT_TIMEOUT,
      cache = true,
    } = options;

    // Check cache first
    if (cache && ImageLoader.textureCache.has(url)) {
      return ImageLoader.textureCache.get(url)!;
    }

    const result = await safeAsync(
      () => ImageLoader.loadTextureInternal(url, crossOrigin, timeout),
      ErrorCode.TEXTURE_LOAD_FAILED,
      { url, options }
    );
    
    if (!result) {
      throw new Error(`Failed to load texture: ${url}`);
    }
    
    return result;
  }

  /**
   * Internal method to load texture with timeout
   */
  private static async loadTextureInternal(
    url: string,
    crossOrigin: boolean,
    timeout: number
  ): Promise<PIXI.Texture> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${url}`));
      }, timeout);

      // Configure CORS
      if (crossOrigin) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          const texture = PIXI.Texture.from(img);
          
          // Cache the texture
          ImageLoader.textureCache.set(url, texture);
          
          resolve(texture);
        } catch (error) {
          reject(new Error(`Failed to create texture from image: ${error}`));
        }
      };

      img.onerror = (event) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Start loading
      img.src = url;
    });
  }

  /**
   * Preloads multiple images in parallel
   * 
   * @param urls - Array of image URLs to preload
   * @param options - Optional configuration for loading
   * @returns Promise that resolves when all images are loaded
   */
  static async preloadTextures(
    urls: string[],
    options: ImageLoadOptions = {}
  ): Promise<PIXI.Texture[]> {
    const loadPromises = urls.map(url => 
      ImageLoader.loadTexture(url, options)
    );

    try {
      return await Promise.all(loadPromises);
    } catch (error) {
      throw new Error(`Failed to preload textures: ${error}`);
    }
  }

  /**
   * Clears the texture cache
   */
  static clearCache(): void {
    ImageLoader.textureCache.clear();
  }

  /**
   * Gets the current cache size
   */
  static getCacheSize(): number {
    return ImageLoader.textureCache.size;
  }

  /**
   * Removes a specific texture from cache
   */
  static removeFromCache(url: string): boolean {
    return ImageLoader.textureCache.delete(url);
  }
}