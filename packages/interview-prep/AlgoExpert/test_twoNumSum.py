"""Tests for AlgoExpert twoNumSum exercises with visible context."""
from twoNumSum import (
    twoNumberSumBruteForce,
    twoNumberSumHashTable,
    twoNumberSumSorted,
)


if __name__ == "__main__":
    import sys
    
    # Get all test functions
    import test_twoNumSum
    test_functions = [f for f in dir(test_twoNumSum) if f.startswith('test_')]
    
    print(f"Running {len(test_functions)} tests...\n")
    failures = 0
    
    for func_name in test_functions:
        try:
            func = getattr(test_twoNumSum, func_name)
            func()
            print(f"  PASS: {func_name}\n")
        except AssertionError as e:
            print(f"  FAIL: {func_name} - {e}\n")
            failures += 1
        except Exception as e:
            print(f"  ERROR: {func_name} - {type(e).__name__}: {e}\n")
            failures += 1
    
    print(f"{len(test_functions) - failures}/{len(test_functions)} tests passed")
    if failures > 0:
        print(f"{failures} tests failed")
    sys.exit(0 if failures == 0 else 1)


def test_twoNumberSumBruteForce_basic_case():
    """O(n^2) time / O(1) space - find two numbers that add up to targetSum."""
    array = [3, 5, -4, 8, 11, 1, -1, 6]
    targetSum = 10
    result = twoNumberSumBruteForce(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert set(result) == {11, -1} or set(result) == {-1, 11}


def test_twoNumberSumBruteForce_no_pair():
    """No pair found should return empty list."""
    array = [1, 2, 3, 4]
    targetSum = 100
    result = twoNumberSumBruteForce(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert result == []


def test_twoNumberSumBruteForce_empty_array():
    """Empty array should return empty list."""
    array = []
    targetSum = 0
    result = twoNumberSumBruteForce(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert result == []


def test_twoNumberSumBruteForce_pair_at_beginning():
    """Pair at the beginning of array."""
    array = [2, 7, 11, 15]
    targetSum = 9
    result = twoNumberSumBruteForce(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert set(result) == {2, 7} or set(result) == {7, 2}


def test_twoNumberSumBruteForce_negative_numbers():
    """Negative numbers should work correctly."""
    array = [-3, -2, -1, 0, 1, 2, 3]
    targetSum = 0
    result = twoNumberSumBruteForce(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert result != []
    assert set(result) in [
        {3, -3},
        {-3, 3},
        {2, -2},
        {-2, 2},
        {1, -1},
        {-1, 1},
    ]


def test_twoNumberSumHashTable_basic_case():
    """O(n) time / O(n) space - find two numbers that add up to targetSum."""
    array = [3, 5, -4, 8, 11, 1, -1, 6]
    targetSum = 10
    result = twoNumberSumHashTable(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert set(result) == {11, -1} or set(result) == {-1, 11}


def test_twoNumberSumHashTable_no_pair():
    """No pair found should return empty list."""
    array = [1, 2, 3, 4]
    targetSum = 100
    result = twoNumberSumHashTable(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert result == []


def test_twoNumberSumHashTable_empty_array():
    """Empty array should return empty list."""
    array = []
    targetSum = 0
    result = twoNumberSumHashTable(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert result == []


def test_twoNumberSumHashTable_pair_at_beginning():
    """Pair at the beginning of array."""
    array = [2, 7, 11, 15]
    targetSum = 9
    result = twoNumberSumHashTable(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert set(result) == {2, 7} or set(result) == {7, 2}


def test_twoNumberSumHashTable_negative_numbers():
    """Negative numbers should work correctly."""
    array = [-3, -2, -1, 0, 1, 2, 3]
    targetSum = 0
    result = twoNumberSumHashTable(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert result != []
    assert set(result) in [
        {3, -3},
        {-3, 3},
        {2, -2},
        {-2, 2},
        {1, -1},
        {-1, 1},
    ]


def test_twoNumberSumSorted_basic_case():
    """O(nlog(n)) time / O(1) space - find two numbers that add up to targetSum."""
    import copy
    array = [3, 5, -4, 8, 11, 1, -1, 6]
    targetSum = 10
    array_copy = copy.copy(array)
    result = twoNumberSumSorted(array_copy, targetSum)
    print(f"  array={array} (sorted to {array_copy}), targetSum={targetSum} => result={result}")
    assert set(result) == {11, -1} or set(result) == {-1, 11}


def test_twoNumberSumSorted_no_pair():
    """No pair found should return empty list."""
    array = [1, 2, 3, 4]
    targetSum = 100
    result = twoNumberSumSorted(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert result == []


def test_twoNumberSumSorted_empty_array():
    """Empty array should return empty list."""
    array = []
    targetSum = 0
    result = twoNumberSumSorted(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert result == []


def test_twoNumberSumSorted_already_sorted_pair():
    """Already sorted array with pair at beginning."""
    array = [2, 7, 11, 15]
    targetSum = 9
    result = twoNumberSumSorted(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert set(result) == {2, 7} or set(result) == {7, 2}


def test_twoNumberSumSorted_all_same_numbers():
    """All same numbers with target = 2*num."""
    array = [5, 5, 5, 5]
    targetSum = 10
    result = twoNumberSumSorted(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert set(result) == {5, 5}


def test_twoNumberSumSorted_negative_and_positive():
    """Mix of negative and positive numbers."""
    array = [-5, -3, -1, 0, 1, 3, 5]
    targetSum = 0
    result = twoNumberSumSorted(array, targetSum)
    print(f"  array={array}, targetSum={targetSum} => result={result}")
    assert set(result) in [
        {5, -5},
        {-5, 5},
        {3, -3},
        {-3, 3},
        {1, -1},
        {-1, 1},
    ]