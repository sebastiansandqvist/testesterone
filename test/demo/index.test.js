const expect = require('../../expect.js');
const test = require('../../runner.js');

test('it works', function(it) {

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

	test('inner test', function() {
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

