/**
 * Testing various `using` constructs to find workarounds
 * for the Vite transpilation bug with [Symbol.dispose]
 */

// Track which dispose callbacks were called
export const disposeLog: string[] = []

// =============================================================================
// VARIANT 1: Inline object literal with computed property (THE BUG)
// =============================================================================
export async function variant1_inlineComputed(stream: AsyncIterable<unknown>) {
  using _ = {
    [Symbol.dispose]: () => {
      disposeLog.push('variant1_inlineComputed')
    },
  }
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 2: Pre-defined dispose function
// =============================================================================
export async function variant2_predefinedFunction(stream: AsyncIterable<unknown>) {
  const dispose = () => {
    disposeLog.push('variant2_predefinedFunction')
  }
  using _ = {
    [Symbol.dispose]: dispose,
  }
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 3: Separate object, then using
// =============================================================================
export async function variant3_separateObject(stream: AsyncIterable<unknown>) {
  const disposable = {
    [Symbol.dispose]: () => {
      disposeLog.push('variant3_separateObject')
    },
  }
  using _ = disposable
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 4: Factory function returning disposable
// =============================================================================
function createDisposable(name: string): Disposable {
  return {
    [Symbol.dispose]: () => {
      disposeLog.push(name)
    },
  }
}

export async function variant4_factoryFunction(stream: AsyncIterable<unknown>) {
  using _ = createDisposable('variant4_factoryFunction')
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 5: Class with Symbol.dispose method
// =============================================================================
class DisposableClass implements Disposable {
  constructor(private name: string) {}
  [Symbol.dispose]() {
    disposeLog.push(this.name)
  }
}

export async function variant5_class(stream: AsyncIterable<unknown>) {
  using _ = new DisposableClass('variant5_class')
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 6: Object with dispose method assigned after creation
// =============================================================================
export async function variant6_assignAfter(stream: AsyncIterable<unknown>) {
  const obj: Disposable = {} as Disposable
  obj[Symbol.dispose] = () => {
    disposeLog.push('variant6_assignAfter')
  }
  using _ = obj
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 7: Using Object.assign
// =============================================================================
export async function variant7_objectAssign(stream: AsyncIterable<unknown>) {
  using _ = Object.assign({}, {
    [Symbol.dispose]: () => {
      disposeLog.push('variant7_objectAssign')
    },
  })
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 8: Spread operator
// =============================================================================
export async function variant8_spread(stream: AsyncIterable<unknown>) {
  const disposeMethod = {
    [Symbol.dispose]: () => {
      disposeLog.push('variant8_spread')
    },
  }
  using _ = { ...disposeMethod }
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 9: Non-computed property name via helper
// =============================================================================
const SymbolDispose = Symbol.dispose

export async function variant9_cachedSymbol(stream: AsyncIterable<unknown>) {
  using _ = {
    [SymbolDispose]: () => {
      disposeLog.push('variant9_cachedSymbol')
    },
  } as unknown as Disposable
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 10: IIFE returning disposable
// =============================================================================
export async function variant10_iife(stream: AsyncIterable<unknown>) {
  using _ = (() => ({
    [Symbol.dispose]: () => {
      disposeLog.push('variant10_iife')
    },
  }))()
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 11: await using with Symbol.asyncDispose (inline)
// =============================================================================
export async function variant11_awaitUsingInline(stream: AsyncIterable<unknown>) {
  await using _ = {
    [Symbol.asyncDispose]: async () => {
      disposeLog.push('variant11_awaitUsingInline')
    },
  }
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 12: await using with Symbol.asyncDispose (separate object)
// =============================================================================
export async function variant12_awaitUsingSeparate(stream: AsyncIterable<unknown>) {
  const disposable = {
    [Symbol.asyncDispose]: async () => {
      disposeLog.push('variant12_awaitUsingSeparate')
    },
  }
  await using _ = disposable
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 13: await using with factory function
// =============================================================================
function createAsyncDisposable(name: string): AsyncDisposable {
  return {
    [Symbol.asyncDispose]: async () => {
      disposeLog.push(name)
    },
  }
}

export async function variant13_awaitUsingFactory(stream: AsyncIterable<unknown>) {
  await using _ = createAsyncDisposable('variant13_awaitUsingFactory')
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 14: await using with class
// =============================================================================
class AsyncDisposableClass implements AsyncDisposable {
  constructor(private name: string) {}
  async [Symbol.asyncDispose]() {
    disposeLog.push(this.name)
  }
}

export async function variant14_awaitUsingClass(stream: AsyncIterable<unknown>) {
  await using _ = new AsyncDisposableClass('variant14_awaitUsingClass')
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 15: await using with both Symbol.dispose and Symbol.asyncDispose
// =============================================================================
export async function variant15_awaitUsingBoth(stream: AsyncIterable<unknown>) {
  await using _ = {
    [Symbol.dispose]: () => {
      disposeLog.push('variant15_awaitUsingBoth_sync')
    },
    [Symbol.asyncDispose]: async () => {
      disposeLog.push('variant15_awaitUsingBoth_async')
    },
  }
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// VARIANT 16: using with Symbol.asyncDispose (should use dispose, not asyncDispose)
// =============================================================================
export async function variant16_usingWithAsyncDispose(stream: AsyncIterable<unknown>) {
  using _ = {
    [Symbol.dispose]: () => {
      disposeLog.push('variant16_usingWithAsyncDispose_sync')
    },
    [Symbol.asyncDispose]: async () => {
      disposeLog.push('variant16_usingWithAsyncDispose_async')
    },
  }
  for await (const item of stream) {
    void item
  }
}

// =============================================================================
// Helper to create async iterable
// =============================================================================
export async function* createStream(items: unknown[]) {
  for (const item of items) {
    yield item
  }
}
