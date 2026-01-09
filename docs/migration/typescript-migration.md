# 🎯 TypeScript Migration Guide

**Status:** ✅ Completed on `main` (January 8, 2026)

The project now runs on Vite + React 19 with strict TypeScript. The old CRA migration steps and branches are no longer used.

## What Changed

- Switched build tool to Vite (fast dev server + build)
- React 19, React Router v7, TypeScript strict enabled
- ESLint + Prettier modernized for TypeScript
- Path aliases configured
- Scripts consolidated to pnpm (`pnpm dev`, `pnpm type-check`, `pnpm lint`, `pnpm build`)

## How to Work

1. `pnpm install`
2. `pnpm dev` for local development
3. `pnpm type-check` to keep types clean
4. `pnpm lint` / `pnpm lint:fix` for linting
5. `pnpm build` for production

## Remaining Cleanup

- Remove all PropTypes now that TypeScript covers runtime shapes
- Replace any lingering `any` or `@ts-nocheck` if found
- Keep shared types in `src/types/index.ts`

## Patterns

- Prefer typed props interfaces instead of PropTypes
- Use `as const` and discriminated unions where helpful
- Keep calculation utilities fully typed; see `src/lib/calculations` and `src/lib/analytics`

## References

- Core types: `src/types/index.ts`
- Scripts: `package.json`
- Architecture & data flow: `COMPREHENSIVE_ARCHITECTURE_DOCUMENTATION.md`, `DATA_FLOW_DIAGRAM.md`
