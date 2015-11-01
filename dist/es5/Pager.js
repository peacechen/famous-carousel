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

var _PhysicsEngine = require("famous/physics/PhysicsEngine");

var _PhysicsEngine2 = _interopRequireDefault(_PhysicsEngine);

var _FamousEngine = require("famous/core/FamousEngine");

var _FamousEngine2 = _interopRequireDefault(_FamousEngine);

var _GestureHandler = require("famous/components/GestureHandler");

var _GestureHandler2 = _interopRequireDefault(_GestureHandler);

var _physics = require("famous/physics");

var _physics2 = _interopRequireDefault(_physics);

var _math = require("famous/math");

var _math2 = _interopRequireDefault(_math);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Box = _physics2.default.Box;
var Spring = _physics2.default.Spring;
var Vec3 = _math2.default.Vec3;
var hideAngle = Math.PI / 2;

var Pager = exports.Pager = (function () {
	function Pager(options) {
		var _this = this;

		_classCallCheck(this, Pager);

		this.options = options;
		this.node = options.parent.addChild();
		this.currentIndex = options.initialIndex || 0;
		this.threshold = 4000;
		this.force = new Vec3();
		this.pageWidth = 0;

		// Add a physics simulation and update this instance using regular time updates from the clock.
		this.simulation = new _PhysicsEngine2.default();

		var resizeComponent = {
			onSizeChange: function onSizeChange(x) {
				return _this.pageWidth = x;
			}
		};
		this.node.addComponent(resizeComponent);

		// .requestUpdate will call the .onUpdate method next frame, passing in the time stamp for that frame
		_FamousEngine2.default.requestUpdate(this);

		this.createPages(this.options);
	}

	_createClass(Pager, [{
		key: "onUpdate",
		value: function onUpdate(time) {
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

			_FamousEngine2.default.requestUpdateOnNextTick(this);
		}
	}, {
		key: "pageChange",
		value: function pageChange(oldIndex, newIndex) {
			var xOffset;
			var reshuffle = false;
			// Wrap-around cases shuffle pages to other side.
			if (oldIndex === this.pages.length - 1 && newIndex === 0) {
				xOffset = 1;
				reshuffle = true;
			} else if (oldIndex === 0 && newIndex === this.pages.length - 1) {
				xOffset = -1;
				reshuffle = true;
			}

			if (reshuffle) {
				for (var i = 0; i < this.pages.length; i++) {
					this.pages[i].anchor.set(xOffset, 0, 0);
					this.pages[i].node.setRotation(0, hideAngle, 0);
				}
			} else {
				// Non-wrapping cases
				xOffset = oldIndex < newIndex ? -1 : 1;
				this.pages[oldIndex].anchor.set(xOffset, 0, 0);
				this.pages[oldIndex].node.setRotation(0, hideAngle, 0);
			}

			this.pages[newIndex].anchor.set(0, 0, 0);
			this.pages[newIndex].node.setRotation(0, 0, 0);
			this.currentIndex = newIndex;
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
	}, {
		key: "createPages",
		value: function createPages(options) {
			var pages = [];

			for (var i = 0; i < options.carouselData.length; i++) {
				var slide, el;
				var backgroundSize = options.carouselData[i].backgroundSize;

				if (options.carouselData[i].type === "node") {
					slide = options.carouselData[i].data;
				} else {
					slide = this.node.addChild();
					el = new _DOMElement2.default(slide);
					if (typeof backgroundSize !== "string") {
						backgroundSize = "contain";
					}
					switch (options.carouselData[i].type) {
						case "image":
							el.setProperty("backgroundImage", "url(" + options.carouselData[i].data + ")");
							el.setProperty("background-repeat", "no-repeat");
							el.setProperty("background-size", backgroundSize);
							el.setProperty("background-position", "center");
							break;
						case "markup":
							el.setContent(options.carouselData[i].data);
							break;
					}
				}

				slide.setAlign(0.5, 0.5);
				slide.setMountPoint(0.5, 0.5);
				slide.setOrigin(0.5, 0.5);

				var gestureHandler = new _GestureHandler2.default(slide);
				/*eslint-disable */
				gestureHandler.on("drag", (function (index, e) {
					this.force.set(e.centerDelta.x, 0, 0); // Add a force equal to change in X direction
					this.force.scale(20); // Scale the force up
					this.pages[index].box.applyForce(this.force); // Apply the force to the `Box` body

					var direction = 0;
					if (e.centerVelocity.x > this.threshold) {
						if (this.draggedIndex === index && this.currentIndex === index) {
							// Move index to left
							direction = -1;
						}
					} else if (e.centerVelocity.x < -this.threshold) {
						if (this.draggedIndex === index && this.currentIndex === index) {
							direction = 1;
						}
					}
					if (direction !== 0) {
						this.options.context.emit("pageChange", {
							direction: direction,
							numSlidesToAdvance: this.options.manualSlidesToAdvance,
							stopAutoPlay: true
						});
					}

					if (e.status === "start") {
						this.draggedIndex = index;
					}
				}).bind(this, i));
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
					period: 0.3,
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
	}]);

	return Pager;
})();

