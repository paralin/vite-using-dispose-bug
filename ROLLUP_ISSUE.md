## Rollup Version

4.53.3

## Operating System (or Browser)

macOS 15.7.1 (arm64 Apple M3 Pro)

## Node Version (if applicable)

25.2.1

## Link To Reproduction

https://rollupjs.org/repl/?version=4.53.3&shareable=eyJleGFtcGxlIjpudWxsLCJtb2R1bGVzIjpbeyJjb2RlIjoiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NTdHJlYW0oc3RyZWFtKSB7XG4gIHVzaW5nIF8gPSB7XG4gICAgW1N5bWJvbC5kaXNwb3NlXTogKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ2Rpc3Bvc2VkJylcbiAgICB9LFxuICB9XG5cbiAgZm9yIGF3YWl0IChjb25zdCBpdGVtIG9mIHN0cmVhbSkge1xuICAgIGNvbnNvbGUubG9nKGl0ZW0pXG4gIH1cbn0iLCJpc0VudHJ5Ijp0cnVlLCJuYW1lIjoibWFpbi5qcyJ9XSwib3B0aW9ucyI6e319

Additional repo with full test suite: https://github.com/paralin/vite-using-dispose-bug

## Expected Behaviour

The `[Symbol.dispose]` property in `using` declarations should be preserved in the bundled output.

**Input:**

```javascript
export async function processStream(stream) {
  using _ = {
    [Symbol.dispose]: () => {
      console.log('disposed')
    },
  }

  for await (const item of stream) {
    console.log(item)
  }
}
```

**Expected output** (simplified):

```javascript
async function processStream(stream) {
  var stack = [];
  try {
    const _ = __using(stack, {
      [Symbol.dispose]: () => console.log('disposed')  // Should be preserved
    });
    for await (const item of stream) {
      console.log(item);
    }
  } finally {
    __callDispose(stack, error, hasError);
  }
}
```

## Actual Behaviour

Rollup's tree-shaking incorrectly removes the `[Symbol.dispose]` property, replacing the object literal with an empty object `{}`.

**Actual output:**

```javascript
async function processStream(stream) {
  var stack = [];
  try {
    const _ = __using(stack, {});  // BUG: Empty object, [Symbol.dispose] is gone!
    for await (const item of stream) {
      console.log(item);
    }
  } finally {
    __callDispose(stack, error, hasError);
  }
}
```

This causes a runtime error: `TypeError: Object not disposable` because the empty object has no `Symbol.dispose` method.

---

### Additional broken variants

The bug affects multiple patterns involving `[Symbol.dispose]` in object literals:

```javascript
// All of these lose [Symbol.dispose] after bundling:

// Inline object
using _ = { [Symbol.dispose]: () => {} }

// Pre-defined function
const dispose = () => {}
using _ = { [Symbol.dispose]: dispose }

// Separate variable
const disposable = { [Symbol.dispose]: () => {} }
using _ = disposable

// Spread operator
const methods = { [Symbol.dispose]: () => {} }
using _ = { ...methods }

// Cached symbol
const SymbolDispose = Symbol.dispose
using _ = { [SymbolDispose]: () => {} }
```

### Workarounds

These patterns survive tree-shaking:

```javascript
// Factory function
function disposable(fn) {
  return { [Symbol.dispose]: fn }
}
using _ = disposable(() => {})

// Class
class MyDisposable {
  [Symbol.dispose]() {}
}
using _ = new MyDisposable()

// Assign after creation
const obj = {}
obj[Symbol.dispose] = () => {}
using _ = obj

// Object.assign
using _ = Object.assign({}, { [Symbol.dispose]: () => {} })

// IIFE
using _ = (() => ({ [Symbol.dispose]: () => {} }))()
```

---

**Related:** This was originally reported as a Vite issue: https://github.com/vitejs/vite/issues/21280

Note: Rolldown handles this correctly ([repl](https://repl.rolldown.rs/#eNptUdFqwzAM/JXDL0mh5AMC3S8M1sd1DC+Ri8Gxgq2sLcH/PjtJ2cr6JMs6HXenWRnVzsr6nq6NxPL2qv3t96rLLV1HDgIdb76DmXwnlj3GwB3FeJRAeqjjUnaYTx6YovVnfOKwtsD78TZ8sWt6G0eO9NGi3uHwch8DHfvIjhrH57raUH21W8dpX2o6+VIMB+iLtoK6LAms0AA2eFDwyFggC1fmSNkUqVbCRGmvAjvX88U3GW7s+U8GTyZrGnZY0pDbSJjxtsFexxJKRIIJPKC6r1dF9Sp0JWr/rWwpWT9O0mKlbwYS3Sxf2fxifbtCT0ZP7s528iplG99Zl9NCUVT6AZP6odA=)).
