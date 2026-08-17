# PATRÓN: Two Sum -> hash table / fuerza bruta
# Recordatorio: JS/TS usa objeto {} o Set, Python usa diccionario {}
# KEY IDEA: Para cada num, verificar si targetSum - num ya fue visto

# FORZA BRUTA: Revisar todos los pares (i, j) donde i < j
# Complejidad: O(n²) tiempo / O(1) espacio
# CUANDO USAR: Arrays pequeños (n < 100) o cuando el espacio O(1) es crítico
def twoNumberSumBruteForce(array, targetSum):
  # Recorremos el array con i desde el inicio
  for i in range(len(array) - 1):
    # El primer número es array[i] (ERROR común: array[1] en vez de array[i])
    firstNum = array[i]
    # Bucle interno revisa todos los elementos después de i
    for j in range(i + 1, len(array)):
      secondNum = array[j]
      # Si la suma equals el target, retornamos el par
      if firstNum + secondNum == targetSum:
        return [firstNum, secondNum]
  # Si no hay par que sume el target, retornamos array vacío
  return []

# HASH TABLE: Almacenar números vistos en un diccionario para lookup O(1)
# Complejidad: O(n) tiempo / O(n) espacio
# CUANDO USAR: Caso típico - más rápido O(n) a cambio de O(n) espacio extra
def twoNumberSumHashTable(array, targetSum):
  nums = {}
  # Recorremos cada número del array
  for num in array:
    # El "match potencial" es targetSum - num
    potentialMatch = targetSum - num
    # Si el match potencial ya está en el diccionario, lo encontramos
    if potentialMatch in nums:
      return [potentialMatch, num]
    # Si no, almacenamos el número actual en el diccionario
    else:
      nums[num] = True
  # Si no hay par que sume el target, retornamos array vacío
  return []

# ORDENADO (Two Pointers): Ordenar primero, luego buscar desde ambos extremos
# Complejidad: O(nlogn) tiempo / O(1) espacio (excluding the sort)
# CUANDO USAR: Cuando el array puede ordenarse y queremos O(1) espacio extra
# RESTRICCIÓN: Modifica el array en-place
def twoNumberSumSorted(array, targetSum):
  # ORDENAR: En JS/TS es .sort() sin comparador para números,
  # EN Python es .sort() y también ordena in-place
  # PERO en ambos casos SIEMPRE es ordenamiento "texto" por defecto
  # para números necesitamos asegurarnos del orden numérico
  array.sort()
  left = 0
  right = len(array) - 1

  while left < right:
    currentSum = array[left] + array[right]

    if currentSum == targetSum:
      # Encontramos el par -> retornamos
      return [array[left], array[right]]
    elif currentSum < targetSum:
      # Suma muy chica -> mover left a la derecha (número más grande)
      left += 1
    elif currentSum > targetSum:
      # Suma muy grande -> mover right a la izquierda (número más chico)
      right -= 1
  # Si no hay par que sume el target, retornamos array vacío
  return []