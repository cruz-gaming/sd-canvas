import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Canvas } from '../src/index.js';

describe('Canvas API', () => {
  it('should initialize with default dimensions', () => {
    const canvas = new Canvas();
    assert.equal(canvas.width, 1200);
    assert.equal(canvas.height, 500);
  });

  it('should initialize with custom dimensions and background', () => {
    const canvas = new Canvas({
      width: 800,
      height: 600,
      background: '#121212'
    });
    assert.equal(canvas.width, 800);
    assert.equal(canvas.height, 600);
    assert.equal(canvas.layout.background, '#121212');
  });

  it('should add elements via fluent API', () => {
    const canvas = new Canvas();

    const textEl = canvas.text({
      text: 'Hello World',
      x: 100,
      y: 100,
      fontSize: 32,
      color: '#ffffff'
    });

    const rectEl = canvas.rectangle({
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      fill: '#ff0000'
    });

    const circleEl = canvas.circle({
      cx: 300,
      cy: 300,
      radius: 50,
      fill: '#00ff00'
    });

    const lineEl = canvas.line({
      x1: 0,
      y1: 0,
      x2: 100,
      y2: 100,
      color: '#0000ff'
    });

    assert.equal(canvas.layout.elements.length, 4);
    assert.equal(textEl.type, 'text');
    assert.equal(rectEl.type, 'rectangle');
    assert.equal(circleEl.type, 'circle');
    assert.equal(lineEl.type, 'line');
  });

  it('should support layer manipulation (bringToFront, sendToBack, moveForward, moveBackward)', () => {
    const canvas = new Canvas();
    const el1 = canvas.rectangle({ id: 'card', x: 0, y: 0, width: 100, height: 100 });
    const el2 = canvas.text({ id: 'title', text: 'Title', x: 10, y: 10 });
    const el3 = canvas.circle({ id: 'avatar', x: 20, y: 20, radius: 10 });

    assert.deepEqual(canvas.layout.elements.map(e => e.id), ['card', 'title', 'avatar']);

    // Send avatar to back
    canvas.sendToBack('avatar');
    assert.deepEqual(canvas.layout.elements.map(e => e.id), ['avatar', 'card', 'title']);

    // Bring avatar to front
    canvas.bringToFront('avatar');
    assert.deepEqual(canvas.layout.elements.map(e => e.id), ['card', 'title', 'avatar']);

    // Move title backward
    canvas.moveBackward('title');
    assert.deepEqual(canvas.layout.elements.map(e => e.id), ['title', 'card', 'avatar']);

    // Move title forward
    canvas.moveForward('title');
    assert.deepEqual(canvas.layout.elements.map(e => e.id), ['card', 'title', 'avatar']);
  });

  it('should remove elements by ID', () => {
    const canvas = new Canvas();
    canvas.rectangle({ id: 'box1', x: 0, y: 0, width: 50, height: 50 });
    canvas.rectangle({ id: 'box2', x: 10, y: 10, width: 50, height: 50 });

    assert.equal(canvas.layout.elements.length, 2);
    assert.equal(canvas.remove('box1'), true);
    assert.equal(canvas.layout.elements.length, 1);
    assert.equal(canvas.get('box1'), undefined);
    assert.equal(canvas.get('box2')?.id, 'box2');
  });

  it('should serialize to JSON schema', () => {
    const canvas = new Canvas({ width: 1000, height: 400 });
    canvas.background('#000000');
    canvas.text({ text: 'Test', x: 50, y: 50 });

    const json = canvas.toJSON();
    assert.equal(json.width, 1000);
    assert.equal(json.height, 400);
    assert.equal(json.background, '#000000');
    assert.equal(json.elements.length, 1);
    assert.equal(json.elements[0].text, 'Test');
  });
});
