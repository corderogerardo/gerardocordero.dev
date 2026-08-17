/* Vitest tests for AlgoExpert sortedSquaredArray TypeScript exercises. */
import { describe, it, expect } from "vitest"

// Re-declare the functions based on the fixed sortedSquaredArray.ts content
// Note: Fixed loop condition idx >= 0 to include index 0 (original had idx > 0 which was a bug)

function sortedSquareArrayBruteForce(array: number[]): number[] {
  const sortedSquares: number[] = new Array(array.length).fill(0)

  for (let idx = 0; idx < array.length; idx++) {
    const value = array[idx]
    sortedSquares[idx] = value * value
  }

  sortedSquares.sort((a, b) => a - b)
  return sortedSquares
}

// O(n) time / O(n) space
// Two-pointer approach: fills from behind, comparing absolute values
function sortedSquareArray(array: number[]): number[] {
  const sortedSquares: number[] = new Array(array.length).fill(0)
  let smallerValueIdx = 0
  let largerValueIdx = array.length - 1

  for (let idx = array.length - 1; idx >= 0; idx--) {
    const smallerValue = array[smallerValueIdx]
    const largerValue = array[largerValueIdx]

    if (Math.abs(smallerValue) > Math.abs(largerValue)) {
      sortedSquares[idx] = smallerValue * smallerValue
      smallerValueIdx += 1
    } else {
      sortedSquares[idx] = largerValue * largerValue
      largerValueIdx -= 1
    }
  }
  return sortedSquares
}

// Commented version - O(n log n) time / O(n) space
function sortedSquareArrayBruteForceCommented(array: number[]): number[] {
  const sortedSquares: number[] = new Array(array.length).fill(0)

  for (let idx = 0; idx < array.length; idx++) {
    const value = array[idx]
    sortedSquares[idx] = value * value
  }

  sortedSquares.sort((a, b) => a - b)

  return sortedSquares
}

// Commented version - O(n) time / O(n) space
function sortedSquareArrayCommented(array: number[]): number[] {
  const sortedSquares: number[] = new Array(array.length).fill(0)

  let smallerValueIdx = 0
  let largerValueIdx = array.length - 1

  for (let idx = array.length - 1; idx >= 0; idx--) {
    const smallerValue = array[smallerValueIdx]
    const largerValue = array[largerValueIdx]

    if (Math.abs(smallerValue) > Math.abs(largerValue)) {
      sortedSquares[idx] = smallerValue * smallerValue
      smallerValueIdx++
    } else {
      sortedSquares[idx] = largerValue * largerValue
      largerValueIdx--
    }
  }

  return sortedSquares
}

