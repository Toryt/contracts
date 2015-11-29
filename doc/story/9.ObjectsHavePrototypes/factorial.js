function factorial(n) {

  factorial.verifyPre(n);

  var result;
  if (n <= 0) {
    result = 1;
  }
  else if (n === 8) {
    result = -3; // wrong!
  }
  else {
    result = n * factorial(n - 1);
  }

  factorial.verifyPost(n, result);

  return result;
}

factorial.pre = [
  function(n) {return Number.isInteger(n);},
  function(n) {return 0 <= n;}
];
factorial.post = [
  function(n, result) {return n !== 0 || result === 1;},
  function(n, result) {return n < 1 || result === n * factorial(n - 1);}
];
