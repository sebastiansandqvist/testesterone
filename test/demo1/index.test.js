const test = require('../../index.js');

test('testesterone', function(it) {

	it('creates a label');
	it('passes without assertion', function() {});

	test('equals', function() {

		it('creates a nested label');

		it('[pass]', function(expect) {
			expect(true).to.equal(true);
			expect(false).to.equal(false);
			expect(123).to.equal(123);
			const x = {};
			expect(x).to.equal(x);
			const y = [];
			expect(y).to.equal(y);
			expect('foo').to.equal('foo');
			expect(undefined).to.equal(undefined);
			expect(null).to.equal(null);
		});

		it('[fail] bool', (t) => t(true).equal(false));
		it('[fail] number', (t) => t(123).equal(456));
		it('[fail] string', (t) => t('foo').equal('bar'));
		it('[fail] loose', (t) => t('123').equal(123));
		it('[fail] array', (t) => t([]).equal([]));
		it('[fail] object', (t) => t({}).equal({}));

	});

	test('not equals', function() {
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
			const x = [];
			expect(x).to.not.equal(x);
		});

		it('[fail] object', function(expect) {
			const x = {};
			expect(x).to.not.equal(x);
		});

	});

	test('deep equals', function() {

		it('[pass]', function(expect) {

			// normal equality tests
			expect(true).to.deep.equal(true);
			expect(false).to.deep.equal(false);
			expect(123).to.deep.equal(123);
			const x = {};
			expect(x).to.deep.equal(x);
			const y = [];
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

	test('not deep equals', function() {

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

		it('[fail] bool', (t) => t(true).not.deep.equal(true));
		it('[fail] number', (t) => t(123).not.deep.equal(123));
		it('[fail] string', (t) => t('foo').not.deep.equal('foo'));
		it('[fail] array', (t) => t([1, 2, 3]).not.deep.equal([1, 2, 3]));
		it('[fail] object', (t) => t({ a: 1 }).not.deep.equal({ a: 1 }));

	});

	test('explodes', function() {
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
			expect(() => true).to.explode();
		});
	});

	test('not explodes', function() {
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

	test('async', function() {

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
			const arr = [];
			for (let i = 0; i < 98765432; i++) {
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
			test.timeout = 5000;
		});

		it('[pass] works with new timeout', function(expect, done) {
			expect(true).to.equal(true);
			setTimeout(done, 3000);
		});

	});

})();
