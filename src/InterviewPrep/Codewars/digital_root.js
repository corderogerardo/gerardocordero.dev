function digital_root(n) {
  // ...
  // step1 pass number to string
  // step2 split string into array
  // step3 reduce it
  // step 4  convert number to string, split and check if length is 1
  // step 5 if length > 1 call function again
  // if length === 1 return value / thats the case for the recursive function

  let copyNumber = n;
  let arrNumbers = copyNumber.toString().split('')

  if(arrNumbers.length === 1){
    return n;
  }else{
    let sum = arrNumbers.reduce((a,b)=>parseInt(a)+parseInt(b),0)
    return digital_root(sum)
  }
}

function digital_root(n) {
  if (n < 10) return n;

  return digital_root(
    n.toString().split('').reduce(function(acc, d) { return acc + +d; }, 0));
}
