function solution(t, input_arr) {
  // your code goes here
  const cantidadEnCache = t;
  const registrosPermitidosEnDB = 12;
  const registros =
    typeof input_arr === "string" ? input_arr.split(" ") : input_arr;
  let tiempo = t;
  let maxTiempo = 0;

  const newRegistro = [...registros.splice(0, cantidadEnCache)];
  const cache = [...newRegistro];

  registros.forEach((value) => {
    let isInCache = cache.includes(value);
    if (isInCache) {
      tiempo++;
    } else {
      maxTiempo = tiempo > maxTiempo ? tiempo : maxTiempo;
      cache.shift();
      cache.push(value);
      tiempo = 0;
    }
  });

  return maxTiempo;
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
  const t = parseInt(gets());

  const n = parseInt(gets());

  // const input_arr = gets()
  //   .split(" ")
  // .map((arTemp) => parseInt(arTemp));

  let result = solution(t, "1 2 3 2 4 2 2 4 3 2 1 3 4 3");

  console.log(result);
}

main();
