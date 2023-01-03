"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
function peg$subclass(child, parent) {
  function C() {
    this.constructor = child;
  }
  C.prototype = parent.prototype;
  child.prototype = new C();
}
function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}
peg$subclass(peg$SyntaxError, Error);
function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) {
    return str;
  }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}
peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0; k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var loc = this.location.source + ":" + s.line + ":" + s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", s.line.toString().length, " ");
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = last - s.column || 1;
      str += "\n --> " + loc + "\n" + filler + " |\n" + s.line + " | " + line + "\n" + filler + " | " + peg$padEnd("", s.column - 1, " ") + peg$padEnd("", hatLen, "^");
    } else {
      str += "\n at " + loc;
    }
  }
  return str;
};
peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return '"' + literalEscape(expectation.text) + '"';
    },
    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
      });
      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },
    any: function() {
      return "any character";
    },
    end: function() {
      return "end of input";
    },
    other: function(expectation) {
      return expectation.description;
    }
  };
  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }
  function literalEscape(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
      return "\\x0" + hex(ch);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
      return "\\x" + hex(ch);
    });
  }
  function classEscape(s) {
    return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
      return "\\x0" + hex(ch);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
      return "\\x" + hex(ch);
    });
  }
  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }
  function describeExpected(expected2) {
    var descriptions = expected2.map(describeExpectation);
    var i, j;
    descriptions.sort();
    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }
    switch (descriptions.length) {
      case 1:
        return descriptions[0];
      case 2:
        return descriptions[0] + " or " + descriptions[1];
      default:
        return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
    }
  }
  function describeFound(found2) {
    return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
  }
  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};
