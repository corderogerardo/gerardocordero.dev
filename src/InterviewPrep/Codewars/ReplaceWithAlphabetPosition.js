// is O(n) because of the for loop
function alphabetPosition(text) {
  // the key part of this exercise is to know well the alphabet
  const alphabet = "abcdefghijklmnopqrstuvwxyz"
  let alphaNums = []

  const textcp = text.toLowerCase()

  for(let i=0; i < text.length; i++){

    let idx = alphabet.indexOf(textcp[i]);

    if(idx === -1){
      continue
    }else{
      alphaNums.push(idx + 1)
    }
  }

  return alphaNums.join(" ");
}

export default alphabetPosition;


// solutions I like
// 1
// function alphabetPosition(text) {
//   const letters = 'abcdefghijklmnopqrstuvwxyz';

//   return text.toLowerCase()
//              .split('')
//              .filter(t => letters.indexOf(t) > -1)
//              .map(t => letters.indexOf(t)+1 || '')
//              .join(' ');
// }


// 2
// function alphabetPosition(text) {
//   return text
//     .toUpperCase()
//     .match(/[a-z]/gi)
//     .map( (c) => c.charCodeAt() - 64)
//     .join(' ');
//}

// 3
// function alphabetPosition(text) {
//   var alphabet = 'abcdefghijklmnopqrstuvwxyz';
//   return text.toLowerCase().split('')
//   .filter( letter => {
//     let index = alphabet.indexOf(letter);
//     return index > -1;
//   }  )
//   .map( letter => alphabet.indexOf(letter) + 1 )
//   .join(' ')
// }
