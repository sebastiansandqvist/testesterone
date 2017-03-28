var test = (function () {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var keys = createCommonjsModule(function (module, exports) {
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) { keys.push(key); }
  return keys;
}
});

var is_arguments = createCommonjsModule(function (module, exports) {
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
}
});

var index$2 = createCommonjsModule(function (module) {
var pSlice = Array.prototype.slice;



var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) { opts = {}; }
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') { return false; }
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') { return false; }
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    { return false; }
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) { return false; }
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (is_arguments(a)) {
    if (!is_arguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) { return false; }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) { return false; }
    }
    return true;
  }
  try {
    var ka = keys(a),
        kb = keys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    { return false; }
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      { return false; }
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) { return false; }
  }
  return typeof a === typeof b;
}
});

var functionQueue = [];
var nestDepth = 0;

function makeGroup(label) {
	nestDepth++;
	console.group(label);
}

function endGroup() {
	nestDepth--;
	console.groupEnd();
}

window.addEventListener('error', function() {
	while (nestDepth > 0) {
		endGroup();
	}
});

var makeNoop = function () { return function () {}; };

var globalStartTime = performance.now();
var passCount = 0;
var failCount = 0;
var pendingCount = 0;

function it(label, fn) {
	var isPlaceholder = typeof fn !== 'function';
	var labeledFn = isPlaceholder ? makeNoop() : fn;
	labeledFn.label = label;
	labeledFn.isPlaceholder = isPlaceholder;
	functionQueue.push(labeledFn);
}

function safeStringify(obj) {
	var cache = [];
	var returnValue = JSON.stringify(obj, function(key, value) {
		if (typeof value === 'object' && value !== null) {
			if (cache.indexOf(value) === -1) {
				cache.push(value);
				return value;
			}
			return '[CIRCULAR]';
		}
		return value;
	}, 2);
	cache = null;
	return returnValue;
}

function line(str) {
	return '\n\n' + str;
}

function assert(ref) {
	var condition = ref.condition;
	var label = ref.label;
	var source = ref.source;
	var type = ref.type;
	var value = ref.value;

	console.assert(
		condition,
		line('Expected:') +
		line(safeStringify(source)) +
		line('to ' + type + ':') +
		line(safeStringify(value)) +
		line('in "' + label + '"')
	);
}

function oneLineAssert(ref, hasValue) {
	var condition = ref.condition;
	var label = ref.label;
	var source = ref.source;
	var type = ref.type;
	var value = ref.value;

	var val = hasValue ? (value + ' ') : '';
	console.assert(
		condition,
		'Expected ' + source + ' to ' + type + ' ' + val + 'in "' + label + '"'
	);
}

function isSimple(x) {
	return (typeof x === 'boolean') || (typeof x === 'number') || (typeof x === 'string') || (x === null) || (x === undefined);
}

function logError(assertion) {
	failCount++;
	console.groupCollapsed(
		'%c[ ✗ ] %c' + assertion.label,
		'color: #e71600',
		'color: inherit; font-weight: 400'
	);
	if (Object.prototype.hasOwnProperty.call(assertion, 'value')) {
		if (isSimple(assertion.source) && isSimple(assertion.value)) {
			oneLineAssert(assertion, true);
		}
		else {
			assert(assertion);
		}
	}
	else {
		oneLineAssert(assertion, false);
	}
	if (assertion.error) {
		console.error(assertion.error);
	}
	console.groupEnd();
}

function logSuccess(label, time) {
	passCount++;
	console.log(
		'%c[ ✓ ] %c' + label + '%c' + (time ? (' [' + time + 'ms]') : ''),
		'color: #27ae60',
		'color: inherit',
		'color: #f39c12; font-style: italic'
	);
}

