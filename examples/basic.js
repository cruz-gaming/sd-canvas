/**
 * Basic Fluent API Example
 * SD Canvas - Stacks Development (SD)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Canvas } from '../src/index.js';
import { createSampleAvatar } from './assets.js';

async function run() {
  console.log('Rendering basic canvas with fluent API...');

  const canvas = new Canvas({
    width: 1200,
    height: 500
  });

  // Background gradient
  canvas.background({
    type: 'gradient',
    direction: 'to bottom right',
    colors: ['#090d16', '#1e293b']
  });

  // Decorative card
  canvas.rectangle({
    x: 40,
    y: 40,
    width: 1120,
    height: 420,
    radius: 24,
    fill: 'rgba(30, 41, 59, 0.7)',
    stroke: 'rgba(56, 189, 248, 0.3)',
    strokeWidth: 2,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowBlur: 20
  });

  // User avatar
  canvas.image({
    src: createSampleAvatar('Cruz'),
    x: 80,
    y: 110,
    width: 180,
    height: 180,
    circle: true,
    borderColor: '#38bdf8',
    borderWidth: 6
  });

  // Title text with variable
  canvas.text({
    text: 'Welcome {{username}}',
    x: 300,
    y: 140,
    fontFamily: 'Arial, sans-serif',
    fontSize: 52,
    fontWeight: 'bold',
    color: '#ffffff'
  });

  // Subtitle
  canvas.text({
    text: 'Design Once. Render Everywhere.',
    x: 300,
    y: 215,
    fontFamily: 'Arial, sans-serif',
    fontSize: 24,
    color: '#94a3b8'
  });

  // Render to buffer with interpolation
  const buffer = await canvas.render({
    username: 'Cruz'
  });

  const outPath = path.resolve('examples/output_basic.png');
  await fs.writeFile(outPath, buffer);
  console.log(`Saved output to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
