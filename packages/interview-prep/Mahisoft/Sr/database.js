/**
 * DATABASE QUERY EXERCISE
 * 
 * Problem: Given an integer n, create an array [1, 2, ..., n-1],
 * filter out multiples of 13, then filter again using the result,
 * and return the last remaining element.
 * 
 * This exercise demonstrates:
 * - Array creation and population with loops
 * - The modulo operator (%) and its use in filtering
 * - Chained .filter() operations
 * - Understanding truthy/falsy values in JavaScript
 * - Array method chaining and composition
 */

function solution(n) {
  // STEP 1: CREATE initial array [1, 2, 3, ..., n-1]
  // We use new Array(n) to create an array with length n (but empty slots)
  const arr = new Array(n);
  
  // Populate the array using a for loop starting at index 1
  // We push values 1 through n-1 into the array
  // After this loop: arr = [1, 2, 3, ..., n-1]
  // Example with n=27: arr = [1, 2, 3, ..., 26]
  for (let i = 1; i < n; i++) {
    arr.push(i);
  }
  
  // STEP 2: FIRST FILTER - Remove multiples of 13
  // The modulo operator % computes the remainder of division
  // value % 13 === 0 when value is a multiple of 13 (e.g., 13, 26)
  // In JavaScript, 0 is falsy, any non-zero number is truthy
  // .filter() keeps elements where the callback returns truthy values
  const multiplos = arr.filter((value) => value % 13);
  
  // What this does:
  // - Keeps values where value % 13 is TRUTHY (non-zero remainder)
  // - Removes values where value % 13 is FALSY (remainder is 0, i.e., multiples of 13)
  // - For n=27, arr=[1..26], this removes 13 and 26
  // - Result: [1,2,3,4,5,6,7,8,9,10,11,12,14,15,...,25] (25 elements)
  
  // STEP 3: SECOND FILTER - Keep only values that are IN the 'multiplos' array
  // This is an interesting pattern: we're filtering arr AGAIN, but this time
  // keeping values that EXISTS in the 'multiplos' array from the FIRST filter.
  // Since 'multiplos' already has the non-multiples of 13, this second filter
  // effectively keeps the same set (intersection of arr with itself filtered).
  const newArr = arr.filter((value) => multiplos.includes(value));
  
  // What this does:
  // For each value in original arr, check if it's included in 'multiplos'
  // Since 'multiplos' contains ALL values except multiples of 13,
  // this second filter keeps the same set as the first filter.
  // The result is still: [1,2,3,4,5,6,7,8,9,10,11,12,14,15,...,25]
  
  // STEP 4: RETURN the LAST element of the filtered array
  // .newArr.length - 1 gives the index of the last element
  // With n=27: newArr = [1,2,...,12,14,...,25], last element = 25
  return newArr[newArr.length - 1];
}

// ============================================================
// INPUT HANDLING (Command Line Interface)
// This section runs the solution with a hardcoded test case
// ============================================================

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

let inputString = [];
let i = 0;

rl.on("line", (input) => {
  inputString.push(input);
});

rl.on("close", () => {
  main();
});

function gets() {
  return inputString[i++];
}

function main() {
  // NOTE: The input reading is commented out for this test case
  // let result = solution(27);
  
  // Execute with n=27 as hardcoded test
  // Expected: removes multiples of 13 from [1..26], keeps non-multiples,
  //          filters again, returns last element = 25
  let result = solution(27);
  
  console.log(result);
}

// Start the program
main();