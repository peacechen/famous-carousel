/**
 * Pager.js
*/

var DOMElement = require("famous/dom-renderables/DOMElement");
var PhysicsEngine = require("famous/physics/PhysicsEngine");
var FamousEngine = require("famous/core/FamousEngine");
var GestureHandler = require("famous/components/GestureHandler");

var physics = require("famous/physics");
var math = require("famous/math");
var Box = physics.Box;
var Spring = physics.Spring;
var Vec3 = math.Vec3;
var hideAngle = Math.PI / 2;

function Pager(options) {
    this.options = options;
    this.node = options.parent.addChild();
    this.currentIndex = options.initialIndex || 0;
    this.threshold = 4000;
    this.pageWidth = 0;

    var resizeComponent = {
        onSizeChange: function(size) {
            this.defineWidth(size);
        }.bind(this)
    };
    this.node.addComponent(resizeComponent);

    // Add a physics simulation and update this instance using regular time updates from the clock.
    this.simulation = new PhysicsEngine();

    // .requestUpdate will call the .onUpdate method next frame, passing in the time stamp for that frame
    FamousEngine.requestUpdate(this);

    this.threshold = 4000;
    this.force = new Vec3();

    this.createPages(this.options);
}

Pager.prototype.defineWidth = function(size) {
    this.pageWidth = size[0];
};

Pager.prototype.onUpdate = function(time) {
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

        // Set the currently selected page"s rotation to match the `Box` body's rotation
        if (i === this.currentIndex) {
            r = physicsTransform.rotation;
            page.node.setRotation(r[0], r[1], r[2], r[3]);
        }
    }

    FamousEngine.requestUpdateOnNextTick(this);
};

Pager.prototype.pageChange = function(oldIndex, newIndex) {
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
        xOffset = (oldIndex < newIndex) ? -1 : 1;
        this.pages[oldIndex].anchor.set(xOffset, 0, 0);
        this.pages[oldIndex].node.setRotation(0, hideAngle, 0);
    }

    this.pages[newIndex].anchor.set(0, 0, 0);
    this.pages[newIndex].node.setRotation(0, 0, 0);
    this.currentIndex = newIndex;
};

Pager.prototype.removePages = function() {
    for (var i = 0; i < this.pages.length; i++) {
        //DOMElement bug https://github.com/Famous/engine/issues/245
        if (this.pages[i].el) {
            this.pages[i].el.setProperty("display", "none");
        }
        this.options.parent.removeChild(this.pages[i].node);
    }
    this.pages = [];
};

Pager.prototype.createPages = function(options) {
    var pages = [];

    for (var i = 0; i < options.carouselData.length; i++) {
        var slide, el;

        if (options.carouselData[i].type === "node") {
            slide = options.carouselData[i].data;
        } else {
            slide = this.node.addChild();
            el = new DOMElement(slide);
            switch (options.carouselData[i].type) {
                case "image":
                    el.setProperty("backgroundImage", "url(" + options.carouselData[i].data + ")");
                    el.setProperty("background-repeat", "no-repeat");
                    el.setProperty("background-size", "contain");
                    el.setProperty("background-position", "center");
                    break;
                case "markup":
                    el.setContent(options.carouselData[i].data);
                    break;
            }
        }

        // slide.setProportionalSize(1, 1);
        slide.setAlign(0.5, 0.5);
        slide.setMountPoint(0.5, 0.5);
        slide.setOrigin(0.5, 0.5);

        var gestureHandler = new GestureHandler(slide);
        /*eslint-disable */
        gestureHandler.on("drag", function(index, e) {
            this.force.set(e.centerDelta.x, 0, 0); // Add a force equal to change in X direction
            this.force.scale(20); // Scale the force up
            this.pages[index].box.applyForce(this.force); // Apply the force to the `Box` body

            if (e.centerVelocity.x > this.threshold) {
                if (this.draggedIndex === index && this.currentIndex === index) {
                    // Move index to left
                    this.node.emit("pageChange", {
                        direction: -1,
                        numSlidesToAdvance: this.options.manualSlidesToAdvance,
                        stopAutoPlay: true
                    });
                }
            } else if (e.centerVelocity.x < -this.threshold) {
                if (this.draggedIndex === index && this.currentIndex === index) {
                    this.node.emit("pageChange", {
                        direction: 1,
                        numSlidesToAdvance: this.options.manualSlidesToAdvance,
                        stopAutoPlay: true
                    });
                }
            }
            if (e.status === "start") {
                this.draggedIndex = index;
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
        var anchorPt = 1;
        var yAngle = hideAngle;
        if (i === this.currentIndex) {
            anchorPt = 0;
            yAngle = 0;
        }
        var anchor = new Vec3(anchorPt, 0, 0);
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
            anchor: anchor
        });
    }

    this.pages = pages;
};

module.exports = Pager;
