import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	moduleName: 'test',
	entry: 'test/demo/index.test.js',
	dest: 'test/demo/index.bundle.js',
	format: 'iife',
	plugins: [
		nodeResolve({ browser: true }),
		commonjs(),
		buble()
	]
};
