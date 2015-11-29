function factorial(n) {
  if (n <= 0) {
    return 1;
  }
  else if (n === 8) {
    return -3; // wrong!
  }
  else {
    return n * factorial(n - 1);
  }
}
