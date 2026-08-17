// PATRÓN: "3Sum" -> ordenar + two pointers
// Recordatorio: sort() en JS/TS ordena como texto por defecto,
// por eso SIEMPRE hay que pasar el comparador (a, b) => a - b
function threeNumSum(array: number[], targetSum: number): number[][]{
  array.sort((a, b) => a - b);

  const triplets: number[][] = [];

  // i llega hasta length - 2 porque necesitamos 2 elementos más
  // adelante (left y right) para armar el triplete
  for (let i = 0; i < array.length - 2; i++) {
    let left = i + 1;
    let right = array.length - 1;

    while (left < right) {
      const currentSum = array[i] + array[left] + array[right];

      if (currentSum === targetSum) {
        // Triplete encontrado -> guardamos y movemos ambos punteros
        triplets.push([array[i], array[left], array[right]]);
        left += 1;
        right -= 1;
      } else if (currentSum < targetSum) {
        // Muy chico -> agrandar moviendo left (array ordenado)
        left += 1;
      } else {
        // Muy grande -> achicar moviendo right
        right -= 1;
      }
    }
  }

  return triplets;
}