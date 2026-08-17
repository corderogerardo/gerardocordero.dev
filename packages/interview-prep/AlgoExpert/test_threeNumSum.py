"""Tests for AlgoExpert threeNumSum exercises with visible context."""
from threeNumSum import threeNumSum


def test_with_context(name, array, targetSum):
    """Run a test and show array, targetSum, and result."""
    result = threeNumSum(array, targetSum)
    print(f"  {name}: array={array}, targetSum={targetSum} => result={result}")
    return result


console_ran = False

def run_all_tests():
    global console_ran
    if console_ran:
        return
    console_ran = True
    
    print("Running threeNumSum tests with context...\n")
    
    # Basic case
    test_with_context("Basic case", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 18)
    
    # No solution
    test_with_context("No solution", [1, 2, 3, 4], 100)
    
    # Empty array
    test_with_context("Empty array", [], 0)
    
    # All zeros
    test_with_context("All zeros", [0, 0, 0, 0], 0)
    
    # LeetCode style with duplicates
    test_with_context("LeetCode style", [-1, 0, 1, 2, -1, -4], 0)
    
    # Negative and positive
    test_with_context("Negative and positive", [-5, -2, -1, 0, 1, 2, 5], 0)
    
    # Small array (< 3 elements)
    test_with_context("Small array", [1, 2], 3)
    
    # Triplet at beginning
    test_with_context("Triplet at beginning", [1, 2, 3, 4, 5], 6)
    
    # Target not achievable
    test_with_context("Target not achievable", [10, 20, 30], 5)
    
    # All positive
    test_with_context("All positive", [1, 2, 3, 4, 5, 6, 7], 12)
    
    # All negative
    test_with_context("All negative", [-5, -4, -3, -2, -1], -9)
    
    # With gaps
    test_with_context("With gaps", [-10, -3, 1, 4, 7, 15], 0)
    
    print("\nAll tests completed!")


if __name__ == "__main__":
    run_all_tests()