/**
 * Reproducer for Vite bug: inline `using` declarations with [Symbol.dispose]
 * lose the dispose callback during transpilation
 */

export async function processStream(stream: AsyncIterable<unknown>) {
  // BUG: This using declaration loses its [Symbol.dispose] callback
  // when transpiled by Vite
  using _ = {
    [Symbol.dispose]: () => {
      console.log('disposed') // This never runs!
    },
  }

  for await (const item of stream) {
    console.log(item)
  }
}

// Helper to create an async iterable for testing
export async function* createStream(items: unknown[]) {
  for (const item of items) {
    yield item
  }
}
