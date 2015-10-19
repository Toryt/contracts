var preconditions = [
  function(n) {return Number.isInteger(n);},
  function(n) {return 0 <= n;}
];

var postconditions = [
  function(n, result) {return n !== 0 || result === 0;},
  function(n, result) {return n !== 1 || result === 1;},
  function(n, result) {return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);}
];

function fibonacci_preconditions(n) {
  preconditions.forEach(
    function(condition) {
      var conditionResult = condition.call(null, n);
      if (!conditionResult) {
        throw condition + " (n === " + n + ")";
      }
    }
  );
}

function fibonacci_postconditions(n, result) {
  postconditions.forEach(
    function(condition) {
      var conditionResult = condition.call(null, n, result);
      if (!conditionResult) {
        throw condition + " (n === " + n + ")";
      }
    }
  );
}

function fibonacci(n) {

  fibonacci_preconditions(n);

  var result;
  if (n === 0) {
    result = 0;
  }
  else if (n === 1) {
    result = 1;
  }
  else if (n === 9) {
    result = -3; // wrong!
  }
  else {
    result = fibonacci(n - 1) + fibonacci(n - 2);
  }

  fibonacci_postconditions(n, result);

  return result;
}


//----------------------------------------------------------

try {
  output("ok", "\"a\": " + fibonacci("a"));
}
catch (exc) {
  output("fail", "\"a\": " + exc);
}

for (i = -1; i < 10; i++) {
  try {
    output("ok", i + ": " + fibonacci(i));
  }
  catch (exc) {
    output("fail", exc);
  }
}

/* http://jsfiddle.net/jandockx/zrtk6k8x/ */
