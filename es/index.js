var _class, _temp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import * as Events from "./Events";

if (!global._babelPolyfill) {
	require("babel-polyfill");
}

var previousTouchMove = Symbol();
var scrolling = Symbol();
var wheelScroll = Symbol();
var touchMove = Symbol();
var keyPress = Symbol();
var onWindowResize = Symbol();
var addNextComponent = Symbol();
var scrollWindowUp = Symbol();
var scrollWindowDown = Symbol();
var setRenderComponents = Symbol();
var checkRenderOnMount = Symbol();
var _isMounted = Symbol();

var _isBodyScrollEnabled = Symbol();
var disableScroll = Symbol();
var enableScroll = Symbol();

var DEFAULT_ANIMATION_TIMER = 1000;
var DEFAULT_ANIMATION = "ease-in-out";
var DEFAULT_CONTAINER_HEIGHT = "100vh";
var DEFAULT_CONTAINER_WIDTH = "100vw";
var DEFAULT_COMPONENT_INDEX = 0;
var DEFAULT_COMPONENTS_TO_RENDER_LENGTH = 0;

var ANIMATION_TIMER_BUFFER = 200;
var KEY_UP = 38;
var KEY_DOWN = 40;
var DISABLED_CLASS_NAME = "rps-scroll--disabled";

