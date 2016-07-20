"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.get = get;
exports.set = set;
exports.animate = animate;

var _Transitionable = require("famous/transitions/Transitionable");

var _Transitionable2 = _interopRequireDefault(_Transitionable);

var _Quaternion = require("famous/math/Quaternion");

var _Quaternion2 = _interopRequireDefault(_Quaternion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _instanceof(left, right) { if (right != null && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } } /**
                                                                                                                                                                          * PagerRotate.js
                                                                                                                                                                          */

function get(slide) {
	// getRotation() returns a quaternion. Return converted Euler angles.
	var qRotation = slide.node.getRotation();
	var quat = new _Quaternion2.default(qRotation[3], qRotation[0], qRotation[1], qRotation[2]);
	var result = {};
	quat.toEuler(result);
	return [result.x, result.y, result.z];
}

function set(slide, params) {
	slide.node.setRotation(params[0], params[1], params[2]);
}

// Set Rotation with transition animation
function animate(slide, startParams, endParams, curveOpts) {
	if (_instanceof(slide.transitionable, Array) === false) {
		slide.transitionable = [];
	}
	for (var i = 0; i < startParams.length; i++) {
		slide.transitionable[i] = new _Transitionable2.default(startParams[i]);
		slide.transitionable[i].set(endParams[i], slide.currentTransformOpts
		// function(){ console.log("finished"); }// callback
		);
	}
}