function peg$parse(input, options) {
  options = options !== void 0 ? options : {};
  var peg$FAILED = {};
  var peg$source = options.grammarSource;
  var peg$startRuleFunctions = { start: peg$parsestart };
  var peg$startRuleFunction = peg$parsestart;
  var peg$c0 = ".";
  var peg$c1 = "-";
  var peg$c2 = "+";
  var peg$c3 = "0";
  var peg$c4 = ",";
  var peg$c5 = "|";
  var peg$c6 = '"';
  var peg$c7 = "'";
  var peg$c8 = "#";
  var peg$c9 = "^";
  var peg$c10 = "_";
  var peg$c11 = ":";
  var peg$c12 = "[";
  var peg$c13 = "]";
  var peg$c14 = "{";
  var peg$c15 = "}";
  var peg$c16 = "%";
  var peg$c17 = "<";
  var peg$c18 = ">";
  var peg$c19 = "@";
  var peg$c20 = "!";
  var peg$c21 = "(";
  var peg$c22 = ")";
  var peg$c23 = "/";
  var peg$c24 = "*";
  var peg$c25 = "?";
  var peg$c26 = "struct";
  var peg$c27 = "target";
  var peg$c28 = "euclid";
  var peg$c29 = "slow";
  var peg$c30 = "rotL";
  var peg$c31 = "rotR";
  var peg$c32 = "fast";
  var peg$c33 = "scale";
  var peg$c34 = "//";
  var peg$c35 = "cat";
  var peg$c36 = "$";
  var peg$c37 = "setcps";
  var peg$c38 = "setbpm";
  var peg$c39 = "hush";
  var peg$r0 = /^[1-9]/;
  var peg$r1 = /^[eE]/;
  var peg$r2 = /^[0-9]/;
  var peg$r3 = /^[ \n\r\t]/;
  var peg$r4 = /^[0-9a-zA-Z~]/;
  var peg$r5 = /^[^\n]/;
  var peg$e0 = peg$otherExpectation("number");
  var peg$e1 = peg$literalExpectation(".", false);
  var peg$e2 = peg$classExpectation([["1", "9"]], false, false);
  var peg$e3 = peg$classExpectation(["e", "E"], false, false);
  var peg$e4 = peg$literalExpectation("-", false);
  var peg$e5 = peg$literalExpectation("+", false);
  var peg$e6 = peg$literalExpectation("0", false);
  var peg$e7 = peg$classExpectation([["0", "9"]], false, false);
  var peg$e8 = peg$otherExpectation("whitespace");
  var peg$e9 = peg$classExpectation([" ", "\n", "\r", "	"], false, false);
  var peg$e10 = peg$literalExpectation(",", false);
  var peg$e11 = peg$literalExpectation("|", false);
  var peg$e12 = peg$literalExpectation('"', false);
  var peg$e13 = peg$literalExpectation("'", false);
  var peg$e14 = peg$classExpectation([["0", "9"], ["a", "z"], ["A", "Z"], "~"], false, false);
  var peg$e15 = peg$literalExpectation("#", false);
  var peg$e16 = peg$literalExpectation("^", false);
  var peg$e17 = peg$literalExpectation("_", false);
  var peg$e18 = peg$literalExpectation(":", false);
  var peg$e19 = peg$literalExpectation("[", false);
  var peg$e20 = peg$literalExpectation("]", false);
  var peg$e21 = peg$literalExpectation("{", false);
  var peg$e22 = peg$literalExpectation("}", false);
  var peg$e23 = peg$literalExpectation("%", false);
  var peg$e24 = peg$literalExpectation("<", false);
  var peg$e25 = peg$literalExpectation(">", false);
  var peg$e26 = peg$literalExpectation("@", false);
  var peg$e27 = peg$literalExpectation("!", false);
  var peg$e28 = peg$literalExpectation("(", false);
  var peg$e29 = peg$literalExpectation(")", false);
  var peg$e30 = peg$literalExpectation("/", false);
  var peg$e31 = peg$literalExpectation("*", false);
  var peg$e32 = peg$literalExpectation("?", false);
  var peg$e33 = peg$literalExpectation("struct", false);
  var peg$e34 = peg$literalExpectation("target", false);
  var peg$e35 = peg$literalExpectation("euclid", false);
  var peg$e36 = peg$literalExpectation("slow", false);
  var peg$e37 = peg$literalExpectation("rotL", false);
  var peg$e38 = peg$literalExpectation("rotR", false);
  var peg$e39 = peg$literalExpectation("fast", false);
  var peg$e40 = peg$literalExpectation("scale", false);
  var peg$e41 = peg$literalExpectation("//", false);
  var peg$e42 = peg$classExpectation(["\n"], true, false);
  var peg$e43 = peg$literalExpectation("cat", false);
  var peg$e44 = peg$literalExpectation("$", false);
  var peg$e45 = peg$literalExpectation("setcps", false);
  var peg$e46 = peg$literalExpectation("setbpm", false);
  var peg$e47 = peg$literalExpectation("hush", false);
  var peg$f0 = function() {
    return parseFloat(text());
  };
  var peg$f1 = function(chars) {
    return new AtomStub(chars.join(""));
  };
  var peg$f2 = function(s) {
    return s;
  };
  var peg$f3 = function(s, stepsPerCycle) {
    s.arguments_.stepsPerCycle = stepsPerCycle;
    return s;
  };
  var peg$f4 = function(a2) {
    return a2;
  };
  var peg$f5 = function(s) {
    s.arguments_.alignment = "slowcat";
    return s;
  };
  var peg$f6 = function(a2) {
    return { weight: a2 };
  };
  var peg$f7 = function(a2) {
    return { replicate: a2 };
  };
  var peg$f8 = function(p, s, r2) {
    return { operator: { type_: "bjorklund", arguments_: { pulse: p, step: s, rotation: r2 } } };
  };
  var peg$f9 = function(a2) {
    return { operator: { type_: "stretch", arguments_: { amount: a2, type: "slow" } } };
  };
  var peg$f10 = function(a2) {
    return { operator: { type_: "stretch", arguments_: { amount: a2, type: "fast" } } };
  };
  var peg$f11 = function(a2) {
    return { operator: { type_: "degradeBy", arguments_: { amount: a2 } } };
  };
  var peg$f12 = function(s, o) {
    return new ElementStub(s, o);
  };
  var peg$f13 = function(s) {
    return new PatternStub(s, "fastcat");
  };
  var peg$f14 = function(tail) {
    return { alignment: "stack", list: tail };
  };
  var peg$f15 = function(tail) {
    return { alignment: "rand", list: tail };
  };
  var peg$f16 = function(head, tail) {
    if (tail && tail.list.length > 0) {
      return new PatternStub([head, ...tail.list], tail.alignment);
    } else {
      return head;
    }
  };
  var peg$f17 = function(head, tail) {
    return new PatternStub(tail ? [head, ...tail.list] : [head], "polymeter");
  };
  var peg$f18 = function(sc) {
    return sc;
  };
  var peg$f19 = function(s) {
    return { name: "struct", args: { mini: s } };
  };
  var peg$f20 = function(s) {
    return { name: "target", args: { name: s } };
  };
  var peg$f21 = function(p, s, r2) {
    return { name: "bjorklund", args: { pulse: p, step: parseInt(s) } };
  };
  var peg$f22 = function(a2) {
    return { name: "stretch", args: { amount: a2 } };
  };
  var peg$f23 = function(a2) {
    return { name: "shift", args: { amount: "-" + a2 } };
  };
  var peg$f24 = function(a2) {
    return { name: "shift", args: { amount: a2 } };
  };
  var peg$f25 = function(a2) {
    return { name: "stretch", args: { amount: "1/" + a2 } };
  };
  var peg$f26 = function(s) {
    return { name: "scale", args: { scale: s.join("") } };
  };
  var peg$f27 = function(s, v) {
    return v;
  };
  var peg$f28 = function(s, ss) {
    ss.unshift(s);
    return new PatternStub(ss, "slowcat");
  };
  var peg$f29 = function(sg) {
    return sg;
  };
  var peg$f30 = function(o, soc) {
    return new OperatorStub(o.name, o.args, soc);
  };
  var peg$f31 = function(sc) {
    return sc;
  };
  var peg$f32 = function(c) {
    return c;
  };
  var peg$f33 = function(v) {
    return new CommandStub("setcps", { value: v });
  };
  var peg$f34 = function(v) {
    return new CommandStub("setcps", { value: v / 120 / 2 });
  };
  var peg$f35 = function() {
    return new CommandStub("hush");
  };
  var peg$currPos = 0;
  var peg$savedPos = 0;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = 0;
  var peg$maxFailExpected = [];
  var peg$silentFails = 0;
  var peg$result;
  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
    }
    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }
  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }
  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }
  function peg$literalExpectation(text2, ignoreCase) {
    return { type: "literal", text: text2, ignoreCase };
  }
  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts, inverted, ignoreCase };
  }
  function peg$endExpectation() {
    return { type: "end" };
  }
  function peg$otherExpectation(description) {
    return { type: "other", description };
  }
  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos];
    var p;
    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }
      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };
      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }
        p++;
      }
      peg$posDetailsCache[pos] = details;
      return details;
    }
  }
  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);
    return {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }
  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }
    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }
    peg$maxFailExpected.push(expected);
  }
  function peg$buildStructuredError(expected, found, location2) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location2
    );
  }
  function peg$parsestart() {
    var s0;
    s0 = peg$parsestatement();
    return s0;
  }
  function peg$parsenumber() {
    var s0, s2;
    peg$silentFails++;
    s0 = peg$currPos;
    peg$parseminus();
    s2 = peg$parseint();
    if (s2 !== peg$FAILED) {
      peg$parsefrac();
      peg$parseexp();
      peg$savedPos = s0;
      s0 = peg$f0();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      if (peg$silentFails === 0) {
        peg$fail(peg$e0);
      }
    }
    return s0;
  }
  function peg$parsedecimal_point() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 46) {
      s0 = peg$c0;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e1);
      }
    }
    return s0;
  }
  function peg$parsedigit1_9() {
    var s0;
    if (peg$r0.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    return s0;
  }
  function peg$parsee() {
    var s0;
    if (peg$r1.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e3);
      }
    }
    return s0;
  }
  function peg$parseexp() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parsee();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseminus();
      if (s2 === peg$FAILED) {
        s2 = peg$parseplus();
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = [];
      s4 = peg$parseDIGIT();
      if (s4 !== peg$FAILED) {
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parseDIGIT();
        }
      } else {
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s1 = [s1, s2, s3];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsefrac() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsedecimal_point();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseDIGIT();
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseDIGIT();
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseint() {
    var s0, s1, s2, s3;
    s0 = peg$parsezero();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsedigit1_9();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseDIGIT();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseDIGIT();
        }
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parseminus() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 45) {
      s0 = peg$c1;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e4);
      }
    }
    return s0;
  }
  function peg$parseplus() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 43) {
      s0 = peg$c2;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e5);
      }
    }
    return s0;
  }
  function peg$parsezero() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 48) {
      s0 = peg$c3;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e6);
      }
    }
    return s0;
  }
  function peg$parseDIGIT() {
    var s0;
    if (peg$r2.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e7);
      }
    }
    return s0;
  }
  function peg$parsews() {
    var s0, s1;
    peg$silentFails++;
    s0 = [];
    if (peg$r3.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e9);
      }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      if (peg$r3.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e9);
        }
      }
    }
    peg$silentFails--;
    s1 = peg$FAILED;
    if (peg$silentFails === 0) {
      peg$fail(peg$e8);
    }
    return s0;
  }
  function peg$parsecomma() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsews();
    if (input.charCodeAt(peg$currPos) === 44) {
      s2 = peg$c4;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e10);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsews();
      s1 = [s1, s2, s3];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsepipe() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsews();
    if (input.charCodeAt(peg$currPos) === 124) {
      s2 = peg$c5;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e11);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsews();
      s1 = [s1, s2, s3];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsequote() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 34) {
      s0 = peg$c6;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e12);
      }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 39) {
        s0 = peg$c7;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e13);
        }
      }
    }
    return s0;
  }
  function peg$parsestep_char() {
    var s0;
    if (peg$r4.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e14);
      }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 45) {
        s0 = peg$c1;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e4);
        }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 35) {
          s0 = peg$c8;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e15);
          }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 46) {
            s0 = peg$c0;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e1);
            }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 94) {
              s0 = peg$c9;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e16);
              }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 95) {
                s0 = peg$c10;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e17);
                }
              }
              if (s0 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                  s0 = peg$c11;
                  peg$currPos++;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e18);
                  }
                }
              }
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parsestep() {
    var s0, s2, s3;
    s0 = peg$currPos;
    peg$parsews();
    s2 = [];
    s3 = peg$parsestep_char();
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsestep_char();
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsews();
      peg$savedPos = s0;
      s0 = peg$f1(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesub_cycle() {
    var s0, s2, s4, s6;
    s0 = peg$currPos;
    peg$parsews();
    if (input.charCodeAt(peg$currPos) === 91) {
      s2 = peg$c12;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e19);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$parsews();
      s4 = peg$parsestack_or_choose();
      if (s4 !== peg$FAILED) {
        peg$parsews();
        if (input.charCodeAt(peg$currPos) === 93) {
          s6 = peg$c13;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e20);
          }
        }
        if (s6 !== peg$FAILED) {
          peg$parsews();
          peg$savedPos = s0;
          s0 = peg$f2(s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsepolymeter() {
    var s0, s2, s4, s6, s7;
    s0 = peg$currPos;
    peg$parsews();
    if (input.charCodeAt(peg$currPos) === 123) {
      s2 = peg$c14;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e21);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$parsews();
      s4 = peg$parsepolymeter_stack();
      if (s4 !== peg$FAILED) {
        peg$parsews();
        if (input.charCodeAt(peg$currPos) === 125) {
          s6 = peg$c15;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e22);
          }
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$parsepolymeter_steps();
          if (s7 === peg$FAILED) {
            s7 = null;
          }
          peg$parsews();
          peg$savedPos = s0;
          s0 = peg$f3(s4, s7);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsepolymeter_steps() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 37) {
      s1 = peg$c16;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e23);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseslice();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f4(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslow_sequence() {
    var s0, s2, s4, s6;
    s0 = peg$currPos;
    peg$parsews();
    if (input.charCodeAt(peg$currPos) === 60) {
      s2 = peg$c17;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e24);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$parsews();
      s4 = peg$parsesequence();
      if (s4 !== peg$FAILED) {
        peg$parsews();
        if (input.charCodeAt(peg$currPos) === 62) {
          s6 = peg$c18;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e25);
          }
        }
        if (s6 !== peg$FAILED) {
          peg$parsews();
          peg$savedPos = s0;
          s0 = peg$f5(s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslice() {
    var s0;
    s0 = peg$parsestep();
    if (s0 === peg$FAILED) {
      s0 = peg$parsesub_cycle();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepolymeter();
        if (s0 === peg$FAILED) {
          s0 = peg$parseslow_sequence();
        }
      }
    }
    return s0;
  }
  function peg$parseslice_modifier() {
    var s0;
    s0 = peg$parseslice_weight();
    if (s0 === peg$FAILED) {
      s0 = peg$parseslice_bjorklund();
      if (s0 === peg$FAILED) {
        s0 = peg$parseslice_slow();
        if (s0 === peg$FAILED) {
          s0 = peg$parseslice_fast();
          if (s0 === peg$FAILED) {
            s0 = peg$parseslice_replicate();
            if (s0 === peg$FAILED) {
              s0 = peg$parseslice_degrade();
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parseslice_weight() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 64) {
      s1 = peg$c19;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e26);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f6(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslice_replicate() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 33) {
      s1 = peg$c20;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e27);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f7(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslice_bjorklund() {
    var s0, s1, s3, s5, s7, s11, s13;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c21;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e28);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parseslice_with_modifier();
      if (s3 !== peg$FAILED) {
        peg$parsews();
        s5 = peg$parsecomma();
        if (s5 !== peg$FAILED) {
          peg$parsews();
          s7 = peg$parseslice_with_modifier();
          if (s7 !== peg$FAILED) {
            peg$parsews();
            peg$parsecomma();
            peg$parsews();
            s11 = peg$parseslice_with_modifier();
            if (s11 === peg$FAILED) {
              s11 = null;
            }
            peg$parsews();
            if (input.charCodeAt(peg$currPos) === 41) {
              s13 = peg$c22;
              peg$currPos++;
            } else {
              s13 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e29);
              }
            }
            if (s13 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f8(s3, s7, s11);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslice_slow() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 47) {
      s1 = peg$c23;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e30);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseslice();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f9(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslice_fast() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 42) {
      s1 = peg$c24;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e31);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseslice();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f10(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslice_degrade() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 63) {
      s1 = peg$c25;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e32);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f11(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslice_with_modifier() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseslice();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseslice_modifier();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f12(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesequence() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseslice_with_modifier();
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseslice_with_modifier();
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f13(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsestack_tail() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$parsecomma();
    if (s3 !== peg$FAILED) {
      s4 = peg$parsesequence();
      if (s4 !== peg$FAILED) {
        s2 = s4;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$parsecomma();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsesequence();
          if (s4 !== peg$FAILED) {
            s2 = s4;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f14(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsechoose_tail() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$parsepipe();
    if (s3 !== peg$FAILED) {
      s4 = peg$parsesequence();
      if (s4 !== peg$FAILED) {
        s2 = s4;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$parsepipe();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsesequence();
          if (s4 !== peg$FAILED) {
            s2 = s4;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f15(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsestack_or_choose() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsesequence();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsestack_tail();
      if (s2 === peg$FAILED) {
        s2 = peg$parsechoose_tail();
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f16(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsepolymeter_stack() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsesequence();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsestack_tail();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f17(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsemini() {
    var s0, s2, s3, s4;
    s0 = peg$currPos;
    peg$parsews();
    s2 = peg$parsequote();
    if (s2 !== peg$FAILED) {
      s3 = peg$parsestack_or_choose();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsequote();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f18(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseoperator() {
    var s0;
    s0 = peg$parsescale();
    if (s0 === peg$FAILED) {
      s0 = peg$parseslow();
      if (s0 === peg$FAILED) {
        s0 = peg$parsefast();
        if (s0 === peg$FAILED) {
          s0 = peg$parsetarget();
          if (s0 === peg$FAILED) {
            s0 = peg$parsebjorklund();
            if (s0 === peg$FAILED) {
              s0 = peg$parsestruct();
              if (s0 === peg$FAILED) {
                s0 = peg$parserotR();
                if (s0 === peg$FAILED) {
                  s0 = peg$parserotL();
                }
              }
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parsestruct() {
    var s0, s1, s3;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c26) {
      s1 = peg$c26;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e33);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsemini_or_operator();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f19(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetarget() {
    var s0, s1, s3, s4, s5;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c27) {
      s1 = peg$c27;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e34);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsequote();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsestep();
        if (s4 !== peg$FAILED) {
          s5 = peg$parsequote();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f20(s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebjorklund() {
    var s0, s1, s3, s5;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c28) {
      s1 = peg$c28;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e35);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parseint();
      if (s3 !== peg$FAILED) {
        peg$parsews();
        s5 = peg$parseint();
        if (s5 !== peg$FAILED) {
          peg$parsews();
          peg$parseint();
          peg$savedPos = s0;
          s0 = peg$f21(s3, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslow() {
    var s0, s1, s3;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c29) {
      s1 = peg$c29;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e36);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsenumber();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f22(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parserotL() {
    var s0, s1, s3;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c30) {
      s1 = peg$c30;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e37);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsenumber();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f23(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parserotR() {
    var s0, s1, s3;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c31) {
      s1 = peg$c31;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e38);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsenumber();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f24(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsefast() {
    var s0, s1, s3;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c32) {
      s1 = peg$c32;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e39);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsenumber();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f25(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsescale() {
    var s0, s1, s3, s4, s5;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c33) {
      s1 = peg$c33;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e40);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsequote();
      if (s3 !== peg$FAILED) {
        s4 = [];
        s5 = peg$parsestep_char();
        if (s5 !== peg$FAILED) {
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsestep_char();
          }
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsequote();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f26(s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecomment() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c34) {
      s1 = peg$c34;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e41);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$r5.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e42);
        }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        if (peg$r5.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e42);
          }
        }
      }
      s1 = [s1, s2];
      s0 = s1;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecat() {
    var s0, s1, s3, s5, s6, s7, s8, s9;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c35) {
      s1 = peg$c35;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e43);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      if (input.charCodeAt(peg$currPos) === 91) {
        s3 = peg$c12;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e19);
        }
      }
      if (s3 !== peg$FAILED) {
        peg$parsews();
        s5 = peg$parsemini_or_operator();
        if (s5 !== peg$FAILED) {
          s6 = [];
          s7 = peg$currPos;
          s8 = peg$parsecomma();
          if (s8 !== peg$FAILED) {
            s9 = peg$parsemini_or_operator();
            if (s9 !== peg$FAILED) {
              peg$savedPos = s7;
              s7 = peg$f27(s5, s9);
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
          while (s7 !== peg$FAILED) {
            s6.push(s7);
            s7 = peg$currPos;
            s8 = peg$parsecomma();
            if (s8 !== peg$FAILED) {
              s9 = peg$parsemini_or_operator();
              if (s9 !== peg$FAILED) {
                peg$savedPos = s7;
                s7 = peg$f27(s5, s9);
              } else {
                peg$currPos = s7;
                s7 = peg$FAILED;
              }
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
          }
          s7 = peg$parsews();
          if (input.charCodeAt(peg$currPos) === 93) {
            s8 = peg$c13;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e20);
            }
          }
          if (s8 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f28(s5, s6);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsemini_or_group() {
    var s0;
    s0 = peg$parsecat();
    if (s0 === peg$FAILED) {
      s0 = peg$parsemini();
    }
    return s0;
  }
  function peg$parsemini_or_operator() {
    var s0, s1, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsemini_or_group();
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = [];
      s4 = peg$parsecomment();
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = peg$parsecomment();
      }
      peg$savedPos = s0;
      s0 = peg$f29(s1);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseoperator();
      if (s1 !== peg$FAILED) {
        peg$parsews();
        if (input.charCodeAt(peg$currPos) === 36) {
          s3 = peg$c36;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e44);
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsews();
          s5 = peg$parsemini_or_operator();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f30(s1, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parsesequ_or_operator_or_comment() {
    var s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsemini_or_operator();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f31(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$parsecomment();
    }
    return s0;
  }
  function peg$parsemini_definition() {
    var s0;
    s0 = peg$parsesequ_or_operator_or_comment();
    return s0;
  }
  function peg$parsecommand() {
    var s0, s2;
    s0 = peg$currPos;
    peg$parsews();
    s2 = peg$parsesetcps();
    if (s2 === peg$FAILED) {
      s2 = peg$parsesetbpm();
      if (s2 === peg$FAILED) {
        s2 = peg$parsehush();
      }
    }
    if (s2 !== peg$FAILED) {
      peg$parsews();
      peg$savedPos = s0;
      s0 = peg$f32(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesetcps() {
    var s0, s1, s3;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c37) {
      s1 = peg$c37;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e45);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsenumber();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f33(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesetbpm() {
    var s0, s1, s3;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c38) {
      s1 = peg$c38;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e46);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsenumber();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f34(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsehush() {
    var s0, s1;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c39) {
      s1 = peg$c39;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e47);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f35();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsestatement() {
    var s0;
    s0 = peg$parsemini_definition();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecommand();
    }
    return s0;
  }
  var AtomStub = function(source) {
    this.type_ = "atom";
    this.source_ = source;
    this.location_ = location();
  };
  var PatternStub = function(source, alignment) {
    this.type_ = "pattern";
    this.arguments_ = { alignment };
    this.source_ = source;
  };
  var OperatorStub = function(name, args, source) {
    this.type_ = name;
    this.arguments_ = args;
    this.source_ = source;
  };
  var ElementStub = function(source, options2) {
    this.type_ = "element";
    this.source_ = source;
    this.options_ = options2;
    this.location_ = location();
  };
  var CommandStub = function(name, options2) {
    this.type_ = "command";
    this.name_ = name;
    this.options_ = options2;
  };
  peg$result = peg$startRuleFunction();
  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }
    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}
function getDefaultExportFromCjs(x2) {
  return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
var fraction$1 = { exports: {} };
/**
 * @license Fraction.js v4.2.0 05/03/2022
 * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
 *
 * Copyright (c) 2021, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/
(function(module2, exports2) {
  (function(root) {
    var MAX_CYCLE_LEN = 2e3;
    var P = {
      "s": 1,
      "n": 0,
      "d": 1
    };
    function assign(n, s) {
      if (isNaN(n = parseInt(n, 10))) {
        throw Fraction2["InvalidParameter"];
      }
      return n * s;
    }
    function newFraction(n, d) {
      if (d === 0) {
        throw Fraction2["DivisionByZero"];
      }
      var f = Object.create(Fraction2.prototype);
      f["s"] = n < 0 ? -1 : 1;
      n = n < 0 ? -n : n;
      var a2 = gcd2(n, d);
      f["n"] = n / a2;
      f["d"] = d / a2;
      return f;
    }
    function factorize(num) {
      var factors = {};
      var n = num;
      var i = 2;
      var s = 4;
      while (s <= n) {
        while (n % i === 0) {
          n /= i;
          factors[i] = (factors[i] || 0) + 1;
        }
        s += 1 + 2 * i++;
      }
      if (n !== num) {
        if (n > 1)
          factors[n] = (factors[n] || 0) + 1;
      } else {
        factors[num] = (factors[num] || 0) + 1;
      }
      return factors;
    }
    var parse = function(p1, p2) {
      var n = 0, d = 1, s = 1;
      var v = 0, w2 = 0, x2 = 0, y2 = 1, z = 1;
      var A = 0, B = 1;
      var C = 1, D = 1;
      var N = 1e7;
      var M;
      if (p1 === void 0 || p1 === null)
        ;
      else if (p2 !== void 0) {
        n = p1;
        d = p2;
        s = n * d;
        if (n % 1 !== 0 || d % 1 !== 0) {
          throw Fraction2["NonIntegerParameter"];
        }
      } else
        switch (typeof p1) {
          case "object": {
            if ("d" in p1 && "n" in p1) {
              n = p1["n"];
              d = p1["d"];
              if ("s" in p1)
                n *= p1["s"];
            } else if (0 in p1) {
              n = p1[0];
              if (1 in p1)
                d = p1[1];
            } else {
              throw Fraction2["InvalidParameter"];
            }
            s = n * d;
            break;
          }
          case "number": {
            if (p1 < 0) {
              s = p1;
              p1 = -p1;
            }
            if (p1 % 1 === 0) {
              n = p1;
            } else if (p1 > 0) {
              if (p1 >= 1) {
                z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
                p1 /= z;
              }
              while (B <= N && D <= N) {
                M = (A + C) / (B + D);
                if (p1 === M) {
                  if (B + D <= N) {
                    n = A + C;
                    d = B + D;
                  } else if (D > B) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                  break;
                } else {
                  if (p1 > M) {
                    A += C;
                    B += D;
                  } else {
                    C += A;
                    D += B;
                  }
                  if (B > N) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                }
              }
              n *= z;
            } else if (isNaN(p1) || isNaN(p2)) {
              d = n = NaN;
            }
            break;
          }
          case "string": {
            B = p1.match(/\d+|./g);
            if (B === null)
              throw Fraction2["InvalidParameter"];
            if (B[A] === "-") {
              s = -1;
              A++;
            } else if (B[A] === "+") {
              A++;
            }
            if (B.length === A + 1) {
              w2 = assign(B[A++], s);
            } else if (B[A + 1] === "." || B[A] === ".") {
              if (B[A] !== ".") {
                v = assign(B[A++], s);
              }
              A++;
              if (A + 1 === B.length || B[A + 1] === "(" && B[A + 3] === ")" || B[A + 1] === "'" && B[A + 3] === "'") {
                w2 = assign(B[A], s);
                y2 = Math.pow(10, B[A].length);
                A++;
              }
              if (B[A] === "(" && B[A + 2] === ")" || B[A] === "'" && B[A + 2] === "'") {
                x2 = assign(B[A + 1], s);
                z = Math.pow(10, B[A + 1].length) - 1;
                A += 3;
              }
            } else if (B[A + 1] === "/" || B[A + 1] === ":") {
              w2 = assign(B[A], s);
              y2 = assign(B[A + 2], 1);
              A += 3;
            } else if (B[A + 3] === "/" && B[A + 1] === " ") {
              v = assign(B[A], s);
              w2 = assign(B[A + 2], s);
              y2 = assign(B[A + 4], 1);
              A += 5;
            }
            if (B.length <= A) {
              d = y2 * z;
              s = n = x2 + d * v + z * w2;
              break;
            }
          }
          default:
            throw Fraction2["InvalidParameter"];
        }
      if (d === 0) {
        throw Fraction2["DivisionByZero"];
      }
      P["s"] = s < 0 ? -1 : 1;
      P["n"] = Math.abs(n);
      P["d"] = Math.abs(d);
    };
    function modpow(b, e, m) {
      var r2 = 1;
      for (; e > 0; b = b * b % m, e >>= 1) {
        if (e & 1) {
          r2 = r2 * b % m;
        }
      }
      return r2;
    }
    function cycleLen(n, d) {
      for (; d % 2 === 0; d /= 2) {
      }
      for (; d % 5 === 0; d /= 5) {
      }
      if (d === 1)
        return 0;
      var rem = 10 % d;
      var t = 1;
      for (; rem !== 1; t++) {
        rem = rem * 10 % d;
        if (t > MAX_CYCLE_LEN)
          return 0;
      }
      return t;
    }
    function cycleStart(n, d, len) {
      var rem1 = 1;
      var rem2 = modpow(10, len, d);
      for (var t = 0; t < 300; t++) {
        if (rem1 === rem2)
          return t;
        rem1 = rem1 * 10 % d;
        rem2 = rem2 * 10 % d;
      }
      return 0;
    }
    function gcd2(a2, b) {
      if (!a2)
        return b;
      if (!b)
        return a2;
      while (1) {
        a2 %= b;
        if (!a2)
          return b;
        b %= a2;
        if (!b)
          return a2;
      }
    }
    function Fraction2(a2, b) {
      parse(a2, b);
      if (this instanceof Fraction2) {
        a2 = gcd2(P["d"], P["n"]);
        this["s"] = P["s"];
        this["n"] = P["n"] / a2;
        this["d"] = P["d"] / a2;
      } else {
        return newFraction(P["s"] * P["n"], P["d"]);
      }
    }
    Fraction2["DivisionByZero"] = new Error("Division by Zero");
    Fraction2["InvalidParameter"] = new Error("Invalid argument");
    Fraction2["NonIntegerParameter"] = new Error("Parameters must be integer");
    Fraction2.prototype = {
      "s": 1,
      "n": 0,
      "d": 1,
      "abs": function() {
        return newFraction(this["n"], this["d"]);
      },
      "neg": function() {
        return newFraction(-this["s"] * this["n"], this["d"]);
      },
      "add": function(a2, b) {
        parse(a2, b);
        return newFraction(
          this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
          this["d"] * P["d"]
        );
      },
      "sub": function(a2, b) {
        parse(a2, b);
        return newFraction(
          this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
          this["d"] * P["d"]
        );
      },
      "mul": function(a2, b) {
        parse(a2, b);
        return newFraction(
          this["s"] * P["s"] * this["n"] * P["n"],
          this["d"] * P["d"]
        );
      },
      "div": function(a2, b) {
        parse(a2, b);
        return newFraction(
          this["s"] * P["s"] * this["n"] * P["d"],
          this["d"] * P["n"]
        );
      },
      "clone": function() {
        return newFraction(this["s"] * this["n"], this["d"]);
      },
      "mod": function(a2, b) {
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction2(NaN);
        }
        if (a2 === void 0) {
          return newFraction(this["s"] * this["n"] % this["d"], 1);
        }
        parse(a2, b);
        if (0 === P["n"] && 0 === this["d"]) {
          throw Fraction2["DivisionByZero"];
        }
        return newFraction(
          this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]),
          P["d"] * this["d"]
        );
      },
      "gcd": function(a2, b) {
        parse(a2, b);
        return newFraction(gcd2(P["n"], this["n"]) * gcd2(P["d"], this["d"]), P["d"] * this["d"]);
      },
      "lcm": function(a2, b) {
        parse(a2, b);
        if (P["n"] === 0 && this["n"] === 0) {
          return newFraction(0, 1);
        }
        return newFraction(P["n"] * this["n"], gcd2(P["n"], this["n"]) * gcd2(P["d"], this["d"]));
      },
      "ceil": function(places) {
        places = Math.pow(10, places || 0);
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction2(NaN);
        }
        return newFraction(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
      },
      "floor": function(places) {
        places = Math.pow(10, places || 0);
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction2(NaN);
        }
        return newFraction(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
      },
      "round": function(places) {
        places = Math.pow(10, places || 0);
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction2(NaN);
        }
        return newFraction(Math.round(places * this["s"] * this["n"] / this["d"]), places);
      },
      "inverse": function() {
        return newFraction(this["s"] * this["d"], this["n"]);
      },
      "pow": function(a2, b) {
        parse(a2, b);
        if (P["d"] === 1) {
          if (P["s"] < 0) {
            return newFraction(Math.pow(this["s"] * this["d"], P["n"]), Math.pow(this["n"], P["n"]));
          } else {
            return newFraction(Math.pow(this["s"] * this["n"], P["n"]), Math.pow(this["d"], P["n"]));
          }
        }
        if (this["s"] < 0)
          return null;
        var N = factorize(this["n"]);
        var D = factorize(this["d"]);
        var n = 1;
        var d = 1;
        for (var k in N) {
          if (k === "1")
            continue;
          if (k === "0") {
            n = 0;
            break;
          }
          N[k] *= P["n"];
          if (N[k] % P["d"] === 0) {
            N[k] /= P["d"];
          } else
            return null;
          n *= Math.pow(k, N[k]);
        }
        for (var k in D) {
          if (k === "1")
            continue;
          D[k] *= P["n"];
          if (D[k] % P["d"] === 0) {
            D[k] /= P["d"];
          } else
            return null;
          d *= Math.pow(k, D[k]);
        }
        if (P["s"] < 0) {
          return newFraction(d, n);
        }
        return newFraction(n, d);
      },
      "equals": function(a2, b) {
        parse(a2, b);
        return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
      },
      "compare": function(a2, b) {
        parse(a2, b);
        var t = this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"];
        return (0 < t) - (t < 0);
      },
      "simplify": function(eps) {
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return this;
        }
        eps = eps || 1e-3;
        var thisABS = this["abs"]();
        var cont = thisABS["toContinued"]();
        for (var i = 1; i < cont.length; i++) {
          var s = newFraction(cont[i - 1], 1);
          for (var k = i - 2; k >= 0; k--) {
            s = s["inverse"]()["add"](cont[k]);
          }
          if (s["sub"](thisABS)["abs"]().valueOf() < eps) {
            return s["mul"](this["s"]);
          }
        }
        return this;
      },
      "divisible": function(a2, b) {
        parse(a2, b);
        return !(!(P["n"] * this["d"]) || this["n"] * P["d"] % (P["n"] * this["d"]));
      },
      "valueOf": function() {
        return this["s"] * this["n"] / this["d"];
      },
      "toFraction": function(excludeWhole) {
        var whole, str = "";
        var n = this["n"];
        var d = this["d"];
        if (this["s"] < 0) {
          str += "-";
        }
        if (d === 1) {
          str += n;
        } else {
          if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
            str += whole;
            str += " ";
            n %= d;
          }
          str += n;
          str += "/";
          str += d;
        }
        return str;
      },
      "toLatex": function(excludeWhole) {
        var whole, str = "";
        var n = this["n"];
        var d = this["d"];
        if (this["s"] < 0) {
          str += "-";
        }
        if (d === 1) {
          str += n;
        } else {
          if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
            str += whole;
            n %= d;
          }
          str += "\\frac{";
          str += n;
          str += "}{";
          str += d;
          str += "}";
        }
        return str;
      },
      "toContinued": function() {
        var t;
        var a2 = this["n"];
        var b = this["d"];
        var res = [];
        if (isNaN(a2) || isNaN(b)) {
          return res;
        }
        do {
          res.push(Math.floor(a2 / b));
          t = a2 % b;
          a2 = b;
          b = t;
        } while (a2 !== 1);
        return res;
      },
      "toString": function(dec) {
        var N = this["n"];
        var D = this["d"];
        if (isNaN(N) || isNaN(D)) {
          return "NaN";
        }
        dec = dec || 15;
        var cycLen = cycleLen(N, D);
        var cycOff = cycleStart(N, D, cycLen);
        var str = this["s"] < 0 ? "-" : "";
        str += N / D | 0;
        N %= D;
        N *= 10;
        if (N)
          str += ".";
        if (cycLen) {
          for (var i = cycOff; i--; ) {
            str += N / D | 0;
            N %= D;
            N *= 10;
          }
          str += "(";
          for (var i = cycLen; i--; ) {
            str += N / D | 0;
            N %= D;
            N *= 10;
          }
          str += ")";
        } else {
          for (var i = dec; N && i--; ) {
            str += N / D | 0;
            N %= D;
            N *= 10;
          }
        }
        return str;
      }
    };
    {
      Object.defineProperty(Fraction2, "__esModule", { "value": true });
      Fraction2["default"] = Fraction2;
      Fraction2["Fraction"] = Fraction2;
      module2["exports"] = Fraction2;
    }
  })();
})(fraction$1);
const Fraction = /* @__PURE__ */ getDefaultExportFromCjs(fraction$1.exports);
Fraction.prototype.sam = function() {
  return this.floor();
};
Fraction.prototype.nextSam = function() {
  return this.sam().add(1);
};
Fraction.prototype.wholeCycle = function() {
  return new TimeSpan(this.sam(), this.nextSam());
};
Fraction.prototype.cyclePos = function() {
  return this.sub(this.sam());
};
Fraction.prototype.lt = function(other) {
  return this.compare(other) < 0;
};
Fraction.prototype.gt = function(other) {
  return this.compare(other) > 0;
};
Fraction.prototype.lte = function(other) {
  return this.compare(other) <= 0;
};
Fraction.prototype.gte = function(other) {
  return this.compare(other) >= 0;
};
Fraction.prototype.eq = function(other) {
  return this.compare(other) == 0;
};
Fraction.prototype.max = function(other) {
  return this.gt(other) ? this : other;
};
Fraction.prototype.min = function(other) {
  return this.lt(other) ? this : other;
};
Fraction.prototype.show = function() {
  return this.s * this.n + "/" + this.d;
};
Fraction.prototype.or = function(other) {
  return this.eq(0) ? other : this;
};
const fraction = (n) => {
  return Fraction(n);
};
const gcd = (...fractions) => {
  return fractions.reduce((gcd2, fraction2) => gcd2.gcd(fraction2), fraction(1));
};
fraction._original = Fraction;
class TimeSpan {
  constructor(begin, end) {
    this.begin = fraction(begin);
    this.end = fraction(end);
  }
  get spanCycles() {
    const spans = [];
    var begin = this.begin;
    const end = this.end;
    const end_sam = end.sam();
    if (begin.equals(end)) {
      return [new TimeSpan(begin, end)];
    }
    while (end.gt(begin)) {
      if (begin.sam().equals(end_sam)) {
        spans.push(new TimeSpan(begin, this.end));
        break;
      }
      const next_begin = begin.nextSam();
      spans.push(new TimeSpan(begin, next_begin));
      begin = next_begin;
    }
    return spans;
  }
  get duration() {
    return this.end.sub(this.begin);
  }
  cycleArc() {
    const b = this.begin.cyclePos();
    const e = b.add(this.duration);
    return new TimeSpan(b, e);
  }
  withTime(func_time) {
    return new TimeSpan(func_time(this.begin), func_time(this.end));
  }
  withEnd(func_time) {
    return new TimeSpan(this.begin, func_time(this.end));
  }
  withCycle(func_time) {
    const sam = this.begin.sam();
    const b = sam.add(func_time(this.begin.sub(sam)));
    const e = sam.add(func_time(this.end.sub(sam)));
    return new TimeSpan(b, e);
  }
  intersection(other) {
    const intersect_begin = this.begin.max(other.begin);
    const intersect_end = this.end.min(other.end);
    if (intersect_begin.gt(intersect_end)) {
      return void 0;
    }
    if (intersect_begin.equals(intersect_end)) {
      if (intersect_begin.equals(this.end) && this.begin.lt(this.end)) {
        return void 0;
      }
      if (intersect_begin.equals(other.end) && other.begin.lt(other.end)) {
        return void 0;
      }
    }
    return new TimeSpan(intersect_begin, intersect_end);
  }
  intersection_e(other) {
    const result = this.intersection(other);
    if (result == void 0) {
      throw "TimeSpans do not intersect";
    }
    return result;
  }
  midpoint() {
    return this.begin.add(this.duration.div(fraction(2)));
  }
  equals(other) {
    return this.begin.equals(other.begin) && this.end.equals(other.end);
  }
  show() {
    return this.begin.show() + " \u2192 " + this.end.show();
  }
}
class Hap {
  constructor(whole, part, value, context = {}, stateful = false) {
    this.whole = whole;
    this.part = part;
    this.value = value;
    this.context = context;
    this.stateful = stateful;
    if (stateful) {
      console.assert(typeof this.value === "function", "Stateful values must be functions");
    }
  }
  get duration() {
    return this.whole.end.sub(this.whole.begin);
  }
  wholeOrPart() {
    return this.whole ? this.whole : this.part;
  }
  withSpan(func) {
    const whole = this.whole ? func(this.whole) : void 0;
    return new Hap(whole, func(this.part), this.value, this.context);
  }
  withValue(func) {
    return new Hap(this.whole, this.part, func(this.value), this.context);
  }
  hasOnset() {
    return this.whole != void 0 && this.whole.begin.equals(this.part.begin);
  }
  resolveState(state) {
    if (this.stateful && this.hasOnset()) {
      console.log("stateful");
      const func = this.value;
      const [newState, newValue] = func(state);
      return [newState, new Hap(this.whole, this.part, newValue, this.context, false)];
    }
    return [state, this];
  }
  spanEquals(other) {
    return this.whole == void 0 && other.whole == void 0 || this.whole.equals(other.whole);
  }
  equals(other) {
    return this.spanEquals(other) && this.part.equals(other.part) && this.value === other.value;
  }
  show(compact = false) {
    const value = typeof this.value === "object" ? compact ? JSON.stringify(this.value).slice(1, -1).replaceAll('"', "").replaceAll(",", " ") : JSON.stringify(this.value) : this.value;
    var spans = "";
    if (this.whole == void 0) {
      spans = "~" + this.part.show;
    } else {
      var is_whole = this.whole.begin.equals(this.part.begin) && this.whole.end.equals(this.part.end);
      if (!this.whole.begin.equals(this.part.begin)) {
        spans = this.whole.begin.show() + " \u21DC ";
      }
      if (!is_whole) {
        spans += "(";
      }
      spans += this.part.show();
      if (!is_whole) {
        spans += ")";
      }
      if (!this.whole.end.equals(this.part.end)) {
        spans += " \u21DD " + this.whole.end.show();
      }
    }
    return "[ " + spans + " | " + value + " ]";
  }
  showWhole(compact = false) {
    return `${this.whole == void 0 ? "~" : this.whole.show()}: ${typeof this.value === "object" ? compact ? JSON.stringify(this.value).slice(1, -1).replaceAll('"', "").replaceAll(",", " ") : JSON.stringify(this.value) : this.value}`;
  }
  combineContext(b) {
    const a2 = this;
    return { ...a2.context, ...b.context, locations: (a2.context.locations || []).concat(b.context.locations || []) };
  }
  setContext(context) {
    return new Hap(this.whole, this.part, this.value, context);
  }
}
class State {
  constructor(span, controls2 = {}) {
    this.span = span;
    this.controls = controls2;
  }
  setSpan(span) {
    return new State(span, this.controls);
  }
  withSpan(func) {
    return this.setSpan(func(this.span));
  }
  setControls(controls2) {
    return new State(this.span, controls2);
  }
}
const isNote = (name) => /^[a-gA-G][#bs]*[0-9]?$/.test(name);
const tokenizeNote = (note) => {
  var _a;
  if (typeof note !== "string") {
    return [];
  }
  const [pc, acc = "", oct] = ((_a = note.match(/^([a-gA-G])([#bs]*)([0-9])?$/)) == null ? void 0 : _a.slice(1)) || [];
  if (!pc) {
    return [];
  }
  return [pc, acc, oct ? Number(oct) : void 0];
};
const toMidi = (note) => {
  const [pc, acc, oct = 3] = tokenizeNote(note);
  if (!pc) {
    throw new Error('not a note: "' + note + '"');
  }
  const chroma = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[pc.toLowerCase()];
  const offset = (acc == null ? void 0 : acc.split("").reduce((o, char) => o + { "#": 1, b: -1, s: 1 }[char], 0)) || 0;
  return (Number(oct) + 1) * 12 + chroma + offset;
};
const freqToMidi = (freq) => {
  return 12 * Math.log(freq / 440) / Math.LN2 + 69;
};
const _mod = (n, m) => (n % m + m) % m;
const rotate = (arr, n) => arr.slice(n).concat(arr.slice(0, n));
const removeUndefineds = (xs) => xs.filter((x2) => x2 != void 0);
const flatten = (arr) => [].concat(...arr);
const id = (a2) => a2;
const listRange = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => i + min);
function curry(func, overload, arity = func.length) {
  const fn = function curried(...args) {
    if (args.length >= arity) {
      return func.apply(this, args);
    } else {
      const partial = function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
      if (overload) {
        overload(partial, args);
      }
      return partial;
    }
  };
  if (overload) {
    overload(fn, []);
  }
  return fn;
}
function parseNumeral(numOrString) {
  const asNumber = Number(numOrString);
  if (!isNaN(asNumber)) {
    return asNumber;
  }
  if (isNote(numOrString)) {
    return toMidi(numOrString);
  }
  throw new Error(`cannot parse as numeral: "${numOrString}"`);
}
function mapArgs(fn, mapFn) {
  return (...args) => fn(...args.map(mapFn));
}
function numeralArgs(fn) {
  return mapArgs(fn, parseNumeral);
}
function unionWithObj(a2, b, func) {
  if (typeof (b == null ? void 0 : b.value) === "number") {
    const numKeys = Object.keys(a2).filter((k) => typeof a2[k] === "number");
    const numerals = Object.fromEntries(numKeys.map((k) => [k, b.value]));
    b = Object.assign(b, numerals);
    delete b.value;
  }
  const common = Object.keys(a2).filter((k) => Object.keys(b).includes(k));
  return Object.assign({}, a2, b, Object.fromEntries(common.map((k) => [k, func(a2[k], b[k])])));
}
curry((a2, b) => a2 * b);
curry((f, anyFunctor) => anyFunctor.map(f));
function drawLine(pat, chars = 60) {
  let cycle = 0;
  let pos = fraction(0);
  let lines = [""];
  let emptyLine = "";
  while (lines[0].length < chars) {
    const haps = pat.queryArc(cycle, cycle + 1);
    const durations = haps.filter((hap) => hap.hasOnset()).map((hap) => hap.duration);
    const charFraction = gcd(...durations);
    const totalSlots = charFraction.inverse();
    lines = lines.map((line) => line + "|");
    emptyLine += "|";
    for (let i = 0; i < totalSlots; i++) {
      const [begin, end] = [pos, pos.add(charFraction)];
      const matches = haps.filter((hap) => hap.whole.begin.lte(begin) && hap.whole.end.gte(end));
      const missingLines = matches.length - lines.length;
      if (missingLines > 0) {
        lines = lines.concat(Array(missingLines).fill(emptyLine));
      }
      lines = lines.map((line, i2) => {
        const hap = matches[i2];
        if (hap) {
          const isOnset = hap.whole.begin.eq(begin);
          const char = isOnset ? "" + hap.value : "-";
          return line + char;
        }
        return line + ".";
      });
      emptyLine += ".";
      pos = pos.add(charFraction);
    }
    cycle++;
  }
  return lines.join("\n");
}
const logKey = "strudel.log";
function logger(message, type, data = {}) {
  console.log(`%c${message}`, "background-color: black;color:white;border-radius:15px");
  if (typeof document !== "undefined" && typeof CustomEvent !== "undefined") {
    document.dispatchEvent(
      new CustomEvent(logKey, {
        detail: {
          message,
          type,
          data
        }
      })
    );
  }
}
logger.key = logKey;
class Pattern {
  constructor(query) {
    __publicField(this, "_Pattern", true);
    this.query = query;
  }
  withValue(func) {
    return new Pattern((state) => this.query(state).map((hap) => hap.withValue(func)));
  }
  fmap(func) {
    return this.withValue(func);
  }
  appWhole(whole_func, pat_val) {
    const pat_func = this;
    const query = function(state) {
      const hap_funcs = pat_func.query(state);
      const hap_vals = pat_val.query(state);
      const apply = function(hap_func, hap_val) {
        const s = hap_func.part.intersection(hap_val.part);
        if (s == void 0) {
          return void 0;
        }
        return new Hap(
          whole_func(hap_func.whole, hap_val.whole),
          s,
          hap_func.value(hap_val.value),
          hap_val.combineContext(hap_func)
        );
      };
      return flatten(
        hap_funcs.map((hap_func) => removeUndefineds(hap_vals.map((hap_val) => apply(hap_func, hap_val))))
      );
    };
    return new Pattern(query);
  }
  appBoth(pat_val) {
    const whole_func = function(span_a, span_b) {
      if (span_a == void 0 || span_b == void 0) {
        return void 0;
      }
      return span_a.intersection_e(span_b);
    };
    return this.appWhole(whole_func, pat_val);
  }
  appLeft(pat_val) {
    const pat_func = this;
    const query = function(state) {
      const haps = [];
      for (const hap_func of pat_func.query(state)) {
        const hap_vals = pat_val.query(state.setSpan(hap_func.wholeOrPart()));
        for (const hap_val of hap_vals) {
          const new_whole = hap_func.whole;
          const new_part = hap_func.part.intersection(hap_val.part);
          if (new_part) {
            const new_value = hap_func.value(hap_val.value);
            const new_context = hap_val.combineContext(hap_func);
            const hap = new Hap(new_whole, new_part, new_value, new_context);
            haps.push(hap);
          }
        }
      }
      return haps;
    };
    return new Pattern(query);
  }
  appRight(pat_val) {
    const pat_func = this;
    const query = function(state) {
      const haps = [];
      for (const hap_val of pat_val.query(state)) {
        const hap_funcs = pat_func.query(state.setSpan(hap_val.wholeOrPart()));
        for (const hap_func of hap_funcs) {
          const new_whole = hap_val.whole;
          const new_part = hap_func.part.intersection(hap_val.part);
          if (new_part) {
            const new_value = hap_func.value(hap_val.value);
            const new_context = hap_val.combineContext(hap_func);
            const hap = new Hap(new_whole, new_part, new_value, new_context);
            haps.push(hap);
          }
        }
      }
      return haps;
    };
    return new Pattern(query);
  }
  bindWhole(choose_whole, func) {
    const pat_val = this;
    const query = function(state) {
      const withWhole = function(a2, b) {
        return new Hap(
          choose_whole(a2.whole, b.whole),
          b.part,
          b.value,
          Object.assign({}, a2.context, b.context, {
            locations: (a2.context.locations || []).concat(b.context.locations || [])
          })
        );
      };
      const match = function(a2) {
        return func(a2.value).query(state.setSpan(a2.part)).map((b) => withWhole(a2, b));
      };
      return flatten(pat_val.query(state).map((a2) => match(a2)));
    };
    return new Pattern(query);
  }
  bind(func) {
    const whole_func = function(a2, b) {
      if (a2 == void 0 || b == void 0) {
        return void 0;
      }
      return a2.intersection_e(b);
    };
    return this.bindWhole(whole_func, func);
  }
  join() {
    return this.bind(id);
  }
  outerBind(func) {
    return this.bindWhole((a2) => a2, func);
  }
  outerJoin() {
    return this.outerBind(id);
  }
  innerBind(func) {
    return this.bindWhole((_, b) => b, func);
  }
  innerJoin() {
    return this.innerBind(id);
  }
  trigJoin(cycleZero = false) {
    const pat_of_pats = this;
    return new Pattern((state) => {
      return pat_of_pats.discreteOnly().query(state).map((outer_hap) => {
        return outer_hap.value.late(cycleZero ? outer_hap.whole.begin : outer_hap.whole.begin.cyclePos()).query(state).map(
          (inner_hap) => new Hap(
            inner_hap.whole ? inner_hap.whole.intersection(outer_hap.whole) : void 0,
            inner_hap.part.intersection(outer_hap.part),
            inner_hap.value
          ).setContext(outer_hap.combineContext(inner_hap))
        ).filter((hap) => hap.part);
      }).flat();
    });
  }
  trigzeroJoin() {
    return this.trigJoin(true);
  }
  squeezeJoin() {
    const pat_of_pats = this;
    function query(state) {
      const haps = pat_of_pats.discreteOnly().query(state);
      function flatHap(outerHap) {
        const inner_pat = outerHap.value._focusSpan(outerHap.wholeOrPart());
        const innerHaps = inner_pat.query(state.setSpan(outerHap.part));
        function munge(outer, inner) {
          let whole = void 0;
          if (inner.whole && outer.whole) {
            whole = inner.whole.intersection(outer.whole);
            if (!whole) {
              return void 0;
            }
          }
          const part = inner.part.intersection(outer.part);
          if (!part) {
            return void 0;
          }
          const context = inner.combineContext(outer);
          return new Hap(whole, part, inner.value, context);
        }
        return innerHaps.map((innerHap) => munge(outerHap, innerHap));
      }
      const result = flatten(haps.map(flatHap));
      return result.filter((x2) => x2);
    }
    return new Pattern(query);
  }
  squeezeBind(func) {
    return this.fmap(func).squeezeJoin();
  }
  queryArc(begin, end) {
    return this.query(new State(new TimeSpan(begin, end)));
  }
  splitQueries() {
    const pat = this;
    const q = (state) => {
      return flatten(state.span.spanCycles.map((subspan) => pat.query(state.setSpan(subspan))));
    };
    return new Pattern(q);
  }
  withQuerySpan(func) {
    return new Pattern((state) => this.query(state.withSpan(func)));
  }
  withQuerySpanMaybe(func) {
    const pat = this;
    return new Pattern((state) => {
      const newState = state.withSpan(func);
      if (!newState.span) {
        return [];
      }
      return pat.query(newState);
    });
  }
  withQueryTime(func) {
    return new Pattern((state) => this.query(state.withSpan((span) => span.withTime(func))));
  }
  withHapSpan(func) {
    return new Pattern((state) => this.query(state).map((hap) => hap.withSpan(func)));
  }
  withHapTime(func) {
    return this.withHapSpan((span) => span.withTime(func));
  }
  withHaps(func) {
    return new Pattern((state) => func(this.query(state)));
  }
  withHap(func) {
    return this.withHaps((haps) => haps.map(func));
  }
  setContext(context) {
    return this.withHap((hap) => hap.setContext(context));
  }
  withContext(func) {
    return this.withHap((hap) => hap.setContext(func(hap.context)));
  }
  stripContext() {
    return this.withHap((hap) => hap.setContext({}));
  }
  withLocation(start, end) {
    const location = {
      start: { line: start[0], column: start[1], offset: start[2] },
      end: { line: end[0], column: end[1], offset: end[2] }
    };
    return this.withContext((context) => {
      const locations = (context.locations || []).concat([location]);
      return { ...context, locations };
    });
  }
  withMiniLocation(start, end) {
    const offset = {
      start: { line: start[0], column: start[1], offset: start[2] },
      end: { line: end[0], column: end[1], offset: end[2] }
    };
    return this.withContext((context) => {
      let locations = context.locations || [];
      locations = locations.map(({ start: start2, end: end2 }) => {
        const colOffset = start2.line === 1 ? offset.start.column : 0;
        return {
          start: {
            ...start2,
            line: start2.line - 1 + (offset.start.line - 1) + 1,
            column: start2.column - 1 + colOffset
          },
          end: {
            ...end2,
            line: end2.line - 1 + (offset.start.line - 1) + 1,
            column: end2.column - 1 + colOffset
          }
        };
      });
      return { ...context, locations };
    });
  }
  filterHaps(hap_test) {
    return new Pattern((state) => this.query(state).filter(hap_test));
  }
  filterValues(value_test) {
    return new Pattern((state) => this.query(state).filter((hap) => value_test(hap.value)));
  }
  removeUndefineds() {
    return this.filterValues((val) => val != void 0);
  }
  onsetsOnly() {
    return this.filterHaps((hap) => hap.hasOnset());
  }
  discreteOnly() {
    return this.filterHaps((hap) => hap.whole);
  }
  defragmentHaps() {
    const pat = this.discreteOnly();
    return pat.withHaps((haps) => {
      const result = [];
      for (var i = 0; i < haps.length; ++i) {
        var searching = true;
        var a2 = haps[i];
        while (searching) {
          const a_value = JSON.stringify(haps[i].value);
          var found = false;
          for (var j = i + 1; j < haps.length; j++) {
            const b = haps[j];
            if (a2.whole.equals(b.whole)) {
              if (a2.part.begin.eq(b.part.end)) {
                if (a_value === JSON.stringify(b.value)) {
                  a2 = new Hap(a2.whole, new TimeSpan(b.part.begin, a2.part.end), a2.value);
                  haps.splice(j, 1);
                  found = true;
                  break;
                }
              } else if (b.part.begin.eq(a2.part.end)) {
                if (a_value == JSON.stringify(b.value)) {
                  a2 = new Hap(a2.whole, new TimeSpan(a2.part.begin, b.part.end), a2.value);
                  haps.splice(j, 1);
                  found = true;
                  break;
                }
              }
            }
          }
          searching = found;
        }
        result.push(a2);
      }
      return result;
    });
  }
  firstCycle(with_context = false) {
    var self = this;
    if (!with_context) {
      self = self.stripContext();
    }
    return self.query(new State(new TimeSpan(fraction(0), fraction(1))));
  }
  get firstCycleValues() {
    return this.firstCycle().map((hap) => hap.value);
  }
  get showFirstCycle() {
    return this.firstCycle().map(
      (hap) => `${hap.value}: ${hap.whole.begin.toFraction()} - ${hap.whole.end.toFraction()}`
    );
  }
  sortHapsByPart() {
    return this.withHaps(
      (haps) => haps.sort(
        (a2, b) => a2.part.begin.sub(b.part.begin).or(a2.part.end.sub(b.part.end)).or(a2.whole.begin.sub(b.whole.begin).or(a2.whole.end.sub(b.whole.end)))
      )
    );
  }
  asNumber() {
    return this.fmap(parseNumeral);
  }
  _opIn(other, func) {
    return this.fmap(func).appLeft(reify(other));
  }
  _opOut(other, func) {
    return this.fmap(func).appRight(reify(other));
  }
  _opMix(other, func) {
    return this.fmap(func).appBoth(reify(other));
  }
  _opSqueeze(other, func) {
    const otherPat = reify(other);
    return this.fmap((a2) => otherPat.fmap((b) => func(a2)(b))).squeezeJoin();
  }
  _opSqueezeOut(other, func) {
    const thisPat = this;
    const otherPat = reify(other);
    return otherPat.fmap((a2) => thisPat.fmap((b) => func(b)(a2))).squeezeJoin();
  }
  _opTrig(other, func) {
    const otherPat = reify(other);
    return otherPat.fmap((b) => this.fmap((a2) => func(a2)(b))).trigJoin();
  }
  _opTrigzero(other, func) {
    const otherPat = reify(other);
    return otherPat.fmap((b) => this.fmap((a2) => func(a2)(b))).trigzeroJoin();
  }
  layer(...funcs) {
    return stack(...funcs.map((func) => func(this)));
  }
  superimpose(...funcs) {
    return this.stack(...funcs.map((func) => func(this)));
  }
  stack(...pats) {
    return stack(this, ...pats);
  }
  sequence(...pats) {
    return sequence(this, ...pats);
  }
  seq(...pats) {
    return sequence(this, ...pats);
  }
  cat(...pats) {
    return cat(this, ...pats);
  }
  fastcat(...pats) {
    return fastcat(this, ...pats);
  }
  slowcat(...pats) {
    return slowcat(this, ...pats);
  }
  onTrigger(onTrigger, dominant = true) {
    return this.withHap(
      (hap) => hap.setContext({
        ...hap.context,
        onTrigger: (...args) => {
          if (!dominant && hap.context.onTrigger) {
            hap.context.onTrigger(...args);
          }
          onTrigger(...args);
        },
        dominantTrigger: dominant
      })
    );
  }
  log(func = (_, hap) => `[hap] ${hap.showWhole(true)}`) {
    return this.onTrigger((...args) => logger(func(...args)), false);
  }
  logValues(func = id) {
    return this.log((_, hap) => func(hap.value));
  }
  drawLine() {
    console.log(drawLine(this));
    return this;
  }
}
function groupHapsBy(eq, haps) {
  let groups = [];
  haps.forEach((hap) => {
    const match = groups.findIndex(([other]) => eq(hap, other));
    if (match === -1) {
      groups.push([hap]);
    } else {
      groups[match].push(hap);
    }
  });
  return groups;
}
const congruent = (a2, b) => a2.spanEquals(b);
Pattern.prototype.collect = function() {
  return this.withHaps(
    (haps) => groupHapsBy(congruent, haps).map((_haps) => new Hap(_haps[0].whole, _haps[0].part, _haps, {}))
  );
};
Pattern.prototype.arpWith = function(func) {
  return this.collect().fmap((v) => reify(func(v))).squeezeJoin().withHap((h2) => new Hap(h2.whole, h2.part, h2.value.value, h2.combineContext(h2.value)));
};
Pattern.prototype.arp = function(pat) {
  return this.arpWith((haps) => pat.fmap((i) => haps[i % haps.length]));
};
function _composeOp(a2, b, func) {
  function _nonFunctionObject(x2) {
    return x2 instanceof Object && !(x2 instanceof Function);
  }
  if (_nonFunctionObject(a2) || _nonFunctionObject(b)) {
    if (!_nonFunctionObject(a2)) {
      a2 = { value: a2 };
    }
    if (!_nonFunctionObject(b)) {
      b = { value: b };
    }
    return unionWithObj(a2, b, func);
  }
  return func(a2, b);
}
(function() {
  const composers = {
    set: [(a2, b) => b],
    keep: [(a2) => a2],
    keepif: [(a2, b) => b ? a2 : void 0],
    add: [numeralArgs((a2, b) => a2 + b)],
    sub: [numeralArgs((a2, b) => a2 - b)],
    mul: [numeralArgs((a2, b) => a2 * b)],
    div: [numeralArgs((a2, b) => a2 / b)],
    mod: [numeralArgs(_mod)],
    pow: [numeralArgs(Math.pow)],
    band: [numeralArgs((a2, b) => a2 & b)],
    bor: [numeralArgs((a2, b) => a2 | b)],
    bxor: [numeralArgs((a2, b) => a2 ^ b)],
    blshift: [numeralArgs((a2, b) => a2 << b)],
    brshift: [numeralArgs((a2, b) => a2 >> b)],
    lt: [(a2, b) => a2 < b],
    gt: [(a2, b) => a2 > b],
    lte: [(a2, b) => a2 <= b],
    gte: [(a2, b) => a2 >= b],
    eq: [(a2, b) => a2 == b],
    eqt: [(a2, b) => a2 === b],
    ne: [(a2, b) => a2 != b],
    net: [(a2, b) => a2 !== b],
    and: [(a2, b) => a2 && b],
    or: [(a2, b) => a2 || b],
    func: [(a2, b) => b(a2)]
  };
  const hows = ["In", "Out", "Mix", "Squeeze", "SqueezeOut", "Trig", "Trigzero"];
  for (const [what, [op, preprocess]] of Object.entries(composers)) {
    Pattern.prototype["_" + what] = function(value) {
      return this.fmap((x2) => op(x2, value));
    };
    Object.defineProperty(Pattern.prototype, what, {
      get: function() {
        const pat = this;
        const wrapper = (...other) => pat[what]["in"](...other);
        for (const how of hows) {
          wrapper[how.toLowerCase()] = function(...other) {
            var howpat = pat;
            other = sequence(other);
            if (preprocess) {
              howpat = preprocess(howpat);
              other = preprocess(other);
            }
            var result;
            if (what === "keepif") {
              result = howpat["_op" + how](other, (a2) => (b) => op(a2, b));
              result = result.removeUndefineds();
            } else {
              result = howpat["_op" + how](other, (a2) => (b) => _composeOp(a2, b, op));
            }
            return result;
          };
        }
        wrapper.squeezein = wrapper.squeeze;
        return wrapper;
      }
    });
    for (const how of hows) {
      Pattern.prototype[how.toLowerCase()] = function(...args) {
        return this.set[how.toLowerCase()](args);
      };
    }
  }
  Pattern.prototype.struct = function(...args) {
    return this.keepif.out(...args);
  };
  Pattern.prototype.structAll = function(...args) {
    return this.keep.out(...args);
  };
  Pattern.prototype.mask = function(...args) {
    return this.keepif.in(...args);
  };
  Pattern.prototype.maskAll = function(...args) {
    return this.keep.in(...args);
  };
  Pattern.prototype.reset = function(...args) {
    return this.keepif.trig(...args);
  };
  Pattern.prototype.resetAll = function(...args) {
    return this.keep.trig(...args);
  };
  Pattern.prototype.restart = function(...args) {
    return this.keepif.trigzero(...args);
  };
  Pattern.prototype.restartAll = function(...args) {
    return this.keep.trigzero(...args);
  };
})();
const polyrhythm = stack;
const pr = stack;
Pattern.prototype.factories = {
  pure,
  stack,
  slowcat,
  fastcat,
  cat,
  timeCat,
  sequence,
  seq,
  polymeter,
  pm,
  polyrhythm,
  pr
};
const silence = new Pattern(() => []);
function pure(value) {
  function query(state) {
    return state.span.spanCycles.map((subspan) => new Hap(fraction(subspan.begin).wholeCycle(), subspan, value));
  }
  return new Pattern(query);
}
function isPattern(thing) {
  const is = thing instanceof Pattern || (thing == null ? void 0 : thing._Pattern);
  return is;
}
function reify(thing) {
  if (isPattern(thing)) {
    return thing;
  }
  return pure(thing);
}
function stack(...pats) {
  pats = pats.map((pat) => Array.isArray(pat) ? sequence(...pat) : reify(pat));
  const query = (state) => flatten(pats.map((pat) => pat.query(state)));
  return new Pattern(query);
}
function slowcat(...pats) {
  pats = pats.map((pat) => Array.isArray(pat) ? sequence(...pat) : reify(pat));
  const query = function(state) {
    const span = state.span;
    const pat_n = _mod(span.begin.sam(), pats.length);
    const pat = pats[pat_n];
    if (!pat) {
      return [];
    }
    const offset = span.begin.floor().sub(span.begin.div(pats.length).floor());
    return pat.withHapTime((t) => t.add(offset)).query(state.setSpan(span.withTime((t) => t.sub(offset))));
  };
  return new Pattern(query).splitQueries();
}
function slowcatPrime(...pats) {
  pats = pats.map(reify);
  const query = function(state) {
    const pat_n = Math.floor(state.span.begin) % pats.length;
    const pat = pats[pat_n];
    return (pat == null ? void 0 : pat.query(state)) || [];
  };
  return new Pattern(query).splitQueries();
}
function fastcat(...pats) {
  return slowcat(...pats)._fast(pats.length);
}
function cat(...pats) {
  return slowcat(...pats);
}
function timeCat(...timepats) {
  const total = timepats.map((a2) => a2[0]).reduce((a2, b) => a2.add(b), fraction(0));
  let begin = fraction(0);
  const pats = [];
  for (const [time2, pat] of timepats) {
    const end = begin.add(time2);
    pats.push(reify(pat)._compress(begin.div(total), end.div(total)));
    begin = end;
  }
  return stack(...pats);
}
function sequence(...pats) {
  return fastcat(...pats);
}
function seq(...pats) {
  return fastcat(...pats);
}
function _sequenceCount(x2) {
  if (Array.isArray(x2)) {
    if (x2.length == 0) {
      return [silence, 0];
    }
    if (x2.length == 1) {
      return _sequenceCount(x2[0]);
    }
    return [fastcat(...x2.map((a2) => _sequenceCount(a2)[0])), x2.length];
  }
  return [reify(x2), 1];
}
function polymeterSteps(steps, ...args) {
  const seqs = args.map((a2) => _sequenceCount(a2));
  if (seqs.length == 0) {
    return silence;
  }
  if (steps == 0) {
    steps = seqs[0][1];
  }
  const pats = [];
  for (const seq2 of seqs) {
    if (seq2[1] == 0) {
      continue;
    }
    if (steps == seq2[1]) {
      pats.push(seq2[0]);
    } else {
      pats.push(seq2[0]._fast(fraction(steps).div(fraction(seq2[1]))));
    }
  }
  return stack(...pats);
}
function polymeter(...args) {
  return polymeterSteps(0, ...args);
}
function pm(...args) {
  polymeter(...args);
}
curry((a2, b) => reify(b).mask(a2));
curry((a2, b) => reify(b).struct(a2));
curry((a2, b) => reify(b).superimpose(...a2));
curry((a2, b) => reify(b).set(a2));
curry((a2, b) => reify(b).keep(a2));
curry((a2, b) => reify(b).keepif(a2));
curry((a2, b) => reify(b).add(a2));
curry((a2, b) => reify(b).sub(a2));
curry((a2, b) => reify(b).mul(a2));
curry((a2, b) => reify(b).div(a2));
curry((a2, b) => reify(b).mod(a2));
curry((a2, b) => reify(b).pow(a2));
curry((a2, b) => reify(b).band(a2));
curry((a2, b) => reify(b).bor(a2));
curry((a2, b) => reify(b).bxor(a2));
curry((a2, b) => reify(b).blshift(a2));
curry((a2, b) => reify(b).brshift(a2));
curry((a2, b) => reify(b).lt(a2));
curry((a2, b) => reify(b).gt(a2));
curry((a2, b) => reify(b).lte(a2));
curry((a2, b) => reify(b).gte(a2));
curry((a2, b) => reify(b).eq(a2));
curry((a2, b) => reify(b).eqt(a2));
curry((a2, b) => reify(b).ne(a2));
curry((a2, b) => reify(b).net(a2));
curry((a2, b) => reify(b).and(a2));
curry((a2, b) => reify(b).or(a2));
curry((a2, b) => reify(b).func(a2));
function register(name, func) {
  if (Array.isArray(name)) {
    const result = {};
    for (const name_item of name) {
      result[name_item] = register(name_item, func);
    }
    return result;
  }
  const arity = func.length;
  var pfunc;
  pfunc = function(...args) {
    args = args.map(reify);
    const pat = args[args.length - 1];
    if (arity === 1) {
      return func(pat);
    }
    const [left, ...right] = args.slice(0, -1);
    let mapFn = (...args2) => {
      Array(arity - 1).fill().map((_, i) => {
        var _a;
        return (_a = args2[i]) != null ? _a : void 0;
      });
      return func(...args2, pat);
    };
    mapFn = curry(mapFn, null, arity - 1);
    return right.reduce((acc, p) => acc.appLeft(p), left.fmap(mapFn)).innerJoin();
  };
  Pattern.prototype[name] = function(...args) {
    args = args.map(reify);
    if (arity === 2 && args.length !== 1) {
      args = [sequence(...args)];
    } else if (arity !== args.length + 1) {
      throw new Error(`.${name}() expects ${arity - 1} inputs but got ${args.length}.`);
    }
    return pfunc(...args, this);
  };
  if (arity > 1) {
    Pattern.prototype["_" + name] = function(...args) {
      return func(...args, this);
    };
  }
  return curry(pfunc, null, arity);
}
register("round", function(pat) {
  return pat.asNumber().fmap((v) => Math.round(v));
});
register("floor", function(pat) {
  return pat.asNumber().fmap((v) => Math.floor(v));
});
register("ceil", function(pat) {
  return pat.asNumber().fmap((v) => Math.ceil(v));
});
register("toBipolar", function(pat) {
  return pat.fmap((x2) => x2 * 2 - 1);
});
register("fromBipolar", function(pat) {
  return pat.fmap((x2) => (x2 + 1) / 2);
});
register("range", function(min, max, pat) {
  return pat.mul(max - min).add(min);
});
register("rangex", function(min, max, pat) {
  return pat._range(Math.log(min), Math.log(max)).fmap(Math.exp);
});
register("range2", function(min, max, pat) {
  return pat.fromBipolar()._range(min, max);
});
register("compress", function(b, e, pat) {
  if (b.gt(e) || b.gt(1) || e.gt(1) || b.lt(0) || e.lt(0)) {
    return silence;
  }
  return pat._fastGap(fraction(1).div(e.sub(b)))._late(b);
});
register(["compressSpan", "compressspan"], function(span, pat) {
  return pat._compress(span.begin, span.end);
});
register(["fastGap", "fastgap"], function(factor, pat) {
  const qf = function(span) {
    const cycle = span.begin.sam();
    const bpos = span.begin.sub(cycle).mul(factor).min(1);
    const epos = span.end.sub(cycle).mul(factor).min(1);
    if (bpos >= 1) {
      return void 0;
    }
    return new TimeSpan(cycle.add(bpos), cycle.add(epos));
  };
  const ef = function(hap) {
    const begin = hap.part.begin;
    const end = hap.part.end;
    const cycle = begin.sam();
    const beginPos = begin.sub(cycle).div(factor).min(1);
    const endPos = end.sub(cycle).div(factor).min(1);
    const newPart = new TimeSpan(cycle.add(beginPos), cycle.add(endPos));
    const newWhole = !hap.whole ? void 0 : new TimeSpan(
      newPart.begin.sub(begin.sub(hap.whole.begin).div(factor)),
      newPart.end.add(hap.whole.end.sub(end).div(factor))
    );
    return new Hap(newWhole, newPart, hap.value, hap.context);
  };
  return pat.withQuerySpanMaybe(qf).withHap(ef).splitQueries();
});
register("focus", function(b, e, pat) {
  return pat._fast(fraction(1).div(e.sub(b))).late(b.cyclePos());
});
register(["focusSpan", "focusspan"], function(span, pat) {
  return pat._focus(span.begin, span.end);
});
register("ply", function(factor, pat) {
  return pat.fmap((x2) => pure(x2)._fast(factor)).squeezeJoin();
});
register(["fast", "density"], function(factor, pat) {
  factor = fraction(factor);
  const fastQuery = pat.withQueryTime((t) => t.mul(factor));
  return fastQuery.withHapTime((t) => t.div(factor));
});
register(["slow", "sparsity"], function(factor, pat) {
  return pat._fast(fraction(1).div(factor));
});
register("inside", function(factor, f, pat) {
  return f(pat._slow(factor))._fast(factor);
});
register("outside", function(factor, f, pat) {
  return f(pat._fast(factor))._slow(factor);
});
register("lastOf", function(n, func, pat) {
  const pats = Array(n - 1).fill(pat);
  pats.push(func(pat));
  return slowcatPrime(...pats);
});
register(["firstOf", "every"], function(n, func, pat) {
  const pats = Array(n - 1).fill(pat);
  pats.unshift(func(pat));
  return slowcatPrime(...pats);
});
register("apply", function(func, pat) {
  return func(pat);
});
register("cpm", function(cpm, pat) {
  return pat._fast(cpm / 60);
});
register("early", function(offset, pat) {
  offset = fraction(offset);
  return pat.withQueryTime((t) => t.add(offset)).withHapTime((t) => t.sub(offset));
});
register("late", function(offset, pat) {
  offset = fraction(offset);
  return pat._early(fraction(0).sub(offset));
});
register("zoom", function(s, e, pat) {
  e = fraction(e);
  s = fraction(s);
  const d = e.sub(s);
  return pat.withQuerySpan((span) => span.withCycle((t) => t.mul(d).add(s))).withHapSpan((span) => span.withCycle((t) => t.sub(s).div(d))).splitQueries();
});
register(["zoomArc", "zoomarc"], function(a2, pat) {
  return pat.zoom(a2.begin, a2.end);
});
register("linger", function(t, pat) {
  if (t == 0) {
    return silence;
  } else if (t < 0) {
    return pat._zoom(t.add(1), 1)._slow(t);
  }
  return pat._zoom(0, t)._slow(t);
});
register("segment", function(rate, pat) {
  return pat.struct(pure(true)._fast(rate));
});
register(["invert", "inv"], function(pat) {
  return pat.fmap((x2) => !x2);
});
register("when", function(on, func, pat) {
  return on ? func(pat) : pat;
});
register("off", function(time_pat, func, pat) {
  return stack(pat, func(pat.late(time_pat)));
});
register("brak", function(pat) {
  return pat.when(slowcat(false, true), (x2) => fastcat(x2, silence)._late(0.25));
});
const rev = register("rev", function(pat) {
  const query = function(state) {
    const span = state.span;
    const cycle = span.begin.sam();
    const next_cycle = span.begin.nextSam();
    const reflect = function(to_reflect) {
      const reflected = to_reflect.withTime((time2) => cycle.add(next_cycle.sub(time2)));
      const tmp = reflected.begin;
      reflected.begin = reflected.end;
      reflected.end = tmp;
      return reflected;
    };
    const haps = pat.query(state.setSpan(reflect(span)));
    return haps.map((hap) => hap.withSpan(reflect));
  };
  return new Pattern(query).splitQueries();
});
register("hush", function(pat) {
  return silence;
});
register("palindrome", function(pat) {
  return pat.every(2, rev);
});
register(["juxBy", "juxby"], function(by, func, pat) {
  by /= 2;
  const elem_or = function(dict, key, dflt) {
    if (key in dict) {
      return dict[key];
    }
    return dflt;
  };
  const left = pat.withValue((val) => Object.assign({}, val, { pan: elem_or(val, "pan", 0.5) - by }));
  const right = pat.withValue((val) => Object.assign({}, val, { pan: elem_or(val, "pan", 0.5) + by }));
  return stack(left, func(right));
});
register("jux", function(func, pat) {
  return pat._juxBy(1, func, pat);
});
register(["stutWith", "stutwith"], function(times, time2, func, pat) {
  return stack(...listRange(0, times - 1).map((i) => func(pat.late(fraction(time2).mul(i)), i)));
});
register("stut", function(times, feedback, time2, pat) {
  return pat._stutWith(times, time2, (pat2, i) => pat2.velocity(Math.pow(feedback, i)));
});
register(["echoWith", "echowith"], function(times, time2, func, pat) {
  return stack(...listRange(0, times - 1).map((i) => func(pat.late(fraction(time2).mul(i)), i)));
});
register("echo", function(times, time2, feedback, pat) {
  return pat._echoWith(times, time2, (pat2, i) => pat2.velocity(Math.pow(feedback, i)));
});
const _iter = function(times, pat, back = false) {
  times = fraction(times);
  return slowcat(
    ...listRange(0, times.sub(1)).map(
      (i) => back ? pat.late(fraction(i).div(times)) : pat.early(fraction(i).div(times))
    )
  );
};
register("iter", function(times, pat) {
  return _iter(times, pat, false);
});
register(["iterBack", "iterback"], function(times, pat) {
  return _iter(times, pat, true);
});
const _chunk = function(n, func, pat, back = false) {
  const binary = Array(n - 1).fill(false);
  binary.unshift(true);
  const binary_pat = _iter(n, sequence(...binary), back);
  return pat.when(binary_pat, func);
};
register("chunk", function(n, func, pat) {
  return _chunk(n, func, pat, false);
});
register(["chunkBack", "chunkback"], function(n, func, pat) {
  return _chunk(n, func, pat, true);
});
register("bypass", function(on, pat) {
  on = Boolean(parseInt(on));
  return on ? silence : this;
});
register("duration", function(value, pat) {
  return pat.withHapSpan((span) => new TimeSpan(span.begin, span.begin.add(value)));
});
register(["color", "colour"], function(color, pat) {
  return pat.withContext((context) => ({ ...context, color }));
});
register("velocity", function(velocity, pat) {
  return pat.withContext((context) => ({ ...context, velocity: (context.velocity || 1) * velocity }));
});
register("legato", function(value, pat) {
  return pat.withHapSpan((span) => new TimeSpan(span.begin, span.begin.add(span.end.sub(span.begin).mul(value))));
});
register("chop", function(n, pat) {
  const slices = Array.from({ length: n }, (x2, i) => i);
  const slice_objects = slices.map((i) => ({ begin: i / n, end: (i + 1) / n }));
  const func = function(o) {
    return sequence(slice_objects.map((slice_o) => Object.assign({}, o, slice_o)));
  };
  return pat.squeezeBind(func);
});
register("striate", function(n, pat) {
  const slices = Array.from({ length: n }, (x2, i) => i);
  const slice_objects = slices.map((i) => ({ begin: i / n, end: (i + 1) / n }));
  const slicePat = slowcat(...slice_objects);
  return pat.set(slicePat)._fast(n);
});
const _loopAt = function(factor, pat, cps = 1) {
  return pat.speed(1 / factor * cps).unit("c").slow(factor);
};
register(["loopAt", "loopat"], function(factor, pat) {
  return _loopAt(factor, pat, 1);
});
register(["loopAtCps", "loopatcps"], function(factor, cps, pat) {
  return _loopAt(factor, pat, cps);
});
const controls = {};
const generic_params = [
  ["s", "s", "sound"],
  ["f", "n", "The note or sample number to choose for a synth or sampleset"],
  ["f", "note", "The note or pitch to play a sound or synth with"],
  ["f", "accelerate", "a pattern of numbers that speed up (or slow down) samples while they play."],
  [
    "f",
    "gain",
    "a pattern of numbers that specify volume. Values less than 1 make the sound quieter. Values greater than 1 make the sound louder. For the linear equivalent, see @amp@."
  ],
  ["f", "amp", "like @gain@, but linear."],
  [
    "f",
    "attack",
    "a pattern of numbers to specify the attack time (in seconds) of an envelope applied to each sample."
  ],
  ["f", "bank", "selects sound bank to use"],
  ["f", "decay", ""],
  ["f", "sustain", ""],
  [
    "f",
    "release",
    "a pattern of numbers to specify the release time (in seconds) of an envelope applied to each sample."
  ],
  [
    "f",
    "hold",
    "a pattern of numbers to specify the hold time (in seconds) of an envelope applied to each sample. Only takes effect if `attack` and `release` are also specified."
  ],
  ["f", "bandf", "A pattern of numbers from 0 to 1. Sets the center frequency of the band-pass filter."],
  ["f", "bandq", "a pattern of anumbers from 0 to 1. Sets the q-factor of the band-pass filter."],
  [
    "f",
    "begin",
    "a pattern of numbers from 0 to 1. Skips the beginning of each sample, e.g. `0.25` to cut off the first quarter from each sample."
  ],
  [
    "f",
    "end",
    "the same as `begin`, but cuts the end off samples, shortening them; e.g. `0.75` to cut off the last quarter of each sample."
  ],
  ["f", "loop", "loops the sample (from `begin` to `end`) the specified number of times."],
  [
    "f",
    "crush",
    "bit crushing, a pattern of numbers from 1 (for drastic reduction in bit-depth) to 16 (for barely no reduction)."
  ],
  [
    "f",
    "coarse",
    "fake-resampling, a pattern of numbers for lowering the sample rate, i.e. 1 for original 2 for half, 3 for a third and so on."
  ],
  ["i", "channel", "choose the channel the pattern is sent to in superdirt"],
  [
    "i",
    "cut",
    "In the style of classic drum-machines, `cut` will stop a playing sample as soon as another samples with in same cutgroup is to be played. An example would be an open hi-hat followed by a closed one, essentially muting the open."
  ],
  ["f", "cutoff", "a pattern of numbers from 0 to 1. Applies the cutoff frequency of the low-pass filter."],
  [
    "f",
    "hcutoff",
    "a pattern of numbers from 0 to 1. Applies the cutoff frequency of the high-pass filter. Also has alias @hpf@"
  ],
  [
    "f",
    "hresonance",
    "a pattern of numbers from 0 to 1. Applies the resonance of the high-pass filter. Has alias @hpq@"
  ],
  ["f", "resonance", "a pattern of numbers from 0 to 1. Specifies the resonance of the low-pass filter."],
  ["f", "djf", "DJ filter, below 0.5 is low pass filter, above is high pass filter."],
  ["f", "delay", "a pattern of numbers from 0 to 1. Sets the level of the delay signal."],
  ["f", "delayfeedback", "a pattern of numbers from 0 to 1. Sets the amount of delay feedback."],
  ["f", "delaytime", "a pattern of numbers from 0 to 1. Sets the length of the delay."],
  [
    "f",
    "lock",
    "A pattern of numbers. Specifies whether delaytime is calculated relative to cps. When set to 1, delaytime is a direct multiple of a cycle."
  ],
  ["f", "detune", ""],
  [
    "f",
    "dry",
    "when set to `1` will disable all reverb for this pattern. See `room` and `size` for more information about reverb."
  ],
  [
    "f",
    "fadeTime",
    "Used when using begin/end or chop/striate and friends, to change the fade out time of the 'grain' envelope."
  ],
  [
    "f",
    "fadeInTime",
    "As with fadeTime, but controls the fade in time of the grain envelope. Not used if the grain begins at position 0 in the sample."
  ],
  ["f", "freq", ""],
  ["f", "gate", ""],
  ["f", "leslie", ""],
  ["f", "lrate", ""],
  ["f", "lsize", ""],
  ["f", "degree", ""],
  ["f", "mtranspose", ""],
  ["f", "ctranspose", ""],
  ["f", "harmonic", ""],
  ["f", "stepsPerOctave", ""],
  ["f", "octaveR", ""],
  [
    "f",
    "nudge",
    "Nudges events into the future by the specified number of seconds. Negative numbers work up to a point as well (due to internal latency)"
  ],
  ["i", "octave", ""],
  ["f", "offset", ""],
  [
    "i",
    "orbit",
    "a pattern of numbers. An `orbit` is a global parameter context for patterns. Patterns with the same orbit will share hardware output bus offset and global effects, e.g. reverb and delay. The maximum number of orbits is specified in the superdirt startup, numbers higher than maximum will wrap around."
  ],
  ["f", "overgain", ""],
  ["f", "overshape", ""],
  [
    "f",
    "pan",
    "a pattern of numbers between 0 and 1, from left to right (assuming stereo), once round a circle (assuming multichannel)"
  ],
  [
    "f",
    "panspan",
    "a pattern of numbers between -inf and inf, which controls how much multichannel output is fanned out (negative is backwards ordering)"
  ],
  [
    "f",
    "pansplay",
    "a pattern of numbers between 0.0 and 1.0, which controls the multichannel spread range (multichannel only)"
  ],
  [
    "f",
    "panwidth",
    "a pattern of numbers between 0.0 and inf, which controls how much each channel is distributed over neighbours (multichannel only)"
  ],
  [
    "f",
    "panorient",
    "a pattern of numbers between -1.0 and 1.0, which controls the relative position of the centre pan in a pair of adjacent speakers (multichannel only)"
  ],
  ["f", "rate", "used in SuperDirt softsynths as a control rate or 'speed'"],
  ["f", "slide", ""],
  ["f", "semitone", ""],
  ["f", "voice", ""],
  ["f", "room", "a pattern of numbers from 0 to 1. Sets the level of reverb."],
  [
    "f",
    "size",
    "a pattern of numbers from 0 to 1. Sets the perceptual size (reverb time) of the `room` to be used in reverb."
  ],
  [
    "f",
    "roomsize",
    "a pattern of numbers from 0 to 1. Sets the perceptual size (reverb time) of the `room` to be used in reverb."
  ],
  [
    "f",
    "shape",
    "wave shaping distortion, a pattern of numbers from 0 for no distortion up to 1 for loads of distortion."
  ],
  [
    "f",
    "speed",
    "a pattern of numbers which changes the speed of sample playback, i.e. a cheap way of changing pitch. Negative values will play the sample backwards!"
  ],
  [
    "s",
    "unit",
    'used in conjunction with `speed`, accepts values of "r" (rate, default behavior), "c" (cycles), or "s" (seconds). Using `unit "c"` means `speed` will be interpreted in units of cycles, e.g. `speed "1"` means samples will be stretched to fill a cycle. Using `unit "s"` means the playback speed will be adjusted so that the duration is the number of seconds specified by `speed`.'
  ],
  ["f", "squiz", ""],
  ["f", "stutterdepth", ""],
  ["f", "stuttertime", ""],
  ["f", "timescale", ""],
  ["f", "timescalewin", ""],
  [
    "s",
    "vowel",
    "formant filter to make things sound like vowels, a pattern of either `a`, `e`, `i`, `o` or `u`. Use a rest (`~`) for no effect."
  ],
  ["f", "waveloss", ""],
  ["f", "dur", ""],
  ["f", "expression", ""],
  ["f", "sustainpedal", ""],
  ["f", "tremolodepth", "Tremolo Audio DSP effect | params are 'tremolorate' and 'tremolodepth'"],
  ["f", "tremolorate", "Tremolo Audio DSP effect | params are 'tremolorate' and 'tremolodepth'"],
  ["f", "phaserdepth", "Phaser Audio DSP effect | params are 'phaserrate' and 'phaserdepth'"],
  ["f", "phaserrate", "Phaser Audio DSP effect | params are 'phaserrate' and 'phaserdepth'"],
  ["f", "fshift", "frequency shifter"],
  ["f", "fshiftnote", "frequency shifter"],
  ["f", "fshiftphase", "frequency shifter"],
  ["f", "triode", "tube distortion"],
  ["f", "krush", "shape/bass enhancer"],
  ["f", "kcutoff", ""],
  ["f", "octer", "octaver effect"],
  ["f", "octersub", "octaver effect"],
  ["f", "octersubsub", "octaver effect"],
  ["f", "ring", "ring modulation"],
  ["f", "ringf", "ring modulation"],
  ["f", "ringdf", "ring modulation"],
  ["f", "distort", "noisy fuzzy distortion"],
  ["f", "freeze", "Spectral freeze"],
  ["f", "xsdelay", ""],
  ["f", "tsdelay", ""],
  ["f", "real", "Spectral conform"],
  ["f", "imag", ""],
  ["f", "enhance", "Spectral enhance"],
  ["f", "partials", ""],
  ["f", "comb", "Spectral comb"],
  ["f", "smear", "Spectral smear"],
  ["f", "scram", "Spectral scramble"],
  ["f", "binshift", "Spectral binshift"],
  ["f", "hbrick", "High pass sort of spectral filter"],
  ["f", "lbrick", "Low pass sort of spectral filter"],
  ["f", "midichan", ""],
  ["f", "control", ""],
  ["f", "ccn", ""],
  ["f", "ccv", ""],
  ["f", "polyTouch", ""],
  ["f", "midibend", ""],
  ["f", "miditouch", ""],
  ["f", "ctlNum", ""],
  ["f", "frameRate", ""],
  ["f", "frames", ""],
  ["f", "hours", ""],
  ["s", "midicmd", ""],
  ["f", "minutes", ""],
  ["f", "progNum", ""],
  ["f", "seconds", ""],
  ["f", "songPtr", ""],
  ["f", "uid", ""],
  ["f", "val", ""],
  ["f", "cps", ""],
  ["f", "clip", ""]
];
const _name = (name, ...pats) => sequence(...pats).withValue((x2) => ({ [name]: x2 }));
const _setter = (func, name) => function(...pats) {
  if (!pats.length) {
    return this.fmap((value) => ({ [name]: value }));
  }
  return this.set(func(...pats));
};
generic_params.forEach(([type, name, description]) => {
  controls[name] = (...pats) => _name(name, ...pats);
  Pattern.prototype[name] = _setter(controls[name], name);
});
controls.createParam = (name) => {
  const func = (...pats) => _name(name, ...pats);
  Pattern.prototype[name] = _setter(func, name);
  return (...pats) => _name(name, ...pats);
};
controls.createParams = (...names) => names.reduce((acc, name) => Object.assign(acc, { [name]: controls.createParam(name) }), {});
function bjorklund(slots, pulses) {
  var pattern = [], count = [], remainder = [pulses], divisor = slots - pulses, level = 0, build_pattern = function(lv) {
    if (lv == -1) {
      pattern.push(0);
    } else if (lv == -2) {
      pattern.push(1);
    } else {
      for (var x2 = 0; x2 < count[lv]; x2++) {
        build_pattern(lv - 1);
      }
      if (remainder[lv]) {
        build_pattern(lv - 2);
      }
    }
  };
  while (remainder[level] > 1) {
    count.push(Math.floor(divisor / remainder[level]));
    remainder.push(divisor % remainder[level]);
    divisor = remainder[level];
    level++;
  }
  count.push(divisor);
  build_pattern(level);
  return pattern.reverse();
}
var bjork = function(m, k) {
  if (m > k)
    return bjorklund(m, k);
  else
    return bjorklund(k, m);
};
const _euclidRot = function(pulses, steps, rotation) {
  const b = bjork(steps, pulses);
  if (rotation) {
    return rotate(b, -rotation);
  }
  return b;
};
register("euclid", function(pulses, steps, pat) {
  return pat.struct(_euclidRot(steps, pulses, 0));
});
register(["euclidrot", "euclidRot"], function(pulses, steps, rotation, pat) {
  return pat.struct(_euclidRot(steps, pulses, rotation));
});
const _euclidLegato = function(pulses, steps, rotation, pat) {
  const bin_pat = _euclidRot(pulses, steps, rotation);
  const firstOne = bin_pat.indexOf(1);
  const gapless = rotate(bin_pat, firstOne).join("").split("1").slice(1).map((s) => [s.length + 1, true]);
  return pat.struct(timeCat(...gapless)).late(fraction(firstOne).div(steps));
};
register(["euclidLegato"], function(pulses, steps, pat) {
  return _euclidLegato(pulses, steps, 0, pat);
});
register(["euclidLegatoRot"], function(pulses, steps, rotation, pat) {
  return _euclidLegato(pulses, steps, rotation, pat);
});
const signal = (func) => {
  const query = (state) => [new Hap(void 0, state.span, func(state.span.midpoint()))];
  return new Pattern(query);
};
const isaw = signal((t) => 1 - t % 1);
const isaw2 = isaw.toBipolar();
const saw = signal((t) => t % 1);
const saw2 = saw.toBipolar();
const sine2 = signal((t) => Math.sin(Math.PI * 2 * t));
const sine = sine2.fromBipolar();
sine._early(fraction(1).div(4));
sine2._early(fraction(1).div(4));
const square = signal((t) => Math.floor(t * 2 % 2));
square.toBipolar();
fastcat(isaw, saw);
fastcat(isaw2, saw2);
const time = signal(id);
const xorwise = (x2) => {
  const a2 = x2 << 13 ^ x2;
  const b = a2 >> 17 ^ a2;
  return b << 5 ^ b;
};
const _frac = (x2) => x2 - Math.trunc(x2);
const timeToIntSeed = (x2) => xorwise(Math.trunc(_frac(x2 / 300) * 536870912));
const intSeedToRand = (x2) => x2 % 536870912 / 536870912;
const timeToRand = (x2) => Math.abs(intSeedToRand(timeToIntSeed(x2)));
const rand = signal(timeToRand);
rand.toBipolar();
const _brandBy = (p) => rand.fmap((x2) => x2 < p);
_brandBy(0.5);
const __chooseWith = (pat, xs) => {
  xs = xs.map(reify);
  if (xs.length == 0) {
    return silence;
  }
  return pat.range(0, xs.length).fmap((i) => xs[Math.floor(i)]);
};
const chooseWith = (pat, xs) => {
  return __chooseWith(pat, xs).outerJoin();
};
const chooseInWith = (pat, xs) => {
  return __chooseWith(pat, xs).innerJoin();
};
Pattern.prototype.choose = function(...xs) {
  return chooseWith(this, xs);
};
Pattern.prototype.choose2 = function(...xs) {
  return chooseWith(this.fromBipolar(), xs);
};
const chooseCycles = (...xs) => chooseInWith(rand.segment(1), xs);
const perlinWith = (pat) => {
  const pata = pat.fmap(Math.floor);
  const patb = pat.fmap((t) => Math.floor(t) + 1);
  const smootherStep = (x2) => 6 * x2 ** 5 - 15 * x2 ** 4 + 10 * x2 ** 3;
  const interp = (x2) => (a2) => (b) => a2 + smootherStep(x2) * (b - a2);
  return pat.sub(pata).fmap(interp).appBoth(pata.fmap(timeToRand)).appBoth(patb.fmap(timeToRand));
};
perlinWith(time.fmap((v) => Number(v)));
register(
  "degradeByWith",
  (withPat, x2, pat) => pat.fmap((a2) => (_) => a2).appLeft(withPat.filterValues((v) => v > x2))
);
register("degradeBy", function(x2, pat) {
  return pat._degradeByWith(rand, x2);
});
register("degrade", (pat) => pat._degradeBy(0.5));
register("undegradeBy", function(x2, pat) {
  return pat._degradeByWith(
    rand.fmap((r2) => 1 - r2),
    x2
  );
});
register("undegrade", (pat) => pat._undegradeBy(0.5));
register("sometimesBy", function(patx, func, pat) {
  return reify(patx).fmap((x2) => stack(pat._degradeBy(x2), func(pat._undegradeBy(1 - x2)))).innerJoin();
});
register("sometimes", function(func, pat) {
  return pat._sometimesBy(0.5, func);
});
register("someCyclesBy", function(patx, func, pat) {
  return reify(patx).fmap(
    (x2) => stack(
      pat._degradeByWith(rand._segment(1), x2),
      func(pat._degradeByWith(rand.fmap((r2) => 1 - r2)._segment(1), 1 - x2))
    )
  ).innerJoin();
});
register("someCycles", function(func, pat) {
  return pat._someCyclesBy(0.5, func);
});
register("often", function(func, pat) {
  return pat.sometimesBy(0.75, func);
});
register("rarely", function(func, pat) {
  return pat.sometimesBy(0.25, func);
});
register("almostNever", function(func, pat) {
  return pat.sometimesBy(0.1, func);
});
register("almostAlways", function(func, pat) {
  return pat.sometimesBy(0.9, func);
});
register("never", function(_, pat) {
  return pat;
});
register("always", function(func, pat) {
  return func(pat);
});
let synth;
try {
  synth = window == null ? void 0 : window.speechSynthesis;
} catch (err) {
  console.warn("cannot use window: not in browser?");
}
let allVoices = synth == null ? void 0 : synth.getVoices();
function triggerSpeech(words, lang, voice) {
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(words);
  utterance.lang = lang;
  allVoices = synth.getVoices();
  const voices = allVoices.filter((v) => v.lang.includes(lang));
  if (typeof voice === "number") {
    utterance.voice = voices[voice % voices.length];
  } else if (typeof voice === "string") {
    utterance.voice = voices.find((voice2) => voice2.name === voice2);
  }
  speechSynthesis.speak(utterance);
}
register("speak", function(lang, voice, pat) {
  return pat.onTrigger((_, hap) => {
    triggerSpeech(hap.value, lang, voice);
  });
});
function getTime() {
  {
    throw new Error("no time set! use setTime to define a time source");
  }
}
const getDrawContext = (id2 = "test-canvas") => {
  let canvas = document.querySelector("#" + id2);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = id2;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style = "pointer-events:none;width:100%;height:100%;position:fixed;top:0;left:0;z-index:5";
    document.body.prepend(canvas);
  }
  return canvas.getContext("2d");
};
Pattern.prototype.draw = function(callback, { from, to, onQuery }) {
  if (window.strudelAnimation) {
    cancelAnimationFrame(window.strudelAnimation);
  }
  const ctx = getDrawContext();
  let cycle, events = [];
  const animate = (time2) => {
    const t = getTime();
    if (from !== void 0 && to !== void 0) {
      const currentCycle = Math.floor(t);
      if (cycle !== currentCycle) {
        cycle = currentCycle;
        const begin = currentCycle + from;
        const end = currentCycle + to;
        setTimeout(() => {
          events = this.query(new State(new TimeSpan(begin, end))).filter(Boolean).filter((event) => event.part.begin.equals(event.whole.begin));
          onQuery == null ? void 0 : onQuery(events);
        }, 0);
      }
    }
    callback(ctx, events, t, time2);
    window.strudelAnimation = requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
  return this;
};
const { createParams } = controls;
let clearColor = "#22222210";
Pattern.prototype.animate = function({ callback, sync = false, smear: smear2 = 0.5 } = {}) {
  window.frame && cancelAnimationFrame(window.frame);
  const ctx = getDrawContext();
  const { clientWidth: ww, clientHeight: wh } = ctx.canvas;
  let smearPart = smear2 === 0 ? "99" : Number((1 - smear2) * 100).toFixed(0);
  smearPart = smearPart.length === 1 ? `0${smearPart}` : smearPart;
  clearColor = `#200010${smearPart}`;
  const render = (t) => {
    let frame;
    t = Math.round(t);
    frame = this.slow(1e3).queryArc(t, t);
    ctx.fillStyle = clearColor;
    ctx.fillRect(0, 0, ww, wh);
    frame.forEach((f) => {
      let { x: x2, y: y2, w: w2, h: h2, s, r: r2, a: a2 = 0, fill: fill2 = "darkseagreen" } = f.value;
      w2 *= ww;
      h2 *= wh;
      if (r2 !== void 0 && a2 !== void 0) {
        const radians = a2 * 2 * Math.PI;
        const [cx, cy] = [(ww - w2) / 2, (wh - h2) / 2];
        x2 = cx + Math.cos(radians) * r2 * cx;
        y2 = cy + Math.sin(radians) * r2 * cy;
      } else {
        x2 *= ww - w2;
        y2 *= wh - h2;
      }
      const val = { ...f.value, x: x2, y: y2, w: w2, h: h2 };
      ctx.fillStyle = fill2;
      if (s === "rect") {
        ctx.fillRect(x2, y2, w2, h2);
      } else if (s === "ellipse") {
        ctx.beginPath();
        ctx.ellipse(x2 + w2 / 2, y2 + h2 / 2, w2 / 2, h2 / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
      callback && callback(ctx, val, f);
    });
    window.frame = requestAnimationFrame(render);
  };
  window.frame = requestAnimationFrame(render);
  return silence;
};
const { x, y, w, h: h$1, a, r, fill, smear } = createParams("x", "y", "w", "h", "a", "r", "fill", "smear");
register("rescale", function(f, pat) {
  return pat.mul(x(f).w(f).y(f).h(f));
});
register("moveXY", function(dx, dy, pat) {
  return pat.add(x(dx).y(dy));
});
register("zoomIn", function(f, pat) {
  const d = pure(1).sub(f).div(2);
  return pat.rescale(f).move(d, d);
});
const scale = (normalized, min, max) => normalized * (max - min) + min;
const getValue = (e) => {
  let { value } = e;
  if (typeof e.value !== "object") {
    value = { value };
  }
  let { note, n, freq, s } = value;
  if (freq) {
    return freqToMidi(freq);
  }
  note = note != null ? note : n;
  if (typeof note === "string") {
    return toMidi(note);
  }
  if (typeof note === "number") {
    return note;
  }
  if (s) {
    return "_" + s;
  }
  return value;
};
Pattern.prototype.pianoroll = function({
  cycles = 4,
  playhead = 0.5,
  overscan = 1,
  flipTime = 0,
  flipValues = 0,
  hideNegative = false,
  inactive = "#7491D2",
  active = "#FFCA28",
  background = "transparent",
  smear: smear2 = 0,
  playheadColor = "white",
  minMidi = 10,
  maxMidi = 90,
  autorange = 0,
  timeframe: timeframeProp,
  fold = 0,
  vertical = 0
} = {}) {
  const ctx = getDrawContext();
  const w2 = ctx.canvas.width;
  const h2 = ctx.canvas.height;
  let from = -cycles * playhead;
  let to = cycles * (1 - playhead);
  if (timeframeProp) {
    console.warn("timeframe is deprecated! use from/to instead");
    from = 0;
    to = timeframeProp;
  }
  const timeAxis = vertical ? h2 : w2;
  const valueAxis = vertical ? w2 : h2;
  let timeRange = vertical ? [timeAxis, 0] : [0, timeAxis];
  const timeExtent = to - from;
  const valueRange = vertical ? [0, valueAxis] : [valueAxis, 0];
  let valueExtent = maxMidi - minMidi + 1;
  let barThickness = valueAxis / valueExtent;
  let foldValues = [];
  flipTime && timeRange.reverse();
  flipValues && valueRange.reverse();
  this.draw(
    (ctx2, events, t) => {
      ctx2.fillStyle = background;
      ctx2.globalAlpha = 1;
      if (!smear2) {
        ctx2.clearRect(0, 0, w2, h2);
        ctx2.fillRect(0, 0, w2, h2);
      }
      const inFrame = (event) => (!hideNegative || event.whole.begin >= 0) && event.whole.begin <= t + to && event.whole.end >= t + from;
      events.filter(inFrame).forEach((event) => {
        var _a, _b, _c;
        const isActive = event.whole.begin <= t && event.whole.end > t;
        ctx2.fillStyle = ((_a = event.context) == null ? void 0 : _a.color) || inactive;
        ctx2.strokeStyle = ((_b = event.context) == null ? void 0 : _b.color) || active;
        ctx2.globalAlpha = (_c = event.context.velocity) != null ? _c : 1;
        const timePx = scale((event.whole.begin - (flipTime ? to : from)) / timeExtent, ...timeRange);
        let durationPx = scale(event.duration / timeExtent, 0, timeAxis);
        const value = getValue(event);
        const valuePx = scale(
          fold ? foldValues.indexOf(value) / foldValues.length : (Number(value) - minMidi) / valueExtent,
          ...valueRange
        );
        let margin = 0;
        const offset = scale(t / timeExtent, ...timeRange);
        let coords;
        if (vertical) {
          coords = [
            valuePx + 1 - (flipValues ? barThickness : 0),
            timeAxis - offset + timePx + margin + 1 - (flipTime ? 0 : durationPx),
            barThickness - 2,
            durationPx - 2
          ];
        } else {
          coords = [
            timePx - offset + margin + 1 - (flipTime ? durationPx : 0),
            valuePx + 1 - (flipValues ? 0 : barThickness),
            durationPx - 2,
            barThickness - 2
          ];
        }
        isActive ? ctx2.strokeRect(...coords) : ctx2.fillRect(...coords);
      });
      ctx2.globalAlpha = 1;
      const playheadPosition = scale(-from / timeExtent, ...timeRange);
      ctx2.strokeStyle = playheadColor;
      ctx2.beginPath();
      if (vertical) {
        ctx2.moveTo(0, playheadPosition);
        ctx2.lineTo(valueAxis, playheadPosition);
      } else {
        ctx2.moveTo(playheadPosition, 0);
        ctx2.lineTo(playheadPosition, valueAxis);
      }
      ctx2.stroke();
    },
    {
      from: from - overscan,
      to: to + overscan,
      onQuery: (events) => {
        const { min, max, values } = events.reduce(
          ({ min: min2, max: max2, values: values2 }, e) => {
            const v = getValue(e);
            return {
              min: v < min2 ? v : min2,
              max: v > max2 ? v : max2,
              values: values2.includes(v) ? values2 : [...values2, v]
            };
          },
          { min: Infinity, max: -Infinity, values: [] }
        );
        if (autorange) {
          minMidi = min;
          maxMidi = max;
          valueExtent = maxMidi - minMidi + 1;
        }
        foldValues = values.sort((a2, b) => String(a2).localeCompare(String(b)));
        barThickness = fold ? valueAxis / foldValues.length : valueAxis / valueExtent;
      }
    }
  );
  return this;
};
logger("\u{1F300} @strudel.cycles/core loaded \u{1F300}");
if (globalThis._strudelLoaded) {
  console.warn(
    `@strudel.cycles/core was loaded more than once...
This might happen when you have multiple versions of strudel installed. 
Please check with "npm ls @strudel.cycles/core".`
  );
}
globalThis._strudelLoaded = true;
const applyOptions = (parent, code) => (pat, i) => {
  const ast = parent.source_[i];
  const options = ast.options_;
  const operator = options == null ? void 0 : options.operator;
  if (operator) {
    switch (operator.type_) {
      case "stretch": {
        const legalTypes = ["fast", "slow"];
        const { type, amount } = operator.arguments_;
        if (!legalTypes.includes(type)) {
          throw new Error(`mini: stretch: type must be one of ${legalTypes.join("|")} but got ${type}`);
        }
        return reify(pat)[type](patternifyAST(amount, code));
      }
      case "bjorklund":
        if (operator.arguments_.rotation) {
          const p1 = patternifyAST(operator.arguments_.pulse, code), p2 = patternifyAST(operator.arguments_.step, code), p3 = patternifyAST(operator.arguments_.rotation, code);
          p1.ast = operator.arguments_.pulse;
          p2.ast = operator.arguments_.step;
          p3.ast = operator.arguments_.rotation;
          return pat.euclidRot(p1, p2, p3);
        } else {
          const p1 = patternifyAST(operator.arguments_.pulse, code), p2 = patternifyAST(operator.arguments_.step, code);
          p1.ast = operator.arguments_.pulse;
          p2.ast = operator.arguments_.step;
          return pat.euclid(p1, p2);
        }
      case "degradeBy":
        return reify(pat).degradeBy(operator.arguments_.amount === null ? 0.5 : operator.arguments_.amount);
    }
    console.warn(`operator "${operator.type_}" not implemented`);
  }
  if (options == null ? void 0 : options.weight) {
    return pat;
  }
  const unimplemented = Object.keys(options || {}).filter((key) => key !== "operator");
  if (unimplemented.length) {
    console.warn(
      `option${unimplemented.length > 1 ? "s" : ""} ${unimplemented.map((o) => `"${o}"`).join(", ")} not implemented`
    );
  }
  return pat;
};
function resolveReplications(ast) {
  ast.source_ = flatten(
    ast.source_.map((child) => {
      const { replicate, ...options } = child.options_ || {};
      if (!replicate) {
        return [child];
      }
      delete child.options_.replicate;
      return Array(replicate).fill(child);
    })
  );
}
function patternifyAST(ast, code) {
  switch (ast.type_) {
    case "pattern": {
      resolveReplications(ast);
      const children = ast.source_.map((child) => patternifyAST(child, code)).map(applyOptions(ast, code));
      const alignment = ast.arguments_.alignment;
      if (alignment === "stack") {
        return stack(...children);
      }
      if (alignment === "polymeter") {
        const stepsPerCycle = ast.arguments_.stepsPerCycle ? patternifyAST(ast.arguments_.stepsPerCycle, code).fmap((x2) => fraction(x2)) : pure(fraction(children.length > 0 ? children[0].__weight : 1));
        const aligned = children.map((child) => child.fast(stepsPerCycle.fmap((x2) => x2.div(child.__weight || 1))));
        return stack(...aligned);
      }
      if (alignment === "rand") {
        return chooseCycles(...children);
      }
      const weightedChildren = ast.source_.some((child) => {
        var _a;
        return !!((_a = child.options_) == null ? void 0 : _a.weight);
      });
      if (!weightedChildren && alignment === "slowcat") {
        return slowcat(...children);
      }
      if (weightedChildren) {
        const weightSum = ast.source_.reduce((sum, child) => {
          var _a;
          return sum + (((_a = child.options_) == null ? void 0 : _a.weight) || 1);
        }, 0);
        const pat2 = timeCat(...ast.source_.map((child, i) => {
          var _a;
          return [((_a = child.options_) == null ? void 0 : _a.weight) || 1, children[i]];
        }));
        if (alignment === "slowcat") {
          return pat2._slow(weightSum);
        }
        pat2.__weight = weightSum;
        return pat2;
      }
      const pat = sequence(...children);
      pat.ast = ast;
      pat.__weight = children.length;
      return pat;
    }
    case "element": {
      const pat = patternifyAST(ast.source_, code);
      pat.ast = ast;
      return pat;
    }
    case "atom": {
      if (ast.source_ === "~") {
        return silence;
      }
      if (!ast.location_) {
        console.warn("no location for", ast);
        return ast.source_;
      }
      const { start, end } = ast.location_;
      const value = !isNaN(Number(ast.source_)) ? Number(ast.source_) : ast.source_;
      const actual = code == null ? void 0 : code.split("").slice(start.offset, end.offset).join("");
      const [offsetStart = 0, offsetEnd = 0] = actual ? actual.split(ast.source_).map((p) => p.split("").filter((c) => c === " ").length) : [];
      return pure(value).withLocation(
        [start.line, start.column + offsetStart, start.offset + offsetStart],
        [start.line, end.column - offsetEnd, end.offset - offsetEnd]
      );
    }
    case "stretch":
      return patternifyAST(ast.source_, code).slow(patternifyAST(ast.arguments_.amount, code));
    default:
      console.warn(`node type "${ast.type_}" not implemented -> returning silence`);
      return silence;
  }
}
const mini = (...strings) => {
  const pats = strings.map((str) => {
    const code = `"${str}"`;
    const ast = peg$parse(code);
    const pat = patternifyAST(ast, code);
    pat.ast = ast;
    return pat;
  });
  const s = sequence(...pats);
  s.ast = pats.map((_pat) => _pat.ast);
  return s;
};
const h = (string) => {
  const ast = peg$parse(string);
  const pat = patternifyAST(ast, string);
  pat.ast = ast;
  return pat;
};
function minify(thing) {
  if (typeof thing === "string") {
    return mini(thing);
  }
  return reify(thing);
}
exports.SyntaxError = peg$SyntaxError;
exports.h = h;
exports.mini = mini;
exports.minify = minify;
exports.parse = peg$parse;
exports.patternifyAST = patternifyAST;
