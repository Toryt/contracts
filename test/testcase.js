fibonacci = new Contract(
  [
    function(n) {
      return Number.isInteger(n);
    },
    function(n) {
      return 0 <= n;
    }
  ],
  [
    function(n, result) {
      return n !== 0 || result === 0;
    },
    function(n, result) {
      return n !== 1 || result === 1;
    },
    function(n, result) {
      return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);
    }
  ]
).implementation(function(n) {
  if (n === 0) {
    return 0;
  }
  else if (n === 1) {
    return 1;
  }
  else if (n === 8) {
    return -3; // wrong!
  }
  else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
});


factorialContract = new Contract(
  [
    function(n) {
      return Number.isInteger(n);
    },
    function(n) {
      return 0 <= n;
    }
  ],
  [
    function(n, result) {
      return n !== 0 || result === 1;
    },
    function(n, result) {
      return n < 1 || result === n * factorial(n - 1);
    }
  ]
);

factorial = factorialContract.implementation(function(n) {
  if (n <= 0) {
    return 1;
  }
  else if (n === 8) {
    return -3; // wrong!
  }
  else {
    return n * factorial(n - 1);
  }
});

factorialIterative = factorialContract.implementation(function(n) {
  if (n === 8) {
    return -3; // wrong!
  }
  var result = 1;
  var next = 1;
  while (next <= n) {
    result *= next;
    next++;
  }
  return result;
});
