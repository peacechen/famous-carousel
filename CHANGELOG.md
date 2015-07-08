v0.9.0 - June 25, 2015

* Update to Famous engine 0.6.2 to avoid npm issue with 0.5.x.
* Fix events to match changes in 0.6.x's eventing API.
* BREAKING: merged talves' ES6 module support.
		// Browserify usage:
		var famousCarousel = require("famous-carousel").Carousel;
		var carousel = new famousCarousel( {...} );

v0.8.2 - June 21, 2015

* Support Famo.us nodes in carouselData.

v0.8.1 - June 20, 2015

* Support passing in a Famous node as the selector.

v0.8.0 - June 19, 2015

* Initial release based on the Famous carousel tutorial.
