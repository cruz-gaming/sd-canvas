/**
 * Image Element
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { Element } from './Element.js';

export class ImageElement extends Element {
  /**
   * @param {object} [options={}]
   */
  constructor(options = {}) {
    super({ ...options, type: 'image' });

    this.src = options.src || null;
    this.fit = options.fit || 'cover'; // 'cover', 'contain', 'fill', 'none'
    this.crop = options.crop || null; // { x, y, width, height }

    // Shape / Clipping
    this.circle = Boolean(options.circle);
    this.radius = options.radius ?? 0;

    // If radius is set to half the width or height and circle not specified, it's a circle
    if (this.radius > 0 && typeof this.radius === 'number' && this.width > 0 && this.radius >= this.width / 2) {
      this.circle = true;
    }

    // Border
    this.borderColor = options.borderColor || options.border || null;
    this.borderWidth = options.borderWidth ?? 0;
  }
}

export default ImageElement;
