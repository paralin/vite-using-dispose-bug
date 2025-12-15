import { describe, it, expect, beforeEach } from 'vitest'
import {
  disposeLog,
  createStream,
  variant1_inlineComputed,
  variant2_predefinedFunction,
  variant3_separateObject,
  variant4_factoryFunction,
  variant5_class,
  variant6_assignAfter,
  variant7_objectAssign,
  variant8_spread,
  variant9_cachedSymbol,
  variant10_iife,
  variant11_awaitUsingInline,
  variant12_awaitUsingSeparate,
  variant13_awaitUsingFactory,
  variant14_awaitUsingClass,
  variant15_awaitUsingBoth,
  variant16_usingWithAsyncDispose,
} from '../src/using-variants'

describe('using statement variants (Symbol.dispose)', () => {
  beforeEach(() => {
    disposeLog.length = 0
  })

  const variants = [
    { name: 'variant1_inlineComputed', fn: variant1_inlineComputed, desc: 'Inline object with [Symbol.dispose]' },
    { name: 'variant2_predefinedFunction', fn: variant2_predefinedFunction, desc: 'Pre-defined dispose function' },
    { name: 'variant3_separateObject', fn: variant3_separateObject, desc: 'Separate object, then using' },
    { name: 'variant4_factoryFunction', fn: variant4_factoryFunction, desc: 'Factory function returning disposable' },
    { name: 'variant5_class', fn: variant5_class, desc: 'Class with Symbol.dispose method' },
    { name: 'variant6_assignAfter', fn: variant6_assignAfter, desc: 'Assign dispose after object creation' },
    { name: 'variant7_objectAssign', fn: variant7_objectAssign, desc: 'Using Object.assign' },
    { name: 'variant8_spread', fn: variant8_spread, desc: 'Spread operator' },
    { name: 'variant9_cachedSymbol', fn: variant9_cachedSymbol, desc: 'Cached Symbol.dispose in variable' },
    { name: 'variant10_iife', fn: variant10_iife, desc: 'IIFE returning disposable' },
  ]

  for (const { name, fn, desc } of variants) {
    it(`${desc} (${name})`, async () => {
      const stream = createStream(['a', 'b'])
      await fn(stream)
      expect(disposeLog).toContain(name)
    })
  }
})

describe('await using statement variants (Symbol.asyncDispose)', () => {
  beforeEach(() => {
    disposeLog.length = 0
  })

  const asyncVariants = [
    { name: 'variant11_awaitUsingInline', fn: variant11_awaitUsingInline, desc: 'await using with inline [Symbol.asyncDispose]' },
    { name: 'variant12_awaitUsingSeparate', fn: variant12_awaitUsingSeparate, desc: 'await using with separate object' },
    { name: 'variant13_awaitUsingFactory', fn: variant13_awaitUsingFactory, desc: 'await using with factory function' },
    { name: 'variant14_awaitUsingClass', fn: variant14_awaitUsingClass, desc: 'await using with class' },
  ]

  for (const { name, fn, desc } of asyncVariants) {
    it(`${desc} (${name})`, async () => {
      const stream = createStream(['a', 'b'])
      await fn(stream)
      expect(disposeLog).toContain(name)
    })
  }
})

describe('mixed dispose/asyncDispose variants', () => {
  beforeEach(() => {
    disposeLog.length = 0
  })

  it('await using with both symbols should use asyncDispose (variant15)', async () => {
    const stream = createStream(['a', 'b'])
    await variant15_awaitUsingBoth(stream)
    // Per spec: await using prefers Symbol.asyncDispose over Symbol.dispose
    expect(disposeLog).toContain('variant15_awaitUsingBoth_async')
    expect(disposeLog).not.toContain('variant15_awaitUsingBoth_sync')
  })

  it('using with both symbols should use dispose (variant16)', async () => {
    const stream = createStream(['a', 'b'])
    await variant16_usingWithAsyncDispose(stream)
    // Per spec: using uses Symbol.dispose only
    expect(disposeLog).toContain('variant16_usingWithAsyncDispose_sync')
    expect(disposeLog).not.toContain('variant16_usingWithAsyncDispose_async')
  })
})
