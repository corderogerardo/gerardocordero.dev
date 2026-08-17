"""Tests for AlgoExpert sortedSquaredArray Python exercises.

These tests use plain Python assert statements and can be run with:
    python3 test_sortedSquaredArray.py
or with pytest if available:
    pytest test_sortedSquaredArray.py
"""
from typing import List


def sortedSquareArrayBruteForce(array: List[int]) -> List[int]:
  """O(nlog(n)) time / O(n) space - brute force approach."""
  sortedSquares = [0 for _ in array]

  for idx in range(len(array)):
    value = array[idx]
    sortedSquares[idx] = value * value

  sortedSquares.sort()
  return sortedSquares


def sortedSquareArray(array: List[int]) -> List[int]:
  """O(n) time / O(n) space - optimal two-pointer approach."""
  sortedSquares = [0 for _ in array]
  smallerValueIdx = 0
  largerValueIdx = len(array) - 1

  for idx in reversed(range(len(array))):
    smallerValue = array[smallerValueIdx]
    largerValue = array[largerValueIdx]
    if abs(smallerValue) > abs(largerValue):
      sortedSquares[idx] = smallerValue * smallerValue
      smallerValueIdx += 1
    else:
      sortedSquares[idx] = largerValue * largerValue
      largerValueIdx -= 1

  return sortedSquares


def test_sortedSquareArrayBruteForce_basic_positive():
    """returns squared array sorted ascending (basic case with all positive)."""
    array = [1, 2, 3, 5, 6, 8, 9]
    result = sortedSquareArrayBruteForce(array)
    expected = [1, 4, 9, 25, 36, 64, 81]
    assert result == expected


def test_sortedSquareArrayBruteForce_basic_negative():
    """returns squared array sorted ascending (basic case with all negative)."""
    array = [-9, -8, -6, -5, -3, -2, -1]
    result = sortedSquareArrayBruteForce(array)
    expected = [1, 4, 9, 25, 36, 64, 81]
    assert result == expected


def test_sortedSquareArrayBruteForce_mixed():
    """returns squared array sorted ascending (mixed positive and negative)."""
    array = [-5, -4, -3, 2, 6, 8]
    result = sortedSquareArrayBruteForce(array)
    expected = [4, 9, 16, 25, 36, 64]
    assert result == expected


def test_sortedSquareArrayBruteForce_empty():
    """returns empty array for empty input."""
    array: List[int] = []
    result = sortedSquareArrayBruteForce(array)
    expected: List[int] = []
    assert result == expected


def test_sortedSquareArrayBruteForce_single_element():
    """returns single squared value for single element."""
    array = [5]
    result = sortedSquareArrayBruteForce(array)
    expected = [25]
    assert result == expected


def test_sortedSquareArray_basic_positive():
    """returns squared array sorted ascending (optimal, all positive)."""
    array = [1, 2, 3, 5, 6, 8, 9]
    result = sortedSquareArray(array)
    expected = [1, 4, 9, 25, 36, 64, 81]
    assert result == expected


def test_sortedSquareArray_basic_negative():
    """returns squared array sorted ascending (optimal, all negative)."""
    array = [-9, -8, -6, -5, -3, -2, -1]
    result = sortedSquareArray(array)
    expected = [1, 4, 9, 25, 36, 64, 81]
    assert result == expected


def test_sortedSquareArray_mixed():
    """returns squared array sorted ascending (optimal, mixed positive and negative)."""
    array = [-5, -4, -3, 2, 6, 8]
    result = sortedSquareArray(array)
    expected = [4, 9, 16, 25, 36, 64]
    assert result == expected


def test_sortedSquareArray_empty():
    """returns empty array for empty input."""
    array: List[int] = []
    result = sortedSquareArray(array)
    expected: List[int] = []
    assert result == expected


def test_sortedSquareArray_single_element():
    """returns single squared value for single element."""
    array = [5]
    result = sortedSquareArray(array)
    expected = [25]
    assert result == expected


def test_sortedSquareArray_optimal_vs_bruteForce():
    """optimal and brute force should produce same results for same sorted input."""
    import random
    random.seed(42)
    for _ in range(20):
        # Generate sorted array (needed for optimal approach)
        n = random.randint(1, 20)
        vals = [random.randint(-100, 100) for _ in range(n)]
        array = sorted(vals)  # Ensure sorted input for optimal function
        brute_result = sortedSquareArrayBruteForce(array)
        optimal_result = sortedSquareArray(array)
        assert brute_result == optimal_result, f"Mismatch for {array}: brute={brute_result}, optimal={optimal_result}"