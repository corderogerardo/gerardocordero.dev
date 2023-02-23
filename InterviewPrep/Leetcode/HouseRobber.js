//Todo: LC 198

// Technique:

// What I understand:
// 1.  si nums.length ===  0 return 0
// 2.  si nums.length ===  1 return nums[0]
// 3.  si nums.length ===  2 return Math.max(nums[0], nums[1])
// 4.  si nums.length > 2
// 5  creamos un arreglo con la primera casa y el maximo entre la primera y la segunda casa
// 6  luego vamos a iterar sobre el arreglo de nums, partimos en la 2da casa y de ahi en adelante vamos a guardar en el arreglo el valor mayor entre la casa en la posicion i + la casa en la posicion i -2, y la casa anterior
// luego terminamos retornando el ultimo valor guardado en MaxLootAtNth house

//Completixy analysis:
// Time: O(N) our code loops over Input array once.
// Space: O(N) Can be optimized to O(1) with two number variables

const HouseRobber = (nums) => {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  if (nums.length === 2) return Math.max(nums[0], nums[1]);

  let maxLootANth = [nums[0], Math.max(nums[0], nums[1])];

  for (let i = 2; i < nums.length; i++) {
    Math.max(nums[i] + maxLootANth[i - 2], maxLootANth[i - 1]);
  }
  return maxLootANth.pop();
};
