import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Layout } from '../src/index.js';

describe('Layout System', () => {
  it('should parse layout from plain object', () => {
    const raw = {
      width: 1200,
      height: 600,
      background: '#222222',
      elements: [
        { type: 'text', id: 't1', text: 'Hello', x: 20, y: 30 }
      ]
    };

    const layout = Layout.from(raw);
    assert.equal(layout.width, 1200);
    assert.equal(layout.height, 600);
    assert.equal(layout.elements.length, 1);
    assert.equal(layout.elements[0].text, 'Hello');
  });

  it('should parse layout from JSON string', () => {
    const jsonStr = JSON.stringify({
      width: 500,
      height: 500,
      elements: [{ type: 'circle', radius: 40 }]
    });

    const layout = Layout.from(jsonStr);
    assert.equal(layout.width, 500);
    assert.equal(layout.elements[0].radius, 40);
  });

  it('should clone layout cleanly without referencing originals', () => {
    const layout = new Layout({
      width: 800,
      height: 400,
      elements: [{ type: 'text', id: 'greeting', text: 'Original' }]
    });

    const cloned = layout.clone();
    cloned.get('greeting').text = 'Modified';

    assert.equal(layout.get('greeting').text, 'Original');
    assert.equal(cloned.get('greeting').text, 'Modified');
  });

  it('should interpolate layout elements with dynamic variables', () => {
    const layout = new Layout({
      width: 1000,
      height: 500,
      elements: [
        { type: 'text', id: 'welcome', text: 'Welcome {{user.name}} to {{guild}}!' },
        { type: 'text', id: 'lvl', text: '{{stats.level}}', fontSize: '{{stats.fontSize}}' }
      ]
    });

    const interpolated = layout.interpolate({
      user: { name: 'Cruz' },
      guild: 'Stacks Dev',
      stats: { level: 42, fontSize: 36 }
    });

    assert.equal(interpolated.get('welcome').text, 'Welcome Cruz to Stacks Dev!');
    assert.equal(interpolated.get('lvl').text, '42');
    assert.equal(interpolated.get('lvl').fontSize, 36);
  });
});
