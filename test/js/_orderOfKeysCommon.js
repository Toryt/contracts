/*
 Copyright 2015 - 2016 by Jan Dockx

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

module.exports = (function() {
  "use strict";

  var randomString = require("randomstring");

  function randomName(/*Number*/ n) {
    var nString = "$$" + n + "$$";
    return randomString.generate() + nString;
  }

  function nFromRandomName(/*String*/ str) {
    return Number.parseInt(/\$\$(\d+)\$\$/.exec(str)[1]);
  }

  function prepareAnObject(/*Number*/ startValue, /*Number*/ nrOfProperties) {
    var max = startValue + nrOfProperties;
    var o = {};
    for (var i = startValue; i < max; i++) {
      o[randomName(i)] = i;
    }
    return o;
  }

  function prepareAnObjectWithAProto() {
    //noinspection MagicNumberJS
    var oProto1 = prepareAnObject(200, 10);
    //noinspection MagicNumberJS
    var oProto2 = prepareAnObject(100, 10);
    Object.setPrototypeOf(oProto2, oProto1);
    var o = prepareAnObject(0, 10);
    Object.setPrototypeOf(o, oProto2);
    return o;
  }


  var objectLiteral = {
    "realFirst$$0$$": new Date(),
    "first$$1$$": null,
    "second$$2$$": 4,
    "third$$3$$": undefined, // will not be stringified
    "fourth$$4$$": function() {} // will not be stringified
  };

  return {
    prepareAnObject: prepareAnObject,
    nFromRandomName: nFromRandomName,
    prepareAnObjectWithAProto: prepareAnObjectWithAProto,
    objectLiteral: objectLiteral
  };

})();
