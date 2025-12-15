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
} from '../src/using-variants'

describe('using statement variants', () => {
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
