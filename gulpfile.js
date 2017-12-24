var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var strip = require('gulp-strip-comments');
var banner = require('gulp-banner');
var pkg = require('./package.json');
 
var comment = '/*\n' +
    ' * <%= pkg.name %> <%= pkg.version %>\n' +
    ' * <%= pkg.description %>\n' +
    ' * <%= pkg.homepage %>\n' +
    ' *\n' +
    ' * Copyright 2018, <%= pkg.author %>\n' +
    ' * Released under the <%= pkg.license %> license.\n' +
    '*/\n\n';

var copyright = "Copyright (C) Swastik Roy, 2018";

gulp.task('scripts', function() {
    return gulp.src('src/js/*.js')
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(strip())
        .pipe(banner(comment, {
            pkg: pkg
        }))
        .pipe(gulp.dest('dist/scripts'));
});

gulp.task('styles', function(){
    return gulp.src('src/styles/*.css')
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(minifyCSS())
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('dist/css'))
});