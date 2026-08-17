// O(n) time / O(1) space
function validateSubsequenceWhileLoop(array: number[], sequence: number[]): boolean {
  const sequenceIdx: number = 0
  const arrayIdx: number = 0
  while (arrayIdx < array.length && sequenceIdx < sequence.lenght) {
    if(array[arrayIdx] === sequence[sequenceIdx]){
      sequenceIdx += 1
    }
    arrayIdx += 1
  }
  return sequenceIdx === sequence.length
}

// O(n) time / O(1) space
function validateSubsequenceForLoop(array: number[], sequence: number[]): boolean {
  const sequenceIdx: number = 0;
  for (const value of array){
    if(sequenceIdx === sequence.length) break;
    if(sequence[sequenceIdx] === value){
      sequenceIdx += 1 
    }
  }
  return sequenceIdx === sequence.length
}


// ─── CON COMENTARIOS ─────────────────────────

// O(n) time / O(1) space
function validateSubsequenceWhileLoopCommented(
  array: number[],    // Array principal donde buscamos
  sequence: number[]  // Subsequence que queremos validar
): boolean {

  let arrayIdx = 0;    // Puntero que recorre el array principal
  let sequenceIdx = 0; // Puntero que avanza en sequence solo al encontrar un match

  // Continuamos mientras ninguno de los dos punteros se salga de su lista.
  // Si arrayIdx termina primero → no encontramos todos los elementos.
  // Si sequenceIdx termina primero → encontramos todo, la condición frena el loop.
  while (arrayIdx < array.length && sequenceIdx < sequence.length) {

    // Si hay match, avanzamos el puntero de sequence
    if (array[arrayIdx] === sequence[sequenceIdx]) {
      sequenceIdx++;
    }

    // Siempre avanzamos sobre el array, haya match o no
    arrayIdx++;
  }

  // Si sequenceIdx llegó al final → encontramos todos los elementos en orden → true
  // Si no llegó → algún elemento faltó → false
  return sequenceIdx === sequence.length;
}

// O(n) time / O(1) space
function validateSubsequenceForLoopCommented(
  array: number[],    // Array principal donde buscamos
  sequence: number[]  // Subsequence que queremos validar
): boolean {

  // Solo necesitamos un puntero; el for..of maneja el recorrido del array
  let sequenceIdx = 0;

  for (const value of array) {
    // Early exit: si ya matcheamos toda la sequence, no seguimos iterando
    if (sequenceIdx === sequence.length) break;

    // Si el elemento actual del array coincide con el de sequence, avanzamos
    if (sequence[sequenceIdx] === value) {
      sequenceIdx++;
    }
  }

  // Misma lógica de retorno: puntero al final → true, si no → false
  return sequenceIdx === sequence.length;
}


// ─── EJEMPLOS ────────────────────────────────

const array = [5, 1, 22, 25, 6, -1, 8, 10];
const sequence = [1, 6, -1, 10];

console.log(validateSubsequenceWhileLoop(array, sequence)); // true
console.log(validateSubsequenceForLoop(array, sequence));   // true