function fibonacci_preconditions(n) {
  if (!Number.isInteger(n)) {
    throw "pre: Number.isInteger(n #" + n + "#)";
  }
  if (n < 0) {
    throw "pre: 0 <= n #" + n + "#";
  }
}

function fibonacci_postconditions(n, result) {
  if (n === 0 && result !== 0) {
    throw "post: n #" + n + "# !== 0 || result #" + result + "# === 1";
  }
  if (n === 1 && result !== 1) {
    throw "post: n #" + n + "# !== 1 || result #" + result + "# === 1";
  }
  if (2 <= n && result !== fibonacci(n - 1) + fibonacci(n - 2)) {
    throw "post: n #" + n + "# < 2 || result #" + result + "# === fibonacci(n #" + n
          + "# - 1) #" + fibonacci(n - 1) + "# + fibonacci(n #" + n
          + "# - 2) #" + fibonacci(n - 2) + "#";
  }
}

function fibonacci(n) {

  fibonacci_preconditions(n);

  var result;
  if (n === 0) {
    result = 0;
  }
  else if (n === 1) {
    result = 1;
  }
  else if (n === 18) {
    result = -3; // wrong!
  }
  else {
    result = fibonacci(n - 1) + fibonacci(n - 2);
  }

  fibonacci_postconditions(n, result);

  return result;
}
