function preconditions(conditions, n) {
  conditions.forEach(
    function(condition) {
      var conditionResult = condition.call(null, n);
      if (!conditionResult) {
        throw condition + " (n === " + n + ")";
      }
    }
  );
}

function postconditions(conditions, n, result) {
  conditions.forEach(
    function(condition) {
      var conditionResult = condition.call(null, n, result);
      if (!conditionResult) {
        throw condition + " (n === " + n + ")";
      }
    }
  );
}

function fibonacci(n) {

  preconditions(fibonacci.pre, n);

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

  postconditions(fibonacci.post, n, result);

  return result;
}
