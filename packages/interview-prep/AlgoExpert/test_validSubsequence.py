"""Tests for AlgoExpert validSubsequence Python exercises.

These tests use plain Python assert statements and can be run with:
    python3 test_validSubsequence.py
or with pytest if available:
    pytest test_validSubsequence.py
"""
from typing import List


def validateSubsequenceWhileLoop(array: List[int], sequence: List[int]) -> bool:
  """O(n) time / O(1) space - while loop implementation."""
  arrayIdx = 0
  sequenceIdx = 0
  while arrayIdx < len(array) and sequenceIdx < len(sequence):
    if array[arrayIdx] == sequence[sequenceIdx]:
      sequenceIdx += 1
    arrayIdx += 1
  return sequenceIdx == len(sequence)


def validateSubsequenceForLoop(array: List[int], sequence: List[int]) -> bool:
  """O(n) time / O(1) space - for loop implementation."""
  sequenceIdx = 0
  for value in array:
    if sequenceIdx == len(sequence):
      break
    if sequence[sequenceIdx] == value:
      sequenceIdx += 1
  return sequenceIdx == len(sequence)


def validateSubsequenceWhileLoopComments(array: List[int], sequence: List[int]) -> bool:
  """O(n) time / O(1) space - while loop with comments."""
  arrayIdx = 0
  sequenceIdx = 0
  while arrayIdx < len(array) and sequenceIdx < len(sequence):
    if array[arrayIdx] == sequence[sequenceIdx]:
      sequenceIdx += 1
    arrayIdx += 1
  return sequenceIdx == len(sequence)


def validateSubsequenceForLoopComments(array: List[int], sequence: List[int]) -> bool:
  """O(n) time / O(1) space - for loop with comments."""
  sequenceIdx = 0
  for value in array:
    if sequenceIdx == len(sequence):
      break
    if sequence[sequenceIdx] == value:
      sequenceIdx += 1
  return sequenceIdx == len(sequence)


def test_validateSubsequenceWhileLoop_basic_case():
    """returns true when sequence is a valid subsequence (basic case)."""
    array = [5, 1, 22, 25, 6, -1, 8, 10]
    sequence = [1, 6, -1, 10]
    assert validateSubsequenceWhileLoop(array, sequence) is True


def test_validateSubsequenceWhileLoop_empty_sequence():
    """returns true when sequence is empty."""
    array = [5, 1, 22, 25, 6, -1, 8, 10]
    sequence = []
    assert validateSubsequenceWhileLoop(array, sequence) is True


def test_validateSubsequenceWhileLoop_invalid_subsequence():
    """returns false when sequence is not a valid subsequence."""
    array = [1, 2, 3, 4]
    sequence = [3, 1]
    assert validateSubsequenceWhileLoop(array, sequence) is False


def test_validateSubsequenceWhileLoop_array_equals_sequence():
    """returns true when array equals sequence."""
    array = [1, 2, 3]
    sequence = [1, 2, 3]
    assert validateSubsequenceWhileLoop(array, sequence) is True


def test_validateSubsequenceWhileLoop_sequence_longer_than_array():
    """returns false when sequence is longer than array."""
    array = [1, 2]
    sequence = [1, 2, 3]
    assert validateSubsequenceWhileLoop(array, sequence) is False


def test_validateSubsequenceWhileLoop_single_element_present():
    """returns true when sequence has single element present in array."""
    array = [1, 2, 3, 4]
    sequence = [3]
    assert validateSubsequenceWhileLoop(array, sequence) is True


def test_validateSubsequenceWhileLoop_single_element_not_present():
    """returns false when sequence has single element not in array."""
    array = [1, 2, 3, 4]
    sequence = [5]
    assert validateSubsequenceWhileLoop(array, sequence) is False


def test_validateSubsequenceForLoop_basic_case():
    """returns true when sequence is a valid subsequence (basic case)."""
    array = [5, 1, 22, 25, 6, -1, 8, 10]
    sequence = [1, 6, -1, 10]
    assert validateSubsequenceForLoop(array, sequence) is True


def test_validateSubsequenceForLoop_empty_sequence():
    """returns true when sequence is empty."""
    array = [5, 1, 22, 25, 6, -1, 8, 10]
    sequence = []
    assert validateSubsequenceForLoop(array, sequence) is True


def test_validateSubsequenceForLoop_invalid_subsequence():
    """returns false when sequence is not a valid subsequence."""
    array = [1, 2, 3, 4]
    sequence = [3, 1]
    assert validateSubsequenceForLoop(array, sequence) is False


def test_validateSubsequenceForLoop_array_equals_sequence():
    """returns true when array equals sequence."""
    array = [1, 2, 3]
    sequence = [1, 2, 3]
    assert validateSubsequenceForLoop(array, sequence) is True


def test_validateSubsequenceForLoop_sequence_longer_than_array():
    """returns false when sequence is longer than array."""
    array = [1, 2]
    sequence = [1, 2, 3]
    assert validateSubsequenceForLoop(array, sequence) is False


def test_validateSubsequenceForLoop_single_element_present():
    """returns true when sequence has single element present in array."""
    array = [1, 2, 3, 4]
    sequence = [3]
    assert validateSubsequenceForLoop(array, sequence) is True


def test_validateSubsequenceForLoop_single_element_not_present():
    """returns false when sequence has single element not in array."""
    array = [1, 2, 3, 4]
    sequence = [5]
    assert validateSubsequenceForLoop(array, sequence) is False


def test_validateSubsequenceWhileLoopComments_basic_case():
    """returns true when sequence is a valid subsequence (basic case)."""
    array = [5, 1, 22, 25, 6, -1, 8, 10]
    sequence = [1, 6, -1, 10]
    assert validateSubsequenceWhileLoopComments(array, sequence) is True


def test_validateSubsequenceWhileLoopComments_empty_sequence():
    """returns true when sequence is empty."""
    array = [5, 1, 22, 25, 6, -1, 8, 10]
    sequence = []
    assert validateSubsequenceWhileLoopComments(array, sequence) is True


def test_validateSubsequenceWhileLoopComments_invalid_subsequence():
    """returns false when sequence is not a valid subsequence."""
    array = [1, 2, 3, 4]
    sequence = [3, 1]
    assert validateSubsequenceWhileLoopComments(array, sequence) is False


def test_validateSubsequenceForLoopComments_basic_case():
    """returns true when sequence is a valid subsequence (basic case)."""
    array = [5, 1, 22, 25, 6, -1, 8, 10]
    sequence = [1, 6, -1, 10]
    assert validateSubsequenceForLoopComments(array, sequence) is True


def test_validateSubsequenceForLoopComments_empty_sequence():
    """returns true when sequence is empty."""
    array = [5, 1, 22, 25, 6, -1, 8, 10]
    sequence = []
    assert validateSubsequenceForLoopComments(array, sequence) is True


def test_validateSubsequenceForLoopComments_invalid_subsequence():
    """returns false when sequence is not a valid subsequence."""
    array = [1, 2, 3, 4]
    sequence = [3, 1]
    assert validateSubsequenceForLoopComments(array, sequence) is False