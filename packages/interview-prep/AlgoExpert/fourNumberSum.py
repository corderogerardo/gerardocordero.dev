# O(n^2) time / O(n^2) space
def fourNumSum(array, targetSum):
  allPairsSums = {}
  quadruplets = []
  for i in range(1, len(array) - 1):
    for j in range(i+1, len(array)):
      currentSum = array[i] + array[j]
      difference = targetSum - currentSum
      if difference in allPairsSums:
        for pair in allPairsSums[difference]:
          quadruplets.append(pair + [array[i], array[j]])
    for k in range(0, i):
      currentSum = array[i] + array[k]
      if currentSum not in allPairsSums:
        allPairsSums[currentSum] = [[array[k], array[i]]]
      else:
        allPairsSums[currentSum].append([array[k], array[i]])
  return quadruplets


# Este es el patrón **"4Sum" con hashmap** — un poco más avanzado que el two pointers. Pero antes de comentarlo, **hay un bug en tu código** que quiero señalarte porque si lo memorizas así, te va a fallar en la entrevista:

# **Bugs encontrados:**
# 1. `for pais in allPairsSums[difference]:` → typo, debería ser `pair` (no afecta la ejecución, es solo el nombre de la variable, pero puede confundir).
# 2. `allPairsSums[currentSum] = [array[k], array[i]]` → esto guarda un solo par plano `[k, i]`, pero después haces `.append([array[k], array[i]])` en el `else`, lo cual mezcla pares planos con pares anidados. Debería ser `[[array[k], array[i]]]` (una **lista de pares**) para que sea consistente.

# Aquí está la versión corregida y comentada:

# O(n^2) time / O(n^2) space
def fourNumSum2(array, targetSum):
  # PATRÓN: "4Sum" con hashmap -> reduce el problema a "encontrar 2 pares
  # cuyas sumas se complementen para dar targetSum"
  # Idea clave: guardamos TODAS las sumas de pares que ya vimos,
  # así, cuando encontramos un nuevo par, solo preguntamos:
  # "¿ya vi un par que sume lo que me falta (difference)?"
  allPairsSums = {}  # mapea: suma_de_par -> lista de pares [a, b] que dan esa suma
  quadruplets = []

  # Recorremos i desde 1 (dejamos al menos un elemento antes, en índice 0,
  # para poder formar pares "anteriores" con k)
  for i in range(1, len(array) - 1):

    # --- Fase 1: buscar complementos ---
    # Para cada j después de i, calculamos la suma actual (array[i] + array[j])
    # y vemos si YA existe en el hashmap un par anterior que sume lo que falta
    for j in range(i + 1, len(array)):
      currentSum = array[i] + array[j]
      difference = targetSum - currentSum  # lo que necesitaríamos que sumen los otros 2 números

      if difference in allPairsSums:
        # Si existe, cada par guardado con esa suma + [array[i], array[j]]
        # forma un cuádruple válido
        for pair in allPairsSums[difference]:
          quadruplets.append(pair + [array[i], array[j]])

    # --- Fase 2: guardar nuevos pares en el hashmap ---
    # IMPORTANTE: esto va DESPUÉS del loop de j, para no usar el mismo
    # elemento array[i] dos veces en el mismo cuádruple (evita duplicados/auto-match)
    for k in range(0, i):
      currentSum = array[i] + array[k]
      if currentSum not in allPairsSums:
        allPairsSums[currentSum] = [[array[k], array[i]]]  # lista de pares (nota los [[ ]])
      else:
        allPairsSums[currentSum].append([array[k], array[i]])

  return quadruplets

# Para memorizar el patrón (la parte más importante):

# 1. ¿Cuándo reconocerlo? — Cuando el two pointers de 3Sum no alcanza (necesitas 4 números) y quieres evitar O(n³). El hashmap te baja la complejidad a O(n²).

# 2. La idea central en una frase: "Guarda sumas de pares ya vistos, y por cada nuevo par pregúntale al hashmap si existe el complemento."

# 3. ¿Por qué el orden de las fases importa?** — Primero *buscas* con `j` (elementos futuros), y *después* guardas con `k` (elementos pasados) usando el mismo `i`. Si lo hicieras al revés, un cuádruple podría usar `array[i]` dos veces.

# 4. Estructura mental del hashmap:
#    { suma: [[par1_a, par1_b], [par2_a, par2_b], ...] }

#    Siempre es una **lista de pares**, no un par suelto — porque puede haber varios pares distintos con la misma suma.

# 5. Complejidad: O(n²) tiempo (dos loops anidados) y O(n²) espacio (en el peor caso, guardas casi todas las combinaciones de pares en el hashmap).

# Comparación mental rápida 3Sum vs 4Sum:
# - 3Sum → ordenar + two pointers (O(n²) tiempo, O(1) espacio extra)
# - 4Sum → hashmap de sumas de pares (O(n²) tiempo, O(n²) espacio)
