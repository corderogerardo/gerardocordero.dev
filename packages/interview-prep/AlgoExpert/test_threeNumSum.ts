/* Tests for AlgoExpert threeNumSum TypeScript exercises with visible context (Spanish comments). */
import "./threeNumSum";

// Ejecutor de pruebas que muestra array, targetSum y resultado
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
  } catch (e) {
    console.log(`  FAIL: ${name} - ${e}`);
  }
}

// Importar la función re-declarándola (porque tsx maneja el .ts de forma distinta)
function threeNumSum(array: number[], targetSum: number): number[][] {
  const sorted = [...array].sort((a, b) => a - b)
  const triplets: number[][] = []
  for (let i = 0; i < sorted.length - 2; i++) {
    if (i > 0 && sorted[i] === sorted[i - 1]) continue
    let left = i + 1
    let right = sorted.length - 1
    while (left < right) {
      const currentSum = sorted[i] + sorted[left] + sorted[right]
      if (currentSum === targetSum) {
        triplets.push([sorted[i], sorted[left], sorted[right]])
        while (left < right && sorted[left] === sorted[left + 1]) left++
        while (left < right && sorted[right] === sorted[right - 1]) right--
        left += 1
        right -= 1
      } else if (currentSum < targetSum) {
        left += 1
      } else {
        right -= 1
      }
    }
  }
  return triplets
}

console.log("Ejecutando threeNumSum tests...\n");

// Probar caso básico (LeetCode estilo)
test("threeNumSum: caso LeetCode clásico", () => {
  const array = [-1, 0, 1, 2, -1, -4] as number[]
  const targetSum = 0
  const result = threeNumSum(array, targetSum)
  // Tripletes únicos esperados: [[-1, -1, 2], [-1, 0, 1]]
  const tripletesOrdenados = result.map(t => t.slice().sort((a, b) => a - b))
  tripletesOrdenados.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
  const esperado = [[-1, -1, 2], [-1, 0, 1]]
  if (JSON.stringify(tripletesOrdenados) !== JSON.stringify(esperado)) {
    throw new Error(`Esperado ${JSON.stringify(esperado)}, got ${JSON.stringify(tripletesOrdenados)}`)
  }
})

test("threeNumSum: todos ceros", () => {
  const array = [0, 0, 0, 0] as number[]
  const targetSum = 0
  const result = threeNumSum(array, targetSum)
  if (result.length !== 1) throw new Error(`Esperaba 1 triplete, got ${result.length}`)
  if (result[0][0] !== 0 || result[0][1] !== 0 || result[0][2] !== 0) {
    throw new Error("Esperaba [0,0,0]")
  }
})

test("threeNumSum: sin solución", () => {
  const array = [1, 2, 3, 4] as number[]
  const targetSum = 100
  const result = threeNumSum(array, targetSum)
  if (result.length !== 0) throw new Error(`Esperaba [], got ${JSON.stringify(result)}`)
})

test("threeNumSum: array vacío", () => {
  const array = [] as number[]
  const targetSum = 0
  const result = threeNumSum(array, targetSum)
  if (result.length !== 0) throw new Error(`Esperaba [], got ${JSON.stringify(result)}`)
})

test("threeNumSum: mezcla negativa y positiva", () => {
  const array = [-5, -2, -1, 0, 1, 2, 5] as number[]
  const targetSum = 0
  const result = threeNumSum(array, targetSum)
  for (const t of result) {
    if (t[0] + t[1] + t[2] !== 0) {
      throw new Error(`Triplete [${t}] no suma a 0`)
    }
  }
  // Verificar unicidad
  const ordenados = result.map(t => t.slice().sort((a, b) => a - b))
  const unico = new Set(ordenados.map(t => JSON.stringify(t)))
  if (unico.size !== result.length) throw new Error("Tripletes duplicados encontrados")
})

test("threeNumSum: array pequeño (< 3 elementos)", () => {
  const array = [1, 2] as number[]
  const targetSum = 3
  const result = threeNumSum(array, targetSum)
  if (result.length !== 0) throw new Error(`Esperaba [], got ${JSON.stringify(result)}`)
})

test("threeNumSum: triplete al inicio", () => {
  const array = [1, 2, 3, 4, 5] as number[]
  const targetSum = 6
  const result = threeNumSum(array, targetSum)
  const tiene123 = result.some(t => t[0] === 1 && t[1] === 2 && t[2] === 3)
  if (!tiene123) throw new Error(`Esperaba [1,2,3] en result, got ${JSON.stringify(result)}`)
})

test("threeNumSum: todos positivos", () => {
  const array = [1, 2, 3, 4, 5, 6, 7] as number[]
  const targetSum = 12
  const result = threeNumSum(array, targetSum)
  for (const t of result) {
    if (t[0] + t[1] + t[2] !== 12) {
      throw new Error(`Triplete [${t}] no suma a 12`)
    }
  }
  // Verificar unicidad
  const ordenados = result.map(t => t.slice().sort((a, b) => a - b))
  const unico = new Set(ordenados.map(t => JSON.stringify(t)))
  if (unico.size !== result.length) throw new Error("Tripletes duplicados encontrados")
})

test("threeNumSum: todos negativos", () => {
  const array = [-5, -4, -3, -2, -1] as number[]
  const targetSum = -9
  const result = threeNumSum(array, targetSum)
  for (const t of result) {
    if (t[0] + t[1] + t[2] !== -9) {
      throw new Error(`Triplete [${t}] no suma a -9`)
    }
  }
  // Verificar unicidad
  const ordenados = result.map(t => t.slice().sort((a, b) => a - b))
  const unico = new Set(ordenados.map(t => JSON.stringify(t)))
  if (unico.size !== result.length) throw new Error("Tripletes duplicados encontrados")
})

test("threeNumSum: con huecos en valores", () => {
  const array = [-10, -3, 1, 4, 7, 15] as number[]
  const targetSum = 0
  const result = threeNumSum(array, targetSum)
  for (const t of result) {
    if (t[0] + t[1] + t[2] !== 0) {
      throw new Error(`Triplete [${t}] no suma a 0`)
    }
  }
  // Verificar unicidad
  const ordenados = result.map(t => t.slice().sort((a, b) => a - b))
  const unico = new Set(ordenados.map(t => JSON.stringify(t)))
  if (unico.size !== result.length) throw new Error("Tripletes duplicados encontrados")
})