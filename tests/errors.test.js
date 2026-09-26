import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SDCanvasError,
  LayoutError,
  RenderError,
  ImageLoadError,
  FontError,
  ValidationError,
  errors
} from '../src/index.js';

describe('Error System', () => {
  it('all custom errors should inherit from SDCanvasError and Error', () => {
    const layoutErr = new LayoutError('Layout failed');
    const renderErr = new RenderError('Render failed');
    const imageErr = new ImageLoadError('Image failed');
    const fontErr = new FontError('Font failed');
    const valErr = new ValidationError('Validation failed', [{ field: 'w', message: 'err', code: 'E' }]);

    assert.ok(layoutErr instanceof SDCanvasError);
    assert.ok(layoutErr instanceof Error);
    assert.equal(layoutErr.code, 'ERR_LAYOUT_INVALID');

    assert.ok(renderErr instanceof SDCanvasError);
    assert.equal(renderErr.code, 'ERR_RENDER_FAILED');

    assert.ok(imageErr instanceof SDCanvasError);
    assert.equal(imageErr.code, 'ERR_IMAGE_LOAD_FAILED');

    assert.ok(fontErr instanceof SDCanvasError);
    assert.equal(fontErr.code, 'ERR_FONT_FAILED');

    assert.ok(valErr instanceof SDCanvasError);
    assert.equal(valErr.code, 'ERR_VALIDATION_FAILED');
    assert.equal(valErr.validationErrors.length, 1);
  });

  it('should serialize error to JSON cleanly', () => {
    const err = new SDCanvasError('Custom error message', 'ERR_CUSTOM', { foo: 'bar' });
    const json = err.toJSON();

    assert.equal(json.name, 'SDCanvasError');
    assert.equal(json.code, 'ERR_CUSTOM');
    assert.equal(json.message, 'Custom error message');
    assert.deepEqual(json.details, { foo: 'bar' });
  });

  it('should export errors object containing all error classes', () => {
    assert.equal(errors.SDCanvasError, SDCanvasError);
    assert.equal(errors.LayoutError, LayoutError);
    assert.equal(errors.RenderError, RenderError);
    assert.equal(errors.ImageLoadError, ImageLoadError);
    assert.equal(errors.FontError, FontError);
    assert.equal(errors.ValidationError, ValidationError);
  });
});
