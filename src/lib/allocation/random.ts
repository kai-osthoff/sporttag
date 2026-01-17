/**
 * Mulberry32 seeded PRNG
 * Source: github.com/cprosche/mulberry32
 *
 * Generates deterministic random numbers from a 32-bit seed.
 * Full period (2^32), uniform distribution.
 */
export function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/**
 * Convert string seed to 32-bit integer
 * Uses djb2 hash algorithm for deterministic conversion.
 */
export function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

/**
 * Create a Fisher-Yates shuffle function using seeded RNG
 *
 * Fisher-Yates is O(n) and produces unbiased permutations.
 * Same RNG + same input = same output (deterministic).
 */
export function createShuffler(rng: () => number) {
  return function shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}
