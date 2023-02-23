function solution(n) {
  const nBinary = n.toString(2).split("1");
  const gaps = [];
  let longestGap = 0;
  let startGap = "";
  let endGap = "";

  for (let i = 0; i < nBinary.length; i++) {
    if (!nBinary[i] && !startGap) {
      startGap = i;
    }
    if (!nBinary[i] && !!startGap && !endGap) {
      endGap = i;
    }
    if (!nBinary[i] && !!nBinary[i + 1] && nBinary[i + 1].length >= 1) {
      gaps.push(nBinary[i + 1].length);
    }
  }

  if (!!startGap && !!endGap) {
    gaps.forEach((value) => {
      longestGap = value >= longestGap ? value : longestGap;
    });
  } else {
    return 0;
  }

  return longestGap;
}

const result = solution(6);
console.log("result: ", result);

function solutionTwo(N) {
  let foundOne = false;

  let divRes = N;
  let maxGap = 0;
  let zeroCount = 0;

  while (divRes != 0) {
    if (divRes % 2) {
      foundOne = true;
      zeroCount = 0;
    } else if (foundOne) {
      zeroCount++;
      if (zeroCount > maxGap) {
        maxGap = zeroCount;
      }
    }
    divRes = Math.floor(divRes / 2);
  }
}
function getGaps(binArr, gaps) {
  let firstIndex = binArr.indexOf("1");
  if (firstIndex > -1) {
    let secondHalf = binArr.slice(firstIndex + 1);
    let secondIndex = secondHalf.indexOf("1");
    if (secondIndex > -1 && secondIndex !== 0) {
      gaps.push(secondIndex);

      if (secondHalf.slice(secondIndex).length > 0) {
        return getGaps(secondHalf.slice(secondIndex), gaps);
      }
    } else {
      return gaps;
    }
  }
}

function solution(N) {
  const min = 1;
  const max = 2147483647;

  const bin = (parseInt(N) >>> 0).toString(2);

  const binArr = bin.split("");
  const gaps = getGaps(binArr, []);

  return !!gaps && gaps.length > 0 ? Math.max.apply(Math, gaps) : 0;
}
