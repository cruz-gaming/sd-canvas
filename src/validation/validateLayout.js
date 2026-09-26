/**
 * Layout and Element Validator
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import { ValidationError } from '../errors/index.js';
import { isValidColor, isGradient } from '../utils/color.js';

const VALID_ELEMENT_TYPES = new Set([
  'text',
  'image',
  'rectangle',
  'rect',
  'circle',
  'line',
  'gradient',
  'shape',
  'path'
]);

const MAX_CANVAS_DIMENSION = 16384;

/**
 * Validate a layout object
 *
 * @param {object} layout
 * @param {object} [options={}]
 * @param {boolean} [options.strict=false] - If true, throws ValidationError on failure
 * @returns {{ valid: boolean, errors: Array<{ field: string, message: string, code: string }> }}
 */
export function validateLayout(layout, options = {}) {
  const errors = [];

  if (!layout || typeof layout !== 'object' || Array.isArray(layout)) {
    errors.push({
      field: 'layout',
      message: 'Layout must be an object.',
      code: 'ERR_INVALID_LAYOUT_TYPE'
    });
    return finalizeResult(errors, options);
  }

  // 1. Dimensions validation
  if (layout.width == null) {
    errors.push({
      field: 'width',
      message: 'Layout width is required.',
      code: 'ERR_MISSING_WIDTH'
    });
  } else if (typeof layout.width !== 'number' || !Number.isFinite(layout.width) || layout.width <= 0) {
    errors.push({
      field: 'width',
      message: `Layout width must be a positive finite number, received: ${layout.width}`,
      code: 'ERR_INVALID_WIDTH'
    });
  } else if (layout.width > MAX_CANVAS_DIMENSION) {
    errors.push({
      field: 'width',
      message: `Layout width exceeds maximum allowed (${MAX_CANVAS_DIMENSION}px): ${layout.width}`,
      code: 'ERR_EXCEEDS_MAX_WIDTH'
    });
  }

  if (layout.height == null) {
    errors.push({
      field: 'height',
      message: 'Layout height is required.',
      code: 'ERR_MISSING_HEIGHT'
    });
  } else if (typeof layout.height !== 'number' || !Number.isFinite(layout.height) || layout.height <= 0) {
    errors.push({
      field: 'height',
      message: `Layout height must be a positive finite number, received: ${layout.height}`,
      code: 'ERR_INVALID_HEIGHT'
    });
  } else if (layout.height > MAX_CANVAS_DIMENSION) {
    errors.push({
      field: 'height',
      message: `Layout height exceeds maximum allowed (${MAX_CANVAS_DIMENSION}px): ${layout.height}`,
      code: 'ERR_EXCEEDS_MAX_HEIGHT'
    });
  }

  // 2. Background validation (optional)
  if (layout.background != null) {
    validateBackground(layout.background, errors);
  }

  // 3. Elements validation
  if (layout.elements != null) {
    if (!Array.isArray(layout.elements)) {
      errors.push({
        field: 'elements',
        message: 'Elements must be an array.',
        code: 'ERR_INVALID_ELEMENTS'
      });
    } else {
      layout.elements.forEach((el, index) => {
        validateElement(el, index, errors);
      });
    }
  }

  return finalizeResult(errors, options);
}

function validateBackground(bg, errors) {
  if (typeof bg === 'string') {
    // string color or url or gradient keyword
    return;
  }
  if (typeof bg === 'object' && bg !== null) {
    if (bg.type === 'gradient' || bg.type === 'linear' || bg.type === 'radial') {
      validateGradient(bg, 'background', errors);
    } else if (bg.type === 'color') {
      if (bg.color && !isValidColor(bg.color)) {
        errors.push({
          field: 'background.color',
          message: `Invalid background color value: ${bg.color}`,
          code: 'ERR_INVALID_COLOR'
        });
      }
    } else if (bg.type === 'image') {
      if (!bg.src) {
        errors.push({
          field: 'background.src',
          message: 'Background image requires a "src" property.',
          code: 'ERR_MISSING_SRC'
        });
      }
    }
  }
}

function validateElement(el, index, errors) {
  const prefix = `elements[${index}]`;

  if (!el || typeof el !== 'object' || Array.isArray(el)) {
    errors.push({
      field: prefix,
      message: `Element at index ${index} must be an object.`,
      code: 'ERR_INVALID_ELEMENT'
    });
    return;
  }

  // Check type
  if (!el.type || typeof el.type !== 'string') {
    errors.push({
      field: `${prefix}.type`,
      message: `Element at index ${index} is missing a valid "type" property.`,
      code: 'ERR_MISSING_ELEMENT_TYPE'
    });
    return;
  }

  const type = el.type.toLowerCase();
  if (!VALID_ELEMENT_TYPES.has(type)) {
    errors.push({
      field: `${prefix}.type`,
      message: `Unknown element type: "${el.type}". Allowed types: ${[...VALID_ELEMENT_TYPES].join(', ')}`,
      code: 'ERR_UNKNOWN_ELEMENT_TYPE'
    });
  }

  // Check zIndex if specified
  if (el.zIndex != null && (!Number.isFinite(el.zIndex) || typeof el.zIndex !== 'number')) {
    errors.push({
      field: `${prefix}.zIndex`,
      message: `Element zIndex must be a finite number: ${el.zIndex}`,
      code: 'ERR_INVALID_ZINDEX'
    });
  }

  // Check opacity if specified
  if (el.opacity != null && (typeof el.opacity !== 'number' || el.opacity < 0 || el.opacity > 1)) {
    errors.push({
      field: `${prefix}.opacity`,
      message: `Element opacity must be a number between 0 and 1: ${el.opacity}`,
      code: 'ERR_INVALID_OPACITY'
    });
  }

  // Element specific validation
  switch (type) {
    case 'text':
      if (el.text == null) {
        errors.push({
          field: `${prefix}.text`,
          message: 'Text element requires a "text" property.',
          code: 'ERR_MISSING_TEXT'
        });
      }
      break;

    case 'image':
      if (!el.src) {
        errors.push({
          field: `${prefix}.src`,
          message: 'Image element requires a "src" property.',
          code: 'ERR_MISSING_IMAGE_SRC'
        });
      }
      break;

    case 'line':
      if (el.x1 == null || el.y1 == null || el.x2 == null || el.y2 == null) {
        // Can also be from / to
        if (!el.from || !el.to || el.from.x == null || el.to.x == null) {
          errors.push({
            field: `${prefix}`,
            message: 'Line element requires coordinates (x1, y1, x2, y2) or (from, to).',
            code: 'ERR_MISSING_LINE_COORDS'
          });
        }
      }
      break;

    case 'gradient':
      validateGradient(el, prefix, errors);
      break;
  }
}

function validateGradient(grad, prefix, errors) {
  if (!grad.colors && !grad.stops) {
    errors.push({
      field: `${prefix}`,
      message: 'Gradient requires "colors" or "stops" array.',
      code: 'ERR_MISSING_GRADIENT_STOPS'
    });
  }
}

function finalizeResult(errors, options) {
  const valid = errors.length === 0;
  if (!valid && options.strict) {
    const msg = errors.map(e => `[${e.field}] ${e.message}`).join('; ');
    throw new ValidationError(`Layout validation failed: ${msg}`, errors);
  }
  return { valid, errors };
}

export default validateLayout;
