/**
 * Pager.js
 */

import DOMElement from "famous/dom-renderables/DOMElement";
import PhysicsEngine from "famous/physics/PhysicsEngine";
import FamousEngine from "famous/core/FamousEngine";
import GestureHandler from "famous/components/GestureHandler";

import physics from "famous/physics";
import math from "famous/math";

var Box = physics.Box;
var Spring = physics.Spring;
var Vec3 = math.Vec3;
var hideAngle = Math.PI / 2;

export class Pager {
	constructor(options) {
		this.options = options;
		this.node = options.parent.addChild();
		this.currentIndex = options.initialIndex || 0;
		this.threshold = 0.45;
		this.pageWidth = 0;

		// Add a physics simulation and update this instance using regular time updates from the clock.
		this.simulation = new PhysicsEngine();

		var resizeComponent = {
			onSizeChange: x => this.pageWidth = x
		};
		this.node.addComponent(resizeComponent);

		// .requestUpdate will call the .onUpdate method next frame, passing in the time stamp for that frame
		FamousEngine.requestUpdate(this);

		this.createPages(this.options);

		// Fire animStartCallback for first slide.
		if (typeof this.options.animStartCallback === "function") {
			this.options.animStartCallback(this.pages[this.currentIndex].node, this.currentIndex);
		}
	}

	onUpdate(time) {
		if (!this.node) {
			return;
		}

		this.simulation.update(time);

		var page;
		var physicsTransform;
		var p, r, xPos;
		for (var i = 0, len = this.pages.length; i < len; i++) {
			page = this.pages[i];

			// Get the transform from the `Box` body
			physicsTransform = this.simulation.getTransform(page.box);
			p = physicsTransform.position;

			// Set the `slide`s x-position to the `Box` body's x-position
			// Math.round is significantly faster than toFixed.
			xPos = Math.round(p[0] * this.pageWidth * 100) / 100;
			page.node.setPosition(xPos, 0, 0);

			// Set the currently selected page's rotation to match the `Box` body's rotation
			if (i === this.currentIndex) {
				r = physicsTransform.rotation;
				page.node.setRotation(r[0], r[1], r[2], r[3]);

				//Fire user callback when sliding is done.
				if (Math.abs(xPos) === 0 && !page.animDoneCallbackFired) {
					page.animDoneCallbackFired = true;
					if (typeof this.options.animDoneCallback === "function") {
						this.options.animDoneCallback(page.node, i);
					}
				}
			} else {
				page.animDoneCallbackFired = false;
			}
		}

		FamousEngine.requestUpdateOnNextTick(this);
	}

	pageChange(oldIndex, newIndex) {
		var xOffset;
		var reshuffle = false;
		var i;
		// Wrap-around cases shuffle pages to other side.
		if (oldIndex === this.pages.length - 1 && newIndex === 0) {
			xOffset = 1;
			reshuffle = true;
		} else if (oldIndex === 0 && newIndex === this.pages.length - 1) {
			xOffset = -1;
			reshuffle = true;
		}

		if (reshuffle) {
			for (i = 0; i < this.pages.length; i++) {
				this.pages[i].anchor.set(xOffset, 0, 0);
				this.pages[i].node.setRotation(0, hideAngle, 0);
			}
		} else {
			// Non-wrapping cases
			xOffset = (oldIndex < newIndex) ? -1 : 1;
			this.pages[oldIndex].anchor.set(xOffset, 0, 0);
			this.pages[oldIndex].node.setRotation(0, hideAngle, 0);
		}

		var visibleSlides = this.adjacentSlides(newIndex);
		var yRotation;
		for (i = 0; i < this.pages.length; i++) {
			yRotation = hideAngle;
			for (var key in visibleSlides) {
				if (visibleSlides[key] === i) {
					yRotation = 0;
					switch (key) {
						case "left":
							xOffset = -1;
							break;
						case "center":
							xOffset = 0;
							break;
						case "right":
							xOffset = 1;
							break;
					}
					this.pages[i].anchor.set(xOffset, 0, 0);
				}
			}
			this.pages[i].node.setRotation(0, yRotation, 0);
		}

		this.currentIndex = newIndex;

		if (typeof this.options.animStartCallback === "function") {
			this.options.animStartCallback(this.pages[this.currentIndex].node, this.currentIndex);
		}
	}

