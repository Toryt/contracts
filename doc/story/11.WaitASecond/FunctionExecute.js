Function.constructor.prototype.execute = function() {
  this.verifyPre.apply(this, arguments);
  var result = this.apply(null, arguments);
  Array.prototype.push.call(arguments, result);
  this.verifyPost.apply(this, arguments);
  return result;
};
