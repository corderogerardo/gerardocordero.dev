var _primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

// ToDo: https://www.codewars.com/kata/526d84b98f428f14a60008da/train/javascript

function* build_hamming() {
  let queues = { 2: [], 3: [], 5: [] };
  let next_ham = 1;
  while (true) {
    yield next_ham;

    for (let base in queues) {
      console.log("base ", base);
      console.log("next_ham ", next_ham);
      if (!!queues[base]) {
        queues[base].push(next_ham * base);
      } else {
        queues[base] = [];
        queues[base].push(next_ham * base);
      }
    }

    console.log("queues ", queues);

    next_ham = Object.values(queues).reduce(function (min, value) {
      return Math.min(min, value);
    });

    for (let base in queues) {
      if (queues[base][0] == next_ham) queues[base].shift();
    }
  }
}
function hamming(n) {
  if (n > 0 && n <= 6) return n;
  let ham = build_hamming();
  let first20 = [];
  for (let i = 1; i <= n; i++) {
    first20.push(ham.next());
  }
  console.log("first20 ", first20);
  return first20[first20.length - 1];
}

const result = hamming(8);
console.log("Result ", result);
