/**
 * User Profile Card Example
 * SD Canvas - Stacks Development (SD)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Canvas } from '../src/index.js';
import { createSampleAvatar } from './assets.js';

async function run() {
  console.log('Rendering Profile card preset...');

  const canvas = new Canvas();
  canvas.usePreset('profile', {
    displayName: 'Cruz Martinez',
    username: 'cruz_dev',
    avatar: createSampleAvatar('Cruz'),
    level: 42,
    rank: 1,
    xp: '18,450',
    coins: '4,850',
    progressWidth: 620
  });

  const buffer = await canvas.render();

  const outPath = path.resolve('examples/output_profile.png');
  await fs.writeFile(outPath, buffer);
  console.log(`Saved output to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
