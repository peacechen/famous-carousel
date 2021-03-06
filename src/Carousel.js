/**
 * Carousel.js
 */

import {core} from "famous";
import {Arrow} from "./Arrow";
import {Pager} from "./Pager";
import {Dots} from "./Dots";
var FamousEngine = core.FamousEngine;

export class Carousel {

	constructor(carouselOptions) {
		var context;
		switch (typeof carouselOptions.selector) {
			case "object":
				context = carouselOptions.selector; //famous node
				break;
			case "string":
				var carouselSelector = document.querySelector(carouselOptions.selector);
				carouselSelector.style.overflow = "hidden";
				carouselSelector.style.position = "relative";
				/* falls through */
			case "undefined":
				FamousEngine.init();
				context = FamousEngine.createScene(carouselOptions.selector);
				break;
			default:
				throw ("famous-carousel: unsupported selector type");
		}

		// Public
		// ------------------------------------------------------------------------
		var carousel = {
			options: carouselOptions,
			context: context,
			autoPlay: carouselOptions.autoPlay || 0,
			initialIndex: carouselOptions.initialIndex || 0
		};
		carousel.root = carousel.context.addChild();

		carousel.updateData = function(carouselData) {
			carousel.clearSlides();
			carousel.options.carouselData = carouselData;
			carousel.pager.createPages(carousel.options);
			carousel.dots.createDots(carouselData.slides.length);

			_positionComponents();
		};

		// Clear slides from carousel.
		carousel.clearSlides = function() {
			carousel.pager.removePages();
			carousel.dots.removeDots();
		};

		// Clear everything: slides, dots, arrows and carousel node.
		// Call this if you don't intend to use the carousel anymore in the session.
		carousel.clearAll = function() {
			this.clearSlides();
			carousel.root.removeChild(carousel.dots.node);
			delete carousel.dots.node;
			carousel.root.removeChild(carousel.pager.node);
			delete carousel.pager.node;

			for (var arrow in carousel.arrows) {
				carousel.arrows[arrow].remove();
				delete carousel.arrows[arrow];
			}
			delete carousel.arrows;

			carousel.root.dismount();
			carousel.context.removeChild(carousel.root);
			delete carousel.root;

			carousel.context.dismount();
			FamousEngine.removeScene(carousel.context);

			window.removeEventListener("keydown", _keyHandler);

			//DOMElement bug https://github.com/Famous/engine/issues/245
			var container = document.querySelector(carousel.options.selector);
			var carouselChild = container.querySelector(".famous-dom-renderer");
			container.removeChild(carouselChild);
		};
		// ------------------------------------------------------------------------

		var autoPlayTimer = null;

		if (carousel.options.initialIndex > carousel.options.carouselData.slides.length - 1) {
			// Cap starting index to final page.
			carousel.options.initialIndex = carousel.options.carouselData.slides.length - 1;
		}

		// Instantiate pager (slides), dots, arrows.
		carousel.options.context = carousel.context;
		carousel.options.parent = carousel.root;
		carousel.pager = new Pager(carousel.options);
		if (typeof carousel.options.autoPlay === "number" && carousel.options.autoPlay) {
			_autoPlay();
		}

		carousel.dots = new Dots({
			parent: carousel.root,
			numPages: carousel.options.carouselData.slides.length,
			initialIndex: carousel.options.initialIndex,
			width: carousel.options.dotWidth,
			spacing: carousel.options.dotSpacing,
			cssSelectedClass: carousel.options.dotSelectedClass,
			cssUnselectedClass: carousel.options.dotUnselectedClass,
			foregroundColor: carousel.options.dotForeColor,
			backgroundColor: carousel.options.dotBackColor,
			opacity: carousel.options.dotOpacity
		});

		var arrowOpts = {
			context: carousel.context,
			parent: carousel.root,
			cssClass: carousel.options.arrowClass,
			fillColor: carousel.options.arrowFillColor,
			outlineColor: carousel.options.arrowOutlineColor,
			manualSlidesToAdvance: carousel.options.manualSlidesToAdvance
		};
		arrowOpts.direction = -1;
		var backArrow = new Arrow(arrowOpts);
		arrowOpts.direction = 1;
		var nextArrow = new Arrow(arrowOpts);
		carousel.arrows = {
			back: backArrow,
			next: nextArrow
		};

		_positionComponents();

		var currentIndex = carousel.initialIndex;
		_bindEvents();

		// Helper methods
		// ------------------------------------------------------------------------
		function _positionComponents() {
			carousel.arrows.back.node.setSizeMode(1, 1);
			carousel.arrows.back.node.setAbsoluteSize(40, 40);
			carousel.arrows.back.node.setPosition(10, 0, 0);
			carousel.arrows.back.node.setAlign(0, 0.5, 0);
			carousel.arrows.back.node.setMountPoint(0, 0.5, 0);

			carousel.arrows.next.node.setSizeMode(1, 1);
			carousel.arrows.next.node.setAbsoluteSize(40, 40);
			carousel.arrows.next.node.setPosition(10, 0, 0);
			carousel.arrows.next.node.setAlign(1, 0.5, 0);
			carousel.arrows.next.node.setMountPoint(1, 0.5, 0);
			_updateArrows(carousel.options.initialIndex);

			carousel.dots.node.setSizeMode(1, 1);
			carousel.dots.node.setAbsoluteSize(null, 20);
			// carousel.dots.node.setPosition(0, -30, 0);
			carousel.dots.node.setAlign(0.5, 1, 0);
			carousel.dots.node.setMountPoint(0.5, 1, 0);

			carousel.pager.node.setAlign(0.5, 0.5, 0);
			carousel.pager.node.setMountPoint(0.5, 0.5, 0);
		}

		function _updateArrows(newIndex) {
			var min = 0;
			var max = carousel.options.carouselData.slides.length - 1;
			var floor = min;
			var ceiling = max;
			if (carousel.options.wrapAround) {
				ceiling = min;
				floor = max;
			}
			newIndex = newIndex > max ? ceiling : (newIndex < min ? floor : newIndex);

			if (!carousel.options.wrapAround) {
				//Disable or enable arrow at ends.
				if (newIndex === max) {
					carousel.arrows.next.setEnableState(false);
				} else if (newIndex === min) {
					carousel.arrows.back.setEnableState(false);
				} else {
					carousel.arrows.next.setEnableState(true);
					carousel.arrows.back.setEnableState(true);
				}
			}
			return newIndex;
		}

		function _bindEvents() {
			//listen for a "pageChange" event
			carousel.root.onReceive = function(e, payload) {
				if (e === "pageChange") {
					var direction = payload.direction;
					var numSlidesToAdvance = payload.numSlidesToAdvance || 1;

					if (payload.stopAutoPlay && autoPlayTimer) {
						clearTimeout(autoPlayTimer);
						autoPlayTimer = null;
					}

					var oldIndex = currentIndex;
					var newIndex = oldIndex + (direction * numSlidesToAdvance);
					newIndex = _updateArrows(newIndex);

					if (currentIndex !== newIndex) {
						currentIndex = newIndex;
						carousel.dots.pageChange(oldIndex, currentIndex);
						carousel.pager.pageChange(oldIndex, currentIndex, direction, payload.resumeFromCurrentPosition);
					}
				}
			};

			window.addEventListener("keydown", _keyHandler);
		}

		function _keyHandler(e) {
			var direction;
			switch (e.keyCode) {
				case 39:
					direction = 1;
					break;
				case 37:
					direction = -1;
					break;
				default:
					return;
			}
			carousel.context.emit("pageChange", {
				direction: direction,
				numSlidesToAdvance: carousel.options.manualSlidesToAdvance,
				stopAutoPlay: true
			});
		}

		function _autoPlay() {
			autoPlayTimer = setTimeout(function() {
				carousel.context.emit("pageChange", {
					direction: 1,
					numSlidesToAdvance: carousel.options.autoSlidesToAdvance
				});
				_autoPlay();
			}, carousel.options.autoPlay);
		}
		// ------------------------------------------------------------------------

		return carousel;
	}
}
