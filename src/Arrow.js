/**
 * Arrow.js
*/

import FamousEngine from 'famous/core/FamousEngine';
import DOMElement from 'famous/dom-renderables/DOMElement';
import GestureHandler from 'famous/components/GestureHandler';

export class Arrow {

  constructor(options) {
    this.parent = options.parent;
    console.log(options)
    this.node = this.parent.addChild();
    this.fillColor = options.fillColor || "white";
    this.outlineColor = options.outlineColor || "transparent";
    this.direction = options.direction;
    this.manualSlidesToAdvance = options.manualSlidesToAdvance;

    this.el = new DOMElement(this.node);
    this.el.setProperty("fontSize", "40px");
    this.el.setProperty("lineHeight", "40px");
    this.el.setProperty("cursor", "pointer");
    this.el.setProperty("textHighlight", "none");
    this.el.setProperty("zIndex", "2");
    if (options.cssClass && typeof options.cssClass === "string") {
        this.el.addClass(options.cssClass);
    } else {
        this.el.setProperty("color", this.fillColor);
        this.el.setProperty("textShadow", "-1px 0 " + this.outlineColor +
                                            ", 0 1px " + this.outlineColor +
                                            ", 1px 0 " + this.outlineColor +
                                            ", 0 -1px " + this.outlineColor);
    }
    this.el.setContent(this.direction === 1 ? ">" : "<");

    this.gestures = new GestureHandler(this.node);
    this.gestures.on("tap", this.emitPageChange.bind(this));

    //GestureHandler doesn't work for IE<11. Add a handler for it. Yuk!
    if (navigator.userAgent.indexOf("MSIE") !== -1) {
        FamousEngine.requestUpdate(this);
    }

  }

  onUpdate() { //unused param: time
      //IE hack to support clicks. Look for element after it's rendered & attach handler.
      this.arrowEl = document.querySelector(
          "[data-fa-path='" + this.el._attributes["data-fa-path"] + "']");
      if (!this.arrowEl) {
          FamousEngine.requestUpdate(this);
      } else {
          this.arrowEl.attachEvent("onclick", this.emitPageChange.bind(this));
      }
  }

  emitPageChange() {
      this.node.emit("pageChange", {
          direction: this.direction,
          numSlidesToAdvance: this.manualSlidesToAdvance,
          stopAutoPlay: true
      });
  }

  setEnableState(enable) {
      if (enable) {
          this.el.setProperty("display", "block");
      } else {
          this.el.setProperty("display", "none");
      }
  }

  remove() {
      if (this.arrowEl) {
          this.arrowEl.detachEvent("onclick", this.emitPageChange); //For IE<11
      }

      //DOMElement bug https://github.com/Famous/engine/issues/245
      this.el.setProperty("display", "none");
      this.parent.removeChild(this.node);
  }
}
