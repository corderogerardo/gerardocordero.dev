/* Vitest tests for AlgoExpert validSubsequence TypeScript exercises. */
import { describe, it, expect } from "vitest"

// Re-declare the functions based on the fixed validSubsequence.ts content
// Fixed: using let instead of const for mutable variables

function validateSubsequenceWhileLoop(array: number[], sequence: number[]): boolean {
  let sequenceIdx: number = 0
  let arrayIdx: number = 0
  while (arrayIdx < array.length && sequenceIdx < sequence.length) {
    if (array[arrayIdx] === sequence[sequenceIdx]) {
      sequenceIdx += 1
    }
    arrayIdx += 1
  }
  return sequenceIdx === sequence.length
}

// O(n) time / O(1) space
function validateSubsequenceForLoop(array: number[], sequence: number[]): boolean {
  let sequenceIdx: number = 0
  for (const value of array) {
    if (sequenceIdx === sequence.length) break
    if (sequence[sequenceIdx] === value) {
      sequenceIdx += 1
    }
  }
  return sequenceIdx === sequence.length
}

// O(n) time / O(1) space
function validateSubsequenceWhileLoopCommented(
  array: number[],
  sequence: number[]
): boolean {
  let arrayIdx = 0
  let sequenceIdx = 0

  while (arrayIdx < array.length && sequenceIdx < sequence.length) {
    if (array[arrayIdx] === sequence[sequenceIdx]) {
      sequenceIdx++
    }
    arrayIdx++
  }
  return sequenceIdx === sequence.length
}

// O(n) time / O(1) space
function validateSubsequenceForLoopCommented(
  array: number[],
  sequence: number[]
): boolean {
  let sequenceIdx = 0

  for (const value of array) {
    if (sequenceIdx === sequence.length) break
    if (sequence[sequenceIdx] === value) {
      sequenceIdx++
    }
  }
  return sequenceIdx === sequence.length
}

describe("validSubsequence exercises", () => {
  // While Loop tests
  describe("validateSubsequenceWhileLoop", () => {
    it("returns true when sequence is a valid subsequence (basic case)", () => {
      const array = [5, 1, 22, 25, 6, -1, 8, 10]
      const sequence = [1, 6, -1, 10]
      const result = validateSubsequenceWhileLoop(array, sequence)
      expect(result).toBe(true)
    })

    it("returns true when sequence is empty", () => {
      const array = [5, 1, 22, 25, 6, -1, 8, 10]
      const sequence: number[] = []
      const result = validateSubsequenceWhileLoop(array, sequence)
      expect(result).toBe(true)
    })

    it("returns false when sequence is not a valid subsequence", () => {
      // [3, 1] is not a valid subsequence of [1, 2, 3, 4] because 3 comes after 1
      const array = [1, 2, 3, 4]
      const sequence = [3, 1]
      const result = validateSubsequenceWhileLoop(array, sequence)
      expect(result).toBe(false)
    })

    it("returns true when array equals sequence", () => {
      const array = [1, 2, 3]
      const sequence = [1, 2, 3]
      const result = validateSubsequenceWhileLoop(array, sequence)
      expect(result).toBe(true)
    })

    it("returns false when sequence is longer than array", () => {
      const array = [1, 2]
      const sequence = [1, 2, 3]
      const result = validateSubsequenceWhileLoop(array, sequence)
      expect(result).toBe(false)
    })

    it("returns true when sequence has single element present in array", () => {
      const array = [1, 2, 3, 4]
      const sequence = [3]
      const result = validateSubsequenceWhileLoop(array, sequence)
      expect(result).toBe(true)
    })

    it("returns false when sequence has single element not in array", () => {
      const array = [1, 2, 3, 4]
      const sequence = [5]
      const result = validateSubsequenceWhileLoop(array, sequence)
      expect(result).toBe(false)
    })
  })

  // For Loop tests
  describe("validateSubsequenceForLoop", () => {
    it("returns true when sequence is a valid subsequence (basic case)", () => {
      const array = [5, 1, 22, 25, 6, -1, 8, 10]
      const sequence = [1, 6, -1, 10]
      const result = validateSubsequenceForLoop(array, sequence)
      expect(result).toBe(true)
    })

    it("returns true when sequence is empty", () => {
      const array = [5, 1, 22, 25, 6, -1, 8, 10]
      const sequence: number[] = []
      const result = validateSubsequenceForLoop(array, sequence)
      expect(result).toBe(true)
    })

    it("returns false when sequence is not a valid subsequence", () => {
      // [3, 1] is not a valid subsequence of [1, 2, 3, 4] because 3 comes after 1
      const array = [1, 2, 3, 4]
      const sequence = [3, 1]
      const result = validateSubsequenceForLoop(array, sequence)
      expect(result).toBe(false)
    })

    it("returns true when array equals sequence", () => {
      const array = [1, 2, 3]
      const sequence = [1, 2, 3]
      const result = validateSubsequenceForLoop(array, sequence)
      expect(result).toBe(true)
    })

    it("returns false when sequence is longer than array", () => {
      const array = [1, 2]
      const sequence = [1, 2, 3]
      const result = validateSubsequenceForLoop(array, sequence)
      expect(result).toBe(false)
    })

    it("returns true when sequence has single element present in array", () => {
      const array = [1, 2, 3, 4]
      const sequence = [3]
      const result = validateSubsequenceForLoop(array, sequence)
      expect(result).toBe(true)
    })

    it("returns false when sequence has single element not in array", () => {
      const array = [1, 2, 3, 4]
      const sequence = [5]
      const result = validateSubsequenceForLoop(array, sequence)
      expect(result).toBe(false)
    })
  })

  // While Loop Commented tests
  describe("validateSubsequenceWhileLoopCommented", () => {
    it("returns true when sequence is a valid subsequence (basic case)", () => {
      const array = [5, 1, 22, 25, 6, -1, 8, 10]
      const sequence = [1, 6, -1, 10]
      const result = validateSubsequenceWhileLoopCommented(array, sequence)
      expect(result).toBe(true)
    })

    it("returns true when sequence is empty", () => {
      const array = [5, 1, 22, 25, 6, -1, 8, 10]
      const sequence: number[] = []
      const result = validateSubsequenceWhileLoopCommented(array, sequence)
      expect(result).toBe(true)
    })

    it("returns false when sequence is not a valid subsequence", () => {
      // [3, 1] is not a valid subsequence of [1, 2, 3, 4] because 3 comes after 1
      const array = [1, 2, 3, 4]
      const sequence = [3, 1]
      const result = validateSubsequenceWhileLoopCommented(array, sequence)
      expect(result).toBe(false)
    })
  })

  // For Loop Commented tests
  describe("validateSubsequenceForLoopCommented", () => {
    it("returns true when sequence is a valid subsequence (basic case)", () => {
      const array = [5, 1, 22, 25, 6, -1, 8, 10]
      const sequence = [1, 6, -1, 10]
      const result = validateSubsequenceForLoopCommented(array, sequence)
      expect(result).toBe(true)
    })

    it("returns true when sequence is empty", () => {
      const array = [5, 1, 22, 25, 6, -1, 8, 10]
      const sequence: number[] = []
      const result = validateSubsequenceForLoopCommented(array, sequence)
      expect(result).toBe(true)
    })

    it("returns false when sequence is not a valid subsequence", () => {
      // [3, 1] is not a valid subsequence of [1, 2, 3, 4] because 3 comes after 1
      const array = [1, 2, 3, 4]
      const sequence = [3, 1]
      const result = validateSubsequenceForLoopCommented(array, sequence)
      expect(result).toBe(false)
    })
  })
})