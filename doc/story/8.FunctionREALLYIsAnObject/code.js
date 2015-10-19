function fibonacci(n) {

  fibonacci.verifyPre(n);

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

  fibonacci.verifyPost(n, result);

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

fibonacci.verify = function verify(conditionPropertyName, n) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  this[conditionPropertyName].forEach( // look Ma, a this!
    function(condition) {
      var conditionResult = condition.apply(null, args);
      if (!conditionResult) {
        throw condition + " (n === " + n + ")";
      }
    }
  );
};

fibonacci.verifyPre = fibonacci.verify.bind(fibonacci, "pre");
fibonacci.verifyPost = fibonacci.verify.bind(fibonacci, "post");

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

/* http://jsfiddle.net/jandockx/a4a4p9hn/ */