function callWithExpect(fn, cb) {

	var label = fn.label;
	if (!label) {
		fn();
		return;
	}

	if (fn.isPlaceholder) {
		pendingCount++;
		console.log(
			'%c[ i ] %c' + fn.label,
			'color: #3498db',
			'color: #3498db; font-weight: bold; font-style: italic'
		);
		return;
	}

	var assertions = [];
	function expect(source) {

		var negate = false;
		var deep = false;

		var handlers = {
			get to() {
				return handlers;
			},
			get not() {
				negate = !negate;
				return handlers;
			},
			get deep() {
				deep = true;
				return handlers;
			},
			equal: function equal(value) {
				var isEqual = false;
				if (deep) { isEqual = index$2(source, value, { strict: true }); }
				else { isEqual = value === source; }
				var condition = negate ? !(isEqual) : isEqual;
				var type = [
					negate ? 'not ' : '',
					deep ? 'deep ' : '',
					'equal'
				].join('');
				assertions.push({
					type: type,
					label: label,
					condition: condition,
					source: source,
					value: value
				});
			},
			explode: function explode() {
				if (typeof source !== 'function') {
					console.warn(
						'You are calling expect::explode without passing it a function in "' +
						label + '".\n\n' +
						'You passed:\n\n' +
						safeStringify(source) +
						'\n\n' +
						'Correct usage:\n\n' +
						'expect(function() { /* ... */ }).to.explode()'
					);
				}
				var threw = false;
				var error = null;
				try { source(); }
				catch (err) { threw = true; error = err; }
				var condition = negate ? !(threw) : threw;
				var type = [
					negate ? 'not ' : '',
					'throw'
				].join('');
				assertions.push({
					type: type,
					label: label,
					condition: condition,
					error: error,
					source: '[Function ' + (source.name || '(Anonymous function)') + ']'
				});
			}
		};

		return handlers;

	}

	function runAssertions(time) {
		var error = null;
		var i = 0;
		while (i < assertions.length) {
			if (!assertions[i].condition) {
				error = assertions[i];
				break;
			}
			i++;
		}
		if (error) { logError(error); }
		else { logSuccess(label, time); }
	}

	var isAsync = typeof cb === 'function';
	if (isAsync) {
		var calledDone = false;
		var start = performance.now();
		fn(expect, function done() {
			if (!calledDone) {
				calledDone = true;
				var end = performance.now();
				runAssertions((end - start).toFixed());
				cb();
			}
		});
		setTimeout(function() {
			if (!calledDone) {
				calledDone = true;
				logError({
					label: label + ' [' + test.timeout + 'ms timeout]',
					type: 'complete within ' + test.timeout + 'ms',
					condition: false,
					source: 'async assertion'
				});
				cb();
			}
		}, test.timeout);
	}
	else {
		fn(expect);
		runAssertions();
	}

}

function unwindQueue(queue) {

	if (queue.length === 0) {
		var time = performance.now() - globalStartTime;
		var timeStr = time > 9999 ? (time / 1000).toFixed(2) + 's' : time.toFixed() + 'ms';
		console.log(
			'%c[ ✓ ] %d passed%c [%s]',
			'color: #27ae60',
			passCount,
			'color: #f39c12; font-style: italic',
			timeStr
		);
		console.log('%c[ ✗ ] %d failed', 'color: #e71600', failCount);
		console.log('%c[ i ] %d pending', 'color: #3498db', pendingCount);
		return;
	}

	var fn = queue.shift();
	var isAsync = fn.length === 2; // function(expect, done) { ... }
	if (isAsync) {
		callWithExpect(fn, function() {
			unwindQueue(queue);
		});
	}
	else {
		callWithExpect(fn);
		unwindQueue(queue);
	}
}

function test(label, fn) {
	functionQueue.push(makeGroup.bind(null, label));
	fn(it);
	functionQueue.push(endGroup);
	return function () { return setTimeout(function () { return unwindQueue(functionQueue); }, 0); };
}

test.timeout = 2000;

var index = test;

