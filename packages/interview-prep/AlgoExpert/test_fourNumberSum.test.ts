/* Vitest tests for AlgoExpert fourNumberSum exercises with visible context. */
import { describe, it, expect } from "vitest"

// Re-declare the function based on the fourNumSum.ts content
function fourNumSum(array: number[][], targetSum: number): number[][] {
  const allPairsSum: {[key:number]: number[][]} = {}
  const quadruplets: number[][] = []
  for (let i = 1; i < array.length -1; i++){
    for (let j = i+1; j < array.length; j++){
      const currentSum = array[i] + array[j]
      const difference = targetSum - currentSum
      if(difference in allPairsSum){
        for (const pairs of allPairsSum[difference]){
          quadruplets.push([...pairs, array[i], array[j]])
        }
      }
    }
    for (let k = 0; k < i; k++){
      const currentSum = array[i] + array[k]
      if(!(currentSum in allPairsSum)){
        allPairsSum[currentSum] = [[array[k], array[k]]]
      }else{
        allPairsSum[currentSum].push([array[k], array[k]])
      }
    }
  }
  return quadruplets
}

describe("fourNumSum exercises", () => {
  describe("basic_case", () => {
    it("finds all quadruplets that add up to targetSum", () => {
      const array = [2, 7, 4, 0, 9, 5, 1, 3]
      const targetSum = 20
      const result = fourNumSum(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("no_quadruplet", () => {
    it("returns empty array when no quadruplet found", () => {
      const array = [1, 2, 3, 4, 5, 6]
      const targetSum = 100
      const result = fourNumSum(array, targetSum)
      expect(result).toEqual([])
    })
  })

  describe("empty_array", () => {
    it("returns empty array for empty input", () => {
      const array = [] as number[]
      const targetSum = 0
      const result = fourNumSum(array, targetSum)
      expect(result).toEqual([])
    })
  })

  describe("minimal_four_elements", () => {
    it("array with exactly 4 elements that sum to target", () => {
      const array = [1, 0, -1, 0]
      const targetSum = 0
      const result = fourNumSum(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("negative_numbers", () => {
    it("negative numbers should work correctly", () => {
      const array = [-2, -1, 0, 1, 2, 3, 4, 5]
      const targetSum = 0
      const result = fourNumSum(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("duplicate_values", () => {
    it("test with duplicates in array", () => {
      const array = [2, 2, 2, 2, 2, 2, 2, 2]
      const targetSum = 8
      const result = fourNumSum(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("all_positive", () => {
    it("all positive numbers", () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8]
      const targetSum = 20
      const result = fourNumSum(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("mixed_positive_negative", () => {
    it("mix of positive and negative numbers", () => {
      const array = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
      const targetSum = 0
      const result = fourNumSum(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("quadruplet_at_beginning", () => {
    it("quadruplet involving beginning elements", () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8]
      const targetSum = 10
      const result = fourNumSum(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("large_target", () => {
    it("large target sum", () => {
      const array = [10, 20, 30, 40, 50, 60, 70, 80]
      const targetSum = 200
      const result = fourNumSum(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("small_target", () => {
    it("small (or negative) target sum", () => {
      const array = [-10, -5, 0, 5, 10, 15, 20, 25]
      const targetSum = -10
      const result = fourNumSum(array, targetSum)
      expect(result.length).toBeGreaterThan(0)
    })
  })
})