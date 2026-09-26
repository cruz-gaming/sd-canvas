/**
 * Leaderboard Rank Card Example
 * SD Canvas - Stacks Development (SD)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Canvas } from '../src/index.js';
import { createSampleAvatar } from './assets.js';

async function run() {
  console.log('Rendering Rank card preset...');

  const canvas = new Canvas();
  canvas.usePreset('rank', {
    username: 'Cruz',
    avatar: createSampleAvatar('Cruz'),
    rank: 1,
    level: 38,
    currentXP: '8,450',
    requiredXP: '10,000',
    progressWidth: 545
  });

  const buffer = await canvas.render();

  const outPath = path.resolve('examples/output_rank.png');
  await fs.writeFile(outPath, buffer);
  console.log(`Saved output to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
