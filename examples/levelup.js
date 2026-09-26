/**
 * Level-Up Card Example
 * SD Canvas - Stacks Development (SD)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Canvas } from '../src/index.js';
import { createSampleAvatar } from './assets.js';

async function run() {
  console.log('Rendering Level-up card preset...');

  const canvas = new Canvas();
  canvas.usePreset('levelup', {
    username: 'Cruz',
    avatar: createSampleAvatar('Cruz'),
    level: 50
  });

  const buffer = await canvas.render();

  const outPath = path.resolve('examples/output_levelup.png');
  await fs.writeFile(outPath, buffer);
  console.log(`Saved output to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
