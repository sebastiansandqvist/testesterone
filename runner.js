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

function it(label, fn) {
	const isPlaceholder = typeof fn !== 'function';
	const labeledFn = isPlaceholder ? makeNoop() : fn;
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
		const fn = queue.shift();
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
	return () => setTimeout(() => unwindQueue(functionQueue), 0);
}

module.exports = test;