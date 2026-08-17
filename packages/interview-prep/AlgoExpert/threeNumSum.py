# PATRÓN: "3Sum" -> ordenar + two pointers
# Recordatorio: sort() en Python ordena la lista in-place y es ascendente,
# por eso el algoritmo cuenta con esa propiedad para mover los punteros
# SIEMPRE use array.sort() (sin parámetros adicionales para números),
# el ordenamiento es ascendente y compara como texto por defecto
def threeNumSum(array, targetSum):
  array.sort()
  triplets = []

  # i llega hasta length - 2 porque necesitamos 2 elementos más
  # adelante (left y right) para armar el triplete
  for i in range(len(array) - 2):
    # SKIP DUPLICATE FIXED ELEMENTS: evita procesar el mismo valor en la posición i
    if i > 0 and array[i] == array[i - 1]:
      continue
    left = i + 1
    right = len(array) - 1

    while left < right:
      currentSum = array[i] + array[left] + array[right]

      if currentSum == targetSum:
        # Triplete encontrado -> guardamos y movemos ambos punteros
        triplets.append([array[i], array[left], array[right]])
        # SKIP DUPLICATE LEFT ELEMENTS: avanza sobre valores repetidos
        while left < right and array[left] == array[left + 1]:
          left += 1
        # SKIP DUPLICATE RIGHT ELEMENTS: retrete sobre valores repetidos
        while left < right and array[right] == array[right - 1]:
          right -= 1
        left += 1
        right -= 1
      elif currentSum < targetSum:
        # Muy chico -> agrandar moviendo left (lista ordenada)
        left += 1
      else:
        # Muy grande -> achicar moviendo right
        right -= 1

  return triplets