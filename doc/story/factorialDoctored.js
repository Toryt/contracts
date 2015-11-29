function factorial(n) {

  factorial.verifyPre(n);

  var result;
  if (n <= 0) {
    result = 1;
  }
  else if (n === 8) {
    result = -3; // wrong!
  }
  else {
    result = n * factorial(n - 1);
  }

  factorial.verifyPost(n, result);

  return result;
}
