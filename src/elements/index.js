/**
 * Element Registry & Factory
 * Stacks Development (SD)
 */

import { Element } from './Element.js';
import { TextElement } from './Text.js';
import { ImageElement } from './Image.js';
import { RectangleElement } from './Rectangle.js';
import { CircleElement } from './Circle.js';
import { LineElement } from './Line.js';
import { GradientElement } from './Gradient.js';
import { ShapeElement } from './Shape.js';

export {
  Element,
  TextElement,
  ImageElement,
  RectangleElement,
  CircleElement,
  LineElement,
  GradientElement,
  ShapeElement
};

/**
 * Instantiate appropriate Element subclass from config object
 * @param {object} def
 * @returns {Element}
 */
export function createElement(def) {
  if (!def || typeof def !== 'object') {
    throw new Error('Element definition must be an object');
  }

  const type = (def.type || 'element').toLowerCase();

  switch (type) {
    case 'text':
      return new TextElement(def);
    case 'image':
      return new ImageElement(def);
    case 'rectangle':
    case 'rect':
      return new RectangleElement(def);
    case 'circle':
      return new CircleElement(def);
    case 'line':
      return new LineElement(def);
    case 'gradient':
      return new GradientElement(def);
    case 'shape':
    case 'path':
      return new ShapeElement(def);
    default:
      return new Element(def);
  }
}
