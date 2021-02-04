const JumpGame = (nums) => {
  let dpPositions = new Array(nums.length).fill(false);
  dpPositions[0] = true;
  console.group("");
  console.log("start ", dpPositions);

  for (let j = 1; j < nums.length; j++) {
    console.log("For 1: j ", j);
    for (let i = 0; i < j; i++) {
      console.log("startFor2 ");
      console.log("For 2: i ", i);
      console.log("For 2: dpPositions[i] ", dpPositions[i]);
      console.log("For 2: i + nums[i] ", i + nums[i]);
      console.log("endFor2 ");
      if (dpPositions[i] && i + nums[i] >= j) {
        dpPositions[j] = true;
        break;
      }
    }
  }
  console.log("end ", dpPositions);
  console.log("end ", dpPositions[dpPositions.length - 1]);
  return dpPositions[dpPositions.length - 1];
};

let result = JumpGame([3, 2, 1, 0, 4]);
console.log("result ", result);
