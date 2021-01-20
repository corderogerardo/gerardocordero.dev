
// - Sort in decending order ->
// take absolute difference and sort from largest impact to smallest impact

//Set a Capacity, the cap percityA and cityB -> cap = costs.length/2

// N = length of the array / 2

// have counters for each city to keep track of how many people we flawn to that city, as long as that city is under capacity

//Time: O(n log n)
//Space: O(1) constant space
const twoCitySchedCost = function(costs) {
  console.log('cost array', costs);

  // como es un arreglo de arreglos, esta forma ordena por arreglos, de mayor a menor
  costs.sort((a, b)=>{
    console.log('Math.abs(b[0] - b[1]) ', Math.abs(b[0] - b[1]))
    console.log('Math.abs(a[0] - a[1]) ', Math.abs(a[0] - a[1]))
    console.log('Math.abs(b[0] - b[1]) - Math.abs(a[0] - a[1]) ', Math.abs(b[0] - b[1]) - Math.abs(a[0] - a[1]))
    return Math.abs(b[0] - b[1]) - Math.abs(a[0] - a[1]);
  });
  console.log('cost array sorted', costs);

  let sum = 0;
  let cap = costs.length / 2;
  let A = 0;
  let B = 0;

  for(let i = 0; i<costs.length; i++){
    let costCityA = costs[i][0];
    let costCityB = costs[i][1];
    console.log('A ', A);
    console.log('B ', B);
    //if city A is cheaper
    if(costCityA <= costCityB){
      if(A < cap){
        sum += costCityA;
        A++;
      }else{
        sum += costCityB;
        B++;
      }
    }else{
      if(B < cap){
        sum += costCityB;
        B++;
      }else{
        sum += costCityA;
        A++;
      }
    }
  }
  return sum;
};

const result = twoCitySchedCost([[10,20],[30,200],[400,50],[30,20]]);
console.log('result ', result)
