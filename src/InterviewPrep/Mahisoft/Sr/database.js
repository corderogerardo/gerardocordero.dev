function solution(n) {
  // your code goes here
  const arr = new Array(n);
  for (let i = 1; i < n; i++) {
    arr.push(i);
  }
  const multiplos = arr.filter((value) => value % 13);
  const newArr = arr.filter((value) => multiplos.includes(value));
  return newArr[newArr.length - 1];
}

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});
let inputString = [];
let i = 0;
rl.on("line", (input) => {
  inputString.push(input);
});
rl.on("close", () => {
  main();
});
function gets() {
  return inputString[i++];
}
function main() {
  //const n = parseInt(gets());

  let result = solution(27);

  console.log(result);
}

main();
