"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
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
  var peg$c14 = "<";
  var peg$c15 = ">";
  var peg$c16 = "@";
  var peg$c17 = "!";
  var peg$c18 = "(";
  var peg$c19 = ")";
  var peg$c20 = "/";
  var peg$c21 = "*";
  var peg$c22 = "%";
  var peg$c23 = "?";
  var peg$c24 = "<~";
  var peg$c25 = "~>";
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
  var peg$e21 = peg$literalExpectation("<", false);
  var peg$e22 = peg$literalExpectation(">", false);
  var peg$e23 = peg$literalExpectation("@", false);
  var peg$e24 = peg$literalExpectation("!", false);
  var peg$e25 = peg$literalExpectation("(", false);
  var peg$e26 = peg$literalExpectation(")", false);
  var peg$e27 = peg$literalExpectation("/", false);
  var peg$e28 = peg$literalExpectation("*", false);
  var peg$e29 = peg$literalExpectation("%", false);
  var peg$e30 = peg$literalExpectation("?", false);
  var peg$e31 = peg$literalExpectation("<~", false);
  var peg$e32 = peg$literalExpectation("~>", false);
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
    return chars.join("");
  };
  var peg$f2 = function(s) {
    return s;
  };
  var peg$f3 = function(sc) {
    sc.arguments_.alignment = "t";
    return sc;
  };
  var peg$f4 = function(a) {
    return { weight: a };
  };
  var peg$f5 = function(a) {
    return { replicate: a };
  };
  var peg$f6 = function(p, s, r) {
    return { operator: { type_: "bjorklund", arguments_: { pulse: p, step: s, rotation: r || 0 } } };
  };
  var peg$f7 = function(a) {
    return { operator: { type_: "stretch", arguments_: { amount: a } } };
  };
  var peg$f8 = function(a) {
    return { operator: { type_: "stretch", arguments_: { amount: "1/" + a } } };
  };
  var peg$f9 = function(a) {
    return { operator: { type_: "fixed-step", arguments_: { amount: a } } };
  };
  var peg$f10 = function(a) {
    return { operator: { type_: "degradeBy", arguments_: { amount: a ? a : 0.5 } } };
  };
  var peg$f11 = function(a) {
    return { operator: { type_: "early", arguments_: { amount: a } } };
  };
  var peg$f12 = function(a) {
    return { operator: { type_: "late", arguments_: { amount: a } } };
  };
  var peg$f13 = function(s, o) {
    return new ElementStub(s, o);
  };
  var peg$f14 = function(s) {
    return new PatternStub(s, "h");
  };
  var peg$f15 = function(tail) {
    return { alignment: "v", list: tail };
  };
  var peg$f16 = function(tail) {
    return { alignment: "r", list: tail };
  };
  var peg$f17 = function(head, tail) {
    if (tail && tail.list.length > 0) {
      return new PatternStub([head, ...tail.list], tail.alignment);
    } else {
      return head;
    }
  };
  var peg$f18 = function(sc) {
    return sc;
  };
  var peg$f19 = function(s) {
    return { name: "struct", args: { sequence: s } };
  };
  var peg$f20 = function(s) {
    return { name: "target", args: { name: s } };
  };
  var peg$f21 = function(p, s, r) {
    return { name: "bjorklund", args: { pulse: parseInt(p), step: parseInt(s) } };
  };
  var peg$f22 = function(a) {
    return { name: "stretch", args: { amount: a } };
  };
  var peg$f23 = function(a) {
    return { name: "shift", args: { amount: "-" + a } };
  };
  var peg$f24 = function(a) {
    return { name: "shift", args: { amount: a } };
  };
  var peg$f25 = function(a) {
    return { name: "stretch", args: { amount: "1/" + a } };
  };
  var peg$f26 = function(s) {
    return { name: "scale", args: { scale: s.join("") } };
  };
  var peg$f27 = function(s, v) {
    return v;
  };
  var peg$f28 = function(s, ss) {
    ss.unshift(s);
    return new PatternStub(ss, "t");
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
  function peg$parsetimeline() {
    var s0, s2, s4, s6;
    s0 = peg$currPos;
    peg$parsews();
    if (input.charCodeAt(peg$currPos) === 60) {
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
      s4 = peg$parsesingle_cycle();
      if (s4 !== peg$FAILED) {
        peg$parsews();
        if (input.charCodeAt(peg$currPos) === 62) {
          s6 = peg$c15;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e22);
          }
        }
        if (s6 !== peg$FAILED) {
          peg$parsews();
          peg$savedPos = s0;
          s0 = peg$f3(s4);
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
        s0 = peg$parsetimeline();
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
            s0 = peg$parseslice_fixed_step();
            if (s0 === peg$FAILED) {
              s0 = peg$parseslice_replicate();
              if (s0 === peg$FAILED) {
                s0 = peg$parseslice_degrade();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseslice_early();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseslice_late();
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
  function peg$parseslice_weight() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 64) {
      s1 = peg$c16;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e23);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
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
  function peg$parseslice_replicate() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 33) {
      s1 = peg$c17;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e24);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f5(s2);
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
      s1 = peg$c18;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e25);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$parsews();
      s3 = peg$parsenumber();
      if (s3 !== peg$FAILED) {
        peg$parsews();
        s5 = peg$parsecomma();
        if (s5 !== peg$FAILED) {
          peg$parsews();
          s7 = peg$parsenumber();
          if (s7 !== peg$FAILED) {
            peg$parsews();
            peg$parsecomma();
            peg$parsews();
            s11 = peg$parsenumber();
            if (s11 === peg$FAILED) {
              s11 = null;
            }
            peg$parsews();
            if (input.charCodeAt(peg$currPos) === 41) {
              s13 = peg$c19;
              peg$currPos++;
            } else {
              s13 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e26);
              }
            }
            if (s13 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f6(s3, s7, s11);
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
  function peg$parseslice_fast() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 42) {
      s1 = peg$c21;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e28);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f8(s2);
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
  function peg$parseslice_fixed_step() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 37) {
      s1 = peg$c22;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e29);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
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
  function peg$parseslice_degrade() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 63) {
      s1 = peg$c23;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e30);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f10(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseslice_early() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c24) {
      s1 = peg$c24;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e31);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f11(s2);
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
  function peg$parseslice_late() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c25) {
      s1 = peg$c25;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e32);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsenumber();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f12(s2);
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
      s0 = peg$f13(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesingle_cycle() {
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
      s1 = peg$f14(s1);
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
      s4 = peg$parsesingle_cycle();
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
          s4 = peg$parsesingle_cycle();
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
  function peg$parsechoose_tail() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$parsepipe();
    if (s3 !== peg$FAILED) {
      s4 = peg$parsesingle_cycle();
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
          s4 = peg$parsesingle_cycle();
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
      s1 = peg$f16(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsestack_or_choose() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsesingle_cycle();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsestack_tail();
      if (s2 === peg$FAILED) {
        s2 = peg$parsechoose_tail();
      }
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
  function peg$parsesequence() {
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
      s3 = peg$parsesequence_or_operator();
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
        s5 = peg$parsesequence_or_operator();
        if (s5 !== peg$FAILED) {
          s6 = [];
          s7 = peg$currPos;
          s8 = peg$parsecomma();
          if (s8 !== peg$FAILED) {
            s9 = peg$parsesequence_or_operator();
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
              s9 = peg$parsesequence_or_operator();
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
  function peg$parsesequence_or_group() {
    var s0;
    s0 = peg$parsecat();
    if (s0 === peg$FAILED) {
      s0 = peg$parsesequence();
    }
    return s0;
  }
  function peg$parsesequence_or_operator() {
    var s0, s1, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsesequence_or_group();
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
          s5 = peg$parsesequence_or_operator();
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
    s1 = peg$parsesequence_or_operator();
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
  function peg$parsesequence_definition() {
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
    s0 = peg$parsesequence_definition();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecommand();
    }
    return s0;
  }
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
var krillParser = {
  SyntaxError: peg$SyntaxError,
  parse: peg$parse
};
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
      var a = gcd2(n, d);
      f["n"] = n / a;
      f["d"] = d / a;
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
      var v = 0, w = 0, x = 0, y = 1, z = 1;
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
              w = assign(B[A++], s);
            } else if (B[A + 1] === "." || B[A] === ".") {
              if (B[A] !== ".") {
                v = assign(B[A++], s);
              }
              A++;
              if (A + 1 === B.length || B[A + 1] === "(" && B[A + 3] === ")" || B[A + 1] === "'" && B[A + 3] === "'") {
                w = assign(B[A], s);
                y = Math.pow(10, B[A].length);
                A++;
              }
              if (B[A] === "(" && B[A + 2] === ")" || B[A] === "'" && B[A + 2] === "'") {
                x = assign(B[A + 1], s);
                z = Math.pow(10, B[A + 1].length) - 1;
                A += 3;
              }
            } else if (B[A + 1] === "/" || B[A + 1] === ":") {
              w = assign(B[A], s);
              y = assign(B[A + 2], 1);
              A += 3;
            } else if (B[A + 3] === "/" && B[A + 1] === " ") {
              v = assign(B[A], s);
              w = assign(B[A + 2], s);
              y = assign(B[A + 4], 1);
              A += 5;
            }
            if (B.length <= A) {
              d = y * z;
              s = n = x + d * v + z * w;
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
      var r = 1;
      for (; e > 0; b = b * b % m, e >>= 1) {
        if (e & 1) {
          r = r * b % m;
        }
      }
      return r;
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
    function gcd2(a, b) {
      if (!a)
        return b;
      if (!b)
        return a;
      while (1) {
        a %= b;
        if (!a)
          return b;
        b %= a;
        if (!b)
          return a;
      }
    }
    function Fraction2(a, b) {
      parse(a, b);
      if (this instanceof Fraction2) {
        a = gcd2(P["d"], P["n"]);
        this["s"] = P["s"];
        this["n"] = P["n"] / a;
        this["d"] = P["d"] / a;
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
      "add": function(a, b) {
        parse(a, b);
        return newFraction(
          this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
          this["d"] * P["d"]
        );
      },
      "sub": function(a, b) {
        parse(a, b);
        return newFraction(
          this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
          this["d"] * P["d"]
        );
      },
      "mul": function(a, b) {
        parse(a, b);
        return newFraction(
          this["s"] * P["s"] * this["n"] * P["n"],
          this["d"] * P["d"]
        );
      },
      "div": function(a, b) {
        parse(a, b);
        return newFraction(
          this["s"] * P["s"] * this["n"] * P["d"],
          this["d"] * P["n"]
        );
      },
      "clone": function() {
        return newFraction(this["s"] * this["n"], this["d"]);
      },
      "mod": function(a, b) {
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction2(NaN);
        }
        if (a === void 0) {
          return newFraction(this["s"] * this["n"] % this["d"], 1);
        }
        parse(a, b);
        if (0 === P["n"] && 0 === this["d"]) {
          throw Fraction2["DivisionByZero"];
        }
        return newFraction(
          this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]),
          P["d"] * this["d"]
        );
      },
      "gcd": function(a, b) {
        parse(a, b);
        return newFraction(gcd2(P["n"], this["n"]) * gcd2(P["d"], this["d"]), P["d"] * this["d"]);
      },
      "lcm": function(a, b) {
        parse(a, b);
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
      "pow": function(a, b) {
        parse(a, b);
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
      "equals": function(a, b) {
        parse(a, b);
        return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
      },
      "compare": function(a, b) {
        parse(a, b);
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
      "divisible": function(a, b) {
        parse(a, b);
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
        var a = this["n"];
        var b = this["d"];
        var res = [];
        if (isNaN(a) || isNaN(b)) {
          return res;
        }
        do {
          res.push(Math.floor(a / b));
          t = a % b;
          a = b;
          b = t;
        } while (a !== 1);
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
const Fraction$1 = /* @__PURE__ */ getDefaultExportFromCjs(fraction$1.exports);
Fraction$1.prototype.sam = function() {
  return this.floor();
};
Fraction$1.prototype.nextSam = function() {
  return this.sam().add(1);
};
Fraction$1.prototype.wholeCycle = function() {
  return new TimeSpan(this.sam(), this.nextSam());
};
Fraction$1.prototype.cyclePos = function() {
  return this.sub(this.sam());
};
Fraction$1.prototype.lt = function(other) {
  return this.compare(other) < 0;
};
Fraction$1.prototype.gt = function(other) {
  return this.compare(other) > 0;
};
Fraction$1.prototype.lte = function(other) {
  return this.compare(other) <= 0;
};
Fraction$1.prototype.gte = function(other) {
  return this.compare(other) >= 0;
};
Fraction$1.prototype.eq = function(other) {
  return this.compare(other) == 0;
};
Fraction$1.prototype.max = function(other) {
  return this.gt(other) ? this : other;
};
Fraction$1.prototype.min = function(other) {
  return this.lt(other) ? this : other;
};
Fraction$1.prototype.show = function() {
  return this.s * this.n + "/" + this.d;
};
Fraction$1.prototype.or = function(other) {
  return this.eq(0) ? other : this;
};
const fraction = (n) => {
  if (typeof n === "number") {
    n = String(n);
  }
  return Fraction$1(n);
};
const gcd = (...fractions) => {
  return fractions.reduce((gcd2, fraction2) => gcd2.gcd(fraction2), fraction(1));
};
fraction._original = Fraction$1;
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
    return this.begin.show() + " -> " + this.end.show();
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
  show() {
    return "(" + (this.whole == void 0 ? "~" : this.whole.show()) + ", " + this.part.show() + ", " + this.value + ")";
  }
  showWhole() {
    return `${this.whole == void 0 ? "~" : this.whole.show()}: ${typeof this.value === "object" ? JSON.stringify(this.value) : this.value}`;
  }
  combineContext(b) {
    const a = this;
    return { ...a.context, ...b.context, locations: (a.context.locations || []).concat(b.context.locations || []) };
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
const isNote = (name) => /^[a-gA-G][#b]*[0-9]$/.test(name);
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
  const [pc, acc, oct] = tokenizeNote(note);
  if (!pc) {
    throw new Error('not a note: "' + note + '"');
  }
  const chroma = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[pc.toLowerCase()];
  const offset = (acc == null ? void 0 : acc.split("").reduce((o, char) => o + { "#": 1, b: -1, s: 1 }[char], 0)) || 0;
  return (Number(oct) + 1) * 12 + chroma + offset;
};
const fromMidi = (n) => {
  return Math.pow(2, (n - 69) / 12) * 440;
};
const getFreq = (noteOrMidi) => {
  if (typeof noteOrMidi === "number") {
    return fromMidi(noteOrMidi);
  }
  return fromMidi(toMidi(noteOrMidi));
};
const midi2note = (n) => {
  const oct = Math.floor(n / 12) - 1;
  const pc = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"][n % 12];
  return pc + oct;
};
const mod = (n, m) => (n % m + m) % m;
const getPlayableNoteValue = (hap) => {
  let { value: note, context } = hap;
  if (typeof note === "object" && !Array.isArray(note)) {
    note = note.note || note.n || note.value;
  }
  if (typeof note === "number" && context.type !== "frequency") {
    note = fromMidi(hap.value);
  } else if (typeof note === "number" && context.type === "frequency") {
    note = hap.value;
  } else if (typeof note !== "string" || !isNote(note)) {
    throw new Error("not a note: " + JSON.stringify(note));
  }
  return note;
};
const getFrequency = (hap) => {
  let { value, context } = hap;
  if (typeof value === "object" && value.freq) {
    return value.freq;
  }
  if (typeof value === "number" && context.type !== "frequency") {
    value = fromMidi(hap.value);
  } else if (typeof value === "string" && isNote(value)) {
    value = fromMidi(toMidi(hap.value));
  } else if (typeof value !== "number") {
    throw new Error("not a note or frequency:" + value);
  }
  return value;
};
const rotate = (arr, n) => arr.slice(n).concat(arr.slice(0, n));
const pipe = (...funcs) => {
  return funcs.reduce(
    (f, g) => (...args) => f(g(...args)),
    (x) => x
  );
};
const compose = (...funcs) => pipe(...funcs.reverse());
const removeUndefineds = (xs) => xs.filter((x) => x != void 0);
const flatten = (arr) => [].concat(...arr);
const id = (a) => a;
const constant = (a, b) => a;
const listRange = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => i + min);
function curry(func, overload) {
  const fn = function curried(...args) {
    if (args.length >= func.length) {
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
function unionWithObj(a, b, func) {
  const common = Object.keys(a).filter((k) => Object.keys(b).includes(k));
  return Object.assign({}, a, b, Object.fromEntries(common.map((k) => [k, func(a[k], b[k])])));
}
curry((a, b) => a * b);
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
class Pattern$1 {
  constructor(query) {
    __publicField(this, "_Pattern", true);
    this.query = query;
  }
  queryArc(begin, end) {
    return this.query(new State(new TimeSpan(begin, end)));
  }
  _splitQueries() {
    const pat = this;
    const q = (state) => {
      return flatten(state.span.spanCycles.map((subspan) => pat.query(state.setSpan(subspan))));
    };
    return new Pattern$1(q);
  }
  withQuerySpan(func) {
    return new Pattern$1((state) => this.query(state.withSpan(func)));
  }
  withQueryTime(func) {
    return new Pattern$1((state) => this.query(state.withSpan((span) => span.withTime(func))));
  }
  withHapSpan(func) {
    return new Pattern$1((state) => this.query(state).map((hap) => hap.withSpan(func)));
  }
  withHapTime(func) {
    return this.withHapSpan((span) => span.withTime(func));
  }
  _withHaps(func) {
    return new Pattern$1((state) => func(this.query(state)));
  }
  _withHap(func) {
    return this._withHaps((haps) => haps.map(func));
  }
  _setContext(context) {
    return this._withHap((hap) => hap.setContext(context));
  }
  _withContext(func) {
    return this._withHap((hap) => hap.setContext(func(hap.context)));
  }
  _stripContext() {
    return this._withHap((hap) => hap.setContext({}));
  }
  withLocation(start, end) {
    const location = {
      start: { line: start[0], column: start[1], offset: start[2] },
      end: { line: end[0], column: end[1], offset: end[2] }
    };
    return this._withContext((context) => {
      const locations = (context.locations || []).concat([location]);
      return { ...context, locations };
    });
  }
  withMiniLocation(start, end) {
    const offset = {
      start: { line: start[0], column: start[1], offset: start[2] },
      end: { line: end[0], column: end[1], offset: end[2] }
    };
    return this._withContext((context) => {
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
  withValue(func) {
    return new Pattern$1((state) => this.query(state).map((hap) => hap.withValue(func)));
  }
  fmap(func) {
    return this.withValue(func);
  }
  _filterHaps(hap_test) {
    return new Pattern$1((state) => this.query(state).filter(hap_test));
  }
  _filterValues(value_test) {
    return new Pattern$1((state) => this.query(state).filter((hap) => value_test(hap.value)));
  }
  _removeUndefineds() {
    return this._filterValues((val) => val != void 0);
  }
  onsetsOnly() {
    return this._filterHaps((hap) => hap.hasOnset());
  }
  discreteOnly() {
    return this._filterHaps((hap) => hap.whole);
  }
  _appWhole(whole_func, pat_val) {
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
    return new Pattern$1(query);
  }
  appBoth(pat_val) {
    const whole_func = function(span_a, span_b) {
      if (span_a == void 0 || span_b == void 0) {
        return void 0;
      }
      return span_a.intersection_e(span_b);
    };
    return this._appWhole(whole_func, pat_val);
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
    return new Pattern$1(query);
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
    return new Pattern$1(query);
  }
  firstCycle(with_context = false) {
    var self = this;
    if (!with_context) {
      self = self._stripContext();
    }
    return self.query(new State(new TimeSpan(fraction(0), fraction(1))));
  }
  get _firstCycleValues() {
    return this.firstCycle().map((hap) => hap.value);
  }
  get _showFirstCycle() {
    return this.firstCycle().map(
      (hap) => `${hap.value}: ${hap.whole.begin.toFraction()} - ${hap.whole.end.toFraction()}`
    );
  }
  _sortHapsByPart() {
    return this._withHaps(
      (haps) => haps.sort(
        (a, b) => a.part.begin.sub(b.part.begin).or(a.part.end.sub(b.part.end)).or(a.whole.begin.sub(b.whole.begin).or(a.whole.end.sub(b.whole.end)))
      )
    );
  }
  _opIn(other, func) {
    return this.fmap(func).appLeft(reify$2(other));
  }
  _opOut(other, func) {
    return this.fmap(func).appRight(reify$2(other));
  }
  _opMix(other, func) {
    return this.fmap(func).appBoth(reify$2(other));
  }
  _opSqueeze(other, func) {
    const otherPat = reify$2(other);
    return this.fmap((a) => otherPat.fmap((b) => func(a)(b)))._squeezeJoin();
  }
  _opSqueezeOut(other, func) {
    const thisPat = this;
    const otherPat = reify$2(other);
    return otherPat.fmap((a) => thisPat.fmap((b) => func(b)(a)))._squeezeJoin();
  }
  _opTrig(other, func) {
    const otherPat = reify$2(other);
    return otherPat.fmap((b) => this.fmap((a) => func(a)(b)))._trigJoin();
  }
  _opTrigzero(other, func) {
    const otherPat = reify$2(other);
    return otherPat.fmap((b) => this.fmap((a) => func(a)(b)))._TrigzeroJoin();
  }
  _asNumber(dropfails = false, softfail = false) {
    return this._withHap((hap) => {
      const asNumber = Number(hap.value);
      if (!isNaN(asNumber)) {
        return hap.withValue(() => asNumber);
      }
      const specialValue = {
        e: Math.E,
        pi: Math.PI
      }[hap.value];
      if (typeof specialValue !== "undefined") {
        return hap.withValue(() => specialValue);
      }
      if (isNote(hap.value)) {
        return new Hap(hap.whole, hap.part, toMidi(hap.value), { ...hap.context, type: "midi" });
      }
      if (dropfails) {
        return void 0;
      }
      if (softfail) {
        return hap;
      }
      throw new Error('cannot parse as number: "' + hap.value + '"');
    });
  }
  round() {
    return this._asNumber().fmap((v) => Math.round(v));
  }
  floor() {
    return this._asNumber().fmap((v) => Math.floor(v));
  }
  ceil() {
    return this._asNumber().fmap((v) => Math.ceil(v));
  }
  _toBipolar() {
    return this.fmap((x) => x * 2 - 1);
  }
  _fromBipolar() {
    return this.fmap((x) => (x + 1) / 2);
  }
  range(min, max) {
    return this.mul(max - min).add(min);
  }
  rangex(min, max) {
    return this.range(Math.log(min), Math.log(max)).fmap(Math.exp);
  }
  range2(min, max) {
    return this._fromBipolar().range(min, max);
  }
  _bindWhole(choose_whole, func) {
    const pat_val = this;
    const query = function(state) {
      const withWhole = function(a, b) {
        return new Hap(
          choose_whole(a.whole, b.whole),
          b.part,
          b.value,
          Object.assign({}, a.context, b.context, {
            locations: (a.context.locations || []).concat(b.context.locations || [])
          })
        );
      };
      const match = function(a) {
        return func(a.value).query(state.setSpan(a.part)).map((b) => withWhole(a, b));
      };
      return flatten(pat_val.query(state).map((a) => match(a)));
    };
    return new Pattern$1(query);
  }
  bind(func) {
    const whole_func = function(a, b) {
      if (a == void 0 || b == void 0) {
        return void 0;
      }
      return a.intersection_e(b);
    };
    return this._bindWhole(whole_func, func);
  }
  join() {
    return this.bind(id);
  }
  outerBind(func) {
    return this._bindWhole((a, _) => a, func);
  }
  outerJoin() {
    return this.outerBind(id);
  }
  innerBind(func) {
    return this._bindWhole((_, b) => b, func);
  }
  innerJoin() {
    return this.innerBind(id);
  }
  _trigJoin(cycleZero = false) {
    const pat_of_pats = this;
    return new Pattern$1((state) => {
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
  _TrigzeroJoin() {
    return this._trigJoin(true);
  }
  _squeezeJoin() {
    const pat_of_pats = this;
    function query(state) {
      const haps = pat_of_pats.discreteOnly().query(state);
      function flatHap(outerHap) {
        const pat = outerHap.value._compressSpan(outerHap.wholeOrPart().cycleArc());
        const innerHaps = pat.query(state.setSpan(outerHap.part));
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
      return result.filter((x) => x);
    }
    return new Pattern$1(query);
  }
  _squeezeBind(func) {
    return this.fmap(func)._squeezeJoin();
  }
  _apply(func) {
    return func(this);
  }
  layer(...funcs) {
    return stack$1(...funcs.map((func) => func(this)));
  }
  _patternify(func) {
    const pat = this;
    const patterned = function(...args) {
      args = args.map((arg) => isPattern(arg) ? arg.fmap((value) => value.value || value) : arg);
      const pat_arg = sequence$1(...args);
      return pat_arg.fmap((arg) => func.call(pat, arg)).innerJoin();
    };
    return patterned;
  }
  _fastGap(factor) {
    const qf = function(span) {
      const cycle = span.begin.sam();
      const begin = cycle.add(span.begin.sub(cycle).mul(factor).min(1));
      const end = cycle.add(span.end.sub(cycle).mul(factor).min(1));
      return new TimeSpan(begin, end);
    };
    const ef = function(span) {
      const cycle = span.begin.sam();
      const begin = cycle.add(span.begin.sub(cycle).div(factor).min(1));
      const end = cycle.add(span.end.sub(cycle).div(factor).min(1));
      return new TimeSpan(begin, end);
    };
    return this.withQuerySpan(qf).withHapSpan(ef)._splitQueries();
  }
  _compress(b, e) {
    if (b.gt(e) || b.gt(1) || e.gt(1) || b.lt(0) || e.lt(0)) {
      return silence$1;
    }
    return this._fastGap(fraction(1).div(e.sub(b)))._late(b);
  }
  _compressSpan(span) {
    return this._compress(span.begin, span.end);
  }
  _fast(factor) {
    const fastQuery = this.withQueryTime((t) => t.mul(factor));
    return fastQuery.withHapTime((t) => t.div(factor));
  }
  _slow(factor) {
    return this._fast(fraction(1).div(factor));
  }
  _inside(factor, f) {
    return f(this._slow(factor))._fast(factor);
  }
  _outside(factor, f) {
    return f(this._fast(factor))._slow(factor);
  }
  _ply(factor) {
    return this.fmap((x) => pure$1(x)._fast(factor))._squeezeJoin();
  }
  _chop(n) {
    const slices = Array.from({ length: n }, (x, i) => i);
    const slice_objects = slices.map((i) => ({ begin: i / n, end: (i + 1) / n }));
    const func = function(o) {
      return sequence$1(slice_objects.map((slice_o) => Object.assign({}, o, slice_o)));
    };
    return this._squeezeBind(func);
  }
  _striate(n) {
    const slices = Array.from({ length: n }, (x, i) => i);
    const slice_objects = slices.map((i) => ({ begin: i / n, end: (i + 1) / n }));
    const slicePat = slowcat$1(...slice_objects);
    return this.set(slicePat)._fast(n);
  }
  _cpm(cpm) {
    return this._fast(cpm / 60);
  }
  _early(offset) {
    offset = fraction(offset);
    return this.withQueryTime((t) => t.add(offset)).withHapTime((t) => t.sub(offset));
  }
  _late(offset) {
    offset = fraction(offset);
    return this._early(fraction(0).sub(offset));
  }
  _zoom(s, e) {
    e = fraction(e);
    s = fraction(s);
    const d = e.sub(s);
    return this.withQuerySpan((span) => span.withCycle((t) => t.mul(d).add(s))).withHapSpan((span) => span.withCycle((t) => t.sub(s).div(d)))._splitQueries();
  }
  _zoomArc(a) {
    return this.zoom(a.begin, a.end);
  }
  _linger(t) {
    if (t == 0) {
      return silence$1;
    } else if (t < 0) {
      return this._zoom(t.add(1), 1)._slow(t);
    }
    return this._zoom(0, t)._slow(t);
  }
  _color(color) {
    return this._withContext((context) => ({ ...context, color }));
  }
  log() {
    return this._withHap((e) => {
      var _a;
      return e.setContext({ ...e.context, logs: (((_a = e.context) == null ? void 0 : _a.logs) || []).concat([e.show()]) });
    });
  }
  drawLine() {
    console.log(drawLine(this));
    return this;
  }
  _segment(rate) {
    return this.struct(pure$1(true)._fast(rate));
  }
  invert() {
    return this.fmap((x) => !x);
  }
  inv() {
    return this.invert();
  }
  when(binary_pat, func) {
    const true_pat = binary_pat._filterValues(id);
    const false_pat = binary_pat._filterValues((val) => !val);
    const with_pat = true_pat.fmap((_) => (y) => y).appRight(func(this));
    const without_pat = false_pat.fmap((_) => (y) => y).appRight(this);
    return stack$1(with_pat, without_pat);
  }
  off(time_pat, func) {
    return stack$1(this, func(this.late(time_pat)));
  }
  every(n, func) {
    const pat = this;
    const pats = Array(n - 1).fill(pat);
    pats.unshift(func(pat));
    return slowcatPrime(...pats);
  }
  brak() {
    return this.when(slowcat$1(false, true), (x) => fastcat(x, silence$1)._late(0.25));
  }
  rev() {
    const pat = this;
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
    return new Pattern$1(query)._splitQueries();
  }
  palindrome() {
    return this.every(2, rev);
  }
  juxBy(by, func) {
    by /= 2;
    const elem_or = function(dict, key, dflt) {
      if (key in dict) {
        return dict[key];
      }
      return dflt;
    };
    const left = this.withValue((val) => Object.assign({}, val, { pan: elem_or(val, "pan", 0.5) - by }));
    const right = this.withValue((val) => Object.assign({}, val, { pan: elem_or(val, "pan", 0.5) + by }));
    return stack$1(left, func(right));
  }
  _jux(func) {
    return this.juxBy(1, func);
  }
  stack(...pats) {
    return stack$1(this, ...pats);
  }
  sequence(...pats) {
    return sequence$1(this, ...pats);
  }
  seq(...pats) {
    return sequence$1(this, ...pats);
  }
  cat(...pats) {
    return cat(this, ...pats);
  }
  fastcat(...pats) {
    return fastcat(this, ...pats);
  }
  slowcat(...pats) {
    return slowcat$1(this, ...pats);
  }
  superimpose(...funcs) {
    return this.stack(...funcs.map((func) => func(this)));
  }
  stutWith(times, time2, func) {
    return stack$1(...listRange(0, times - 1).map((i) => func(this.late(fraction(time2).mul(i)), i)));
  }
  stut(times, feedback, time2) {
    return this.stutWith(times, time2, (pat, i) => pat.velocity(Math.pow(feedback, i)));
  }
  _echoWith(times, time2, func) {
    return stack$1(...listRange(0, times - 1).map((i) => func(this.late(fraction(time2).mul(i)), i)));
  }
  _echo(times, time2, feedback) {
    return this._echoWith(times, time2, (pat, i) => pat.velocity(Math.pow(feedback, i)));
  }
  iter(times, back = false) {
    return slowcat$1(...listRange(0, times - 1).map((i) => back ? this.late(i / times) : this.early(i / times)));
  }
  iterBack(times) {
    return this.iter(times, true);
  }
  _chunk(n, func, back = false) {
    const binary = Array(n - 1).fill(false);
    binary.unshift(true);
    const binary_pat = sequence$1(...binary).iter(n, back);
    return this.when(binary_pat, func);
  }
  _chunkBack(n, func) {
    return this._chunk(n, func, true);
  }
  _bypass(on2) {
    on2 = Boolean(parseInt(on2));
    return on2 ? silence$1 : this;
  }
  hush() {
    return silence$1;
  }
  _duration(value) {
    return this.withHapSpan((span) => new TimeSpan(span.begin, span.begin.add(value)));
  }
  _legato(value) {
    return this.withHapSpan((span) => new TimeSpan(span.begin, span.begin.add(span.end.sub(span.begin).mul(value))));
  }
  _velocity(velocity) {
    return this._withContext((context) => ({ ...context, velocity: (context.velocity || 1) * velocity }));
  }
  _loopAt(factor, cps = 1) {
    return this.speed(1 / factor * cps).unit("c").slow(factor);
  }
  onTrigger(onTrigger) {
    return this._withHap((hap) => hap.setContext({ ...hap.context, onTrigger }));
  }
  log(func = id) {
    return this._withHap(
      (hap) => hap.setContext({
        ...hap.context,
        onTrigger: (...args) => {
          if (hap.context.onTrigger) {
            hap.context.onTrigger(...args);
          }
          console.log(func(...args));
        }
      })
    );
  }
  logValues(func = id) {
    return this.log((_, hap) => func(hap.value));
  }
}
function _composeOp(a, b, func) {
  function _nonFunctionObject(x) {
    return x instanceof Object && !(x instanceof Function);
  }
  if (_nonFunctionObject(a) || _nonFunctionObject(b)) {
    if (!_nonFunctionObject(a)) {
      a = { value: a };
    }
    if (!_nonFunctionObject(b)) {
      b = { value: b };
    }
    return unionWithObj(a, b, func);
  }
  return func(a, b);
}
(function() {
  const num = (pat) => pat._asNumber();
  const numOrString = (pat) => pat._asNumber(false, true);
  const composers = {
    set: [(a, b) => b],
    keep: [(a, b) => a],
    keepif: [(a, b) => b ? a : void 0],
    add: [(a, b) => a + b, numOrString],
    sub: [(a, b) => a - b, num],
    mul: [(a, b) => a * b, num],
    div: [(a, b) => a / b, num],
    mod: [mod, num],
    pow: [Math.pow, num],
    _and: [(a, b) => a & b, num],
    _or: [(a, b) => a | b, num],
    _xor: [(a, b) => a ^ b, num],
    _lshift: [(a, b) => a << b, num],
    _rshift: [(a, b) => a >> b, num],
    lt: [(a, b) => a < b],
    gt: [(a, b) => a > b],
    lte: [(a, b) => a <= b],
    gte: [(a, b) => a >= b],
    eq: [(a, b) => a == b],
    eqt: [(a, b) => a === b],
    ne: [(a, b) => a != b],
    net: [(a, b) => a !== b],
    and: [(a, b) => a && b],
    or: [(a, b) => a || b],
    func: [(a, b) => b(a)]
  };
  for (const [what, [op, preprocess]] of Object.entries(composers)) {
    for (const how of ["In", "Out", "Mix", "Squeeze", "SqueezeOut", "Trig", "Trigzero"]) {
      Pattern$1.prototype[what + how] = function(...other) {
        var pat = this;
        other = sequence$1(other);
        if (preprocess) {
          pat = preprocess(pat);
          other = preprocess(other);
        }
        var result = pat["_op" + how](other, (a) => (b) => _composeOp(a, b, op));
        if (what === "keepif") {
          result = result._removeUndefineds();
        }
        return result;
      };
      if (how === "Squeeze") {
        Pattern$1.prototype[what + "SqueezeIn"] = Pattern$1.prototype[what + how];
      }
      if (how === "In") {
        Pattern$1.prototype[what] = Pattern$1.prototype[what + how];
      } else {
        if (what === "set") {
          Pattern$1.prototype[how.toLowerCase()] = Pattern$1.prototype[what + how];
        }
      }
    }
  }
  Pattern$1.prototype.struct = Pattern$1.prototype.keepifOut;
  Pattern$1.prototype.structAll = Pattern$1.prototype.keepOut;
  Pattern$1.prototype.mask = Pattern$1.prototype.keepifIn;
  Pattern$1.prototype.maskAll = Pattern$1.prototype.keepIn;
  Pattern$1.prototype.reset = Pattern$1.prototype.keepifTrig;
  Pattern$1.prototype.resetAll = Pattern$1.prototype.keepTrig;
  Pattern$1.prototype.restart = Pattern$1.prototype.keepifTrigzero;
  Pattern$1.prototype.restartAll = Pattern$1.prototype.keepTrigzero;
})();
Pattern$1.prototype.patternified = [
  "apply",
  "chop",
  "color",
  "cpm",
  "duration",
  "early",
  "fast",
  "jux",
  "late",
  "legato",
  "linger",
  "ply",
  "segment",
  "striate",
  "slow",
  "velocity"
];
Pattern$1.prototype.factories = {
  pure: pure$1,
  stack: stack$1,
  slowcat: slowcat$1,
  fastcat,
  cat,
  timeCat: timeCat$1,
  sequence: sequence$1,
  seq,
  polymeter,
  pm,
  polyrhythm,
  pr
};
const silence$1 = new Pattern$1((_) => []);
function pure$1(value) {
  function query(state) {
    return state.span.spanCycles.map((subspan) => new Hap(fraction(subspan.begin).wholeCycle(), subspan, value));
  }
  return new Pattern$1(query);
}
function isPattern(thing) {
  const is = thing instanceof Pattern$1 || thing._Pattern;
  if (!thing instanceof Pattern$1) {
    console.warn(
      `Found Pattern that fails "instanceof Pattern" check.
      This may happen if you are using multiple versions of @strudel.cycles/core. 
      Please check by running "npm ls @strudel.cycles/core".`
    );
  }
  return is;
}
function reify$2(thing) {
  if (isPattern(thing)) {
    return thing;
  }
  return pure$1(thing);
}
function stack$1(...pats) {
  pats = pats.map((pat) => Array.isArray(pat) ? sequence$1(...pat) : reify$2(pat));
  const query = (state) => flatten(pats.map((pat) => pat.query(state)));
  return new Pattern$1(query);
}
function slowcat$1(...pats) {
  pats = pats.map((pat) => Array.isArray(pat) ? sequence$1(...pat) : reify$2(pat));
  const query = function(state) {
    const span = state.span;
    const pat_n = mod(span.begin.sam(), pats.length);
    const pat = pats[pat_n];
    if (!pat) {
      return [];
    }
    const offset = span.begin.floor().sub(span.begin.div(pats.length).floor());
    return pat.withHapTime((t) => t.add(offset)).query(state.setSpan(span.withTime((t) => t.sub(offset))));
  };
  return new Pattern$1(query)._splitQueries();
}
function slowcatPrime(...pats) {
  pats = pats.map(reify$2);
  const query = function(state) {
    const pat_n = Math.floor(state.span.begin) % pats.length;
    const pat = pats[pat_n];
    return (pat == null ? void 0 : pat.query(state)) || [];
  };
  return new Pattern$1(query)._splitQueries();
}
function fastcat(...pats) {
  return slowcat$1(...pats)._fast(pats.length);
}
function cat(...pats) {
  return slowcat$1(...pats);
}
function timeCat$1(...timepats) {
  const total = timepats.map((a) => a[0]).reduce((a, b) => a.add(b), fraction(0));
  let begin = fraction(0);
  const pats = [];
  for (const [time2, pat] of timepats) {
    const end = begin.add(time2);
    pats.push(reify$2(pat)._compress(begin.div(total), end.div(total)));
    begin = end;
  }
  return stack$1(...pats);
}
function sequence$1(...pats) {
  return fastcat(...pats);
}
function seq(...pats) {
  return fastcat(...pats);
}
function _sequenceCount(x) {
  if (Array.isArray(x)) {
    if (x.length == 0) {
      return [silence$1, 0];
    }
    if (x.length == 1) {
      return _sequenceCount(x[0]);
    }
    return [fastcat(...x.map((a) => _sequenceCount(a)[0])), x.length];
  }
  return [reify$2(x), 1];
}
function polymeterSteps(steps, ...args) {
  const seqs = args.map((a) => _sequenceCount(a));
  if (seqs.length == 0) {
    return silence$1;
  }
  if (steps == 0) {
    steps = seqs[0][1];
  }
  const pats = [];
  for (const seq2 of seqs) {
    if (seq2[1] == 0) {
      next;
    }
    if (steps == seq2[1]) {
      pats.push(seq2[0]);
    } else {
      pats.push(seq2[0]._fast(fraction(steps).div(fraction(seq2[1]))));
    }
  }
  return stack$1(...pats);
}
function polymeter(...args) {
  return polymeterSteps(0, ...args);
}
function pm(...args) {
  polymeter(...args);
}
function polyrhythm(...xs) {
  const seqs = xs.map((a) => sequence$1(a));
  if (seqs.length == 0) {
    return silence$1;
  }
  return stack$1(...seqs);
}
function pr(args) {
  polyrhythm(args);
}
const add = curry((a, pat) => pat.add(a));
const chop = curry((a, pat) => pat.chop(a));
const chunk = curry((a, pat) => pat.chunk(a));
const chunkBack = curry((a, pat) => pat.chunkBack(a));
const div = curry((a, pat) => pat.div(a));
const early = curry((a, pat) => pat.early(a));
const echo = curry((a, b, c, pat) => pat.echo(a, b, c));
const every = curry((i, f, pat) => pat.every(i, f));
const fast = curry((a, pat) => pat.fast(a));
const inv = (pat) => pat.inv();
const invert = (pat) => pat.invert();
const iter = curry((a, pat) => pat.iter(a));
const iterBack = curry((a, pat) => pat.iter(a));
const jux = curry((f, pat) => pat.jux(f));
const juxBy = curry((by, f, pat) => pat.juxBy(by, f));
const late = curry((a, pat) => pat.late(a));
const linger = curry((a, pat) => pat.linger(a));
const mask = curry((a, pat) => pat.mask(a));
const mul = curry((a, pat) => pat.mul(a));
const off = curry((t, f, pat) => pat.off(t, f));
const ply = curry((a, pat) => pat.ply(a));
const range = curry((a, b, pat) => pat.range(a, b));
const range2 = curry((a, b, pat) => pat.range2(a, b));
const rev = (pat) => pat.rev();
const slow = curry((a, pat) => pat.slow(a));
const struct = curry((a, pat) => pat.struct(a));
const sub = curry((a, pat) => pat.sub(a));
const superimpose = curry((array, pat) => pat.superimpose(...array));
const set = curry((a, pat) => pat.set(a));
const when = curry((binary, f, pat) => pat.when(binary, f));
Pattern$1.prototype.composable = { fast, slow, early, late, superimpose };
function makeComposable(func) {
  Object.entries(Pattern$1.prototype.composable).forEach(([functionName, composable]) => {
    func[functionName] = (...args) => {
      const composition = compose(func, composable(...args));
      return makeComposable(composition);
    };
  });
  return func;
}
const patternify2 = (f) => (pata, patb, pat) => pata.fmap((a) => (b) => f.call(pat, a, b)).appLeft(patb).innerJoin();
const patternify3 = (f) => (pata, patb, patc, pat) => pata.fmap((a) => (b) => (c) => f.call(pat, a, b, c)).appLeft(patb).appLeft(patc).innerJoin();
const patternify4 = (f) => (pata, patb, patc, patd, pat) => pata.fmap((a) => (b) => (c) => (d) => f.call(pat, a, b, c, d)).appLeft(patb).appLeft(patc).appLeft(patd).innerJoin();
Pattern$1.prototype.echo = function(...args) {
  args = args.map(reify$2);
  return patternify3(Pattern$1.prototype._echo)(...args, this);
};
Pattern$1.prototype.echoWith = function(...args) {
  args = args.map(reify$2);
  return patternify3(Pattern$1.prototype._echoWith)(...args, this);
};
Pattern$1.prototype.chunk = function(...args) {
  args = args.map(reify$2);
  return patternify2(Pattern$1.prototype._chunk)(...args, this);
};
Pattern$1.prototype.chunkBack = function(...args) {
  args = args.map(reify$2);
  return patternify2(Pattern$1.prototype._chunkBack)(...args, this);
};
Pattern$1.prototype.loopAt = function(...args) {
  args = args.map(reify$2);
  return patternify2(Pattern$1.prototype._loopAt)(...args, this);
};
Pattern$1.prototype.zoom = function(...args) {
  args = args.map(reify$2);
  return patternify2(Pattern$1.prototype._zoom)(...args, this);
};
Pattern$1.prototype.compress = function(...args) {
  args = args.map(reify$2);
  return patternify2(Pattern$1.prototype._compress)(...args, this);
};
Pattern$1.prototype.outside = function(...args) {
  args = args.map(reify$2);
  return patternify2(Pattern$1.prototype._outside)(...args, this);
};
Pattern$1.prototype.inside = function(...args) {
  args = args.map(reify$2);
  return patternify2(Pattern$1.prototype._inside)(...args, this);
};
Pattern$1.prototype.bootstrap = function() {
  const bootstrapped = Object.fromEntries(
    Object.entries(Pattern$1.prototype.composable).map(([functionName, composable]) => {
      if (Pattern$1.prototype[functionName]) {
        Pattern$1.prototype[functionName] = makeComposable(Pattern$1.prototype[functionName]);
      }
      return [functionName, curry(composable, makeComposable)];
    })
  );
  this.patternified.forEach((prop) => {
    Pattern$1.prototype[prop] = function(...args) {
      return this._patternify(Pattern$1.prototype["_" + prop])(...args);
    };
  });
  return bootstrapped;
};
Pattern$1.prototype.define = (name, func, options = {}) => {
  if (options.composable) {
    Pattern$1.prototype.composable[name] = func;
  }
  if (options.patternified) {
    Pattern$1.prototype.patternified = Pattern$1.prototype.patternified.concat([name]);
  }
  Pattern$1.prototype.bootstrap();
};
Pattern$1.prototype.define("hush", (pat) => pat.hush(), { patternified: false, composable: true });
Pattern$1.prototype.define("bypass", (pat) => pat.bypass(on), { patternified: true, composable: true });
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
  ["f", "legato", "controls the amount of overlap between two adjacent sounds"],
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
  ["f", "velocity", ""],
  ["f", "voice", ""],
  ["f", "room", "a pattern of numbers from 0 to 1. Sets the level of reverb."],
  [
    "f",
    "size",
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
const _name = (name, ...pats) => sequence$1(...pats).withValue((x) => ({ [name]: x }));
const _setter = (func, name) => function(...pats) {
  if (!pats.length) {
    return this.fmap((value) => ({ [name]: value }));
  }
  return this.set(func(...pats));
};
generic_params.forEach(([type, name, description]) => {
  controls[name] = (...pats) => _name(name, ...pats);
  Pattern$1.prototype[name] = _setter(controls[name], name);
});
controls.createParam = (name) => {
  const func = (...pats) => _name(name, ...pats);
  Pattern$1.prototype[name] = _setter(func, name);
  return (...pats) => _name(name, ...pats);
};
controls.createParams = (...names) => names.reduce((acc, name) => Object.assign(acc, { [name]: createParam(name) }), {});
function bjorklund(slots, pulses) {
  var pattern = [], count = [], remainder = [pulses], divisor = slots - pulses, level = 0, build_pattern = function(lv) {
    if (lv == -1) {
      pattern.push(0);
    } else if (lv == -2) {
      pattern.push(1);
    } else {
      for (var x = 0; x < count[lv]; x++) {
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
const euclid = (pulses, steps, rotation = 0) => {
  const b = bjork(steps, pulses);
  if (rotation) {
    return rotate(b, -rotation);
  }
  return b;
};
Pattern$1.prototype.euclid = function(pulses, steps, rotation = 0) {
  return this.struct(euclid(pulses, steps, rotation));
};
Pattern$1.prototype.euclidLegato = function(pulses, steps, rotation = 0) {
  const bin_pat = euclid(pulses, steps, rotation);
  const firstOne = bin_pat.indexOf(1);
  const gapless = rotate(bin_pat, firstOne).join("").split("1").slice(1).map((s) => [s.length + 1, true]);
  return this.struct(timeCat$1(...gapless)).late(fraction(firstOne).div(steps));
};
function steady(value) {
  return new Pattern$1((state) => [new Hap(void 0, state.span, value)]);
}
const signal = (func) => {
  const query = (state) => [new Hap(void 0, state.span, func(state.span.midpoint()))];
  return new Pattern$1(query);
};
const isaw = signal((t) => 1 - t % 1);
const isaw2 = isaw._toBipolar();
const saw = signal((t) => t % 1);
const saw2 = saw._toBipolar();
const sine2 = signal((t) => Math.sin(Math.PI * 2 * t));
const sine = sine2._fromBipolar();
const cosine = sine._early(fraction(1).div(4));
const cosine2 = sine2._early(fraction(1).div(4));
const square = signal((t) => Math.floor(t * 2 % 2));
const square2 = square._toBipolar();
const tri = fastcat(isaw, saw);
const tri2 = fastcat(isaw2, saw2);
const time = signal(id);
const xorwise = (x) => {
  const a = x << 13 ^ x;
  const b = a >> 17 ^ a;
  return b << 5 ^ b;
};
const _frac = (x) => x - Math.trunc(x);
const timeToIntSeed = (x) => xorwise(Math.trunc(_frac(x / 300) * 536870912));
const intSeedToRand = (x) => x % 536870912 / 536870912;
const timeToRand = (x) => Math.abs(intSeedToRand(timeToIntSeed(x)));
const rand = signal(timeToRand);
const rand2 = rand._toBipolar();
const _brandBy = (p) => rand.fmap((x) => x < p);
const brandBy = (pPat) => reify$2(pPat).fmap(_brandBy).innerJoin();
const brand = _brandBy(0.5);
const _irand = (i) => rand.fmap((x) => Math.trunc(x * i));
const irand = (ipat) => reify$2(ipat).fmap(_irand).innerJoin();
const __chooseWith = (pat, xs) => {
  xs = xs.map(reify$2);
  if (xs.length == 0) {
    return silence$1;
  }
  return pat.range(0, xs.length).fmap((i) => xs[Math.floor(i)]);
};
const chooseWith = (pat, xs) => {
  return __chooseWith(pat, xs).outerJoin();
};
const chooseInWith = (pat, xs) => {
  return __chooseWith(pat, xs).innerJoin();
};
const choose = (...xs) => chooseWith(rand, xs);
Pattern$1.prototype.choose = function(...xs) {
  return chooseWith(this, xs);
};
Pattern$1.prototype.choose2 = function(...xs) {
  return chooseWith(this._fromBipolar(), xs);
};
const chooseCycles = (...xs) => chooseInWith(rand.segment(1), xs);
const randcat = chooseCycles;
const _wchooseWith = function(pat, ...pairs) {
  const values = pairs.map((pair) => reify$2(pair[0]));
  const weights = [];
  let accum = 0;
  for (const pair of pairs) {
    accum += pair[1];
    weights.push(accum);
  }
  const total = accum;
  const match = function(r) {
    const find = r * total;
    return values[weights.findIndex((x) => x > find, weights)];
  };
  return pat.fmap(match);
};
const wchooseWith = (...args) => _wchooseWith(...args).outerJoin();
const wchoose = (...pairs) => wchooseWith(rand, ...pairs);
const wchooseCycles = (...pairs) => _wchooseWith(rand, ...pairs).innerJoin();
const perlinWith = (pat) => {
  const pata = pat.fmap(Math.floor);
  const patb = pat.fmap((t) => Math.floor(t) + 1);
  const smootherStep = (x) => 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  const interp = (x) => (a) => (b) => a + smootherStep(x) * (b - a);
  return pat.sub(pata).fmap(interp).appBoth(pata.fmap(timeToRand)).appBoth(patb.fmap(timeToRand));
};
const perlin = perlinWith(time);
Pattern$1.prototype._degradeByWith = function(withPat, x) {
  return this.fmap((a) => (_) => a).appLeft(withPat._filterValues((v) => v > x));
};
Pattern$1.prototype._degradeBy = function(x) {
  return this._degradeByWith(rand, x);
};
Pattern$1.prototype.degrade = function() {
  return this._degradeBy(0.5);
};
Pattern$1.prototype._undegradeBy = function(x) {
  return this._degradeByWith(
    rand.fmap((r) => 1 - r),
    x
  );
};
Pattern$1.prototype.undegrade = function() {
  return this._undegradeBy(0.5);
};
Pattern$1.prototype._sometimesBy = function(x, func) {
  return stack$1(this._degradeBy(x), func(this._undegradeBy(1 - x)));
};
Pattern$1.prototype.sometimesBy = function(patx, func) {
  const pat = this;
  return reify$2(patx).fmap((x) => pat._sometimesBy(x, func)).innerJoin();
};
Pattern$1.prototype._sometimesByPre = function(x, func) {
  return stack$1(this._degradeBy(x), func(this).undegradeBy(1 - x));
};
Pattern$1.prototype.sometimesByPre = function(patx, func) {
  const pat = this;
  return reify$2(patx).fmap((x) => pat._sometimesByPre(x, func)).innerJoin();
};
Pattern$1.prototype.sometimes = function(func) {
  return this._sometimesBy(0.5, func);
};
Pattern$1.prototype.sometimesPre = function(func) {
  return this._sometimesByPre(0.5, func);
};
Pattern$1.prototype._someCyclesBy = function(x, func) {
  return stack$1(
    this._degradeByWith(rand._segment(1), x),
    func(this._degradeByWith(rand.fmap((r) => 1 - r)._segment(1), 1 - x))
  );
};
Pattern$1.prototype.someCyclesBy = function(patx, func) {
  const pat = this;
  return reify$2(patx).fmap((x) => pat._someCyclesBy(x, func)).innerJoin();
};
Pattern$1.prototype.someCycles = function(func) {
  return this._someCyclesBy(0.5, func);
};
Pattern$1.prototype.often = function(func) {
  return this.sometimesBy(0.75, func);
};
Pattern$1.prototype.rarely = function(func) {
  return this.sometimesBy(0.25, func);
};
Pattern$1.prototype.almostNever = function(func) {
  return this.sometimesBy(0.1, func);
};
Pattern$1.prototype.almostAlways = function(func) {
  return this.sometimesBy(0.9, func);
};
Pattern$1.prototype.never = function(func) {
  return this;
};
Pattern$1.prototype.always = function(func) {
  return func(this);
};
Pattern$1.prototype.patternified.push("degradeBy", "undegradeBy");
let synth;
try {
  synth = window == null ? void 0 : window.speechSynthesis;
} catch (err) {
  console.warn("cannot use window: not in browser?");
}
let allVoices = synth == null ? void 0 : synth.getVoices();
function speak(words, lang, voice) {
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
Pattern$1.prototype._speak = function(lang, voice) {
  return this._withHap((hap) => {
    const onTrigger = (time2, hap2) => {
      speak(hap2.value, lang, voice);
    };
    return hap.setContext({ ...hap.context, onTrigger });
  });
};
Pattern$1.prototype.speak = function(lang, voice) {
  return patternify2(Pattern$1.prototype._speak)(reify(lang), reify(voice), this);
};
const gist = (route, cache = true) => fetch(`https://gist.githubusercontent.com/${route}?cachebust=${cache ? "" : Date.now()}`).then((res) => res.text()).then((code) => eval(code));
console.log(
  "%c // \u{1F300} @strudel.cycles/core loaded \u{1F300}",
  "background-color: black;color:white;padding:4px;border-radius:15px"
);
if (globalThis._strudelLoaded) {
  console.warn(
    `@strudel.cycles/core was loaded more than once...
This might happen when you have multiple versions of strudel installed. 
Please check with "npm ls @strudel.cycles/core".`
  );
}
globalThis._strudelLoaded = true;
const strudel = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Fraction: fraction,
  gist,
  Hap,
  Pattern: Pattern$1,
  silence: silence$1,
  pure: pure$1,
  isPattern,
  reify: reify$2,
  stack: stack$1,
  slowcat: slowcat$1,
  slowcatPrime,
  fastcat,
  cat,
  timeCat: timeCat$1,
  sequence: sequence$1,
  seq,
  polymeterSteps,
  polymeter,
  pm,
  polyrhythm,
  pr,
  add,
  chop,
  chunk,
  chunkBack,
  div,
  early,
  echo,
  every,
  fast,
  inv,
  invert,
  iter,
  iterBack,
  jux,
  juxBy,
  late,
  linger,
  mask,
  mul,
  off,
  ply,
  range,
  range2,
  rev,
  slow,
  struct,
  sub,
  superimpose,
  set,
  when,
  makeComposable,
  patternify2,
  patternify3,
  patternify4,
  steady,
  signal,
  isaw,
  isaw2,
  saw,
  saw2,
  sine2,
  sine,
  cosine,
  cosine2,
  square,
  square2,
  tri,
  tri2,
  time,
  rand,
  rand2,
  _brandBy,
  brandBy,
  brand,
  _irand,
  irand,
  __chooseWith,
  chooseWith,
  chooseInWith,
  choose,
  chooseCycles,
  randcat,
  wchoose,
  wchooseCycles,
  perlinWith,
  perlin,
  State,
  TimeSpan,
  isNote,
  tokenizeNote,
  toMidi,
  fromMidi,
  getFreq,
  midi2note,
  mod,
  getPlayableNoteValue,
  getFrequency,
  rotate,
  pipe,
  compose,
  removeUndefineds,
  flatten,
  id,
  constant,
  listRange,
  curry
}, Symbol.toStringTag, { value: "Module" }));
const { pure, Pattern, Fraction, stack, slowcat, sequence, timeCat, silence, reify: reify$1 } = strudel;
var _seedState = 0;
const randOffset = 2e-4;
function _nextSeed() {
  return _seedState++;
}
const applyOptions = (parent) => (pat, i) => {
  const ast = parent.source_[i];
  const options = ast.options_;
  const operator = options == null ? void 0 : options.operator;
  if (operator) {
    switch (operator.type_) {
      case "stretch":
        const speed = Fraction(operator.arguments_.amount).inverse();
        return reify$1(pat).fast(speed);
      case "bjorklund":
        return pat.euclid(operator.arguments_.pulse, operator.arguments_.step, operator.arguments_.rotation);
      case "degradeBy":
        return reify$1(pat)._degradeByWith(rand.early(randOffset * _nextSeed()).segment(1), operator.arguments_.amount);
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
  ast.source_ = ast.source_.map((child) => {
    const { replicate, ...options } = child.options_ || {};
    if (replicate) {
      return {
        ...child,
        options_: { ...options, weight: replicate },
        source_: {
          type_: "pattern",
          arguments_: {
            alignment: "h"
          },
          source_: [
            {
              type_: "element",
              source_: child.source_,
              location_: child.location_,
              options_: {
                operator: {
                  type_: "stretch",
                  arguments_: { amount: Fraction(replicate).inverse().toString() }
                }
              }
            }
          ]
        }
      };
    }
    return child;
  });
}
function patternifyAST(ast) {
  let p;
  switch (ast.type_) {
    case "pattern":
      resolveReplications(ast);
      const children = ast.source_.map(patternifyAST).map(applyOptions(ast));
      const alignment = ast.arguments_.alignment;
      if (alignment === "v") {
        return stack(...children);
      }
      if (alignment === "r") {
        return chooseInWith(rand.early(randOffset * _nextSeed()).segment(1), children);
      }
      const weightedChildren = ast.source_.some((child) => {
        var _a;
        return !!((_a = child.options_) == null ? void 0 : _a.weight);
      });
      if (!weightedChildren && alignment === "t") {
        return slowcat(...children);
      }
      if (weightedChildren) {
        const pat = timeCat(...ast.source_.map((child, i) => {
          var _a;
          return [((_a = child.options_) == null ? void 0 : _a.weight) || 1, children[i]];
        }));
        if (alignment === "t") {
          const weightSum = ast.source_.reduce((sum, child) => {
            var _a;
            return sum + (((_a = child.options_) == null ? void 0 : _a.weight) || 1);
          }, 0);
          return pat._slow(weightSum);
        }
        return pat;
      }
      return sequence(...children);
    case "element":
      if (ast.source_ === "~") {
        return silence;
      }
      if (typeof ast.source_ !== "object") {
        if (!ast.location_) {
          console.warn("no location for", ast);
          return ast.source_;
        }
        const { start, end } = ast.location_;
        const value = !isNaN(Number(ast.source_)) ? Number(ast.source_) : ast.source_;
        return pure(value).withLocation([start.line, start.column, start.offset], [end.line, end.column, end.offset]);
      }
      p = patternifyAST(ast.source_);
      p.ast = ast;
      return p;
    case "stretch":
      p = patternifyAST(ast.source_).slow(ast.arguments_.amount);
      p.ast = ast;
      return p;
    default:
      console.warn(`node type "${ast.type_}" not implemented -> returning silence`);
      return silence;
  }
}
const mini = (...strings) => {
  const pats = strings.map((str) => {
    const ast = krillParser.parse(`"${str}"`);
    const p = patternifyAST(ast);
    p.ast = ast;
    return p;
  });
  const s = sequence(...pats);
  s.ast = pats.map((_pat) => _pat.ast);
  return s;
};
const h = (string) => {
  const ast = krillParser.parse(string);
  const p = patternifyAST(ast);
  p.ast = ast;
  return p;
};
Pattern.prototype.define("mini", mini, { composable: true });
Pattern.prototype.define("m", mini, { composable: true });
Pattern.prototype.define("h", h, { composable: true });
function minify(thing) {
  if (typeof thing === "string") {
    return mini(thing);
  }
  return reify$1(thing);
}
exports.h = h;
exports.mini = mini;
exports.minify = minify;
exports.patternifyAST = patternifyAST;
