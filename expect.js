const deepEqual = require('deep-equal');

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

function assert(condition, source, label, value) {
	console.assert(
		condition,
		line('Expected:') +
		line(safeStringify(source)) +
		line('to ' + label + ':') +
		line(safeStringify(value))
	);
}

function oneLineAssert(condition, source, label, value = '') {
	console.assert(
		condition,
		'Expected ' + source + ' to ' + label + ' ' + value
	);
}

function isSimple(x) {
	return (typeof x === 'boolean') || (typeof x === 'number') || (typeof x === 'string') || (x === null) || (x === undefined);
}

module.exports = function expect(source) {

	let negate = false;
	let deep = false;

	const handlers = {
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
		equal(value) {
			let isEqual = false;
			if (deep) { isEqual = deepEqual(source, value, { strict: true }); }
			else { isEqual = value === source; }
			const condition = negate ? !isEqual : isEqual;
			const label = [
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
		exist() {
			const exists = source !== undefined && source !== null;
			const condition = negate ? !exists : exists;
			const label = [
				negate ? 'not ' : '',
				'exist'
			].join('');
			oneLineAssert(condition, safeStringify(source), label);
		},
		explode() {
			let threw = false;
			try { source(); }
			catch (err) {
				threw = true;
			}
			const condition = negate ? !threw : threw;
			const label = [
				negate ? 'not ' : '',
				'throw'
			].join('');
			oneLineAssert(condition, '[Function] `' + source.name + '` ', label);
		}
	};

	return { to: handlers };

};