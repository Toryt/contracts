Function.prototype.verify = function verify(conditions, n) {
  var args = Array.prototype.slice.call(arguments, 1);
  conditions.forEach(
    function (condition) {
      var conditionResult = condition.apply(null, args);
      if (!conditionResult) {
        throw condition + " (n === " + n + ")";
      }
    }
  );
};

Function.constructor.prototype.verifyPre = function() {
  Array.prototype.unshift.call(arguments, this.pre);
  this.verify.apply(this, arguments);
};

Function.constructor.prototype.verifyPost = function() {
  Array.prototype.unshift.call(arguments, this.post);
  this.verify.apply(this, arguments);
};
