# Tecnicas para resolver problemas de LeetCode y Codewars, algoritmos, opiniones, con que se come cada solucion xD?

## Tecnica Expand around the center / Expandir alrededor del centro, que es? con que se come?

### Que pude entender de esta tecnica, la idea es fijar un centro y chequear a su izquierda y a su derecha, esta tecnica es funciona para todos los casos, par e impar, seguro lo que estes iterando, un arreglo, un string, 'having our center both be the character we are iterating on AND the space in between each character.'

```language
The method used to solve this problem was ' EXPAND AROUND THE CENTER ' and consists, the idea I could get is that you fix a position a iterate to the left and to the right, having our center both be the char we are iterating on AND the space between each character.

La idea es tener 2 centros, 1. El char que iteramos, y 2. El espacio entre char. Estos 2 centros los hacemos por que si solo manejamos un centro no va a funcionar para los casos par [even]
```

## Que es BFS?

### Lo que pude entender de esta tecnica es que al buscar en un arreglo multidimensional, puedes buscar, arriba, abajo, a la izquierda y a la derecha, de esta mantera puedes ubicar los valores o bits activos dentro del arreglo multidimensional.

#### Donde aplicar esta tecnica, number of isolated islams in LeetCode, te da un arreglo multidimensional, donde debes buscar que islas estan formadas siendo las islas 1 y el mar 0, lo puedes imaginar como una matriz de x, y valores asi:

[[1,1,1,0,0,0],
[1,1,0,0,0,0],
[1,0,1,0,0,1],
[0,1,1,0,0,1]]

## Que es DFS?


## Window mirroring technique

### En esta tecnica defines 2 punteros LEFT y RIGHT, y comienzas a iterar de izquierda a derecha y de derecha a izquierda hasta llegar al medio y terminar, sirve para buscar palindromes, para poder encontrar si el caracter del inicio es igual al caracter del final, comparas como si el arreglo fuera un espejo.
