// Copyright (c) 2017 Michael P
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const gulp = require('gulp');

// TypeScript
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const tsdoc = require('gulp-typedoc');

// Optimization
const uglify = require('gulp-uglify');

// Legacy
const babel = require('gulp-babel');

// ES6 Module Concatenation for Webpage Injection
const rollup = require('rollup');
const rollupTs = require('rollup-plugin-typescript2');
const rollupNode = require('rollup-plugin-node-resolve');
const rollupCjs = require('rollup-plugin-commonjs');
const rollupUgly = require('rollup-plugin-minify-es');

gulp.task('lint', function() {
    return gulp.src('src/**/*.ts')
        .pipe(tslint({
            configuration: 'tslint.json',
        }))
        .pipe(tslint.report());
});

gulp.task('document', function() {
    return gulp.src(['src/**/*.ts', '!src/test/*'])
        .pipe(tsdoc({
            out: './docs',
            module: 'commonjs',
            target: 'es6',
        }));
});

const tsProject = ts.createProject('tsconfig.json');
gulp.task('compile', function() {
    const tsResult = gulp.src('src/**/*.ts')
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest('out'));
});

gulp.task('rollup', async function() {
    const bundle = await rollup.rollup({
        input: './src/web/adapter.ts',
        plugins: [
            rollupTs(),
            rollupNode({
                jsnext: true,
                main: true,
                browser: true
            }),
            rollupCjs({
                namedExports: {
                    //'node_modules/synaptic/dist/synaptic.js': ['Architect', 'Trainer', 'Neuron']
                }
            }),
            rollupUgly()
        ]
    });

    await bundle.write({
        file: './out/inject.js',
        format: 'iife'
    });
});