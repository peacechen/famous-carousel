/**
 * PagerRotate.js
 */

import Transitionable from "famous/transitions/Transitionable";
import Quaternion from "famous/math/Quaternion";

export function get(slide) {
	// getRotation() returns a quaternion. Return converted Euler angles.
	var qRotation = slide.node.getRotation();
	var quat = new Quaternion(qRotation[3], qRotation[0], qRotation[1], qRotation[2]);
	var result = {};
	quat.toEuler(result);
	return [result.x, result.y, result.z];
}

export function set(slide, params) {
	slide.node.setRotation(params[0], params[1], params[2]);
}

// Set Rotation with transition animation
export function animate(slide, startParams, endParams, curveOpts) {
	if (slide.transitionable instanceof Array === false) {
		slide.transitionable = [];
	}
	for (var i = 0; i < startParams.length; i++) {
		slide.transitionable[i] = new Transitionable(startParams[i]);
		slide.transitionable[i].set(
			endParams[i],
			slide.currentTransformOpts
			// function(){ console.log("finished"); }// callback
		);
	}
}
