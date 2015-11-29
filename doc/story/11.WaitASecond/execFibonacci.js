/* Execute a fibonacci(n) function that must exist in global scope,
   with a selection of parameters. The result and errors are shown
   with Prism.eval. */

/* A call with a character as parameter will fail.
   The parameter must be a positive integer.
   Any errors are logged with Prism.eval. */
try {
  Prism.eval.log("\"a\": " + fibonacci.execute("a"), "fibonacciWithA2");
}
catch (exc) {
  Prism.eval.error("\"a\": " + exc, "fibonacciWithA2");
}

/* Call with all integers from -1 to 9.
   The call with -1 will fail (the parameter must be a positive integer). */
for (i = -1; i < 10; i++) {
  try {
    Prism.eval.log(i + ": " + fibonacci.execute(i), "fibonacciWithI2");
  }
  catch (exc) {
    Prism.eval.error(i + ": " + exc, "fibonacciWithI2");
  }
}
