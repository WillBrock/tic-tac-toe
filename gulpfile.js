"use strict";

let gulp = require('gulp');
let sass = require('gulp-sass');

gulp.task('default', ['watch']);

gulp.task('scss', () => {
	return gulp
			.src([`${__dirname}/client/*.scss`])
			.pipe(sass())
			.pipe(gulp.dest(`${__dirname}/client/build`));
});

gulp.task('watch', () => {
	gulp.watch(`${__dirname}/client/*.scss`, ['scss']);
});
