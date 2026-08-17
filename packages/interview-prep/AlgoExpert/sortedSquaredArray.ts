// O(n log n) time / O(n) space
function sortedSquareArrayBruteForce(array: number[]): number[] {
  const sortedSquares: number[] = new Array(array.length).fill(0)

  for(let idx = 0; idx < array.length; idx++){
    const value = array[idx]
    sortedSquares[idx] = value * value
  }

  sortedSquares.sort((a,b)=> a-b)
  return sortedSquares
}

// O(n) time / O(n) space
function sortedSquareArray(array: number[]): number[] {
  const sortedSquares: number[] = new Array(array.length).fill(0)
  const smallerValueIdx = 0;
  const largerValueIdx = array.length - 1

  for(let idx = array.length - 1; idx >= 0; idx--){
    const smallerValue = array[smallerValueIdx];
    const largerValue = array[largerValueIdx];

    if(Math.abs(smallerValue) > Math.abs(largerValue)){
      sortedSquares[idx] = smallerValue * smallerValue
      smallerValueIdx += 1
    } else {
      sortedSquares[idx] = largerValue * largerValue
      largerValueIdx -= 1
    }
  }
  return sortedSquares
}



// ─────────────────────────────────────────────
// SORTED SQUARED ARRAY — TypeScript
// ─────────────────────────────────────────────

// ─── CON COMENTARIOS ─────────────────────────

// O(n log n) time — por el .sort() al final
// O(n) space     — el array resultado tiene el mismo tamaño que el input
function sortedSquareArrayBruteForceCommented(array: number[]): number[] {

  // Creamos un array del mismo tamaño que el input, relleno de ceros.
  // En TS usamos new Array(length).fill(0) en lugar del list comprehension de Python.
  const sortedSquares: number[] = new Array(array.length).fill(0);

  // Iteramos sobre cada índice del array original
  for (let idx = 0; idx < array.length; idx++) {
    const value = array[idx];               // Tomamos el valor en la posición actual
    sortedSquares[idx] = value * value;     // Elevamos al cuadrado y guardamos en la misma posición
  }

  // Los cuadrados están calculados pero NO ordenados todavía.
  // IMPORTANTE: el .sort() de JS/TS ordena lexicográficamente por defecto,
  // por eso pasamos el comparador (a, b) => a - b para orden numérico ascendente.
  sortedSquares.sort((a, b) => a - b);

  return sortedSquares; // Array de cuadrados ordenado de menor a mayor
}


// O(n) time  — una sola pasada sobre el array
// O(n) space — el array resultado tiene el mismo tamaño que el input
//
// Idea clave: el array ya está ordenado, entonces el cuadrado más grande
// siempre está en uno de los dos extremos (el más negativo o el más positivo).
// Llenamos el resultado de ATRÁS hacia ADELANTE usando dos punteros.
function sortedSquareArrayCommented(array: number[]): number[] {

  // Array de resultado del mismo tamaño, inicializado en ceros
  const sortedSquares: number[] = new Array(array.length).fill(0);

  let smallerValueIdx = 0;                // Puntero izquierdo → extremo con valores más negativos
  let largerValueIdx = array.length - 1;  // Puntero derecho  → extremo con valores más positivos

  // Llenamos de atrás hacia adelante: idx va de n-1 hasta 0.
  // Cada iteración coloca el cuadrado MÁS GRANDE que queda disponible.
  for (let idx = array.length - 1; idx >= 0; idx--) {
    const smallerValue = array[smallerValueIdx]; // Valor en el extremo izquierdo
    const largerValue = array[largerValueIdx];   // Valor en el extremo derecho

    // Comparamos valores absolutos: el mayor en abs() tiene el cuadrado más grande.
    // Math.abs() es el equivalente de abs() de Python.
    if (Math.abs(smallerValue) > Math.abs(largerValue)) {
      // El extremo izquierdo gana → colocamos su cuadrado en la posición actual (la más grande libre)
      sortedSquares[idx] = smallerValue * smallerValue;
      smallerValueIdx++; // Movemos el puntero izquierdo hacia adentro
    } else {
      // El extremo derecho gana (o empatan) → colocamos su cuadrado
      sortedSquares[idx] = largerValue * largerValue;
      largerValueIdx--; // Movemos el puntero derecho hacia adentro
    }
  }

  return sortedSquares; // El array quedó llenado en orden ascendente
}


// ─── EJEMPLOS ────────────────────────────────

// Caso 1: array con negativos y positivos
const array1 = [-7, -3, 1, 2, 4];
console.log("Input:          ", array1);
console.log("Brute Force:    ", sortedSquareArrayBruteForce(array1)); // [1, 4, 9, 16, 49]
console.log("Dos punteros:   ", sortedSquareArray(array1));            // [1, 4, 9, 16, 49]
console.log();

// Caso 2: todos negativos
const array2 = [-5, -4, -3, -2, -1];
console.log("Input:          ", array2);
console.log("Brute Force:    ", sortedSquareArrayBruteForce(array2)); // [1, 4, 9, 16, 25]
console.log("Dos punteros:   ", sortedSquareArray(array2));            // [1, 4, 9, 16, 25]
console.log();

// Caso 3: todos positivos
const array3 = [1, 2, 3, 4, 5];
console.log("Input:          ", array3);
console.log("Brute Force:    ", sortedSquareArrayBruteForce(array3)); // [1, 4, 9, 16, 25]
console.log("Dos punteros:   ", sortedSquareArray(array3));            // [1, 4, 9, 16, 25]
console.log();

// Caso 4: un solo elemento
const array4 = [-3];
console.log("Input:          ", array4);
console.log("Brute Force:    ", sortedSquareArrayBruteForce(array4)); // [9]
console.log("Dos punteros:   ", sortedSquareArray(array4));            // [9]