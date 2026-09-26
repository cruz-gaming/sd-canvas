/**
 * Base Element Class
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

let elementCounter = 0;

export class Element {
  /**
   * @param {object} [options={}]
   */
  constructor(options = {}) {
    this.type = options.type || 'element';
    this.id = options.id || `${this.type}_${++elementCounter}`;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.width = options.width ?? 0;
    this.height = options.height ?? 0;
    this.zIndex = options.zIndex ?? 0;
    this.opacity = options.opacity ?? 1;
    this.rotation = options.rotation ?? 0; // In degrees

    // Shadow support
    this.shadowColor = options.shadowColor || null;
    this.shadowBlur = options.shadowBlur ?? 0;
    this.shadowOffsetX = options.shadowOffsetX ?? 0;
    this.shadowOffsetY = options.shadowOffsetY ?? 0;
    if (options.shadow) {
      if (typeof options.shadow === 'object') {
        this.shadowColor = options.shadow.color || this.shadowColor;
        this.shadowBlur = options.shadow.blur ?? this.shadowBlur;
        this.shadowOffsetX = options.shadow.offsetX ?? this.shadowOffsetX;
        this.shadowOffsetY = options.shadow.offsetY ?? this.shadowOffsetY;
      }
    }
  }

  /**
   * Clone this element with optional overrides
   * @param {object} [overrides={}]
   * @returns {this}
   */
  clone(overrides = {}) {
    return new this.constructor({
      ...this.toJSON(),
      ...overrides
    });
  }

  /**
   * Serialize element to plain JSON
   * @returns {Record<string, any>}
   */
  toJSON() {
    const data = { ...this };
    return data;
  }
}

export default Element;
