/* Execute a factorial(n) function that must exist in global scope,
   with a selection of parameters. The result and errors are shown
   with Prism.eval. */

/* A call with a character as parameter will fail.
   The parameter must be a positive integer.
   Any errors are logged with Prism.eval. */
try {
  Prism.eval.log("factorial(\"a\"): " + factorial("a"), "factorialWithA");
}
catch (exc) {
  Prism.eval.error("factorial(\"a\"): " + exc, "factorialWithA");
}

/* Call with all integers from -1 to 9.
   The call with -1 will fail (the parameter must be a positive integer). */
for (i = -1; i < 10; i++) {
  try {
    Prism.eval.log("factorial(" + i + "): " + factorial(i), "factorialWithI");
  }
  catch (exc) {
    Prism.eval.error("factorial(" + i + "): " + exc, "factorialWithI");
  }
}
