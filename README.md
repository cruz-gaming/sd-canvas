<div align="center">

# SD Canvas
### by Stacks Development (SD)

**Design Once. Render Everywhere.**

[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg?style=flat-square)](https://www.npmjs.com/package/sd-canvas)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg?style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-purple.svg?style=flat-square)](./LICENSE)
[![Zero Native Build Tooling](https://img.shields.io/badge/build-prebuilt_binaries-success.svg?style=flat-square)](https://github.com/stacks-development/sd-canvas)

*Universal JSON-based canvas rendering engine for Node.js and web applications.*

</div>

---

## 1. Introduction

**SD Canvas** is a modern, modular, production-ready canvas graphics engine built for JavaScript and Node.js. It unifies declarative JSON layouts and a fluent, chainable API into a single universal pipeline. Whether you need Discord welcome and rank cards, server-side dynamic banners, automated social preview cards, or SVG vector outputs, SD Canvas generates pixel-perfect results consistently across environments.

```text
                 SD CANVAS
                      │
                 Layout Schema
                      │
           ┌──────────┼──────────┐
           ↓          ↓          ↓
         Node.js     SVG       Browser
         (Skia)   (Vector)   (Future)
           │          │          │
           └──────────┼──────────┘
                      ↓
               Same visual result
```

---

## 2. Why SD Canvas?

Existing server-side canvas solutions often suffer from critical issues:
- **Flaky native compilation**: Legacy tools like `node-canvas` require system-level C++ compilers (`node-gyp`, Cairo, Pango, Python) that regularly fail on Windows and minimal Docker containers.
- **Tightly coupled frameworks**: Most bot card libraries force hard dependencies on specific versions of `discord.js`.
- **Imperative clutter**: Hardcoding pixel offsets and context state commands makes layouts fragile and difficult to reuse.
- **No vector alternative**: Most engines only output rasterized PNGs with no path to scalable vector graphics.

**SD Canvas fixes this**:
- **Prebuilt Skia Engine**: Uses `@napi-rs/canvas` with precompiled binaries for Windows, macOS, and Linux x64/arm64. Zero C++ compiler required.
- **Dual Universal Renderers**: Seamlessly render to high-resolution raster buffers (**PNG**, **JPEG**, **WebP**) or pure vector **SVG**.
- **Declarative JSON Layouts**: Export, store in databases, or stream layouts from visual web editors.
- **Built-in Security & Caching**: Memory-bounded LRU caching, request timeouts, host whitelisting, and strict size caps on remote assets.
- **Zero Framework Lock-in**: Works out of the box with Discord bots, Express/Fastify APIs, serverless functions, or CLI pipelines.

---

## 3. Installation

Install via npm:

```bash
npm install sd-canvas
```

Requirements:
- **Node.js**: `v18.0.0` or higher (fully tested on Node.js 18, 20, 22, 24).
- **ES Modules**: Modern JavaScript with `import` / `export`.

---

## 4. Quick Start

Create a stunning card in fewer than 10 lines of code:

```js
import { Canvas } from "sd-canvas";
import fs from "node:fs/promises";

// 1. Initialize canvas
const canvas = new Canvas({
  width: 1200,
  height: 500
});

// 2. Build layout fluently
canvas.background({
  type: "gradient",
  direction: "to bottom right",
  colors: ["#0f172a", "#1e293b"]
});

canvas.text({
  text: "Welcome {{username}}!",
  x: 100,
  y: 180,
  fontFamily: "Arial, sans-serif",
  fontSize: 56,
  fontWeight: "bold",
  color: "#ffffff"
});

// 3. Render with dynamic variables
const buffer = await canvas.render({
  username: "Cruz"
});

// 4. Save to disk or send over network
await fs.writeFile("welcome.png", buffer);
console.log("Card rendered successfully!");
```

---

## 5. Basic Rendering

SD Canvas provides fluent builder methods for adding shapes, text, images, and gradients directly to the canvas:

```js
import { Canvas } from "sd-canvas";

const canvas = new Canvas({ width: 1000, height: 400 });

// Set background color or gradient
canvas.background("#111827");

// Add decorative rectangle
canvas.rectangle({
  x: 40,
  y: 40,
  width: 920,
  height: 320,
  radius: 20,
  fill: "#1f2937",
  stroke: "#3b82f6",
  strokeWidth: 2
});

// Add circular avatar
canvas.image({
  src: "https://example.com/avatar.png",
  x: 80,
  y: 100,
  width: 160,
  height: 160,
  circle: true,
  borderColor: "#3b82f6",
  borderWidth: 4
});

// Add text
canvas.text({
  text: "Level Up!",
  x: 280,
  y: 120,
  fontSize: 48,
  fontWeight: "bold",
  color: "#ffffff"
});

const pngBuffer = await canvas.render();
```

---

## 6. JSON Layout System

Layouts can be fully defined as serializable JSON objects. This makes layouts easy to store in databases, edit in visual React builders, and share across teams.

### Schema Example:

```js
const layout = {
  width: 1200,
  height: 500,

  background: {
    type: "gradient",
    direction: "horizontal",
    colors: ["#111111", "#242424"]
  },

  elements: [
    {
      type: "image",
      id: "avatar",
      src: "{{avatar}}",
      x: 70,
      y: 70,
      width: 180,
      height: 180,
      radius: 90,
      circle: true,
      borderColor: "#6366f1",
      borderWidth: 4
    },
    {
      type: "text",
      id: "username",
      x: 300,
      y: 120,
      text: "Welcome {{username}}",
      fontSize: 48,
      fontWeight: 700,
      color: "#ffffff"
    },
    {
      type: "text",
      id: "stats",
      x: 300,
      y: 190,
      text: "Level {{level}} • Rank #{{rank}}",
      fontSize: 24,
      color: "#94a3b8"
    }
  ]
};
```

### Static Rendering:

You can render layouts directly without manually creating a Canvas instance:

```js
import { Canvas } from "sd-canvas";

const buffer = await Canvas.render(layout, {
  username: "Cruz",
  avatar: "https://example.com/cruz.png",
  level: 42,
  rank: 1
});
```

---

## 7. Text System

The text engine supports complete typography controls:

| Property | Type | Description |
| :--- | :--- | :--- |
| `text` | `string` | The text content (supports template tokens like `{{username}}`) |
| `fontFamily` | `string` | Font family (e.g. `'Arial'`, `'Orbitron'`, `'sans-serif'`) |
| `fontSize` | `number` | Font size in pixels (default: `16`) |
| `fontWeight` | `string \| number` | Font weight (`'normal'`, `'bold'`, `400`, `700`) |
| `fontStyle` | `string` | Font style (`'normal'`, `'italic'`) |
| `font` | `string` | CSS font shorthand (e.g. `'bold 42px Arial'`) |
| `color` | `string \| object` | Fill color (hex, rgb, rgba) or gradient configuration |
| `align` | `string` | Horizontal alignment: `'left'`, `'center'`, `'right'` |
| `baseline` | `string` | Text baseline: `'top'`, `'middle'`, `'bottom'`, `'alphabetic'` |
| `lineHeight` | `number` | Spacing between wrapped lines in pixels |
| `letterSpacing`| `number` | Spacing between characters in pixels |
| `maxWidth` | `number` | Maximum line width boundary |
| `wrap` | `boolean` | When `true`, automatically breaks text across multiple lines |
| `ellipsis` | `boolean \| string` | When `true`, truncates overflowing text with `'...'` |
| `maxLines` | `number` | Maximum number of lines permitted when wrapping |
| `strokeColor` | `string` | Outline color |
| `strokeWidth` | `number` | Outline stroke width |
| `opacity` | `number` | Opacity from `0` to `1` |
| `shadowColor` | `string` | Drop shadow color |
| `shadowBlur` | `number` | Shadow blur radius |

```js
canvas.text({
  text: "Hello {{username}}",
  x: 100,
  y: 100,
  fontFamily: "Inter, Arial",
  fontSize: 42,
  fontWeight: "bold",
  color: "#ffffff",
  align: "left",
  maxWidth: 400,
  ellipsis: true
});
```

---

## 8. Images

The image element supports remote HTTP/HTTPS URLs, local disk files, Base64 Data URIs, and raw Buffers.

| Property | Type | Description |
| :--- | :--- | :--- |
| `src` | `string \| Buffer` | Source URL, file path, base64 data URI, or Node Buffer |
| `x`, `y` | `number` | Position coordinates |
| `width`, `height` | `number` | Target dimensions |
| `fit` | `string` | `'cover'` (default), `'contain'`, `'fill'`, or `'none'` |
| `circle` | `boolean` | Clips the image into a circle |
| `radius` | `number \| number[]` | Corner radius for rounded corners |
| `crop` | `object` | Source crop `{ x, y, width, height }` |
| `borderColor` | `string` | Border stroke color |
| `borderWidth` | `number` | Border stroke thickness |
| `opacity` | `number` | Opacity (`0` to `1`) |

```js
canvas.image({
  src: avatarBuffer,
  x: 70,
  y: 70,
  width: 180,
  height: 180,
  circle: true,
  borderColor: "#6366f1",
  borderWidth: 4,
  shadowColor: "rgba(0, 0, 0, 0.5)",
  shadowBlur: 15
});
```

---

## 9. Shapes

SD Canvas includes first-class vector primitives:

### Rectangle

```js
canvas.rectangle({
  x: 50,
  y: 50,
  width: 400,
  height: 200,
  radius: 16,               // Supports single number or [tl, tr, br, bl]
  fill: "#1e293b",
  stroke: "#64748b",
  strokeWidth: 2,
  shadowColor: "rgba(0,0,0,0.5)",
  shadowBlur: 10
});
```

### Circle

```js
canvas.circle({
  cx: 200,
  cy: 200,
  radius: 80,
  fill: "#3b82f6",
  stroke: "#ffffff",
  strokeWidth: 3
});
```

### Line

```js
canvas.line({
  x1: 50,
  y1: 150,
  x2: 600,
  y2: 150,
  color: "#475569",
  width: 2,
  dash: [8, 8],             // Dashed pattern
  cap: "round"              // 'butt', 'round', 'square'
});
```

### Gradient

```js
canvas.gradient({
  x: 0,
  y: 0,
  width: 1200,
  height: 500,
  gradientType: "linear",   // 'linear' or 'radial'
  direction: "to bottom right",
  colors: ["#6366f1", "#ec4899"]
});
```

### Custom Shape / SVG Path

Developers can draw custom SVG paths without breaking layout schemas:

```js
canvas.shape({
  path: "M 10 80 Q 95 10 180 80 T 360 80",
  stroke: "#38bdf8",
  strokeWidth: 4,
  fill: "none"
});
```

---

## 10. Dynamic Variables

SD Canvas includes an interpolation engine with dot-notation support and type preservation.

Tokens formatted as `{{property}}` are automatically replaced during rendering:

```text
{{username}}
{{displayName}}
{{avatar}}
{{guild.name}}
{{user.stats.level}}
{{coins}}
{{date}}
```

### Usage:

```js
await canvas.render(layout, {
  username: "Cruz",
  guild: {
    name: "Stacks Headquarters"
  },
  user: {
    stats: {
      level: 42
    }
  },
  coins: 1500
});
```

### Fallback Behavior:

Missing variables never crash rendering. You can configure fallback values:

```js
// Configurable fallback
const buffer = await canvas.render(data, {
  interpolation: {
    fallback: "N/A",        // Replaces missing keys with 'N/A'
    keepUnresolved: false   // When true, preserves {{missing}}
  }
});
```

---

## 11. Fonts

Register custom TTF, OTF, and WOFF fonts easily:

```js
import { registerFont } from "sd-canvas";

// Reusable global registration
registerFont("./fonts/Orbitron-Bold.ttf", {
  family: "Orbitron",
  weight: "bold"
});
```

Or via instance font manager:

```js
canvas.fonts.register({
  src: "./fonts/Inter-Regular.ttf",
  family: "Inter"
});
```

Missing fonts fall back safely to standard system typography (`Arial`, `sans-serif`).

---

## 12. Layer System

All elements have an explicit or computed `zIndex`. SD Canvas provides layer reordering helpers:

```js
canvas.add(background);
canvas.add(card);
canvas.add(avatar);
canvas.add(username);

// Move elements within the render tree
canvas.bringToFront("avatar");
canvas.sendToBack("background");
canvas.moveForward("card");
canvas.moveBackward("username");
```

---

## 13. Presets System

SD Canvas ships with 5 production-grade built-in presets:

| Preset Name | Description | Key Variables |
| :--- | :--- | :--- |
| `welcome` | Discord / community welcome card | `username`, `avatar`, `guild.name`, `memberCount` |
| `profile` | User profile card with XP bar & stats | `displayName`, `username`, `avatar`, `level`, `rank`, `xp`, `coins` |
| `levelup` | Celebration card for level advancement | `username`, `avatar`, `level` |
| `rank` | Leaderboard rank card with progress bar | `username`, `avatar`, `rank`, `level`, `currentXP`, `requiredXP` |
| `achievement` | Achievement unlock card with gold trophy | `title`, `description`, `points` |

### Using a Preset:

```js
import { Canvas } from "sd-canvas";

const canvas = new Canvas();
canvas.usePreset("welcome", {
  username: "Cruz#0001",
  avatar: "https://example.com/avatar.png",
  guild: { name: "Stacks HQ" },
  memberCount: 1500
});

const buffer = await canvas.render();
```

### Registering Custom Presets:

Create your own reusable presets across your organization:

```js
import { registerPreset } from "sd-canvas";

registerPreset("custom-banner", {
  width: 800,
  height: 250,
  background: "#0f172a",
  elements: [
    { type: "text", id: "heading", text: "{{title}}", x: 50, y: 100, fontSize: 36 }
  ]
});

// Use anywhere
canvas.usePreset("custom-banner", { title: "Special Announcement" });
```

---

## 14. Validation

Validate layout schemas programmatically before execution:

```js
import { validateLayout } from "sd-canvas";

const result = validateLayout(layout);

if (!result.valid) {
  console.error("Layout has errors:", result.errors);
}
```

Validation catches:
- Missing canvas dimensions or negative sizes
- Out-of-bounds canvas dimensions (> 16384px)
- Unknown element types
- Missing required element fields (`text`, `src`, coordinates)
- Non-finite coordinates or invalid z-indexes
- Malformed gradient structures

Enable strict mode to automatically throw `ValidationError`:

```js
validateLayout(layout, { strict: true });
```

---

## 15. SVG & PNG Output

Switch rendering formats by setting the `format` option:

```js
// 1. High-resolution PNG Buffer (default)
const pngBuffer = await canvas.render(data, { format: "png" });

// 2. Compressed JPEG Buffer
const jpgBuffer = await canvas.render(data, { format: "jpeg", quality: 0.85 });

// 3. WebP Buffer
const webpBuffer = await canvas.render(data, { format: "webp" });

// 4. Standards-Compliant Vector SVG String
const svgString = await canvas.render(data, { format: "svg" });
```

---

## 16. Discord.js Integration

SD Canvas does not lock you into any specific Discord library version. It works directly with `discord.js` v14:

```js
import { Client, GatewayIntentBits } from "discord.js";
import { Canvas } from "sd-canvas";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.on("guildMemberAdd", async (member) => {
  const canvas = new Canvas();

  canvas.usePreset("welcome", {
    username: member.user.username,
    avatar: member.user.displayAvatarURL({ extension: "png", size: 256, forceStatic: true }),
    guild: { name: member.guild.name },
    memberCount: member.guild.memberCount
  });

  const buffer = await canvas.render();

  const channel = member.guild.channels.cache.find(c => c.name === "welcome");
  if (channel) {
    await channel.send({
      content: `Welcome to the server, ${member}!`,
      files: [{ attachment: buffer, name: "welcome.png" }]
    });
  }
});
```

---

## 17. Performance & Caching

SD Canvas is optimized for high-throughput microservices and Discord bots:
- **LRU In-Memory Image Cache**: Remote images are downloaded once and cached in memory across render calls.
- **Concurrent Asset Preloading**: When rendering a layout, all external assets are fetched concurrently before painting.
- **Fast Path Rasterization**: Hardware-accelerated Skia backend performs clipping, anti-aliasing, and blitting in compiled C/Rust.
- **Garbage-Collection Friendly**: Buffers and contexts are safely dereferenced without leaks.

Customize image cache behavior:

```js
import { ImageManager, Canvas } from "sd-canvas";

const customImages = new ImageManager({
  cacheMax: 500,              // Keep up to 500 images in memory
  cacheTtl: 1000 * 60 * 30    // 30 minute cache expiration
});

const canvas = new Canvas({ imageManager: customImages });
```

---

## 18. Security

Untrusted inputs from web applications and Discord members are handled safely:
- **Protocol Enforcement**: Only `http:` and `https:` protocols are fetched. Dangerous protocols (`javascript:`, `ftp:`) are blocked.
- **Request Timeouts**: Network requests use `AbortController` timeouts (default: 10s) to prevent hanging.
- **Size Limits**: Enforces maximum download sizes (default: 10MB) to protect against decompression bombs.
- **Host Whitelisting**: Optionally restrict image downloads to trusted domains:

```js
const secureImages = new ImageManager({
  allowedHosts: ["cdn.discordapp.com", "images.unsplash.com"]
});
```

---

## 19. CLI

SD Canvas includes a built-in CLI:

```bash
# Validate a layout file
npx sd-canvas validate layout.json

# Render a layout to an image
npx sd-canvas render layout.json --output welcome.png --data data.json

# Render to vector SVG
npx sd-canvas render layout.json --output card.svg

# Inspect supported presets and features
npx sd-canvas info
```

---

## 20. Error System

SD Canvas provides descriptive errors inheriting from `SDCanvasError`:

```js
import { errors } from "sd-canvas";

try {
  await canvas.render();
} catch (err) {
  if (err instanceof errors.ImageLoadError) {
    console.error("Image failed:", err.message, err.details);
  } else if (err instanceof errors.ValidationError) {
    console.error("Validation failed:", err.validationErrors);
  } else if (err instanceof errors.RenderError) {
    console.error("Rendering failed:", err.message);
  }
}
```

Available error classes:
- `SDCanvasError` (base class)
- `LayoutError`
- `RenderError`
- `ImageLoadError`
- `FontError`
- `ValidationError`

---

## 21. Roadmap

- [x] ES Modules JavaScript Core Engine
- [x] Dual Renderers (Node Skia Canvas & Vector SVG)
- [x] Dynamic variable interpolation with dot notation
- [x] Built-in presets (welcome, profile, levelup, rank, achievement)
- [x] CLI utility for validation and rendering
- [ ] Browser Canvas Renderer (`BrowserRenderer`)
- [ ] Visual React Drag-and-Drop Editor (`sd-canvas-react`)
- [ ] Animated GIF support for premium Discord avatars

---

## 22. Contributing

We welcome contributions from the community!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Run tests to ensure 100% pass rate: `npm test`
4. Commit your changes: `git commit -m 'Add awesome feature'`
5. Push to the branch: `git push origin feature/my-new-feature`
6. Open a Pull Request.

---

## 23. License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

<div align="center">
Made with ❤️ by <b>Stacks Development</b>
</div>
