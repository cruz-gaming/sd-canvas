/**
 * Base Abstract Renderer
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { RenderError } from '../errors/index.js';

export class Renderer {
  /**
   * Sort elements by zIndex stably
   * @param {Array<object>} elements
   * @returns {Array<object>}
   */
  sortElements(elements) {
    if (!elements || !Array.isArray(elements)) return [];
    // Stable sort preserving definition index when zIndex is identical
    return elements
      .map((el, index) => ({ el, index }))
      .sort((a, b) => {
        const za = a.el.zIndex ?? 0;
        const zb = b.el.zIndex ?? 0;
        if (za !== zb) return za - zb;
        return a.index - b.index;
      })
      .map(item => item.el);
  }

  /**
   * Abstract render method
   * @param {object} layout
   * @param {object} [options={}]
   * @returns {Promise<any>}
   */
  async render(layout, options = {}) {
    throw new RenderError('render() method must be implemented by subclass.');
  }
}

export default Renderer;
