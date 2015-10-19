function verify(conditions, n) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  conditions.forEach(
    function(condition) {
      var conditionResult = condition.apply(null, args);
      if (!conditionResult) {
        throw condition + " (n === " + n + ")";
      }
    }
  );
}

function fibonacci(n) {

  verify(fibonacci.pre, n);

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

  verify(fibonacci.post, n, result);

  return result;
}

fibonacci.pre = [
  function(n) {return Number.isInteger(n);},
  function(n) {return 0 <= n;}
];
fibonacci.post = [
  function(n, result) {return n !== 0 || result === 0;},
  function(n, result) {return n !== 1 || result === 1;},
  function(n, result) {return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);}
];

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


/* http://jsfiddle.net/jandockx/fgxk0orq/ */
