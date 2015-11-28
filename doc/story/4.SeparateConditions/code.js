var fibonacci_preconditions = [
  function(n) {return Number.isInteger(n);},
  function(n) {return 0 <= n;}
];

var fibonacci_postconditions = [
  function(n, result) {return n !== 0 || result === 0;},
  function(n, result) {return n !== 1 || result === 1;},
  function(n, result) {return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);}
];

function check_fibonacci_preconditions(n) {
  fibonacci_preconditions.forEach(
    function(condition) {
      var conditionResult = condition.call(null, n);
      if (!conditionResult) {
        throw condition + " (n === " + n + ")";
      }
    }
  );
}

function check_fibonacci_postconditions(n, result) {
  fibonacci_postconditions.forEach(
    function(condition) {
      var conditionResult = condition.call(null, n, result);
      if (!conditionResult) {
        throw condition + " (n === " + n + ")";
      }
    }
  );
}

function fibonacci(n) {

  check_fibonacci_preconditions(n);

  var result;
  if (n === 0) {
    result = 0;
  }
  else if (n === 1) {
    result = 1;
  }
  else if (n === 8) {
    result = -3; // wrong!
  }
  else {
    result = fibonacci(n - 1) + fibonacci(n - 2);
  }

  check_fibonacci_postconditions(n, result);

  return result;
}
