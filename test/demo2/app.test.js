var test = require('../../index.js');

var h1 = document.querySelector('h1');
var nameInput = document.getElementById('nameInput');

test('Hello world', function(it) {

	it('is initialized to "Hello"', function(expect) {
		expect(h1.textContent).to.equal('Hello!');
	});

	it('updates text to input\'s value', function(expect) {
		nameInput.value = 'world';
		nameInput.oninput();
		expect(h1.textContent).to.equal('Hello world');
	});

	it('saves result in localstorage'); // not yet implemented!

})();
