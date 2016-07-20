"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.get = get;
exports.set = set;
exports.animate = animate;

var _Transitionable = require("famous/transitions/Transitionable");

var _Transitionable2 = _interopRequireDefault(_Transitionable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _instanceof(left, right) { if (right != null && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } } /**
                                                                                                                                                                          * PagerAlign.js
                                                                                                                                                                          */

// import GestureHandler from "famous/components/GestureHandler";

function get(slide) {
	return slide.node.getAlign();
}

function set(slide, params) {
	slide.node.setAlign(params[0], params[1], params[2]);
}

// Set align with transition animation
function animate(slide, startParams, endParams) {
	if (_instanceof(slide.transitionable, Array) === false) {
		slide.transitionable = [];
	}
	for (var i = 0; i < startParams.length; i++) {
		slide.transitionable[i] = new _Transitionable2.default(startParams[i]);
		slide.transitionable[i].set(endParams[i], slide.currentTransformOpts
		// function(){ console.log("finished"); } // callback
		);
	}
}

