// src/utils/ImageLoader.ts
import * as PIXI from 'pixi.js';

export class ImageLoader {
  /**
   * Loads an image from a remote URL and returns a PIXI.Texture.
   * Automatically handles crossOrigin and load errors.
   */
  static async loadTexture(url: string): Promise<PIXI.Texture> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      // Needed if image is from another domain and has CORS enabled
      img.crossOrigin = 'anonymous';
      img.src = url;

      img.onload = () => {
        const texture = PIXI.Texture.from(img);
        resolve(texture);
      };

      img.onerror = (e) => {
        console.warn(`[ImageLoader] Failed to load image: ${url}`, e);
        reject(new Error(`Failed to load image: ${url}`));
      };
    });
  }
}