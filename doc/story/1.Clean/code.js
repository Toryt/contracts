function fibonacci(n) {
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}

//----------------------------------------------------------

try {
  Prism.eval.log("\"a\": " + fibonacci("a"), "callWithA");
}
catch (exc) {
  Prism.eval.error("\"a\": " + exc, "callWithA");
}

for (i = -1; i < 10; i++) {
  try {
    Prism.eval.log(i + ": " + fibonacci(i), "callWithI");
  }
  catch (exc) {
    Prism.eval.error(i + ": " + exc, "callWithI");
  }
}

/* http://jsfiddle.net/jandockx/2j9bdkvd/ */
