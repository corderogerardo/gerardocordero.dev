//LeetCode #70
// Tecnica:

// ToDo:

//Completixy analysis:
// Time: O(N) Our code loops N times...
// Space: O(N) Array of size N is used.

function climbStairs(n) {
  if (n <= 3) return n;

  let ways = [0, 1, 2, 3];

  for (let i = 4; i <= n; i++) {
    ways.push(ways[i - 1] + ways[i - 2]);
  }

  return ways.pop();
}

const result = climbStairs(4);
console.log("Result: ", result);

//Completixy analysis:
// Time: O(N)
// Space: O(1)
function climbStairs2(n) {
  if (n === 1) return n;

  let first = 1;
  let second = 2;

  for (let i = 3; i <= n; i++) {
    const third = first + second;
    first = second;
    second = third;
  }

  return second;
}

const result2 = climbStairs(4);
console.log("Result: ", result2);
