import { describe, it, expect } from 'vitest'
import { checkHealth } from '../../src/shared/health'

describe('checkHealth', () => {
  it('returns an object with status "OK" and a timestamp', () => {
    const result = checkHealth()
    expect(result).toHaveProperty('status', 'OK')
    expect(result).toHaveProperty('timestamp')
    expect(result.timestamp).toBeInstanceOf(Date)
  })

  it('should return current timestamp', () => {
    const result = checkHealth()
    const now = new Date()
    expect(result.timestamp.getTime()).toBeLessThanOrEqual(now.getTime())
  })
})
