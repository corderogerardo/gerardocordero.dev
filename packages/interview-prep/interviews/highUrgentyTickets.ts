function moveFirstMaxToFront(tickets) {
  const maxVal = Math.max(...tickets);
  const idx = tickets.indexOf(maxVal);
  const rest = [...tickets.slice(0, idx), ...tickets.slice(idx + 1)];
  return [maxVal, ...rest];
}

const tickets = [5, 2, 9, 1, 9, 6];
console.log(moveFirstMaxToFront(tickets).join('')); // "952196"