/**
 * Text Element
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { Element } from './Element.js';

export class TextElement extends Element {
  /**
   * @param {object} [options={}]
   */
  constructor(options = {}) {
    super({ ...options, type: 'text' });

    this.text = options.text != null ? String(options.text) : '';
    this.font = options.font || null;
    this.fontFamily = options.fontFamily || options.family || 'sans-serif';
    this.fontSize = options.fontSize || options.size || 16;
    this.fontWeight = options.fontWeight || options.weight || 'normal';
    this.fontStyle = options.fontStyle || (options.italic ? 'italic' : 'normal');
    this.color = options.color || options.fill || '#ffffff';

    // Alignment
    this.align = options.align || options.textAlign || 'left';
    this.baseline = options.baseline || options.textBaseline || 'top';

    // Formatting & Layout
    this.lineHeight = options.lineHeight ?? null;
    this.letterSpacing = options.letterSpacing ?? 0;
    this.maxWidth = options.maxWidth ?? null;
    this.maxLines = options.maxLines ?? Infinity;
    this.wrap = options.wrap ?? false;
    this.ellipsis = options.ellipsis ?? false;

    // Stroke
    this.strokeColor = options.strokeColor || options.stroke || null;
    this.strokeWidth = options.strokeWidth ?? 0;
  }
}

export default TextElement;
