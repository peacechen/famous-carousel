
require("babel-polyfill"); //ES6 for-loop polyfill https://github.com/babel/babel/issues/711

import {Carousel} from "./Carousel";

export default function(options) {
	return new Carousel(options);
}

export {Carousel} from "./Carousel";
export {Arrow} from "./Arrow";
export {Dots} from "./Dots";
export {Pager} from "./Pager";
