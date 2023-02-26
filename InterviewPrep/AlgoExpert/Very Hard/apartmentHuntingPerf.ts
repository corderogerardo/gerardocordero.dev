// Apartment Hunting
// O(b*r) time | O(br) space

function apartmentHunting(blocks: boolean[][], reqs: string[]): number {
  const minDistancesFromBlocks = reqs.map((req) =>
    getMinDistances(blocks, req)
  );
  const maxDistancesAtBlocks = getMaxDistancesAtBlocks(
    blocks,
    minDistancesFromBlocks
  );
  return getIdxAtMinValue(maxDistancesAtBlocks);
}

function getMinDistances(blocks: boolean[][], req: string): number[] {
  const minDistances = Array(blocks.length).fill(0);
  let closestReqInx = Infinity;
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i][req]) {
      closestReqInx = i;
    }
    minDistances[i] = distanceBetween(i, closestReqInx);
  }
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i][req]) {
      closestReqInx = i;
    }
    minDistances[i] = Math.min(
      minDistances[i],
      distanceBetween(i, closestReqInx)
    );
  }
  return minDistances;
}

function getMaxDistancesAtBlocks(
  blocks: boolean[][],
  minDistancesFromBlocks: number[][]
): number[] {
  const maxDistancesAtBlocks = Array(blocks.length).fill(0);
  for (let i = 0; i < blocks.length; i++) {
    const minDistanceAtBlock = minDistancesFromBlocks.map(
      (distances) => distances[i]
    );
    maxDistancesAtBlocks[i] = Math.max(...minDistanceAtBlock);
  }
  return maxDistancesAtBlocks;
}

function getIdxAtMinValue(array: number[]): number {
  let idxAtMinValue = 0;
  let minValue = Infinity;
  for (let i = 0; i < array.length; i++) {
    const currentValue = array[i];
    if (currentValue < minValue) {
      minValue = currentValue;
      idxAtMinValue = i;
    }
  }
  return idxAtMinValue;
}

function distanceBetween(a: number, b: number): number {
  return Math.abs(a - b);
}

export default apartmentHunting;
