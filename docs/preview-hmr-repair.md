# Managed Preview HMR Repair

## Context

The managed development preview proxies the application HTTP endpoint but does not expose Vite's separate Hot Module Replacement WebSocket channel. The default Vite client therefore attempted to connect its WebSocket through the preview address and emitted a `failed to connect to websocket` error, despite normal HTTP application traffic working.

## Resolution

`server/_core/vite.ts` runs Vite in middleware mode with `hmr: false`. This prevents Vite from injecting a non-functional HMR client into the proxied preview while retaining normal development serving, authenticated API access, and application refresh behavior. Source changes can still be viewed after a standard browser reload.

## Verification

On 18 August 2026, the development server was restarted after the configuration update. The authenticated India Command workspace loaded successfully through the managed preview, including the private account boundary, operational dashboard, navigation controls, and priority queue. The browser console contained no output after the fresh page load, confirming that the previous Vite WebSocket error was eliminated.

The automated validation suite also passed: 10 Vitest tests across 5 files, TypeScript type checking, and the production build all completed successfully. The development-server log confirms the configuration file change and restart; it contains no post-restart server-side HMR or WebSocket failure.