var ReactPageScroller = (_temp = _class = function (_React$Component) {
	_inherits(ReactPageScroller, _React$Component);

	function ReactPageScroller(props) {
		_classCallCheck(this, ReactPageScroller);

		var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

		_this.componentDidMount = function () {
			_this[_isMounted] = true;

			window.addEventListener(Events.RESIZE, _this[onWindowResize]);

			document.ontouchmove = function (event) {
				event.preventDefault();
			};

			_this._pageContainer.addEventListener(Events.TOUCHMOVE, _this[touchMove]);
			_this._pageContainer.addEventListener(Events.KEYDOWN, _this[keyPress]);

			_this[checkRenderOnMount]();
		};

		_this.componentWillUnmount = function () {
			_this[_isMounted] = false;

			window.removeEventListener(Events.RESIZE, _this[onWindowResize]);

			document.ontouchmove = function (e) {
				return true;
			};

			_this._pageContainer.removeEventListener(Events.TOUCHMOVE, _this[touchMove]);
			_this._pageContainer.removeEventListener(Events.KEYDOWN, _this[keyPress]);
		};

		_this.goToPage = function (number) {
			var _this$props = _this.props,
			    pageOnChange = _this$props.pageOnChange,
			    children = _this$props.children;
			var _this$state = _this.state,
			    componentIndex = _this$state.componentIndex,
			    componentsToRenderLength = _this$state.componentsToRenderLength;


			var newComponentsToRenderLength = componentsToRenderLength;

			if (!_.isEqual(componentIndex, number)) {
				if (!_.isNil(_this["container_" + number]) && !_this[scrolling]) {

					_this[scrolling] = true;
					_this._pageContainer.style.transform = "translate3d(0, " + number * -100 + "%, 0)";

					if (pageOnChange) {
						pageOnChange(number + 1);
					}

					if (_.isNil(_this["container_" + (number + 1)]) && !_.isNil(children[number + 1])) {
						newComponentsToRenderLength++;
					}

					setTimeout(function () {
						_this.setState({ componentIndex: number, componentsToRenderLength: newComponentsToRenderLength }, function () {
							_this[scrolling] = false;
							_this[previousTouchMove] = null;
						});
					}, _this.props.animationTimer + ANIMATION_TIMER_BUFFER);
				} else if (!_this[scrolling] && !_.isNil(children[number])) {
					for (var i = componentsToRenderLength; i <= number; i++) {
						newComponentsToRenderLength++;
					}

					if (!_.isNil(children[number + 1])) {
						newComponentsToRenderLength++;
					}

					_this[scrolling] = true;
					_this.setState({
						componentsToRenderLength: newComponentsToRenderLength
					}, function () {
						_this._pageContainer.style.transform = "translate3d(0, " + number * -100 + "%, 0)";

						if (pageOnChange) {
							pageOnChange(number + 1);
						}

						setTimeout(function () {
							_this.setState({ componentIndex: number }, function () {
								_this[scrolling] = false;
								_this[previousTouchMove] = null;
							});
						}, _this.props.animationTimer + ANIMATION_TIMER_BUFFER);
					});
				}
			}
		};

		_this[disableScroll] = function () {
			if (_this[_isBodyScrollEnabled]) {
				_this[_isBodyScrollEnabled] = false;
				window.scrollTo({
					left: 0,
					top: 0,
					behavior: "smooth"
				});
				document.body.classList.add(DISABLED_CLASS_NAME);
				document.documentElement.classList.add(DISABLED_CLASS_NAME);
			}
		};

		_this[enableScroll] = function () {
			if (!_this[_isBodyScrollEnabled]) {
				_this[_isBodyScrollEnabled] = true;
				document.body.classList.remove(DISABLED_CLASS_NAME);
				document.documentElement.classList.remove(DISABLED_CLASS_NAME);
			}
		};

		_this[wheelScroll] = function (event) {
			if (event.deltaY < -1 * _this.props.delta) {
				_this[scrollWindowUp]();
			} else if (event.deltaY > _this.props.delta) {
				_this[scrollWindowDown]();
			}
		};

		_this[touchMove] = function (event) {
			if (!_.isNull(_this[previousTouchMove])) {
				if (event.touches[0].clientY > _this[previousTouchMove] - _this.props.delta) {
					_this[scrollWindowUp]();
				} else if (event.touches[0].clientY < _this[previousTouchMove] + _this.props.delta) {
					_this[scrollWindowDown]();
				}
			} else {
				_this[previousTouchMove] = event.touches[0].clientY;
			}
		};

		_this[keyPress] = function (event) {
			if (_.isEqual(event.keyCode, KEY_UP)) {
				_this[scrollWindowUp]();
			}
			if (_.isEqual(event.keyCode, KEY_DOWN)) {
				_this[scrollWindowDown]();
			}
		};

		_this[onWindowResize] = function () {
			_this.forceUpdate();
		};

		_this[addNextComponent] = function (componentsToRenderOnMountLength) {
			var componentsToRenderLength = 0;

			if (!_.isNil(componentsToRenderOnMountLength)) {
				componentsToRenderLength = componentsToRenderOnMountLength;
			}

			componentsToRenderLength = Math.max(componentsToRenderLength, _this.state.componentsToRenderLength);

			if (componentsToRenderLength <= _this.state.componentIndex + 1) {
				if (!_.isNil(_this.props.children[_this.state.componentIndex + 1])) {
					componentsToRenderLength++;
				}
			}

			_this.setState({
				componentsToRenderLength: componentsToRenderLength
			});
		};

		_this[setRenderComponents] = function () {
			var newComponentsToRender = [];

			var _loop = function _loop(i) {
				if (!_.isNil(_this.props.children[i])) {
					newComponentsToRender.push(React.createElement(
						"div",
						{ key: i, ref: function ref(c) {
								return _this["container_" + i] = c;
							},
							style: { height: "100%", width: "100%" } },
						_this.props.children[i]
					));
				} else {
					return "break";
				}
			};

			for (var i = 0; i < _this.state.componentsToRenderLength; i++) {
				var _ret = _loop(i);

				if (_ret === "break") break;
			}

			return newComponentsToRender;
		};

		_this[scrollWindowUp] = function () {
			if (!_this[scrolling] && !_this.props.blockScrollUp) {
				if (!_.isNil(_this["container_" + (_this.state.componentIndex - 1)])) {
					_this[disableScroll]();
					_this[scrolling] = true;
					_this._pageContainer.style.transform = "translate3d(0, " + (_this.state.componentIndex - 1) * -100 + "%, 0)";

					if (_this.props.pageOnChange) {
						_this.props.pageOnChange(_this.state.componentIndex);
					}

					setTimeout(function () {
						_this[_isMounted] && _this.setState(function (prevState) {
							return { componentIndex: prevState.componentIndex - 1 };
						}, function () {
							_this[scrolling] = false;
							_this[previousTouchMove] = null;
						});
					}, _this.props.animationTimer + ANIMATION_TIMER_BUFFER);
				} else {
					_this[enableScroll]();
					if (_this.props.handleScrollUnavailable) {
						_this.props.handleScrollUnavailable();
					}
				}
			}
		};

		_this[scrollWindowDown] = function () {
			if (!_this[scrolling] && !_this.props.blockScrollDown) {
				if (!_.isNil(_this["container_" + (_this.state.componentIndex + 1)])) {
					_this[disableScroll]();
					_this[scrolling] = true;
					_this._pageContainer.style.transform = "translate3d(0, " + (_this.state.componentIndex + 1) * -100 + "%, 0)";

					if (_this.props.pageOnChange) {
						_this.props.pageOnChange(_this.state.componentIndex + 2);
					}

					setTimeout(function () {
						_this[_isMounted] && _this.setState(function (prevState) {
							return { componentIndex: prevState.componentIndex + 1 };
						}, function () {
							_this[scrolling] = false;
							_this[previousTouchMove] = null;
							_this[addNextComponent]();
						});
					}, _this.props.animationTimer + ANIMATION_TIMER_BUFFER);
				} else {
					_this[enableScroll]();
					if (_this.props.handleScrollUnavailable) {
						_this.props.handleScrollUnavailable();
					}
				}
			}
		};

		_this.state = { componentIndex: DEFAULT_COMPONENT_INDEX, componentsToRenderLength: DEFAULT_COMPONENTS_TO_RENDER_LENGTH };
		_this[previousTouchMove] = null;
		_this[scrolling] = false;
		_this[_isMounted] = false;
		_this[_isBodyScrollEnabled] = true;
		return _this;
	}

	ReactPageScroller.prototype.render = function render() {
		var _this2 = this;

		var _props = this.props,
		    animationTimer = _props.animationTimer,
		    transitionTimingFunction = _props.transitionTimingFunction,
		    containerHeight = _props.containerHeight,
		    containerWidth = _props.containerWidth;


		return React.createElement(
			"div",
			{ style: { height: containerHeight, width: containerWidth, overflow: "hidden" } },
			React.createElement(
				"div",
				{ ref: function ref(c) {
						return _this2._pageContainer = c;
					},
					onWheel: this[wheelScroll],
					style: {
						height: "100%",
						width: "100%",
						transition: "transform " + animationTimer + "ms " + transitionTimingFunction
					},
					tabIndex: 0 },
				this[setRenderComponents]()
			)
		);
	};

	ReactPageScroller.prototype[checkRenderOnMount] = function () {
		if (!_.isNil(this.props.children[DEFAULT_COMPONENT_INDEX])) {
			this[addNextComponent](DEFAULT_COMPONENTS_TO_RENDER_LENGTH + 1);
		}
	};

	return ReactPageScroller;
}(React.Component), _class.defaultProps = {
	animationTimer: DEFAULT_ANIMATION_TIMER,
	transitionTimingFunction: DEFAULT_ANIMATION,
	containerHeight: DEFAULT_CONTAINER_HEIGHT,
	containerWidth: DEFAULT_CONTAINER_WIDTH,
	blockScrollUp: false,
	blockScrollDown: false,
	delta: 0
}, _temp);
export { ReactPageScroller as default };
ReactPageScroller.propTypes = process.env.NODE_ENV !== "production" ? {
	animationTimer: PropTypes.number,
	transitionTimingFunction: PropTypes.string,
	pageOnChange: PropTypes.func,
	handleScrollUnavailable: PropTypes.func,
	containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	blockScrollUp: PropTypes.bool,
	blockScrollDown: PropTypes.bool,
	delta: PropTypes.number
} : {};