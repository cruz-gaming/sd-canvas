/**
 * Gradient Element
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { Element } from './Element.js';
import { normalizeStops } from '../utils/color.js';

export class GradientElement extends Element {
  /**
   * @param {object} [options={}]
   */
  constructor(options = {}) {
    super({ ...options, type: 'gradient' });

    this.gradientType = options.gradientType || options.type === 'radial' ? 'radial' : 'linear';
    this.direction = options.direction || 'vertical';
    this.angle = options.angle ?? null;
    this.stops = normalizeStops(options.stops || options.colors || ['#000000', '#ffffff']);

    // Linear coordinates (optional overrides)
    this.x1 = options.x1 ?? null;
    this.y1 = options.y1 ?? null;
    this.x2 = options.x2 ?? null;
    this.y2 = options.y2 ?? null;

    // Radial coordinates
    this.cx = options.cx ?? null;
    this.cy = options.cy ?? null;
    this.r0 = options.r0 ?? 0;
    this.r1 = options.r1 ?? options.radius ?? null;

    // Border radius if used as a filled card
    this.radius = options.radius ?? 0;
  }
}

export default GradientElement;
