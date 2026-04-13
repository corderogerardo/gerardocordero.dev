/**
 * @param {string} s
 * @return {boolean}
 */

 // La solucion requiere Stack-Pila
 // 1. Iteramos sobre el string de chars
 // 2. Si el char en donde estamos en el for esta del lado izquierdo (left), lo vamos a agregar arriba(Top) en la Stack/Pila, si seguimos iterando y los valores se encuentran del lado izquierdo `Opening tags example: ({[ ` los seguimos agregando al top de la stack
 // 3. Si al iterar nos encontramos con que el char es el closing tag `]})` que hace par con el top que tenemos de nuestra stack, sacamos el valor top/arriba de nuestra stack/pila.
 // 4. Finalmente si al terminar el loop for y nuestra stack/pila esta vacia retornamos true. Quiere decir que es un `valid input string`, un input de string valido de caracteres.
 // 5. Si por otro lado nuestra stack/pila no esta vacia, retornamos false

 //  Completixy analysis:
 // Time: O(n) We iterate thru input string just once.
 // Space: O(n) In worst case, stack is same length as input string

 var ValidParentheses = s => {
  // recuerda que s es un string con n.length chars
  // simulamos una stack con un arreglo
  let stack = [];
  // creamos el hashMap key/value para comparar
  let pairsHashMap = {
    "(":")",
    "{":"}",
    "[":"]"
  };

  for(let i=0; i < s.length; i++){
    let char = s[i];

    if(pairsHashMap[char]){
      stack.push(char)
    }else{
      if(pairsHashMap[stack.pop()] !== char){
        return false
      }
    }
  }

  return stack.length === 0;

};

const result = ValidParentheses('()');
console.log('Results: ', result);
