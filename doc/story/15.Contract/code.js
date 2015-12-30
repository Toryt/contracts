function Contract(pre, post) {
  this.pre = pre || [];
  this.post = post || [];
}

Contract.prototype = {
  constructor: Contract,
  pre: [],
  post: [],
  verify: function verify(conditions, args) {
    conditions.forEach(
      function (condition) {
        var conditionResult = condition.apply(null, args);
        if (!conditionResult) {
          throw condition + " (" + Array.prototype.join.call(args, ", ") + ")";
        }
      }
    );
  },
  implementation: function(impl) {
    var contract = this;

    function contractFunction() {
      contract.verify(contract.pre, arguments);
      var result = impl.apply(this, arguments);
      Array.prototype.push.call(arguments, result);
      contract.verify(contract.post, arguments);
      return result;
    }

    contractFunction.contract = this;
    contractFunction.impl = impl;

    return contractFunction;
  }
};

fibonacci = new Contract(
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
    function (n) {
      return Number.isInteger(n);
    },
    function (n) {
      return 0 <= n;
    }
  ],
  [
    function (n, result) {
      return n !== 0 || result === 1;
    },
    function (n, result) {
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

Prism.eval.log("fibonacci: " + fibonacci);
Prism.eval.log("fibonacci.contract: " + fibonacci.contract);
Prism.eval.log("fibonacci.contract.pre: " + fibonacci.contract.pre);
Prism.eval.log("fibonacci.contract.post: " + fibonacci.contract.post);
Prism.eval.log("fibonacci.impl: " + fibonacci.impl);

Prism.eval.log("factorialContract: " + factorialContract);
Prism.eval.log("factorialContract.pre: " + factorialContract.pre);
Prism.eval.log("factorialContract.post: " + factorialContract.post);

Prism.eval.log("factorial: " + factorial);
Prism.eval.log("factorial.contract: " + factorial.contract);
Prism.eval.log("factorial.contract.pre: " + factorial.contract.pre);
Prism.eval.log("factorial.contract.post: " + factorial.contract.post);
Prism.eval.log("factorial.impl: " + factorial.impl);

Prism.eval.log("factorialIterative: " + factorialIterative);
Prism.eval.log("factorialIterative.contract: " + factorialIterative.contract);
Prism.eval.log("factorialIterative.contract.pre: " + factorialIterative.contract.pre);
Prism.eval.log("factorialIterative.contract.post: " + factorialIterative.contract.post);
Prism.eval.log("factorialIterative.impl: " + factorialIterative.impl);
