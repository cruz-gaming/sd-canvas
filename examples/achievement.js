/**
 * Achievement Unlock Card Example
 * SD Canvas - Stacks Development (SD)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Canvas } from '../src/index.js';

async function run() {
  console.log('Rendering Achievement card preset...');

  const canvas = new Canvas();
  canvas.usePreset('achievement', {
    title: 'First Contribution',
    description: 'Successfully submitted your first pull request to the Stacks ecosystem.',
    points: 250
  });

  const buffer = await canvas.render();

  const outPath = path.resolve('examples/output_achievement.png');
  await fs.writeFile(outPath, buffer);
  console.log(`Saved output to ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
