/**
 * Vector SVG Export Example
 * SD Canvas - Stacks Development (SD)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Canvas } from '../src/index.js';
import { createSampleAvatar } from './assets.js';

async function run() {
  console.log('Rendering vector SVG...');

  const canvas = new Canvas({
    width: 1000,
    height: 400
  });

  canvas.background({
    type: 'gradient',
    direction: 'to bottom right',
    colors: ['#0f172a', '#1e293b']
  });

  canvas.rectangle({
    x: 30,
    y: 30,
    width: 940,
    height: 340,
    radius: 20,
    fill: 'rgba(30, 41, 59, 0.7)',
    stroke: '#6366f1',
    strokeWidth: 2
  });

  canvas.image({
    src: createSampleAvatar('Cruz'),
    x: 70,
    y: 80,
    width: 140,
    height: 140,
    circle: true,
    borderColor: '#6366f1',
    borderWidth: 4
  });

  canvas.text({
    text: 'VECTOR SVG RENDERING',
    x: 250,
    y: 100,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#818cf8',
    letterSpacing: 2
  });

  canvas.text({
    text: 'Crisp at any resolution.',
    x: 250,
    y: 140,
    fontSize: 44,
    fontWeight: 'bold',
    color: '#ffffff'
  });

  canvas.line({
    x1: 250,
    y1: 220,
    x2: 900,
    y2: 220,
    color: 'rgba(255, 255, 255, 0.2)',
    width: 2,
    dash: [8, 8]
  });

  const svgContent = await canvas.render({}, { format: 'svg' });

  const outPath = path.resolve('examples/output_vector.svg');
  await fs.writeFile(outPath, svgContent, 'utf-8');
  console.log(`Saved vector output to ${outPath} (${(Buffer.byteLength(svgContent) / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
