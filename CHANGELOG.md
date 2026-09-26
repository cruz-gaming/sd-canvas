# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-26

### Added
- **Core Engine**: Universal Canvas rendering engine built with modern ES Modules.
- **Fluent Canvas API**: Intuitive chainable methods (`background`, `text`, `image`, `rectangle`, `circle`, `line`, `gradient`, `shape`).
- **JSON Layout System**: Declarative, portable layout schema compatible with visual editors and headless microservices.
- **Dual Renderers**:
  - `NodeRenderer`: High-performance hardware-accelerated Skia rasterizer delivering PNG, JPEG, and WebP buffers.
  - `SVGRenderer`: Zero-dependency, standards-compliant vector SVG generator with scalable defs and filters.
- **Dynamic Variables**: Deep template interpolation supporting `{{user.name}}`, nested property trees, and customizable fallbacks.
- **Layer & Z-Index Management**: Full layer control via `bringToFront`, `sendToBack`, `moveForward`, `moveBackward`, and layout z-index ordering.
- **Built-in Presets**:
  - `welcome`: Modern Discord community welcome banner with avatar framing.
  - `profile`: Full user profile card with XP bar, banner, and stats pills.
  - `levelup`: Celebratory level advancement card with glowing badge.
  - `rank`: Leaderboard rank card with percentage progress track.
  - `achievement`: Sleek achievement unlock card with trophy badges.
- **Extensible Preset Registry**: `registerPreset(name, layout)` and `usePreset(name, data)`.
- **Secure Image Manager**:
  - In-memory LRU caching with configurable TTL and entry limits.
  - Support for HTTP/HTTPS URLs, local files, raw Buffers, and Base64 Data URIs.
  - Security protections: protocol validation, request timeouts via `AbortController`, allowed-host whitelist, and byte limits.
- **Font Manager**: Reusable font registration with system font fallbacks.
- **Layout Validation**: Comprehensive validator with informative field-level error diagnostics.
- **CLI Utility**: `sd-canvas validate`, `sd-canvas render`, and `sd-canvas info` commands powered by native Node utilities.
- **Discord.js Compatibility**: Seamless integration pattern for Discord bots without requiring framework lock-in.
