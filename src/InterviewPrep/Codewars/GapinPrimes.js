function isPrim(x) {
  if (x === 2) return true;
  if (x % 2 !== 0) {
    // you only need to check to the half of x
    for (var i = 2; i <= x / 2; i++) {
      if (x % i === 0) {
        return false;
      }
    }
    return true;
  }
  return false;
}
function gap(g, m, n) {
  // your code
  let lastPrim = null;
  for (let i = m; i < n; i++) {
    if (isPrim(i)) {
      if (lastPrim === null) {
        lastPrim = i;
      } else if (i - lastPrim === g) {
        return [lastPrim, i];
      } else {
        lastPrim = i;
      }
    }
  }
  return null;
}

console.log(gap(2, 0, 10)); // [1, 3]
console.log(gap(2, 2, 10)); // [3, 5]
console.log(gap(4, 0, 20)); // [7, 11]
console.log(gap(6, 100, 110)); // null
console.log(gap(8, 3e6, 4e6)); // [3000953, 3000961]

function gap2(gap, start, end) {
  //cut off odd gaps
  //bitwise AND can test least significant bit
  //odd numbers have 1, even have 0
  if (gap & 1) {
    //is it odd?
    if (start > 2 || end < gap + 2) return null; //check if 2 is in range
    return isPrime(gap + 2) ? [2, gap + 2] : null; //check additionally the other part
  }
  var previous = null; //no initial value
  //loop over odd numbers to check for primes
  for (
    var current = start | 1; //set last bit to 1: /odd numbers stay same, even numbers become next odd
    current <= end;
    current += 2 // skip any even number
  ) {
    if (isPrime(current)) {
      if (current - previous === gap)
        //is it a match?
        return [previous, current];
      //no need for "else" here as the other branch has "return"
      previous = current; // anyway, save it
    }
  }

  return null; //no early return from loop = nothing matches

  /**
    Tests if n is prime
  */
  function isPrime(n) {
    if (n <= 6)
      //cut away small primes explicitly
      return n === 2 || n === 3 || n === 5;
    //cut away small divisors (2 and 3) explicitly
    if (
      n & (1 === 0) || //using bitwise AND for even numbers
      n % 3 === 0
    )
      return false;

    var limit = Math.floor(Math.sqrt(n)); //precalculate loop limit
    // loop is checking every divisor using 6k ± 1 pattern
    for (
      var t = 5; //start with 5, first 6k - 1 number
      t <= limit;
      t += 6 //step by 6
    ) {
      if (
        n % t === 0 || //6k - 1
        n % (t + 2) === 0
      )
        //6k + 1
        return false;
    }
    return true;
  }
}
console.log(""); //this makes console output timestamp
console.log("gap(8,3000000,4000000)", "->", gap2(8, 3000000, 4000000)); // ~5ms
console.log("gap(120,3000000,4000000)", "->", gap2(120, 3000000, 4000000)); // ~600ms
