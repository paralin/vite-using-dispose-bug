## Describe the bug

Vite's production build incorrectly transpiles inline `using` declarations with `[Symbol.dispose]`. The entire object literal containing the dispose callback is replaced with an empty object `{}`, causing the dispose callback to be silently lost.

Notably, **Vitest handles this correctly** during testing, so tests pass but production builds are broken.

**Source code:**

```typescript
async function processStream(stream: AsyncIterable<unknown>) {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('disposed') // Lost after vite build!
    },
  }

  for await (const item of stream) {
    console.log(item)
  }
}
```

**After `vite build` (dist/process-stream.js):**

```javascript
async function p(t) {
  var e = [];
  try {
    const o = u(e, {}); // BUG: Empty object {} instead of { [Symbol.dispose]: ... }
    for await (const n of t)
      console.log(n);
  } finally {
    y(e, s, a); // Disposes nothing
  }
}
```

## Reproduction

https://github.com/USER/REPO

## Steps to reproduce

1. Clone the repository
2. Run `npm install`
3. Run `npm run test` - tests PASS (dispose callback works in Vitest)
4. Run `npm run build` - production build completes
5. Inspect `dist/process-stream.js` line 35 - the `using` declaration is transpiled to `u(e, {})` with an empty object instead of the object with `[Symbol.dispose]`

## System Info

```shell
  System:
    OS: macOS 15.7.1
    CPU: (12) arm64 Apple M3 Pro
    Memory: 90.50 MB / 18.00 GB
    Shell: 5.9 - /bin/zsh
  Binaries:
    Node: 25.2.1 - /opt/homebrew/opt/node/bin/node
    Yarn: 1.22.22 - /opt/homebrew/bin/yarn
    npm: 11.7.0 - /opt/homebrew/opt/node/bin/npm
    bun: 1.3.4 - /opt/homebrew/bin/bun
    Deno: 2.6.0 - /opt/homebrew/bin/deno
  Browsers:
    Safari: 26.0.1
  npmPackages:
    vite: ^7.2.7 => 7.2.7
```

## Used Package Manager

npm

## Logs

_No response_

## Validations

- [x] Follow our [Code of Conduct](https://github.com/vitejs/vite/blob/main/CODE_OF_CONDUCT.md)
- [x] Read the [Contributing Guidelines](https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md).
- [x] Read the [docs](https://vite.dev/guide).
- [x] Check that there isn't [already an issue](https://github.com/vitejs/vite/issues) that reports the same bug to avoid creating a duplicate.
- [x] Make sure this is a Vite issue and not a framework-specific issue. For example, if it's a Vue SFC related bug, it should likely be reported to [vuejs/core](https://github.com/vuejs/core) instead.
- [x] Check that this is a concrete bug. For Q&A open a [GitHub Discussion](https://github.com/vitejs/vite/discussions) or join our [Discord Chat Server](https://chat.vite.dev/).
- [x] The provided reproduction is a [minimal reproducible example](https://stackoverflow.com/help/minimal-reproducible-example) of the bug.