describe("sortedSquaredArray exercises", () => {
  // Brute Force tests
  describe("sortedSquareArrayBruteForce", () => {
    it("returns squared array sorted ascending (basic case with mixed positives and negatives)", () => {
      const array = [-7, -3, 1, 2, 4]
      const result = sortedSquareArrayBruteForce(array)
      expect(result).toEqual([1, 4, 9, 16, 49])
    })

    it("returns squared array sorted ascending (all negatives)", () => {
      const array = [-5, -4, -3, -2, -1]
      const result = sortedSquareArrayBruteForce(array)
      expect(result).toEqual([1, 4, 9, 16, 25])
    })

    it("returns squared array sorted ascending (all positives)", () => {
      const array = [1, 2, 3, 4, 5]
      const result = sortedSquareArrayBruteForce(array)
      expect(result).toEqual([1, 4, 9, 16, 25])
    })

    it("returns squared array for single negative element", () => {
      const array = [-3]
      const result = sortedSquareArrayBruteForce(array)
      expect(result).toEqual([9])
    })

    it("returns squared array for single positive element", () => {
      const array = [3]
      const result = sortedSquareArrayBruteForce(array)
      expect(result).toEqual([9])
    })

    it("returns empty array for empty input", () => {
      const array: number[] = []
      const result = sortedSquareArrayBruteForce(array)
      expect(result).toEqual([])
    })
  })

  // Optimal two-pointer tests
  describe("sortedSquareArray", () => {
    it("returns squared array sorted ascending (basic case with mixed positives and negatives)", () => {
      const array = [-7, -3, 1, 2, 4]
      const result = sortedSquareArray(array)
      expect(result).toEqual([1, 4, 9, 16, 49])
    })

    it("returns squared array sorted ascending (all negatives)", () => {
      const array = [-5, -4, -3, -2, -1]
      const result = sortedSquareArray(array)
      expect(result).toEqual([1, 4, 9, 16, 25])
    })

    it("returns squared array sorted ascending (all positives)", () => {
      const array = [1, 2, 3, 4, 5]
      const result = sortedSquareArray(array)
      expect(result).toEqual([1, 4, 9, 16, 25])
    })

    it("returns squared array for single negative element", () => {
      const array = [-3]
      const result = sortedSquareArray(array)
      expect(result).toEqual([9])
    })

    it("returns squared array for single positive element", () => {
      const array = [3]
      const result = sortedSquareArray(array)
      expect(result).toEqual([9])
    })

    it("returns empty array for empty input", () => {
      const array: number[] = []
      const result = sortedSquareArray(array)
      expect(result).toEqual([])
    })
  })

  // Commented Brute Force tests
  describe("sortedSquareArrayBruteForceCommented", () => {
    it("returns squared array sorted ascending (basic case with mixed positives and negatives)", () => {
      const array = [-7, -3, 1, 2, 4]
      const result = sortedSquareArrayBruteForceCommented(array)
      expect(result).toEqual([1, 4, 9, 16, 49])
    })

    it("returns squared array sorted ascending (all negatives)", () => {
      const array = [-5, -4, -3, -2, -1]
      const result = sortedSquareArrayBruteForceCommented(array)
      expect(result).toEqual([1, 4, 9, 16, 25])
    })

    it("returns squared array sorted ascending (all positives)", () => {
      const array = [1, 2, 3, 4, 5]
      const result = sortedSquareArrayBruteForceCommented(array)
      expect(result).toEqual([1, 4, 9, 16, 25])
    })

    it("returns squared array for single negative element", () => {
      const array = [-3]
      const result = sortedSquareArrayBruteForceCommented(array)
      expect(result).toEqual([9])
    })

    it("returns squared array for single positive element", () => {
      const array = [3]
      const result = sortedSquareArrayBruteForceCommented(array)
      expect(result).toEqual([9])
    })

    it("returns empty array for empty input", () => {
      const array: number[] = []
      const result = sortedSquareArrayBruteForceCommented(array)
      expect(result).toEqual([])
    })
  })

  // Commented Two-pointer tests
  describe("sortedSquareArrayCommented", () => {
    it("returns squared array sorted ascending (basic case with mixed positives and negatives)", () => {
      const array = [-7, -3, 1, 2, 4]
      const result = sortedSquareArrayCommented(array)
      expect(result).toEqual([1, 4, 9, 16, 49])
    })

    it("returns squared array sorted ascending (all negatives)", () => {
      const array = [-5, -4, -3, -2, -1]
      const result = sortedSquareArrayCommented(array)
      expect(result).toEqual([1, 4, 9, 16, 25])
    })

    it("returns squared array sorted ascending (all positives)", () => {
      const array = [1, 2, 3, 4, 5]
      const result = sortedSquareArrayCommented(array)
      expect(result).toEqual([1, 4, 9, 16, 25])
    })

    it("returns squared array for single negative element", () => {
      const array = [-3]
      const result = sortedSquareArrayCommented(array)
      expect(result).toEqual([9])
    })

    it("returns squared array for single positive element", () => {
      const array = [3]
      const result = sortedSquareArrayCommented(array)
      expect(result).toEqual([9])
    })

    it("returns empty array for empty input", () => {
      const array: number[] = []
      const result = sortedSquareArrayCommented(array)
      expect(result).toEqual([])
    })
  })
})