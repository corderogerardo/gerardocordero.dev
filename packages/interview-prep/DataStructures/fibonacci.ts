const fibonnaci = (iter) => {
  if(iter === 0) return []
  if(iter === 1) return [0]
  const memo = [0, 1]
  for (i=2; i<iter; i++){
    memo.push(memo[i-2] + memo[i-1])
  }

  return memo
}

console.log('result ', fibonnaci(10))