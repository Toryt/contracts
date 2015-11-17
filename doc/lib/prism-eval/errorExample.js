Prism.eval.warn("will be shown in a labeled, general output element", "labelled");
Prism.eval.test.codeExecuted("will throw an error (external code)");
this.isNotJs();
Prism.eval.test.codeShouldNotBeExecuted("will not be reached (external code)");
