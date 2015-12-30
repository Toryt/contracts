var contractFunctionPrototype = function () {
  arguments.callee.verifyPre.apply(arguments.callee, arguments);
  var result = arguments.callee.impl.apply(null, arguments);
  Array.prototype.push.call(arguments, result);
  arguments.callee.verifyPost.apply(arguments.callee, arguments);
  return result;
};

/*
var fibonacci = Object.create(
  contractFunctionPrototype,
  {
    impl: function (n) {
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
  }
);


function test() {
  return 3;
}

var factorial = Object.create(
  contractFunctionPrototype,
  {
    impl: function factorial(n) {
      if (n <= 0) {
        return 1;
      }
      else if (n === 8) {
        return -3; // wrong!
      }
      else {
        return n * factorial(n - 1);
      }
    }
  }
);
*/

var fibonacci = function() {return arguments.callee.__proto__.apply(null, arguments)};
Object.setPrototypeOf(fibonacci, contractFunctionPrototype);
fibonacci.pre = [
  function (n) {
    return Number.isInteger(n);
  },
  function (n) {
    return 0 <= n;
  }
];
fibonacci.post = [
  function (n, result) {
    return n !== 0 || result === 0;
  },
  function (n, result) {
    return n !== 1 || result === 1;
  },
  function (n, result) {
    return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);
  }
];
fibonacci.impl = function (n) {
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
};
