/**
 * Circle Element
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { Element } from './Element.js';

export class CircleElement extends Element {
  /**
   * @param {object} [options={}]
   */
  constructor(options = {}) {
    super({ ...options, type: 'circle' });

    this.radius = options.radius ?? (options.width ? options.width / 2 : 25);
    // Center point coordinates (cx, cy) or top-left (x, y)
    this.cx = options.cx ?? (options.x != null ? options.x + this.radius : this.radius);
    this.cy = options.cy ?? (options.y != null ? options.y + this.radius : this.radius);

    this.fill = options.fill || options.color || '#ffffff';
    this.stroke = options.stroke || options.borderColor || null;
    this.strokeWidth = options.strokeWidth ?? options.borderWidth ?? 0;
  }
}

export default CircleElement;
