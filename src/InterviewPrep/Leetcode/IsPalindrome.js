/**
 * @param {string} s
 * @return {boolean}
 */
// algorithm analysis
 // 1. Primero debemos sanitizar el input string removiendo chars no alfanumericos y pasarlo a minuscula
 // 2. Crear un pointer LEFT y otro RIGHT, LEFT comienza al inicio, RIGHT comienza al final
 // 3. Itera mientras LEFT sea menor que RIGHT
 // 4. SI chars en LEFT y RIGHT pointers no son iguales, retorna FALSE
 // 5. De otra forma retorna TRUE.
 // 1.
 // 1.
 // window mirrowing technique

 //Completixy analysis:
 // Time: O(N)
 // Space: O(1) LEFT and RIGHT pointers take up constant space.
 var IsPalindrome = function(s) {
  s = s.toLowerCase().replace(/[\W_]/g, "");
  let left = 0;
  let right = s.length -1;
  while(left < right){
    if(s[left] !== s[right]){
      return false
    }
    left++;
    right--;
  }

  return true;
};
