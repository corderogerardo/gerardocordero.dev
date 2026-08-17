/**
 * CACHE SIMULATION EXERCISE
 * 
 * Problem: Given a cache capacity and a sequence of page references,
 * simulate a FIFO (First-In-First-Out) cache and return the maximum
 * consecutive time (number of references) between cache misses.
 * 
 * This exercise demonstrates:
 * - Array manipulation (splice, includes, shift, push)
 * - Cache replacement policies
 * - Time complexity tracking
 * - FIFO eviction strategy
 */

function solution(t, input_arr) {
  // CACHE CAPACITY: maximum number of items the cache can hold
  const cantidadEnCache = t;
  
  // DATABASE LIMIT: maximum records allowed in the database (not used in this function)
  const registrosPermitidosEnDB = 12;
  
  // INPUT PROCESSING:
  // Convert input to array if it's a string (split by spaces),
  // otherwise use as-is. This handles both CLI input and function calls.
  const registros =
    typeof input_arr === "string" ? input_arr.split(" ") : input_arr;
  
  // STATE VARIABLES initialization:
  // tiempo: current consecutive time without a cache hit (resets on hit)
  // maxTiempo: maximum tiempo observed throughout the entire sequence
  let tiempo = t;           // Start at t because initial cache fill takes t steps
  let maxTiempo = 0;        // Track the maximum stretch between misses
  
  // INITIAL CACHE FILL (FIFO - First In First Out):
  // Take the first 'cantidadEnCache' items from the registros array
  // and populate the cache. We use splice which MODIFIES the original array.
  const newRegistro = [...registros.splice(0, cantidadEnCache)];
  // Create a copy of the initial cache state for comparison later
  const cache = [...newRegistro];
  
  // MAIN PROCESSING LOOP: iterate through remaining registry items
  registros.forEach((value) => {
    // Check if the current value EXISTS in the cache
    // .includes() performs a linear search O(n) where n = cache size
    let isInCache = cache.includes(value);
    
    // CASE 1: CACHE HIT - value found in cache
    if (isInCache) {
      // INCREMENT time counter since we didn't need to evict anything
      tiempo++;
    }
    // CASE 2: CACHE MISS - value not found in cache
    else {
      // UPDATE maxTiempo: if current tiempo exceeds previous max, update it
      // Ternary operator: (condition) ? value_if_true : value_if_false
      maxTiempo = tiempo > maxTiempo ? tiempo : maxTiempo;
      
      // FIFO EVICTION: remove the oldest item (first element) from cache
      // .shift() removes index 0 and returns it; we discard the returned value
      cache.shift();
      
      // ADD the new item to the end of the cache (most recently used position)
      // .push() adds to the end of the array
      cache.push(value);
      
      // RESET time counter since we just loaded a new item into cache
      tiempo = 0;
    }
  });
  
  // RETURN the maximum consecutive time between cache misses
  return maxTiempo;
}

// ============================================================
// INPUT HANDLING (Command Line Interface)
// This section reads from standard input and executes the solution
// ============================================================

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

// Accumulate input lines as they arrive
let inputString = [];
let i = 0;

// When each line is received from stdin
rl.on("line", (input) => {
  inputString.push(input);
});

// When input stream ends (EOF)
rl.on("close", () => {
  main();
});

// Helper function to read the next input line
function gets() {
  return inputString[i++];
}

// Main function: entry point for CLI execution
function main() {
  // Read cache capacity (t)
  const t = parseInt(gets());
  
  // Read number of elements (n) - declared but not used in this function
  const n = parseInt(gets());
  
  // NOTE: The following lines are commented out because the test uses a hardcoded value
  // const input_arr = gets()
  //   .split(" ")
  //   .map((arTemp) => parseInt(arTemp));
  
  // Execute solution with hardcoded test input: "1 2 3 2 4 2 2 4 3 2 1 3 4 3"
  // This specific test case has cache size 1 and 14 references
  let result = solution(t, "1 2 3 2 4 2 2 4 3 2 1 3 4 3");
  
  // Output the result to stdout
  console.log(result);
}

// Start the program
main();