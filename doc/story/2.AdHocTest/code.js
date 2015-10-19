function fibonacci(n) {

  /* Start preconditions */
  if (!Number.isInteger(n)) {
    throw "pre: Number.isInteger(n #" + n + "#)";
  }
  if (n < 0) {
    throw "pre: 0 <= n #" + n + "#";
  }
  /* End preconditions */

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

  /* Start postconditions */
  if (n === 0 && result !== 0) {
    throw "post: n #" + n + "# !== 0 || result #" + result + "# === 1";
  }
  if (n === 1 && result !== 1) {
    throw "post: n #" + n + "# !== 1 || result #" + result + "# === 1";
  }
  if (2 <= n && result !== fibonacci(n - 1) + fibonacci(n - 2)) {
    throw "post: n #" + n + "# < 2 || result #" + result + "# === fibonacci(n #"
          + n + "# - 1) #" + fibonacci(n - 1) + "# + fibonacci(n #" + n + "# - 2) #"
          + fibonacci(n - 2) + "#";
  }
  /* End postconditions */

  return result;
}

//----------------------------------------------------------

try {
  output("ok", "\"a\": " + fibonacci("a"));
}
catch (exc) {
  output("fail", "\"a\": " + exc);
}

for (i = -1; i < 10; i++) {
  try {
    output("ok", i + ": " + fibonacci(i));
  }
  catch (exc) {
    output("fail", exc);
  }
}


/* http://jsfiddle.net/jandockx/u7wchgcu/ */
