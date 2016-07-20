"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.set = set;
exports.animate = animate;

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

var Box = _physics2.default.Box; /**
                                  * Physics transitions for Pager
                                  */

var Spring = _physics2.default.Spring;
var Vec3 = _math2.default.Vec3;
var hideAngle = Math.PI / 2;

function get(slide) {
  // ToDo
}

function set(slide, params) {}

function animate(slide, startParams, endParams) {//options
}

