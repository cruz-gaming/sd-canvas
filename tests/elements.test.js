import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TextElement,
  ImageElement,
  RectangleElement,
  CircleElement,
  LineElement,
  GradientElement,
  ShapeElement,
  createElement
} from '../src/elements/index.js';

describe('Elements System', () => {
  it('should instantiate TextElement with default and custom values', () => {
    const text = new TextElement({
      text: 'Sample',
      fontSize: 24,
      fontWeight: 'bold',
      align: 'center',
      color: '#ffcc00'
    });

    assert.equal(text.type, 'text');
    assert.equal(text.text, 'Sample');
    assert.equal(text.fontSize, 24);
    assert.equal(text.fontWeight, 'bold');
    assert.equal(text.align, 'center');
    assert.equal(text.color, '#ffcc00');
  });

  it('should detect circle image if radius >= half width', () => {
    const img = new ImageElement({
      src: 'https://example.com/avatar.png',
      width: 100,
      height: 100,
      radius: 50
    });

    assert.equal(img.circle, true);
  });

  it('should instantiate RectangleElement with radius and stroke', () => {
    const rect = new RectangleElement({
      x: 10,
      y: 20,
      width: 300,
      height: 150,
      fill: '#1e293b',
      stroke: '#3b82f6',
      strokeWidth: 2,
      radius: 12
    });

    assert.equal(rect.type, 'rectangle');
    assert.equal(rect.width, 300);
    assert.equal(rect.height, 150);
    assert.equal(rect.radius, 12);
    assert.equal(rect.strokeWidth, 2);
  });

  it('should instantiate CircleElement with center and radius', () => {
    const circle = new CircleElement({
      cx: 150,
      cy: 150,
      radius: 75,
      fill: '#ffffff'
    });

    assert.equal(circle.type, 'circle');
    assert.equal(circle.cx, 150);
    assert.equal(circle.cy, 150);
    assert.equal(circle.radius, 75);
  });

  it('should instantiate LineElement with coordinates and dash', () => {
    const line = new LineElement({
      x1: 10,
      y1: 10,
      x2: 100,
      y2: 10,
      width: 3,
      dash: [5, 5]
    });

    assert.equal(line.type, 'line');
    assert.equal(line.x1, 10);
    assert.equal(line.x2, 100);
    assert.deepEqual(line.dash, [5, 5]);
  });

  it('should instantiate GradientElement and normalize stops', () => {
    const grad = new GradientElement({
      direction: 'horizontal',
      colors: ['#000000', '#ffffff']
    });

    assert.equal(grad.type, 'gradient');
    assert.equal(grad.stops.length, 2);
    assert.equal(grad.stops[0].offset, 0);
    assert.equal(grad.stops[1].offset, 1);
  });

  it('should create elements via createElement factory', () => {
    const t = createElement({ type: 'text', text: 'Factory' });
    const r = createElement({ type: 'rectangle', width: 100, height: 100 });
    const c = createElement({ type: 'circle', radius: 50 });
    const s = createElement({ type: 'shape', path: 'M 0 0 L 10 10' });

    assert.ok(t instanceof TextElement);
    assert.ok(r instanceof RectangleElement);
    assert.ok(c instanceof CircleElement);
    assert.ok(s instanceof ShapeElement);
  });
});
