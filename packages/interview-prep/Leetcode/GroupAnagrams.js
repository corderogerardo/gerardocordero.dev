/**
 * @param {string[]} strs
 * @return {string[][]}
 */

 // General analysis of group anagrams
 // Que son anagramas?, son palabras que tienen las mismas cantidad de letras solamente que en diferente orden, por ejemplo: "emit", "item", "mite", "time" estas palabras son anagramas de cada una.
 // 1. Vamos a iterar sobre el arreglo de palabras
 // 2. Por cada palabra vamos a separarlas y convertirlas en un arreglo
 // 3. Luego cada arreglo de palabras vamos a ordenarlo alfabeticamente, para esto usamos el metodo arr.sort() de JS que ya hace el ordenamiento alfabetico.
 // 4. El truco es que cada palabra que son un anagrama tienen la mismas letras en cantidad
 // 4. entonces con esto vamos a crear un hashMap key/value, donde el key es esta palabra ordenada y el value es un arreglo de todas las palabras que coinciden en letras es decir son anagramas.
 // 5. Finalmente cuando ya hemos terminado de iterar sobre todas las palabras, vamos a retornar un arreglo de los values del hashMap que es lo que pide el ejercicio de Leetcode
 // 1.

 //Completixy analysis:
 // Time: O(N K log K), where N is # of strings, and K is length of strings
 // Space: O(N K), Data stored in our grouped Hash Table

var groupAnagrams = function(strs) {
  let grouped = {};
  for(let i=0; i< strs.length; i++){
    const word = strs[i];
    const key = word.split('').sort().join('');
    if(!grouped[key]){
      grouped[key] = []
    }
    grouped[key].push(word);
  }
  return Object.values(grouped);
};

let result = groupAnagrams(["eat","tea","tan","ate","nat","bat"]);
console.log('result ', result);
