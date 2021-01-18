function reverse_and_combine_text(str){

  let arr = str.split(" ");
  let results = [];

  while (arr.length > 1) {

    for (let i = 0; i < arr.length; i+=2) {
      if (i === (arr.length - 1))  {
        results.push(arr[i].split("").reverse().join(""))
        break
      }

      const firstWord = arr[i].split("").reverse().join("")
      const secondWord = arr[i + 1].split("").reverse().join("")

      results.push(`${firstWord}${secondWord}`)
    }

    arr = results
    results = []
  }

  return arr[0];
}

function reverse_and_combine_text_recursive(str){
  if(str.indexOf(' ')<0)return str;
  var arr=str.split(' ').map(x=>x.split('').reverse().join(''));
  var tmp=[];

  while(arr.length > 1){tmp.push( arr.shift()+arr.shift() );}
  while(arr.length > 0){tmp.push( arr.shift() );}

  return (tmp.length > 1) ?
          reverse_and_combine_text(tmp.join(' ')) : tmp[0] ;
}

function reverse_and_combine_text_recursive_two(str){
  let strArr = str.split(" ")
  if(strArr.length === 1) return str;
  let res = []
  while(strArr.length) {
    let str1 = strArr.shift().split("").reverse()
    let str2 = strArr.length === 0 ? [] :strArr.shift().split("").reverse()
    console.log('str1 ' + str1)
    console.log('str2 ' + str2)
    res.push(str1.concat(str2).join(""))
    console.log('res ' + res)
  }
  return reverse_and_combine_text_recursive_two(res.join(" "))
}

const result = reverse_and_combine_text_recursive_two("234hh54 53455 sdfqwzrt rtteetrt hjhjh lllll12  44")
console.log('result ', result)

export default reverse_and_combine_text;
