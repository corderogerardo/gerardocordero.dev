function StripComments(input, markers) {
  let arr = input.split('\n');

  for(let i=0;i<markers.length;i++){
    arr = arr.map(function(el){
      let index = el.indexOf(markers[i])
      if(index!==-1){
        return el.substring(0, index)
      }else{
        return el.replace(/\s*$/,'')
      }
    });
  }
  return arr.join('\n').trim()
};

function checkComments(input, markers, expected) {
  var actual;
  actual = StripComments(input, markers);
  console.log('valid: ', actual === expected);
  console.log("Returned '" + actual);
  console.log("' but expected '" + expected + "'");

};

checkComments("apples, plums % and bananas\npears\noranges !applesauce", ["%", "!"], "apples, plums\npears\noranges")
//checkComments("Q @b\nu\ne -e f g", ["@", "-"], "Q\nu\ne")



// another code wars solution I like
function solution(input, markers) {
  return input.split('\n').map(
    line => markers.reduce(
      (line, marker) => line.split(marker)[0].trim(), line
    )
  ).join('\n')
}

function solutiontTwo(input, markers)
{
  var lines = input.split("\n");
  for (var i = 0; i < lines.length; ++i)
    for (var j = 0; j < markers.length; ++j)
      lines[i] = lines[i].split(markers[j])[0].trim();
  return lines.join("\n");
}
