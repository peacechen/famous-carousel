/**
 * Dots.js
 */

import DOMElement from "famous/dom-renderables/DOMElement";

export class Dots {
	constructor(options) {
		this.options = options;
		this.node = options.parent.addChild();
		// Storage for all the children -- the "dot" nodes
		this.dots = [];

		// Size and positioning for the individual dots
		this.width = options.dotWidth || 10;
		this.spacing = options.dotSpacing || 5;

		this.initialIndex = options.initialIndex || 0;
		options.foregroundColor = options.foregroundColor || "white";
		options.backgroundColor = options.backgroundColor || "transparent";
		options.opacity = options.opacity || 1.0;

		// Determine how many children to add
		this.numPages = options.numPages;
		this.createDots(this.numPages);

		//add a component to keep dot layout updated
		var resizeComponent = {
			onSizeChange: function(x, y, z) {
				//this will layout the dots whenever a resize occurs
				this.layoutDots(x, y, z);
			}.bind(this)
		};
		this.node.addComponent(resizeComponent);
	}

	createDots(numPages) {
		for (var i = 0; i < numPages; i++) {
			// Create new child node for each dot
			var dotNode = this.node.addChild();

			// Size the child
			dotNode.setSizeMode(1, 1);
			dotNode.setAbsoluteSize(this.width, this.width);

			// Store child nodes in the dots array
			this.dots.push(new Dot(dotNode, this.options));
		}
		// Highlight the first/initial dot in the collection
		this.dots[this.initialIndex].select(this.options);
	}

	// Evenly space out the dots
	layoutDots(x) { //unused vars: y, z
		var totalDotSize = this.width * this.numPages + this.spacing * (this.numPages - 1);
		var start = (x - totalDotSize) / 2;
		for (var i = 0; i < this.numPages; i++) {
			this.dots[i].node.setPosition(start + (this.width + this.spacing) * i, 0, 0);
		}
	}

	// Update the selected dots on change of current page.
	pageChange(oldIndex, newIndex) {
		this.dots[oldIndex].deselect(this.options);
		this.dots[newIndex].select(this.options);
	}

	removeDots() {
		for (var i = 0; i < this.dots.length; i++) {
			//DOMElement bug https://github.com/Famous/engine/issues/245
			this.dots[i].el.setProperty("display", "none");
			this.node.removeChild(this.dots[i].node);
		}
		this.dots = [];
	}
}

export class Dot {
	constructor(node, options) {
		this.node = node;
		this.el = new DOMElement(node);
		this.el.setProperty("borderRadius", "5px");
		this.el.setProperty("boxSizing", "border-box");
		if (options.cssUnselectedClass && typeof options.cssUnselectedClass === "string") {
			this.el.addClass(options.cssUnselectedClass);
		} else {
			this.el.setProperty("border", "2px solid " + options.foregroundColor);
			this.el.setProperty("boxShadow", "0px 0px 0px 1px " + options.backgroundColor);
			this.el.setProperty("backgroundColor", options.backgroundColor);
			this.el.setProperty("opacity", options.opacity);
		}
	}

	select(options) {
		if (options.cssSelectedClass && typeof options.cssSelectedClass === "string") {
			this.el.addClass(options.cssSelectedClass);
			this.el.removeClass(options.cssUnselectedClass);
		} else {
			this.el.setProperty("backgroundColor", options.foregroundColor);
		}
	}

	deselect(options) {
		if (options.cssUnselectedClass && typeof options.cssUnselectedClass === "string") {
			this.el.addClass(options.cssUnselectedClass);
			this.el.removeClass(options.cssSelectedClass);
		} else {
			this.el.setProperty("backgroundColor", options.backgroundColor);
		}
	}
}
