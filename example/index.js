/**
 * Instantiation of famous-carousel using CommonJS-style Browserify
 */

// App Code
//when using this as a node_module, use require('famous-carousel')
var famousCarousel = require('../');
console.log(famousCarousel);
var imageData = require('./data/data');
// Both of the following work from the require above
//var carousel = new famousCarousel.Carousel({
var carousel = famousCarousel.default({
        selector: '.slideshow',
        carouselData: imageData,
        wrapAround: true,
        autoPlay: 3000,
        // autoSlidesToAdvance: 2,
        // manualSlidesToAdvance: 3,
        // initialIndex: 2,
        // dotForeColor: 'red',
        dotBackColor: 'DarkBlue',
        // dotOpacity: 0.7,
        // arrowFillColor: 'yellow',
        arrowOutlineColor: 'CornflowerBlue'
    });
