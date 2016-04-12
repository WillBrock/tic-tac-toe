"use strict";

var gulp = require('gulp');
var scss = require('gulp-scss');

gulp.task('scss', function() {
	return gulp
			.src(['client/*.scss'])
			.pipe(scss())
			.pipe(gulp.dest('client/build'));
});

gulp.task('watch', function() {
	gulp.watch('client/*.scss', ['scss']);
});
