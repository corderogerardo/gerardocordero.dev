# O (nlogn) time / O(1) space
def nonConstructibleChange(coins):
  coins.sort()

  currentChangeCreated = 0
  for coin in coins:
    if coin > currentChangeCreated + 1:
      return currentChangeCreated + 1
    
    currentChangeCreated += coin
  
  return currentChangeCreated + 1


# O(n log n) tiempo / O(1) espacio
def nonConstructibleChangeCommented(coins):
    # Ordenamos las monedas de menor a mayor.
    # Esto nos permite ir sumando el cambio "alcanzable" de forma incremental.
    coins.sort()

    # currentChangeCreated representa el monto máximo de cambio
    # que podemos construir usando todas las monedas revisadas hasta ahora.
    # Con 0 monedas, podemos construir el monto 0.
    currentChangeCreated = 0

    for coin in coins:
        # Si la moneda actual es mayor que (currentChangeCreated + 1),
        # significa que hay un "hueco": no podemos construir el monto
        # currentChangeCreated + 1, porque esta moneda (y todas las
        # siguientes, ya que están ordenadas) son demasiado grandes
        # para llenar ese hueco.
        if coin > currentChangeCreated + 1:
            return currentChangeCreated + 1

        # Si la moneda es <= currentChangeCreated + 1, entonces podemos
        # seguir extendiendo el rango de cambio construible.
        # Al sumar esta moneda, ahora podemos construir cualquier monto
        # desde 0 hasta currentChangeCreated + coin (inclusive).
        currentChangeCreated += coin

    # Si terminamos de recorrer todas las monedas sin encontrar un hueco,
    # el menor monto que NO podemos construir es uno más que el máximo
    # que sí podemos construir con todas las monedas.
    return currentChangeCreated + 1