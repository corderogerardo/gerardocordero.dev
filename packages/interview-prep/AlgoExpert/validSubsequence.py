# O(n) time / O(1) space
def validateSubsequenceWhileLoop(array, sequence):
  arrayIdx = 0
  sequenceIdx = 0
  while arrayIdx < len(array) and sequenceIdx < len(sequence):
    if array[arrayIdx] == sequence[sequenceIdx]:
      sequenceIdx += 1
    arrayIdx += 1
  return sequenceIdx == len(sequence)


# O(n) time / O(1) space
def validateSubsequenceForLoop(array, sequence):
  sequenceIdx = 0
  for value in array:
    if sequenceIdx == len(sequence):
      break
    if sequence[sequenceIdx] == value:
      sequenceIdx += 1
  return sequenceIdx == len(sequence)

# Complejidad temporal O(n) — recorre el array una sola vez
# Complejidad espacial O(1) — no usa estructuras adicionales, solo dos índices
def validateSubsequenceWhileLoopComments(array, sequence):

  arrayIdx = 0       # Puntero que avanza sobre cada elemento del array
  sequenceIdx = 0    # Puntero que avanza sobre la sequence SOLO cuando hay match

  # El loop corre mientras ninguno de los dos punteros se salga de su lista.
  # Si arrayIdx llega al final → revisamos todo el array sin éxito total.
  # Si sequenceIdx llega al final → encontramos todos los elementos, podemos parar.
  while arrayIdx < len(array) and sequenceIdx < len(sequence):

    # Si el elemento actual del array coincide con el elemento actual de la sequence...
    if array[arrayIdx] == sequence[sequenceIdx]:
      sequenceIdx += 1   # ...avanzamos el puntero de la sequence (encontramos un match)

    arrayIdx += 1  # Siempre avanzamos sobre el array, haya match o no

  # Al terminar el loop, si sequenceIdx llegó al final de sequence,
  # significa que encontramos TODOS los elementos en orden → True.
  # Si no llegó → algún elemento de sequence nunca apareció → False.
  return sequenceIdx == len(sequence)


# Complejidad temporal O(n) — misma lógica, el for itera sobre el array
# Complejidad espacial O(1) — solo usa un índice adicional
def validateSubsequenceForLoopComments(array, sequence):

  sequenceIdx = 0  # Solo necesitamos un puntero; el for maneja el recorrido del array

  for value in array:  # Itera sobre cada elemento del array uno por uno

    # Optimización temprana: si ya encontramos todos los elementos de sequence,
    # no tiene sentido seguir iterando el resto del array → salimos del loop
    if sequenceIdx == len(sequence):
      break

    # Si el elemento actual del array coincide con el elemento actual de sequence...
    if sequence[sequenceIdx] == value:
      sequenceIdx += 1  # ...avanzamos el puntero de sequence

  # Misma lógica de retorno: si el puntero llegó al final de sequence → True
  return sequenceIdx == len(sequence)


