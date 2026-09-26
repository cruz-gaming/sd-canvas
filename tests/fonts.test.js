import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FontManager, registerFont } from '../src/fonts/FontManager.js';
import { FontError } from '../src/errors/index.js';

describe('FontManager', () => {
  it('should throw FontError if font file does not exist', () => {
    const mgr = new FontManager();
    assert.throws(
      () => mgr.register('./non_existent_font_file.ttf', { family: 'TestFont' }),
      (err) => err instanceof FontError && err.message.includes('does not exist')
    );
  });

  it('should throw FontError if path is missing', () => {
    const mgr = new FontManager();
    assert.throws(
      () => mgr.register({}),
      (err) => err instanceof FontError
    );
  });

  it('should export global registerFont function', () => {
    assert.equal(typeof registerFont, 'function');
  });
});
