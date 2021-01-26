/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
  // 1. crear un hashMap vacio de tipo (key/val - > character/index)
  // 2. crear variables inicio y max, inicializadas en 0
  // 3. itera sobre el input string
  // 4. si el caracter actual en el hashMap y el index es >= inicio
  // 5. setea el inicio con el index por caracter encontrado en hashMap +1
  // 6. setea key/value en el hashMap para que sea el caracter actual/con index actual
  // 7. si el tamaño total(length) de la ventana actual es mas grande que el MAX
  // 8. setea el MAX al tamaño total(length) de la ventana actual
  // 9. retorna MAX

  let windowCharsMap = {};
  let windowStart = 0;
  let maxLength = 0;

  for(let i = 0; i < s.length; i++){
      const endChar = s[i];

      if(windowCharsMap[endChar] >= windowStart){
          windowStart = windowCharsMap[endChar] + 1;
      }

      windowCharsMap[endChar] = i;
      maxLength = Math.max(maxLength, i - windowStart+1);
  }

  return maxLength;

};


// Complexity analysis
// Time: O(n), each caracters of the string needs to be visited once
// Space: O(min(m, n)) the number of keys in Hash Map is bounded by the size of the string n and the size of the charset/alphabet m. M is always 26 all letter of the alphabet


// Análisis de complejidad
// Hora: O (n), cada carácter de la cadena debe visitarse una vez
// Espacio: O (min (m, n)) el número de claves en Hash Map está limitado por el tamaño de la cadena n y el tamaño del juego de caracteres / alfabeto m.
