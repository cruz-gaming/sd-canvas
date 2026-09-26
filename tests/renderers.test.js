import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Canvas, NodeRenderer, SVGRenderer, Layout } from '../src/index.js';

const TINY_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('Renderers (Node & SVG)', () => {
  const sampleLayout = {
    width: 600,
    height: 300,
    background: {
      type: 'gradient',
      direction: 'to bottom right',
      colors: ['#1e1b4b', '#0f172a']
    },
    elements: [
      {
        type: 'rectangle',
        id: 'box',
        x: 20,
        y: 20,
        width: 560,
        height: 260,
        radius: 16,
        fill: '#1e293b',
        stroke: '#3b82f6',
        strokeWidth: 2
      },
      {
        type: 'circle',
        id: 'dot',
        cx: 80,
        cy: 80,
        radius: 30,
        fill: '#10b981'
      },
      {
        type: 'image',
        id: 'avatar',
        src: TINY_PNG_BASE64,
        x: 130,
        y: 50,
        width: 60,
        height: 60,
        circle: true
      },
      {
        type: 'text',
        id: 'title',
        x: 210,
        y: 65,
        text: 'Hello World',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff'
      },
      {
        type: 'line',
        id: 'divider',
        x1: 40,
        y1: 140,
        x2: 560,
        y2: 140,
        color: '#475569',
        width: 1
      }
    ]
  };

  it('NodeRenderer should generate a valid PNG buffer with PNG signature', async () => {
    const renderer = new NodeRenderer();
    const buffer = await renderer.render(sampleLayout, { format: 'png' });

    assert.ok(Buffer.isBuffer(buffer));
    assert.ok(buffer.length > 0);

    // PNG signature: 89 50 4E 47
    assert.equal(buffer[0], 0x89);
    assert.equal(buffer[1], 0x50); // P
    assert.equal(buffer[2], 0x4e); // N
    assert.equal(buffer[3], 0x47); // G
  });

  it('NodeRenderer should generate a valid JPEG buffer', async () => {
    const renderer = new NodeRenderer();
    const buffer = await renderer.render(sampleLayout, { format: 'jpeg' });

    assert.ok(Buffer.isBuffer(buffer));
    assert.ok(buffer.length > 0);

    // JPEG SOI marker: FF D8
    assert.equal(buffer[0], 0xff);
    assert.equal(buffer[1], 0xd8);
  });

  it('SVGRenderer should generate valid SVG XML string', async () => {
    const renderer = new SVGRenderer();
    const svg = await renderer.render(sampleLayout);

    assert.equal(typeof svg, 'string');
    assert.ok(svg.startsWith('<?xml version="1.0"'));
    assert.ok(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(svg.includes('viewBox="0 0 600 300"'));
    assert.ok(svg.includes('<linearGradient'));
    assert.ok(svg.includes('<rect'));
    assert.ok(svg.includes('<circle'));
    assert.ok(svg.includes('<line'));
    assert.ok(svg.includes('<text'));
    assert.ok(svg.includes('Hello World'));
    assert.ok(svg.includes('</svg>'));
  });

  it('SVGRenderer should output buffer when requested', async () => {
    const renderer = new SVGRenderer();
    const buffer = await renderer.render(sampleLayout, { asBuffer: true });

    assert.ok(Buffer.isBuffer(buffer));
    assert.ok(buffer.toString('utf-8').includes('<svg'));
  });

  it('Canvas.render should seamlessly switch to SVG when format: "svg" is passed', async () => {
    const canvas = new Canvas();
    const svgResult = await canvas.render(sampleLayout, {}, { format: 'svg' });

    assert.equal(typeof svgResult, 'string');
    assert.ok(svgResult.includes('<svg'));
  });
});
