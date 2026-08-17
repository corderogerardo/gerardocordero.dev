# 0(nlog(n)) time / O(n) space
def sortedSquareArrayBruteForce(array):
  sortedSquares = [0 for _ in array]

  for idx in range(len(array)):
    value = array[idx]
    sortedSquares[idx] = value * value
  
  sortedSquares.sort()
  return sortedSquares


# O(n) time / O(n) space
def sortedSquareArray(array):
  sortedSquares = [0 for _ in array]
  smallerValueIdx = 0
  largerValueIdx = len(array) - 1

  for idx in reversed(range(len(array))):
    smallerValue = array[smallerValueIdx]
    largerValue = array[largerValueIdx]
    if abs(smallerValue) > abs(largerValue):
      sortedSquares[idx] = smallerValue * smallerValue
      smallerValueIdx += 1
    else:
      sortedSquares[idx] = largerValue * largerValue
      largerValueIdx -= 1

  return sortedSquares


# ─────────────────────────────────────────────
# SORTED SQUARED ARRAY — Python (con comentarios)
# ─────────────────────────────────────────────
#
# El problema: dado un array de enteros ordenado (puede tener negativos),
# retornar un array con el cuadrado de cada valor, también ordenado de menor a mayor.
#
# Ejemplo:        [-7, -3, 1, 2, 4]
# Cuadrados:      [49,  9, 1, 4, 16]
# Resultado final: [1,  4, 9, 16, 49]
#
# El truco: los negativos al cuadrado pueden ser grandes,
# por eso no basta con elevar al cuadrado directamente y ya.


# ─── VERSIÓN BRUTE FORCE ─────────────────────
# O(n log n) time — por el .sort() al final
# O(n) space     — el array de resultado tiene el mismo tamaño que el input

def sortedSquareArrayBruteForceComments(array):
  # Creamos un array del mismo tamaño que el input, inicializado en ceros.
  # [0 for _ in array] es list comprehension: genera un 0 por cada elemento.
  sortedSquares = [0 for _ in array]

  # Iteramos sobre cada índice del array original
  for idx in range(len(array)):
    value = array[idx]              # Tomamos el valor en la posición actual
    sortedSquares[idx] = value * value  # Lo elevamos al cuadrado y lo guardamos en la misma posición

  # Hasta aquí, sortedSquares tiene los cuadrados pero NO ordenados.
  # Llamamos a .sort() que usa Timsort internamente → O(n log n)
  sortedSquares.sort()

  return sortedSquares  # Retornamos el array de cuadrados ya ordenado


# ─── VERSIÓN ÓPTIMA (dos punteros) ───────────
# O(n) time  — una sola pasada sobre el array
# O(n) space — el array de resultado tiene el mismo tamaño que el input
#
# Idea clave: el array ya está ordenado, entonces los valores con mayor
# cuadrado posible siempre están en los extremos (el más negativo o el más positivo).
# Usamos dos punteros (uno en cada extremo) y llenamos el resultado de ATRÁS hacia ADELANTE.

def sortedSquareArrayComments(array):
  # Array de resultado, mismo tamaño, inicializado en ceros
  sortedSquares = [0 for _ in array]

  smallerValueIdx = 0                  # Puntero izquierdo → apunta al valor más negativo (o más pequeño)
  largerValueIdx = len(array) - 1      # Puntero derecho  → apunta al valor más grande

  # Llenamos el array de resultado de atrás hacia adelante (de mayor cuadrado a menor).
  # reversed(range(len(array))) genera índices: n-1, n-2, ..., 1, 0
  for idx in reversed(range(len(array))):
    smallerValue = array[smallerValueIdx]  # Valor en el extremo izquierdo
    largerValue = array[largerValueIdx]    # Valor en el extremo derecho

    # Comparamos los valores absolutos para saber cuál tiene el cuadrado más grande
    if abs(smallerValue) > abs(largerValue):
      # El extremo izquierdo tiene mayor cuadrado → lo colocamos en la posición actual (la más grande disponible)
      sortedSquares[idx] = smallerValue * smallerValue
      smallerValueIdx += 1   # Movemos el puntero izquierdo hacia adentro
    else:
      # El extremo derecho tiene mayor (o igual) cuadrado → lo colocamos en la posición actual
      sortedSquares[idx] = largerValue * largerValue
      largerValueIdx -= 1    # Movemos el puntero derecho hacia adentro

  return sortedSquares  # El array ya está lleno en orden ascendente


# ─── EJEMPLOS ────────────────────────────────

# Caso 1: array con negativos y positivos
array1 = [-7, -3, 1, 2, 4]
print("Input:           ", array1)
print("Brute Force:     ", sortedSquareArrayBruteForce(array1))  # [1, 4, 9, 16, 49]
print("Dos punteros:    ", sortedSquareArray(array1))             # [1, 4, 9, 16, 49]
print()

# Caso 2: todos negativos (el más grande al cuadrado es el más negativo)
array2 = [-5, -4, -3, -2, -1]
print("Input:           ", array2)
print("Brute Force:     ", sortedSquareArrayBruteForce(array2))  # [1, 4, 9, 16, 25]
print("Dos punteros:    ", sortedSquareArray(array2))             # [1, 4, 9, 16, 25]
print()

# Caso 3: todos positivos (caso simple, el orden original es suficiente)
array3 = [1, 2, 3, 4, 5]
print("Input:           ", array3)
print("Brute Force:     ", sortedSquareArrayBruteForce(array3))  # [1, 4, 9, 16, 25]
print("Dos punteros:    ", sortedSquareArray(array3))             # [1, 4, 9, 16, 25]
print()

# Caso 4: un solo elemento
array4 = [-3]
print("Input:           ", array4)
print("Brute Force:     ", sortedSquareArrayBruteForce(array4))  # [9]
print("Dos punteros:    ", sortedSquareArray(array4))             # [9]