function fourNumSum(array: number[][], targetSum: num): number[][]{
  const allPairsSum: {[key:number]: number[][]} = {}
  const quadruplets: number[][] = []
  for (let i = 1; i < array.length -1; i++){
    for (let j = i+1; j < array.length; j++){
      const currentSum = array[i] + array[j]
      const difference = targetSum - currentSum
      if(difference in allPairsSum){
        for (const pairs of allPairsSum[difference]){
          quadruplets.push([...pairs, array[i], array[j]])
        }
      }
    }
    for (let k = 0, k<i; k++){
      const currentSum = array[i] + array[k]
      if(!(currentSum in allPairsSum)){
        allPairsSum[currentSum] = [[array[k], array[i]]]
      }else{
        allPairsSum[currentSum].push([array[k], array[i]])
      }
    }
  }
  return quadruplets
}

// O(n^2) time / O(n^2) space
function fourNumSumComments(array: number[], targetSum: number): number[][] {
  // PATRÓN: "4Sum" con hashmap -> reduce el problema a "encontrar 2 pares
  // cuyas sumas se complementen para dar targetSum"
  // Idea clave: guardamos TODAS las sumas de pares que ya vimos,
  // así, cuando encontramos un nuevo par, solo preguntamos:
  // "¿ya vi un par que sume lo que me falta (difference)?"
  const allPairsSums: { [key: number]: number[][] } = {}; // mapea: suma_de_par -> lista de pares [a, b] que dan esa suma
  const quadruplets: number[][] = [];

  // Recorremos i desde 1 (dejamos al menos un elemento antes, en índice 0,
  // para poder formar pares "anteriores" con k)
  for (let i = 1; i < array.length - 1; i++) {

    // --- Fase 1: buscar complementos ---
    // Para cada j después de i, calculamos la suma actual (array[i] + array[j])
    // y vemos si YA existe en el hashmap un par anterior que sume lo que falta
    for (let j = i + 1; j < array.length; j++) {
      const currentSum = array[i] + array[j];
      const difference = targetSum - currentSum; // lo que necesitaríamos que sumen los otros 2 números

      if (difference in allPairsSums) {
        // Si existe, cada par guardado con esa suma + [array[i], array[j]]
        // forma un cuádruple válido
        for (const pair of allPairsSums[difference]) {
          quadruplets.push([...pair, array[i], array[j]]);
        }
      }
    }

    // --- Fase 2: guardar nuevos pares en el hashmap ---
    // IMPORTANTE: esto va DESPUÉS del loop de j, para no usar el mismo
    // elemento array[i] dos veces en el mismo cuádruple (evita duplicados/auto-match)
    for (let k = 0; k < i; k++) {
      const currentSum = array[i] + array[k];
      if (!(currentSum in allPairsSums)) {
        allPairsSums[currentSum] = [[array[k], array[i]]]; // lista de pares (nota los [[ ]])
      } else {
        allPairsSums[currentSum].push([array[k], array[i]]);
      }
    }
  }

  return quadruplets;
}