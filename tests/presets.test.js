import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  Canvas,
  listPresets,
  getPreset,
  registerPreset,
  createPresetLayout
} from '../src/index.js';

const TINY_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('Presets System', () => {
  it('should list all built-in presets', () => {
    const presets = listPresets();
    assert.ok(presets.includes('welcome'));
    assert.ok(presets.includes('profile'));
    assert.ok(presets.includes('levelup'));
    assert.ok(presets.includes('rank'));
    assert.ok(presets.includes('achievement'));
  });

  it('should render welcome preset with data', async () => {
    const canvas = new Canvas();
    canvas.usePreset('welcome', {
      username: 'Cruz',
      avatar: TINY_PNG_BASE64,
      guild: { name: 'Stacks HQ' },
      memberCount: 1337
    });

    const buffer = await canvas.render();
    assert.ok(Buffer.isBuffer(buffer));
    assert.equal(buffer[0], 0x89); // PNG
  });

  it('should render profile preset with data', async () => {
    const canvas = new Canvas();
    canvas.usePreset('profile', {
      username: 'Cruz',
      displayName: 'Cruz Developer',
      avatar: TINY_PNG_BASE64,
      level: 45,
      rank: 1,
      xp: '12,500',
      coins: '3,400',
      progressWidth: 500
    });

    const buffer = await canvas.render();
    assert.ok(Buffer.isBuffer(buffer));
  });

  it('should render levelup preset with data', async () => {
    const canvas = new Canvas();
    canvas.usePreset('levelup', {
      username: 'Cruz',
      avatar: TINY_PNG_BASE64,
      level: 50
    });

    const buffer = await canvas.render();
    assert.ok(Buffer.isBuffer(buffer));
  });

  it('should render rank preset with data', async () => {
    const canvas = new Canvas();
    canvas.usePreset('rank', {
      username: 'Cruz',
      avatar: TINY_PNG_BASE64,
      rank: 3,
      level: 25,
      currentXP: 4500,
      requiredXP: 5000,
      progressWidth: 400
    });

    const buffer = await canvas.render();
    assert.ok(Buffer.isBuffer(buffer));
  });

  it('should render achievement preset with data', async () => {
    const canvas = new Canvas();
    canvas.usePreset('achievement', {
      title: 'Master Architect',
      description: 'Built a production-grade canvas engine with zero flaws.',
      points: 1000
    });

    const buffer = await canvas.render();
    assert.ok(Buffer.isBuffer(buffer));
  });

  it('should support registering and rendering custom presets', async () => {
    registerPreset('custom-banner', {
      width: 800,
      height: 200,
      background: '#333333',
      elements: [
        { type: 'text', id: 'headline', text: 'HELLO {{name}}', x: 50, y: 50 }
      ]
    });

    const canvas = new Canvas();
    canvas.usePreset('custom-banner', { name: 'STACKS' });
    const headline = canvas.get('headline');
    assert.equal(headline.text, 'HELLO STACKS');

    const buffer = await canvas.render();
    assert.ok(Buffer.isBuffer(buffer));
  });
});
