/**
 * Layout System & Layer Manager
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { createElement } from './elements/index.js';
import { interpolate } from './templates/interpolate.js';
import { LayoutError } from './errors/index.js';

export class Layout {
  /**
   * @param {object} [options={}]
   * @param {number} [options.width=1200]
   * @param {number} [options.height=500]
   * @param {string | object} [options.background]
   * @param {Array<object>} [options.elements=[]]
   */
  constructor(options = {}) {
    this.width = options.width ?? 1200;
    this.height = options.height ?? 500;
    this.background = options.background != null ? options.background : null;
    this.elements = [];

    if (Array.isArray(options.elements)) {
      for (const el of options.elements) {
        this.add(el);
      }
    }
  }

  /**
   * Add an element to the layout
   * @param {object} el
   * @returns {object} The added element
   */
  add(el) {
    if (!el || typeof el !== 'object') {
      throw new LayoutError('Element to add must be an object.');
    }

    const element = el instanceof Object && el.constructor && el.constructor.name.endsWith('Element')
      ? el
      : createElement(el);

    this.elements.push(element);
    return element;
  }

  /**
   * Remove an element by its ID
   * @param {string} id
   * @returns {boolean}
   */
  remove(id) {
    const idx = this.elements.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.elements.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Get an element by its ID
   * @param {string} id
   * @returns {object | undefined}
   */
  get(id) {
    return this.elements.find(e => e.id === id);
  }

  /**
   * Move element to the front (highest z-index and last in array)
   * @param {string} id
   * @returns {this}
   */
  bringToFront(id) {
    const idx = this.elements.findIndex(e => e.id === id);
    if (idx === -1) return this;

    const [item] = this.elements.splice(idx, 1);
    const maxZ = this.elements.reduce((max, e) => Math.max(max, e.zIndex || 0), 0);
    item.zIndex = maxZ + 1;
    this.elements.push(item);
    return this;
  }

  /**
   * Move element to the back (lowest z-index and first in array)
   * @param {string} id
   * @returns {this}
   */
  sendToBack(id) {
    const idx = this.elements.findIndex(e => e.id === id);
    if (idx === -1) return this;

    const [item] = this.elements.splice(idx, 1);
    const minZ = this.elements.reduce((min, e) => Math.min(min, e.zIndex || 0), 0);
    item.zIndex = minZ - 1;
    this.elements.unshift(item);
    return this;
  }

  /**
   * Move element one step forward
   * @param {string} id
   * @returns {this}
   */
  moveForward(id) {
    const idx = this.elements.findIndex(e => e.id === id);
    if (idx === -1 || idx === this.elements.length - 1) return this;

    const current = this.elements[idx];
    const next = this.elements[idx + 1];

    // Swap positions
    this.elements[idx] = next;
    this.elements[idx + 1] = current;

    if ((current.zIndex || 0) <= (next.zIndex || 0)) {
      current.zIndex = (next.zIndex || 0) + 1;
    }

    return this;
  }

  /**
   * Move element one step backward
   * @param {string} id
   * @returns {this}
   */
  moveBackward(id) {
    const idx = this.elements.findIndex(e => e.id === id);
    if (idx <= 0) return this;

    const current = this.elements[idx];
    const prev = this.elements[idx - 1];

    // Swap positions
    this.elements[idx] = prev;
    this.elements[idx - 1] = current;

    if ((current.zIndex || 0) >= (prev.zIndex || 0)) {
      current.zIndex = Math.max(0, (prev.zIndex || 0) - 1);
    }

    return this;
  }

  /**
   * Deep clone this layout
   * @returns {Layout}
   */
  clone() {
    return new Layout(JSON.parse(JSON.stringify(this.toJSON())));
  }

  /**
   * Create an interpolated copy of this layout
   * @param {Record<string, any>} data
   * @param {object} [options={}]
   * @returns {Layout}
   */
  interpolate(data = {}, options = {}) {
    const raw = this.toJSON();
    const interpolated = interpolate(raw, data, options);
    return new Layout(interpolated);
  }

  /**
   * Serialize to plain JSON layout schema
   * @returns {Record<string, any>}
   */
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      background: this.background,
      elements: this.elements.map(e => (typeof e.toJSON === 'function' ? e.toJSON() : { ...e }))
    };
  }

  /**
   * Parse layout from object or JSON string
   * @param {string | object} input
   * @returns {Layout}
   */
  static from(input) {
    if (!input) {
      throw new LayoutError('Cannot create layout from null or undefined.');
    }

    if (input instanceof Layout) {
      return input.clone();
    }

    let parsed = input;
    if (typeof input === 'string') {
      try {
        parsed = JSON.parse(input);
      } catch (err) {
        throw new LayoutError(`Failed to parse layout JSON string: ${err.message}`, { cause: err });
      }
    }

    if (typeof parsed !== 'object') {
      throw new LayoutError('Layout definition must be an object.');
    }

    return new Layout(parsed);
  }
}

export default Layout;
