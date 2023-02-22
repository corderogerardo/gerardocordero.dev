function apartmentHunting(blocks: Record<string, boolean>[], reqs: string[]): number {
  const maxDistanceAtBlocks: number[] = new Array(blocks.length).fill(Number.NEGATIVE_INFINITY);

  for (let i = 0; i < blocks.length; i++) {
    for (const req of reqs) {
      let closestReqDistance = Number.POSITIVE_INFINITY;
      for (let j = 0; j < blocks.length; j++) {
        if (blocks[j][req]) {
          closestReqDistance = Math.min(closestReqDistance, distanceBetween(i, j));
        }
      }
      maxDistanceAtBlocks[i] = Math.max(maxDistanceAtBlocks[i], closestReqDistance);
    }
  }

  return getIdxAtMinValue(maxDistanceAtBlocks);
}

function distanceBetween(a: number, b: number): number {
  return Math.abs(a - b);
}

function getIdxAtMinValue(array: number[]): number {
  let idxAtMinValue = 0;
  let minValue = Number.POSITIVE_INFINITY;

  for (let i = 0; i < array.length; i++) {
    const currentValue = array[i];
    if (currentValue < minValue) {
      minValue = currentValue;
      idxAtMinValue = i;
    }
  }

  return idxAtMinValue;
}
