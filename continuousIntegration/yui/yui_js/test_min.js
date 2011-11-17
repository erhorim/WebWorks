/*
 Copyright (c) 2010, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 3.1.1
 build: 47
 */
YUI.add("test", function (B) {
    B.namespace("Test");
    B.Test.Case = function (C) {
        this._should = {};
        for (var D in C) {
            this[D] = C[D];
        }
        if (!B.Lang.isString(this.name)) {
            this.name = "testCase" + B.guid();
        }
    };
    B.Test.Case.prototype = {
        resume: function (C) {
            B.Test.Runner.resume(C);
        },
        wait: function (E, D) {
            var C = arguments;
            if (B.Lang.isFunction(C[0])) {
                throw new B.Test.Wait(C[0], C[1]);
            } else {
                throw new B.Test.Wait(function () {
                    B.Assert.fail("Timeout: wait() called but resume() never called.");
                }, (B.Lang.isNumber(C[0]) ? C[0] : 10000));
            }
        },
        setUp: function () {},
        tearDown: function () {}
    };
    B.Test.Wait = function (D, C) {
        this.segment = (B.Lang.isFunction(D) ? D : null);
        this.delay = (B.Lang.isNumber(C) ? C : 0);
    };
    B.namespace("Test");
    B.Test.Suite = function (C) {
        this.name = "";
        this.items = [];
        if (B.Lang.isString(C)) {
            this.name = C;
        } else {
            if (B.Lang.isObject(C)) {
                B.mix(this, C, true);
            }
        }
        if (this.name === "") {
            this.name = "testSuite" + B.guid();
        }
    };
    B.Test.Suite.prototype = {
        add: function (C) {
            if (C instanceof B.Test.Suite || C instanceof B.Test.Case) {
                this.items.push(C);
            }
            return this;
        },
        setUp: function () {},
        tearDown: function () {}
    };
    B.Test.Runner = (function () {
        function D(E) {
            this.testObject = E;
            this.firstChild = null;
            this.lastChild = null;
            this.parent = null;
            this.next = null;
            this.results = {
                passed: 0,
                failed: 0,
                total: 0,
                ignored: 0,
                duration: 0
            };
            if (E instanceof B.Test.Suite) {
                this.results.type = "testsuite";
                this.results.name = E.name;
            } else {
                if (E instanceof B.Test.Case) {
                    this.results.type = "testcase";
                    this.results.name = E.name;
                }
            }
        }
        D.prototype = {
            appendChild: function (E) {
                var F = new D(E);
                if (this.firstChild === null) {
                    this.firstChild = this.lastChild = F;
                } else {
                    this.lastChild.next = F;
                    this.lastChild = F;
                }
                F.parent = this;
                return F;
            }
        };

        function C() {
            C.superclass.constructor.apply(this, arguments);
            this.masterSuite = new B.Test.Suite("yuitests" + (new Date()).getTime());
            this._cur = null;
            this._root = null;
            this._log = true;
            this._waiting = false;
            this._running = false;
            this._lastResults = null;
            var F = [this.TEST_CASE_BEGIN_EVENT, this.TEST_CASE_COMPLETE_EVENT, this.TEST_SUITE_BEGIN_EVENT, this.TEST_SUITE_COMPLETE_EVENT, this.TEST_PASS_EVENT, this.TEST_FAIL_EVENT, this.TEST_IGNORE_EVENT, this.COMPLETE_EVENT, this.BEGIN_EVENT];
            for (var E = 0; E < F.length; E++) {
                this.on(F[E], this._logEvent, this, true);
            }
        }
        B.extend(C, B.Event.Target, {
            TEST_CASE_BEGIN_EVENT: "testcasebegin",
            TEST_CASE_COMPLETE_EVENT: "testcasecomplete",
            TEST_SUITE_BEGIN_EVENT: "testsuitebegin",
            TEST_SUITE_COMPLETE_EVENT: "testsuitecomplete",
            TEST_PASS_EVENT: "pass",
            TEST_FAIL_EVENT: "fail",
            TEST_IGNORE_EVENT: "ignore",
            COMPLETE_EVENT: "complete",
            BEGIN_EVENT: "begin",
            disableLogging: function () {
                this._log = false;
            },
            enableLogging: function () {
                this._log = true;
            },
            _logEvent: function (G) {
                var F = "";
                var E = "";
                switch (G.type) {
                case this.BEGIN_EVENT:
                    F = "Testing began at " + (new Date()).toString() + ".";
                    E = "info";
                    break;
                case this.COMPLETE_EVENT:
                    F = "Testing completed at " + (new Date()).toString() + ".\nPassed:" + G.results.passed + " Failed:" + G.results.failed + " Total:" + G.results.total;
                    E = "info";
                    break;
                case this.TEST_FAIL_EVENT:
                    F = G.testName + ": failed.\n" + G.error.getMessage();
                    E = "fail";
                    break;
                case this.TEST_IGNORE_EVENT:
                    F = G.testName + ": ignored.";
                    E = "ignore";
                    break;
                case this.TEST_PASS_EVENT:
                    F = G.testName + ": passed.";
                    E = "pass";
                    break;
                case this.TEST_SUITE_BEGIN_EVENT:
                    F = 'Test suite "' + G.testSuite.name + '" started.';
                    E = "info";
                    break;
                case this.TEST_SUITE_COMPLETE_EVENT:
                    F = 'Test suite "' + G.testSuite.name + '" completed.\nPassed:' + G.results.passed + " Failed:" + G.results.failed + " Total:" + G.results.total;
                    E = "info";
                    break;
                case this.TEST_CASE_BEGIN_EVENT:
                    F = 'Test case "' + G.testCase.name + '" started.';
                    E = "info";
                    break;
                case this.TEST_CASE_COMPLETE_EVENT:
                    F = 'Test case "' + G.testCase.name + '" completed.\nPassed:' + G.results.passed + " Failed:" + G.results.failed + " Total:" + G.results.total;
                    E = "info";
                    break;
                default:
                    F = "Unexpected event " + G.type;
                    F = "info";
                }
                if (this._log) {
                    B.log(F, E, "TestRunner");
                }
            },
            _addTestCaseToTestTree: function (F, G) {
                var H = F.appendChild(G),
                    I, E;
                for (I in G) {
                    if ((I.indexOf("test") === 0 || (I.toLowerCase().indexOf("should") > -1 && I.indexOf(" ") > -1)) && B.Lang.isFunction(G[I])) {
                        H.appendChild(I);
                    }
                }
            },
            _addTestSuiteToTestTree: function (E, H) {
                var G = E.appendChild(H);
                for (var F = 0; F < H.items.length; F++) {
                    if (H.items[F] instanceof B.Test.Suite) {
                        this._addTestSuiteToTestTree(G, H.items[F]);
                    } else {
                        if (H.items[F] instanceof B.Test.Case) {
                            this._addTestCaseToTestTree(G, H.items[F]);
                        }
                    }
                }
            },
            _buildTestTree: function () {
                this._root = new D(this.masterSuite);
                for (var E = 0; E < this.masterSuite.items.length; E++) {
                    if (this.masterSuite.items[E] instanceof B.Test.Suite) {
                        this._addTestSuiteToTestTree(this._root, this.masterSuite.items[E]);
                    } else {
                        if (this.masterSuite.items[E] instanceof B.Test.Case) {
                            this._addTestCaseToTestTree(this._root, this.masterSuite.items[E]);
                        }
                    }
                }
            },
            _handleTestObjectComplete: function (E) {
                if (B.Lang.isObject(E.testObject)) {
                    E.parent.results.passed += E.results.passed;
                    E.parent.results.failed += E.results.failed;
                    E.parent.results.total += E.results.total;
                    E.parent.results.ignored += E.results.ignored;
                    E.parent.results[E.testObject.name] = E.results;
                    if (E.testObject instanceof B.Test.Suite) {
                        E.testObject.tearDown();
                        E.results.duration = (new Date()) - E._start;
                        this.fire(this.TEST_SUITE_COMPLETE_EVENT, {
                            testSuite: E.testObject,
                            results: E.results
                        });
                    } else {
                        if (E.testObject instanceof B.Test.Case) {
                            E.results.duration = (new Date()) - E._start;
                            this.fire(this.TEST_CASE_COMPLETE_EVENT, {
                                testCase: E.testObject,
                                results: E.results
                            });
                        }
                    }
                }
            },
            _next: function () {
                if (this._cur === null) {
                    this._cur = this._root;
                } else {
                    if (this._cur.firstChild) {
                        this._cur = this._cur.firstChild;
                    } else {
                        if (this._cur.next) {
                            this._cur = this._cur.next;
                        } else {
                            while (this._cur && !this._cur.next && this._cur !== this._root) {
                                this._handleTestObjectComplete(this._cur);
                                this._cur = this._cur.parent;
                            }
                            if (this._cur == this._root) {
                                this._cur.results.type = "report";
                                this._cur.results.timestamp = (new Date()).toLocaleString();
                                this._cur.results.duration = (new Date()) - this._cur._start;
                                this._lastResults = this._cur.results;
                                this._running = false;
                                this.fire(this.COMPLETE_EVENT, {
                                    results: this._lastResults
                                });
                                this._cur = null;
                            } else {
                                this._handleTestObjectComplete(this._cur);
                                this._cur = this._cur.next;
                            }
                        }
                    }
                }
                return this._cur;
            },
            _run: function () {
                var G = false;
                var F = this._next();
                if (F !== null) {
                    this._running = true;
                    this._lastResult = null;
                    var E = F.testObject;
                    if (B.Lang.isObject(E)) {
                        if (E instanceof B.Test.Suite) {
                            this.fire(this.TEST_SUITE_BEGIN_EVENT, {
                                testSuite: E
                            });
                            F._start = new Date();
                            E.setUp();
                        } else {
                            if (E instanceof B.Test.Case) {
                                this.fire(this.TEST_CASE_BEGIN_EVENT, {
                                    testCase: E
                                });
                                F._start = new Date();
                            }
                        }
                        if (typeof setTimeout != "undefined") {
                            setTimeout(function () {
                                B.Test.Runner._run();
                            }, 0);
                        } else {
                            this._run();
                        }
                    } else {
                        this._runTest(F);
                    }
                }
            },
            _resumeTest: function (J) {
                var E = this._cur;
                this._waiting = false;
                if (!E) {
                    return;
                }
                var K = E.testObject;
                var H = E.parent.testObject;
                if (H.__yui_wait) {
                    clearTimeout(H.__yui_wait);
                    delete H.__yui_wait;
                }
                var N = (H._should.fail || {})[K];
                var F = (H._should.error || {})[K];
                var I = false;
                var L = null;
                try {
                    J.apply(H);
                    if (N) {
                        L = new B.Assert.ShouldFail();
                        I = true;
                    } else {
                        if (F) {
                            L = new B.Assert.ShouldError();
                            I = true;
                        }
                    }
                } catch (M) {
                    if (H.__yui_wait) {
                        clearTimeout(H.__yui_wait);
                        delete H.__yui_wait;
                    }
                    if (M instanceof B.Assert.Error) {
                        if (!N) {
                            L = M;
                            I = true;
                        }
                    } else {
                        if (M instanceof B.Test.Wait) {
                            if (B.Lang.isFunction(M.segment)) {
                                if (B.Lang.isNumber(M.delay)) {
                                    if (typeof setTimeout != "undefined") {
                                        H.__yui_wait = setTimeout(function () {
                                            B.Test.Runner._resumeTest(M.segment);
                                        }, M.delay);
                                        this._waiting = true;
                                    } else {
                                        throw new Error("Asynchronous tests not supported in this environment.");
                                    }
                                }
                            }
                            return;
                        } else {
                            if (!F) {
                                L = new B.Assert.UnexpectedError(M);
                                I = true;
                            } else {
                                if (B.Lang.isString(F)) {
                                    if (M.message != F) {
                                        L = new B.Assert.UnexpectedError(M);
                                        I = true;
                                    }
                                } else {
                                    if (B.Lang.isFunction(F)) {
                                        if (!(M instanceof F)) {
                                            L = new B.Assert.UnexpectedError(M);
                                            I = true;
                                        }
                                    } else {
                                        if (B.Lang.isObject(F)) {
                                            if (!(M instanceof F.constructor) || M.message != F.message) {
                                                L = new B.Assert.UnexpectedError(M);
                                                I = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (I) {
                    this.fire(this.TEST_FAIL_EVENT, {
                        testCase: H,
                        testName: K,
                        error: L
                    });
                } else {
                    this.fire(this.TEST_PASS_EVENT, {
                        testCase: H,
                        testName: K
                    });
                }
                H.tearDown();
                var G = (new Date()) - E._start;
                E.parent.results[K] = {
                    result: I ? "fail" : "pass",
                    message: L ? L.getMessage() : "Test passed",
                    type: "test",
                    name: K,
                    duration: G
                };
                if (I) {
                    E.parent.results.failed++;
                } else {
                    E.parent.results.passed++;
                }
                E.parent.results.total++;
                if (typeof setTimeout != "undefined") {
                    setTimeout(function () {
                        B.Test.Runner._run();
                    }, 0);
                } else {
                    this._run();
                }
            },
            _handleError: function (E) {
                if (this._waiting) {
                    this._resumeTest(function () {
                        throw E;
                    });
                } else {
                    throw E;
                }
            },
            _runTest: function (H) {
                var E = H.testObject;
                var F = H.parent.testObject;
                var I = F[E];
                var G = (F._should.ignore || {})[E];
                if (G) {
                    H.parent.results[E] = {
                        result: "ignore",
                        message: "Test ignored",
                        type: "test",
                        name: E
                    };
                    H.parent.results.ignored++;
                    H.parent.results.total++;
                    this.fire(this.TEST_IGNORE_EVENT, {
                        testCase: F,
                        testName: E
                    });
                    if (typeof setTimeout != "undefined") {
                        setTimeout(function () {
                            B.Test.Runner._run();
                        }, 0);
                    } else {
                        this._run();
                    }
                } else {
                    H._start = new Date();
                    F.setUp();
                    this._resumeTest(I);
                }
            },
            getName: function () {
                return this.masterSuite.name;
            },
            setName: function (E) {
                this.masterSuite.name = E;
            },
            fire: function (E, F) {
                F = F || {};
                F.type = E;
                C.superclass.fire.call(this, E, F);
            },
            add: function (E) {
                this.masterSuite.add(E);
                return this;
            },
            clear: function () {
                this.masterSuite = new B.Test.Suite("yuitests" + (new Date()).getTime());
            },
            isWaiting: function () {
                return this._waiting;
            },
            isRunning: function () {
                return this._running;
            },
            getResults: function (E) {
                if (!this._running && this._lastResults) {
                    if (B.Lang.isFunction(E)) {
                        return E(this._lastResults);
                    } else {
                        return this._lastResults;
                    }
                } else {
                    return null;
                }
            },
            getCoverage: function (E) {
                if (!this._running && typeof _yuitest_coverage == "object") {
                    if (B.Lang.isFunction(E)) {
                        return E(_yuitest_coverage);
                    } else {
                        return _yuitest_coverage;
                    }
                } else {
                    return null;
                }
            },
            resume: function (E) {
                this._resumeTest(E ||
                function () {});
            },
            run: function (E) {
                var F = B.Test.Runner;
                if (!E && this.masterSuite.items.length == 1 && this.masterSuite.items[0] instanceof B.Test.Suite) {
                    this.masterSuite = this.masterSuite.items[0];
                }
                F._buildTestTree();
                F._root._start = new Date();
                F.fire(F.BEGIN_EVENT);
                F._run();
            }
        });
        return new C();
    })();
    B.Assert = {
        _asserts: 0,
        _formatMessage: function (D, C) {
            var E = D;
            if (B.Lang.isString(D) && D.length > 0) {
                return B.Lang.substitute(D, {
                    message: C
                });
            } else {
                return C;
            }
        },
        _getCount: function () {
            return this._asserts;
        },
        _increment: function () {
            this._asserts++;
        },
        _reset: function () {
            this._asserts = 0;
        },
        fail: function (C) {
            throw new B.Assert.Error(B.Assert._formatMessage(C, "Test force-failed."));
        },
        areEqual: function (D, E, C) {
            B.Assert._increment();
            if (D != E) {
                throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, "Values should be equal."), D, E);
            }
        },
        areNotEqual: function (C, E, D) {
            B.Assert._increment();
            if (C == E) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(D, "Values should not be equal."), C);
            }
        },
        areNotSame: function (C, E, D) {
            B.Assert._increment();
            if (C === E) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(D, "Values should not be the same."), C);
            }
        },
        areSame: function (D, E, C) {
            B.Assert._increment();
            if (D !== E) {
                throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, "Values should be the same."), D, E);
            }
        },
        isFalse: function (D, C) {
            B.Assert._increment();
            if (false !== D) {
                throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, "Value should be false."), false, D);
            }
        },
        isTrue: function (D, C) {
            B.Assert._increment();
            if (true !== D) {
                throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, "Value should be true."), true, D);
            }
        },
        isNaN: function (D, C) {
            B.Assert._increment();
            if (!isNaN(D)) {
                throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, "Value should be NaN."), NaN, D);
            }
        },
        isNotNaN: function (D, C) {
            B.Assert._increment();
            if (isNaN(D)) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(C, "Values should not be NaN."), NaN);
            }
        },
        isNotNull: function (D, C) {
            B.Assert._increment();
            if (B.Lang.isNull(D)) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(C, "Values should not be null."), null);
            }
        },
        isNotUndefined: function (D, C) {
            B.Assert._increment();
            if (B.Lang.isUndefined(D)) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(C, "Value should not be undefined."), undefined);
            }
        },
        isNull: function (D, C) {
            B.Assert._increment();
            if (!B.Lang.isNull(D)) {
                throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, "Value should be null."), null, D);
            }
        },
        isUndefined: function (D, C) {
            B.Assert._increment();
            if (!B.Lang.isUndefined(D)) {
                throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, "Value should be undefined."), undefined, D);
            }
        },
        isArray: function (D, C) {
            B.Assert._increment();
            if (!B.Lang.isArray(D)) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(C, "Value should be an array."), D);
            }
        },
        isBoolean: function (D, C) {
            B.Assert._increment();
            if (!B.Lang.isBoolean(D)) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(C, "Value should be a Boolean."), D);
            }
        },
        isFunction: function (D, C) {
            B.Assert._increment();
            if (!B.Lang.isFunction(D)) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(C, "Value should be a function."), D);
            }
        },
        isInstanceOf: function (D, E, C) {
            B.Assert._increment();
            if (!(E instanceof D)) {
                throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, "Value isn't an instance of expected type."), D, E);
            }
        },
        isNumber: function (D, C) {
            B.Assert._increment();
            if (!B.Lang.isNumber(D)) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(C, "Value should be a number."), D);
            }
        },
        isObject: function (D, C) {
            B.Assert._increment();
            if (!B.Lang.isObject(D)) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(C, "Value should be an object."), D);
            }
        },
        isString: function (D, C) {
            B.Assert._increment();
            if (!B.Lang.isString(D)) {
                throw new B.Assert.UnexpectedValue(B.Assert._formatMessage(C, "Value should be a string."), D);
            }
        },
        isTypeOf: function (C, E, D) {
            B.Assert._increment();
            if (typeof E != C) {
                throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(D, "Value should be of type " + C + "."), expected, typeof E);
            }
        }
    };
    B.assert = function (D, C) {
        B.Assert._increment();
        if (!D) {
            throw new B.Assert.Error(B.Assert._formatMessage(C, "Assertion failed."));
        }
    };
    B.fail = B.Assert.fail;
    B.Assert.Error = function (C) {
        arguments.callee.superclass.constructor.call(this, C);
        this.message = C;
        this.name = "Assert Error";
    };
    B.extend(B.Assert.Error, Error, {
        getMessage: function () {
            return this.message;
        },
        toString: function () {
            return this.name + ": " + this.getMessage();
        },
        valueOf: function () {
            return this.toString();
        }
    });
    B.Assert.ComparisonFailure = function (D, C, E) {
        arguments.callee.superclass.constructor.call(this, D);
        this.expected = C;
        this.actual = E;
        this.name = "ComparisonFailure";
    };
    B.extend(B.Assert.ComparisonFailure, B.Assert.Error, {
        getMessage: function () {
            return this.message + "\nExpected: " + this.expected + " (" + (typeof this.expected) + ")" + "\nActual: " + this.actual + " (" + (typeof this.actual) + ")";
        }
    });
    B.Assert.UnexpectedValue = function (D, C) {
        arguments.callee.superclass.constructor.call(this, D);
        this.unexpected = C;
        this.name = "UnexpectedValue";
    };
    B.extend(B.Assert.UnexpectedValue, B.Assert.Error, {
        getMessage: function () {
            return this.message + "\nUnexpected: " + this.unexpected + " (" + (typeof this.unexpected) + ") ";
        }
    });
    B.Assert.ShouldFail = function (C) {
        arguments.callee.superclass.constructor.call(this, C || "This test should fail but didn't.");
        this.name = "ShouldFail";
    };
    B.extend(B.Assert.ShouldFail, B.Assert.Error);
    B.Assert.ShouldError = function (C) {
        arguments.callee.superclass.constructor.call(this, C || "This test should have thrown an error but didn't.");
        this.name = "ShouldError";
    };
    B.extend(B.Assert.ShouldError, B.Assert.Error);
    B.Assert.UnexpectedError = function (C) {
        arguments.callee.superclass.constructor.call(this, "Unexpected error: " + C.message);
        this.cause = C;
        this.name = "UnexpectedError";
        this.stack = C.stack;
    };
    B.extend(B.Assert.UnexpectedError, B.Assert.Error);
    B.ArrayAssert = {
        contains: function (E, D, C) {
            B.Assert._increment();
            if (B.Array.indexOf(D, E) == -1) {
                B.Assert.fail(B.Assert._formatMessage(C, "Value " + E + " (" + (typeof E) + ") not found in array [" + D + "]."));
            }
        },
        containsItems: function (E, F, D) {
            B.Assert._increment();
            for (var C = 0; C < E.length; C++) {
                if (B.Array.indexOf(F, E[C]) == -1) {
                    B.Assert.fail(B.Assert._formatMessage(D, "Value " + E[C] + " (" + (typeof E[C]) + ") not found in array [" + F + "]."));
                }
            }
        },
        containsMatch: function (E, D, C) {
            B.Assert._increment();
            if (typeof E != "function") {
                throw new TypeError("ArrayAssert.containsMatch(): First argument must be a function.");
            }
            if (!B.Array.some(D, E)) {
                B.Assert.fail(B.Assert._formatMessage(C, "No match found in array [" + D + "]."));
            }
        },
        doesNotContain: function (E, D, C) {
            B.Assert._increment();
            if (B.Array.indexOf(D, E) > -1) {
                B.Assert.fail(B.Assert._formatMessage(C, "Value found in array [" + D + "]."));
            }
        },
        doesNotContainItems: function (E, F, D) {
            B.Assert._increment();
            for (var C = 0; C < E.length; C++) {
                if (B.Array.indexOf(F, E[C]) > -1) {
                    B.Assert.fail(B.Assert._formatMessage(D, "Value found in array [" + F + "]."));
                }
            }
        },
        doesNotContainMatch: function (E, D, C) {
            B.Assert._increment();
            if (typeof E != "function") {
                throw new TypeError("ArrayAssert.doesNotContainMatch(): First argument must be a function.");
            }
            if (B.Array.some(D, E)) {
                B.Assert.fail(B.Assert._formatMessage(C, "Value found in array [" + D + "]."));
            }
        },
        indexOf: function (G, F, C, E) {
            B.Assert._increment();
            for (var D = 0; D < F.length; D++) {
                if (F[D] === G) {
                    if (C != D) {
                        B.Assert.fail(B.Assert._formatMessage(E, "Value exists at index " + D + " but should be at index " + C + "."));
                    }
                    return;
                }
            }
            B.Assert.fail(B.Assert._formatMessage(E, "Value doesn't exist in array [" + F + "]."));
        },
        itemsAreEqual: function (E, F, D) {
            B.Assert._increment();
            if (E.length != F.length) {
                B.Assert.fail(B.Assert._formatMessage(D, "Array should have a length of " + E.length + " but has a length of " + F.length));
            }
            for (var C = 0; C < E.length; C++) {
                if (E[C] != F[C]) {
                    throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(D, "Values in position " + C + " are not equal."), E[C], F[C]);
                }
            }
        },
        itemsAreEquivalent: function (F, G, C, E) {
            B.Assert._increment();
            if (typeof C != "function") {
                throw new TypeError("ArrayAssert.itemsAreEquivalent(): Third argument must be a function.");
            }
            if (F.length != G.length) {
                B.Assert.fail(B.Assert._formatMessage(E, "Array should have a length of " + F.length + " but has a length of " + G.length));
            }
            for (var D = 0; D < F.length; D++) {
                if (!C(F[D], G[D])) {
                    throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(E, "Values in position " + D + " are not equivalent."), F[D], G[D]);
                }
            }
        },
        isEmpty: function (D, C) {
            B.Assert._increment();
            if (D.length > 0) {
                B.Assert.fail(B.Assert._formatMessage(C, "Array should be empty."));
            }
        },
        isNotEmpty: function (D, C) {
            B.Assert._increment();
            if (D.length === 0) {
                B.Assert.fail(B.Assert._formatMessage(C, "Array should not be empty."));
            }
        },
        itemsAreSame: function (E, F, D) {
            B.Assert._increment();
            if (E.length != F.length) {
                B.Assert.fail(B.Assert._formatMessage(D, "Array should have a length of " + E.length + " but has a length of " + F.length));
            }
            for (var C = 0; C < E.length; C++) {
                if (E[C] !== F[C]) {
                    throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(D, "Values in position " + C + " are not the same."), E[C], F[C]);
                }
            }
        },
        lastIndexOf: function (G, F, C, E) {
            for (var D = F.length; D >= 0; D--) {
                if (F[D] === G) {
                    if (C != D) {
                        B.Assert.fail(B.Assert._formatMessage(E, "Value exists at index " + D + " but should be at index " + C + "."));
                    }
                    return;
                }
            }
            B.Assert.fail(B.Assert._formatMessage(E, "Value doesn't exist in array."));
        }
    };
    B.ObjectAssert = {
        areEqual: function (D, E, C) {
            B.Assert._increment();
            B.Object.each(D, function (G, F) {
                if (D[F] != E[F]) {
                    throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, "Values should be equal for property " + F), D[F], E[F]);
                }
            });
        },
        hasKey: function (C, D, E) {
            B.Assert._increment();
            if (!B.Object.hasKey(D, C)) {
                B.fail(B.Assert._formatMessage(E, "Property '" + C + "' not found on object."));
            }
        },
        hasKeys: function (E, C, F) {
            B.Assert._increment();
            for (var D = 0; D < E.length; D++) {
                if (!B.Object.hasKey(C, E[D])) {
                    B.fail(B.Assert._formatMessage(F, "Property '" + E[D] + "' not found on object."));
                }
            }
        },
        ownsKey: function (C, D, E) {
            B.Assert._increment();
            if (!D.hasOwnProperty(C)) {
                B.fail(B.Assert._formatMessage(E, "Property '" + C + "' not found on object instance."));
            }
        },
        ownsKeys: function (E, C, F) {
            B.Assert._increment();
            for (var D = 0; D < E.length; D++) {
                if (!C.hasOwnProperty(E[D])) {
                    B.fail(B.Assert._formatMessage(F, "Property '" + E[D] + "' not found on object instance."));
                }
            }
        },
        ownsNoKeys: function (C, E) {
            B.Assert._increment();
            var D = B.Object.keys(C);
            if (D.length > 0) {
                B.fail(B.Assert._formatMessage(E, "Object owns " + D.length + " properties but should own none."));
            }
        }
    };
    B.DateAssert = {
        datesAreEqual: function (D, F, C) {
            B.Assert._increment();
            if (D instanceof Date && F instanceof Date) {
                var E = "";
                if (D.getFullYear() != F.getFullYear()) {
                    E = "Years should be equal.";
                }
                if (D.getMonth() != F.getMonth()) {
                    E = "Months should be equal.";
                }
                if (D.getDate() != F.getDate()) {
                    E = "Days of month should be equal.";
                }
                if (E.length) {
                    throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, E), D, F);
                }
            } else {
                throw new TypeError("Y.Assert.datesAreEqual(): Expected and actual values must be Date objects.");
            }
        },
        timesAreEqual: function (D, F, C) {
            B.Assert._increment();
            if (D instanceof Date && F instanceof Date) {
                var E = "";
                if (D.getHours() != F.getHours()) {
                    E = "Hours should be equal.";
                }
                if (D.getMinutes() != F.getMinutes()) {
                    E = "Minutes should be equal.";
                }
                if (D.getSeconds() != F.getSeconds()) {
                    E = "Seconds should be equal.";
                }
                if (E.length) {
                    throw new B.Assert.ComparisonFailure(B.Assert._formatMessage(C, E), D, F);
                }
            } else {
                throw new TypeError("DateY.AsserttimesAreEqual(): Expected and actual values must be Date objects.");
            }
        }
    };
    B.namespace("Test.Format");

    function A(C) {
        return C.replace(/[<>"'&]/g, function (D) {
            switch (D) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            case "'":
                return "&apos;";
            case "&":
                return "&amp;";
            }
        });
    }
    B.Test.Format.JSON = function (C) {
        return B.JSON.stringify(C);
    };
    B.Test.Format.XML = function (D) {
        function C(G) {
            var E = B.Lang,
                F = "<" + G.type + ' name="' + A(G.name) + '"';
            if (E.isNumber(G.duration)) {
                F += ' duration="' + G.duration + '"';
            }
            if (G.type == "test") {
                F += ' result="' + G.result + '" message="' + A(G.message) + '">';
            } else {
                F += ' passed="' + G.passed + '" failed="' + G.failed + '" ignored="' + G.ignored + '" total="' + G.total + '">';
                B.Object.each(G, function (H) {
                    if (E.isObject(H) && !E.isArray(H)) {
                        F += C(H);
                    }
                });
            }
            F += "</" + G.type + ">";
            return F;
        }
        return '<?xml version="1.0" encoding="UTF-8"?>' + C(D);
    };
    B.Test.Format.JUnitXML = function (C) {
        function D(G) {
            var E = B.Lang,
                F = "";
            switch (G.type) {
            case "test":
                if (G.result != "ignore") {
                    F = '<testcase name="' + A(G.name) + '" time="' + (G.duration / 1000) + '">';
                    if (G.result == "fail") {
                        F += '<failure message="' + A(G.message) + '"><![CDATA[' + G.message + "]]></failure>";
                    }
                    F += "</testcase>";
                }
                break;
            case "testcase":
                F = '<testsuite name="' + A(G.name) + '" tests="' + G.total + '" failures="' + G.failed + '" time="' + (G.duration / 1000) + '">';
                B.Object.each(G, function (H) {
                    if (E.isObject(H) && !E.isArray(H)) {
                        F += D(H);
                    }
                });
                F += "</testsuite>";
                break;
            case "testsuite":
                B.Object.each(G, function (H) {
                    if (E.isObject(H) && !E.isArray(H)) {
                        F += D(H);
                    }
                });
                break;
            case "report":
                F = "<testsuites>";
                B.Object.each(G, function (H) {
                    if (E.isObject(H) && !E.isArray(H)) {
                        F += D(H);
                    }
                });
                F += "</testsuites>";
            }
            return F;
        }
        return '<?xml version="1.0" encoding="UTF-8"?>' + D(C);
    };
    B.Test.Format.TAP = function (D) {
        var E = 1;

        function C(G) {
            var F = B.Lang,
                H = "";
            switch (G.type) {
            case "test":
                if (G.result != "ignore") {
                    H = "ok " + (E++) + " - " + G.name;
                    if (G.result == "fail") {
                        H = "not " + H + " - " + G.message;
                    }
                    H += "\n";
                } else {
                if( this.framework.displayIgnored)
                    H = "#Ignored test " + G.name + "\n";
                }
                break;
            case "testcase":
                H = "#Begin testcase " + G.name + "(" + G.failed + " failed of " + G.total + ")\n";
                B.Object.each(G, function (I) {
                    if (F.isObject(I) && !F.isArray(I)) {
                        H += C(I);
                    }
                });
                H += "#End testcase " + G.name + "\n";
                break;
            case "testsuite":
                H = "#Begin testsuite " + G.name + "(" + G.failed + " failed of " + G.total + ")\n";
                B.Object.each(G, function (I) {
                    if (F.isObject(I) && !F.isArray(I)) {
                        H += C(I);
                    }
                });
                H += "#End testsuite " + G.name + "\n";
                break;
            case "report":
                B.Object.each(G, function (I) {
                    if (F.isObject(I) && !F.isArray(I)) {
                        H += C(I);
                    }
                });
            }
            return H;
        }
        return "1.." + D.total + "\n" + C(D);
    };
    B.namespace("Coverage.Format");
    B.Coverage.Format.JSON = function (C) {
        return B.JSON.stringify(C);
    };
    B.Coverage.Format.XdebugJSON = function (D) {
        var C = {};
        B.Object.each(D, function (F, E) {
            C[E] = D[E].lines;
        });
        return B.JSON.stringify(C);
    };
    B.namespace("Test");
    B.Test.Reporter = function (C, D) {
        this.url = C;
        this.format = D || B.Test.Format.XML;
        this._fields = new Object();
        this._form = null;
        this._iframe = null;
    };
    B.Test.Reporter.prototype = {
        constructor: B.Test.Reporter,
        addField: function (C, D) {
            this._fields[C] = D;
        },
        clearFields: function () {
            this._fields = new Object();
        },
        destroy: function () {
            if (this._form) {
                this._form.parentNode.removeChild(this._form);
                this._form = null;
            }
            if (this._iframe) {
                this._iframe.parentNode.removeChild(this._iframe);
                this._iframe = null;
            }
            this._fields = null;
        },
        report: function (C) {
            if (!this._form) {
                this._form = document.createElement("form");
                this._form.method = "post";
                this._form.style.visibility = "hidden";
                this._form.style.position = "absolute";
                this._form.style.top = 0;
                document.body.appendChild(this._form);
                if (B.UA.ie) {
                    this._iframe = document.createElement('<iframe name="yuiTestTarget" />');
                } else {
                    this._iframe = document.createElement("iframe");
                    this._iframe.name = "yuiTestTarget";
                }
                this._iframe.src = "javascript:false";
                this._iframe.style.visibility = "hidden";
                this._iframe.style.position = "absolute";
                this._iframe.style.top = 0;
                document.body.appendChild(this._iframe);
                this._form.target = "yuiTestTarget";
            }
            this._form.action = this.url;
            while (this._form.hasChildNodes()) {
                this._form.removeChild(this._form.lastChild);
            }
            this._fields.results = this.format(C);
            this._fields.useragent = navigator.userAgent;
            this._fields.timestamp = (new Date()).toLocaleString();
            B.Object.each(this._fields, function (E, F) {
                if (typeof E != "function") {
                    var D = document.createElement("input");
                    D.type = "hidden";
                    D.name = F;
                    D.value = E;
                    this._form.appendChild(D);
                }
            }, this);
            delete this._fields.results;
            delete this._fields.useragent;
            delete this._fields.timestamp;
            if (arguments[1] !== false) {
                this._form.submit();
            }
        }
    };
    B.Mock = function (E) {
        E = E || {};
        var C = null;
        try {
            C = B.Object(E);
        } catch (D) {
            C = {};
            B.log("Couldn't create mock with prototype.", "warn", "Mock");
        }
        B.Object.each(E, function (F) {
            if (B.Lang.isFunction(E[F])) {
                C[F] = function () {
                    B.Assert.fail("Method " + F + "() was called but was not expected to be.");
                };
            }
        });
        return C;
    };
    B.Mock.expect = function (D, H) {
        if (!D.__expectations) {
            D.__expectations = {};
        }
        if (H.method) {
            var G = H.method,
                F = H.args || H.arguments || [],
                C = H.returns,
                J = B.Lang.isNumber(H.callCount) ? H.callCount : 1,
                E = H.error,
                I = H.run ||
                function () {};
            D.__expectations[G] = H;
            H.callCount = J;
            H.actualCallCount = 0;
            B.Array.each(F, function (K, L, M) {
                if (!(M[L] instanceof B.Mock.Value)) {
                    M[L] = B.Mock.Value(B.Assert.areSame, [K], "Argument " + L + " of " + G + "() is incorrect.");
                }
            });
            if (J > 0) {
                D[G] = function () {
                    try {
                        H.actualCallCount++;
                        B.Assert.areEqual(F.length, arguments.length, "Method " + G + "() passed incorrect number of arguments.");
                        for (var M = 0, K = F.length; M < K; M++) {
                            F[M].verify(arguments[M]);
                        }
                        I.apply(this, arguments);
                        if (E) {
                            throw E;
                        }
                    } catch (L) {
                        B.Test.Runner._handleError(L);
                    }
                    return C;
                };
            } else {
                D[G] = function () {
                    try {
                        B.Assert.fail("Method " + G + "() should not have been called.");
                    } catch (K) {
                        B.Test.Runner._handleError(K);
                    }
                };
            }
        } else {
            if (H.property) {
                D.__expectations[G] = H;
            }
        }
    };
    B.Mock.verify = function (C) {
        try {
            B.Object.each(C.__expectations, function (E) {
                if (E.method) {
                    B.Assert.areEqual(E.callCount, E.actualCallCount, "Method " + E.method + "() wasn't called the expected number of times.");
                } else {
                    if (E.property) {
                        B.Assert.areEqual(E.value, C[E.property], "Property " + E.property + " wasn't set to the correct value.");
                    }
                }
            });
        } catch (D) {
            B.Test.Runner._handleError(D);
        }
    };
    B.Mock.Value = function (E, C, D) {
        if (this instanceof B.Mock.Value) {
            this.verify = function (G) {
                var F = [].concat(C || []);
                F.push(G);
                F.push(D);
                E.apply(null, F);
            };
        } else {
            return new B.Mock.Value(E, C, D);
        }
    };
    B.Mock.Value.Any = B.Mock.Value(function () {});
    B.Mock.Value.Boolean = B.Mock.Value(B.Assert.isBoolean);
    B.Mock.Value.Number = B.Mock.Value(B.Assert.isNumber);
    B.Mock.Value.String = B.Mock.Value(B.Assert.isString);
    B.Mock.Value.Object = B.Mock.Value(B.Assert.isObject);
    B.Mock.Value.Function = B.Mock.Value(B.Assert.isFunction);
    YUITest = {
        TestRunner: B.Test.Runner,
        ResultsFormat: B.Test.Format,
        CoverageFormat: B.Coverage.Format
    };
}, "3.1.1", {
    requires: ["substitute", "event-base"]
});