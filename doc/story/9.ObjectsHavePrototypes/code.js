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

fibonacci.constructor.prototype.verify = function verify(conditions, n) {
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
};

fibonacci.constructor.prototype.verifyPre = function() {
  var args = [this.pre];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  this.verify.apply(this, args);
};
fibonacci.constructor.prototype.verifyPost = function() {
  var args = [this.post];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  this.verify.apply(this, args);
};

function factorial(n) {

  factorial.verifyPre(n);

  var result;
  if (n <= 0) {
    result = 1;
  }
  else if (n === 9) {
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


//----------------------------------------------------------

try {
  output("ok", "\"a\": " + fibonacci("a"));
}
catch (exc) {
  output("fail", "\"a\": " + exc);
}

for (var i = -1; i < 10; i++) {
  try {
    output("ok", i + ": " + fibonacci(i));
  }
  catch (exc) {
    output("fail", exc);
  }
}

try {
  output("ok", "\"b\": " + factorial("b"));
}
catch (exc) {
  output("fail", "\"b\": " + exc);
}

for (var j = -1; j < 10; j++) {
  try {
    output("ok", j + ": " + factorial(j));
  }
  catch (exc) {
    output("fail", exc);
  }
}

/* http://jsfiddle.net/jandockx/7xexrjvf/ */
