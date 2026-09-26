import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateLayout } from '../src/index.js';
import { ValidationError } from '../src/errors/index.js';

describe('Layout Validation', () => {
  it('should validate a correct layout schema', () => {
    const layout = {
      width: 1200,
      height: 500,
      background: '#000000',
      elements: [
        { type: 'text', id: 't1', text: 'Hello', x: 50, y: 50 },
        { type: 'rectangle', width: 200, height: 100 }
      ]
    };

    const res = validateLayout(layout);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
  });

  it('should detect missing width and height', () => {
    const res = validateLayout({});
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'ERR_MISSING_WIDTH'));
    assert.ok(res.errors.some(e => e.code === 'ERR_MISSING_HEIGHT'));
  });

  it('should detect negative or non-finite dimensions', () => {
    const res = validateLayout({ width: -100, height: Infinity });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'ERR_INVALID_WIDTH'));
    assert.ok(res.errors.some(e => e.code === 'ERR_INVALID_HEIGHT'));
  });

  it('should detect unknown element types', () => {
    const res = validateLayout({
      width: 500,
      height: 500,
      elements: [
        { type: 'unsupported_3d_mesh', id: 'mesh' }
      ]
    });

    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'ERR_UNKNOWN_ELEMENT_TYPE'));
  });

  it('should detect missing required element properties', () => {
    const res = validateLayout({
      width: 500,
      height: 500,
      elements: [
        { type: 'text' }, // missing 'text'
        { type: 'image' } // missing 'src'
      ]
    });

    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.code === 'ERR_MISSING_TEXT'));
    assert.ok(res.errors.some(e => e.code === 'ERR_MISSING_IMAGE_SRC'));
  });

  it('should throw ValidationError when strict mode is enabled', () => {
    assert.throws(
      () => {
        validateLayout({ width: 0, height: 0 }, { strict: true });
      },
      (err) => {
        return err instanceof ValidationError && err.validationErrors.length > 0;
      }
    );
  });
});