	removePages() {
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

	createPages(options) {
		var pages = [];

		for (var i = 0; i < options.carouselData.length; i++) {
			var slide, el;
			var backgroundSize = options.carouselData[i].backgroundSize;

			if (options.carouselData[i].type === "node") {
				slide = options.carouselData[i].data;
			} else {
				slide = this.node.addChild();
				el = new DOMElement(slide);
				if (typeof backgroundSize !== "string") {
					backgroundSize = "contain";
				}
				switch (options.carouselData[i].type) {
					case "image":
						el.setProperty("backgroundImage", "url(" + options.carouselData[i].data + ")");
						el.setProperty("backgroundRepeat", "no-repeat");
						el.setProperty("backgroundSize", backgroundSize);
						el.setProperty("backgroundPosition", "center");
						break;
					case "markup":
						el.setContent(options.carouselData[i].data);
						break;
				}
			}

			slide.setAlign(0.5, 0.5);
			slide.setMountPoint(0.5, 0.5);
			slide.setOrigin(0.5, 0.5);

			var gestureHandler = new GestureHandler(slide);
			var anchorXoffset;
			/*eslint-disable */
			gestureHandler.on("drag", function(index, e) {
				switch (e.status) {
					case "start":
						this.draggedIndex = index;
						anchorXoffset = 0;
						return;
					case "move":
						if (this.draggedIndex === index) {
							var visibleSlides = this.adjacentSlides(index);
							for (var key in visibleSlides) {
								var idx = visibleSlides[key];
								if (isNaN(idx)) {
									continue;
								}
								anchorXoffset = e.centerDelta.x / this.pages[idx].node.getSize()[0];
								anchorXoffset += this.pages[idx].anchor.x;
								this.pages[idx].anchor.set(anchorXoffset, 0, 0);
							}
						}
						return;
					case "end":
						if (this.draggedIndex === index) {
							var direction = 0;
							if (anchorXoffset >= this.threshold) {
								direction = -1; // left
							}
							else if (anchorXoffset <= -this.threshold) {
								direction = 1; // right
							}

							if (direction === 0) {
								// Snap anchor back to center on release
								var visibleSlides = this.adjacentSlides(index);

								if (this.pages[index].anchor.x !== 0) {
									this.pages[index].anchor.set(0, 0, 0);
									if (!isNaN(visibleSlides.left)) {
										this.pages[visibleSlides.left].anchor.set(-1, 0, 0);
									}
									if (!isNaN(visibleSlides.right)) {
										this.pages[visibleSlides.right].anchor.set(1, 0, 0);
									}
								}
							}
							else {
								// Fire page change event if slide has moved beyond threshold
								this.options.context.emit("pageChange", {
									direction: direction,
									numSlidesToAdvance: this.options.manualSlidesToAdvance,
									stopAutoPlay: true
								});
							}
						}
						this.draggedIndex = -1;
						return;
					default:
						return;
				}

			}.bind(this, i));
			/*eslint-enable */

			// A `Box` body to relay simulation data back to the visual element
			var box = new Box({
				mass: 100,
				size: [100, 100, 100]
			});

			// Place all anchors off the screen & rotated, except for the
			// anchor belonging to the first/initial image node
			var anchor = new Vec3(1, 0, 0); //off-screen
			var yAngle = hideAngle;
			if (i === this.currentIndex) {
				anchor = new Vec3(0, 0, 0); //on-screen
				yAngle = 0;
			}
			slide.setRotation(0, yAngle, 0);

			// Attach the box to the anchor with a `Spring` force
			//ToDo: Add support for user-configurable transition
			var spring = new Spring(null, box, {
				period: 0.4,
				dampingRatio: 0.7,
				anchor: anchor
			});

			// Notify the physics engine to track the box and the springs
			this.simulation.add(box, spring);

			pages.push({
				node: slide,
				el: el,
				box: box,
				spring: spring,
				anchor: anchor,
				animDoneCallbackFired: false
			});
		}

		this.pages = pages;
	}

	// Find slides adjacent to the current index. Returns an object with keys
	// left, center, right.
	// If input slide is at either end, the left or right values are undefined.
	adjacentSlides(centerIndex) {
		var slides = {};
		slides.left = centerIndex - 1;
		slides.right = centerIndex + 1;

		slides.left = slides.left < 0 ? undefined : slides.left;
		slides.right = slides.right >= this.pages.length ? undefined : slides.right;
		slides.center = centerIndex;

		return slides;
	}

}
