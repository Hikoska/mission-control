# \ud83d\ude80 Mission Control \u2014 Linkgrow

Personal command center desktop app for managing all Linkgrow operations from one screen.

**Stack:** Tauri 2.0 + React 19 + TypeScript + Tailwind CSS 4

## Quick Start

### Prerequisites
1. **Node.js LTS** \u2014 [nodejs.org](https://nodejs.org)
2. **Rust** \u2014 `winget install Rustlang.Rustup` (PowerShell)

### Run
```bash
npm install
npm run tauri dev
```

Or browser-only: `npm run dev` \u2192 http://localhost:1420

## Features (v0.1.2-beta)
- Thread sidebar with conversation navigation
- Chat panel with messaging UI
- Agent activity panel with pending actions
- Command palette (Ctrl+K)
- Dark mission control theme

## Build
```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/
```

Built with \u2764\ufe0f by SureThing for Linkgrow
