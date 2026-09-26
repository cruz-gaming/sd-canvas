/**
 * SD Canvas Error System
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

export class SDCanvasError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {string} [code='ERR_SD_CANVAS'] - Error code
   * @param {Record<string, any>} [details={}] - Additional contextual information
   */
  constructor(message, code = 'ERR_SD_CANVAS', details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}

export class LayoutError extends SDCanvasError {
  constructor(message, details = {}) {
    super(message, 'ERR_LAYOUT_INVALID', details);
  }
}

export class RenderError extends SDCanvasError {
  constructor(message, details = {}) {
    super(message, 'ERR_RENDER_FAILED', details);
  }
}

export class ImageLoadError extends SDCanvasError {
  constructor(message, details = {}) {
    super(message, 'ERR_IMAGE_LOAD_FAILED', details);
  }
}

export class FontError extends SDCanvasError {
  constructor(message, details = {}) {
    super(message, 'ERR_FONT_FAILED', details);
  }
}

export class ValidationError extends SDCanvasError {
  /**
   * @param {string} message
   * @param {Array<{ field: string, message: string, code: string }>} [errors=[]]
   */
  constructor(message, errors = []) {
    super(message, 'ERR_VALIDATION_FAILED', { validationErrors: errors });
    this.validationErrors = errors;
  }
}

export default {
  SDCanvasError,
  LayoutError,
  RenderError,
  ImageLoadError,
  FontError,
  ValidationError
};
