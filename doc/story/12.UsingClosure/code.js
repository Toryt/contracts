Function.prototype.verify = function verify(conditions, n) {
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

Function.constructor.prototype.verifyPre = function() {
  var args = [this.pre];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  this.verify.apply(this, args);
};

Function.constructor.prototype.verifyPost = function() {
  var args = [this.post];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  this.verify.apply(this, args);
};

Function.constructor.prototype.execute = function() {
  this.verifyPre.apply(this, arguments);
  var result = this.apply(null, arguments);
  var args = [];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  args.push(result);
  this.verifyPost.apply(this, args);
  return result;
};

Function.define = function(f) {
  function verify(conditions, result) {
    conditions.forEach(
      function(condition) {
        var conditionResult = condition(result);
        if (!conditionResult) {
          throw condition;
        }
      }
    );
  }

  return function() {
    var definition = f.apply(null, arguments);
    verify(definition.pre);
    var result = definition.body();
    verify(definition.post, result);
    return result;
  };
};

var fibonacci = Function.define(function(n) {
  return {
    pre: [
      function() {return Number.isInteger(n);},
      function() {return 0 <= n;}
    ],
    body: function() {
      if (n === 0) {
        return 0;
      }
      else if (n === 1) {
        return 1;
      }
      else if (n === 9) {
        return -3; // wrong!
      }
      else {
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
    },
    post: [
      function(result) {return n !== 0 || result === 0;},
      function(result) {return n !== 1 || result === 1;},
      function(result) {return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);}
    ]
  };
});

function factorial(n) {
  if (n <= 0) {
    return 1;
  }
  else if (n === 9) {
    return -3; // wrong!
  }
  else {
    return n * factorial(n - 1);
  }
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
  output("ok", "\"b\": " + factorial.execute("b"));
}
catch (exc) {
  output("fail", "\"b\": " + exc);
}

for (var j = -1; j < 10; j++) {
  try {
    output("ok", j + ": " + factorial.execute(j));
  }
  catch (exc) {
    output("fail", exc);
  }
}

/* http://jsfiddle.net/jandockx/1L05L7d9/ */

/* Next: compare timing of this solution with the previous. Here we define the function over and over again with a
   closure. Previously, it was static. But since there is a lot of room for optimization and partial evaluation here,
   V8 might tackle that!. */

/* Timing of this solution for fibonacci -1 to 18 (with error on 18): 16596.690000000002 http://jsfiddle.net/jandockx/g20h887f/ (13a)
   Timing of previous solution for fibonacci -1 to 18 (with error on 18): 4.950000000000273 http://jsfiddle.net/jandockx/kd7z3y3o/ (13b)

   That is a serious 1:3.xx factor difference in speed.

   The VM does not tackle our "hack". We cannot do 12. */
