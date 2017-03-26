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

var index = createCommonjsModule(function (module) {
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

function assert(condition, source, label, value) {
	console.assert(
		condition,
		line('Expected:') +
		line(safeStringify(source)) +
		line('to ' + label + ':') +
		line(safeStringify(value))
	);
}

function oneLineAssert(condition, source, label, value) {
	if ( value === void 0 ) value = '';

	console.assert(
		condition,
		'Expected ' + source + ' to ' + label + ' ' + value
	);
}

function isSimple(x) {
	return (typeof x === 'boolean') || (typeof x === 'number') || (typeof x === 'string') || (x === null) || (x === undefined);
}

var expect = function expect(source) {

	var negate = false;
	var deep = false;

	var handlers = {
		get not() {
			negate = !negate;
			return handlers;
		},
		get deep() {
			deep = true;
			return handlers;
		},
		set not(x) {
			throw new Error('Cannot assign to `expect.to::not`');
		},
		set deep(x) {
			throw new Error('Cannot assign to `expect.to::deep`');
		},
		equal: function equal(value) {
			var isEqual = false;
			if (deep) { isEqual = index(source, value, { strict: true }); }
			else { isEqual = value === source; }
			var condition = negate ? !isEqual : isEqual;
			var label = [
				negate ? 'not ' : '',
				deep ? 'deep ' : '',
				'equal'
			].join('');
			if (isSimple(source) && isSimple(value)) {
				oneLineAssert(condition, source, label, value);
			}
			else {
				assert(condition, source, label, value);
			}
		},
		exist: function exist() {
			var exists = source !== undefined && source !== null;
			var condition = negate ? !exists : exists;
			var label = [
				negate ? 'not ' : '',
				'exist'
			].join('');
			oneLineAssert(condition, safeStringify(source), label);
		},
		explode: function explode() {
			var threw = false;
			try { source(); }
			catch (err) {
				threw = true;
			}
			var condition = negate ? !threw : threw;
			var label = [
				negate ? 'not ' : '',
				'throw'
			].join('');
			oneLineAssert(condition, '[Function] `' + source.name + '` ', label);
		}
	};

	return { to: handlers };

};

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

function it(label, fn) {
	var isPlaceholder = typeof fn !== 'function';
	var labeledFn = isPlaceholder ? makeNoop() : fn;
	labeledFn.label = label;
	labeledFn.isPlaceholder = isPlaceholder;
	functionQueue.push(labeledFn);
}

function log(label, isPlaceholder) {
	if (label) {
		console.log(
			isPlaceholder ? '%c[Note] %c' + label : '%c[Test] %c' + label,
			'color: gray',
			isPlaceholder ? 'background: yellow; color: black; padding: 0 5px;' : 'color: inherit'
		);
	}
}

function unwindQueue(queue) {
	if (queue.length > 0) {
		var fn = queue.shift();
		if (fn.label && fn.length === 1) {
			log(fn.label);
			console.time('[Done] ' + fn.label);
			fn(function done() {
				console.timeEnd('[Done] ' + fn.label);
				unwindQueue(queue);
			});
		}
		else {
			log(fn.label, fn.isPlaceholder);
			fn();
			unwindQueue(queue);
		}
	}
}

function test(label, fn) {
	functionQueue.push(makeGroup.bind(null, label));
	fn(it);
	functionQueue.push(endGroup);
	return function () { return setTimeout(function () { return unwindQueue(functionQueue); }, 0); };
}

var runner = test;

runner('it works', function(it) {

	it('does labels');
	it('does labels 2');
	it('errors out', function() {
		expect(function asd() {
			throw new Error('foo!');
		}).to.not.explode();
	});

	it('null does not exist', function() {
		expect(null).to.exist();
	});

	it('undefined does not exist', function() {
		expect(undefined).to.exist();
	});

	it('5 does exist', function() {
		expect(5).to.exist();
	});

	it('runs an async test', function(done) {
		setTimeout(function() {
			expect(5).to.equal(5);
			done();
		}, 500);
	});

	it('is not a one-line assertion', function() {
		expect(5).to.equal([1, 2, 3]);
	});

	it('is not a one-line assertion with object', function() {
		expect({ a: 1, b: 2, c: 3 }).to.equal(null);
	});

	it('runs a sync test with timer', function(done) {
		expect(5).to.equal(15);
		done();
	});

	runner('inner test', function() {
		it('runs nested label');
		it('runs nested test', function() {
			expect(true).to.equal(true);
		});
		it('runs an async test', function(done) {
			setTimeout(function() {
				expect(5).to.equal(5);
				done();
			}, 500);
		});

	});

})();

var index_test = {

};

return index_test;

}());
