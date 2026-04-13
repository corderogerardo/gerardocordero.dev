function reductionCost(num) {
  // Write your code here
  //copy of original array sorted
  i
  const numCopy = [...num].sort((a, b)=>a-b)
  let minCost = []
  while(numCopy.length > 1){
      let numOne = numCopy.shift()
      let numTwo = numCopy.shift()
      let sum = numOne + numTwo;
      minCost.push(sum)
      numCopy.push(sum)
  }
  console.log('numCopy', numCopy)
  console.log('minCost', minCost)
  return minCost.reduce((a,b)=>a+b, 0)
}

const result = reductionCost([41234])
console.log(result)

[4, 1, 2, 3, 4]
[4, 3, 3, 4]
[4, 6, 4]
[6, 8]
[14]

3 + 6 + 8 + 14
