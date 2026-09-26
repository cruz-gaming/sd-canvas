import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ImageManager } from '../src/images/ImageManager.js';
import { ImageLoadError } from '../src/errors/index.js';

const TINY_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const TINY_PNG_BUFFER = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

describe('ImageManager', () => {
  it('should load image from Buffer', async () => {
    const mgr = new ImageManager();
    const result = await mgr.load(TINY_PNG_BUFFER);

    assert.ok(result.image);
    assert.equal(result.width, 1);
    assert.equal(result.height, 1);
    assert.ok(Buffer.isBuffer(result.buffer));
  });

  it('should load image from base64 data URI', async () => {
    const mgr = new ImageManager();
    const result = await mgr.load(TINY_PNG_BASE64);

    assert.ok(result.image);
    assert.equal(result.width, 1);
    assert.equal(result.height, 1);
  });

  it('should cache loaded images and retrieve from cache', async () => {
    const mgr = new ImageManager();
    const res1 = await mgr.load(TINY_PNG_BASE64);
    assert.equal(mgr.cache.size, 1);

    const res2 = await mgr.load(TINY_PNG_BASE64);
    assert.equal(res1, res2); // Same object reference from cache
  });

  it('should reject disallowed protocols (e.g. ftp, javascript)', async () => {
    const mgr = new ImageManager();
    await assert.rejects(
      async () => mgr.load('javascript:alert(1)'),
      (err) => err instanceof ImageLoadError
    );
  });

  it('should reject URLs not in allowedHosts whitelist', async () => {
    const mgr = new ImageManager({ allowedHosts: ['cdn.example.com'] });
    await assert.rejects(
      async () => mgr.load('https://malicious-site.com/image.png'),
      (err) => err instanceof ImageLoadError && err.message.includes('not in the allowed hosts list')
    );
  });

  it('should reject images exceeding maxSizeBytes', async () => {
    const mgr = new ImageManager({ maxSizeBytes: 10 }); // 10 bytes limit
    await assert.rejects(
      async () => mgr.load(TINY_PNG_BUFFER), // buffer is ~70 bytes
      (err) => err instanceof ImageLoadError && err.message.includes('exceeds limit')
    );
  });
});
