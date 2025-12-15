# Vite `using` Statement Transpilation Bug Reproducer

> **RESOLVED:** This bug has been fixed in **Rollup 4.53.4**. Update your rollup dependency to get the fix.
>
> - Vite issue: [vitejs/vite#21280](https://github.com/vitejs/vite/issues/21280)
> - Rollup issue: [rollup/rollup#6208](https://github.com/rollup/rollup/issues/6208)
> - Rollup fix: [rollup/rollup#6209](https://github.com/rollup/rollup/pull/6209) by [@lukastaegert](https://github.com/lukastaegert)
>
> This repository is now archived.

---

## Summary

Vite's production build incorrectly transpiles inline `using` declarations with `[Symbol.dispose]`, replacing the entire object literal with an empty object `{}` and losing the dispose callback entirely.

**Note:** Vitest handles this correctly in dev/test mode, but `vite build` does not.

## Versions

- Vite: 7.2.7
- Vitest: 4.0.15
- TypeScript: 5.7.2
- Node: 20+

## Quick Start

```bash
npm install
npm run test   # PASSES - Vitest handles using correctly
npm run build  # BUG - inspect dist/process-stream.js
```

## The Bug

### Source Code (`src/process-stream.ts`)

```typescript
async function processStream(stream: AsyncIterable<unknown>) {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('disposed') // This never runs after vite build!
    },
  }

  for await (const item of stream) {
    console.log(item)
  }
}
```

### Expected Transpilation

The `using` statement should be transpiled to something like:

```javascript
async function processStream(stream) {
  var stack = []
  try {
    const disposable = { [Symbol.dispose]: () => console.log('disposed') }
    addToStack(stack, disposable)
    for await (const item of stream) {
      console.log(item)
    }
  } finally {
    disposeStack(stack) // Should call disposable[Symbol.dispose]()
  }
}
```

### Actual Transpilation (`dist/process-stream.js`)

```javascript
async function p(t) {
  var e = [];
  try {
    const o = u(e, {}); // BUG: Empty object {} instead of the disposable!
    for await (const n of t)
      console.log(n);
  } catch (c) {
    var s = c, a = !0;
  } finally {
    y(e, s, a); // Disposes nothing because {} has no Symbol.dispose
  }
}
```

## Behavior Comparison

| Environment | `using` with `[Symbol.dispose]` | Result |
|-------------|--------------------------------|--------|
| Vitest (dev) | Works correctly | `disposed` is logged |
| `vite build` | **Broken** | Dispose callback lost |

## Impact

- The `[Symbol.dispose]` callback is completely lost in production builds
- The `finally` block runs but does nothing
- No errors are thrown - it silently fails
- Code appears to work in tests but cleanup never happens in production

## Fix

Upgrade to Rollup 4.53.4 or later:

```bash
npm install rollup@^4.53.4
```

The fix handles both `using` with `Symbol.dispose` and `await using` with `Symbol.asyncDispose`.

---

## Workaround (for older Rollup versions)

Use `try/finally` instead of `using`:

```typescript
async function processStream(stream: AsyncIterable<unknown>) {
  try {
    for await (const item of stream) {
      console.log(item)
    }
  } finally {
    console.log('disposed') // This works!
  }
}
```

## Notes

- The bug specifically affects inline object literals with computed `[Symbol.dispose]` property
- May be related to how Vite/esbuild handles computed property names in `using` declarations
- TypeScript target is ES2022 (which doesn't natively support `using`, requiring transpilation)
