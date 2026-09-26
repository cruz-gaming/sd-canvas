/**
 * Font Manager
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import fs from 'node:fs';
import path from 'node:path';
import { GlobalFonts } from '@napi-rs/canvas';
import { FontError } from '../errors/index.js';

export class FontManager {
  constructor() {
    this.registeredFonts = new Map();
  }

  /**
   * Register a custom font from a file path
   * Supports:
   *   register(path, { family, weight, style })
   *   register({ src, family, weight, style })
   *
   * @param {string | object} fontPathOrOptions
   * @param {object} [options={}]
   * @returns {boolean}
   */
  register(fontPathOrOptions, options = {}) {
    let filePath;
    let family;
    let weight = 'normal';
    let style = 'normal';

    if (typeof fontPathOrOptions === 'object' && fontPathOrOptions !== null) {
      filePath = fontPathOrOptions.src || fontPathOrOptions.path;
      family = fontPathOrOptions.family;
      weight = fontPathOrOptions.weight || 'normal';
      style = fontPathOrOptions.style || 'normal';
    } else {
      filePath = fontPathOrOptions;
      family = options.family;
      weight = options.weight || 'normal';
      style = options.style || 'normal';
    }

    if (!filePath) {
      throw new FontError('Font registration requires a file path or "src" property.');
    }

    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new FontError(`Font file does not exist at path: "${resolvedPath}"`, { path: resolvedPath });
    }

    // Default family name to file basename if not provided
    const fontName = family || path.basename(resolvedPath, path.extname(resolvedPath));
    const fontKey = `${fontName}-${weight}-${style}`;

    if (this.registeredFonts.has(fontKey)) {
      return true;
    }

    try {
      const success = GlobalFonts.registerFromPath(resolvedPath, fontName);
      if (success) {
        this.registeredFonts.set(fontKey, {
          family: fontName,
          path: resolvedPath,
          weight,
          style
        });
        return true;
      } else {
        throw new FontError(`Failed to load font from: "${resolvedPath}"`, { path: resolvedPath, family: fontName });
      }
    } catch (err) {
      if (err instanceof FontError) throw err;
      throw new FontError(`GlobalFonts failed to register font "${fontName}": ${err.message}`, {
        path: resolvedPath,
        family: fontName,
        cause: err
      });
    }
  }

  /**
   * Check if a font family is available
   * @param {string} family
   * @returns {boolean}
   */
  has(family) {
    if (!family) return false;
    return GlobalFonts.has(family);
  }

  /**
   * List all registered fonts in this manager
   * @returns {Array<object>}
   */
  getRegistered() {
    return Array.from(this.registeredFonts.values());
  }
}

// Global default singleton font manager
export const defaultFontManager = new FontManager();

/**
 * Register font globally
 * @param {string | object} fontPathOrOptions
 * @param {object} [options]
 */
export function registerFont(fontPathOrOptions, options) {
  return defaultFontManager.register(fontPathOrOptions, options);
}

export default FontManager;
