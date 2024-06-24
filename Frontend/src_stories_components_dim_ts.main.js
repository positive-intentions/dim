"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkdim"] = self["webpackChunkdim"] || []).push([["src_stories_components_dim_ts"],{

/***/ "./src/stories/components/dim.ts":
/*!***************************************!*\
  !*** ./src/stories/components/dim.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   define: () => (/* binding */ define),\n/* harmony export */   html: () => (/* binding */ html),\n/* harmony export */   useEffect: () => (/* binding */ useEffect),\n/* harmony export */   useMemo: () => (/* binding */ useMemo),\n/* harmony export */   useState: () => (/* binding */ useState)\n/* harmony export */ });\n/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ \"./node_modules/lit/index.js\");\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }\nfunction _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }\nfunction _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \"prototype\", { writable: false }); return Constructor; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : String(i); }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\nfunction _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } else if (call !== void 0) { throw new TypeError(\"Derived constructors may only return object or undefined\"); } return _assertThisInitialized(self); }\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\nfunction _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \"prototype\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\nvar currentComponent = {};\nvar html = lit__WEBPACK_IMPORTED_MODULE_0__.html;\nfunction useState(initialState, id) {\n  var _currentComponent$pro, _currentComponent;\n  // Define a unique property name for each state variable\n  var propName = \"state-\".concat(id);\n  currentComponent[propName] = (_currentComponent$pro = (_currentComponent = currentComponent) === null || _currentComponent === void 0 ? void 0 : _currentComponent[propName]) !== null && _currentComponent$pro !== void 0 ? _currentComponent$pro : initialState;\n  var setState = function setState() {\n    var _currentComponent2, _currentComponent3, _currentComponent3$re;\n    var newState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;\n    var currentValue = (_currentComponent2 = currentComponent) === null || _currentComponent2 === void 0 ? void 0 : _currentComponent2[propName];\n    var newValue = typeof newState === 'function' ? newState(currentValue) : newState;\n    currentComponent[propName] = newValue;\n    (_currentComponent3 = currentComponent) === null || _currentComponent3 === void 0 || (_currentComponent3$re = _currentComponent3.requestUpdate) === null || _currentComponent3$re === void 0 || _currentComponent3$re.call(_currentComponent3);\n  };\n  return [function () {\n    return currentComponent[propName];\n  }, setState];\n}\nfunction useEffect(effectCallback, dependencies, id) {\n  var effectPropName = \"effect-\".concat(id);\n\n  // Initialize or update the dependencies property\n  var hasChangedDependencies = currentComponent[effectPropName] ? !dependencies.every(function (dep, i) {\n    return dep === currentComponent[effectPropName].dependencies[i];\n  }) : true;\n  if (hasChangedDependencies) {\n    // Update dependencies\n    currentComponent[effectPropName] = {\n      dependencies: dependencies,\n      cleanup: undefined // Placeholder for cleanup function\n    };\n\n    // Call the effect callback and store any cleanup function\n    var cleanup = effectCallback();\n    if (typeof cleanup === 'function') {\n      currentComponent[effectPropName].cleanup = cleanup;\n    }\n  }\n\n  // Integrate with LitElement lifecycle for cleanup\n  currentComponent.addController({\n    hostDisconnected: function hostDisconnected() {\n      var _currentComponent$eff;\n      if ((_currentComponent$eff = currentComponent[effectPropName]) !== null && _currentComponent$eff !== void 0 && _currentComponent$eff.cleanup) {\n        currentComponent[effectPropName].cleanup();\n      }\n    }\n  });\n}\nfunction useMemo(calculation, dependencies, id) {\n  var memoPropName = \"memo-\".concat(id);\n\n  // Check if the memoized value and dependencies exist\n  if (!currentComponent[memoPropName]) {\n    currentComponent[memoPropName] = {\n      dependencies: [],\n      value: undefined\n    };\n  }\n  var hasChangedDependencies = !dependencies.every(function (dep, index) {\n    return dep === currentComponent[memoPropName].dependencies[index];\n  });\n\n  // If dependencies have changed or this is the first run, recalculate the memoized value\n  if (hasChangedDependencies) {\n    currentComponent[memoPropName].value = calculation();\n    currentComponent[memoPropName].dependencies = dependencies;\n  }\n  return currentComponent[memoPropName].value;\n}\nfunction define(_ref) {\n  var tag = _ref.tag,\n    CustomFuntionalComponent = _ref.component;\n  var CustomComponent = /*#__PURE__*/function (_LitElement) {\n    _inherits(CustomComponent, _LitElement);\n    function CustomComponent() {\n      _classCallCheck(this, CustomComponent);\n      return _callSuper(this, CustomComponent, arguments);\n    }\n    _createClass(CustomComponent, [{\n      key: \"render\",\n      value: function render() {\n        var _this = this;\n        // get all attributes\n        var attributes = Array.from(this.attributes).reduce(function (acc, attr) {\n          acc[attr.name] = attr.value;\n          return acc;\n        }, {});\n        var functionalComponent = function functionalComponent() {\n          return CustomFuntionalComponent(_objectSpread(_objectSpread({}, attributes), {}, {\n            children: _this.innerHTML,\n            component: _this\n          }));\n        };\n        currentComponent = this;\n        return functionalComponent();\n      }\n    }]);\n    return CustomComponent;\n  }(lit__WEBPACK_IMPORTED_MODULE_0__.LitElement);\n  window.customElements.define(tag, CustomComponent);\n}\n\n//# sourceURL=webpack://dim/./src/stories/components/dim.ts?");

/***/ })

}]);