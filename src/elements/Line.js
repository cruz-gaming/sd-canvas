/**
 * Line Element
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { Element } from './Element.js';

export class LineElement extends Element {
  /**
   * @param {object} [options={}]
   */
  constructor(options = {}) {
    super({ ...options, type: 'line' });

    this.x1 = options.x1 ?? options.from?.x ?? 0;
    this.y1 = options.y1 ?? options.from?.y ?? 0;
    this.x2 = options.x2 ?? options.to?.x ?? 0;
    this.y2 = options.y2 ?? options.to?.y ?? 0;

    this.color = options.color || options.stroke || '#ffffff';
    this.width = options.lineWidth ?? options.width ?? 1;
    this.dash = options.dash || options.lineDash || null; // e.g. [5, 5]
    this.cap = options.cap || options.lineCap || 'butt'; // 'butt', 'round', 'square'
  }
}

export default LineElement;
