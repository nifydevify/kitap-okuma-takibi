# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a fresh Vite + React + TypeScript scaffold for "kitap-okuma-takibi" (a book reading tracker). No app-specific features have been implemented yet — `src/App.tsx` is still the default Vite starter template. There are no tests configured.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check via `tsc -b` (project references, no emit) then produce a production build with `vite build`
- `npm run lint` — run ESLint over the repo
- `npm run preview` — serve the production build locally

There is no test runner configured in this project.

## Architecture

- Entry point: `src/main.tsx` mounts `<App />` from `src/App.tsx` into `#root` (defined in `index.html`).
- TypeScript uses project references: `tsconfig.json` is a root pointing at `tsconfig.app.json` (app source, browser lib, bundler resolution) and `tsconfig.node.json` (build tooling, e.g. `vite.config.ts`). `npm run build` type-checks both via `tsc -b` before bundling.
- ESLint config (`eslint.config.js`) is flat-config style, composing `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` (Vite variant). Type-aware linting is not enabled.
- Static assets served as-is live in `public/` (e.g. `favicon.svg`, `icons.svg` referenced via `<use href="/icons.svg#...">`); assets imported by components live in `src/assets/`.
