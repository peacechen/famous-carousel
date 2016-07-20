"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * Pager.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        */

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Pager = undefined;

var _DOMElement = require("famous/dom-renderables/DOMElement");

var _DOMElement2 = _interopRequireDefault(_DOMElement);

var _FamousEngine = require("famous/core/FamousEngine");

var _FamousEngine2 = _interopRequireDefault(_FamousEngine);

var _GestureHandler = require("famous/components/GestureHandler");

var _GestureHandler2 = _interopRequireDefault(_GestureHandler);

var _PagerAlign = require("./PagerAlign");

var PagerAlign = _interopRequireWildcard(_PagerAlign);

var _PagerRotate = require("./PagerRotate");

var PagerRotate = _interopRequireWildcard(_PagerRotate);

var _PagerPosition = require("./PagerPosition");

var PagerPosition = _interopRequireWildcard(_PagerPosition);

var _lodash = require("lodash.assign");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _instanceof(left, right) { if (right != null && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pager = exports.Pager = (function () {
	function Pager(options) {
		var _this = this;

		_classCallCheck(this, Pager);

		this.options = options;
		this.node = options.parent.addChild();
		this.currentIndex = options.initialIndex || 0;
		this.threshold = 0.45;
		this.pageWidth = 0;

		var resizeComponent = {
			onSizeChange: function onSizeChange(x) {
				return _this.pageWidth = x;
			}
		};
		this.node.addComponent(resizeComponent);

		this.createPages(this.options);

		// Fire animStartCallback for first slide.
		if (typeof this.options.animStartCallback === "function") {
			this.options.animStartCallback(this.pages[this.currentIndex].node, this.currentIndex);
		}
	}

	// Render animation frame by frame

	_createClass(Pager, [{
		key: "onUpdate",
		value: function onUpdate(time) {
			if (!this.node) {
				return;
			}

			var page;
			var transitionableXYZ;
			var xform;
			var requestUpdate = false;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.pages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _page = _step.value;

					if (_instanceof(_page.transitionable, Array) === false) {
						continue;
					}
					transitionableXYZ = [];
					for (var i = 0; i < _page.transitionable.length; i++) {
						if (_page.transitionable[i] && _page.transitionable[i].isActive()) {
							transitionableXYZ[i] = _page.transitionable[i].get();
						} else {
							delete _page.currentTransform;
						}
					}
					if (transitionableXYZ.length > 0) {
						xform = this.selectPagerTransform(_page.currentTransform);
						xform.set(_page, transitionableXYZ);
						requestUpdate = true;
					}

					if (_page === this.pages[this.currentIndex] && transitionableXYZ.length === 0) {
						this.options.animDoneCallback(_page.node, this.currentIndex);
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			if (requestUpdate) {
				_FamousEngine2.default.requestUpdateOnNextTick(this);
			}
		}

		// Calculate the position between matrices given percentage.

	}, {
		key: "positionBetweenMatrices",
		value: function positionBetweenMatrices(startMatrix, endMatrix, percentage) {
			var result = [];
			var range;

			for (var i = 0; i < startMatrix.length; i++) {
				range = endMatrix[i] - startMatrix[i];
				result[i] = range * percentage + startMatrix[i];
			}
			return result;
		}

		// Worker function that performs the slide positioning for dragging.
		// Similar to doTransition but enough differences to warrant a separate function.

	}, {
		key: "doDragPositioning",
		value: function doDragPositioning(slide, isForward, sequence, dragPercentage) {
			var transition;
			var startParams, endParams;
			var params;
			var xform;

			switch (sequence) {
				case "previous":
					transition = this.transitionForAction(slide, "exitTransition");
					break;
				case "center":
					transition = this.transitionForAction(slide, "entryTransition");
					break;
				case "next":
				default:
					return;
			}
			startParams = this.initialParamsForTransformType(slide, transition.transform);
			endParams = transition.transformParams;

			dragPercentage = 1 - dragPercentage;
			if (isForward) {
				// Swap start & end
				params = this.positionBetweenMatrices(endParams, startParams, dragPercentage);
			} else {
				params = this.positionBetweenMatrices(startParams, endParams, dragPercentage);
			}
			xform = this.selectPagerTransform(transition.transform);
			slide.currentTransform = transition.transform;

			xform.set(slide, params);
		}
	}, {
		key: "restoreSlidePosition",
		value: function restoreSlidePosition(slide) {
			if (slide.currentTransform) {
				var xform = this.selectPagerTransform(slide.currentTransform);
				var startParams = xform.get(slide);
				var endParams = this.initialParamsForTransformType(slide, slide.currentTransform);
				xform.animate(slide, startParams, endParams);
			}
		}

		// Worker function that performs the slide animation for arrow navigation.

	}, {
		key: "doTransition",
		value: function doTransition(slide, isForward, sequence, resumeFromCurrentPosition) {
			if (!resumeFromCurrentPosition) {
				this.initSlideLocation(slide, false); //Set to initial location (could be hidden)
			}

			var transition;
			var startParams, endParams;
			var xform;

			switch (sequence) {
				case "previous":
					if (!resumeFromCurrentPosition) {
						this.initSlideLocation(slide, true); //Set to entry final location (this is where to start from).
					}
					transition = this.transitionForAction(slide, "exitTransition");
					if (isForward) {
						//ToDo? merge initial with slide params
						startParams = this.initialParamsForTransformType(slide, transition.transform);
						endParams = transition.transformParams;
					} else {
						// Prep slide by moving to "previous" location (no animation)
						xform = this.selectPagerTransform(transition.transform);
						xform.set(slide, transition.transformParams);
						return;
					}
					break;
				case "center":
					if (isForward) {
						transition = this.transitionForAction(slide, "entryTransition");
						startParams = this.initialParamsForTransformType(slide, transition.transform);
						endParams = transition.transformParams;
					} else {
						if (!resumeFromCurrentPosition) {
							this.initSlideLocation(slide, true); //Set to entry final location (where it will end up).
						}
						// Reverse exitTransition
						transition = this.transitionForAction(slide, "exitTransition");
						startParams = transition.transformParams;
						//ToDo? merge initial with slide params
						endParams = this.initialParamsForTransformType(slide, transition.transform);
					}
					break;
				case "next":
					if (isForward) {
						this.initSlideLocation(slide, false); //For resumeFromCurrentPosition
						return; // No-op for full transition
					}
					if (!resumeFromCurrentPosition) {
						this.initSlideLocation(slide, true); //Set to entry final location (this is where to start from).
					}
					// Reverse entryTransition
					transition = this.transitionForAction(slide, "entryTransition");
					startParams = transition.transformParams;
					//ToDo? merge initial with slide params
					endParams = this.initialParamsForTransformType(slide, transition.transform);
					break;
			}

			slide.currentTransform = transition.transform;
			slide.currentTransformOpts = {
				curve: transition.curve,
				duration: transition.duration
			};

			xform = this.selectPagerTransform(transition.transform);

			if (resumeFromCurrentPosition) {
				startParams = xform.get(slide);
			}
			xform.animate(slide, startParams, endParams);
		}

		// Page change handler

	}, {
		key: "pageChange",
		value: function pageChange(oldIndex, newIndex, direction, resumeFromCurrentPosition) {
			var isForward = direction === 1;
			var visibleSlides = this.adjacentSlides(newIndex);

			for (var i = 0; i < this.pages.length; i++) {
				for (var key in visibleSlides) {
					if (visibleSlides[key] === i) {
						// key is previous, center, next
						this.doTransition(this.pages[i], isForward, key, resumeFromCurrentPosition);
					}
				}
			}

			this.currentIndex = newIndex;

			// Callback hook for animation start
			if (typeof this.options.animStartCallback === "function") {
				this.options.animStartCallback(this.pages[this.currentIndex].node, this.currentIndex);
			}

			_FamousEngine2.default.requestUpdateOnNextTick(this);
		}
	}, {
		key: "createPages",
		value: function createPages(options) {
			var pages = [];

			for (var i = 0; i < options.carouselData.slides.length; i++) {
				var node, el;
				var backgroundSize = options.carouselData.slides[i].backgroundSize;

				if (options.carouselData.slides[i].type === "node") {
					node = options.carouselData.slides[i].data;
				} else {
					node = this.node.addChild();
					el = new _DOMElement2.default(node);
					if (typeof backgroundSize !== "string") {
						backgroundSize = "contain";
					}
					switch (options.carouselData.slides[i].type) {
						case "image":
							el.setProperty("backgroundImage", "url(" + options.carouselData.slides[i].data + ")");
							el.setProperty("backgroundRepeat", "no-repeat");
							el.setProperty("backgroundSize", backgroundSize);
							el.setProperty("backgroundPosition", "center");
							break;
						case "markup":
							el.setContent(options.carouselData.slides[i].data);
							break;
					}
					el.setProperty("backfaceVisibility", "hidden");
					el.setProperty("webkitBackfaceVisibility", "hidden");
				}

				var gestureHandler = new _GestureHandler2.default(node);
				var isForward;
				var startPositionX;
				var previousVelocityX;
				var dragXPercentage = 0;
				/*eslint-disable */
				gestureHandler.on("drag", (function (index, e) {
					switch (e.status) {
						case "start":
							this.draggedIndex = index;
							return;
						case "move":
							if (this.draggedIndex === index) {
								if (typeof isForward === "undefined") {
									isForward = e.centerDelta.x / this.pages[index].node.getSize()[0];
									if (isForward === 0) {
										isForward = undefined;
										return; // indeterminate direction
									}
									isForward = isForward < 0;
								}
								if (typeof startPositionX === "undefined") {
									startPositionX = e.center.x;
								}
								var visibleSlides = this.adjacentSlides(index + (isForward ? 1 : 0));
								for (var key in visibleSlides) {
									var idx = visibleSlides[key];
									dragXPercentage = Math.abs(startPositionX - e.pointers[0].position.x) / this.pages[idx].node.getSize()[0];
									this.doDragPositioning(this.pages[idx], isForward, key, dragXPercentage);
								}
							}
							return;
						case "end":
							if (dragXPercentage > this.threshold || Math.abs(e.centerVelocity.x) > 500) {
								this.options.context.emit("pageChange", {
									direction: isForward ? 1 : -1,
									numSlidesToAdvance: this.options.manualSlidesToAdvance,
									stopAutoPlay: true,
									resumeFromCurrentPosition: true
								});
							} else if (dragXPercentage !== 0) {
								// restore slide to original position
								var visibleSlides = this.adjacentSlides(index);
								for (var key in visibleSlides) {
									var idx = visibleSlides[key];
									this.restoreSlidePosition(this.pages[idx]);
								}
								_FamousEngine2.default.requestUpdateOnNextTick(this);
							}
							isForward = undefined;
							dragXPercentage = 0;
							startPositionX = undefined;
							return;
						default:
							return;
					}
				}).bind(this, i));
				/*eslint-enable */

				var page = {
					node: node,
					transitions: options.carouselData.slides[i].transitions,
					el: el,
					animDoneCallbackFired: false
				};

				pages.push(page);
				this.initSlideLocation(page, i === this.currentIndex);
			}

			this.pages = pages;
		}
	}, {
		key: "initSlideLocation",
		value: function initSlideLocation(slide, isCurrentIndex) {
			// Use initial settings from slide, falling back to global settings.
			var globalSlideTransitions = this.options.carouselData.transitions;
			var transitions = {};
			(0, _lodash2.default)(transitions, globalSlideTransitions, slide.transitions);

			// Place the initial slide at its destination location.
			if (isCurrentIndex) {
				var xform = this.selectPagerTransform(transitions.entryTransition.transform);
				xform.set(slide, transitions.entryTransition.transformParams);
				return;
			}

			if (_instanceof(transitions.initialAlign, Array)) {
				slide.node.setAlign(transitions.initialAlign[0], transitions.initialAlign[1], transitions.initialAlign[2]);
			}
			if (_instanceof(transitions.initialPosition, Array)) {
				slide.node.setPosition(transitions.initialPosition[0], transitions.initialPosition[1], transitions.initialPosition[2]);
			}
			if (_instanceof(transitions.initialMountPoint, Array)) {
				slide.node.setMountPoint(transitions.initialMountPoint[0], transitions.initialMountPoint[1], transitions.initialMountPoint[2]);
			}
			if (_instanceof(transitions.initialOrigin, Array)) {
				slide.node.setOrigin(transitions.initialOrigin[0], transitions.initialOrigin[1], transitions.initialOrigin[2]);
			}
			if (_instanceof(transitions.initialRotation, Array)) {
				slide.node.setRotation(transitions.initialRotation[0], transitions.initialRotation[1], transitions.initialRotation[2]);
			}
		}

		// Factory that returns the transform functions for the given type.

	}, {
		key: "selectPagerTransform",
		value: function selectPagerTransform(type) {
			switch (type) {
				case "align":
					return PagerAlign;
				case "position":
					return PagerPosition;
				case "rotate":
					return PagerRotate;
				case "mountPoint":
					return PagerMountPoint; //TBD
				case "origin":
					return PagerOrigin; //TBD
				case "physics":
					return PagerPhysics; //TBD
			}
		}

		// Return initial params based on the transform type

	}, {
		key: "initialParamsForTransformType",
		value: function initialParamsForTransformType(slide, type) {
			// Use initial settings from slide, falling back to global settings.
			var globalSlideTransitions = this.options.carouselData.transitions;
			var transitions = {};
			(0, _lodash2.default)(transitions, globalSlideTransitions, slide.transitions);

			switch (type) {
				case "align":
					return transitions.initialAlign;
				case "position":
					return transitions.initialPosition;
				case "mountPoint":
					return transitions.initialMountPoint;
				case "origin":
					return transitions.initialOrigin;
				case "rotate":
					return transitions.initialRotation;
			}
		}

		// Return transition for action (e.g. entry or exit).
		// Search global as well as local slide overrides.

	}, {
		key: "transitionForAction",
		value: function transitionForAction(slide, action) {
			var globalTransition = this.options.carouselData.transitions ? this.options.carouselData.transitions[action] : {};
			var slideTransition = slide.transitions ? slide.transitions[action] : {};
			var transition = {};
			(0, _lodash2.default)(transition, globalTransition, slideTransition);
			return transition;
		}

		// Find slides adjacent to the current index. Returns an object with keys
		// previous, current, next.
		// If input slide is at either end, the previous or next values wrap around.

	}, {
		key: "adjacentSlides",
		value: function adjacentSlides(centerIndex) {
			centerIndex = centerIndex < 0 ? this.pages.length - 1 : centerIndex;
			centerIndex = centerIndex >= this.pages.length ? 0 : centerIndex;

			var slides = {};
			slides.previous = centerIndex - 1;
			slides.next = centerIndex + 1;

			slides.previous = slides.previous < 0 ? this.pages.length - 1 : slides.previous;
			slides.next = slides.next >= this.pages.length ? 0 : slides.next;
			slides.center = centerIndex;

			return slides;
		}
	}, {
		key: "removePages",
		value: function removePages() {
			for (var i = 0; i < this.pages.length; i++) {
				//DOMElement bug https://github.com/Famous/engine/issues/245
				if (this.pages[i].el) {
					this.pages[i].el.setProperty("display", "none");
				}
				this.pages[i].node.dismount();
				this.options.parent.removeChild(this.pages[i].node);
				delete this.pages[i].node;
			}
			delete this.pages;
		}
	}]);

	return Pager;
})();

