"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * Arrow.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        */

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Arrow = undefined;

var _FamousEngine = require("famous/core/FamousEngine");

var _FamousEngine2 = _interopRequireDefault(_FamousEngine);

var _DOMElement = require("famous/dom-renderables/DOMElement");

var _DOMElement2 = _interopRequireDefault(_DOMElement);

var _GestureHandler = require("famous/components/GestureHandler");

var _GestureHandler2 = _interopRequireDefault(_GestureHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Arrow = exports.Arrow = (function () {
	function Arrow(options) {
		_classCallCheck(this, Arrow);

		this.context = options.context;
		this.parent = options.parent;
		this.node = this.parent.addChild();
		this.fillColor = options.fillColor || "white";
		this.outlineColor = options.outlineColor || "transparent";
		this.direction = options.direction;
		this.manualSlidesToAdvance = options.manualSlidesToAdvance;
		this.clickTime = 0;

		this.el = new _DOMElement2.default(this.node);
		this.el.setProperty("fontSize", "40px");
		this.el.setProperty("lineHeight", "40px");
		this.el.setProperty("cursor", "pointer");
		this.el.setProperty("textHighlight", "none");
		this.el.setProperty("zIndex", "2");
		if (options.cssClass && typeof options.cssClass === "string") {
			this.el.addClass(options.cssClass);
		} else {
			this.el.setProperty("color", this.fillColor);
			this.el.setProperty("textShadow", "-1px 0 " + this.outlineColor + ", 0 1px " + this.outlineColor + ", 1px 0 " + this.outlineColor + ", 0 -1px " + this.outlineColor);
		}
		this.el.setContent(this.direction === 1 ? ">" : "<");

		this.gestures = new _GestureHandler2.default(this.node);
		this.gestures.on("tap", this.emitPageChange.bind(this));

		//GestureHandler doesn't work for IE<11. Add a handler for it. Yuk!
		if (navigator.userAgent.indexOf("MSIE") !== -1) {
			_FamousEngine2.default.requestUpdate(this);
		}
	}

	_createClass(Arrow, [{
		key: "onUpdate",
		value: function onUpdate() {
			//unused param: time
			//IE hack to support clicks. Look for element after it's rendered & attach handler.
			this.arrowEl = document.querySelector("[data-fa-path='" + this.el._attributes["data-fa-path"] + "']");
			if (!this.arrowEl) {
				_FamousEngine2.default.requestUpdate(this);
			} else {
				this.arrowEl.attachEvent("onclick", this.emitPageChange.bind(this));
			}
		}
	}, {
		key: "emitPageChange",
		value: function emitPageChange(e) {
			if (e.time - this.clickTime > 200) {
				//debounce touch
				this.clickTime = e.time;
				this.context.emit("pageChange", {
					direction: this.direction,
					numSlidesToAdvance: this.manualSlidesToAdvance,
					stopAutoPlay: true
				});
			}
		}
	}, {
		key: "setEnableState",
		value: function setEnableState(enable) {
			if (enable) {
				this.el.setProperty("display", "block");
			} else {
				this.el.setProperty("display", "none");
			}
		}
	}, {
		key: "remove",
		value: function remove() {
			if (this.arrowEl) {
				this.arrowEl.detachEvent("onclick", this.emitPageChange); //For IE<11
			}

			//DOMElement bug https://github.com/Famous/engine/issues/245
			this.el.setProperty("display", "none");
			this.node.dismount();
			this.parent.removeChild(this.node);
			delete this.node;
		}
	}]);

	return Arrow;
})();

