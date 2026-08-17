"""Tests for AlgoExpert fourNumberSum exercises with visible context."""
from fourNumSum import fourNumSum


if __name__ == "__main__":
    import sys

    # Get all test functions
    import test_fourNumberSum
    test_functions = [f for f in dir(test_fourNumberSum) if f.startswith('test_')]

    print(f"Running {len(test_functions)} tests...\n")
    failures = 0

    for func_name in test_functions:
        try:
            func = getattr(test_fourNumberSum, func_name)
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


def test_fourNumSum_basic_case():
    """O(n^2) time / O(n^2) space - find all quadruplets that add up to targetSum."""
    array = [2, 7, 4, 0, 9, 5, 1, 3]
    targetSum = 20
    result = fourNumSum(array, targetSum)
    print(f"  basic_case: array={array}, targetSum={targetSum} => result={result}")
    # Should find quadruplets that sum to 20
    assert len(result) > 0


def test_fourNumSum_no_quadruplet():
    """No quadruplet found should return empty list."""
    array = [1, 2, 3, 4, 5, 6]
    targetSum = 100
    result = fourNumSum(array, targetSum)
    print(f"  no_quadruplet: array={array}, targetSum={targetSum} => result={result}")
    assert result == []


def test_fourNumSum_empty_array():
    """Empty array should return empty list."""
    array = []
    targetSum = 0
    result = fourNumSum(array, targetSum)
    print(f"  empty_array: array={array}, targetSum={targetSum} => result={result}")
    assert result == []


def test_fourNumSum_minimal_four_elements():
    """Array with exactly 4 elements that sum to target."""
    array = [1, 0, -1, 0]
    targetSum = 0
    result = fourNumSum(array, targetSum)
    print(f"  minimal_four_elements: array={array}, targetSum={targetSum} => result={result}")
    assert len(result) > 0


def test_fourNumSum_negative_numbers():
    """Negative numbers should work correctly."""
    array = [-2, -1, 0, 1, 2, 3, 4, 5]
    targetSum = 0
    result = fourNumSum(array, targetSum)
    print(f"  negative_numbers: array={array}, targetSum={targetSum} => result={result}")
    assert len(result) > 0


def test_fourNumSum_duplicate_quadruplets():
    """Test with duplicates in array."""
    array = [2, 2, 2, 2, 2, 2, 2, 2]
    targetSum = 8
    result = fourNumSum(array, targetSum)
    print(f"  duplicate_quadruplets: array={array}, targetSum={targetSum} => result={result}")
    assert len(result) > 0


def test_fourNumSum_all_positive():
    """All positive numbers."""
    array = [1, 2, 3, 4, 5, 6, 7, 8]
    targetSum = 20
    result = fourNumSum(array, targetSum)
    print(f"  all_positive: array={array}, targetSum={targetSum} => result={result}")
    assert len(result) > 0


def test_fourNumSum_mixed_positive_negative():
    """Mix of positive and negative numbers."""
    array = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
    targetSum = 0
    result = fourNumSum(array, targetSum)
    print(f"  mixed_positive_negative: array={array}, targetSum={targetSum} => result={result}")
    assert len(result) > 0


def test_fourNumSum_quadruplet_at_beginning():
    """Quadruplet at the beginning of array."""
    array = [1, 2, 3, 4, 5, 6, 7, 8]
    targetSum = 10
    result = fourNumSum(array, targetSum)
    print(f"  quadruplet_at_beginning: array={array}, targetSum={targetSum} => result={result}")
    assert len(result) > 0


def test_fourNumSum_large_target():
    """Large target sum."""
    array = [10, 20, 30, 40, 50, 60, 70, 80]
    targetSum = 200
    result = fourNumSum(array, targetSum)
    print(f"  large_target: array={array}, targetSum={targetSum} => result={result}")
    assert len(result) > 0


def test_fourNumSum_small_target():
    """Small (or negative) target sum."""
    array = [-10, -5, 0, 5, 10, 15, 20, 25]
    targetSum = -10
    result = fourNumSum(array, targetSum)
    print(f"  small_target: array={array}, targetSum={targetSum} => result={result}")
    assert len(result) > 0