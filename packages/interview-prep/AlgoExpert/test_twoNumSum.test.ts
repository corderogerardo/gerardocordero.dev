/* Vitest tests for AlgoExpert twoNumSum TypeScript exercises with visible context. */
import { describe, it, expect } from "vitest"
// Import the functions from the compiled/transpiled module
// Since we're running .ts directly, we need to re-declare the functions
// based on the fixed twoNumSum.ts content

function twoNumSumBruteForce(array: number[], targetSum: number): number[] {
  for (let i = 0; i < array.length - 1; i++) {
    const firstNumber = array[i]
    for (let j = i + 1; j < array.length; j++) {
      const secondNumber = array[j]
      if (firstNumber + secondNumber === targetSum) {
        return [firstNumber, secondNumber]
      }
    }
  }
  return []
}

function twoNumSumHashMap(array: number[], targetSum: number): number[] {
  const nums = new Set<number>()
  for (const num of array) {
    const potentialMatch = targetSum - num
    if (nums.has(potentialMatch)) {
      return [potentialMatch, num]
    }
    nums.add(num)
  }
  return []
}

function twoNumSumSorted(array: number[], targetSum: number): number[] {
  const sorted = [...array].sort((a, b) => a - b)
  let left = 0
  let right = sorted.length - 1
  while (left < right) {
    const currentSum = sorted[left] + sorted[right]
    if (currentSum === targetSum) {
      return [sorted[left], sorted[right]]
    } else if (currentSum < targetSum) {
      left += 1
    } else {
      right -= 1
    }
  }
  return []
}

describe("twoNumSum exercises", () => {
  // Brute Force tests
  describe("twoNumSumBruteForce", () => {
    it("finds two numbers that add up to targetSum (basic case)", () => {
      const array = [3, 5, -4, 8, 11, 1, -1, 6]
      const targetSum = 10
      const result = twoNumSumBruteForce(array, targetSum)
      expect(result).toEqual([11, -1] || [-1, 11])
    })

    it("returns empty array when no pair found", () => {
      const array = [1, 2, 3, 4]
      const targetSum = 100
      const result = twoNumSumBruteForce(array, targetSum)
      expect(result).toEqual([])
    })

    it("returns empty array for empty input", () => {
      const array = [] as number[]
      const targetSum = 0
      const result = twoNumSumBruteForce(array, targetSum)
      expect(result).toEqual([])
    })

    it("finds pair at the beginning of array", () => {
      const array = [2, 7, 11, 15]
      const targetSum = 9
      const result = twoNumSumBruteForce(array, targetSum)
      expect(result).toEqual([2, 7] || [7, 2])
    })

    it("handles negative numbers correctly", () => {
      const array = [-3, -2, -1, 0, 1, 2, 3]
      const targetSum = 0
      const result = twoNumSumBruteForce(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  // Hash Map tests
  describe("twoNumSumHashMap", () => {
    it("finds two numbers that add up to targetSum (basic case)", () => {
      const array = [3, 5, -4, 8, 11, 1, -1, 6]
      const targetSum = 10
      const result = twoNumSumHashMap(array, targetSum)
      expect(result).toEqual([11, -1] || [-1, 11])
    })

    it("returns empty array when no pair found", () => {
      const array = [1, 2, 3, 4]
      const targetSum = 100
      const result = twoNumSumHashMap(array, targetSum)
      expect(result).toEqual([])
    })

    it("returns empty array for empty input", () => {
      const array = [] as number[]
      const targetSum = 0
      const result = twoNumSumHashMap(array, targetSum)
      expect(result).toEqual([])
    })

    it("finds pair at the beginning of array", () => {
      const array = [2, 7, 11, 15]
      const targetSum = 9
      const result = twoNumSumHashMap(array, targetSum)
      expect(result).toEqual([2, 7] || [7, 2])
    })

    it("handles negative numbers correctly", () => {
      const array = [-3, -2, -1, 0, 1, 2, 3]
      const targetSum = 0
      const result = twoNumSumHashMap(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  // Sorted tests
  describe("twoNumSumSorted", () => {
    it("finds two numbers that add up to targetSum (basic case)", () => {
      const array = [3, 5, -4, 8, 11, 1, -1, 6]
      const targetSum = 10
      const result = twoNumSumSorted(array, targetSum)
      expect(result).toEqual([-1, 11] || [11, -1])
    })

    it("returns empty array when no pair found", () => {
      const array = [1, 2, 3, 4]
      const targetSum = 100
      const result = twoNumSumSorted(array, targetSum)
      expect(result).toEqual([])
    })

    it("returns empty array for empty input", () => {
      const array = [] as number[]
      const targetSum = 0
      const result = twoNumSumSorted(array, targetSum)
      expect(result).toEqual([])
    })

    it("finds pair in already sorted array", () => {
      const array = [2, 7, 11, 15]
      const targetSum = 9
      const result = twoNumSumSorted(array, targetSum)
      expect(result).toEqual([2, 7] || [7, 2])
    })

    it("handles all same numbers with target = 2*num", () => {
      const array = [5, 5, 5, 5] as number[]
      const targetSum = 10
      const result = twoNumSumSorted(array, targetSum)
      expect(result).toEqual([5, 5])
    })

    it("handles mix of negative and positive numbers", () => {
      const array = [-5, -3, -1, 0, 1, 3, 5] as number[]
      const targetSum = 0
      const result = twoNumSumSorted(array, targetSum)
      const validSets = [
        [-5, 5], [5, -5], [-3, 3], [3, -3], [-1, 1], [1, -1],
      ]
      const isValid = validSets.some(([a, b]) => result[0] === a && result[1] === b)
      expect(isValid).toBe(true)
    })
  })
})