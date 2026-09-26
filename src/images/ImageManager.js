/**
 * Image Manager & Secure Loader
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadImage } from '@napi-rs/canvas';
import { ImageLoadError } from '../errors/index.js';
import { LRUCache } from '../utils/cache.js';

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class ImageManager {
  /**
   * @param {object} [options={}]
   * @param {number} [options.cacheMax=100] - Max images in cache
   * @param {number} [options.cacheTtl=300000] - Default TTL in ms (5 minutes)
   * @param {number} [options.timeout=10000] - Fetch timeout in ms
   * @param {number} [options.maxSizeBytes=10485760] - Max allowed image download size
   * @param {string[]} [options.allowedHosts] - Whitelist of allowed image hostnames
   * @param {boolean} [options.allowLocalFiles=true] - Whether local file paths are permitted
   * @param {number} [options.retries=1] - Retry count for network requests
   */
  constructor(options = {}) {
    this.cacheMax = options.cacheMax ?? 100;
    this.cacheTtl = options.cacheTtl ?? 5 * 60 * 1000; // 5 min
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    this.maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
    this.allowedHosts = options.allowedHosts ? new Set(options.allowedHosts.map(h => h.toLowerCase())) : null;
    this.allowLocalFiles = options.allowLocalFiles ?? true;
    this.retries = options.retries ?? 1;

    this.cache = new LRUCache({
      max: this.cacheMax,
      ttl: this.cacheTtl
    });
  }

  /**
   * Load image from URL, file path, Buffer, or Base64 string
   * @param {string | Buffer} src
   * @param {object} [options={}]
   * @returns {Promise<{ image: any, buffer: Buffer, width: number, height: number }>}
   */
  async load(src, options = {}) {
    if (!src) {
      throw new ImageLoadError('Cannot load image: source is empty or undefined.');
    }

    // Direct Buffer
    if (Buffer.isBuffer(src)) {
      return this._loadFromBuffer(src, 'buffer');
    }

    if (typeof src !== 'string') {
      throw new ImageLoadError(`Invalid image source type: expected string or Buffer, received ${typeof src}`);
    }

    const trimmed = src.trim();

    // Check cache by source string
    const cached = this.cache.get(trimmed);
    if (cached) {
      return cached;
    }

    let result;

    // 1. Base64 Data URI
    if (trimmed.startsWith('data:image/')) {
      result = await this._loadFromDataUri(trimmed);
    }
    // 2. HTTP / HTTPS URL
    else if (/^https?:\/\//i.test(trimmed)) {
      result = await this._loadFromUrl(trimmed, options);
    }
    // 3. Local file path
    else {
      result = await this._loadFromFile(trimmed);
    }

    // Cache the result
    this.cache.set(trimmed, result, options.ttl ?? this.cacheTtl);
    return result;
  }

  /**
   * Internal buffer loader
   */
  async _loadFromBuffer(buffer, cacheKey = null) {
    if (buffer.length > this.maxSizeBytes) {
      throw new ImageLoadError(`Image buffer size (${buffer.length} bytes) exceeds limit (${this.maxSizeBytes} bytes).`);
    }

    try {
      const img = await loadImage(buffer);
      const data = {
        image: img,
        buffer,
        width: img.width,
        height: img.height
      };
      if (cacheKey && typeof cacheKey === 'string') {
        this.cache.set(cacheKey, data);
      }
      return data;
    } catch (err) {
      throw new ImageLoadError(`Failed to decode image from buffer: ${err.message}`, { cause: err });
    }
  }

  /**
   * Load from base64 data URI
   */
  async _loadFromDataUri(dataUri) {
    try {
      const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches) {
        throw new ImageLoadError('Malformed base64 data URI.');
      }
      const buffer = Buffer.from(matches[2], 'base64');
      return await this._loadFromBuffer(buffer);
    } catch (err) {
      if (err instanceof ImageLoadError) throw err;
      throw new ImageLoadError(`Failed to parse base64 image: ${err.message}`, { cause: err });
    }
  }

  /**
   * Load from local file
   */
  async _loadFromFile(filePath) {
    if (!this.allowLocalFiles) {
      throw new ImageLoadError('Local file access is disabled by configuration.');
    }

    // Prevent unsafe path characters or null bytes
    if (filePath.includes('\0')) {
      throw new ImageLoadError('Invalid file path: contains null bytes.');
    }

    const resolved = path.resolve(filePath);
    if (!existsSync(resolved)) {
      throw new ImageLoadError(`Local image file does not exist: "${resolved}"`, { path: resolved });
    }

    try {
      const buffer = await fs.readFile(resolved);
      return await this._loadFromBuffer(buffer);
    } catch (err) {
      if (err instanceof ImageLoadError) throw err;
      throw new ImageLoadError(`Failed to read local image file "${resolved}": ${err.message}`, {
        path: resolved,
        cause: err
      });
    }
  }

  /**
   * Load from remote HTTP/HTTPS URL with security checks, retries, and timeout
   */
  async _loadFromUrl(urlStr, options = {}) {
    let parsedUrl;
    try {
      parsedUrl = new URL(urlStr);
    } catch {
      throw new ImageLoadError(`Invalid image URL: "${urlStr}"`);
    }

    // Protocol check
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new ImageLoadError(`Disallowed protocol in image URL: "${parsedUrl.protocol}"`);
    }

    // Host whitelist check
    if (this.allowedHosts && !this.allowedHosts.has(parsedUrl.hostname.toLowerCase())) {
      throw new ImageLoadError(`Image host "${parsedUrl.hostname}" is not in the allowed hosts list.`, {
        host: parsedUrl.hostname
      });
    }

    const retries = options.retries ?? this.retries;
    const timeout = options.timeout ?? this.timeout;
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const res = await fetch(parsedUrl.href, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SD-Canvas/1.0.0 (Stacks Development)'
          }
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new ImageLoadError(`HTTP error ${res.status} (${res.statusText}) when fetching image from ${urlStr}`, {
            status: res.status,
            url: urlStr
          });
        }

        // Check content-length header if provided
        const contentLength = res.headers.get('content-length');
        if (contentLength && parseInt(contentLength, 10) > this.maxSizeBytes) {
          throw new ImageLoadError(`Image content-length (${contentLength} bytes) exceeds limit (${this.maxSizeBytes} bytes).`, {
            contentLength: parseInt(contentLength, 10)
          });
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length > this.maxSizeBytes) {
          throw new ImageLoadError(`Downloaded image size (${buffer.length} bytes) exceeds limit (${this.maxSizeBytes} bytes).`);
        }

        return await this._loadFromBuffer(buffer);
      } catch (err) {
        lastError = err;
        if (err.name === 'AbortError') {
          lastError = new ImageLoadError(`Timeout after ${timeout}ms while downloading image from ${urlStr}`, {
            url: urlStr,
            timeout
          });
        }
        if (attempt < retries) {
          // Brief backoff before retry
          await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
        }
      }
    }

    if (lastError instanceof ImageLoadError) {
      throw lastError;
    }
    throw new ImageLoadError(`Failed to download image from "${urlStr}": ${lastError.message}`, {
      url: urlStr,
      cause: lastError
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Global default singleton image manager
export const defaultImageManager = new ImageManager();

export default ImageManager;
