const expect = require('../expect.js');
const assert = require('chai').assert;

describe('expect', function() {

	describe('equal', function() {

		it('works if equal', function() {
			assert.doesNotThrow(function() {
				expect(true).to.equal(true);
			});
			assert.doesNotThrow(function() {
				expect(123).to.equal(123);
			});
			assert.doesNotThrow(function() {
				expect('foo').to.equal('foo');
			});
		});

		it('throws if not equal', function() {
			assert.throws(function() {
				expect(true).to.equal(false);
			});
			assert.throws(function() {
				expect(123).to.equal(456);
			});
			assert.throws(function() {
				expect(123).to.equal('123');
			});
			assert.throws(function() {
				expect({}).to.equal({});
			});
			assert.throws(function() {
				expect([]).to.equal([]);
			});
		});

		it('works if negated equal', function() {
			assert.doesNotThrow(function() {
				expect(true).to.not.equal(false);
			});
			assert.doesNotThrow(function() {
				expect(123).to.not.equal(456);
			});
			assert.doesNotThrow(function() {
				expect(123).to.not.equal('123');
			});
			assert.doesNotThrow(function() {
				expect({}).to.not.equal({});
			});
			assert.doesNotThrow(function() {
				expect([]).to.not.equal([]);
			});
		});

		it('throws if not negated equal', function() {
			assert.throws(function() {
				expect(true).to.not.equal(true);
			});
			assert.throws(function() {
				expect(123).to.not.equal(123);
			});
			assert.throws(function() {
				expect('foo').to.not.equal('foo');
			});
		});

		it('works if deep equal', function() {
			assert.doesNotThrow(function() {
				expect(true).to.deep.equal(true);
			});
			assert.doesNotThrow(function() {
				expect(123).to.deep.equal(123);
			});
			assert.doesNotThrow(function() {
				expect('foo').to.deep.equal('foo');
			});
			assert.doesNotThrow(function() {
				expect({}).to.deep.equal({});
			});
			assert.doesNotThrow(function() {
				expect({ a: 1, b: 2 }).to.deep.equal({ b: 2, a: 1 });
			});
			assert.doesNotThrow(function() {
				expect([]).to.deep.equal([]);
			});
			assert.doesNotThrow(function() {
				expect([1, 2, 3]).to.deep.equal([1, 2, 3]);
			});
			assert.doesNotThrow(function() {
				expect(
					[{ a: 1 }, { b: 2 }, { c: 3, d: 4}]
				).to.deep.equal(
					[{ a: 1 }, { b: 2 }, { d: 4, c: 3}]
				);
			});
		});

		it('throws if not deep equal', function() {
			assert.throws(function() {
				expect(true).to.deep.equal(false);
			});
			assert.throws(function() {
				expect(123).to.deep.equal(456);
			});
			assert.throws(function() {
				expect(123).to.deep.equal('123');
			});
			assert.throws(function() {
				expect({ a: 1 }).to.deep.equal({ a: 2 });
			});
			assert.throws(function() {
				expect({ a: 1, b: 2 }).to.deep.equal({ b: 2, a: 2 });
			});
			assert.throws(function() {
				expect(['']).to.deep.equal([]);
			});
			assert.throws(function() {
				expect(['1', '2', '3']).to.deep.equal([1, 2, 3]);
			});
			assert.throws(function() {
				expect([1, 2, 3, 4]).to.deep.equal([1, 2, 3]);
			});
			assert.throws(function() {
				expect(
					[{ a: 1 }, { b: 2 }, { c: 3, d: 3}]
				).to.deep.equal(
					[{ a: 1 }, { b: 2 }, { d: 4, c: 3}]
				);
			});
			assert.throws(function() {
				expect(
					[{ a: 1 }, { b: 2 }, { c: 3, d: '4'}]
				).to.deep.equal(
					[{ a: 1 }, { b: 2 }, { d: 4, c: 3}]
				);
			});
		});

		it('works if negated deep equal', function() {
			assert.doesNotThrow(function() {
				expect(true).to.not.deep.equal(false);
			});
			assert.doesNotThrow(function() {
				expect(123).to.not.deep.equal(456);
			});
			assert.doesNotThrow(function() {
				expect(123).to.not.deep.equal('123');
			});
			assert.doesNotThrow(function() {
				expect({ a: 1 }).to.not.deep.equal({ a: 2 });
			});
			assert.doesNotThrow(function() {
				expect({ a: 1, b: 2 }).to.not.deep.equal({ b: 2, a: 2 });
			});
			assert.doesNotThrow(function() {
				expect(['']).to.not.deep.equal([]);
			});
			assert.doesNotThrow(function() {
				expect(['1', '2', '3']).to.not.deep.equal([1, 2, 3]);
			});
			assert.doesNotThrow(function() {
				expect([1, 2, 3, 4]).to.not.deep.equal([1, 2, 3]);
			});
			assert.doesNotThrow(function() {
				expect(
					[{ a: 1 }, { b: 2 }, { c: 3, d: 3}]
				).to.not.deep.equal(
					[{ a: 1 }, { b: 2 }, { d: 4, c: 3}]
				);
			});
			assert.doesNotThrow(function() {
				expect(
					[{ a: 1 }, { b: 2 }, { c: 3, d: '4'}]
				).to.not.deep.equal(
					[{ a: 1 }, { b: 2 }, { d: 4, c: 3}]
				);
			});
		});

		it('throws if not negated deep equal', function() {
			assert.throws(function() {
				expect(true).to.not.deep.equal(true);
			});
			assert.throws(function() {
				expect(123).to.not.deep.equal(123);
			});
			assert.throws(function() {
				expect('foo').to.not.deep.equal('foo');
			});
			assert.throws(function() {
				expect({}).to.not.deep.equal({});
			});
			assert.throws(function() {
				expect({ a: 1, b: 2 }).to.not.deep.equal({ b: 2, a: 1 });
			});
			assert.throws(function() {
				expect([]).to.not.deep.equal([]);
			});
			assert.throws(function() {
				expect([1, 2, 3]).to.not.deep.equal([1, 2, 3]);
			});
			assert.throws(function() {
				expect(
					[{ a: 1 }, { b: 2 }, { c: 3, d: 4}]
				).to.not.deep.equal(
					[{ a: 1 }, { b: 2 }, { d: 4, c: 3}]
				);
			});
		});

	});

	describe('exist', function() {

		it('works if nonnull/undefined', function() {
			assert.doesNotThrow(function() {
				expect({}).to.exist();
			});
			assert.doesNotThrow(function() {
				expect([]).to.exist();
			});
			assert.doesNotThrow(function() {
				expect(false).to.exist();
			});
			assert.doesNotThrow(function() {
				expect(0).to.exist();
			});
			assert.doesNotThrow(function() {
				expect('').to.exist();
			});
			assert.doesNotThrow(function() {
				expect(NaN).to.exist();
			});
			assert.doesNotThrow(function() {
				expect(new Date()).to.exist();
			});
			assert.doesNotThrow(function() {
				expect('test').to.exist();
			});
		});

		it('throws if null', function() {
			assert.throws(function() {
				expect(null).to.exist();
			});
		});

		it('throws if undefined', function() {
			assert.throws(function() {
				expect(undefined).to.exist();
			});
		});

		it('works if negated null', function() {
			assert.doesNotThrow(function() {
				expect(null).to.not.exist();
			});
		});

		it('works if negated undefined', function() {
			assert.doesNotThrow(function() {
				expect(undefined).to.not.exist();
			});
		});

	});

	describe('explode', function() {

		it('works if function throws', function() {
			assert.doesNotThrow(function() {
				expect(function() {
					throw new Error('boom');
				}).to.explode();
			});
		});

		it('throws if function does not throw', function() {
			assert.throws(function() {
				expect(function() {}).to.explode();
			});
		});

		it('works if negated function does not throw', function() {
			assert.doesNotThrow(function() {
				expect(function() {}).to.not.explode();
			});
		});

		it('throws if negated function throws', function() {
			assert.throws(function() {
				expect(function() {
					throw new Error('boom');
				}).to.not.explode();
			});
		});

	});

});