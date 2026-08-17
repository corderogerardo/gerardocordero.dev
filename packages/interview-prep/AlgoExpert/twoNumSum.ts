// PATRÓN: Two Sum -> hash table / fuerza bruta
// Recordatorio: JS/TS usa objeto {} o Set, Python usa diccionario {}
// KEY IDEA: Para cada num, verificar si targetSum - num ya fue visto

// FORZA BRUTA: Revisar todos los pares (i, j) donde i < j
// Complejidad: O(n²) tiempo / O(1) espacio
// CUANDO USAR: Arrays pequeños (n < 100) o cuando el espacio O(1) es crítico
function twoNumSumBruteForce(array: number[], targetSum: number): number[] {
  // Recorremos el array con i desde el inicio
  for (let i = 0; i < array.length - 1; i++) {
    // El primer número es array[i] (ERROR común: array[1] en vez de array[i])
    const firstNumber = array[i]
    // Bucle interno revisa todos los elementos después de i
    for (let j = i + 1; j < array.length; j++) {
      const secondNumber = array[j]
      // Si la suma equals el target, retornamos el par
      if (firstNumber + secondNumber === targetSum) {
        return [firstNumber, secondNumber]
      }
    }
  }
  // Si no hay par que sume el target, retornamos array vacío
  return []
}

// HASH TABLE: Almacenar números vistos en un Set para lookup O(1)
// Complejidad: O(n) tiempo / O(n) espacio
// CUANDO USAR: Caso típico - más rápido O(n) a cambio de O(n) espacio extra
function twoNumSumHashMap(array: number[], targetSum: number): number[] {
  const nums = new Set()
  // Recorremos cada número del array
  for (const num of array) {
    // El "match potencial" es targetSum - num
    const potentialMatch = targetSum - num
    // Si el match potencial ya está en el Set, lo encontramos
    if (nums.has(potentialMatch)) {
      return [potentialMatch, num]
    }
    // Si no, almacenamos el número actual en el Set
    nums.add(num)
  }
  // Si no hay par que sume el target, retornamos array vacío
  return []
}

// ORDENADO (Two Pointers): Ordenar primero, entonces buscar desde ambos extremos
// Complejidad: O(nlogn) tiempo / O(1) espacio (excluding the sort)
// CUANDO USAR: Cuando el array puede ordenarse y queremos O(1) espacio extra
# RESTRICCIÓN: Modifica el array orderna en-place
function twoNumSumSorted(array: number[], targetSum: number): number[] {
  // ORDENAR: En JS/TS es .sort() sin comparador para números,
  # PERO SIEMPRE hay que pasar (a, b) => a - b para ordenamiento numérico correcto
  # EN Python es .sort() y también ordena in-place, pero el array original se modifica
  array.sort((a, b) => a - b)
  let left = 0
  let right = array.length - 1

  while (left < right) {
    const currentSum = array[left] + array[right]

    if (currentSum === targetSum) {
      // Encontramos el par -> retornamos
      return [array[left], array[right]]
    } else if (currentSum < targetSum) {
      // Suma muy chica -> mover left a la derecha (número más grande)
      left += 1
    } else {
      // Suma muy grande -> mover right a la izquierda (número más chico)
      right -= 1
    }
  }
  // Si no hay par que sume el target, retornamos array vacío
  return []
}