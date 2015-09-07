/**
 * Instantiation of famous-carousel using CommonJS-style Browserify
 */

// App Code
//when using this as a node_module, use require("famous-carousel").Carousel
var famousCarousel = require("../src/Carousel").Carousel;
var DOMElement = require("famous/dom-renderables/DOMElement");
var Transitionable = require("famous/transitions/Transitionable");
var Size = require("famous/components/Size");
var imageData = require("./data/data");

var carousel = new famousCarousel({
        selector: ".slideshow",
        carouselData: imageData,
        wrapAround: true,
        autoPlay: 5000,
        // autoSlidesToAdvance: 2,
        // manualSlidesToAdvance: 3,
        // initialIndex: 2,
        // dotForeColor: "red",
        dotBackColor: "DarkBlue",
        // dotOpacity: 0.7,
        // arrowFillColor: "yellow",
        arrowOutlineColor: "CornflowerBlue",
        animStartCallback: animStartCallback,
        animDoneCallback: animDoneCallback
    });


//----------------------------------------------------------------------------
// Code below does additional animation after each slide is done transitioning
// to the center.
var postAnimNodes = []; //array of objects

// Post-sliding fade-in for first couple slides.
function animDoneCallback(node, index) {
    if(index > 1)
        return;

    var addedNode;
    if(!postAnimNodes[index]) {
        // Create node and save for future reference.
        addedNode = node.addChild();
        postAnimNodes[index] = { node: addedNode };
        switch(index) {
            case 0:
                addCenteredText(addedNode, "Welcome to Famous Carousel<BR>Autoplay is on until user input");
                postAnimNodes[index].fadeDuration = 250;
                break;
            case 1:
                addBackground(addedNode, "https://www.gstatic.com/cast/images/home/background2.jpg");
                postAnimNodes[index].fadeDuration = 1500;
                break;
        }
    }

    fadeInTransition(postAnimNodes[index]);
}

function animStartCallback(node, index) {
    // Hide all other background nodes
    for (var i=0; i<postAnimNodes.length; i++) {
        if (i !== index && postAnimNodes[i]) {
            postAnimNodes[i].transitionable.halt();
            postAnimNodes[i].node.setOpacity(0);
        }
    }
}

function addBackground(node, url) {
    var el = new DOMElement(node);
    el.setProperty("backgroundImage", "url(" + url + ")");
    el.setProperty("background-repeat", "no-repeat");
    el.setProperty("background-size", "contain");
    el.setProperty("background-position", "center");
    node.setPosition(0, 0, -2); // -2 due to Chrome bug https://code.google.com/p/chromium/issues/detail?id=499397
}

function addCenteredText(node, text) {
     var el = new DOMElement(node, {
        content: "<span class='center-element'>" + text + "</span>"
    });
    el.setProperty("color", "black");
    el.setProperty("textShadow", "-3px 0 4px white,0 3px 4px white,3px 0 4px white,0 -3px 4px white");
    el.setProperty("fontFamily", "sans-serif");
    el.setProperty("fontSize", "20px");
    el.setProperty("fontSize", "2.5vw");
}

// Fade in background
function fadeInTransition(animObject) {
    animObject.node.setOpacity(0);
    animObject.transitionable = new Transitionable(0);
    animObject.transitionable.set(1, { duration: animObject.fadeDuration });
    var id = animObject.node.addComponent({
        onUpdate: function(time) {
            if (animObject.transitionable.isActive()) {
                var newOpacity = animObject.transitionable.get();
                animObject.node.setOpacity(newOpacity);
                animObject.node.requestUpdate(id);
            }
        }
    });
    animObject.node.requestUpdate(id);
}
