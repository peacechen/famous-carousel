/**
 * PagerAlign.js
 */

// import GestureHandler from "famous/components/GestureHandler";
import Transitionable from "famous/transitions/Transitionable";

export function get(slide) {
	return slide.node.getAlign();
}

export function set(slide, params) {
	slide.node.setAlign(params[0], params[1], params[2]);
}

// Set align with transition animation
export function animate(slide, startParams, endParams) {
	if (slide.transitionable instanceof Array === false) {
		slide.transitionable = [];
	}
	for (var i = 0; i < startParams.length; i++) {
		slide.transitionable[i] = new Transitionable(startParams[i]);
		slide.transitionable[i].set(
			endParams[i],
			slide.currentTransformOpts
			// function(){ console.log("finished"); } // callback
		);
	}
}
