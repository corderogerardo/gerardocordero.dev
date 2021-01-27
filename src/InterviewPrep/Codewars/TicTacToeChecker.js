function TicTackToeChecker(board) {
  // TODO: Check if the board is solved!
  // 1. Itera sobre el arreglo principal
  // 2. segun el indice del primer arreglo va a iterar en busca de casos
  // 3. ahora la primera fila es la que descubre mas casos
  // Caso hacia la derecha
  // Caso hacia abajo
  // caso diagonal
  // Caso del medio
  // caso del final
  // 4. la segunda fila solo me intersa el caso del medio hacia la derecha
  // 5. la tercera fila solo me interesa el caso del final hacia la derecha

  const xWon = '111';
  const oWon = '222'
  const aSpotEmpty = '0';

  let winner = {
    'x': 0,
    'o': 0,
    'empty': [],
    'draw': [],
  }

  const boardCopy = [...board];

  const checkWinner = (arr) => {
    const str = arr.join``;
    if(str === xWon){
      winner['x'] = 1;
    }

    if(str === oWon){
      winner['o'] = 2;
    }


    if(!str.includes(aSpotEmpty)){
      winner['draw'].push('0');
    }else{
      if(str.includes(aSpotEmpty)){
        winner['empty'].push('-1');
      }
    }


  }

  const buildDown = (position, mainArr) => {
    let finalLine = [];
    mainArr.forEach((val, index) => {
      finalLine.push(mainArr[index][position]);
    });
    return finalLine;
  }

  const buildDiagonalToRigth = (arr) => {
    let final = [];
    arr.forEach((val, index) => {
      final.push(arr[index][index])
    })
    return final;
  }

  const buildDiagonalToLeft = (arr) => {
    let final = [];
    arr.forEach((val, index) => {
      let copy = [...val].reverse();
      final.push(copy[index])
    })
    return final;
  }

  const diagonalRight = buildDiagonalToRigth(boardCopy);
  checkWinner(diagonalRight);

  const diagonalLeft = buildDiagonalToLeft(boardCopy);
  checkWinner(diagonalLeft);

  for(let i = 0; i < boardCopy.length; i++){
    const down = buildDown(i, boardCopy);
    const left = boardCopy[i];
    checkWinner(down);
    checkWinner(left);
  }

  if(winner['x'] === 1){
    return 1;
  }
  if(winner['o'] === 2){
    return 2;
  }

  if(winner['draw'].length === 8){
    return 0;
  }

  if(winner['empty'].length > 0){
    return -1;
  }
}

const result = TicTackToeChecker(
  [[2,1,2],[2,1,1],[1,2,1]]
);

console.log('result ', result);


// Solution I like from code wars

const horizontal = (player) => (board) =>
  board.some(row => row.every(spot => spot == player))

const vertical = (player) => (board) =>
  board.some((row, i) => board.every(row => row[i] == player))

const diagonals = (player) => (board) =>
  board.every((row, i) => row[i] == player) || board.every((row, i) => row[3-1-i] == player)

const player = (number) => ({
  wins: (board) => [horizontal, vertical, diagonals].some(full => full(number)(board))
})

const unfinished = (board) =>
  board.some(row => row.some(spot => !spot))

const DRAW = 0


const isSolved = (board) => {switch (true) {
  case player(1).wins (board):
    return 1

  case player(2).wins (board):
    return 2

  case unfinished (board):
    return -1

  default:
    return DRAW
}}

