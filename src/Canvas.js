/**
 * SD Canvas - Universal Rendering Engine
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { Layout } from './Layout.js';
import { NodeRenderer } from './renderers/NodeRenderer.js';
import { SVGRenderer } from './renderers/SVGRenderer.js';
import { FontManager, defaultFontManager } from './fonts/FontManager.js';
import { ImageManager, defaultImageManager } from './images/ImageManager.js';
import { createPresetLayout } from './presets/index.js';
import { validateLayout } from './validation/validateLayout.js';
import { ValidationError } from './errors/index.js';

export class Canvas {
  /**
   * @param {object} [options={}]
   * @param {number} [options.width=1200]
   * @param {number} [options.height=500]
   * @param {string | object} [options.background]
   * @param {FontManager} [options.fontManager]
   * @param {ImageManager} [options.imageManager]
   */
  constructor(options = {}) {
    this.fonts = options.fontManager || defaultFontManager;
    this.images = options.imageManager || defaultImageManager;

    this.layout = new Layout({
      width: options.width ?? 1200,
      height: options.height ?? 500,
      background: options.background != null ? options.background : null,
      elements: options.elements || []
    });

    this.nodeRenderer = new NodeRenderer({ imageManager: this.images });
    this.svgRenderer = new SVGRenderer({ imageManager: this.images });
  }

  get width() {
    return this.layout.width;
  }

  set width(val) {
    this.layout.width = val;
  }

  get height() {
    return this.layout.height;
  }

  set height(val) {
    this.layout.height = val;
  }

  /**
   * Set canvas background (color, gradient, or image)
   * @param {string | object} bg
   * @returns {this}
   */
  background(bg) {
    this.layout.background = bg;
    return this;
  }

  /**
   * Add a Text element
   * @param {object} options
   * @returns {object} Created Text element
   */
  text(options) {
    return this.layout.add({ ...options, type: 'text' });
  }

  /**
   * Add an Image element
   * @param {object} options
   * @returns {object} Created Image element
   */
  image(options) {
    return this.layout.add({ ...options, type: 'image' });
  }

  /**
   * Add a Rectangle element
   * @param {object} options
   * @returns {object} Created Rectangle element
   */
  rectangle(options) {
    return this.layout.add({ ...options, type: 'rectangle' });
  }

  /**
   * Alias for rectangle
   */
  rect(options) {
    return this.rectangle(options);
  }

  /**
   * Add a Circle element
   * @param {object} options
   * @returns {object} Created Circle element
   */
  circle(options) {
    return this.layout.add({ ...options, type: 'circle' });
  }

  /**
   * Add a Line element
   * @param {object} options
   * @returns {object} Created Line element
   */
  line(options) {
    return this.layout.add({ ...options, type: 'line' });
  }

  /**
   * Add a Gradient element
   * @param {object} options
   * @returns {object} Created Gradient element
   */
  gradient(options) {
    return this.layout.add({ ...options, type: 'gradient' });
  }

  /**
   * Add a Custom Shape / SVG path element
   * @param {object} options
   * @returns {object} Created Shape element
   */
  shape(options) {
    return this.layout.add({ ...options, type: 'shape' });
  }

  /**
   * Add any element definition
   * @param {object} el
   * @returns {object} Created element
   */
  add(el) {
    return this.layout.add(el);
  }

  /**
   * Remove an element by its ID
   * @param {string} id
   * @returns {boolean}
   */
  remove(id) {
    return this.layout.remove(id);
  }

  /**
   * Get an element by ID
   * @param {string} id
   * @returns {object | undefined}
   */
  get(id) {
    return this.layout.get(id);
  }

  /**
   * Layer manipulation: bring element to front
   * @param {string} id
   * @returns {this}
   */
  bringToFront(id) {
    this.layout.bringToFront(id);
    return this;
  }

  /**
   * Layer manipulation: send element to back
   * @param {string} id
   * @returns {this}
   */
  sendToBack(id) {
    this.layout.sendToBack(id);
    return this;
  }

  /**
   * Layer manipulation: move element forward
   * @param {string} id
   * @returns {this}
   */
  moveForward(id) {
    this.layout.moveForward(id);
    return this;
  }

  /**
   * Layer manipulation: move element backward
   * @param {string} id
   * @returns {this}
   */
  moveBackward(id) {
    this.layout.moveBackward(id);
    return this;
  }

  /**
   * Load layout from a preset and apply optional data variables
   * @param {string} name
   * @param {Record<string, any>} [data]
   * @returns {this}
   */
  usePreset(name, data) {
    this.layout = createPresetLayout(name, data);
    return this;
  }

  /**
   * Load layout from JSON object or string
   * @param {string | object} layoutInput
   * @returns {this}
   */
  load(layoutInput) {
    this.layout = Layout.from(layoutInput);
    return this;
  }

  /**
   * Get underlying Layout object
   * @returns {Layout}
   */
  toLayout() {
    return this.layout;
  }

  /**
   * Export to JSON schema
   * @returns {object}
   */
  toJSON() {
    return this.layout.toJSON();
  }

  /**
   * Render canvas to image buffer or SVG string
   *
   * Signatures:
   *   canvas.render(data?, options?)
   *   canvas.render(layout, data?, options?)
   *
   * @param {any} [layoutOrData]
   * @param {any} [dataOrOptions]
   * @param {any} [renderOptions]
   * @returns {Promise<Buffer | string>}
   */
  async render(layoutOrData, dataOrOptions, renderOptions) {
    let targetLayout;
    let data = {};
    let options = {};

    // Detect if first argument is a layout
    const isFirstArgLayout = layoutOrData && (
      layoutOrData instanceof Layout ||
      typeof layoutOrData === 'string' ||
      (typeof layoutOrData === 'object' && (layoutOrData.elements != null || (layoutOrData.width != null && layoutOrData.height != null)))
    );

    if (isFirstArgLayout) {
      targetLayout = Layout.from(layoutOrData);
      data = dataOrOptions || {};
      options = renderOptions || {};
    } else {
      targetLayout = this.layout;
      data = layoutOrData || {};
      options = dataOrOptions || {};
    }

    // Optional validation
    if (options.validate) {
      const valResult = validateLayout(targetLayout, { strict: true });
      if (!valResult.valid) {
        throw new ValidationError('Validation failed before rendering.', valResult.errors);
      }
    }

    // Interpolate variables
    const finalLayout = targetLayout.interpolate(data, options.interpolation);

    // Select format and renderer
    const format = (options.format || 'png').toLowerCase();

    if (format === 'svg') {
      return await this.svgRenderer.render(finalLayout, options);
    }

    return await this.nodeRenderer.render(finalLayout, options);
  }

  /**
   * Static quick-render helper
   * @param {object | string} layout
   * @param {Record<string, any>} [data={}]
   * @param {object} [options={}]
   * @returns {Promise<Buffer | string>}
   */
  static async render(layout, data = {}, options = {}) {
    const canvas = new Canvas();
    return await canvas.render(layout, data, options);
  }
}

export default Canvas;
