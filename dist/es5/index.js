"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Pager = exports.Dots = exports.Arrow = exports.Carousel = undefined;

exports.default = function (options) {
	return new _Carousel.Carousel(options);
};

var _Carousel = require("./Carousel");

Object.defineProperty(exports, "Carousel", {
	enumerable: true,
	get: function get() {
		return _Carousel.Carousel;
	}
});

var _Arrow = require("./Arrow");

Object.defineProperty(exports, "Arrow", {
	enumerable: true,
	get: function get() {
		return _Arrow.Arrow;
	}
});

var _Dots = require("./Dots");

Object.defineProperty(exports, "Dots", {
	enumerable: true,
	get: function get() {
		return _Dots.Dots;
	}
});

var _Pager = require("./Pager");

Object.defineProperty(exports, "Pager", {
	enumerable: true,
	get: function get() {
		return _Pager.Pager;
	}
});

