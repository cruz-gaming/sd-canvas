/**
 * Custom Shape / Path Element
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { Element } from './Element.js';

export class ShapeElement extends Element {
  /**
   * @param {object} [options={}]
   */
  constructor(options = {}) {
    super({ ...options, type: 'shape' });

    // Path can be an SVG path string 'd', or an array of path commands, or a custom draw function
    this.path = options.path || options.d || null;
    this.fill = options.fill || options.color || '#ffffff';
    this.stroke = options.stroke || null;
    this.strokeWidth = options.strokeWidth ?? 0;
    this.draw = typeof options.draw === 'function' ? options.draw : null;
  }
}

export default ShapeElement;
