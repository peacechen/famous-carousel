## Famo.us Carousel

A responsive carousel / slideshow / slider powered by Famo.us.  Supports mouse, touch/swipe and keyboard navigation.<BR>

***
__UPDATE: 0.9.x introduces ES6 and a new require() path:__

CommonJS:

        var famousCarousel = require("famous-carousel").Carousel;
        var carousel = new famousCarousel( {...} );

Global:

        var carousel = famousCarousel.default( {...} );

__If you see any unusual behavior after upgrading, delete node\_modules and run _npm install_ again__
<BR>
***

![famous-carousel preview](https://cloud.githubusercontent.com/assets/6295083/8266024/78a6db1c-16dc-11e5-9c18-93a25824a72c.gif)

After cloning the repo:

    npm install

Start the example project at port 8080:

    npm run example

### Usage

famous-carousel uses Browserify require. Refer to the _example_ folder for boilerplate setup. When using this as an npm module, reference it as such:

    var Carousel = require("famous-carousel").Carousel;
    var myCarousel = new Carousel("myDivSelector", {
                            // add options here
                            // ...
                        }
                    );

  #### _ES6_ is now supported
    import { Carousel } from "famous-carousel";

### Carousel Options
The following keys are supported in the options object. Only _carouselData_ is required, all others are optional.

* #### _selector_
Type: `String` or `Object`<BR>
Default: `body`<BR>
As a string, _selector_ is a CSS selector of the element to render into.<BR>
As an object, _selector_ is assumed to be a Famous node. The node's container should have overflow set to hidden.

* #### carouselData (required)
Type: `Array`<BR>
This specifies the content of the slides. It is an array of objects, each containing _type_, _data_, and optionally _backgroundSize_ keys.<BR>
_type_: may be `image`, `markup`, or `node`.<BR>
_data_: must be a url for image, any valid html for markup, or a Famo.us node object.<BR>
_backgroundSize_: [optional] CSS background-size attribute (default `contain`)<BR>
Example data:<BR>
```JSON
        [
            {   "type": "image",
                "data": "http://myDomain/myPicture.jpg",
                "backgroundSize": "cover"
            },
            {   "type": "markup",
                "data": "<div style='color:blue'>Hello World<BR><BR>It's me!</div>"
            },
            {   "type": "node",
                "data": myFamousNode
            }
        ]
```

* #### animStartCallback
Type: `Function` (node, index)<BR>
Callback fires when a slide starts to move into the center position. Parameters (node, index) are the slide's node and its corresponding _carouselData_ index.

* #### animDoneCallback
Type: `Function` (node, index)<BR>
Callback fires when a slide has finished settling in the center visible position. Parameters (node, index) are the visible slide's node and its corresponding _carouselData_ index.

* #### initialIndex
Type: `Integer`<BR>
Default: `0`<BR>
Initial slide number to show (zero-based). If larger than the number of slides, it will cap to the final slide.

* #### wrapAround
Type: `Boolean`<BR>
Default: `false`<BR>
By default, navigation stops at the ends of the slide set. Setting wrapAround to true allows navigation to wrap from one end to the other.

* #### autoPlay
Type: `Integer`<BR>
Default: `0`<BR>
Automatically transition slides, pausing on each slide for the number of milliseconds specified. When the user navigates manually, automatic playback stops.

* #### autoSlidesToAdvance
Type: `Integer`<BR>
Default: `1`<BR>
Number of slides to advance during automatic playback.

* #### manualSlidesToAdvance
Type: `Integer`<BR>
Default: `1`<BR>
Number of slides to advance when user navigates.

* #### dotWidth
Type: `Integer`<BR>
Default: `10`<BR>
Width of dots along bottom.

* #### dotSpacing
Type: `Integer`<BR>
Default: `5`<BR>
Spacing of dots along bottom.

* #### dotForeColor
Type: `String`<BR>
Default: `"white"`<BR>
Navigation dot foreground color (CSS style).

* #### dotBackColor
Type: `String`<BR>
Default: `"transparent"`<BR>
Navigation dot background color (CSS style).

* #### dotOpacity
Type: `Float`<BR>
Default: `1.0`<BR>
Navigation dot opacity (CSS style).

* #### dotSelectedClass
Type: `String`<BR>
CSS class to style the selected dot. This overrides the other dot* CSS options (dotWidth & dotSpacing continue to be honored).

* #### dotUnselectedClass
Type: `String`<BR>
CSS class to style unselected dots. This overrides the other dot* CSS options (dotWidth & dotSpacing continue to be honored).

* #### arrowFillColor
Type: `String`<BR>
Default: `"white"`<BR>
Navigation arrow fill color (CSS style).

* #### arrowOutlineColor
Type: `String`<BR>
Default: `"transparent"`<BR>
Navigation arrow outline color (CSS style).

* #### arrowClass
Type: `String`<BR>
CSS class to style dots. This overrides the other arrow* CSS options.


### Public methods
* #### updateData()
Updates the slide data. This calls clearSlides() to reinitialize the slides. There is an issue with the dots not re-rendering properly.

* #### clearSlides()
Removes the slides.

* #### clearAll()
Removes the carousel instance entirely. NOTE: Famo.us 0.5.2 has [a bug causing it not to remove the DOMElement](https://github.com/Famous/engine/issues/245). famous-carousel removes the div.famous-dom-renderer element for now.<BR>

### Building
To build a self-contained bundles:

    $ npm run build

Builds
 - CommonJS version (dist/famous-carousel.min.js)
 - global version (dist/global/famous-carousel.min.js), and global debug version (dist/global/famous-carousel.debug.js).  
 The global build uses the variable name _famousCarousel_.  
 To see the global version in action open browser to local port 8080/_global.html_ after:  

      $ npm run example

To build optional es5 code:

     $ npm install -g babel
     $ npm run build-es5

Run tests (linter & style checks for now):

    npm run test


### FAQ
**Q:** The arrows & dots show, but the slides are invisible.<BR>
**A:** famous-carousel sizes to its container's dimensions. Due to CSS box model rules, if no height is specified for the container, the default auto height computes to 0. Short answer: set a height for its parents all the way up to the root element.

**Q:** The slides appear from outside the containing element when animating.<BR>
**A:** Famous-carousel sets the container's overflow property to _hidden_. Check if something has overridden that property.

**Q:** How to center the slides?<BR>
**A:** Create a parent div of the container and set these properties:

    .myContainersParent {
        overflow:hidden;
        position:absolute;
        left:0; right:0;
        top:0; bottom:0;
        margin:auto;
    }

**Q:** The arrows/dots aren't visible [against a white background].<BR>
**A:** _dotBackColor_ and _arrowOutlineColor_ default to transparent. Set them to a different color.

**Q:** The slides are shifted down and to the right.<BR>
**A:** The selector element must not have any padding. The work-around for this [Famous engine bug](https://github.com/Famous/engine/issues/411) is to wrap the selector element in a container element which has the padding. Remove all padding from the selector element. See _example/index.html_ for... an example.

### To Do
Pull requests are welcome. When submitting a PR, please make sure _npm run test_ passes.
* Unit tests.
* Add exit transition.
* Add more user-configurable options such as slide transitions, nav arrow images...
* Option to auto-hide navigation arrows & dots.
* Navigate by clicking on dots.
* Auto start/stop videos in slides.
* Option for vertical scrolling.
* Support CSS class for slides?

### License
This project is based on the [Famo.us Carousel tutorial](http://famous.org/learn/Carousel/index.html) and bound by the same MIT license. Refer to the LICENSE file.
