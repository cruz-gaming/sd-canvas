#!/usr/bin/env node

/**
 * SD Canvas CLI
 * Stacks Development (SD)
 * Design Once. Render Everywhere.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Canvas, validateLayout, listPresets } from '../src/index.js';

const VERSION = '1.0.0';

function printHelp() {
  console.log(`
\x1b[1m\x1b[36mSD Canvas\x1b[0m v${VERSION}
\x1b[90mby Stacks Development (SD)\x1b[0m
\x1b[33mDesign Once. Render Everywhere.\x1b[0m

\x1b[1mUSAGE:\x1b[0m
  sd-canvas <command> [options]

\x1b[1mCOMMANDS:\x1b[0m
  \x1b[32mvalidate <layout.json>\x1b[0m
      Validate a JSON layout schema file against specification.

  \x1b[32mrender <layout.json> --output <file> [--data <data.json>] [--format <png|svg|jpeg>]\x1b[0m
      Render a JSON layout to an image or vector SVG file.

  \x1b[32minfo\x1b[0m
      Display system information, supported elements, and built-in presets.

\x1b[1mOPTIONS:\x1b[0m
  -o, --output <file>    Output destination file path (required for render)
  -d, --data <file>      JSON file containing dynamic template variables
  -f, --format <format>  Output format: png, svg, jpeg, webp (default: derived from file or png)
  -v, --version          Show version number
  -h, --help             Show this help menu
`);
}

function parseCliArgs(args) {
  const flags = {
    output: null,
    data: null,
    format: null,
    help: false,
    version: false
  };

  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg === '--version' || arg === '-v') {
      flags.version = true;
    } else if (arg === '--output' || arg === '-o') {
      flags.output = args[++i];
    } else if (arg === '--data' || arg === '-d') {
      flags.data = args[++i];
    } else if (arg === '--format' || arg === '-f') {
      flags.format = args[++i];
    } else if (arg.startsWith('--output=')) {
      flags.output = arg.slice(9);
    } else if (arg.startsWith('--data=')) {
      flags.data = arg.slice(7);
    } else if (arg.startsWith('--format=')) {
      flags.format = arg.slice(9);
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  return { command: positional[0], positional: positional.slice(1), flags };
}

async function handleValidate(filePath) {
  if (!filePath) {
    console.error('\x1b[31mError:\x1b[0m Please provide a path to a layout JSON file.');
    console.error('Usage: sd-canvas validate <layout.json>');
    process.exit(1);
  }

  const resolved = path.resolve(filePath);
  let layout;
  try {
    const raw = await fs.readFile(resolved, 'utf-8');
    layout = JSON.parse(raw);
  } catch (err) {
    console.error(`\x1b[31mError reading layout file:\x1b[0m ${err.message}`);
    process.exit(1);
  }

  const result = validateLayout(layout);

  if (result.valid) {
    console.log(`\x1b[32m✔ Layout is valid!\x1b[0m (${layout.width}x${layout.height}, ${layout.elements?.length || 0} elements)`);
    process.exit(0);
  } else {
    console.error(`\x1b[31m✖ Layout validation failed with ${result.errors.length} error(s):\x1b[0m\n`);
    for (const err of result.errors) {
      console.error(`  \x1b[33m• [${err.field}]\x1b[0m ${err.message} \x1b[90m(${err.code})\x1b[0m`);
    }
    process.exit(1);
  }
}

async function handleRender(filePath, flags) {
  if (!filePath) {
    console.error('\x1b[31mError:\x1b[0m Please provide a path to a layout JSON file.');
    console.error('Usage: sd-canvas render <layout.json> --output <file>');
    process.exit(1);
  }

  if (!flags.output) {
    console.error('\x1b[31mError:\x1b[0m Missing required output file flag: --output <file>');
    process.exit(1);
  }

  const resolvedLayout = path.resolve(filePath);
  let layout;
  try {
    const raw = await fs.readFile(resolvedLayout, 'utf-8');
    layout = JSON.parse(raw);
  } catch (err) {
    console.error(`\x1b[31mError reading layout file:\x1b[0m ${err.message}`);
    process.exit(1);
  }

  let data = {};
  if (flags.data) {
    try {
      const dataRaw = await fs.readFile(path.resolve(flags.data), 'utf-8');
      data = JSON.parse(dataRaw);
    } catch (err) {
      console.error(`\x1b[31mError reading data file:\x1b[0m ${err.message}`);
      process.exit(1);
    }
  }

  // Determine format from flags or file extension
  let format = flags.format;
  if (!format) {
    const ext = path.extname(flags.output).toLowerCase().replace('.', '');
    format = ext === 'svg' ? 'svg' : (ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : (ext === 'webp' ? 'webp' : 'png'));
  }

  try {
    console.log(`Rendering ${layout.width}x${layout.height} canvas to ${flags.output} (${format})...`);
    const result = await Canvas.render(layout, data, { format });

    const outputPath = path.resolve(flags.output);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    if (typeof result === 'string') {
      await fs.writeFile(outputPath, result, 'utf-8');
    } else {
      await fs.writeFile(outputPath, result);
    }

    const stat = await fs.stat(outputPath);
    console.log(`\x1b[32m✔ Successfully rendered:\x1b[0m ${outputPath} (${(stat.size / 1024).toFixed(1)} KB)`);
    process.exit(0);
  } catch (err) {
    console.error(`\x1b[31mRender failed:\x1b[0m ${err.message}`);
    if (err.details) {
      console.error(err.details);
    }
    process.exit(1);
  }
}

function handleInfo() {
  console.log(`
\x1b[1m\x1b[36mSD Canvas\x1b[0m (v${VERSION})
\x1b[90mStacks Development (SD)\x1b[0m
Tagline: \x1b[33mDesign Once. Render Everywhere.\x1b[0m

\x1b[1mFeatures:\x1b[0m
  • Dual-engine universal rendering (Node.js Skia rasterization & Pure Vector SVG)
  • Dynamic template interpolation with nested keys (e.g. {{user.stats.level}})
  • Full layer management & zIndex ordering
  • In-memory LRU caching for remote images and decoded assets
  • Built-in security (host whitelisting, timeout aborts, byte-size limits)

\x1b[1mSupported Elements:\x1b[0m
  text, image, rectangle, circle, line, gradient, shape/path

\x1b[1mBuilt-in Presets:\x1b[0m
  ${listPresets().map(p => `• ${p}`).join('\n  ')}

\x1b[1mOutput Formats:\x1b[0m
  png, jpeg, webp, svg
`);
}

async function main() {
  const args = process.argv.slice(2);
  const { command, positional, flags } = parseCliArgs(args);

  if (flags.version) {
    console.log(`sd-canvas v${VERSION}`);
    return;
  }

  if (flags.help || !command) {
    printHelp();
    return;
  }

  switch (command.toLowerCase()) {
    case 'validate':
      await handleValidate(positional[0]);
      break;
    case 'render':
      await handleRender(positional[0], flags);
      break;
    case 'info':
      handleInfo();
      break;
    default:
      console.error(`\x1b[31mUnknown command:\x1b[0m "${command}"`);
      printHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error('\x1b[31mUnexpected CLI error:\x1b[0m', err);
  process.exit(1);
});
