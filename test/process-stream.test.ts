import { describe, it, expect, vi } from 'vitest'
import { processStream, createStream } from '../src/process-stream'

describe('processStream with using statement', () => {
  it('should call Symbol.dispose callback when exiting scope', async () => {
    // Capture console.log calls
    const consoleSpy = vi.spyOn(console, 'log')
    
    const stream = createStream(['item1', 'item2', 'item3'])
    await processStream(stream)
    
    // Check that items were logged
    expect(consoleSpy).toHaveBeenCalledWith('item1')
    expect(consoleSpy).toHaveBeenCalledWith('item2')
    expect(consoleSpy).toHaveBeenCalledWith('item3')
    
    // BUG: This assertion will FAIL because the dispose callback is lost
    expect(consoleSpy).toHaveBeenCalledWith('disposed')
    
    consoleSpy.mockRestore()
  })
  
  it('demonstrates the bug - dispose is never called', async () => {
    let disposeCalled = false
    
    // We can't easily test this with the current function,
    // but we can demonstrate the expected behavior
    async function workaroundVersion(stream: AsyncIterable<unknown>) {
      try {
        for await (const item of stream) {
          console.log(item)
        }
      } finally {
        disposeCalled = true
        console.log('disposed')
      }
    }
    
    const stream = createStream(['item1', 'item2'])
    await workaroundVersion(stream)
    
    // This works with try/finally
    expect(disposeCalled).toBe(true)
  })
})
