function isHammingNumber(num) {
  while (num % 5 === 0) num /= 5;
  while (num % 3 === 0) num /= 3;
  while (num % 2 === 0) num /= 2;
  return num == 1;
}

function hamming(n) {
  // TODO: Program
  let succession = [1];
  let length = succession.length;
  let candidate = n;
  while (length < n) {
    if (isHammingNumber(candidate)) {
      succession[length] = candidate;
      length++;
    }
    candidate++;
  }
  return length;
}

function isHammingNumber(num) {
  if (num == 1) return num == 1;
  while (num % num === 0) num /= num;
  while (num % 3 === 0) num /= 3;
  while (num % 2 === 0) num /= 2;
}

function hamming(n) {
  // TODO: Program
  let succession = [1];
  let length = succession.length;
  let candidate = n;
  if (!!succession[candidate - 1]) return succession[candidate - 1];
  while (length < n) {
    if (isHammingNumber(candidate)) {
      succession[length] = candidate;
      length++;
    }
    candidate++;
  }
  return length;
}
