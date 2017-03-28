const test = require('../../index.js');

const h1 = document.querySelector('h1');
const nameInput = document.getElementById('nameInput');

test('Hello world', function(it) {

	it('is initialized to "Hello"', function(expect) {
		expect(h1.textContent).to.equal('Hello!!!');
	});

	it('updates text to input\'s value', function(expect) {
		nameInput.value = 'world';
		nameInput.oninput();
		expect(h1.textContent).to.equal('Hello world');
	});

	it('saves result in localstorage'); // todo!

})();