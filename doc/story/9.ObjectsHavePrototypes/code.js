function fibonacci(n) {

  fibonacci.verifyPre(n);

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
  var args = Array.prototype.slice.call(arguments, 1);
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
  Array.prototype.unshift.call(arguments, this.pre);
  this.verify.apply(this, arguments);
};
fibonacci.constructor.prototype.verifyPost = function() {
  Array.prototype.unshift.call(arguments, this.post);
  this.verify.apply(this, arguments);
};
