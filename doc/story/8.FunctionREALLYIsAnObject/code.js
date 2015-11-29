fibonacci.verify = function verify(conditionPropertyName, n) {
  var args = Array.prototype.slice.call(arguments, 1); // closure
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
