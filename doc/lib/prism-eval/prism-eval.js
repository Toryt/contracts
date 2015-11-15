(function () {

  if (typeof self === "undefined" || !self.Prism || !self.document) {
    return;
  }

  Prism.eval = {
    logLevel: "warn",
    log: function (str) { // alias for debug
      console.log(str);
    },
    info: function (str) {
      console.info(str);
    },
    warn: function (str) {
      console.warn(str);
    },
    error: function (str) {
      console.error(str);
    }
  }

  var evalAttributeName = "data-eval";
  var logPrefix = "Prism-eval: ";

  function debug(str) {
    if (Prism.eval.logLevel === "debug") {
      console.debug(logPrefix + str);
    }
  }

  function info(str) {
    if (Prism.eval.logLevel === "debug" || Prism.eval.logLevel === "info") {
      console.info(logPrefix + str);
    }
  }

  function warn(str) {
    if (Prism.eval.logLevel === "debug" || Prism.eval.logLevel === "info" || Prism.eval.logLevel === "warn") {
      console.info(logPrefix + str);
    }
  }

  function error(str) {
    if (Prism.eval.logLevel === "debug"
      || Prism.eval.logLevel === "info"
      || Prism.eval.logLevel === "warn"
      || Prism.eval.logLevel === "error") {
      console.error(logPrefix + str);
    }
  }

  Prism.hooks.add("complete", function (env) {
    /* This is called twice for elements handled by File HighLight, once when it is discovered by Prism itself,
       and once when it is loaded by the plugin. This goes for all "hooks". */


    // works only for <code> wrapped inside <pre> (not inline), with a truthy "data-eval" attribute
    if (!env || !env.element || !env.language) {
      // should not happen
      error("Prism-eval: called with an environment that does not contain an element and a language.");
      return;
    }

    if (env.language !== "javascript") {
      debug("Prism-eval: called with an environment that is not for a JavaScript code snippet. NOP.");
      return;
    }

    var evalAttribute = env.element.getAttribute(evalAttributeName);
    if (!evalAttribute) {
      var evalAttribute = env.element.parentNode && env.element.parentNode.getAttribute(evalAttributeName);
    }

    if (!evalAttribute) {
      debug("called with an environment for JavaScript without a truthy data-eval attribute on <code> or its parent.");
      return;
    }

    debug("The element is setup to execute code");
    //var preSrc = env.element.parentNode && env.element.parentNode.getAttribute("data-src");
    //if (!preSrc) { // src in HTML
      if (!env.code) {
        warn("<code> element was setup to evaluate code mentioned in html, but there is no code.");
        return;
      }
      if (env.code === "Loading…") {
        debug("<code> is loading (File HighLight).");
        return;
      }
      debug("there is code; eval on the next tick");
      var fileHighLightSrc = env.element.parentNode && env.element.parentNode.getAttribute("data-src");
      if (!fileHighLightSrc || evalAttribute !== "script") {
        debug("src in HTML, or src in external file via plugin file-highlight, but not ordered to do script; " +
          "doing eval");
        setTimeout(
          function () {
            try {
              debug("will evaluate: \"" + env.code + "\"");
              eval(env.code);
            }
            catch (exc) {
              info("evaluation resulted in an exception: " + (exc.message || exc));
              info("code: ");
              info(env.code);
              console.warn(exc); // TODO show exc
            }
          },
          0
        );
      }
      else {
        debug("src not in the HTML, but in an external file via plugin file-highlight, and ordered to do script");
        var script = document.createElement("script");
        script.async = true;
        script.src = fileHighLightSrc;
        // no type, means JavaScript
        document.getElementsByTagName("head")[0].appendChild(script);
      }
  });

}());
