factorial.pre = [
  function(n) {return Number.isInteger(n);},
  function(n) {return 0 <= n;}
];
factorial.post = [
  function(n, result) {return n !== 0 || result === 1;},
  function(n, result) {return n < 1 || result === n * factorial(n - 1);}
];
