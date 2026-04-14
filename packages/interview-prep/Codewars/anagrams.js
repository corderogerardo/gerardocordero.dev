function anagrams(word, words) {
  //step1 de la palabra que me dan debo separarla y
  //guardar sus letras asi como la cantidad de letras que se pueden repetir
  //step2 creo que la mejor forma es tener un objeto del tipo key => value
  // donde pueda tomar sus keys y saber cuanto es el valor que tiene
  // step 3 luego en el arreglo de palabras a buscar, por cada palabra debo
  // repetir el mismo paso arriba, luego debo comparar obj1 contra obj2
  // es decir iterar cada key y ver que vayan coincidiento
  // 4. sino coincide aunque sea una palabra continuo a la siguiente palabra y asi hasta
  // iterar por todo el arreglo, y hacer creado el arreglo de anagramas.
  const copyWord = word;
  const buildObject = (cp) => {
    let tempObj = {};
    cp.split('').forEach((val,ind)=>tempObj[val] = !tempObj[val] ? 1 : tempObj[val]+1)
    return tempObj;
  }
  const obj1 = buildObject(copyWord);

  let arrResult = [];

  words.forEach((wrd, ind) => {
    const tempObj = buildObject(wrd);
    let wordCheck = true;
    Object.entries(obj1).forEach((val, idx)=>{
      if(!wordCheck) return;
      if(tempObj[val[0]] !== val[1]){
        wordCheck = false;
      }
    })
    if(wordCheck){
      arrResult.push(wrd)
    }
  })
  return arrResult;
}

const result = anagrams('abba', ['aabb', 'abcd', 'bbaa', 'dada']);
console.log('result', result)


// other approaches
String.prototype.sort = function() {
  return this.split("").sort().join("");
};

function anagrams(word, words) {
  return words.filter(function(x) {
      return x.sort() === word.sort();
  });
}
// other 
function anagrams(word, words) {
  return words.filter(w => reorder(w) === reorder(word));
}
function reorder(word) {
  return word.split('').sort().join('');
}
