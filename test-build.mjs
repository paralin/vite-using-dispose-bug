/**
 * Test the built output to see which variants actually work at runtime
 */

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
} from './dist/using-variants.js'

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

console.log('Testing vite build output for using statement variants\n')
console.log('='.repeat(70))

for (const { name, fn, desc } of variants) {
  disposeLog.length = 0
  
  try {
    const stream = createStream(['a', 'b'])
    await fn(stream)
    
    const works = disposeLog.includes(name)
    const status = works ? '✅ WORKS' : '❌ BROKEN'
    console.log(`${status}  ${name}`)
    console.log(`         ${desc}`)
    if (!works) {
      console.log(`         disposeLog: [${disposeLog.join(', ')}]`)
    }
  } catch (e) {
    console.log(`💥 ERROR  ${name}`)
    console.log(`         ${desc}`)
    console.log(`         ${e.message}`)
  }
  console.log()
}

console.log('='.repeat(70))
console.log('\nSummary: Variants that survive vite build can be used as workarounds.')
