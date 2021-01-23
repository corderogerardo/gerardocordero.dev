/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
// iterate over all array, sum valueA+valueB, if match target, save indices and return, break
var twoSum = function(nums, target) {
  let valuesRes = [];
  let numsCopy = [...nums];
  if(nums.length === 2){
      return [0, 1]
  }
  for(let i = 0; i < nums.length; i++){
      for(let j = 0; j < numsCopy.length; j++){
          if(i === j){
              continue;
          }
          let sum = nums[i] + numsCopy[j];
          if(sum === target){
              valuesRes.push(i);
              valuesRes.push(j);
          }
      }
  }

  return valuesRes.slice(0, 2);
};

let result = twoSum([3,2,4],6);
console.log('result ', result);
