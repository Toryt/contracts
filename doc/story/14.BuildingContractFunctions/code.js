function verify(conditions, args) {
  conditions.forEach(
    function (condition) {
      var conditionResult = condition.apply(null, args);
      if (!conditionResult) {
        throw condition + " (" + Array.prototype.join.call(args, ", ") + ")";
      }
    }
  );
}

function cfunc(pre, post, impl) {
  function contractFunction() {
    verify(pre, arguments);
    var result = impl.apply(this, arguments);
    Array.prototype.push.call(arguments, result);
    verify(post, arguments);
    return result;
  }

  contractFunction.pre = pre;
  contractFunction.post = post;
  contractFunction.impl = impl;

  return contractFunction;
}

fibonacci = cfunc(
  [
    function (n) {
      return Number.isInteger(n);
    },
    function (n) {
      return 0 <= n;
    }
  ],
  [
    function (n, result) {
      return n !== 0 || result === 0;
    },
    function (n, result) {
      return n !== 1 || result === 1;
    },
    function (n, result) {
      return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);
    }
  ],
  function (n) {
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
  }
);

Prism.eval.log("fibonacci: " + fibonacci);
Prism.eval.log("fibonacci.pre: " + fibonacci.pre);
Prism.eval.log("fibonacci.post: " + fibonacci.post);
Prism.eval.log("fibonacci.impl: " + fibonacci.impl);
