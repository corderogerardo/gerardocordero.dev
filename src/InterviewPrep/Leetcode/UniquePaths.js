// Metodo o Tecnica

// Metodo: Dynamic Programming with a dpMatrix

// ToDo: Volver a estudiar.

// Que entendi de este problema, cual es el objetivo y por que resolverlo con Dynamic programming es el mejor approach para resolverlo.
// 1. La idea es encontrar diferentes caminos en una matriz, podria ser util resolver algun problema que simule como puede moverse el caballo en un juego de ajedrez

//Completixy analysis:
// Time: O(N * M) where N and M are dimensions of Matrix
// Space: O(N * M) DP Matrix size depends on Input Matrix

let uniquePaths = (n, m) => {
  const dpMatrix = [];

  for (let row = 1; row <= n; row++) {
    dpMatrix.push([]);
  }

  // Fill out first row of dp matrix
  for (let row = 0; row < n; row++) {
    dpMatrix[row][0] = 1;
  }

  //fill out first col of dp matrix
  for (let col = 0; col < m; col++) {
    dpMatrix[0][col] = 1;
  }

  for (let row = 1; row < n; row++) {
    for (let col = 1; col < m; col++) {
      dpMatrix[row][col] = dpMatrix[row][col - 1] + dpMatrix[row - 1][col];
    }
  }
  return dpMatrix[dpMatrix.length - 1][m - 1];
};

let result = uniquePaths(6, 3);
console.log("result ", result);
