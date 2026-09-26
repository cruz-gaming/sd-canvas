/**
 * Rectangle Element
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { Element } from './Element.js';

export class RectangleElement extends Element {
  /**
   * @param {object} [options={}]
   */
  constructor(options = {}) {
    super({ ...options, type: 'rectangle' });

    this.fill = options.fill || options.color || '#ffffff';
    this.stroke = options.stroke || options.borderColor || null;
    this.strokeWidth = options.strokeWidth ?? options.borderWidth ?? 0;
    this.radius = options.radius ?? options.borderRadius ?? 0;
  }
}

export default RectangleElement;
