import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { interpolate, getNestedValue, interpolateString } from '../src/templates/interpolate.js';

describe('Template Interpolation', () => {
  it('should safely extract nested properties via dot notation', () => {
    const data = {
      user: {
        profile: {
          name: 'Cruz',
          scores: [100, 200]
        }
      }
    };

    assert.equal(getNestedValue(data, 'user.profile.name'), 'Cruz');
    assert.equal(getNestedValue(data, 'user.profile.scores.0'), 100);
    assert.equal(getNestedValue(data, 'user.profile.missing'), undefined);
    assert.equal(getNestedValue(data, 'nonexistent.prop'), undefined);
  });

  it('should interpolate simple and multiple string variables', () => {
    const str = 'Hello {{username}}, you have {{coins}} coins in {{guild.name}}!';
    const result = interpolateString(str, {
      username: 'Alice',
      coins: 500,
      guild: { name: 'SD Community' }
    });

    assert.equal(result, 'Hello Alice, you have 500 coins in SD Community!');
  });

  it('should preserve types for solitary tokens', () => {
    const numTemplate = '{{level}}';
    const boolTemplate = '{{premium}}';
    const resultNum = interpolateString(numTemplate, { level: 99 });
    const resultBool = interpolateString(boolTemplate, { premium: true });

    assert.equal(resultNum, 99);
    assert.equal(typeof resultNum, 'number');
    assert.equal(resultBool, true);
    assert.equal(typeof resultBool, 'boolean');
  });

  it('should handle missing variables with fallback without crashing', () => {
    const str = 'User: {{missingUser}}!';
    const resultDefault = interpolateString(str, {});
    const resultCustom = interpolateString(str, {}, { fallback: 'Anonymous' });
    const resultKeep = interpolateString(str, {}, { keepUnresolved: true });

    assert.equal(resultDefault, 'User: !');
    assert.equal(resultCustom, 'User: Anonymous!');
    assert.equal(resultKeep, 'User: {{missingUser}}!');
  });

  it('should deeply interpolate arrays and nested objects', () => {
    const obj = {
      title: 'Welcome {{name}}',
      badge: {
        text: 'Rank #{{rank}}',
        visible: '{{isVisible}}'
      },
      tags: ['{{tag1}}', '{{tag2}}']
    };

    const result = interpolate(obj, {
      name: 'Cruz',
      rank: 1,
      isVisible: true,
      tag1: 'VIP',
      tag2: 'Admin'
    });

    assert.deepEqual(result, {
      title: 'Welcome Cruz',
      badge: {
        text: 'Rank #1',
        visible: true
      },
      tags: ['VIP', 'Admin']
    });
  });
});
