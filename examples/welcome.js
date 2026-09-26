/**
 * Discord / Community Welcome Card Example
 * SD Canvas - Stacks Development (SD)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Canvas } from '../src/index.js';
import { createSampleAvatar } from './assets.js';

async function run() {
  console.log('Rendering Welcome card preset...');

  const canvas = new Canvas();
  canvas.usePreset('welcome', {
    username: 'Cruz#0001',
    avatar: createSampleAvatar('Cruz'),
    guild: {
      name: 'Stacks Development'
    },
    memberCount: 1482
  });

  const buffer = await canvas.render();

  const outPath = path.resolve('examples/output_welcome.png');
  await fs.writeFile(outPath, buffer);
  console.log(`Saved output to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
