// ПОСТОЯННЫЕ ФАЙЛА GULP //
const { src, dest, watch, series, parallel } = require('gulp');

// ПОСТОЯННЫЕ названий папок: приложение и результат //
const appFolder = '#src';
const distFolder = 'dist';

//* ПОСТОЯННЫЕ ПЛАГИНОВ //*
const browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    sass = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    // группирует media-запросы в конце файла (оптимизация: +)
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify_es = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    webp = require('gulp-webp'),
    webpHTML = require('gulp-webp-html'),
    webpCSS = require('gulp-webpcss');

// ОСНОВНЫЕ ПУТИ: 
// build - папка dist; 
// src - папка src; 
// watch - папка src с теми файлами, изменения которых прослушиваются //
let path = {
    build: {
        html: `${distFolder}/`,
        css: `${distFolder}/css/`,
        js: `${distFolder}/js/`,
        json: `${distFolder}/js/JSON`,
        img: `${distFolder}/img/`,
        video: `${distFolder}/video`,
        fonts: `${distFolder}/fonts/`
    },
    src: {
        html: `${appFolder}/*.html`,
        scss: `${appFolder}/scss/styles.scss`,
        js: `${appFolder}/js/scripts.js`,
        json: `${appFolder}/js/JSON/*.json`,
        img: `${appFolder}/img/**/*.{jpg,png,svg,ico,svg,webp}`,
        video: `${appFolder}/video/**/*.{mp4,gif}`,
        fonts: `${appFolder}/fonts/**/*.{ttf,woff,woff2,eot,svg}`
    },
    watch: {
        html: `${appFolder}/**/*.html`,
        scss: `${appFolder}/scss/*.scss`,
        js: `${appFolder}/js/*.js`,
        json: `${appFolder}/js/JSON/*.json`,
        img: `${appFolder}/img/**/*.{jpg,png,svg,ico,svg,webp}`,
        video: `${appFolder}/video/**/*.{mp4,gif}`,
        fonts: `${appFolder}/fonts/**/*.{ttf,woff,woff2,eot,svg}`
    },
    clean: `${distFolder}/`
}

// ИНИЦИАЛИЗАЦИЯ GULP И ПЛАГИНОВ //

function browserSync(){
    browsersync.init({
        server: {
            baseDir: `${distFolder}/`
        },
        port: 3000,
        notify: false
    })
}

function clean(){
    return del(path.clean)
}

function html(){
    return src(path.src.html)
        .pipe(fileinclude({
            prefix: '@@'
        }))
        .pipe(webpHTML())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function styles(){
    src(path.src.scss)
        .pipe(sass({
            // compressed - сжатый
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 5 versions"],
            cascade: true
        }))
        .pipe(group_media())
        .pipe(webpCSS({
            webpClass: '.webp'
        }))
        .pipe(dest(path.build.css))
        .pipe(
            rename({
                extname: '.min.css'
            })
        )
        .pipe(clean_css())
        .pipe(dest(path.build.css));

    return src(path.src.scss)
        .pipe(browsersync.stream());
}

function javascripts(){
    src(path.src.json)
        .pipe(dest(path.build.json))
        .pipe(browsersync.stream());

    return src(path.src.js)
        .pipe(fileinclude({
            prefix: '@@'
        }))
        .pipe(dest(path.build.js))
        .pipe(uglify_es())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function joinModules(){
    const jsModules = [
        'node_modules/vue/dist/vue.global.js',
        'node_modules/vue/dist/vue.global.prod.js',
        'node_modules/swiper/swiper-bundle.min.js',
        'node_modules/swiper/swiper-bundle.min.js.map'
    ];
    const cssModules = [
       'node_modules/swiper/swiper-bundle.min.css' 
    ];

    src(jsModules)
        .pipe(dest(path.build.js));
    return src(cssModules)
        .pipe(dest(path.build.css));
}

function images(){
    src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interplaced: true,
            optimizationLevel: 3 // 0 to 7
        }))
        .pipe(dest(path.build.img));
    
    return src(path.src.img)
        .pipe(webp())
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}

function video(){
    src(path.src.video)
        .pipe(dest(path.build.video))
        .pipe(browsersync.stream());
}

function fonts(){
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.stream());
}

function watching(){
    watch([path.watch.html], html);
    watch([path.watch.scss], styles);
    watch([path.watch.js, path.watch.json], javascripts);
    watch([path.watch.img], images);
    watch([path.watch.video], video);
    watch([path.watch.fonts], fonts);
}

const build = series(clean, parallel(html, styles, javascripts, images, video, fonts, joinModules));
const start = parallel(build, watching, browserSync); 


exports.video = video;
exports.fonts = fonts;
exports.images = images;
exports.joinModules = joinModules;
exports.styles = styles;
exports.html = html;
exports.javascripts = javascripts;

exports.build = build;
exports.default = start;