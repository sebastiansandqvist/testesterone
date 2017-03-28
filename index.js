const deepEqual = require('deep-equal');

const functionQueue = [];
let nestDepth = 0;

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

const makeNoop = () => () => {};

const globalStartTime = performance.now();
let passCount = 0;
let failCount = 0;
let pendingCount = 0;

function it(label, fn) {
	const isPlaceholder = typeof fn !== 'function';
	const labeledFn = isPlaceholder ? makeNoop() : fn;
	labeledFn.label = label;
	labeledFn.isPlaceholder = isPlaceholder;
	functionQueue.push(labeledFn);
}

function safeStringify(obj) {
	let cache = [];
	const returnValue = JSON.stringify(obj, function(key, value) {
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

function assert({ condition, label, source, type, value }) {
	console.assert(
		condition,
		line('Expected:') +
		line(safeStringify(source)) +
		line('to ' + type + ':') +
		line(safeStringify(value)) +
		line('in "' + label + '"')
	);
}

function oneLineAssert({ condition, label, source, type, value }, hasValue) {
	const val = hasValue ? (value + ' ') : '';
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

	const label = fn.label;
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

	const assertions = [];
	function expect(source) {

		let negate = false;
		let deep = false;

		const handlers = {
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
			equal(value) {
				let isEqual = false;
				if (deep) { isEqual = deepEqual(source, value, { strict: true }); }
				else { isEqual = value === source; }
				const condition = negate ? !(isEqual) : isEqual;
				const type = [
					negate ? 'not ' : '',
					deep ? 'deep ' : '',
					'equal'
				].join('');
				assertions.push({
					type,
					label,
					condition,
					source,
					value
				});
			},
			explode() {
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
				let threw = false;
				let error = null;
				try { source(); }
				catch (err) { threw = true; error = err; }
				const condition = negate ? !(threw) : threw;
				const type = [
					negate ? 'not ' : '',
					'throw'
				].join('');
				assertions.push({
					type,
					label,
					condition,
					error,
					source: '[Function ' + (source.name || '(Anonymous function)') + ']'
				});
			}
		};

		return handlers;

	}

	function runAssertions(time) {
		let error = null;
		let i = 0;
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

	const isAsync = typeof cb === 'function';
	if (isAsync) {
		let calledDone = false;
		const start = performance.now();
		fn(expect, function done() {
			if (!calledDone) {
				calledDone = true;
				const end = performance.now();
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
		const time = performance.now() - globalStartTime;
		const timeStr = time > 9999 ? (time / 1000).toFixed(2) + 's' : time.toFixed() + 'ms';
		console.log(
			'%c[ ✓ ] %d passed%c [%s]',
			'color: #27ae60',
			passCount,
			'color: #f39c12; font-style: italic',
			timeStr
		);
		if (failCount > 0) {
			console.log('%c[ ✗ ] %d failed', 'color: #e71600', failCount);
		}
		if (pendingCount > 0) {
			console.log('%c[ i ] %d pending', 'color: #3498db', pendingCount);
		}
		return;
	}

	const fn = queue.shift();
	const isAsync = fn.length === 2; // function(expect, done) { ... }
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
	return () => setTimeout(() => unwindQueue(functionQueue), 0);
}

test.timeout = 2000;

module.exports = test;