index('testesterone', function(it) {

	it('creates a label');
	it('passes without assertion', function() {});

	index('equals', function() {

		it('creates a nested label');

		it('[pass]', function(expect) {
			expect(true).to.equal(true);
			expect(false).to.equal(false);
			expect(123).to.equal(123);
			var x = {};
			expect(x).to.equal(x);
			var y = [];
			expect(y).to.equal(y);
			expect('foo').to.equal('foo');
			expect(undefined).to.equal(undefined);
			expect(null).to.equal(null);
		});

		it('[fail] bool', function (t) { return t(true).equal(false); });
		it('[fail] number', function (t) { return t(123).equal(456); });
		it('[fail] string', function (t) { return t('foo').equal('bar'); });
		it('[fail] loose', function (t) { return t('123').equal(123); });
		it('[fail] array', function (t) { return t([]).equal([]); });
		it('[fail] object', function (t) { return t({}).equal({}); });

	});

	index('not equals', function() {
		it('[pass]', function(expect) {
			expect(true).to.not.equal(false);
			expect(123).to.not.equal(456);
			expect('foo').to.not.equal('bar');
			expect('123').to.not.equal(123);
			expect([]).to.not.equal([]);
			expect({}).to.not.equal({});
		});

		it('[fail] bool', function(expect) {
			expect(true).to.not.equal(true);
		});

		it('[fail] number', function(expect) {
			expect(123).to.not.equal(123);
		});

		it('[fail] string', function(expect) {
			expect('foo').to.not.equal('foo');
		});

		it('[fail] array', function(expect) {
			var x = [];
			expect(x).to.not.equal(x);
		});

		it('[fail] object', function(expect) {
			var x = {};
			expect(x).to.not.equal(x);
		});

	});

	index('deep equals', function() {

		it('[pass]', function(expect) {

			// normal equality tests
			expect(true).to.deep.equal(true);
			expect(false).to.deep.equal(false);
			expect(123).to.deep.equal(123);
			var x = {};
			expect(x).to.deep.equal(x);
			var y = [];
			expect(y).to.deep.equal(y);
			expect('foo').to.deep.equal('foo');
			expect(undefined).to.deep.equal(undefined);
			expect(null).to.deep.equal(null);

			// deep equality tests
			expect({}).to.deep.equal({});
			expect([]).to.deep.equal([]);
			expect({ a: 1, b: [1, 2, 3], c: { d: [1, 2, 3 ]}}).to.deep.equal({ a: 1, b: [1, 2, 3], c: { d: [1, 2, 3 ]}});

		});

		it('[fail] bool', function(expect) {
			expect(true).to.deep.equal(false);
		});

		it('[fail] number', function(expect) {
			expect(123).to.deep.equal(456);
		});

		it('[fail] string', function(expect) {
			expect('foo').to.deep.equal('bar');
		});

		it('[fail] array', function(expect) {
			expect([1, 2, 3]).to.deep.equal([1, 2, 3, 4]);
		});

		it('[fail] object', function(expect) {
			expect({ a: 1, b: [1, 2, 3]}).to.deep.equal({ a: 1, b: [1, 2, 3, 4] });
		});

	});

	index('not deep equals', function() {

		it('[pass]', function(expect) {

			// normal equality tests
			expect(true).to.not.deep.equal(false);
			expect(123).to.not.deep.equal(456);
			expect('foo').to.not.deep.equal('bar');
			expect('100').to.not.deep.equal(100);

			// deep equality tests
			expect([1, 2, 3]).to.not.deep.equal([1, 2, 3, 4]);
			expect({ a: 1, b: [1, 2, 3], c: { d: [1, 2, 3, 4 ]}}).to.not.deep.equal({ a: 1, b: [1, 2, 3], c: { d: [1, 2, 3 ]}});

		});

		it('[fail] bool', function (t) { return t(true).not.deep.equal(true); });
		it('[fail] number', function (t) { return t(123).not.deep.equal(123); });
		it('[fail] string', function (t) { return t('foo').not.deep.equal('foo'); });
		it('[fail] array', function (t) { return t([1, 2, 3]).not.deep.equal([1, 2, 3]); });
		it('[fail] object', function (t) { return t({ a: 1 }).not.deep.equal({ a: 1 }); });

	});

	index('explodes', function() {
		it('[pass]', function(expect) {
			expect(function kaboom() {
				throw new Error('boom');
			}).to.explode();
		});
		it('[pass/warn ^]', function(expect) {
			// this will cause a console warning
			expect(true).to.explode();
		});
		it('[fail] named', function(expect) {
			expect(function namedFn() {}).to.explode();
		});
		it('[fail] anonymous', function(expect) {
			expect(function () { return true; }).to.explode();
		});
	});

	index('not explodes', function() {
		it('[pass]', function(expect) {
			expect(function() {}).to.not.explode();
		});
		it('[fail] named', function(expect) {
			expect(function namedFn() {
				throw new Error('boom');
			}).to.not.explode();
		});
		it('[fail] anonymous', function(expect) {
			expect(function() {
				throw new Error('boom');
			}).to.not.explode();
		});
	});

	index('async', function() {

		it('[pass] 500ms', function(expect, done) {
			setTimeout(function() {
				expect(true).to.equal(true);
				done();
			}, 500);
		});

		it('[pass] 500ms deep equal', function(expect, done) {
			setTimeout(function() {
				expect([1, 2, 3]).to.deep.equal([1, 2, 3]);
				done();
			}, 500);
		});

		it('[fail] 500ms', function(expect, done) {
			setTimeout(function() {
				expect(true).to.equal(false);
				done();
			}, 500);
		});

		it('[fail] 500ms (immediate fail)', function(expect, done) {
			expect(true).to.equal(false);
			setTimeout(function() {
				done();
			}, 500);
		});

		it('[fail] 500ms (immediate fail async pass)', function(expect, done) {
			expect(true).to.equal(false);
			setTimeout(function() {
				expect(true).to.equal(true);
				done();
			}, 500);
		});

		it('[fail] 500ms (immediate pass async fail)', function(expect, done) {
			expect(true).to.equal(true);
			setTimeout(function() {
				expect(true).to.equal(false);
				done();
			}, 500);
		});

		it('[pass] synchronous with timer', function(expect, done) {
			expect(true).to.equal(true);
			done();
		});

		it('[pass] synchronous with timer (no assertion)', function(expect, done) {
			done();
		});

		it('[pass] synchronous (heavy) with timer', function(expect, done) {
			var arr = [];
			for (var i = 0; i < 98765432; i++) {
				arr.push(i);
			}
			done();
		});

		it('[pass] promise 500ms', function(expect, done) {
			return new Promise(function(resolve) {
				setTimeout(resolve, 500);
			}).then(done);
		});

		it('[fail] takes too long (indefinite)', function(expect, done) {
			expect(true).to.equal(true);
			// never calls done();
		});

		it('[fail] takes too long (eventual)', function(expect, done) {
			expect(true).to.equal(true);
			setTimeout(done, 3000);
		});

		it('[config] sets timeout to 5000', function() {
			index.timeout = 5000;
		});

		it('[pass] works with new timeout', function(expect, done) {
			expect(true).to.equal(true);
			setTimeout(done, 3000);
		});

	});

})();

var index_test = {

};

return index_test;

}());
