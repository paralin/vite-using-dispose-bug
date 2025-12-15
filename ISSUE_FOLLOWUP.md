## Follow-up: Additional variants that exhibit the same bug

I tested several variations of `using` with `[Symbol.dispose]` to find workarounds. Here are additional patterns that **should work but are broken** in `vite build`:

### Variant 2: Pre-defined dispose function

```typescript
async function example(stream: AsyncIterable<unknown>) {
  const dispose = () => console.log('disposed')
  using _ = {
    [Symbol.dispose]: dispose,  // Lost in build
  }
  for await (const item of stream) {}
}
```

### Variant 3: Separate object assigned to variable first

```typescript
async function example(stream: AsyncIterable<unknown>) {
  const disposable = {
    [Symbol.dispose]: () => console.log('disposed'),  // Lost in build
  }
  using _ = disposable
  for await (const item of stream) {}
}
```

### Variant 8: Spread operator

```typescript
async function example(stream: AsyncIterable<unknown>) {
  const disposeMethod = {
    [Symbol.dispose]: () => console.log('disposed'),
  }
  using _ = { ...disposeMethod }  // Lost in build
  for await (const item of stream) {}
}
```

### Variant 9: Cached Symbol.dispose in module-level variable

```typescript
const SymbolDispose = Symbol.dispose

async function example(stream: AsyncIterable<unknown>) {
  using _ = {
    [SymbolDispose]: () => console.log('disposed'),  // Lost in build
  }
  for await (const item of stream) {}
}
```

---

## Workarounds that DO work

For anyone hitting this bug, these patterns survive `vite build`:

```typescript
// Factory function
function disposable(fn: () => void): Disposable {
  return { [Symbol.dispose]: fn }
}
using _ = disposable(() => console.log('disposed'))

// Class
class MyDisposable implements Disposable {
  [Symbol.dispose]() { console.log('disposed') }
}
using _ = new MyDisposable()

// Assign after creation
const obj: Disposable = {} as Disposable
obj[Symbol.dispose] = () => console.log('disposed')
using _ = obj

// Object.assign
using _ = Object.assign({}, {
  [Symbol.dispose]: () => console.log('disposed')
})

// IIFE
using _ = (() => ({
  [Symbol.dispose]: () => console.log('disposed')
}))()
```

Full reproducer with all variants: https://github.com/paralin/vite-using-dispose-bug
