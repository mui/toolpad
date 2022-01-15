(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __reExport = (target, module, copyDefault, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toESM = (module, isNodeMode) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // ../../node_modules/object-assign/index.js
  var require_object_assign = __commonJS({
    "../../node_modules/object-assign/index.js"(exports, module) {
      "use strict";
      var getOwnPropertySymbols = Object.getOwnPropertySymbols;
      var hasOwnProperty2 = Object.prototype.hasOwnProperty;
      var propIsEnumerable = Object.prototype.propertyIsEnumerable;
      function toObject(val) {
        if (val === null || val === void 0) {
          throw new TypeError("Object.assign cannot be called with null or undefined");
        }
        return Object(val);
      }
      function shouldUseNative() {
        try {
          if (!Object.assign) {
            return false;
          }
          var test1 = new String("abc");
          test1[5] = "de";
          if (Object.getOwnPropertyNames(test1)[0] === "5") {
            return false;
          }
          var test2 = {};
          for (var i = 0; i < 10; i++) {
            test2["_" + String.fromCharCode(i)] = i;
          }
          var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
            return test2[n];
          });
          if (order2.join("") !== "0123456789") {
            return false;
          }
          var test3 = {};
          "abcdefghijklmnopqrst".split("").forEach(function(letter) {
            test3[letter] = letter;
          });
          if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
            return false;
          }
          return true;
        } catch (err) {
          return false;
        }
      }
      module.exports = shouldUseNative() ? Object.assign : function(target, source) {
        var from;
        var to = toObject(target);
        var symbols;
        for (var s = 1; s < arguments.length; s++) {
          from = Object(arguments[s]);
          for (var key in from) {
            if (hasOwnProperty2.call(from, key)) {
              to[key] = from[key];
            }
          }
          if (getOwnPropertySymbols) {
            symbols = getOwnPropertySymbols(from);
            for (var i = 0; i < symbols.length; i++) {
              if (propIsEnumerable.call(from, symbols[i])) {
                to[symbols[i]] = from[symbols[i]];
              }
            }
          }
        }
        return to;
      };
    }
  });

  // ../../node_modules/react/cjs/react.development.js
  var require_react_development = __commonJS({
    "../../node_modules/react/cjs/react.development.js"(exports) {
      "use strict";
      if (true) {
        (function() {
          "use strict";
          var _assign = require_object_assign();
          var ReactVersion = "17.0.2";
          var REACT_ELEMENT_TYPE = 60103;
          var REACT_PORTAL_TYPE = 60106;
          exports.Fragment = 60107;
          exports.StrictMode = 60108;
          exports.Profiler = 60114;
          var REACT_PROVIDER_TYPE = 60109;
          var REACT_CONTEXT_TYPE = 60110;
          var REACT_FORWARD_REF_TYPE = 60112;
          exports.Suspense = 60113;
          var REACT_SUSPENSE_LIST_TYPE = 60120;
          var REACT_MEMO_TYPE = 60115;
          var REACT_LAZY_TYPE = 60116;
          var REACT_BLOCK_TYPE = 60121;
          var REACT_SERVER_BLOCK_TYPE = 60122;
          var REACT_FUNDAMENTAL_TYPE = 60117;
          var REACT_SCOPE_TYPE = 60119;
          var REACT_OPAQUE_ID_TYPE = 60128;
          var REACT_DEBUG_TRACING_MODE_TYPE = 60129;
          var REACT_OFFSCREEN_TYPE = 60130;
          var REACT_LEGACY_HIDDEN_TYPE = 60131;
          if (typeof Symbol === "function" && Symbol.for) {
            var symbolFor = Symbol.for;
            REACT_ELEMENT_TYPE = symbolFor("react.element");
            REACT_PORTAL_TYPE = symbolFor("react.portal");
            exports.Fragment = symbolFor("react.fragment");
            exports.StrictMode = symbolFor("react.strict_mode");
            exports.Profiler = symbolFor("react.profiler");
            REACT_PROVIDER_TYPE = symbolFor("react.provider");
            REACT_CONTEXT_TYPE = symbolFor("react.context");
            REACT_FORWARD_REF_TYPE = symbolFor("react.forward_ref");
            exports.Suspense = symbolFor("react.suspense");
            REACT_SUSPENSE_LIST_TYPE = symbolFor("react.suspense_list");
            REACT_MEMO_TYPE = symbolFor("react.memo");
            REACT_LAZY_TYPE = symbolFor("react.lazy");
            REACT_BLOCK_TYPE = symbolFor("react.block");
            REACT_SERVER_BLOCK_TYPE = symbolFor("react.server.block");
            REACT_FUNDAMENTAL_TYPE = symbolFor("react.fundamental");
            REACT_SCOPE_TYPE = symbolFor("react.scope");
            REACT_OPAQUE_ID_TYPE = symbolFor("react.opaque.id");
            REACT_DEBUG_TRACING_MODE_TYPE = symbolFor("react.debug_trace_mode");
            REACT_OFFSCREEN_TYPE = symbolFor("react.offscreen");
            REACT_LEGACY_HIDDEN_TYPE = symbolFor("react.legacy_hidden");
          }
          var MAYBE_ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
          var FAUX_ITERATOR_SYMBOL = "@@iterator";
          function getIteratorFn(maybeIterable) {
            if (maybeIterable === null || typeof maybeIterable !== "object") {
              return null;
            }
            var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
            if (typeof maybeIterator === "function") {
              return maybeIterator;
            }
            return null;
          }
          var ReactCurrentDispatcher = {
            current: null
          };
          var ReactCurrentBatchConfig = {
            transition: 0
          };
          var ReactCurrentOwner = {
            current: null
          };
          var ReactDebugCurrentFrame = {};
          var currentExtraStackFrame = null;
          function setExtraStackFrame(stack) {
            {
              currentExtraStackFrame = stack;
            }
          }
          {
            ReactDebugCurrentFrame.setExtraStackFrame = function(stack) {
              {
                currentExtraStackFrame = stack;
              }
            };
            ReactDebugCurrentFrame.getCurrentStack = null;
            ReactDebugCurrentFrame.getStackAddendum = function() {
              var stack = "";
              if (currentExtraStackFrame) {
                stack += currentExtraStackFrame;
              }
              var impl = ReactDebugCurrentFrame.getCurrentStack;
              if (impl) {
                stack += impl() || "";
              }
              return stack;
            };
          }
          var IsSomeRendererActing = {
            current: false
          };
          var ReactSharedInternals = {
            ReactCurrentDispatcher,
            ReactCurrentBatchConfig,
            ReactCurrentOwner,
            IsSomeRendererActing,
            assign: _assign
          };
          {
            ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
          }
          function warn(format) {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
          function error(format) {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
          function printWarning(level, format, args) {
            {
              var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
              var stack = ReactDebugCurrentFrame2.getStackAddendum();
              if (stack !== "") {
                format += "%s";
                args = args.concat([stack]);
              }
              var argsWithFormat = args.map(function(item) {
                return "" + item;
              });
              argsWithFormat.unshift("Warning: " + format);
              Function.prototype.apply.call(console[level], console, argsWithFormat);
            }
          }
          var didWarnStateUpdateForUnmountedComponent = {};
          function warnNoop(publicInstance, callerName) {
            {
              var _constructor = publicInstance.constructor;
              var componentName = _constructor && (_constructor.displayName || _constructor.name) || "ReactClass";
              var warningKey = componentName + "." + callerName;
              if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
                return;
              }
              error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, componentName);
              didWarnStateUpdateForUnmountedComponent[warningKey] = true;
            }
          }
          var ReactNoopUpdateQueue = {
            isMounted: function(publicInstance) {
              return false;
            },
            enqueueForceUpdate: function(publicInstance, callback, callerName) {
              warnNoop(publicInstance, "forceUpdate");
            },
            enqueueReplaceState: function(publicInstance, completeState, callback, callerName) {
              warnNoop(publicInstance, "replaceState");
            },
            enqueueSetState: function(publicInstance, partialState, callback, callerName) {
              warnNoop(publicInstance, "setState");
            }
          };
          var emptyObject = {};
          {
            Object.freeze(emptyObject);
          }
          function Component(props, context, updater) {
            this.props = props;
            this.context = context;
            this.refs = emptyObject;
            this.updater = updater || ReactNoopUpdateQueue;
          }
          Component.prototype.isReactComponent = {};
          Component.prototype.setState = function(partialState, callback) {
            if (!(typeof partialState === "object" || typeof partialState === "function" || partialState == null)) {
              {
                throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
              }
            }
            this.updater.enqueueSetState(this, partialState, callback, "setState");
          };
          Component.prototype.forceUpdate = function(callback) {
            this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
          };
          {
            var deprecatedAPIs = {
              isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
              replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
            };
            var defineDeprecationWarning = function(methodName, info) {
              Object.defineProperty(Component.prototype, methodName, {
                get: function() {
                  warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
                  return void 0;
                }
              });
            };
            for (var fnName in deprecatedAPIs) {
              if (deprecatedAPIs.hasOwnProperty(fnName)) {
                defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
              }
            }
          }
          function ComponentDummy() {
          }
          ComponentDummy.prototype = Component.prototype;
          function PureComponent(props, context, updater) {
            this.props = props;
            this.context = context;
            this.refs = emptyObject;
            this.updater = updater || ReactNoopUpdateQueue;
          }
          var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
          pureComponentPrototype.constructor = PureComponent;
          _assign(pureComponentPrototype, Component.prototype);
          pureComponentPrototype.isPureReactComponent = true;
          function createRef() {
            var refObject = {
              current: null
            };
            {
              Object.seal(refObject);
            }
            return refObject;
          }
          function getWrappedName(outerType, innerType, wrapperName) {
            var functionName = innerType.displayName || innerType.name || "";
            return outerType.displayName || (functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName);
          }
          function getContextName(type) {
            return type.displayName || "Context";
          }
          function getComponentName(type) {
            if (type == null) {
              return null;
            }
            {
              if (typeof type.tag === "number") {
                error("Received an unexpected object in getComponentName(). This is likely a bug in React. Please file an issue.");
              }
            }
            if (typeof type === "function") {
              return type.displayName || type.name || null;
            }
            if (typeof type === "string") {
              return type;
            }
            switch (type) {
              case exports.Fragment:
                return "Fragment";
              case REACT_PORTAL_TYPE:
                return "Portal";
              case exports.Profiler:
                return "Profiler";
              case exports.StrictMode:
                return "StrictMode";
              case exports.Suspense:
                return "Suspense";
              case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            }
            if (typeof type === "object") {
              switch (type.$$typeof) {
                case REACT_CONTEXT_TYPE:
                  var context = type;
                  return getContextName(context) + ".Consumer";
                case REACT_PROVIDER_TYPE:
                  var provider = type;
                  return getContextName(provider._context) + ".Provider";
                case REACT_FORWARD_REF_TYPE:
                  return getWrappedName(type, type.render, "ForwardRef");
                case REACT_MEMO_TYPE:
                  return getComponentName(type.type);
                case REACT_BLOCK_TYPE:
                  return getComponentName(type._render);
                case REACT_LAZY_TYPE: {
                  var lazyComponent = type;
                  var payload = lazyComponent._payload;
                  var init = lazyComponent._init;
                  try {
                    return getComponentName(init(payload));
                  } catch (x) {
                    return null;
                  }
                }
              }
            }
            return null;
          }
          var hasOwnProperty2 = Object.prototype.hasOwnProperty;
          var RESERVED_PROPS = {
            key: true,
            ref: true,
            __self: true,
            __source: true
          };
          var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
          {
            didWarnAboutStringRefs = {};
          }
          function hasValidRef(config) {
            {
              if (hasOwnProperty2.call(config, "ref")) {
                var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
                if (getter && getter.isReactWarning) {
                  return false;
                }
              }
            }
            return config.ref !== void 0;
          }
          function hasValidKey(config) {
            {
              if (hasOwnProperty2.call(config, "key")) {
                var getter = Object.getOwnPropertyDescriptor(config, "key").get;
                if (getter && getter.isReactWarning) {
                  return false;
                }
              }
            }
            return config.key !== void 0;
          }
          function defineKeyPropWarningGetter(props, displayName) {
            var warnAboutAccessingKey = function() {
              {
                if (!specialPropKeyWarningShown) {
                  specialPropKeyWarningShown = true;
                  error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
                }
              }
            };
            warnAboutAccessingKey.isReactWarning = true;
            Object.defineProperty(props, "key", {
              get: warnAboutAccessingKey,
              configurable: true
            });
          }
          function defineRefPropWarningGetter(props, displayName) {
            var warnAboutAccessingRef = function() {
              {
                if (!specialPropRefWarningShown) {
                  specialPropRefWarningShown = true;
                  error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
                }
              }
            };
            warnAboutAccessingRef.isReactWarning = true;
            Object.defineProperty(props, "ref", {
              get: warnAboutAccessingRef,
              configurable: true
            });
          }
          function warnIfStringRefCannotBeAutoConverted(config) {
            {
              if (typeof config.ref === "string" && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
                var componentName = getComponentName(ReactCurrentOwner.current.type);
                if (!didWarnAboutStringRefs[componentName]) {
                  error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);
                  didWarnAboutStringRefs[componentName] = true;
                }
              }
            }
          }
          var ReactElement = function(type, key, ref, self2, source, owner, props) {
            var element = {
              $$typeof: REACT_ELEMENT_TYPE,
              type,
              key,
              ref,
              props,
              _owner: owner
            };
            {
              element._store = {};
              Object.defineProperty(element._store, "validated", {
                configurable: false,
                enumerable: false,
                writable: true,
                value: false
              });
              Object.defineProperty(element, "_self", {
                configurable: false,
                enumerable: false,
                writable: false,
                value: self2
              });
              Object.defineProperty(element, "_source", {
                configurable: false,
                enumerable: false,
                writable: false,
                value: source
              });
              if (Object.freeze) {
                Object.freeze(element.props);
                Object.freeze(element);
              }
            }
            return element;
          };
          function createElement(type, config, children) {
            var propName;
            var props = {};
            var key = null;
            var ref = null;
            var self2 = null;
            var source = null;
            if (config != null) {
              if (hasValidRef(config)) {
                ref = config.ref;
                {
                  warnIfStringRefCannotBeAutoConverted(config);
                }
              }
              if (hasValidKey(config)) {
                key = "" + config.key;
              }
              self2 = config.__self === void 0 ? null : config.__self;
              source = config.__source === void 0 ? null : config.__source;
              for (propName in config) {
                if (hasOwnProperty2.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                  props[propName] = config[propName];
                }
              }
            }
            var childrenLength = arguments.length - 2;
            if (childrenLength === 1) {
              props.children = children;
            } else if (childrenLength > 1) {
              var childArray = Array(childrenLength);
              for (var i = 0; i < childrenLength; i++) {
                childArray[i] = arguments[i + 2];
              }
              {
                if (Object.freeze) {
                  Object.freeze(childArray);
                }
              }
              props.children = childArray;
            }
            if (type && type.defaultProps) {
              var defaultProps = type.defaultProps;
              for (propName in defaultProps) {
                if (props[propName] === void 0) {
                  props[propName] = defaultProps[propName];
                }
              }
            }
            {
              if (key || ref) {
                var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
                if (key) {
                  defineKeyPropWarningGetter(props, displayName);
                }
                if (ref) {
                  defineRefPropWarningGetter(props, displayName);
                }
              }
            }
            return ReactElement(type, key, ref, self2, source, ReactCurrentOwner.current, props);
          }
          function cloneAndReplaceKey(oldElement, newKey) {
            var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
            return newElement;
          }
          function cloneElement(element, config, children) {
            if (!!(element === null || element === void 0)) {
              {
                throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
              }
            }
            var propName;
            var props = _assign({}, element.props);
            var key = element.key;
            var ref = element.ref;
            var self2 = element._self;
            var source = element._source;
            var owner = element._owner;
            if (config != null) {
              if (hasValidRef(config)) {
                ref = config.ref;
                owner = ReactCurrentOwner.current;
              }
              if (hasValidKey(config)) {
                key = "" + config.key;
              }
              var defaultProps;
              if (element.type && element.type.defaultProps) {
                defaultProps = element.type.defaultProps;
              }
              for (propName in config) {
                if (hasOwnProperty2.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                  if (config[propName] === void 0 && defaultProps !== void 0) {
                    props[propName] = defaultProps[propName];
                  } else {
                    props[propName] = config[propName];
                  }
                }
              }
            }
            var childrenLength = arguments.length - 2;
            if (childrenLength === 1) {
              props.children = children;
            } else if (childrenLength > 1) {
              var childArray = Array(childrenLength);
              for (var i = 0; i < childrenLength; i++) {
                childArray[i] = arguments[i + 2];
              }
              props.children = childArray;
            }
            return ReactElement(element.type, key, ref, self2, source, owner, props);
          }
          function isValidElement(object) {
            return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
          }
          var SEPARATOR = ".";
          var SUBSEPARATOR = ":";
          function escape(key) {
            var escapeRegex = /[=:]/g;
            var escaperLookup = {
              "=": "=0",
              ":": "=2"
            };
            var escapedString = key.replace(escapeRegex, function(match) {
              return escaperLookup[match];
            });
            return "$" + escapedString;
          }
          var didWarnAboutMaps = false;
          var userProvidedKeyEscapeRegex = /\/+/g;
          function escapeUserProvidedKey(text) {
            return text.replace(userProvidedKeyEscapeRegex, "$&/");
          }
          function getElementKey(element, index) {
            if (typeof element === "object" && element !== null && element.key != null) {
              return escape("" + element.key);
            }
            return index.toString(36);
          }
          function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
            var type = typeof children;
            if (type === "undefined" || type === "boolean") {
              children = null;
            }
            var invokeCallback = false;
            if (children === null) {
              invokeCallback = true;
            } else {
              switch (type) {
                case "string":
                case "number":
                  invokeCallback = true;
                  break;
                case "object":
                  switch (children.$$typeof) {
                    case REACT_ELEMENT_TYPE:
                    case REACT_PORTAL_TYPE:
                      invokeCallback = true;
                  }
              }
            }
            if (invokeCallback) {
              var _child = children;
              var mappedChild = callback(_child);
              var childKey = nameSoFar === "" ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
              if (Array.isArray(mappedChild)) {
                var escapedChildKey = "";
                if (childKey != null) {
                  escapedChildKey = escapeUserProvidedKey(childKey) + "/";
                }
                mapIntoArray(mappedChild, array, escapedChildKey, "", function(c) {
                  return c;
                });
              } else if (mappedChild != null) {
                if (isValidElement(mappedChild)) {
                  mappedChild = cloneAndReplaceKey(mappedChild, escapedPrefix + (mappedChild.key && (!_child || _child.key !== mappedChild.key) ? escapeUserProvidedKey("" + mappedChild.key) + "/" : "") + childKey);
                }
                array.push(mappedChild);
              }
              return 1;
            }
            var child;
            var nextName;
            var subtreeCount = 0;
            var nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;
            if (Array.isArray(children)) {
              for (var i = 0; i < children.length; i++) {
                child = children[i];
                nextName = nextNamePrefix + getElementKey(child, i);
                subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
              }
            } else {
              var iteratorFn = getIteratorFn(children);
              if (typeof iteratorFn === "function") {
                var iterableChildren = children;
                {
                  if (iteratorFn === iterableChildren.entries) {
                    if (!didWarnAboutMaps) {
                      warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                    }
                    didWarnAboutMaps = true;
                  }
                }
                var iterator = iteratorFn.call(iterableChildren);
                var step;
                var ii = 0;
                while (!(step = iterator.next()).done) {
                  child = step.value;
                  nextName = nextNamePrefix + getElementKey(child, ii++);
                  subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
                }
              } else if (type === "object") {
                var childrenString = "" + children;
                {
                  {
                    throw Error("Objects are not valid as a React child (found: " + (childrenString === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString) + "). If you meant to render a collection of children, use an array instead.");
                  }
                }
              }
            }
            return subtreeCount;
          }
          function mapChildren(children, func, context) {
            if (children == null) {
              return children;
            }
            var result = [];
            var count = 0;
            mapIntoArray(children, result, "", "", function(child) {
              return func.call(context, child, count++);
            });
            return result;
          }
          function countChildren(children) {
            var n = 0;
            mapChildren(children, function() {
              n++;
            });
            return n;
          }
          function forEachChildren(children, forEachFunc, forEachContext) {
            mapChildren(children, function() {
              forEachFunc.apply(this, arguments);
            }, forEachContext);
          }
          function toArray(children) {
            return mapChildren(children, function(child) {
              return child;
            }) || [];
          }
          function onlyChild(children) {
            if (!isValidElement(children)) {
              {
                throw Error("React.Children.only expected to receive a single React element child.");
              }
            }
            return children;
          }
          function createContext(defaultValue, calculateChangedBits) {
            if (calculateChangedBits === void 0) {
              calculateChangedBits = null;
            } else {
              {
                if (calculateChangedBits !== null && typeof calculateChangedBits !== "function") {
                  error("createContext: Expected the optional second argument to be a function. Instead received: %s", calculateChangedBits);
                }
              }
            }
            var context = {
              $$typeof: REACT_CONTEXT_TYPE,
              _calculateChangedBits: calculateChangedBits,
              _currentValue: defaultValue,
              _currentValue2: defaultValue,
              _threadCount: 0,
              Provider: null,
              Consumer: null
            };
            context.Provider = {
              $$typeof: REACT_PROVIDER_TYPE,
              _context: context
            };
            var hasWarnedAboutUsingNestedContextConsumers = false;
            var hasWarnedAboutUsingConsumerProvider = false;
            var hasWarnedAboutDisplayNameOnConsumer = false;
            {
              var Consumer = {
                $$typeof: REACT_CONTEXT_TYPE,
                _context: context,
                _calculateChangedBits: context._calculateChangedBits
              };
              Object.defineProperties(Consumer, {
                Provider: {
                  get: function() {
                    if (!hasWarnedAboutUsingConsumerProvider) {
                      hasWarnedAboutUsingConsumerProvider = true;
                      error("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?");
                    }
                    return context.Provider;
                  },
                  set: function(_Provider) {
                    context.Provider = _Provider;
                  }
                },
                _currentValue: {
                  get: function() {
                    return context._currentValue;
                  },
                  set: function(_currentValue) {
                    context._currentValue = _currentValue;
                  }
                },
                _currentValue2: {
                  get: function() {
                    return context._currentValue2;
                  },
                  set: function(_currentValue2) {
                    context._currentValue2 = _currentValue2;
                  }
                },
                _threadCount: {
                  get: function() {
                    return context._threadCount;
                  },
                  set: function(_threadCount) {
                    context._threadCount = _threadCount;
                  }
                },
                Consumer: {
                  get: function() {
                    if (!hasWarnedAboutUsingNestedContextConsumers) {
                      hasWarnedAboutUsingNestedContextConsumers = true;
                      error("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                    }
                    return context.Consumer;
                  }
                },
                displayName: {
                  get: function() {
                    return context.displayName;
                  },
                  set: function(displayName) {
                    if (!hasWarnedAboutDisplayNameOnConsumer) {
                      warn("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", displayName);
                      hasWarnedAboutDisplayNameOnConsumer = true;
                    }
                  }
                }
              });
              context.Consumer = Consumer;
            }
            {
              context._currentRenderer = null;
              context._currentRenderer2 = null;
            }
            return context;
          }
          var Uninitialized = -1;
          var Pending = 0;
          var Resolved = 1;
          var Rejected = 2;
          function lazyInitializer(payload) {
            if (payload._status === Uninitialized) {
              var ctor = payload._result;
              var thenable = ctor();
              var pending = payload;
              pending._status = Pending;
              pending._result = thenable;
              thenable.then(function(moduleObject) {
                if (payload._status === Pending) {
                  var defaultExport = moduleObject.default;
                  {
                    if (defaultExport === void 0) {
                      error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
                    }
                  }
                  var resolved = payload;
                  resolved._status = Resolved;
                  resolved._result = defaultExport;
                }
              }, function(error2) {
                if (payload._status === Pending) {
                  var rejected = payload;
                  rejected._status = Rejected;
                  rejected._result = error2;
                }
              });
            }
            if (payload._status === Resolved) {
              return payload._result;
            } else {
              throw payload._result;
            }
          }
          function lazy(ctor) {
            var payload = {
              _status: -1,
              _result: ctor
            };
            var lazyType = {
              $$typeof: REACT_LAZY_TYPE,
              _payload: payload,
              _init: lazyInitializer
            };
            {
              var defaultProps;
              var propTypes;
              Object.defineProperties(lazyType, {
                defaultProps: {
                  configurable: true,
                  get: function() {
                    return defaultProps;
                  },
                  set: function(newDefaultProps) {
                    error("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                    defaultProps = newDefaultProps;
                    Object.defineProperty(lazyType, "defaultProps", {
                      enumerable: true
                    });
                  }
                },
                propTypes: {
                  configurable: true,
                  get: function() {
                    return propTypes;
                  },
                  set: function(newPropTypes) {
                    error("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                    propTypes = newPropTypes;
                    Object.defineProperty(lazyType, "propTypes", {
                      enumerable: true
                    });
                  }
                }
              });
            }
            return lazyType;
          }
          function forwardRef(render) {
            {
              if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
                error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).");
              } else if (typeof render !== "function") {
                error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render);
              } else {
                if (render.length !== 0 && render.length !== 2) {
                  error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
                }
              }
              if (render != null) {
                if (render.defaultProps != null || render.propTypes != null) {
                  error("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
                }
              }
            }
            var elementType = {
              $$typeof: REACT_FORWARD_REF_TYPE,
              render
            };
            {
              var ownName;
              Object.defineProperty(elementType, "displayName", {
                enumerable: false,
                configurable: true,
                get: function() {
                  return ownName;
                },
                set: function(name) {
                  ownName = name;
                  if (render.displayName == null) {
                    render.displayName = name;
                  }
                }
              });
            }
            return elementType;
          }
          var enableScopeAPI = false;
          function isValidElementType(type) {
            if (typeof type === "string" || typeof type === "function") {
              return true;
            }
            if (type === exports.Fragment || type === exports.Profiler || type === REACT_DEBUG_TRACING_MODE_TYPE || type === exports.StrictMode || type === exports.Suspense || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_LEGACY_HIDDEN_TYPE || enableScopeAPI) {
              return true;
            }
            if (typeof type === "object" && type !== null) {
              if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_BLOCK_TYPE || type[0] === REACT_SERVER_BLOCK_TYPE) {
                return true;
              }
            }
            return false;
          }
          function memo(type, compare) {
            {
              if (!isValidElementType(type)) {
                error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
              }
            }
            var elementType = {
              $$typeof: REACT_MEMO_TYPE,
              type,
              compare: compare === void 0 ? null : compare
            };
            {
              var ownName;
              Object.defineProperty(elementType, "displayName", {
                enumerable: false,
                configurable: true,
                get: function() {
                  return ownName;
                },
                set: function(name) {
                  ownName = name;
                  if (type.displayName == null) {
                    type.displayName = name;
                  }
                }
              });
            }
            return elementType;
          }
          function resolveDispatcher() {
            var dispatcher = ReactCurrentDispatcher.current;
            if (!(dispatcher !== null)) {
              {
                throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
              }
            }
            return dispatcher;
          }
          function useContext(Context, unstable_observedBits) {
            var dispatcher = resolveDispatcher();
            {
              if (unstable_observedBits !== void 0) {
                error("useContext() second argument is reserved for future use in React. Passing it is not supported. You passed: %s.%s", unstable_observedBits, typeof unstable_observedBits === "number" && Array.isArray(arguments[2]) ? "\n\nDid you call array.map(useContext)? Calling Hooks inside a loop is not supported. Learn more at https://reactjs.org/link/rules-of-hooks" : "");
              }
              if (Context._context !== void 0) {
                var realContext = Context._context;
                if (realContext.Consumer === Context) {
                  error("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?");
                } else if (realContext.Provider === Context) {
                  error("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
                }
              }
            }
            return dispatcher.useContext(Context, unstable_observedBits);
          }
          function useState(initialState) {
            var dispatcher = resolveDispatcher();
            return dispatcher.useState(initialState);
          }
          function useReducer(reducer, initialArg, init) {
            var dispatcher = resolveDispatcher();
            return dispatcher.useReducer(reducer, initialArg, init);
          }
          function useRef(initialValue) {
            var dispatcher = resolveDispatcher();
            return dispatcher.useRef(initialValue);
          }
          function useEffect(create, deps) {
            var dispatcher = resolveDispatcher();
            return dispatcher.useEffect(create, deps);
          }
          function useLayoutEffect(create, deps) {
            var dispatcher = resolveDispatcher();
            return dispatcher.useLayoutEffect(create, deps);
          }
          function useCallback(callback, deps) {
            var dispatcher = resolveDispatcher();
            return dispatcher.useCallback(callback, deps);
          }
          function useMemo(create, deps) {
            var dispatcher = resolveDispatcher();
            return dispatcher.useMemo(create, deps);
          }
          function useImperativeHandle(ref, create, deps) {
            var dispatcher = resolveDispatcher();
            return dispatcher.useImperativeHandle(ref, create, deps);
          }
          function useDebugValue(value, formatterFn) {
            {
              var dispatcher = resolveDispatcher();
              return dispatcher.useDebugValue(value, formatterFn);
            }
          }
          var disabledDepth = 0;
          var prevLog;
          var prevInfo;
          var prevWarn;
          var prevError;
          var prevGroup;
          var prevGroupCollapsed;
          var prevGroupEnd;
          function disabledLog() {
          }
          disabledLog.__reactDisabledLog = true;
          function disableLogs() {
            {
              if (disabledDepth === 0) {
                prevLog = console.log;
                prevInfo = console.info;
                prevWarn = console.warn;
                prevError = console.error;
                prevGroup = console.group;
                prevGroupCollapsed = console.groupCollapsed;
                prevGroupEnd = console.groupEnd;
                var props = {
                  configurable: true,
                  enumerable: true,
                  value: disabledLog,
                  writable: true
                };
                Object.defineProperties(console, {
                  info: props,
                  log: props,
                  warn: props,
                  error: props,
                  group: props,
                  groupCollapsed: props,
                  groupEnd: props
                });
              }
              disabledDepth++;
            }
          }
          function reenableLogs() {
            {
              disabledDepth--;
              if (disabledDepth === 0) {
                var props = {
                  configurable: true,
                  enumerable: true,
                  writable: true
                };
                Object.defineProperties(console, {
                  log: _assign({}, props, {
                    value: prevLog
                  }),
                  info: _assign({}, props, {
                    value: prevInfo
                  }),
                  warn: _assign({}, props, {
                    value: prevWarn
                  }),
                  error: _assign({}, props, {
                    value: prevError
                  }),
                  group: _assign({}, props, {
                    value: prevGroup
                  }),
                  groupCollapsed: _assign({}, props, {
                    value: prevGroupCollapsed
                  }),
                  groupEnd: _assign({}, props, {
                    value: prevGroupEnd
                  })
                });
              }
              if (disabledDepth < 0) {
                error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
              }
            }
          }
          var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
          var prefix;
          function describeBuiltInComponentFrame(name, source, ownerFn) {
            {
              if (prefix === void 0) {
                try {
                  throw Error();
                } catch (x) {
                  var match = x.stack.trim().match(/\n( *(at )?)/);
                  prefix = match && match[1] || "";
                }
              }
              return "\n" + prefix + name;
            }
          }
          var reentry = false;
          var componentFrameCache;
          {
            var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
            componentFrameCache = new PossiblyWeakMap();
          }
          function describeNativeComponentFrame(fn, construct) {
            if (!fn || reentry) {
              return "";
            }
            {
              var frame = componentFrameCache.get(fn);
              if (frame !== void 0) {
                return frame;
              }
            }
            var control;
            reentry = true;
            var previousPrepareStackTrace = Error.prepareStackTrace;
            Error.prepareStackTrace = void 0;
            var previousDispatcher;
            {
              previousDispatcher = ReactCurrentDispatcher$1.current;
              ReactCurrentDispatcher$1.current = null;
              disableLogs();
            }
            try {
              if (construct) {
                var Fake = function() {
                  throw Error();
                };
                Object.defineProperty(Fake.prototype, "props", {
                  set: function() {
                    throw Error();
                  }
                });
                if (typeof Reflect === "object" && Reflect.construct) {
                  try {
                    Reflect.construct(Fake, []);
                  } catch (x) {
                    control = x;
                  }
                  Reflect.construct(fn, [], Fake);
                } else {
                  try {
                    Fake.call();
                  } catch (x) {
                    control = x;
                  }
                  fn.call(Fake.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (x) {
                  control = x;
                }
                fn();
              }
            } catch (sample) {
              if (sample && control && typeof sample.stack === "string") {
                var sampleLines = sample.stack.split("\n");
                var controlLines = control.stack.split("\n");
                var s = sampleLines.length - 1;
                var c = controlLines.length - 1;
                while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                  c--;
                }
                for (; s >= 1 && c >= 0; s--, c--) {
                  if (sampleLines[s] !== controlLines[c]) {
                    if (s !== 1 || c !== 1) {
                      do {
                        s--;
                        c--;
                        if (c < 0 || sampleLines[s] !== controlLines[c]) {
                          var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                          {
                            if (typeof fn === "function") {
                              componentFrameCache.set(fn, _frame);
                            }
                          }
                          return _frame;
                        }
                      } while (s >= 1 && c >= 0);
                    }
                    break;
                  }
                }
              }
            } finally {
              reentry = false;
              {
                ReactCurrentDispatcher$1.current = previousDispatcher;
                reenableLogs();
              }
              Error.prepareStackTrace = previousPrepareStackTrace;
            }
            var name = fn ? fn.displayName || fn.name : "";
            var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
            {
              if (typeof fn === "function") {
                componentFrameCache.set(fn, syntheticFrame);
              }
            }
            return syntheticFrame;
          }
          function describeFunctionComponentFrame(fn, source, ownerFn) {
            {
              return describeNativeComponentFrame(fn, false);
            }
          }
          function shouldConstruct(Component2) {
            var prototype = Component2.prototype;
            return !!(prototype && prototype.isReactComponent);
          }
          function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
            if (type == null) {
              return "";
            }
            if (typeof type === "function") {
              {
                return describeNativeComponentFrame(type, shouldConstruct(type));
              }
            }
            if (typeof type === "string") {
              return describeBuiltInComponentFrame(type);
            }
            switch (type) {
              case exports.Suspense:
                return describeBuiltInComponentFrame("Suspense");
              case REACT_SUSPENSE_LIST_TYPE:
                return describeBuiltInComponentFrame("SuspenseList");
            }
            if (typeof type === "object") {
              switch (type.$$typeof) {
                case REACT_FORWARD_REF_TYPE:
                  return describeFunctionComponentFrame(type.render);
                case REACT_MEMO_TYPE:
                  return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
                case REACT_BLOCK_TYPE:
                  return describeFunctionComponentFrame(type._render);
                case REACT_LAZY_TYPE: {
                  var lazyComponent = type;
                  var payload = lazyComponent._payload;
                  var init = lazyComponent._init;
                  try {
                    return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                  } catch (x) {
                  }
                }
              }
            }
            return "";
          }
          var loggedTypeFailures = {};
          var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
          function setCurrentlyValidatingElement(element) {
            {
              if (element) {
                var owner = element._owner;
                var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
                ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
              } else {
                ReactDebugCurrentFrame$1.setExtraStackFrame(null);
              }
            }
          }
          function checkPropTypes(typeSpecs, values, location, componentName, element) {
            {
              var has = Function.call.bind(Object.prototype.hasOwnProperty);
              for (var typeSpecName in typeSpecs) {
                if (has(typeSpecs, typeSpecName)) {
                  var error$1 = void 0;
                  try {
                    if (typeof typeSpecs[typeSpecName] !== "function") {
                      var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                      err.name = "Invariant Violation";
                      throw err;
                    }
                    error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                  } catch (ex) {
                    error$1 = ex;
                  }
                  if (error$1 && !(error$1 instanceof Error)) {
                    setCurrentlyValidatingElement(element);
                    error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                    setCurrentlyValidatingElement(null);
                  }
                  if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                    loggedTypeFailures[error$1.message] = true;
                    setCurrentlyValidatingElement(element);
                    error("Failed %s type: %s", location, error$1.message);
                    setCurrentlyValidatingElement(null);
                  }
                }
              }
            }
          }
          function setCurrentlyValidatingElement$1(element) {
            {
              if (element) {
                var owner = element._owner;
                var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
                setExtraStackFrame(stack);
              } else {
                setExtraStackFrame(null);
              }
            }
          }
          var propTypesMisspellWarningShown;
          {
            propTypesMisspellWarningShown = false;
          }
          function getDeclarationErrorAddendum() {
            if (ReactCurrentOwner.current) {
              var name = getComponentName(ReactCurrentOwner.current.type);
              if (name) {
                return "\n\nCheck the render method of `" + name + "`.";
              }
            }
            return "";
          }
          function getSourceInfoErrorAddendum(source) {
            if (source !== void 0) {
              var fileName = source.fileName.replace(/^.*[\\\/]/, "");
              var lineNumber = source.lineNumber;
              return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
            }
            return "";
          }
          function getSourceInfoErrorAddendumForProps(elementProps) {
            if (elementProps !== null && elementProps !== void 0) {
              return getSourceInfoErrorAddendum(elementProps.__source);
            }
            return "";
          }
          var ownerHasKeyUseWarning = {};
          function getCurrentComponentErrorInfo(parentType) {
            var info = getDeclarationErrorAddendum();
            if (!info) {
              var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
              if (parentName) {
                info = "\n\nCheck the top-level render call using <" + parentName + ">.";
              }
            }
            return info;
          }
          function validateExplicitKey(element, parentType) {
            if (!element._store || element._store.validated || element.key != null) {
              return;
            }
            element._store.validated = true;
            var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
            if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
              return;
            }
            ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
            var childOwner = "";
            if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
              childOwner = " It was passed a child from " + getComponentName(element._owner.type) + ".";
            }
            {
              setCurrentlyValidatingElement$1(element);
              error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
              setCurrentlyValidatingElement$1(null);
            }
          }
          function validateChildKeys(node, parentType) {
            if (typeof node !== "object") {
              return;
            }
            if (Array.isArray(node)) {
              for (var i = 0; i < node.length; i++) {
                var child = node[i];
                if (isValidElement(child)) {
                  validateExplicitKey(child, parentType);
                }
              }
            } else if (isValidElement(node)) {
              if (node._store) {
                node._store.validated = true;
              }
            } else if (node) {
              var iteratorFn = getIteratorFn(node);
              if (typeof iteratorFn === "function") {
                if (iteratorFn !== node.entries) {
                  var iterator = iteratorFn.call(node);
                  var step;
                  while (!(step = iterator.next()).done) {
                    if (isValidElement(step.value)) {
                      validateExplicitKey(step.value, parentType);
                    }
                  }
                }
              }
            }
          }
          function validatePropTypes(element) {
            {
              var type = element.type;
              if (type === null || type === void 0 || typeof type === "string") {
                return;
              }
              var propTypes;
              if (typeof type === "function") {
                propTypes = type.propTypes;
              } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_MEMO_TYPE)) {
                propTypes = type.propTypes;
              } else {
                return;
              }
              if (propTypes) {
                var name = getComponentName(type);
                checkPropTypes(propTypes, element.props, "prop", name, element);
              } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
                propTypesMisspellWarningShown = true;
                var _name = getComponentName(type);
                error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
              }
              if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
                error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
              }
            }
          }
          function validateFragmentProps(fragment) {
            {
              var keys = Object.keys(fragment.props);
              for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key !== "children" && key !== "key") {
                  setCurrentlyValidatingElement$1(fragment);
                  error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                  setCurrentlyValidatingElement$1(null);
                  break;
                }
              }
              if (fragment.ref !== null) {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid attribute `ref` supplied to `React.Fragment`.");
                setCurrentlyValidatingElement$1(null);
              }
            }
          }
          function createElementWithValidation(type, props, children) {
            var validType = isValidElementType(type);
            if (!validType) {
              var info = "";
              if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
                info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
              }
              var sourceInfo = getSourceInfoErrorAddendumForProps(props);
              if (sourceInfo) {
                info += sourceInfo;
              } else {
                info += getDeclarationErrorAddendum();
              }
              var typeString;
              if (type === null) {
                typeString = "null";
              } else if (Array.isArray(type)) {
                typeString = "array";
              } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
                typeString = "<" + (getComponentName(type.type) || "Unknown") + " />";
                info = " Did you accidentally export a JSX literal instead of a component?";
              } else {
                typeString = typeof type;
              }
              {
                error("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
              }
            }
            var element = createElement.apply(this, arguments);
            if (element == null) {
              return element;
            }
            if (validType) {
              for (var i = 2; i < arguments.length; i++) {
                validateChildKeys(arguments[i], type);
              }
            }
            if (type === exports.Fragment) {
              validateFragmentProps(element);
            } else {
              validatePropTypes(element);
            }
            return element;
          }
          var didWarnAboutDeprecatedCreateFactory = false;
          function createFactoryWithValidation(type) {
            var validatedFactory = createElementWithValidation.bind(null, type);
            validatedFactory.type = type;
            {
              if (!didWarnAboutDeprecatedCreateFactory) {
                didWarnAboutDeprecatedCreateFactory = true;
                warn("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.");
              }
              Object.defineProperty(validatedFactory, "type", {
                enumerable: false,
                get: function() {
                  warn("Factory.type is deprecated. Access the class directly before passing it to createFactory.");
                  Object.defineProperty(this, "type", {
                    value: type
                  });
                  return type;
                }
              });
            }
            return validatedFactory;
          }
          function cloneElementWithValidation(element, props, children) {
            var newElement = cloneElement.apply(this, arguments);
            for (var i = 2; i < arguments.length; i++) {
              validateChildKeys(arguments[i], newElement.type);
            }
            validatePropTypes(newElement);
            return newElement;
          }
          {
            try {
              var frozenObject = Object.freeze({});
              /* @__PURE__ */ new Map([[frozenObject, null]]);
              /* @__PURE__ */ new Set([frozenObject]);
            } catch (e) {
            }
          }
          var createElement$1 = createElementWithValidation;
          var cloneElement$1 = cloneElementWithValidation;
          var createFactory = createFactoryWithValidation;
          var Children = {
            map: mapChildren,
            forEach: forEachChildren,
            count: countChildren,
            toArray,
            only: onlyChild
          };
          exports.Children = Children;
          exports.Component = Component;
          exports.PureComponent = PureComponent;
          exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
          exports.cloneElement = cloneElement$1;
          exports.createContext = createContext;
          exports.createElement = createElement$1;
          exports.createFactory = createFactory;
          exports.createRef = createRef;
          exports.forwardRef = forwardRef;
          exports.isValidElement = isValidElement;
          exports.lazy = lazy;
          exports.memo = memo;
          exports.useCallback = useCallback;
          exports.useContext = useContext;
          exports.useDebugValue = useDebugValue;
          exports.useEffect = useEffect;
          exports.useImperativeHandle = useImperativeHandle;
          exports.useLayoutEffect = useLayoutEffect;
          exports.useMemo = useMemo;
          exports.useReducer = useReducer;
          exports.useRef = useRef;
          exports.useState = useState;
          exports.version = ReactVersion;
        })();
      }
    }
  });

  // ../../node_modules/react/index.js
  var require_react = __commonJS({
    "../../node_modules/react/index.js"(exports, module) {
      "use strict";
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_react_development();
      }
    }
  });

  // ../../node_modules/react-is/cjs/react-is.development.js
  var require_react_is_development = __commonJS({
    "../../node_modules/react-is/cjs/react-is.development.js"(exports) {
      "use strict";
      if (true) {
        (function() {
          "use strict";
          var REACT_ELEMENT_TYPE = 60103;
          var REACT_PORTAL_TYPE = 60106;
          var REACT_FRAGMENT_TYPE = 60107;
          var REACT_STRICT_MODE_TYPE = 60108;
          var REACT_PROFILER_TYPE = 60114;
          var REACT_PROVIDER_TYPE = 60109;
          var REACT_CONTEXT_TYPE = 60110;
          var REACT_FORWARD_REF_TYPE = 60112;
          var REACT_SUSPENSE_TYPE = 60113;
          var REACT_SUSPENSE_LIST_TYPE = 60120;
          var REACT_MEMO_TYPE = 60115;
          var REACT_LAZY_TYPE = 60116;
          var REACT_BLOCK_TYPE = 60121;
          var REACT_SERVER_BLOCK_TYPE = 60122;
          var REACT_FUNDAMENTAL_TYPE = 60117;
          var REACT_SCOPE_TYPE = 60119;
          var REACT_OPAQUE_ID_TYPE = 60128;
          var REACT_DEBUG_TRACING_MODE_TYPE = 60129;
          var REACT_OFFSCREEN_TYPE = 60130;
          var REACT_LEGACY_HIDDEN_TYPE = 60131;
          if (typeof Symbol === "function" && Symbol.for) {
            var symbolFor = Symbol.for;
            REACT_ELEMENT_TYPE = symbolFor("react.element");
            REACT_PORTAL_TYPE = symbolFor("react.portal");
            REACT_FRAGMENT_TYPE = symbolFor("react.fragment");
            REACT_STRICT_MODE_TYPE = symbolFor("react.strict_mode");
            REACT_PROFILER_TYPE = symbolFor("react.profiler");
            REACT_PROVIDER_TYPE = symbolFor("react.provider");
            REACT_CONTEXT_TYPE = symbolFor("react.context");
            REACT_FORWARD_REF_TYPE = symbolFor("react.forward_ref");
            REACT_SUSPENSE_TYPE = symbolFor("react.suspense");
            REACT_SUSPENSE_LIST_TYPE = symbolFor("react.suspense_list");
            REACT_MEMO_TYPE = symbolFor("react.memo");
            REACT_LAZY_TYPE = symbolFor("react.lazy");
            REACT_BLOCK_TYPE = symbolFor("react.block");
            REACT_SERVER_BLOCK_TYPE = symbolFor("react.server.block");
            REACT_FUNDAMENTAL_TYPE = symbolFor("react.fundamental");
            REACT_SCOPE_TYPE = symbolFor("react.scope");
            REACT_OPAQUE_ID_TYPE = symbolFor("react.opaque.id");
            REACT_DEBUG_TRACING_MODE_TYPE = symbolFor("react.debug_trace_mode");
            REACT_OFFSCREEN_TYPE = symbolFor("react.offscreen");
            REACT_LEGACY_HIDDEN_TYPE = symbolFor("react.legacy_hidden");
          }
          var enableScopeAPI = false;
          function isValidElementType(type) {
            if (typeof type === "string" || typeof type === "function") {
              return true;
            }
            if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_DEBUG_TRACING_MODE_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_LEGACY_HIDDEN_TYPE || enableScopeAPI) {
              return true;
            }
            if (typeof type === "object" && type !== null) {
              if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_BLOCK_TYPE || type[0] === REACT_SERVER_BLOCK_TYPE) {
                return true;
              }
            }
            return false;
          }
          function typeOf(object) {
            if (typeof object === "object" && object !== null) {
              var $$typeof = object.$$typeof;
              switch ($$typeof) {
                case REACT_ELEMENT_TYPE:
                  var type = object.type;
                  switch (type) {
                    case REACT_FRAGMENT_TYPE:
                    case REACT_PROFILER_TYPE:
                    case REACT_STRICT_MODE_TYPE:
                    case REACT_SUSPENSE_TYPE:
                    case REACT_SUSPENSE_LIST_TYPE:
                      return type;
                    default:
                      var $$typeofType = type && type.$$typeof;
                      switch ($$typeofType) {
                        case REACT_CONTEXT_TYPE:
                        case REACT_FORWARD_REF_TYPE:
                        case REACT_LAZY_TYPE:
                        case REACT_MEMO_TYPE:
                        case REACT_PROVIDER_TYPE:
                          return $$typeofType;
                        default:
                          return $$typeof;
                      }
                  }
                case REACT_PORTAL_TYPE:
                  return $$typeof;
              }
            }
            return void 0;
          }
          var ContextConsumer = REACT_CONTEXT_TYPE;
          var ContextProvider = REACT_PROVIDER_TYPE;
          var Element = REACT_ELEMENT_TYPE;
          var ForwardRef = REACT_FORWARD_REF_TYPE;
          var Fragment = REACT_FRAGMENT_TYPE;
          var Lazy = REACT_LAZY_TYPE;
          var Memo = REACT_MEMO_TYPE;
          var Portal = REACT_PORTAL_TYPE;
          var Profiler = REACT_PROFILER_TYPE;
          var StrictMode = REACT_STRICT_MODE_TYPE;
          var Suspense = REACT_SUSPENSE_TYPE;
          var hasWarnedAboutDeprecatedIsAsyncMode = false;
          var hasWarnedAboutDeprecatedIsConcurrentMode = false;
          function isAsyncMode(object) {
            {
              if (!hasWarnedAboutDeprecatedIsAsyncMode) {
                hasWarnedAboutDeprecatedIsAsyncMode = true;
                console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 18+.");
              }
            }
            return false;
          }
          function isConcurrentMode(object) {
            {
              if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
                hasWarnedAboutDeprecatedIsConcurrentMode = true;
                console["warn"]("The ReactIs.isConcurrentMode() alias has been deprecated, and will be removed in React 18+.");
              }
            }
            return false;
          }
          function isContextConsumer(object) {
            return typeOf(object) === REACT_CONTEXT_TYPE;
          }
          function isContextProvider(object) {
            return typeOf(object) === REACT_PROVIDER_TYPE;
          }
          function isElement(object) {
            return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
          }
          function isForwardRef(object) {
            return typeOf(object) === REACT_FORWARD_REF_TYPE;
          }
          function isFragment(object) {
            return typeOf(object) === REACT_FRAGMENT_TYPE;
          }
          function isLazy(object) {
            return typeOf(object) === REACT_LAZY_TYPE;
          }
          function isMemo(object) {
            return typeOf(object) === REACT_MEMO_TYPE;
          }
          function isPortal(object) {
            return typeOf(object) === REACT_PORTAL_TYPE;
          }
          function isProfiler(object) {
            return typeOf(object) === REACT_PROFILER_TYPE;
          }
          function isStrictMode(object) {
            return typeOf(object) === REACT_STRICT_MODE_TYPE;
          }
          function isSuspense(object) {
            return typeOf(object) === REACT_SUSPENSE_TYPE;
          }
          exports.ContextConsumer = ContextConsumer;
          exports.ContextProvider = ContextProvider;
          exports.Element = Element;
          exports.ForwardRef = ForwardRef;
          exports.Fragment = Fragment;
          exports.Lazy = Lazy;
          exports.Memo = Memo;
          exports.Portal = Portal;
          exports.Profiler = Profiler;
          exports.StrictMode = StrictMode;
          exports.Suspense = Suspense;
          exports.isAsyncMode = isAsyncMode;
          exports.isConcurrentMode = isConcurrentMode;
          exports.isContextConsumer = isContextConsumer;
          exports.isContextProvider = isContextProvider;
          exports.isElement = isElement;
          exports.isForwardRef = isForwardRef;
          exports.isFragment = isFragment;
          exports.isLazy = isLazy;
          exports.isMemo = isMemo;
          exports.isPortal = isPortal;
          exports.isProfiler = isProfiler;
          exports.isStrictMode = isStrictMode;
          exports.isSuspense = isSuspense;
          exports.isValidElementType = isValidElementType;
          exports.typeOf = typeOf;
        })();
      }
    }
  });

  // ../../node_modules/react-is/index.js
  var require_react_is = __commonJS({
    "../../node_modules/react-is/index.js"(exports, module) {
      "use strict";
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_react_is_development();
      }
    }
  });

  // ../../node_modules/react-devtools-inline/dist/backend.js
  var require_backend = __commonJS({
    "../../node_modules/react-devtools-inline/dist/backend.js"(exports, module) {
      module.exports = function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
          if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
          }
          var module2 = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
          };
          modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
          module2.l = true;
          return module2.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function(exports2, name, getter) {
          if (!__webpack_require__.o(exports2, name)) {
            Object.defineProperty(exports2, name, { enumerable: true, get: getter });
          }
        };
        __webpack_require__.r = function(exports2) {
          if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
          }
          Object.defineProperty(exports2, "__esModule", { value: true });
        };
        __webpack_require__.t = function(value, mode) {
          if (mode & 1)
            value = __webpack_require__(value);
          if (mode & 8)
            return value;
          if (mode & 4 && typeof value === "object" && value && value.__esModule)
            return value;
          var ns = Object.create(null);
          __webpack_require__.r(ns);
          Object.defineProperty(ns, "default", { enumerable: true, value });
          if (mode & 2 && typeof value != "string")
            for (var key in value)
              __webpack_require__.d(ns, key, function(key2) {
                return value[key2];
              }.bind(null, key));
          return ns;
        };
        __webpack_require__.n = function(module2) {
          var getter = module2 && module2.__esModule ? function getDefault() {
            return module2["default"];
          } : function getModuleExports() {
            return module2;
          };
          __webpack_require__.d(getter, "a", getter);
          return getter;
        };
        __webpack_require__.o = function(object, property) {
          return Object.prototype.hasOwnProperty.call(object, property);
        };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = 203);
      }({
        0: function(module2, exports2) {
          module2.exports = require_react();
        },
        1: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return CHROME_WEBSTORE_EXTENSION_ID;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return INTERNAL_EXTENSION_ID;
          });
          __webpack_require__.d(__webpack_exports__, "f", function() {
            return LOCAL_EXTENSION_ID;
          });
          __webpack_require__.d(__webpack_exports__, "D", function() {
            return __DEBUG__;
          });
          __webpack_require__.d(__webpack_exports__, "E", function() {
            return __PERFORMANCE_PROFILE__;
          });
          __webpack_require__.d(__webpack_exports__, "v", function() {
            return TREE_OPERATION_ADD;
          });
          __webpack_require__.d(__webpack_exports__, "w", function() {
            return TREE_OPERATION_REMOVE;
          });
          __webpack_require__.d(__webpack_exports__, "y", function() {
            return TREE_OPERATION_REORDER_CHILDREN;
          });
          __webpack_require__.d(__webpack_exports__, "B", function() {
            return TREE_OPERATION_UPDATE_TREE_BASE_DURATION;
          });
          __webpack_require__.d(__webpack_exports__, "A", function() {
            return TREE_OPERATION_UPDATE_ERRORS_OR_WARNINGS;
          });
          __webpack_require__.d(__webpack_exports__, "x", function() {
            return TREE_OPERATION_REMOVE_ROOT;
          });
          __webpack_require__.d(__webpack_exports__, "z", function() {
            return TREE_OPERATION_SET_SUBTREE_MODE;
          });
          __webpack_require__.d(__webpack_exports__, "g", function() {
            return LOCAL_STORAGE_DEFAULT_TAB_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "h", function() {
            return LOCAL_STORAGE_FILTER_PREFERENCES_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "r", function() {
            return SESSION_STORAGE_LAST_SELECTION_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "j", function() {
            return LOCAL_STORAGE_OPEN_IN_EDITOR_URL;
          });
          __webpack_require__.d(__webpack_exports__, "k", function() {
            return LOCAL_STORAGE_PARSE_HOOK_NAMES_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "s", function() {
            return SESSION_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "t", function() {
            return SESSION_STORAGE_RELOAD_AND_PROFILE_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "l", function() {
            return LOCAL_STORAGE_SHOULD_BREAK_ON_CONSOLE_ERRORS;
          });
          __webpack_require__.d(__webpack_exports__, "m", function() {
            return LOCAL_STORAGE_SHOULD_PATCH_CONSOLE_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "n", function() {
            return LOCAL_STORAGE_SHOW_INLINE_WARNINGS_AND_ERRORS_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "o", function() {
            return LOCAL_STORAGE_TRACE_UPDATES_ENABLED_KEY;
          });
          __webpack_require__.d(__webpack_exports__, "i", function() {
            return LOCAL_STORAGE_HIDE_CONSOLE_LOGS_IN_STRICT_MODE;
          });
          __webpack_require__.d(__webpack_exports__, "p", function() {
            return PROFILER_EXPORT_VERSION;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return CHANGE_LOG_URL;
          });
          __webpack_require__.d(__webpack_exports__, "C", function() {
            return UNSUPPORTED_VERSION_URL;
          });
          __webpack_require__.d(__webpack_exports__, "q", function() {
            return REACT_DEVTOOLS_WORKPLACE_URL;
          });
          __webpack_require__.d(__webpack_exports__, "u", function() {
            return THEME_STYLES;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return COMFORTABLE_LINE_HEIGHT;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return COMPACT_LINE_HEIGHT;
          });
          const CHROME_WEBSTORE_EXTENSION_ID = "fmkadmapgofadopljbjfkapdkoienihi";
          const INTERNAL_EXTENSION_ID = "dnjnjgbfilfphmojnmhliehogmojhclc";
          const LOCAL_EXTENSION_ID = "ikiahnapldjmdmpkmfhjdjilojjhgcbf";
          const __DEBUG__ = false;
          const __PERFORMANCE_PROFILE__ = false;
          const TREE_OPERATION_ADD = 1;
          const TREE_OPERATION_REMOVE = 2;
          const TREE_OPERATION_REORDER_CHILDREN = 3;
          const TREE_OPERATION_UPDATE_TREE_BASE_DURATION = 4;
          const TREE_OPERATION_UPDATE_ERRORS_OR_WARNINGS = 5;
          const TREE_OPERATION_REMOVE_ROOT = 6;
          const TREE_OPERATION_SET_SUBTREE_MODE = 7;
          const LOCAL_STORAGE_DEFAULT_TAB_KEY = "React::DevTools::defaultTab";
          const LOCAL_STORAGE_FILTER_PREFERENCES_KEY = "React::DevTools::componentFilters";
          const SESSION_STORAGE_LAST_SELECTION_KEY = "React::DevTools::lastSelection";
          const LOCAL_STORAGE_OPEN_IN_EDITOR_URL = "React::DevTools::openInEditorUrl";
          const LOCAL_STORAGE_PARSE_HOOK_NAMES_KEY = "React::DevTools::parseHookNames";
          const SESSION_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY = "React::DevTools::recordChangeDescriptions";
          const SESSION_STORAGE_RELOAD_AND_PROFILE_KEY = "React::DevTools::reloadAndProfile";
          const LOCAL_STORAGE_SHOULD_BREAK_ON_CONSOLE_ERRORS = "React::DevTools::breakOnConsoleErrors";
          const LOCAL_STORAGE_SHOULD_PATCH_CONSOLE_KEY = "React::DevTools::appendComponentStack";
          const LOCAL_STORAGE_SHOW_INLINE_WARNINGS_AND_ERRORS_KEY = "React::DevTools::showInlineWarningsAndErrors";
          const LOCAL_STORAGE_TRACE_UPDATES_ENABLED_KEY = "React::DevTools::traceUpdatesEnabled";
          const LOCAL_STORAGE_HIDE_CONSOLE_LOGS_IN_STRICT_MODE = "React::DevTools::hideConsoleLogsInStrictMode";
          const PROFILER_EXPORT_VERSION = 5;
          const CHANGE_LOG_URL = "https://github.com/facebook/react/blob/main/packages/react-devtools/CHANGELOG.md";
          const UNSUPPORTED_VERSION_URL = "https://reactjs.org/blog/2019/08/15/new-react-devtools.html#how-do-i-get-the-old-version-back";
          const REACT_DEVTOOLS_WORKPLACE_URL = "https://fburl.com/react-devtools-workplace-group";
          const THEME_STYLES = {
            light: {
              "--color-attribute-name": "#ef6632",
              "--color-attribute-name-not-editable": "#23272f",
              "--color-attribute-name-inverted": "rgba(255, 255, 255, 0.7)",
              "--color-attribute-value": "#1a1aa6",
              "--color-attribute-value-inverted": "#ffffff",
              "--color-attribute-editable-value": "#1a1aa6",
              "--color-background": "#ffffff",
              "--color-background-hover": "rgba(0, 136, 250, 0.1)",
              "--color-background-inactive": "#e5e5e5",
              "--color-background-invalid": "#fff0f0",
              "--color-background-selected": "#0088fa",
              "--color-button-background": "#ffffff",
              "--color-button-background-focus": "#ededed",
              "--color-button": "#5f6673",
              "--color-button-disabled": "#cfd1d5",
              "--color-button-active": "#0088fa",
              "--color-button-focus": "#23272f",
              "--color-button-hover": "#23272f",
              "--color-border": "#eeeeee",
              "--color-commit-did-not-render-fill": "#cfd1d5",
              "--color-commit-did-not-render-fill-text": "#000000",
              "--color-commit-did-not-render-pattern": "#cfd1d5",
              "--color-commit-did-not-render-pattern-text": "#333333",
              "--color-commit-gradient-0": "#37afa9",
              "--color-commit-gradient-1": "#63b19e",
              "--color-commit-gradient-2": "#80b393",
              "--color-commit-gradient-3": "#97b488",
              "--color-commit-gradient-4": "#abb67d",
              "--color-commit-gradient-5": "#beb771",
              "--color-commit-gradient-6": "#cfb965",
              "--color-commit-gradient-7": "#dfba57",
              "--color-commit-gradient-8": "#efbb49",
              "--color-commit-gradient-9": "#febc38",
              "--color-commit-gradient-text": "#000000",
              "--color-component-name": "#6a51b2",
              "--color-component-name-inverted": "#ffffff",
              "--color-component-badge-background": "rgba(0, 0, 0, 0.1)",
              "--color-component-badge-background-inverted": "rgba(255, 255, 255, 0.25)",
              "--color-component-badge-count": "#777d88",
              "--color-component-badge-count-inverted": "rgba(255, 255, 255, 0.7)",
              "--color-console-error-badge-text": "#ffffff",
              "--color-console-error-background": "#fff0f0",
              "--color-console-error-border": "#ffd6d6",
              "--color-console-error-icon": "#eb3941",
              "--color-console-error-text": "#fe2e31",
              "--color-console-warning-badge-text": "#000000",
              "--color-console-warning-background": "#fffbe5",
              "--color-console-warning-border": "#fff5c1",
              "--color-console-warning-icon": "#f4bd00",
              "--color-console-warning-text": "#64460c",
              "--color-context-background": "rgba(0,0,0,.9)",
              "--color-context-background-hover": "rgba(255, 255, 255, 0.1)",
              "--color-context-background-selected": "#178fb9",
              "--color-context-border": "#3d424a",
              "--color-context-text": "#ffffff",
              "--color-context-text-selected": "#ffffff",
              "--color-dim": "#777d88",
              "--color-dimmer": "#cfd1d5",
              "--color-dimmest": "#eff0f1",
              "--color-error-background": "hsl(0, 100%, 97%)",
              "--color-error-border": "hsl(0, 100%, 92%)",
              "--color-error-text": "#ff0000",
              "--color-expand-collapse-toggle": "#777d88",
              "--color-link": "#0000ff",
              "--color-modal-background": "rgba(255, 255, 255, 0.75)",
              "--color-bridge-version-npm-background": "#eff0f1",
              "--color-bridge-version-npm-text": "#000000",
              "--color-bridge-version-number": "#0088fa",
              "--color-primitive-hook-badge-background": "#e5e5e5",
              "--color-primitive-hook-badge-text": "#5f6673",
              "--color-record-active": "#fc3a4b",
              "--color-record-hover": "#3578e5",
              "--color-record-inactive": "#0088fa",
              "--color-resize-bar": "#eeeeee",
              "--color-resize-bar-active": "#dcdcdc",
              "--color-resize-bar-border": "#d1d1d1",
              "--color-resize-bar-dot": "#333333",
              "--color-timeline-internal-module": "#d1d1d1",
              "--color-timeline-internal-module-hover": "#c9c9c9",
              "--color-timeline-internal-module-text": "#444",
              "--color-timeline-native-event": "#ccc",
              "--color-timeline-native-event-hover": "#aaa",
              "--color-timeline-network-primary": "#fcf3dc",
              "--color-timeline-network-primary-hover": "#f0e7d1",
              "--color-timeline-network-secondary": "#efc457",
              "--color-timeline-network-secondary-hover": "#e3ba52",
              "--color-timeline-priority-background": "#f6f6f6",
              "--color-timeline-priority-border": "#eeeeee",
              "--color-timeline-user-timing": "#c9cacd",
              "--color-timeline-user-timing-hover": "#93959a",
              "--color-timeline-react-idle": "#d3e5f6",
              "--color-timeline-react-idle-hover": "#c3d9ef",
              "--color-timeline-react-render": "#9fc3f3",
              "--color-timeline-react-render-hover": "#83afe9",
              "--color-timeline-react-render-text": "#11365e",
              "--color-timeline-react-commit": "#c88ff0",
              "--color-timeline-react-commit-hover": "#b281d6",
              "--color-timeline-react-commit-text": "#3e2c4a",
              "--color-timeline-react-layout-effects": "#b281d6",
              "--color-timeline-react-layout-effects-hover": "#9d71bd",
              "--color-timeline-react-layout-effects-text": "#3e2c4a",
              "--color-timeline-react-passive-effects": "#b281d6",
              "--color-timeline-react-passive-effects-hover": "#9d71bd",
              "--color-timeline-react-passive-effects-text": "#3e2c4a",
              "--color-timeline-react-schedule": "#9fc3f3",
              "--color-timeline-react-schedule-hover": "#2683E2",
              "--color-timeline-react-suspense-rejected": "#f1cc14",
              "--color-timeline-react-suspense-rejected-hover": "#ffdf37",
              "--color-timeline-react-suspense-resolved": "#a6e59f",
              "--color-timeline-react-suspense-resolved-hover": "#89d281",
              "--color-timeline-react-suspense-unresolved": "#c9cacd",
              "--color-timeline-react-suspense-unresolved-hover": "#93959a",
              "--color-timeline-thrown-error": "#ee1638",
              "--color-timeline-thrown-error-hover": "#da1030",
              "--color-timeline-text-color": "#000000",
              "--color-timeline-text-dim-color": "#ccc",
              "--color-timeline-react-work-border": "#eeeeee",
              "--color-search-match": "yellow",
              "--color-search-match-current": "#f7923b",
              "--color-selected-tree-highlight-active": "rgba(0, 136, 250, 0.1)",
              "--color-selected-tree-highlight-inactive": "rgba(0, 0, 0, 0.05)",
              "--color-scroll-caret": "rgba(150, 150, 150, 0.5)",
              "--color-tab-selected-border": "#0088fa",
              "--color-text": "#000000",
              "--color-text-invalid": "#ff0000",
              "--color-text-selected": "#ffffff",
              "--color-toggle-background-invalid": "#fc3a4b",
              "--color-toggle-background-on": "#0088fa",
              "--color-toggle-background-off": "#cfd1d5",
              "--color-toggle-text": "#ffffff",
              "--color-warning-background": "#fb3655",
              "--color-warning-background-hover": "#f82042",
              "--color-warning-text-color": "#ffffff",
              "--color-warning-text-color-inverted": "#fd4d69",
              "--color-scroll-thumb": "#c2c2c2",
              "--color-scroll-track": "#fafafa",
              "--color-tooltip-background": "rgba(0, 0, 0, 0.9)",
              "--color-tooltip-text": "#ffffff"
            },
            dark: {
              "--color-attribute-name": "#9d87d2",
              "--color-attribute-name-not-editable": "#ededed",
              "--color-attribute-name-inverted": "#282828",
              "--color-attribute-value": "#cedae0",
              "--color-attribute-value-inverted": "#ffffff",
              "--color-attribute-editable-value": "yellow",
              "--color-background": "#282c34",
              "--color-background-hover": "rgba(255, 255, 255, 0.1)",
              "--color-background-inactive": "#3d424a",
              "--color-background-invalid": "#5c0000",
              "--color-background-selected": "#178fb9",
              "--color-button-background": "#282c34",
              "--color-button-background-focus": "#3d424a",
              "--color-button": "#afb3b9",
              "--color-button-active": "#61dafb",
              "--color-button-disabled": "#4f5766",
              "--color-button-focus": "#a2e9fc",
              "--color-button-hover": "#ededed",
              "--color-border": "#3d424a",
              "--color-commit-did-not-render-fill": "#777d88",
              "--color-commit-did-not-render-fill-text": "#000000",
              "--color-commit-did-not-render-pattern": "#666c77",
              "--color-commit-did-not-render-pattern-text": "#ffffff",
              "--color-commit-gradient-0": "#37afa9",
              "--color-commit-gradient-1": "#63b19e",
              "--color-commit-gradient-2": "#80b393",
              "--color-commit-gradient-3": "#97b488",
              "--color-commit-gradient-4": "#abb67d",
              "--color-commit-gradient-5": "#beb771",
              "--color-commit-gradient-6": "#cfb965",
              "--color-commit-gradient-7": "#dfba57",
              "--color-commit-gradient-8": "#efbb49",
              "--color-commit-gradient-9": "#febc38",
              "--color-commit-gradient-text": "#000000",
              "--color-component-name": "#61dafb",
              "--color-component-name-inverted": "#282828",
              "--color-component-badge-background": "rgba(255, 255, 255, 0.25)",
              "--color-component-badge-background-inverted": "rgba(0, 0, 0, 0.25)",
              "--color-component-badge-count": "#8f949d",
              "--color-component-badge-count-inverted": "rgba(255, 255, 255, 0.7)",
              "--color-console-error-badge-text": "#000000",
              "--color-console-error-background": "#290000",
              "--color-console-error-border": "#5c0000",
              "--color-console-error-icon": "#eb3941",
              "--color-console-error-text": "#fc7f7f",
              "--color-console-warning-badge-text": "#000000",
              "--color-console-warning-background": "#332b00",
              "--color-console-warning-border": "#665500",
              "--color-console-warning-icon": "#f4bd00",
              "--color-console-warning-text": "#f5f2ed",
              "--color-context-background": "rgba(255,255,255,.95)",
              "--color-context-background-hover": "rgba(0, 136, 250, 0.1)",
              "--color-context-background-selected": "#0088fa",
              "--color-context-border": "#eeeeee",
              "--color-context-text": "#000000",
              "--color-context-text-selected": "#ffffff",
              "--color-dim": "#8f949d",
              "--color-dimmer": "#777d88",
              "--color-dimmest": "#4f5766",
              "--color-error-background": "#200",
              "--color-error-border": "#900",
              "--color-error-text": "#f55",
              "--color-expand-collapse-toggle": "#8f949d",
              "--color-link": "#61dafb",
              "--color-modal-background": "rgba(0, 0, 0, 0.75)",
              "--color-bridge-version-npm-background": "rgba(0, 0, 0, 0.25)",
              "--color-bridge-version-npm-text": "#ffffff",
              "--color-bridge-version-number": "yellow",
              "--color-primitive-hook-badge-background": "rgba(0, 0, 0, 0.25)",
              "--color-primitive-hook-badge-text": "rgba(255, 255, 255, 0.7)",
              "--color-record-active": "#fc3a4b",
              "--color-record-hover": "#a2e9fc",
              "--color-record-inactive": "#61dafb",
              "--color-resize-bar": "#282c34",
              "--color-resize-bar-active": "#31363f",
              "--color-resize-bar-border": "#3d424a",
              "--color-resize-bar-dot": "#cfd1d5",
              "--color-timeline-internal-module": "#303542",
              "--color-timeline-internal-module-hover": "#363b4a",
              "--color-timeline-internal-module-text": "#7f8899",
              "--color-timeline-native-event": "#b2b2b2",
              "--color-timeline-native-event-hover": "#949494",
              "--color-timeline-network-primary": "#fcf3dc",
              "--color-timeline-network-primary-hover": "#e3dbc5",
              "--color-timeline-network-secondary": "#efc457",
              "--color-timeline-network-secondary-hover": "#d6af4d",
              "--color-timeline-priority-background": "#1d2129",
              "--color-timeline-priority-border": "#282c34",
              "--color-timeline-user-timing": "#c9cacd",
              "--color-timeline-user-timing-hover": "#93959a",
              "--color-timeline-react-idle": "#3d485b",
              "--color-timeline-react-idle-hover": "#465269",
              "--color-timeline-react-render": "#2683E2",
              "--color-timeline-react-render-hover": "#1a76d4",
              "--color-timeline-react-render-text": "#11365e",
              "--color-timeline-react-commit": "#731fad",
              "--color-timeline-react-commit-hover": "#611b94",
              "--color-timeline-react-commit-text": "#e5c1ff",
              "--color-timeline-react-layout-effects": "#611b94",
              "--color-timeline-react-layout-effects-hover": "#51167a",
              "--color-timeline-react-layout-effects-text": "#e5c1ff",
              "--color-timeline-react-passive-effects": "#611b94",
              "--color-timeline-react-passive-effects-hover": "#51167a",
              "--color-timeline-react-passive-effects-text": "#e5c1ff",
              "--color-timeline-react-schedule": "#2683E2",
              "--color-timeline-react-schedule-hover": "#1a76d4",
              "--color-timeline-react-suspense-rejected": "#f1cc14",
              "--color-timeline-react-suspense-rejected-hover": "#e4c00f",
              "--color-timeline-react-suspense-resolved": "#a6e59f",
              "--color-timeline-react-suspense-resolved-hover": "#89d281",
              "--color-timeline-react-suspense-unresolved": "#c9cacd",
              "--color-timeline-react-suspense-unresolved-hover": "#93959a",
              "--color-timeline-thrown-error": "#fb3655",
              "--color-timeline-thrown-error-hover": "#f82042",
              "--color-timeline-text-color": "#282c34",
              "--color-timeline-text-dim-color": "#555b66",
              "--color-timeline-react-work-border": "#3d424a",
              "--color-search-match": "yellow",
              "--color-search-match-current": "#f7923b",
              "--color-selected-tree-highlight-active": "rgba(23, 143, 185, 0.15)",
              "--color-selected-tree-highlight-inactive": "rgba(255, 255, 255, 0.05)",
              "--color-scroll-caret": "#4f5766",
              "--color-shadow": "rgba(0, 0, 0, 0.5)",
              "--color-tab-selected-border": "#178fb9",
              "--color-text": "#ffffff",
              "--color-text-invalid": "#ff8080",
              "--color-text-selected": "#ffffff",
              "--color-toggle-background-invalid": "#fc3a4b",
              "--color-toggle-background-on": "#178fb9",
              "--color-toggle-background-off": "#777d88",
              "--color-toggle-text": "#ffffff",
              "--color-warning-background": "#ee1638",
              "--color-warning-background-hover": "#da1030",
              "--color-warning-text-color": "#ffffff",
              "--color-warning-text-color-inverted": "#ee1638",
              "--color-scroll-thumb": "#afb3b9",
              "--color-scroll-track": "#313640",
              "--color-tooltip-background": "rgba(255, 255, 255, 0.95)",
              "--color-tooltip-text": "#000000"
            },
            compact: {
              "--font-size-monospace-small": "9px",
              "--font-size-monospace-normal": "11px",
              "--font-size-monospace-large": "15px",
              "--font-size-sans-small": "10px",
              "--font-size-sans-normal": "12px",
              "--font-size-sans-large": "14px",
              "--line-height-data": "18px"
            },
            comfortable: {
              "--font-size-monospace-small": "10px",
              "--font-size-monospace-normal": "13px",
              "--font-size-monospace-large": "17px",
              "--font-size-sans-small": "12px",
              "--font-size-sans-normal": "14px",
              "--font-size-sans-large": "16px",
              "--line-height-data": "22px"
            }
          };
          const COMFORTABLE_LINE_HEIGHT = parseInt(THEME_STYLES.comfortable["--line-height-data"], 10);
          const COMPACT_LINE_HEIGHT = parseInt(THEME_STYLES.compact["--line-height-data"], 10);
        },
        10: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return meta;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return dehydrate;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return fillInPath;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return hydrate;
          });
          var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
          const meta = {
            inspectable: Symbol("inspectable"),
            inspected: Symbol("inspected"),
            name: Symbol("name"),
            preview_long: Symbol("preview_long"),
            preview_short: Symbol("preview_short"),
            readonly: Symbol("readonly"),
            size: Symbol("size"),
            type: Symbol("type"),
            unserializable: Symbol("unserializable")
          };
          const LEVEL_THRESHOLD = 2;
          function createDehydrated(type, inspectable, data, cleaned, path) {
            cleaned.push(path);
            const dehydrated = {
              inspectable,
              type,
              preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
              preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
              name: !data.constructor || data.constructor.name === "Object" ? "" : data.constructor.name
            };
            if (type === "array" || type === "typed_array") {
              dehydrated.size = data.length;
            } else if (type === "object") {
              dehydrated.size = Object.keys(data).length;
            }
            if (type === "iterator" || type === "typed_array") {
              dehydrated.readonly = true;
            }
            return dehydrated;
          }
          function dehydrate(data, cleaned, unserializable, path, isPathAllowed, level = 0) {
            const type = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["f"])(data);
            let isPathAllowedCheck;
            switch (type) {
              case "html_element":
                cleaned.push(path);
                return {
                  inspectable: false,
                  preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                  preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                  name: data.tagName,
                  type
                };
              case "function":
                cleaned.push(path);
                return {
                  inspectable: false,
                  preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                  preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                  name: typeof data.name === "function" || !data.name ? "function" : data.name,
                  type
                };
              case "string":
                isPathAllowedCheck = isPathAllowed(path);
                if (isPathAllowedCheck) {
                  return data;
                } else {
                  return data.length <= 500 ? data : data.slice(0, 500) + "...";
                }
              case "bigint":
                cleaned.push(path);
                return {
                  inspectable: false,
                  preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                  preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                  name: data.toString(),
                  type
                };
              case "symbol":
                cleaned.push(path);
                return {
                  inspectable: false,
                  preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                  preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                  name: data.toString(),
                  type
                };
              case "react_element":
                cleaned.push(path);
                return {
                  inspectable: false,
                  preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                  preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                  name: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["j"])(data) || "Unknown",
                  type
                };
              case "array_buffer":
              case "data_view":
                cleaned.push(path);
                return {
                  inspectable: false,
                  preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                  preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                  name: type === "data_view" ? "DataView" : "ArrayBuffer",
                  size: data.byteLength,
                  type
                };
              case "array":
                isPathAllowedCheck = isPathAllowed(path);
                if (level >= LEVEL_THRESHOLD && !isPathAllowedCheck) {
                  return createDehydrated(type, true, data, cleaned, path);
                }
                return data.map((item, i) => dehydrate(item, cleaned, unserializable, path.concat([i]), isPathAllowed, isPathAllowedCheck ? 1 : level + 1));
              case "html_all_collection":
              case "typed_array":
              case "iterator":
                isPathAllowedCheck = isPathAllowed(path);
                if (level >= LEVEL_THRESHOLD && !isPathAllowedCheck) {
                  return createDehydrated(type, true, data, cleaned, path);
                } else {
                  const unserializableValue = {
                    unserializable: true,
                    type,
                    readonly: true,
                    size: type === "typed_array" ? data.length : void 0,
                    preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                    preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                    name: !data.constructor || data.constructor.name === "Object" ? "" : data.constructor.name
                  };
                  Array.from(data).forEach((item, i) => unserializableValue[i] = dehydrate(item, cleaned, unserializable, path.concat([i]), isPathAllowed, isPathAllowedCheck ? 1 : level + 1));
                  unserializable.push(path);
                  return unserializableValue;
                }
              case "opaque_iterator":
                cleaned.push(path);
                return {
                  inspectable: false,
                  preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                  preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                  name: data[Symbol.toStringTag],
                  type
                };
              case "date":
                cleaned.push(path);
                return {
                  inspectable: false,
                  preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                  preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                  name: data.toString(),
                  type
                };
              case "regexp":
                cleaned.push(path);
                return {
                  inspectable: false,
                  preview_short: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, false),
                  preview_long: Object(_utils__WEBPACK_IMPORTED_MODULE_0__["b"])(data, true),
                  name: data.toString(),
                  type
                };
              case "object":
                isPathAllowedCheck = isPathAllowed(path);
                if (level >= LEVEL_THRESHOLD && !isPathAllowedCheck) {
                  return createDehydrated(type, true, data, cleaned, path);
                } else {
                  const object = {};
                  Object(_utils__WEBPACK_IMPORTED_MODULE_0__["c"])(data).forEach((key) => {
                    const name = key.toString();
                    object[name] = dehydrate(data[key], cleaned, unserializable, path.concat([name]), isPathAllowed, isPathAllowedCheck ? 1 : level + 1);
                  });
                  return object;
                }
              case "infinity":
              case "nan":
              case "undefined":
                cleaned.push(path);
                return {
                  type
                };
              default:
                return data;
            }
          }
          function fillInPath(object, data, path, value) {
            const target = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["l"])(object, path);
            if (target != null) {
              if (!target[meta.unserializable]) {
                delete target[meta.inspectable];
                delete target[meta.inspected];
                delete target[meta.name];
                delete target[meta.preview_long];
                delete target[meta.preview_short];
                delete target[meta.readonly];
                delete target[meta.size];
                delete target[meta.type];
              }
            }
            if (value !== null && data.unserializable.length > 0) {
              const unserializablePath = data.unserializable[0];
              let isMatch = unserializablePath.length === path.length;
              for (let i = 0; i < path.length; i++) {
                if (path[i] !== unserializablePath[i]) {
                  isMatch = false;
                  break;
                }
              }
              if (isMatch) {
                upgradeUnserializable(value, value);
              }
            }
            Object(_utils__WEBPACK_IMPORTED_MODULE_0__["u"])(object, path, value);
          }
          function hydrate(object, cleaned, unserializable) {
            cleaned.forEach((path) => {
              const length = path.length;
              const last = path[length - 1];
              const parent = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["l"])(object, path.slice(0, length - 1));
              if (!parent || !parent.hasOwnProperty(last)) {
                return;
              }
              const value = parent[last];
              if (!value) {
                return;
              } else if (value.type === "infinity") {
                parent[last] = Infinity;
              } else if (value.type === "nan") {
                parent[last] = NaN;
              } else if (value.type === "undefined") {
                parent[last] = void 0;
              } else {
                const replaced = {};
                replaced[meta.inspectable] = !!value.inspectable;
                replaced[meta.inspected] = false;
                replaced[meta.name] = value.name;
                replaced[meta.preview_long] = value.preview_long;
                replaced[meta.preview_short] = value.preview_short;
                replaced[meta.size] = value.size;
                replaced[meta.readonly] = !!value.readonly;
                replaced[meta.type] = value.type;
                parent[last] = replaced;
              }
            });
            unserializable.forEach((path) => {
              const length = path.length;
              const last = path[length - 1];
              const parent = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["l"])(object, path.slice(0, length - 1));
              if (!parent || !parent.hasOwnProperty(last)) {
                return;
              }
              const node = parent[last];
              const replacement = __spreadValues({}, node);
              upgradeUnserializable(replacement, node);
              parent[last] = replacement;
            });
            return object;
          }
          function upgradeUnserializable(destination, source) {
            Object.defineProperties(destination, {
              [meta.inspected]: {
                configurable: true,
                enumerable: false,
                value: !!source.inspected
              },
              [meta.name]: {
                configurable: true,
                enumerable: false,
                value: source.name
              },
              [meta.preview_long]: {
                configurable: true,
                enumerable: false,
                value: source.preview_long
              },
              [meta.preview_short]: {
                configurable: true,
                enumerable: false,
                value: source.preview_short
              },
              [meta.size]: {
                configurable: true,
                enumerable: false,
                value: source.size
              },
              [meta.readonly]: {
                configurable: true,
                enumerable: false,
                value: !!source.readonly
              },
              [meta.type]: {
                configurable: true,
                enumerable: false,
                value: source.type
              },
              [meta.unserializable]: {
                configurable: true,
                enumerable: false,
                value: !!source.unserializable
              }
            });
            delete destination.inspected;
            delete destination.name;
            delete destination.preview_long;
            delete destination.preview_short;
            delete destination.size;
            delete destination.readonly;
            delete destination.type;
            delete destination.unserializable;
          }
        },
        115: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return getStackByFiberInDevAndProd;
          });
          var ReactSymbols = __webpack_require__(9);
          let disabledDepth = 0;
          let prevLog;
          let prevInfo;
          let prevWarn;
          let prevError;
          let prevGroup;
          let prevGroupCollapsed;
          let prevGroupEnd;
          function disabledLog() {
          }
          disabledLog.__reactDisabledLog = true;
          function disableLogs() {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              const props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
          function reenableLogs() {
            disabledDepth--;
            if (disabledDepth === 0) {
              const props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: __spreadProps(__spreadValues({}, props), {
                  value: prevLog
                }),
                info: __spreadProps(__spreadValues({}, props), {
                  value: prevInfo
                }),
                warn: __spreadProps(__spreadValues({}, props), {
                  value: prevWarn
                }),
                error: __spreadProps(__spreadValues({}, props), {
                  value: prevError
                }),
                group: __spreadProps(__spreadValues({}, props), {
                  value: prevGroup
                }),
                groupCollapsed: __spreadProps(__spreadValues({}, props), {
                  value: prevGroupCollapsed
                }),
                groupEnd: __spreadProps(__spreadValues({}, props), {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              console.error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
          let prefix;
          function describeBuiltInComponentFrame(name, source, ownerFn) {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                const match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
          let reentry = false;
          let componentFrameCache;
          if (false) {
          }
          function describeNativeComponentFrame(fn, construct, currentDispatcherRef) {
            if (!fn || reentry) {
              return "";
            }
            if (false) {
            }
            let control;
            const previousPrepareStackTrace = Error.prepareStackTrace;
            Error.prepareStackTrace = void 0;
            reentry = true;
            const previousDispatcher = currentDispatcherRef.current;
            currentDispatcherRef.current = null;
            disableLogs();
            try {
              if (construct) {
                const Fake = function() {
                  throw Error();
                };
                Object.defineProperty(Fake.prototype, "props", {
                  set: function() {
                    throw Error();
                  }
                });
                if (typeof Reflect === "object" && Reflect.construct) {
                  try {
                    Reflect.construct(Fake, []);
                  } catch (x) {
                    control = x;
                  }
                  Reflect.construct(fn, [], Fake);
                } else {
                  try {
                    Fake.call();
                  } catch (x) {
                    control = x;
                  }
                  fn.call(Fake.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (x) {
                  control = x;
                }
                fn();
              }
            } catch (sample) {
              if (sample && control && typeof sample.stack === "string") {
                const sampleLines = sample.stack.split("\n");
                const controlLines = control.stack.split("\n");
                let s = sampleLines.length - 1;
                let c = controlLines.length - 1;
                while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                  c--;
                }
                for (; s >= 1 && c >= 0; s--, c--) {
                  if (sampleLines[s] !== controlLines[c]) {
                    if (s !== 1 || c !== 1) {
                      do {
                        s--;
                        c--;
                        if (c < 0 || sampleLines[s] !== controlLines[c]) {
                          const frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                          if (false) {
                          }
                          return frame;
                        }
                      } while (s >= 1 && c >= 0);
                    }
                    break;
                  }
                }
              }
            } finally {
              reentry = false;
              Error.prepareStackTrace = previousPrepareStackTrace;
              currentDispatcherRef.current = previousDispatcher;
              reenableLogs();
            }
            const name = fn ? fn.displayName || fn.name : "";
            const syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
            if (false) {
            }
            return syntheticFrame;
          }
          function describeClassComponentFrame(ctor, source, ownerFn, currentDispatcherRef) {
            return describeNativeComponentFrame(ctor, true, currentDispatcherRef);
          }
          function describeFunctionComponentFrame(fn, source, ownerFn, currentDispatcherRef) {
            return describeNativeComponentFrame(fn, false, currentDispatcherRef);
          }
          function shouldConstruct(Component) {
            const prototype = Component.prototype;
            return !!(prototype && prototype.isReactComponent);
          }
          function describeUnknownElementTypeFrameInDEV(type, source, ownerFn, currentDispatcherRef) {
            if (true) {
              return "";
            }
            if (type == null) {
              return "";
            }
            if (typeof type === "function") {
              return describeNativeComponentFrame(type, shouldConstruct(type), currentDispatcherRef);
            }
            if (typeof type === "string") {
              return describeBuiltInComponentFrame(type, source, ownerFn);
            }
            switch (type) {
              case ReactSymbols["v"]:
              case ReactSymbols["w"]:
                return describeBuiltInComponentFrame("Suspense", source, ownerFn);
              case ReactSymbols["t"]:
              case ReactSymbols["u"]:
                return describeBuiltInComponentFrame("SuspenseList", source, ownerFn);
            }
            if (typeof type === "object") {
              switch (type.$$typeof) {
                case ReactSymbols["f"]:
                case ReactSymbols["g"]:
                  return describeFunctionComponentFrame(type.render, source, ownerFn, currentDispatcherRef);
                case ReactSymbols["j"]:
                case ReactSymbols["k"]:
                  return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn, currentDispatcherRef);
                case ReactSymbols["h"]:
                case ReactSymbols["i"]: {
                  const lazyComponent = type;
                  const payload = lazyComponent._payload;
                  const init = lazyComponent._init;
                  try {
                    return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn, currentDispatcherRef);
                  } catch (x) {
                  }
                }
              }
            }
            return "";
          }
          function describeFiber(workTagMap, workInProgress, currentDispatcherRef) {
            const {
              HostComponent,
              LazyComponent,
              SuspenseComponent,
              SuspenseListComponent,
              FunctionComponent,
              IndeterminateComponent,
              SimpleMemoComponent,
              ForwardRef,
              ClassComponent
            } = workTagMap;
            const owner = false ? void 0 : null;
            const source = false ? void 0 : null;
            switch (workInProgress.tag) {
              case HostComponent:
                return describeBuiltInComponentFrame(workInProgress.type, source, owner);
              case LazyComponent:
                return describeBuiltInComponentFrame("Lazy", source, owner);
              case SuspenseComponent:
                return describeBuiltInComponentFrame("Suspense", source, owner);
              case SuspenseListComponent:
                return describeBuiltInComponentFrame("SuspenseList", source, owner);
              case FunctionComponent:
              case IndeterminateComponent:
              case SimpleMemoComponent:
                return describeFunctionComponentFrame(workInProgress.type, source, owner, currentDispatcherRef);
              case ForwardRef:
                return describeFunctionComponentFrame(workInProgress.type.render, source, owner, currentDispatcherRef);
              case ClassComponent:
                return describeClassComponentFrame(workInProgress.type, source, owner, currentDispatcherRef);
              default:
                return "";
            }
          }
          function getStackByFiberInDevAndProd(workTagMap, workInProgress, currentDispatcherRef) {
            try {
              let info = "";
              let node = workInProgress;
              do {
                info += describeFiber(workTagMap, node, currentDispatcherRef);
                node = node.return;
              } while (node);
              return info;
            } catch (x) {
              return "\nError generating stack: " + x.message + "\n" + x.stack;
            }
          }
        },
        12: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return consoleManagedByDevToolsDuringStrictMode;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return enableLogger;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return enableNamedHooksFeature;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return enableProfilerChangedHookIndices;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return enableStyleXFeatures;
          });
          __webpack_require__.d(__webpack_exports__, "f", function() {
            return isInternalFacebookBuild;
          });
          const consoleManagedByDevToolsDuringStrictMode = true;
          const enableLogger = false;
          const enableNamedHooksFeature = true;
          const enableProfilerChangedHookIndices = true;
          const enableStyleXFeatures = false;
          const isInternalFacebookBuild = false;
        },
        14: function(module2, exports2) {
          module2.exports = require_react_is();
        },
        16: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return cleanForBridge;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return copyToClipboard;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return copyWithDelete;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return copyWithRename;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return copyWithSet;
          });
          __webpack_require__.d(__webpack_exports__, "g", function() {
            return getEffectDurations;
          });
          __webpack_require__.d(__webpack_exports__, "f", function() {
            return format;
          });
          __webpack_require__.d(__webpack_exports__, "h", function() {
            return isSynchronousXHRSupported;
          });
          var clipboard_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18);
          var clipboard_js__WEBPACK_IMPORTED_MODULE_0___default = /* @__PURE__ */ __webpack_require__.n(clipboard_js__WEBPACK_IMPORTED_MODULE_0__);
          var _hydration__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
          var shared_isArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(49);
          function cleanForBridge(data, isPathAllowed, path = []) {
            if (data !== null) {
              const cleanedPaths = [];
              const unserializablePaths = [];
              const cleanedData = Object(_hydration__WEBPACK_IMPORTED_MODULE_1__["a"])(data, cleanedPaths, unserializablePaths, path, isPathAllowed);
              return {
                data: cleanedData,
                cleaned: cleanedPaths,
                unserializable: unserializablePaths
              };
            } else {
              return null;
            }
          }
          function copyToClipboard(value) {
            const safeToCopy = serializeToString(value);
            const text = safeToCopy === void 0 ? "undefined" : safeToCopy;
            const {
              clipboardCopyText
            } = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (typeof clipboardCopyText === "function") {
              clipboardCopyText(text).catch((err) => {
              });
            } else {
              Object(clipboard_js__WEBPACK_IMPORTED_MODULE_0__["copy"])(text);
            }
          }
          function copyWithDelete(obj, path, index = 0) {
            const key = path[index];
            const updated = Object(shared_isArray__WEBPACK_IMPORTED_MODULE_2__["a"])(obj) ? obj.slice() : __spreadValues({}, obj);
            if (index + 1 === path.length) {
              if (Object(shared_isArray__WEBPACK_IMPORTED_MODULE_2__["a"])(updated)) {
                updated.splice(key, 1);
              } else {
                delete updated[key];
              }
            } else {
              updated[key] = copyWithDelete(obj[key], path, index + 1);
            }
            return updated;
          }
          function copyWithRename(obj, oldPath, newPath, index = 0) {
            const oldKey = oldPath[index];
            const updated = Object(shared_isArray__WEBPACK_IMPORTED_MODULE_2__["a"])(obj) ? obj.slice() : __spreadValues({}, obj);
            if (index + 1 === oldPath.length) {
              const newKey = newPath[index];
              updated[newKey] = updated[oldKey];
              if (Object(shared_isArray__WEBPACK_IMPORTED_MODULE_2__["a"])(updated)) {
                updated.splice(oldKey, 1);
              } else {
                delete updated[oldKey];
              }
            } else {
              updated[oldKey] = copyWithRename(obj[oldKey], oldPath, newPath, index + 1);
            }
            return updated;
          }
          function copyWithSet(obj, path, value, index = 0) {
            if (index >= path.length) {
              return value;
            }
            const key = path[index];
            const updated = Object(shared_isArray__WEBPACK_IMPORTED_MODULE_2__["a"])(obj) ? obj.slice() : __spreadValues({}, obj);
            updated[key] = copyWithSet(obj[key], path, value, index + 1);
            return updated;
          }
          function getEffectDurations(root) {
            let effectDuration = null;
            let passiveEffectDuration = null;
            const hostRoot = root.current;
            if (hostRoot != null) {
              const stateNode = hostRoot.stateNode;
              if (stateNode != null) {
                effectDuration = stateNode.effectDuration != null ? stateNode.effectDuration : null;
                passiveEffectDuration = stateNode.passiveEffectDuration != null ? stateNode.passiveEffectDuration : null;
              }
            }
            return {
              effectDuration,
              passiveEffectDuration
            };
          }
          function serializeToString(data) {
            const cache = /* @__PURE__ */ new Set();
            return JSON.stringify(data, (key, value) => {
              if (typeof value === "object" && value !== null) {
                if (cache.has(value)) {
                  return;
                }
                cache.add(value);
              }
              if (typeof value === "bigint") {
                return value.toString() + "n";
              }
              return value;
            });
          }
          function format(maybeMessage, ...inputArgs) {
            const args = inputArgs.slice();
            let formatted = String(maybeMessage);
            if (typeof maybeMessage === "string") {
              if (args.length) {
                const REGEXP = /(%?)(%([jds]))/g;
                formatted = formatted.replace(REGEXP, (match, escaped, ptn, flag) => {
                  let arg = args.shift();
                  switch (flag) {
                    case "s":
                      arg += "";
                      break;
                    case "d":
                    case "i":
                      arg = parseInt(arg, 10).toString();
                      break;
                    case "f":
                      arg = parseFloat(arg).toString();
                      break;
                  }
                  if (!escaped) {
                    return arg;
                  }
                  args.unshift(arg);
                  return match;
                });
              }
            }
            if (args.length) {
              for (let i = 0; i < args.length; i++) {
                formatted += " " + String(args[i]);
              }
            }
            formatted = formatted.replace(/%{2,2}/g, "%");
            return String(formatted);
          }
          function isSynchronousXHRSupported() {
            return !!(window.document && window.document.featurePolicy && window.document.featurePolicy.allowsFeature("sync-xhr"));
          }
        },
        18: function(module2, exports2, __webpack_require__) {
          (function(setImmediate) {
            (function(name, definition) {
              if (true) {
                module2.exports = definition();
              } else {
              }
            })("clipboard", function() {
              if (typeof document === "undefined" || !document.addEventListener) {
                return null;
              }
              var clipboard = {};
              clipboard.copy = function() {
                var _intercept = false;
                var _data = null;
                var _bogusSelection = false;
                function cleanup() {
                  _intercept = false;
                  _data = null;
                  if (_bogusSelection) {
                    window.getSelection().removeAllRanges();
                  }
                  _bogusSelection = false;
                }
                document.addEventListener("copy", function(e) {
                  if (_intercept) {
                    for (var key in _data) {
                      e.clipboardData.setData(key, _data[key]);
                    }
                    e.preventDefault();
                  }
                });
                function bogusSelect() {
                  var sel = document.getSelection();
                  if (!document.queryCommandEnabled("copy") && sel.isCollapsed) {
                    var range = document.createRange();
                    range.selectNodeContents(document.body);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    _bogusSelection = true;
                  }
                }
                ;
                return function(data) {
                  return new Promise(function(resolve, reject) {
                    _intercept = true;
                    if (typeof data === "string") {
                      _data = {
                        "text/plain": data
                      };
                    } else if (data instanceof Node) {
                      _data = {
                        "text/html": new XMLSerializer().serializeToString(data)
                      };
                    } else if (data instanceof Object) {
                      _data = data;
                    } else {
                      reject("Invalid data type. Must be string, DOM node, or an object mapping MIME types to strings.");
                    }
                    function triggerCopy(tryBogusSelect) {
                      try {
                        if (document.execCommand("copy")) {
                          cleanup();
                          resolve();
                        } else {
                          if (!tryBogusSelect) {
                            bogusSelect();
                            triggerCopy(true);
                          } else {
                            cleanup();
                            throw new Error("Unable to copy. Perhaps it's not available in your browser?");
                          }
                        }
                      } catch (e) {
                        cleanup();
                        reject(e);
                      }
                    }
                    triggerCopy(false);
                  });
                };
              }();
              clipboard.paste = function() {
                var _intercept = false;
                var _resolve;
                var _dataType;
                document.addEventListener("paste", function(e) {
                  if (_intercept) {
                    _intercept = false;
                    e.preventDefault();
                    var resolve = _resolve;
                    _resolve = null;
                    resolve(e.clipboardData.getData(_dataType));
                  }
                });
                return function(dataType) {
                  return new Promise(function(resolve, reject) {
                    _intercept = true;
                    _resolve = resolve;
                    _dataType = dataType || "text/plain";
                    try {
                      if (!document.execCommand("paste")) {
                        _intercept = false;
                        reject(new Error("Unable to paste. Pasting only works in Internet Explorer at the moment."));
                      }
                    } catch (e) {
                      _intercept = false;
                      reject(new Error(e));
                    }
                  });
                };
              }();
              if (typeof ClipboardEvent === "undefined" && typeof window.clipboardData !== "undefined" && typeof window.clipboardData.setData !== "undefined") {
                (function(a) {
                  function b(a2, b2) {
                    return function() {
                      a2.apply(b2, arguments);
                    };
                  }
                  function c(a2) {
                    if (typeof this != "object")
                      throw new TypeError("Promises must be constructed via new");
                    if (typeof a2 != "function")
                      throw new TypeError("not a function");
                    this._state = null, this._value = null, this._deferreds = [], i(a2, b(e, this), b(f, this));
                  }
                  function d(a2) {
                    var b2 = this;
                    return this._state === null ? void this._deferreds.push(a2) : void j(function() {
                      var c2 = b2._state ? a2.onFulfilled : a2.onRejected;
                      if (c2 === null)
                        return void (b2._state ? a2.resolve : a2.reject)(b2._value);
                      var d2;
                      try {
                        d2 = c2(b2._value);
                      } catch (e2) {
                        return void a2.reject(e2);
                      }
                      a2.resolve(d2);
                    });
                  }
                  function e(a2) {
                    try {
                      if (a2 === this)
                        throw new TypeError("A promise cannot be resolved with itself.");
                      if (a2 && (typeof a2 == "object" || typeof a2 == "function")) {
                        var c2 = a2.then;
                        if (typeof c2 == "function")
                          return void i(b(c2, a2), b(e, this), b(f, this));
                      }
                      this._state = true, this._value = a2, g.call(this);
                    } catch (d2) {
                      f.call(this, d2);
                    }
                  }
                  function f(a2) {
                    this._state = false, this._value = a2, g.call(this);
                  }
                  function g() {
                    for (var a2 = 0, b2 = this._deferreds.length; b2 > a2; a2++)
                      d.call(this, this._deferreds[a2]);
                    this._deferreds = null;
                  }
                  function h(a2, b2, c2, d2) {
                    this.onFulfilled = typeof a2 == "function" ? a2 : null, this.onRejected = typeof b2 == "function" ? b2 : null, this.resolve = c2, this.reject = d2;
                  }
                  function i(a2, b2, c2) {
                    var d2 = false;
                    try {
                      a2(function(a3) {
                        d2 || (d2 = true, b2(a3));
                      }, function(a3) {
                        d2 || (d2 = true, c2(a3));
                      });
                    } catch (e2) {
                      if (d2)
                        return;
                      d2 = true, c2(e2);
                    }
                  }
                  var j = c.immediateFn || typeof setImmediate == "function" && setImmediate || function(a2) {
                    setTimeout(a2, 1);
                  }, k = Array.isArray || function(a2) {
                    return Object.prototype.toString.call(a2) === "[object Array]";
                  };
                  c.prototype["catch"] = function(a2) {
                    return this.then(null, a2);
                  }, c.prototype.then = function(a2, b2) {
                    var e2 = this;
                    return new c(function(c2, f2) {
                      d.call(e2, new h(a2, b2, c2, f2));
                    });
                  }, c.all = function() {
                    var a2 = Array.prototype.slice.call(arguments.length === 1 && k(arguments[0]) ? arguments[0] : arguments);
                    return new c(function(b2, c2) {
                      function d2(f3, g2) {
                        try {
                          if (g2 && (typeof g2 == "object" || typeof g2 == "function")) {
                            var h2 = g2.then;
                            if (typeof h2 == "function")
                              return void h2.call(g2, function(a3) {
                                d2(f3, a3);
                              }, c2);
                          }
                          a2[f3] = g2, --e2 === 0 && b2(a2);
                        } catch (i2) {
                          c2(i2);
                        }
                      }
                      if (a2.length === 0)
                        return b2([]);
                      for (var e2 = a2.length, f2 = 0; f2 < a2.length; f2++)
                        d2(f2, a2[f2]);
                    });
                  }, c.resolve = function(a2) {
                    return a2 && typeof a2 == "object" && a2.constructor === c ? a2 : new c(function(b2) {
                      b2(a2);
                    });
                  }, c.reject = function(a2) {
                    return new c(function(b2, c2) {
                      c2(a2);
                    });
                  }, c.race = function(a2) {
                    return new c(function(b2, c2) {
                      for (var d2 = 0, e2 = a2.length; e2 > d2; d2++)
                        a2[d2].then(b2, c2);
                    });
                  }, module2.exports ? module2.exports = c : a.Promise || (a.Promise = c);
                })(this);
                clipboard.copy = function(data) {
                  return new Promise(function(resolve, reject) {
                    if (typeof data !== "string" && !("text/plain" in data)) {
                      throw new Error("You must provide a text/plain type.");
                    }
                    var strData = typeof data === "string" ? data : data["text/plain"];
                    var copySucceeded = window.clipboardData.setData("Text", strData);
                    if (copySucceeded) {
                      resolve();
                    } else {
                      reject(new Error("Copying was rejected."));
                    }
                  });
                };
                clipboard.paste = function() {
                  return new Promise(function(resolve, reject) {
                    var strData = window.clipboardData.getData("Text");
                    if (strData) {
                      resolve(strData);
                    } else {
                      reject(new Error("Pasting was rejected."));
                    }
                  });
                };
              }
              return clipboard;
            });
          }).call(this, __webpack_require__(76).setImmediate);
        },
        2: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return ElementTypeClass;
          });
          __webpack_require__.d(__webpack_exports__, "f", function() {
            return ElementTypeContext;
          });
          __webpack_require__.d(__webpack_exports__, "h", function() {
            return ElementTypeFunction;
          });
          __webpack_require__.d(__webpack_exports__, "g", function() {
            return ElementTypeForwardRef;
          });
          __webpack_require__.d(__webpack_exports__, "i", function() {
            return ElementTypeHostComponent;
          });
          __webpack_require__.d(__webpack_exports__, "j", function() {
            return ElementTypeMemo;
          });
          __webpack_require__.d(__webpack_exports__, "k", function() {
            return ElementTypeOtherOrUnknown;
          });
          __webpack_require__.d(__webpack_exports__, "l", function() {
            return ElementTypeProfiler;
          });
          __webpack_require__.d(__webpack_exports__, "m", function() {
            return ElementTypeRoot;
          });
          __webpack_require__.d(__webpack_exports__, "n", function() {
            return ElementTypeSuspense;
          });
          __webpack_require__.d(__webpack_exports__, "o", function() {
            return ElementTypeSuspenseList;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return ComponentFilterElementType;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return ComponentFilterDisplayName;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return ComponentFilterLocation;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return ComponentFilterHOC;
          });
          __webpack_require__.d(__webpack_exports__, "p", function() {
            return StrictMode;
          });
          const ElementTypeClass = 1;
          const ElementTypeContext = 2;
          const ElementTypeFunction = 5;
          const ElementTypeForwardRef = 6;
          const ElementTypeHostComponent = 7;
          const ElementTypeMemo = 8;
          const ElementTypeOtherOrUnknown = 9;
          const ElementTypeProfiler = 10;
          const ElementTypeRoot = 11;
          const ElementTypeSuspense = 12;
          const ElementTypeSuspenseList = 13;
          const ComponentFilterElementType = 1;
          const ComponentFilterDisplayName = 2;
          const ComponentFilterLocation = 3;
          const ComponentFilterHOC = 4;
          const StrictMode = 1;
        },
        203: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.r(__webpack_exports__);
          __webpack_require__.d(__webpack_exports__, "activate", function() {
            return activate;
          });
          __webpack_require__.d(__webpack_exports__, "createBridge", function() {
            return createBridge;
          });
          __webpack_require__.d(__webpack_exports__, "initialize", function() {
            return backend_initialize;
          });
          var events = __webpack_require__(37);
          var lodash_throttle = __webpack_require__(51);
          var lodash_throttle_default = /* @__PURE__ */ __webpack_require__.n(lodash_throttle);
          var constants = __webpack_require__(1);
          var storage = __webpack_require__(8);
          var esm = __webpack_require__(40);
          var object_assign = __webpack_require__(44);
          var object_assign_default = /* @__PURE__ */ __webpack_require__.n(object_assign);
          function getOwnerWindow(node) {
            if (!node.ownerDocument) {
              return null;
            }
            return node.ownerDocument.defaultView;
          }
          function getOwnerIframe(node) {
            const nodeWindow = getOwnerWindow(node);
            if (nodeWindow) {
              return nodeWindow.frameElement;
            }
            return null;
          }
          function getBoundingClientRectWithBorderOffset(node) {
            const dimensions = getElementDimensions(node);
            return mergeRectOffsets([node.getBoundingClientRect(), {
              top: dimensions.borderTop,
              left: dimensions.borderLeft,
              bottom: dimensions.borderBottom,
              right: dimensions.borderRight,
              width: 0,
              height: 0
            }]);
          }
          function mergeRectOffsets(rects) {
            return rects.reduce((previousRect, rect) => {
              if (previousRect == null) {
                return rect;
              }
              return {
                top: previousRect.top + rect.top,
                left: previousRect.left + rect.left,
                width: previousRect.width,
                height: previousRect.height,
                bottom: previousRect.bottom + rect.bottom,
                right: previousRect.right + rect.right
              };
            });
          }
          function getNestedBoundingClientRect(node, boundaryWindow) {
            const ownerIframe = getOwnerIframe(node);
            if (ownerIframe && ownerIframe !== boundaryWindow) {
              const rects = [node.getBoundingClientRect()];
              let currentIframe = ownerIframe;
              let onlyOneMore = false;
              while (currentIframe) {
                const rect = getBoundingClientRectWithBorderOffset(currentIframe);
                rects.push(rect);
                currentIframe = getOwnerIframe(currentIframe);
                if (onlyOneMore) {
                  break;
                }
                if (currentIframe && getOwnerWindow(currentIframe) === boundaryWindow) {
                  onlyOneMore = true;
                }
              }
              return mergeRectOffsets(rects);
            } else {
              return node.getBoundingClientRect();
            }
          }
          function getElementDimensions(domElement) {
            const calculatedStyle = window.getComputedStyle(domElement);
            return {
              borderLeft: parseInt(calculatedStyle.borderLeftWidth, 10),
              borderRight: parseInt(calculatedStyle.borderRightWidth, 10),
              borderTop: parseInt(calculatedStyle.borderTopWidth, 10),
              borderBottom: parseInt(calculatedStyle.borderBottomWidth, 10),
              marginLeft: parseInt(calculatedStyle.marginLeft, 10),
              marginRight: parseInt(calculatedStyle.marginRight, 10),
              marginTop: parseInt(calculatedStyle.marginTop, 10),
              marginBottom: parseInt(calculatedStyle.marginBottom, 10),
              paddingLeft: parseInt(calculatedStyle.paddingLeft, 10),
              paddingRight: parseInt(calculatedStyle.paddingRight, 10),
              paddingTop: parseInt(calculatedStyle.paddingTop, 10),
              paddingBottom: parseInt(calculatedStyle.paddingBottom, 10)
            };
          }
          class Overlay_OverlayRect {
            constructor(doc, container) {
              this.node = doc.createElement("div");
              this.border = doc.createElement("div");
              this.padding = doc.createElement("div");
              this.content = doc.createElement("div");
              this.border.style.borderColor = overlayStyles.border;
              this.padding.style.borderColor = overlayStyles.padding;
              this.content.style.backgroundColor = overlayStyles.background;
              object_assign_default()(this.node.style, {
                borderColor: overlayStyles.margin,
                pointerEvents: "none",
                position: "fixed"
              });
              this.node.style.zIndex = "10000000";
              this.node.appendChild(this.border);
              this.border.appendChild(this.padding);
              this.padding.appendChild(this.content);
              container.appendChild(this.node);
            }
            remove() {
              if (this.node.parentNode) {
                this.node.parentNode.removeChild(this.node);
              }
            }
            update(box, dims) {
              boxWrap(dims, "margin", this.node);
              boxWrap(dims, "border", this.border);
              boxWrap(dims, "padding", this.padding);
              object_assign_default()(this.content.style, {
                height: box.height - dims.borderTop - dims.borderBottom - dims.paddingTop - dims.paddingBottom + "px",
                width: box.width - dims.borderLeft - dims.borderRight - dims.paddingLeft - dims.paddingRight + "px"
              });
              object_assign_default()(this.node.style, {
                top: box.top - dims.marginTop + "px",
                left: box.left - dims.marginLeft + "px"
              });
            }
          }
          class Overlay_OverlayTip {
            constructor(doc, container) {
              this.tip = doc.createElement("div");
              object_assign_default()(this.tip.style, {
                display: "flex",
                flexFlow: "row nowrap",
                backgroundColor: "#333740",
                borderRadius: "2px",
                fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
                fontWeight: "bold",
                padding: "3px 5px",
                pointerEvents: "none",
                position: "fixed",
                fontSize: "12px",
                whiteSpace: "nowrap"
              });
              this.nameSpan = doc.createElement("span");
              this.tip.appendChild(this.nameSpan);
              object_assign_default()(this.nameSpan.style, {
                color: "#ee78e6",
                borderRight: "1px solid #aaaaaa",
                paddingRight: "0.5rem",
                marginRight: "0.5rem"
              });
              this.dimSpan = doc.createElement("span");
              this.tip.appendChild(this.dimSpan);
              object_assign_default()(this.dimSpan.style, {
                color: "#d7d7d7"
              });
              this.tip.style.zIndex = "10000000";
              container.appendChild(this.tip);
            }
            remove() {
              if (this.tip.parentNode) {
                this.tip.parentNode.removeChild(this.tip);
              }
            }
            updateText(name, width, height) {
              this.nameSpan.textContent = name;
              this.dimSpan.textContent = Math.round(width) + "px \xD7 " + Math.round(height) + "px";
            }
            updatePosition(dims, bounds) {
              const tipRect = this.tip.getBoundingClientRect();
              const tipPos = findTipPos(dims, bounds, {
                width: tipRect.width,
                height: tipRect.height
              });
              object_assign_default()(this.tip.style, tipPos.style);
            }
          }
          class Overlay_Overlay {
            constructor() {
              const currentWindow = window.__REACT_DEVTOOLS_TARGET_WINDOW__ || window;
              this.window = currentWindow;
              const tipBoundsWindow = window.__REACT_DEVTOOLS_TARGET_WINDOW__ || window;
              this.tipBoundsWindow = tipBoundsWindow;
              const doc = currentWindow.document;
              this.container = doc.createElement("div");
              this.container.style.zIndex = "10000000";
              this.tip = new Overlay_OverlayTip(doc, this.container);
              this.rects = [];
              doc.body.appendChild(this.container);
            }
            remove() {
              this.tip.remove();
              this.rects.forEach((rect) => {
                rect.remove();
              });
              this.rects.length = 0;
              if (this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
              }
            }
            inspect(nodes, name) {
              const elements = nodes.filter((node) => node.nodeType === Node.ELEMENT_NODE);
              while (this.rects.length > elements.length) {
                const rect = this.rects.pop();
                rect.remove();
              }
              if (elements.length === 0) {
                return;
              }
              while (this.rects.length < elements.length) {
                this.rects.push(new Overlay_OverlayRect(this.window.document, this.container));
              }
              const outerBox = {
                top: Number.POSITIVE_INFINITY,
                right: Number.NEGATIVE_INFINITY,
                bottom: Number.NEGATIVE_INFINITY,
                left: Number.POSITIVE_INFINITY
              };
              elements.forEach((element, index) => {
                const box = getNestedBoundingClientRect(element, this.window);
                const dims = getElementDimensions(element);
                outerBox.top = Math.min(outerBox.top, box.top - dims.marginTop);
                outerBox.right = Math.max(outerBox.right, box.left + box.width + dims.marginRight);
                outerBox.bottom = Math.max(outerBox.bottom, box.top + box.height + dims.marginBottom);
                outerBox.left = Math.min(outerBox.left, box.left - dims.marginLeft);
                const rect = this.rects[index];
                rect.update(box, dims);
              });
              if (!name) {
                name = elements[0].nodeName.toLowerCase();
                const node = elements[0];
                const hook = node.ownerDocument.defaultView.__REACT_DEVTOOLS_GLOBAL_HOOK__;
                if (hook != null && hook.rendererInterfaces != null) {
                  let ownerName = null;
                  for (const rendererInterface of hook.rendererInterfaces.values()) {
                    const id = rendererInterface.getFiberIDForNative(node, true);
                    if (id !== null) {
                      ownerName = rendererInterface.getDisplayNameForFiberID(id, true);
                      break;
                    }
                  }
                  if (ownerName) {
                    name += " (in " + ownerName + ")";
                  }
                }
              }
              this.tip.updateText(name, outerBox.right - outerBox.left, outerBox.bottom - outerBox.top);
              const tipBounds = getNestedBoundingClientRect(this.tipBoundsWindow.document.documentElement, this.window);
              this.tip.updatePosition({
                top: outerBox.top,
                left: outerBox.left,
                height: outerBox.bottom - outerBox.top,
                width: outerBox.right - outerBox.left
              }, {
                top: tipBounds.top + this.tipBoundsWindow.scrollY,
                left: tipBounds.left + this.tipBoundsWindow.scrollX,
                height: this.tipBoundsWindow.innerHeight,
                width: this.tipBoundsWindow.innerWidth
              });
            }
          }
          function findTipPos(dims, bounds, tipSize) {
            const tipHeight = Math.max(tipSize.height, 20);
            const tipWidth = Math.max(tipSize.width, 60);
            const margin = 5;
            let top;
            if (dims.top + dims.height + tipHeight <= bounds.top + bounds.height) {
              if (dims.top + dims.height < bounds.top + 0) {
                top = bounds.top + margin;
              } else {
                top = dims.top + dims.height + margin;
              }
            } else if (dims.top - tipHeight <= bounds.top + bounds.height) {
              if (dims.top - tipHeight - margin < bounds.top + margin) {
                top = bounds.top + margin;
              } else {
                top = dims.top - tipHeight - margin;
              }
            } else {
              top = bounds.top + bounds.height - tipHeight - margin;
            }
            let left = dims.left + margin;
            if (dims.left < bounds.left) {
              left = bounds.left + margin;
            }
            if (dims.left + tipWidth > bounds.left + bounds.width) {
              left = bounds.left + bounds.width - tipWidth - margin;
            }
            top += "px";
            left += "px";
            return {
              style: {
                top,
                left
              }
            };
          }
          function boxWrap(dims, what, node) {
            object_assign_default()(node.style, {
              borderTopWidth: dims[what + "Top"] + "px",
              borderLeftWidth: dims[what + "Left"] + "px",
              borderRightWidth: dims[what + "Right"] + "px",
              borderBottomWidth: dims[what + "Bottom"] + "px",
              borderStyle: "solid"
            });
          }
          const overlayStyles = {
            background: "rgba(120, 170, 210, 0.7)",
            padding: "rgba(77, 200, 0, 0.3)",
            margin: "rgba(255, 155, 0, 0.3)",
            border: "rgba(255, 200, 50, 0.3)"
          };
          const SHOW_DURATION = 2e3;
          let timeoutID = null;
          let overlay = null;
          function hideOverlay() {
            timeoutID = null;
            if (overlay !== null) {
              overlay.remove();
              overlay = null;
            }
          }
          function showOverlay(elements, componentName, hideAfterTimeout) {
            if (window.document == null) {
              return;
            }
            if (timeoutID !== null) {
              clearTimeout(timeoutID);
            }
            if (elements == null) {
              return;
            }
            if (overlay === null) {
              overlay = new Overlay_Overlay();
            }
            overlay.inspect(elements, componentName);
            if (hideAfterTimeout) {
              timeoutID = setTimeout(hideOverlay, SHOW_DURATION);
            }
          }
          let iframesListeningTo = /* @__PURE__ */ new Set();
          function setupHighlighter(bridge, agent) {
            bridge.addListener("clearNativeElementHighlight", clearNativeElementHighlight);
            bridge.addListener("highlightNativeElement", highlightNativeElement);
            bridge.addListener("shutdown", stopInspectingNative);
            bridge.addListener("startInspectingNative", startInspectingNative);
            bridge.addListener("stopInspectingNative", stopInspectingNative);
            function startInspectingNative() {
              registerListenersOnWindow(window);
            }
            function registerListenersOnWindow(window2) {
              if (window2 && typeof window2.addEventListener === "function") {
                window2.addEventListener("click", onClick, true);
                window2.addEventListener("mousedown", onMouseEvent, true);
                window2.addEventListener("mouseover", onMouseEvent, true);
                window2.addEventListener("mouseup", onMouseEvent, true);
                window2.addEventListener("pointerdown", onPointerDown, true);
                window2.addEventListener("pointerover", onPointerOver, true);
                window2.addEventListener("pointerup", onPointerUp, true);
              }
            }
            function stopInspectingNative() {
              hideOverlay();
              removeListenersOnWindow(window);
              iframesListeningTo.forEach(function(frame) {
                try {
                  removeListenersOnWindow(frame.contentWindow);
                } catch (error) {
                }
              });
              iframesListeningTo = /* @__PURE__ */ new Set();
            }
            function removeListenersOnWindow(window2) {
              if (window2 && typeof window2.removeEventListener === "function") {
                window2.removeEventListener("click", onClick, true);
                window2.removeEventListener("mousedown", onMouseEvent, true);
                window2.removeEventListener("mouseover", onMouseEvent, true);
                window2.removeEventListener("mouseup", onMouseEvent, true);
                window2.removeEventListener("pointerdown", onPointerDown, true);
                window2.removeEventListener("pointerover", onPointerOver, true);
                window2.removeEventListener("pointerup", onPointerUp, true);
              }
            }
            function clearNativeElementHighlight() {
              hideOverlay();
            }
            function highlightNativeElement({
              displayName,
              hideAfterTimeout,
              id,
              openNativeElementsPanel,
              rendererID,
              scrollIntoView
            }) {
              const renderer = agent.rendererInterfaces[rendererID];
              if (renderer == null) {
                console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
              }
              let nodes = null;
              if (renderer != null) {
                nodes = renderer.findNativeNodesForFiberID(id);
              }
              if (nodes != null && nodes[0] != null) {
                const node = nodes[0];
                if (scrollIntoView && typeof node.scrollIntoView === "function") {
                  node.scrollIntoView({
                    block: "nearest",
                    inline: "nearest"
                  });
                }
                showOverlay(nodes, displayName, hideAfterTimeout);
                if (openNativeElementsPanel) {
                  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0 = node;
                  bridge.send("syncSelectionToNativeElementsPanel");
                }
              } else {
                hideOverlay();
              }
            }
            function onClick(event) {
              event.preventDefault();
              event.stopPropagation();
              stopInspectingNative();
              bridge.send("stopInspectingNative", true);
            }
            function onMouseEvent(event) {
              event.preventDefault();
              event.stopPropagation();
            }
            function onPointerDown(event) {
              event.preventDefault();
              event.stopPropagation();
              selectFiberForNode(event.target);
            }
            function onPointerOver(event) {
              event.preventDefault();
              event.stopPropagation();
              const target = event.target;
              if (target.tagName === "IFRAME") {
                const iframe = target;
                try {
                  if (!iframesListeningTo.has(iframe)) {
                    const window2 = iframe.contentWindow;
                    registerListenersOnWindow(window2);
                    iframesListeningTo.add(iframe);
                  }
                } catch (error) {
                }
              }
              showOverlay([target], null, false);
              selectFiberForNode(target);
            }
            function onPointerUp(event) {
              event.preventDefault();
              event.stopPropagation();
            }
            const selectFiberForNode = lodash_throttle_default()(Object(esm["a"])((node) => {
              const id = agent.getIDForNode(node);
              if (id !== null) {
                bridge.send("selectFiber", id);
              }
            }), 200, {
              leading: false
            });
          }
          const OUTLINE_COLOR = "#f0f0f0";
          const COLORS = ["#37afa9", "#63b19e", "#80b393", "#97b488", "#abb67d", "#beb771", "#cfb965", "#dfba57", "#efbb49", "#febc38"];
          let canvas = null;
          function draw(nodeToData2) {
            if (canvas === null) {
              initialize();
            }
            const canvasFlow = canvas;
            canvasFlow.width = window.innerWidth;
            canvasFlow.height = window.innerHeight;
            const context = canvasFlow.getContext("2d");
            context.clearRect(0, 0, canvasFlow.width, canvasFlow.height);
            nodeToData2.forEach(({
              count,
              rect
            }) => {
              if (rect !== null) {
                const colorIndex = Math.min(COLORS.length - 1, count - 1);
                const color = COLORS[colorIndex];
                drawBorder(context, rect, color);
              }
            });
          }
          function drawBorder(context, rect, color) {
            const {
              height,
              left,
              top,
              width
            } = rect;
            context.lineWidth = 1;
            context.strokeStyle = OUTLINE_COLOR;
            context.strokeRect(left - 1, top - 1, width + 2, height + 2);
            context.lineWidth = 1;
            context.strokeStyle = OUTLINE_COLOR;
            context.strokeRect(left + 1, top + 1, width - 1, height - 1);
            context.strokeStyle = color;
            context.setLineDash([0]);
            context.lineWidth = 1;
            context.strokeRect(left, top, width - 1, height - 1);
            context.setLineDash([0]);
          }
          function destroy() {
            if (canvas !== null) {
              if (canvas.parentNode != null) {
                canvas.parentNode.removeChild(canvas);
              }
              canvas = null;
            }
          }
          function initialize() {
            canvas = window.document.createElement("canvas");
            canvas.style.cssText = `
    xx-background-color: red;
    xx-opacity: 0.5;
    bottom: 0;
    left: 0;
    pointer-events: none;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 1000000000;
  `;
            const root = window.document.documentElement;
            root.insertBefore(canvas, root.firstChild);
          }
          const DISPLAY_DURATION = 250;
          const MAX_DISPLAY_DURATION = 3e3;
          const REMEASUREMENT_AFTER_DURATION = 250;
          const getCurrentTime = typeof performance === "object" && typeof performance.now === "function" ? () => performance.now() : () => Date.now();
          const nodeToData = /* @__PURE__ */ new Map();
          let TraceUpdates_agent = null;
          let drawAnimationFrameID = null;
          let isEnabled = false;
          let redrawTimeoutID = null;
          function TraceUpdates_initialize(injectedAgent) {
            TraceUpdates_agent = injectedAgent;
            TraceUpdates_agent.addListener("traceUpdates", traceUpdates);
          }
          function toggleEnabled(value) {
            isEnabled = value;
            if (!isEnabled) {
              nodeToData.clear();
              if (drawAnimationFrameID !== null) {
                cancelAnimationFrame(drawAnimationFrameID);
                drawAnimationFrameID = null;
              }
              if (redrawTimeoutID !== null) {
                clearTimeout(redrawTimeoutID);
                redrawTimeoutID = null;
              }
              destroy();
            }
          }
          function traceUpdates(nodes) {
            if (!isEnabled) {
              return;
            }
            nodes.forEach((node) => {
              const data = nodeToData.get(node);
              const now = getCurrentTime();
              let lastMeasuredAt = data != null ? data.lastMeasuredAt : 0;
              let rect = data != null ? data.rect : null;
              if (rect === null || lastMeasuredAt + REMEASUREMENT_AFTER_DURATION < now) {
                lastMeasuredAt = now;
                rect = measureNode(node);
              }
              nodeToData.set(node, {
                count: data != null ? data.count + 1 : 1,
                expirationTime: data != null ? Math.min(now + MAX_DISPLAY_DURATION, data.expirationTime + DISPLAY_DURATION) : now + DISPLAY_DURATION,
                lastMeasuredAt,
                rect
              });
            });
            if (redrawTimeoutID !== null) {
              clearTimeout(redrawTimeoutID);
              redrawTimeoutID = null;
            }
            if (drawAnimationFrameID === null) {
              drawAnimationFrameID = requestAnimationFrame(prepareToDraw);
            }
          }
          function prepareToDraw() {
            drawAnimationFrameID = null;
            redrawTimeoutID = null;
            const now = getCurrentTime();
            let earliestExpiration = Number.MAX_VALUE;
            nodeToData.forEach((data, node) => {
              if (data.expirationTime < now) {
                nodeToData.delete(node);
              } else {
                earliestExpiration = Math.min(earliestExpiration, data.expirationTime);
              }
            });
            draw(nodeToData);
            if (earliestExpiration !== Number.MAX_VALUE) {
              redrawTimeoutID = setTimeout(prepareToDraw, earliestExpiration - now);
            }
          }
          function measureNode(node) {
            if (!node || typeof node.getBoundingClientRect !== "function") {
              return null;
            }
            const currentWindow = window.__REACT_DEVTOOLS_TARGET_WINDOW__ || window;
            return getNestedBoundingClientRect(node, currentWindow);
          }
          var backend_console = __webpack_require__(41);
          var src_bridge = __webpack_require__(33);
          var utils = __webpack_require__(16);
          function _defineProperty(obj, key, value) {
            if (key in obj) {
              Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
            } else {
              obj[key] = value;
            }
            return obj;
          }
          const debug = (methodName, ...args) => {
            if (constants["D"]) {
              console.log(`%cAgent %c${methodName}`, "color: purple; font-weight: bold;", "font-weight: bold;", ...args);
            }
          };
          class agent_Agent extends events["a"] {
            constructor(bridge) {
              super();
              _defineProperty(this, "_isProfiling", false);
              _defineProperty(this, "_recordChangeDescriptions", false);
              _defineProperty(this, "_rendererInterfaces", {});
              _defineProperty(this, "_persistedSelection", null);
              _defineProperty(this, "_persistedSelectionMatch", null);
              _defineProperty(this, "_traceUpdatesEnabled", false);
              _defineProperty(this, "clearErrorsAndWarnings", ({
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}"`);
                } else {
                  renderer.clearErrorsAndWarnings();
                }
              });
              _defineProperty(this, "clearErrorsForFiberID", ({
                id,
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}"`);
                } else {
                  renderer.clearErrorsForFiberID(id);
                }
              });
              _defineProperty(this, "clearWarningsForFiberID", ({
                id,
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}"`);
                } else {
                  renderer.clearWarningsForFiberID(id);
                }
              });
              _defineProperty(this, "copyElementPath", ({
                id,
                path,
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.copyElementPath(id, path);
                }
              });
              _defineProperty(this, "deletePath", ({
                hookID,
                id,
                path,
                rendererID,
                type
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.deletePath(type, id, hookID, path);
                }
              });
              _defineProperty(this, "getBridgeProtocol", () => {
                this._bridge.send("bridgeProtocol", src_bridge["b"]);
              });
              _defineProperty(this, "getProfilingData", ({
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}"`);
                }
                this._bridge.send("profilingData", renderer.getProfilingData());
              });
              _defineProperty(this, "getProfilingStatus", () => {
                this._bridge.send("profilingStatus", this._isProfiling);
              });
              _defineProperty(this, "getOwnersList", ({
                id,
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  const owners = renderer.getOwnersList(id);
                  this._bridge.send("ownersList", {
                    id,
                    owners
                  });
                }
              });
              _defineProperty(this, "inspectElement", ({
                forceFullData,
                id,
                path,
                rendererID,
                requestID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  this._bridge.send("inspectedElement", renderer.inspectElement(requestID, id, path, forceFullData));
                  if (this._persistedSelectionMatch === null || this._persistedSelectionMatch.id !== id) {
                    this._persistedSelection = null;
                    this._persistedSelectionMatch = null;
                    renderer.setTrackedPath(null);
                    this._throttledPersistSelection(rendererID, id);
                  }
                }
              });
              _defineProperty(this, "logElementToConsole", ({
                id,
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.logElementToConsole(id);
                }
              });
              _defineProperty(this, "overrideError", ({
                id,
                rendererID,
                forceError
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.overrideError(id, forceError);
                }
              });
              _defineProperty(this, "overrideSuspense", ({
                id,
                rendererID,
                forceFallback
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.overrideSuspense(id, forceFallback);
                }
              });
              _defineProperty(this, "overrideValueAtPath", ({
                hookID,
                id,
                path,
                rendererID,
                type,
                value
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.overrideValueAtPath(type, id, hookID, path, value);
                }
              });
              _defineProperty(this, "overrideContext", ({
                id,
                path,
                rendererID,
                wasForwarded,
                value
              }) => {
                if (!wasForwarded) {
                  this.overrideValueAtPath({
                    id,
                    path,
                    rendererID,
                    type: "context",
                    value
                  });
                }
              });
              _defineProperty(this, "overrideHookState", ({
                id,
                hookID,
                path,
                rendererID,
                wasForwarded,
                value
              }) => {
                if (!wasForwarded) {
                  this.overrideValueAtPath({
                    id,
                    path,
                    rendererID,
                    type: "hooks",
                    value
                  });
                }
              });
              _defineProperty(this, "overrideProps", ({
                id,
                path,
                rendererID,
                wasForwarded,
                value
              }) => {
                if (!wasForwarded) {
                  this.overrideValueAtPath({
                    id,
                    path,
                    rendererID,
                    type: "props",
                    value
                  });
                }
              });
              _defineProperty(this, "overrideState", ({
                id,
                path,
                rendererID,
                wasForwarded,
                value
              }) => {
                if (!wasForwarded) {
                  this.overrideValueAtPath({
                    id,
                    path,
                    rendererID,
                    type: "state",
                    value
                  });
                }
              });
              _defineProperty(this, "reloadAndProfile", (recordChangeDescriptions) => {
                Object(storage["e"])(constants["t"], "true");
                Object(storage["e"])(constants["s"], recordChangeDescriptions ? "true" : "false");
                this._bridge.send("reloadAppForProfiling");
              });
              _defineProperty(this, "renamePath", ({
                hookID,
                id,
                newPath,
                oldPath,
                rendererID,
                type
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.renamePath(type, id, hookID, oldPath, newPath);
                }
              });
              _defineProperty(this, "setTraceUpdatesEnabled", (traceUpdatesEnabled) => {
                this._traceUpdatesEnabled = traceUpdatesEnabled;
                toggleEnabled(traceUpdatesEnabled);
                for (const rendererID in this._rendererInterfaces) {
                  const renderer = this._rendererInterfaces[rendererID];
                  renderer.setTraceUpdatesEnabled(traceUpdatesEnabled);
                }
              });
              _defineProperty(this, "syncSelectionFromNativeElementsPanel", () => {
                const target = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0;
                if (target == null) {
                  return;
                }
                this.selectNode(target);
              });
              _defineProperty(this, "shutdown", () => {
                this.emit("shutdown");
              });
              _defineProperty(this, "startProfiling", (recordChangeDescriptions) => {
                this._recordChangeDescriptions = recordChangeDescriptions;
                this._isProfiling = true;
                for (const rendererID in this._rendererInterfaces) {
                  const renderer = this._rendererInterfaces[rendererID];
                  renderer.startProfiling(recordChangeDescriptions);
                }
                this._bridge.send("profilingStatus", this._isProfiling);
              });
              _defineProperty(this, "stopProfiling", () => {
                this._isProfiling = false;
                this._recordChangeDescriptions = false;
                for (const rendererID in this._rendererInterfaces) {
                  const renderer = this._rendererInterfaces[rendererID];
                  renderer.stopProfiling();
                }
                this._bridge.send("profilingStatus", this._isProfiling);
              });
              _defineProperty(this, "storeAsGlobal", ({
                count,
                id,
                path,
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.storeAsGlobal(id, path, count);
                }
              });
              _defineProperty(this, "updateConsolePatchSettings", ({
                appendComponentStack,
                breakOnConsoleErrors,
                showInlineWarningsAndErrors,
                hideConsoleLogsInStrictMode,
                browserTheme
              }) => {
                Object(backend_console["a"])({
                  appendComponentStack,
                  breakOnConsoleErrors,
                  showInlineWarningsAndErrors,
                  hideConsoleLogsInStrictMode,
                  browserTheme
                });
              });
              _defineProperty(this, "updateComponentFilters", (componentFilters) => {
                for (const rendererID in this._rendererInterfaces) {
                  const renderer = this._rendererInterfaces[rendererID];
                  renderer.updateComponentFilters(componentFilters);
                }
              });
              _defineProperty(this, "viewAttributeSource", ({
                id,
                path,
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.prepareViewAttributeSource(id, path);
                }
              });
              _defineProperty(this, "viewElementSource", ({
                id,
                rendererID
              }) => {
                const renderer = this._rendererInterfaces[rendererID];
                if (renderer == null) {
                  console.warn(`Invalid renderer id "${rendererID}" for element "${id}"`);
                } else {
                  renderer.prepareViewElementSource(id);
                }
              });
              _defineProperty(this, "onTraceUpdates", (nodes) => {
                this.emit("traceUpdates", nodes);
              });
              _defineProperty(this, "onFastRefreshScheduled", () => {
                if (constants["D"]) {
                  debug("onFastRefreshScheduled");
                }
                this._bridge.send("fastRefreshScheduled");
              });
              _defineProperty(this, "onHookOperations", (operations) => {
                if (constants["D"]) {
                  debug("onHookOperations", `(${operations.length}) [${operations.join(", ")}]`);
                }
                this._bridge.send("operations", operations);
                if (this._persistedSelection !== null) {
                  const rendererID = operations[0];
                  if (this._persistedSelection.rendererID === rendererID) {
                    const renderer = this._rendererInterfaces[rendererID];
                    if (renderer == null) {
                      console.warn(`Invalid renderer id "${rendererID}"`);
                    } else {
                      const prevMatch = this._persistedSelectionMatch;
                      const nextMatch = renderer.getBestMatchForTrackedPath();
                      this._persistedSelectionMatch = nextMatch;
                      const prevMatchID = prevMatch !== null ? prevMatch.id : null;
                      const nextMatchID = nextMatch !== null ? nextMatch.id : null;
                      if (prevMatchID !== nextMatchID) {
                        if (nextMatchID !== null) {
                          this._bridge.send("selectFiber", nextMatchID);
                        }
                      }
                      if (nextMatch !== null && nextMatch.isFullMatch) {
                        this._persistedSelection = null;
                        this._persistedSelectionMatch = null;
                        renderer.setTrackedPath(null);
                      }
                    }
                  }
                }
              });
              _defineProperty(this, "_throttledPersistSelection", lodash_throttle_default()((rendererID, id) => {
                const renderer = this._rendererInterfaces[rendererID];
                const path = renderer != null ? renderer.getPathForElement(id) : null;
                if (path !== null) {
                  Object(storage["e"])(constants["r"], JSON.stringify({
                    rendererID,
                    path
                  }));
                } else {
                  Object(storage["d"])(constants["r"]);
                }
              }, 1e3));
              if (Object(storage["c"])(constants["t"]) === "true") {
                this._recordChangeDescriptions = Object(storage["c"])(constants["s"]) === "true";
                this._isProfiling = true;
                Object(storage["d"])(constants["s"]);
                Object(storage["d"])(constants["t"]);
              }
              const persistedSelectionString = Object(storage["c"])(constants["r"]);
              if (persistedSelectionString != null) {
                this._persistedSelection = JSON.parse(persistedSelectionString);
              }
              this._bridge = bridge;
              bridge.addListener("clearErrorsAndWarnings", this.clearErrorsAndWarnings);
              bridge.addListener("clearErrorsForFiberID", this.clearErrorsForFiberID);
              bridge.addListener("clearWarningsForFiberID", this.clearWarningsForFiberID);
              bridge.addListener("copyElementPath", this.copyElementPath);
              bridge.addListener("deletePath", this.deletePath);
              bridge.addListener("getBridgeProtocol", this.getBridgeProtocol);
              bridge.addListener("getProfilingData", this.getProfilingData);
              bridge.addListener("getProfilingStatus", this.getProfilingStatus);
              bridge.addListener("getOwnersList", this.getOwnersList);
              bridge.addListener("inspectElement", this.inspectElement);
              bridge.addListener("logElementToConsole", this.logElementToConsole);
              bridge.addListener("overrideError", this.overrideError);
              bridge.addListener("overrideSuspense", this.overrideSuspense);
              bridge.addListener("overrideValueAtPath", this.overrideValueAtPath);
              bridge.addListener("reloadAndProfile", this.reloadAndProfile);
              bridge.addListener("renamePath", this.renamePath);
              bridge.addListener("setTraceUpdatesEnabled", this.setTraceUpdatesEnabled);
              bridge.addListener("startProfiling", this.startProfiling);
              bridge.addListener("stopProfiling", this.stopProfiling);
              bridge.addListener("storeAsGlobal", this.storeAsGlobal);
              bridge.addListener("syncSelectionFromNativeElementsPanel", this.syncSelectionFromNativeElementsPanel);
              bridge.addListener("shutdown", this.shutdown);
              bridge.addListener("updateConsolePatchSettings", this.updateConsolePatchSettings);
              bridge.addListener("updateComponentFilters", this.updateComponentFilters);
              bridge.addListener("viewAttributeSource", this.viewAttributeSource);
              bridge.addListener("viewElementSource", this.viewElementSource);
              bridge.addListener("overrideContext", this.overrideContext);
              bridge.addListener("overrideHookState", this.overrideHookState);
              bridge.addListener("overrideProps", this.overrideProps);
              bridge.addListener("overrideState", this.overrideState);
              if (this._isProfiling) {
                bridge.send("profilingStatus", true);
              }
              this._bridge.send("bridgeProtocol", src_bridge["b"]);
              let isBackendStorageAPISupported = false;
              try {
                localStorage.getItem("test");
                isBackendStorageAPISupported = true;
              } catch (error) {
              }
              bridge.send("isBackendStorageAPISupported", isBackendStorageAPISupported);
              bridge.send("isSynchronousXHRSupported", Object(utils["h"])());
              setupHighlighter(bridge, this);
              TraceUpdates_initialize(this);
            }
            get rendererInterfaces() {
              return this._rendererInterfaces;
            }
            getInstanceAndStyle({
              id,
              rendererID
            }) {
              const renderer = this._rendererInterfaces[rendererID];
              if (renderer == null) {
                console.warn(`Invalid renderer id "${rendererID}"`);
                return null;
              }
              return renderer.getInstanceAndStyle(id);
            }
            getIDForNode(node) {
              for (const rendererID in this._rendererInterfaces) {
                const renderer = this._rendererInterfaces[rendererID];
                try {
                  const id = renderer.getFiberIDForNative(node, true);
                  if (id !== null) {
                    return id;
                  }
                } catch (error) {
                }
              }
              return null;
            }
            selectNode(target) {
              const id = this.getIDForNode(target);
              if (id !== null) {
                this._bridge.send("selectFiber", id);
              }
            }
            setRendererInterface(rendererID, rendererInterface) {
              this._rendererInterfaces[rendererID] = rendererInterface;
              if (this._isProfiling) {
                rendererInterface.startProfiling(this._recordChangeDescriptions);
              }
              rendererInterface.setTraceUpdatesEnabled(this._traceUpdatesEnabled);
              const selection = this._persistedSelection;
              if (selection !== null && selection.rendererID === rendererID) {
                rendererInterface.setTrackedPath(selection.path);
              }
            }
            onUnsupportedRenderer(rendererID) {
              this._bridge.send("unsupportedRendererVersion", rendererID);
            }
          }
          var backend_renderer = __webpack_require__(67);
          var types = __webpack_require__(2);
          var src_utils = __webpack_require__(3);
          function decorate(object, attr, fn) {
            const old = object[attr];
            object[attr] = function(instance) {
              return fn.call(this, old, arguments);
            };
            return old;
          }
          function decorateMany(source, fns) {
            const olds = {};
            for (const name in fns) {
              olds[name] = decorate(source, name, fns[name]);
            }
            return olds;
          }
          function restoreMany(source, olds) {
            for (const name in olds) {
              source[name] = olds[name];
            }
          }
          function forceUpdate(instance) {
            if (typeof instance.forceUpdate === "function") {
              instance.forceUpdate();
            } else if (instance.updater != null && typeof instance.updater.enqueueForceUpdate === "function") {
              instance.updater.enqueueForceUpdate(this, () => {
              }, "forceUpdate");
            }
          }
          function getData(internalInstance) {
            let displayName = null;
            let key = null;
            if (internalInstance._currentElement != null) {
              if (internalInstance._currentElement.key) {
                key = String(internalInstance._currentElement.key);
              }
              const elementType = internalInstance._currentElement.type;
              if (typeof elementType === "string") {
                displayName = elementType;
              } else if (typeof elementType === "function") {
                displayName = Object(src_utils["i"])(elementType);
              }
            }
            return {
              displayName,
              key
            };
          }
          function getElementType(internalInstance) {
            if (internalInstance._currentElement != null) {
              const elementType = internalInstance._currentElement.type;
              if (typeof elementType === "function") {
                const publicInstance = internalInstance.getPublicInstance();
                if (publicInstance !== null) {
                  return types["e"];
                } else {
                  return types["h"];
                }
              } else if (typeof elementType === "string") {
                return types["i"];
              }
            }
            return types["k"];
          }
          function getChildren(internalInstance) {
            const children = [];
            if (typeof internalInstance !== "object") {
            } else if (internalInstance._currentElement === null || internalInstance._currentElement === false) {
            } else if (internalInstance._renderedComponent) {
              const child = internalInstance._renderedComponent;
              if (getElementType(child) !== types["k"]) {
                children.push(child);
              }
            } else if (internalInstance._renderedChildren) {
              const renderedChildren = internalInstance._renderedChildren;
              for (const name in renderedChildren) {
                const child = renderedChildren[name];
                if (getElementType(child) !== types["k"]) {
                  children.push(child);
                }
              }
            }
            return children;
          }
          function renderer_attach(hook, rendererID, renderer, global) {
            const idToInternalInstanceMap = /* @__PURE__ */ new Map();
            const internalInstanceToIDMap = /* @__PURE__ */ new WeakMap();
            const internalInstanceToRootIDMap = /* @__PURE__ */ new WeakMap();
            let getInternalIDForNative = null;
            let findNativeNodeForInternalID;
            if (renderer.ComponentTree) {
              getInternalIDForNative = (node, findNearestUnfilteredAncestor) => {
                const internalInstance = renderer.ComponentTree.getClosestInstanceFromNode(node);
                return internalInstanceToIDMap.get(internalInstance) || null;
              };
              findNativeNodeForInternalID = (id) => {
                const internalInstance = idToInternalInstanceMap.get(id);
                return renderer.ComponentTree.getNodeFromInstance(internalInstance);
              };
            } else if (renderer.Mount.getID && renderer.Mount.getNode) {
              getInternalIDForNative = (node, findNearestUnfilteredAncestor) => {
                return null;
              };
              findNativeNodeForInternalID = (id) => {
                return null;
              };
            }
            function getDisplayNameForFiberID(id) {
              const internalInstance = idToInternalInstanceMap.get(id);
              return internalInstance ? getData(internalInstance).displayName : null;
            }
            function getID(internalInstance) {
              if (typeof internalInstance !== "object" || internalInstance === null) {
                throw new Error("Invalid internal instance: " + internalInstance);
              }
              if (!internalInstanceToIDMap.has(internalInstance)) {
                const id = Object(src_utils["p"])();
                internalInstanceToIDMap.set(internalInstance, id);
                idToInternalInstanceMap.set(id, internalInstance);
              }
              return internalInstanceToIDMap.get(internalInstance);
            }
            function areEqualArrays(a, b) {
              if (a.length !== b.length) {
                return false;
              }
              for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                  return false;
                }
              }
              return true;
            }
            let parentIDStack = [];
            let oldReconcilerMethods = null;
            if (renderer.Reconciler) {
              oldReconcilerMethods = decorateMany(renderer.Reconciler, {
                mountComponent(fn, args) {
                  const internalInstance = args[0];
                  const hostContainerInfo = args[3];
                  if (getElementType(internalInstance) === types["k"]) {
                    return fn.apply(this, args);
                  }
                  if (hostContainerInfo._topLevelWrapper === void 0) {
                    return fn.apply(this, args);
                  }
                  const id = getID(internalInstance);
                  const parentID = parentIDStack.length > 0 ? parentIDStack[parentIDStack.length - 1] : 0;
                  recordMount(internalInstance, id, parentID);
                  parentIDStack.push(id);
                  internalInstanceToRootIDMap.set(internalInstance, getID(hostContainerInfo._topLevelWrapper));
                  try {
                    const result = fn.apply(this, args);
                    parentIDStack.pop();
                    return result;
                  } catch (err) {
                    parentIDStack = [];
                    throw err;
                  } finally {
                    if (parentIDStack.length === 0) {
                      const rootID = internalInstanceToRootIDMap.get(internalInstance);
                      if (rootID === void 0) {
                        throw new Error("Expected to find root ID.");
                      }
                      flushPendingEvents(rootID);
                    }
                  }
                },
                performUpdateIfNecessary(fn, args) {
                  const internalInstance = args[0];
                  if (getElementType(internalInstance) === types["k"]) {
                    return fn.apply(this, args);
                  }
                  const id = getID(internalInstance);
                  parentIDStack.push(id);
                  const prevChildren = getChildren(internalInstance);
                  try {
                    const result = fn.apply(this, args);
                    const nextChildren = getChildren(internalInstance);
                    if (!areEqualArrays(prevChildren, nextChildren)) {
                      recordReorder(internalInstance, id, nextChildren);
                    }
                    parentIDStack.pop();
                    return result;
                  } catch (err) {
                    parentIDStack = [];
                    throw err;
                  } finally {
                    if (parentIDStack.length === 0) {
                      const rootID = internalInstanceToRootIDMap.get(internalInstance);
                      if (rootID === void 0) {
                        throw new Error("Expected to find root ID.");
                      }
                      flushPendingEvents(rootID);
                    }
                  }
                },
                receiveComponent(fn, args) {
                  const internalInstance = args[0];
                  if (getElementType(internalInstance) === types["k"]) {
                    return fn.apply(this, args);
                  }
                  const id = getID(internalInstance);
                  parentIDStack.push(id);
                  const prevChildren = getChildren(internalInstance);
                  try {
                    const result = fn.apply(this, args);
                    const nextChildren = getChildren(internalInstance);
                    if (!areEqualArrays(prevChildren, nextChildren)) {
                      recordReorder(internalInstance, id, nextChildren);
                    }
                    parentIDStack.pop();
                    return result;
                  } catch (err) {
                    parentIDStack = [];
                    throw err;
                  } finally {
                    if (parentIDStack.length === 0) {
                      const rootID = internalInstanceToRootIDMap.get(internalInstance);
                      if (rootID === void 0) {
                        throw new Error("Expected to find root ID.");
                      }
                      flushPendingEvents(rootID);
                    }
                  }
                },
                unmountComponent(fn, args) {
                  const internalInstance = args[0];
                  if (getElementType(internalInstance) === types["k"]) {
                    return fn.apply(this, args);
                  }
                  const id = getID(internalInstance);
                  parentIDStack.push(id);
                  try {
                    const result = fn.apply(this, args);
                    parentIDStack.pop();
                    recordUnmount(internalInstance, id);
                    return result;
                  } catch (err) {
                    parentIDStack = [];
                    throw err;
                  } finally {
                    if (parentIDStack.length === 0) {
                      const rootID = internalInstanceToRootIDMap.get(internalInstance);
                      if (rootID === void 0) {
                        throw new Error("Expected to find root ID.");
                      }
                      flushPendingEvents(rootID);
                    }
                  }
                }
              });
            }
            function cleanup() {
              if (oldReconcilerMethods !== null) {
                if (renderer.Component) {
                  restoreMany(renderer.Component.Mixin, oldReconcilerMethods);
                } else {
                  restoreMany(renderer.Reconciler, oldReconcilerMethods);
                }
              }
              oldReconcilerMethods = null;
            }
            function recordMount(internalInstance, id, parentID) {
              const isRoot = parentID === 0;
              if (constants["D"]) {
                console.log("%crecordMount()", "color: green; font-weight: bold;", id, getData(internalInstance).displayName);
              }
              if (isRoot) {
                const hasOwnerMetadata = internalInstance._currentElement != null && internalInstance._currentElement._owner != null;
                pushOperation(constants["v"]);
                pushOperation(id);
                pushOperation(types["m"]);
                pushOperation(0);
                pushOperation(0);
                pushOperation(0);
                pushOperation(hasOwnerMetadata ? 1 : 0);
              } else {
                const type = getElementType(internalInstance);
                const {
                  displayName,
                  key
                } = getData(internalInstance);
                const ownerID = internalInstance._currentElement != null && internalInstance._currentElement._owner != null ? getID(internalInstance._currentElement._owner) : 0;
                const displayNameStringID = getStringID(displayName);
                const keyStringID = getStringID(key);
                pushOperation(constants["v"]);
                pushOperation(id);
                pushOperation(type);
                pushOperation(parentID);
                pushOperation(ownerID);
                pushOperation(displayNameStringID);
                pushOperation(keyStringID);
              }
            }
            function recordReorder(internalInstance, id, nextChildren) {
              pushOperation(constants["y"]);
              pushOperation(id);
              const nextChildIDs = nextChildren.map(getID);
              pushOperation(nextChildIDs.length);
              for (let i = 0; i < nextChildIDs.length; i++) {
                pushOperation(nextChildIDs[i]);
              }
            }
            function recordUnmount(internalInstance, id) {
              pendingUnmountedIDs.push(id);
              idToInternalInstanceMap.delete(id);
            }
            function crawlAndRecordInitialMounts(id, parentID, rootID) {
              if (constants["D"]) {
                console.group("crawlAndRecordInitialMounts() id:", id);
              }
              const internalInstance = idToInternalInstanceMap.get(id);
              if (internalInstance != null) {
                internalInstanceToRootIDMap.set(internalInstance, rootID);
                recordMount(internalInstance, id, parentID);
                getChildren(internalInstance).forEach((child) => crawlAndRecordInitialMounts(getID(child), id, rootID));
              }
              if (constants["D"]) {
                console.groupEnd();
              }
            }
            function flushInitialOperations() {
              const roots = renderer.Mount._instancesByReactRootID || renderer.Mount._instancesByContainerID;
              for (const key in roots) {
                const internalInstance = roots[key];
                const id = getID(internalInstance);
                crawlAndRecordInitialMounts(id, 0, id);
                flushPendingEvents(id);
              }
            }
            const pendingOperations = [];
            const pendingStringTable = /* @__PURE__ */ new Map();
            let pendingUnmountedIDs = [];
            let pendingStringTableLength = 0;
            let pendingUnmountedRootID = null;
            function flushPendingEvents(rootID) {
              if (pendingOperations.length === 0 && pendingUnmountedIDs.length === 0 && pendingUnmountedRootID === null) {
                return;
              }
              const numUnmountIDs = pendingUnmountedIDs.length + (pendingUnmountedRootID === null ? 0 : 1);
              const operations = new Array(2 + 1 + pendingStringTableLength + (numUnmountIDs > 0 ? 2 + numUnmountIDs : 0) + pendingOperations.length);
              let i = 0;
              operations[i++] = rendererID;
              operations[i++] = rootID;
              operations[i++] = pendingStringTableLength;
              pendingStringTable.forEach((value, key) => {
                operations[i++] = key.length;
                const encodedKey = Object(src_utils["x"])(key);
                for (let j = 0; j < encodedKey.length; j++) {
                  operations[i + j] = encodedKey[j];
                }
                i += key.length;
              });
              if (numUnmountIDs > 0) {
                operations[i++] = constants["w"];
                operations[i++] = numUnmountIDs;
                for (let j = 0; j < pendingUnmountedIDs.length; j++) {
                  operations[i++] = pendingUnmountedIDs[j];
                }
                if (pendingUnmountedRootID !== null) {
                  operations[i] = pendingUnmountedRootID;
                  i++;
                }
              }
              for (let j = 0; j < pendingOperations.length; j++) {
                operations[i + j] = pendingOperations[j];
              }
              i += pendingOperations.length;
              if (constants["D"]) {
                Object(src_utils["q"])(operations);
              }
              hook.emit("operations", operations);
              pendingOperations.length = 0;
              pendingUnmountedIDs = [];
              pendingUnmountedRootID = null;
              pendingStringTable.clear();
              pendingStringTableLength = 0;
            }
            function pushOperation(op) {
              if (false) {
              }
              pendingOperations.push(op);
            }
            function getStringID(str) {
              if (str === null) {
                return 0;
              }
              const existingID = pendingStringTable.get(str);
              if (existingID !== void 0) {
                return existingID;
              }
              const stringID = pendingStringTable.size + 1;
              pendingStringTable.set(str, stringID);
              pendingStringTableLength += str.length + 1;
              return stringID;
            }
            let currentlyInspectedElementID = null;
            let currentlyInspectedPaths = {};
            function mergeInspectedPaths(path) {
              let current = currentlyInspectedPaths;
              path.forEach((key) => {
                if (!current[key]) {
                  current[key] = {};
                }
                current = current[key];
              });
            }
            function createIsPathAllowed(key) {
              return function isPathAllowed(path) {
                let current = currentlyInspectedPaths[key];
                if (!current) {
                  return false;
                }
                for (let i = 0; i < path.length; i++) {
                  current = current[path[i]];
                  if (!current) {
                    return false;
                  }
                }
                return true;
              };
            }
            function getInstanceAndStyle(id) {
              let instance = null;
              let style = null;
              const internalInstance = idToInternalInstanceMap.get(id);
              if (internalInstance != null) {
                instance = internalInstance._instance || null;
                const element = internalInstance._currentElement;
                if (element != null && element.props != null) {
                  style = element.props.style || null;
                }
              }
              return {
                instance,
                style
              };
            }
            function updateSelectedElement(id) {
              const internalInstance = idToInternalInstanceMap.get(id);
              if (internalInstance == null) {
                console.warn(`Could not find instance with id "${id}"`);
                return;
              }
              switch (getElementType(internalInstance)) {
                case types["e"]:
                  global.$r = internalInstance._instance;
                  break;
                case types["h"]:
                  const element = internalInstance._currentElement;
                  if (element == null) {
                    console.warn(`Could not find element with id "${id}"`);
                    return;
                  }
                  global.$r = {
                    props: element.props,
                    type: element.type
                  };
                  break;
                default:
                  global.$r = null;
                  break;
              }
            }
            function storeAsGlobal(id, path, count) {
              const inspectedElement = inspectElementRaw(id);
              if (inspectedElement !== null) {
                const value = Object(src_utils["l"])(inspectedElement, path);
                const key = `$reactTemp${count}`;
                window[key] = value;
                console.log(key);
                console.log(value);
              }
            }
            function copyElementPath(id, path) {
              const inspectedElement = inspectElementRaw(id);
              if (inspectedElement !== null) {
                Object(utils["b"])(Object(src_utils["l"])(inspectedElement, path));
              }
            }
            function inspectElement(requestID, id, path, forceFullData) {
              if (forceFullData || currentlyInspectedElementID !== id) {
                currentlyInspectedElementID = id;
                currentlyInspectedPaths = {};
              }
              const inspectedElement = inspectElementRaw(id);
              if (inspectedElement === null) {
                return {
                  id,
                  responseID: requestID,
                  type: "not-found"
                };
              }
              if (path !== null) {
                mergeInspectedPaths(path);
              }
              updateSelectedElement(id);
              inspectedElement.context = Object(utils["a"])(inspectedElement.context, createIsPathAllowed("context"));
              inspectedElement.props = Object(utils["a"])(inspectedElement.props, createIsPathAllowed("props"));
              inspectedElement.state = Object(utils["a"])(inspectedElement.state, createIsPathAllowed("state"));
              return {
                id,
                responseID: requestID,
                type: "full-data",
                value: inspectedElement
              };
            }
            function inspectElementRaw(id) {
              const internalInstance = idToInternalInstanceMap.get(id);
              if (internalInstance == null) {
                return null;
              }
              const {
                displayName,
                key
              } = getData(internalInstance);
              const type = getElementType(internalInstance);
              let context = null;
              let owners = null;
              let props = null;
              let state = null;
              let source = null;
              const element = internalInstance._currentElement;
              if (element !== null) {
                props = element.props;
                source = element._source != null ? element._source : null;
                let owner = element._owner;
                if (owner) {
                  owners = [];
                  while (owner != null) {
                    owners.push({
                      displayName: getData(owner).displayName || "Unknown",
                      id: getID(owner),
                      key: element.key,
                      type: getElementType(owner)
                    });
                    if (owner._currentElement) {
                      owner = owner._currentElement._owner;
                    }
                  }
                }
              }
              const publicInstance = internalInstance._instance;
              if (publicInstance != null) {
                context = publicInstance.context || null;
                state = publicInstance.state || null;
              }
              const errors = [];
              const warnings = [];
              return {
                id,
                canEditHooks: false,
                canEditFunctionProps: false,
                canEditHooksAndDeletePaths: false,
                canEditHooksAndRenamePaths: false,
                canEditFunctionPropsDeletePaths: false,
                canEditFunctionPropsRenamePaths: false,
                canToggleError: false,
                isErrored: false,
                targetErrorBoundaryID: null,
                canToggleSuspense: false,
                canViewSource: type === types["e"] || type === types["h"],
                hasLegacyContext: true,
                displayName,
                type,
                key: key != null ? key : null,
                context,
                hooks: null,
                props,
                state,
                errors,
                warnings,
                owners,
                source,
                rootType: null,
                rendererPackageName: null,
                rendererVersion: null,
                plugins: {
                  stylex: null
                }
              };
            }
            function logElementToConsole(id) {
              const result = inspectElementRaw(id);
              if (result === null) {
                console.warn(`Could not find element with id "${id}"`);
                return;
              }
              const supportsGroup = typeof console.groupCollapsed === "function";
              if (supportsGroup) {
                console.groupCollapsed(`[Click to expand] %c<${result.displayName || "Component"} />`, "color: var(--dom-tag-name-color); font-weight: normal;");
              }
              if (result.props !== null) {
                console.log("Props:", result.props);
              }
              if (result.state !== null) {
                console.log("State:", result.state);
              }
              if (result.context !== null) {
                console.log("Context:", result.context);
              }
              const nativeNode = findNativeNodeForInternalID(id);
              if (nativeNode !== null) {
                console.log("Node:", nativeNode);
              }
              if (window.chrome || /firefox/i.test(navigator.userAgent)) {
                console.log("Right-click any value to save it as a global variable for further inspection.");
              }
              if (supportsGroup) {
                console.groupEnd();
              }
            }
            function prepareViewAttributeSource(id, path) {
              const inspectedElement = inspectElementRaw(id);
              if (inspectedElement !== null) {
                window.$attribute = Object(src_utils["l"])(inspectedElement, path);
              }
            }
            function prepareViewElementSource(id) {
              const internalInstance = idToInternalInstanceMap.get(id);
              if (internalInstance == null) {
                console.warn(`Could not find instance with id "${id}"`);
                return;
              }
              const element = internalInstance._currentElement;
              if (element == null) {
                console.warn(`Could not find element with id "${id}"`);
                return;
              }
              global.$type = element.type;
            }
            function deletePath(type, id, hookID, path) {
              const internalInstance = idToInternalInstanceMap.get(id);
              if (internalInstance != null) {
                const publicInstance = internalInstance._instance;
                if (publicInstance != null) {
                  switch (type) {
                    case "context":
                      Object(src_utils["a"])(publicInstance.context, path);
                      forceUpdate(publicInstance);
                      break;
                    case "hooks":
                      throw new Error("Hooks not supported by this renderer");
                    case "props":
                      const element = internalInstance._currentElement;
                      internalInstance._currentElement = __spreadProps(__spreadValues({}, element), {
                        props: Object(utils["c"])(element.props, path)
                      });
                      forceUpdate(publicInstance);
                      break;
                    case "state":
                      Object(src_utils["a"])(publicInstance.state, path);
                      forceUpdate(publicInstance);
                      break;
                  }
                }
              }
            }
            function renamePath(type, id, hookID, oldPath, newPath) {
              const internalInstance = idToInternalInstanceMap.get(id);
              if (internalInstance != null) {
                const publicInstance = internalInstance._instance;
                if (publicInstance != null) {
                  switch (type) {
                    case "context":
                      Object(src_utils["r"])(publicInstance.context, oldPath, newPath);
                      forceUpdate(publicInstance);
                      break;
                    case "hooks":
                      throw new Error("Hooks not supported by this renderer");
                    case "props":
                      const element = internalInstance._currentElement;
                      internalInstance._currentElement = __spreadProps(__spreadValues({}, element), {
                        props: Object(utils["d"])(element.props, oldPath, newPath)
                      });
                      forceUpdate(publicInstance);
                      break;
                    case "state":
                      Object(src_utils["r"])(publicInstance.state, oldPath, newPath);
                      forceUpdate(publicInstance);
                      break;
                  }
                }
              }
            }
            function overrideValueAtPath(type, id, hookID, path, value) {
              const internalInstance = idToInternalInstanceMap.get(id);
              if (internalInstance != null) {
                const publicInstance = internalInstance._instance;
                if (publicInstance != null) {
                  switch (type) {
                    case "context":
                      Object(src_utils["u"])(publicInstance.context, path, value);
                      forceUpdate(publicInstance);
                      break;
                    case "hooks":
                      throw new Error("Hooks not supported by this renderer");
                    case "props":
                      const element = internalInstance._currentElement;
                      internalInstance._currentElement = __spreadProps(__spreadValues({}, element), {
                        props: Object(utils["e"])(element.props, path, value)
                      });
                      forceUpdate(publicInstance);
                      break;
                    case "state":
                      Object(src_utils["u"])(publicInstance.state, path, value);
                      forceUpdate(publicInstance);
                      break;
                  }
                }
              }
            }
            const getProfilingData = () => {
              throw new Error("getProfilingData not supported by this renderer");
            };
            const handleCommitFiberRoot = () => {
              throw new Error("handleCommitFiberRoot not supported by this renderer");
            };
            const handleCommitFiberUnmount = () => {
              throw new Error("handleCommitFiberUnmount not supported by this renderer");
            };
            const handlePostCommitFiberRoot = () => {
              throw new Error("handlePostCommitFiberRoot not supported by this renderer");
            };
            const overrideError = () => {
              throw new Error("overrideError not supported by this renderer");
            };
            const overrideSuspense = () => {
              throw new Error("overrideSuspense not supported by this renderer");
            };
            const startProfiling = () => {
            };
            const stopProfiling = () => {
            };
            function getBestMatchForTrackedPath() {
              return null;
            }
            function getPathForElement(id) {
              return null;
            }
            function updateComponentFilters(componentFilters) {
            }
            function setTraceUpdatesEnabled(enabled) {
            }
            function setTrackedPath(path) {
            }
            function getOwnersList(id) {
              return null;
            }
            function clearErrorsAndWarnings() {
            }
            function clearErrorsForFiberID(id) {
            }
            function clearWarningsForFiberID(id) {
            }
            function patchConsoleForStrictMode() {
            }
            function unpatchConsoleForStrictMode() {
            }
            return {
              clearErrorsAndWarnings,
              clearErrorsForFiberID,
              clearWarningsForFiberID,
              cleanup,
              copyElementPath,
              deletePath,
              flushInitialOperations,
              getBestMatchForTrackedPath,
              getDisplayNameForFiberID,
              getFiberIDForNative: getInternalIDForNative,
              getInstanceAndStyle,
              findNativeNodesForFiberID: (id) => {
                const nativeNode = findNativeNodeForInternalID(id);
                return nativeNode == null ? null : [nativeNode];
              },
              getOwnersList,
              getPathForElement,
              getProfilingData,
              handleCommitFiberRoot,
              handleCommitFiberUnmount,
              handlePostCommitFiberRoot,
              inspectElement,
              logElementToConsole,
              overrideError,
              overrideSuspense,
              overrideValueAtPath,
              renamePath,
              patchConsoleForStrictMode,
              prepareViewAttributeSource,
              prepareViewElementSource,
              renderer,
              setTraceUpdatesEnabled,
              setTrackedPath,
              startProfiling,
              stopProfiling,
              storeAsGlobal,
              unpatchConsoleForStrictMode,
              updateComponentFilters
            };
          }
          function initBackend(hook, agent, global) {
            if (hook == null) {
              return () => {
              };
            }
            const subs = [
              hook.sub("renderer-attached", ({
                id,
                renderer,
                rendererInterface
              }) => {
                agent.setRendererInterface(id, rendererInterface);
                rendererInterface.flushInitialOperations();
              }),
              hook.sub("unsupported-renderer-version", (id) => {
                agent.onUnsupportedRenderer(id);
              }),
              hook.sub("fastRefreshScheduled", agent.onFastRefreshScheduled),
              hook.sub("operations", agent.onHookOperations),
              hook.sub("traceUpdates", agent.onTraceUpdates)
            ];
            const attachRenderer = (id, renderer) => {
              let rendererInterface = hook.rendererInterfaces.get(id);
              if (rendererInterface == null) {
                if (typeof renderer.findFiberByHostInstance === "function") {
                  rendererInterface = Object(backend_renderer["a"])(hook, id, renderer, global);
                } else if (renderer.ComponentTree) {
                  rendererInterface = renderer_attach(hook, id, renderer, global);
                } else {
                }
                if (rendererInterface != null) {
                  hook.rendererInterfaces.set(id, rendererInterface);
                }
              }
              if (rendererInterface != null) {
                hook.emit("renderer-attached", {
                  id,
                  renderer,
                  rendererInterface
                });
              } else {
                hook.emit("unsupported-renderer-version", id);
              }
            };
            hook.renderers.forEach((renderer, id) => {
              attachRenderer(id, renderer);
            });
            subs.push(hook.sub("renderer", ({
              id,
              renderer
            }) => {
              attachRenderer(id, renderer);
            }));
            hook.emit("react-devtools", agent);
            hook.reactDevtoolsAgent = agent;
            const onAgentShutdown = () => {
              subs.forEach((fn) => fn());
              hook.rendererInterfaces.forEach((rendererInterface) => {
                rendererInterface.cleanup();
              });
              hook.reactDevtoolsAgent = null;
            };
            agent.addListener("shutdown", onAgentShutdown);
            subs.push(() => {
              agent.removeListener("shutdown", onAgentShutdown);
            });
            return () => {
              subs.forEach((fn) => fn());
            };
          }
          function installHook(target) {
            if (target.hasOwnProperty("__REACT_DEVTOOLS_GLOBAL_HOOK__")) {
              return null;
            }
            let targetConsole = console;
            let targetConsoleMethods = {};
            for (const method in console) {
              targetConsoleMethods[method] = console[method];
            }
            function dangerous_setTargetConsoleForTesting(targetConsoleForTesting) {
              targetConsole = targetConsoleForTesting;
              targetConsoleMethods = {};
              for (const method in targetConsole) {
                targetConsoleMethods[method] = console[method];
              }
            }
            function detectReactBuildType(renderer) {
              try {
                if (typeof renderer.version === "string") {
                  if (renderer.bundleType > 0) {
                    return "development";
                  }
                  return "production";
                }
                const toString = Function.prototype.toString;
                if (renderer.Mount && renderer.Mount._renderNewRootComponent) {
                  const renderRootCode = toString.call(renderer.Mount._renderNewRootComponent);
                  if (renderRootCode.indexOf("function") !== 0) {
                    return "production";
                  }
                  if (renderRootCode.indexOf("storedMeasure") !== -1) {
                    return "development";
                  }
                  if (renderRootCode.indexOf("should be a pure function") !== -1) {
                    if (renderRootCode.indexOf("NODE_ENV") !== -1) {
                      return "development";
                    }
                    if (renderRootCode.indexOf("development") !== -1) {
                      return "development";
                    }
                    if (renderRootCode.indexOf("true") !== -1) {
                      return "development";
                    }
                    if (renderRootCode.indexOf("nextElement") !== -1 || renderRootCode.indexOf("nextComponent") !== -1) {
                      return "unminified";
                    } else {
                      return "development";
                    }
                  }
                  if (renderRootCode.indexOf("nextElement") !== -1 || renderRootCode.indexOf("nextComponent") !== -1) {
                    return "unminified";
                  }
                  return "outdated";
                }
              } catch (err) {
              }
              return "production";
            }
            function checkDCE(fn) {
              try {
                const toString = Function.prototype.toString;
                const code = toString.call(fn);
                if (code.indexOf("^_^") > -1) {
                  hasDetectedBadDCE = true;
                  setTimeout(function() {
                    throw new Error("React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://reactjs.org/link/perf-use-production-build");
                  });
                }
              } catch (err) {
              }
            }
            function format(maybeMessage, ...inputArgs) {
              const args = inputArgs.slice();
              let formatted = String(maybeMessage);
              if (typeof maybeMessage === "string") {
                if (args.length) {
                  const REGEXP = /(%?)(%([jds]))/g;
                  formatted = formatted.replace(REGEXP, (match, escaped, ptn, flag) => {
                    let arg = args.shift();
                    switch (flag) {
                      case "s":
                        arg += "";
                        break;
                      case "d":
                      case "i":
                        arg = parseInt(arg, 10).toString();
                        break;
                      case "f":
                        arg = parseFloat(arg).toString();
                        break;
                    }
                    if (!escaped) {
                      return arg;
                    }
                    args.unshift(arg);
                    return match;
                  });
                }
              }
              if (args.length) {
                for (let i = 0; i < args.length; i++) {
                  formatted += " " + String(args[i]);
                }
              }
              formatted = formatted.replace(/%{2,2}/g, "%");
              return String(formatted);
            }
            let unpatchFn = null;
            function patchConsoleForInitialRenderInStrictMode({
              hideConsoleLogsInStrictMode,
              browserTheme
            }) {
              const overrideConsoleMethods = ["error", "trace", "warn", "log"];
              if (unpatchFn !== null) {
                return;
              }
              const originalConsoleMethods = {};
              unpatchFn = () => {
                for (const method in originalConsoleMethods) {
                  try {
                    targetConsole[method] = originalConsoleMethods[method];
                  } catch (error) {
                  }
                }
              };
              overrideConsoleMethods.forEach((method) => {
                try {
                  const originalMethod = originalConsoleMethods[method] = targetConsole[method].__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ ? targetConsole[method].__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ : targetConsole[method];
                  const overrideMethod = (...args) => {
                    if (!hideConsoleLogsInStrictMode) {
                      let color;
                      switch (method) {
                        case "warn":
                          color = browserTheme === "light" ? "rgba(250, 180, 50, 0.75)" : "rgba(250, 180, 50, 0.5)";
                          break;
                        case "error":
                          color = browserTheme === "light" ? "rgba(250, 123, 130, 0.75)" : "rgba(250, 123, 130, 0.5)";
                          break;
                        case "log":
                        default:
                          color = browserTheme === "light" ? "rgba(125, 125, 125, 0.75)" : "rgba(125, 125, 125, 0.5)";
                          break;
                      }
                      if (color) {
                        originalMethod(`%c${format(...args)}`, `color: ${color}`);
                      } else {
                        throw Error("Console color is not defined");
                      }
                    }
                  };
                  overrideMethod.__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ = originalMethod;
                  originalMethod.__REACT_DEVTOOLS_STRICT_MODE_OVERRIDE_METHOD__ = overrideMethod;
                  targetConsole[method] = overrideMethod;
                } catch (error) {
                }
              });
            }
            function unpatchConsoleForInitialRenderInStrictMode() {
              if (unpatchFn !== null) {
                unpatchFn();
                unpatchFn = null;
              }
            }
            let uidCounter = 0;
            function inject(renderer) {
              const id = ++uidCounter;
              renderers.set(id, renderer);
              const reactBuildType = hasDetectedBadDCE ? "deadcode" : detectReactBuildType(renderer);
              if (true) {
                try {
                  const appendComponentStack = window.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ !== false;
                  const breakOnConsoleErrors = window.__REACT_DEVTOOLS_BREAK_ON_CONSOLE_ERRORS__ === true;
                  const showInlineWarningsAndErrors = window.__REACT_DEVTOOLS_SHOW_INLINE_WARNINGS_AND_ERRORS__ !== false;
                  const hideConsoleLogsInStrictMode = window.__REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__ === true;
                  const browserTheme = window.__REACT_DEVTOOLS_BROWSER_THEME__;
                  Object(backend_console["c"])(renderer);
                  Object(backend_console["a"])({
                    appendComponentStack,
                    breakOnConsoleErrors,
                    showInlineWarningsAndErrors,
                    hideConsoleLogsInStrictMode,
                    browserTheme
                  });
                } catch (error) {
                }
              }
              const attach = target.__REACT_DEVTOOLS_ATTACH__;
              if (typeof attach === "function") {
                const rendererInterface = attach(hook, id, renderer, target);
                hook.rendererInterfaces.set(id, rendererInterface);
              }
              hook.emit("renderer", {
                id,
                renderer,
                reactBuildType
              });
              return id;
            }
            let hasDetectedBadDCE = false;
            function sub(event, fn) {
              hook.on(event, fn);
              return () => hook.off(event, fn);
            }
            function on(event, fn) {
              if (!listeners[event]) {
                listeners[event] = [];
              }
              listeners[event].push(fn);
            }
            function off(event, fn) {
              if (!listeners[event]) {
                return;
              }
              const index = listeners[event].indexOf(fn);
              if (index !== -1) {
                listeners[event].splice(index, 1);
              }
              if (!listeners[event].length) {
                delete listeners[event];
              }
            }
            function emit(event, data) {
              if (listeners[event]) {
                listeners[event].map((fn) => fn(data));
              }
            }
            function getFiberRoots(rendererID) {
              const roots = fiberRoots;
              if (!roots[rendererID]) {
                roots[rendererID] = /* @__PURE__ */ new Set();
              }
              return roots[rendererID];
            }
            function onCommitFiberUnmount(rendererID, fiber) {
              const rendererInterface = rendererInterfaces.get(rendererID);
              if (rendererInterface != null) {
                rendererInterface.handleCommitFiberUnmount(fiber);
              }
            }
            function onCommitFiberRoot(rendererID, root, priorityLevel) {
              const mountedRoots = hook.getFiberRoots(rendererID);
              const current = root.current;
              const isKnownRoot = mountedRoots.has(root);
              const isUnmounting = current.memoizedState == null || current.memoizedState.element == null;
              if (!isKnownRoot && !isUnmounting) {
                mountedRoots.add(root);
              } else if (isKnownRoot && isUnmounting) {
                mountedRoots.delete(root);
              }
              const rendererInterface = rendererInterfaces.get(rendererID);
              if (rendererInterface != null) {
                rendererInterface.handleCommitFiberRoot(root, priorityLevel);
              }
            }
            function onPostCommitFiberRoot(rendererID, root) {
              const rendererInterface = rendererInterfaces.get(rendererID);
              if (rendererInterface != null) {
                rendererInterface.handlePostCommitFiberRoot(root);
              }
            }
            function setStrictMode(rendererID, isStrictMode) {
              const rendererInterface = rendererInterfaces.get(rendererID);
              if (rendererInterface != null) {
                if (isStrictMode) {
                  rendererInterface.patchConsoleForStrictMode();
                } else {
                  rendererInterface.unpatchConsoleForStrictMode();
                }
              } else {
                if (isStrictMode) {
                  const hideConsoleLogsInStrictMode = window.__REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__ === true;
                  const browserTheme = window.__REACT_DEVTOOLS_BROWSER_THEME__;
                  patchConsoleForInitialRenderInStrictMode({
                    hideConsoleLogsInStrictMode,
                    browserTheme
                  });
                } else {
                  unpatchConsoleForInitialRenderInStrictMode();
                }
              }
            }
            const openModuleRangesStack = [];
            const moduleRanges = [];
            function getTopStackFrameString(error) {
              const frames = error.stack.split("\n");
              const frame = frames.length > 1 ? frames[1] : null;
              return frame;
            }
            function getInternalModuleRanges() {
              return moduleRanges;
            }
            function registerInternalModuleStart(error) {
              const startStackFrame = getTopStackFrameString(error);
              if (startStackFrame !== null) {
                openModuleRangesStack.push(startStackFrame);
              }
            }
            function registerInternalModuleStop(error) {
              if (openModuleRangesStack.length > 0) {
                const startStackFrame = openModuleRangesStack.pop();
                const stopStackFrame = getTopStackFrameString(error);
                if (stopStackFrame !== null) {
                  moduleRanges.push([startStackFrame, stopStackFrame]);
                }
              }
            }
            const fiberRoots = {};
            const rendererInterfaces = /* @__PURE__ */ new Map();
            const listeners = {};
            const renderers = /* @__PURE__ */ new Map();
            const hook = {
              rendererInterfaces,
              listeners,
              renderers,
              emit,
              getFiberRoots,
              inject,
              on,
              off,
              sub,
              supportsFiber: true,
              checkDCE,
              onCommitFiberUnmount,
              onCommitFiberRoot,
              onPostCommitFiberRoot,
              setStrictMode,
              getInternalModuleRanges,
              registerInternalModuleStart,
              registerInternalModuleStop
            };
            if (false) {
            }
            Object.defineProperty(target, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
              configurable: false,
              enumerable: false,
              get() {
                return hook;
              }
            });
            return hook;
          }
          function resolveBoxStyle(prefix, style) {
            let hasParts = false;
            const result = {
              bottom: 0,
              left: 0,
              right: 0,
              top: 0
            };
            const styleForAll = style[prefix];
            if (styleForAll != null) {
              for (const key of Object.keys(result)) {
                result[key] = styleForAll;
              }
              hasParts = true;
            }
            const styleForHorizontal = style[prefix + "Horizontal"];
            if (styleForHorizontal != null) {
              result.left = styleForHorizontal;
              result.right = styleForHorizontal;
              hasParts = true;
            } else {
              const styleForLeft = style[prefix + "Left"];
              if (styleForLeft != null) {
                result.left = styleForLeft;
                hasParts = true;
              }
              const styleForRight = style[prefix + "Right"];
              if (styleForRight != null) {
                result.right = styleForRight;
                hasParts = true;
              }
              const styleForEnd = style[prefix + "End"];
              if (styleForEnd != null) {
                result.right = styleForEnd;
                hasParts = true;
              }
              const styleForStart = style[prefix + "Start"];
              if (styleForStart != null) {
                result.left = styleForStart;
                hasParts = true;
              }
            }
            const styleForVertical = style[prefix + "Vertical"];
            if (styleForVertical != null) {
              result.bottom = styleForVertical;
              result.top = styleForVertical;
              hasParts = true;
            } else {
              const styleForBottom = style[prefix + "Bottom"];
              if (styleForBottom != null) {
                result.bottom = styleForBottom;
                hasParts = true;
              }
              const styleForTop = style[prefix + "Top"];
              if (styleForTop != null) {
                result.top = styleForTop;
                hasParts = true;
              }
            }
            return hasParts ? result : null;
          }
          function setupNativeStyleEditor(bridge, agent, resolveNativeStyle, validAttributes) {
            bridge.addListener("NativeStyleEditor_measure", ({
              id,
              rendererID
            }) => {
              measureStyle(agent, bridge, resolveNativeStyle, id, rendererID);
            });
            bridge.addListener("NativeStyleEditor_renameAttribute", ({
              id,
              rendererID,
              oldName,
              newName,
              value
            }) => {
              renameStyle(agent, id, rendererID, oldName, newName, value);
              setTimeout(() => measureStyle(agent, bridge, resolveNativeStyle, id, rendererID));
            });
            bridge.addListener("NativeStyleEditor_setValue", ({
              id,
              rendererID,
              name,
              value
            }) => {
              setStyle(agent, id, rendererID, name, value);
              setTimeout(() => measureStyle(agent, bridge, resolveNativeStyle, id, rendererID));
            });
            bridge.send("isNativeStyleEditorSupported", {
              isSupported: true,
              validAttributes
            });
          }
          const EMPTY_BOX_STYLE = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          };
          const componentIDToStyleOverrides = /* @__PURE__ */ new Map();
          function measureStyle(agent, bridge, resolveNativeStyle, id, rendererID) {
            const data = agent.getInstanceAndStyle({
              id,
              rendererID
            });
            if (!data || !data.style) {
              bridge.send("NativeStyleEditor_styleAndLayout", {
                id,
                layout: null,
                style: null
              });
              return;
            }
            const {
              instance,
              style
            } = data;
            let resolvedStyle = resolveNativeStyle(style);
            const styleOverrides = componentIDToStyleOverrides.get(id);
            if (styleOverrides != null) {
              resolvedStyle = Object.assign({}, resolvedStyle, styleOverrides);
            }
            if (!instance || typeof instance.measure !== "function") {
              bridge.send("NativeStyleEditor_styleAndLayout", {
                id,
                layout: null,
                style: resolvedStyle || null
              });
              return;
            }
            instance.measure((x, y, width, height, left, top) => {
              if (typeof x !== "number") {
                bridge.send("NativeStyleEditor_styleAndLayout", {
                  id,
                  layout: null,
                  style: resolvedStyle || null
                });
                return;
              }
              const margin = resolvedStyle != null && resolveBoxStyle("margin", resolvedStyle) || EMPTY_BOX_STYLE;
              const padding = resolvedStyle != null && resolveBoxStyle("padding", resolvedStyle) || EMPTY_BOX_STYLE;
              bridge.send("NativeStyleEditor_styleAndLayout", {
                id,
                layout: {
                  x,
                  y,
                  width,
                  height,
                  left,
                  top,
                  margin,
                  padding
                },
                style: resolvedStyle || null
              });
            });
          }
          function shallowClone(object) {
            const cloned = {};
            for (const n in object) {
              cloned[n] = object[n];
            }
            return cloned;
          }
          function renameStyle(agent, id, rendererID, oldName, newName, value) {
            const data = agent.getInstanceAndStyle({
              id,
              rendererID
            });
            if (!data || !data.style) {
              return;
            }
            const {
              instance,
              style
            } = data;
            const newStyle = newName ? {
              [oldName]: void 0,
              [newName]: value
            } : {
              [oldName]: void 0
            };
            let customStyle;
            if (instance !== null && typeof instance.setNativeProps === "function") {
              const styleOverrides = componentIDToStyleOverrides.get(id);
              if (!styleOverrides) {
                componentIDToStyleOverrides.set(id, newStyle);
              } else {
                Object.assign(styleOverrides, newStyle);
              }
              instance.setNativeProps({
                style: newStyle
              });
            } else if (Array.isArray(style)) {
              const lastIndex = style.length - 1;
              if (typeof style[lastIndex] === "object" && !Array.isArray(style[lastIndex])) {
                customStyle = shallowClone(style[lastIndex]);
                delete customStyle[oldName];
                if (newName) {
                  customStyle[newName] = value;
                } else {
                  customStyle[oldName] = void 0;
                }
                agent.overrideValueAtPath({
                  type: "props",
                  id,
                  rendererID,
                  path: ["style", lastIndex],
                  value: customStyle
                });
              } else {
                agent.overrideValueAtPath({
                  type: "props",
                  id,
                  rendererID,
                  path: ["style"],
                  value: style.concat([newStyle])
                });
              }
            } else if (typeof style === "object") {
              customStyle = shallowClone(style);
              delete customStyle[oldName];
              if (newName) {
                customStyle[newName] = value;
              } else {
                customStyle[oldName] = void 0;
              }
              agent.overrideValueAtPath({
                type: "props",
                id,
                rendererID,
                path: ["style"],
                value: customStyle
              });
            } else {
              agent.overrideValueAtPath({
                type: "props",
                id,
                rendererID,
                path: ["style"],
                value: [style, newStyle]
              });
            }
            agent.emit("hideNativeHighlight");
          }
          function setStyle(agent, id, rendererID, name, value) {
            const data = agent.getInstanceAndStyle({
              id,
              rendererID
            });
            if (!data || !data.style) {
              return;
            }
            const {
              instance,
              style
            } = data;
            const newStyle = {
              [name]: value
            };
            if (instance !== null && typeof instance.setNativeProps === "function") {
              const styleOverrides = componentIDToStyleOverrides.get(id);
              if (!styleOverrides) {
                componentIDToStyleOverrides.set(id, newStyle);
              } else {
                Object.assign(styleOverrides, newStyle);
              }
              instance.setNativeProps({
                style: newStyle
              });
            } else if (Array.isArray(style)) {
              const lastLength = style.length - 1;
              if (typeof style[lastLength] === "object" && !Array.isArray(style[lastLength])) {
                agent.overrideValueAtPath({
                  type: "props",
                  id,
                  rendererID,
                  path: ["style", lastLength, name],
                  value
                });
              } else {
                agent.overrideValueAtPath({
                  type: "props",
                  id,
                  rendererID,
                  path: ["style"],
                  value: style.concat([newStyle])
                });
              }
            } else {
              agent.overrideValueAtPath({
                type: "props",
                id,
                rendererID,
                path: ["style"],
                value: [style, newStyle]
              });
            }
            agent.emit("hideNativeHighlight");
          }
          function startActivation(contentWindow, bridge) {
            const onSavedPreferences = (data) => {
              bridge.removeListener("savedPreferences", onSavedPreferences);
              const {
                appendComponentStack,
                breakOnConsoleErrors,
                componentFilters,
                showInlineWarningsAndErrors,
                hideConsoleLogsInStrictMode
              } = data;
              contentWindow.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ = appendComponentStack;
              contentWindow.__REACT_DEVTOOLS_BREAK_ON_CONSOLE_ERRORS__ = breakOnConsoleErrors;
              contentWindow.__REACT_DEVTOOLS_COMPONENT_FILTERS__ = componentFilters;
              contentWindow.__REACT_DEVTOOLS_SHOW_INLINE_WARNINGS_AND_ERRORS__ = showInlineWarningsAndErrors;
              contentWindow.__REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__ = hideConsoleLogsInStrictMode;
              if (contentWindow !== window) {
                window.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ = appendComponentStack;
                window.__REACT_DEVTOOLS_BREAK_ON_CONSOLE_ERRORS__ = breakOnConsoleErrors;
                window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ = componentFilters;
                window.__REACT_DEVTOOLS_SHOW_INLINE_WARNINGS_AND_ERRORS__ = showInlineWarningsAndErrors;
                window.__REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__ = hideConsoleLogsInStrictMode;
              }
              finishActivation(contentWindow, bridge);
            };
            bridge.addListener("savedPreferences", onSavedPreferences);
            bridge.send("getSavedPreferences");
          }
          function finishActivation(contentWindow, bridge) {
            const agent = new agent_Agent(bridge);
            const hook = contentWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (hook) {
              initBackend(hook, agent, contentWindow);
              if (hook.resolveRNStyle) {
                setupNativeStyleEditor(bridge, agent, hook.resolveRNStyle, hook.nativeStyleEditorValidAttributes);
              }
            }
          }
          function activate(contentWindow, {
            bridge
          } = {}) {
            if (bridge == null) {
              bridge = createBridge(contentWindow);
            }
            startActivation(contentWindow, bridge);
          }
          function createBridge(contentWindow, wall) {
            const {
              parent
            } = contentWindow;
            if (wall == null) {
              wall = {
                listen(fn) {
                  const onMessage = ({
                    data
                  }) => {
                    fn(data);
                  };
                  contentWindow.addEventListener("message", onMessage);
                  return () => {
                    contentWindow.removeEventListener("message", onMessage);
                  };
                },
                send(event, payload, transferable) {
                  parent.postMessage({
                    event,
                    payload
                  }, "*", transferable);
                }
              };
            }
            return new src_bridge["c"](wall);
          }
          function backend_initialize(contentWindow) {
            installHook(contentWindow);
          }
        },
        3: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return getAllEnumerableKeys;
          });
          __webpack_require__.d(__webpack_exports__, "i", function() {
            return getDisplayName;
          });
          __webpack_require__.d(__webpack_exports__, "p", function() {
            return getUID;
          });
          __webpack_require__.d(__webpack_exports__, "w", function() {
            return utfDecodeString;
          });
          __webpack_require__.d(__webpack_exports__, "x", function() {
            return utfEncodeString;
          });
          __webpack_require__.d(__webpack_exports__, "q", function() {
            return printOperationsArray;
          });
          __webpack_require__.d(__webpack_exports__, "g", function() {
            return getDefaultComponentFilters;
          });
          __webpack_require__.d(__webpack_exports__, "n", function() {
            return getSavedComponentFilters;
          });
          __webpack_require__.d(__webpack_exports__, "s", function() {
            return saveComponentFilters;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return getAppendComponentStack;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return getBreakOnConsoleErrors;
          });
          __webpack_require__.d(__webpack_exports__, "k", function() {
            return getHideConsoleLogsInStrictMode;
          });
          __webpack_require__.d(__webpack_exports__, "o", function() {
            return getShowInlineWarningsAndErrors;
          });
          __webpack_require__.d(__webpack_exports__, "h", function() {
            return getDefaultOpenInEditorURL;
          });
          __webpack_require__.d(__webpack_exports__, "m", function() {
            return getOpenInEditorURL;
          });
          __webpack_require__.d(__webpack_exports__, "t", function() {
            return separateDisplayNameAndHOCs;
          });
          __webpack_require__.d(__webpack_exports__, "v", function() {
            return shallowDiffers;
          });
          __webpack_require__.d(__webpack_exports__, "l", function() {
            return getInObject;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return deletePathInObject;
          });
          __webpack_require__.d(__webpack_exports__, "r", function() {
            return renamePathInObject;
          });
          __webpack_require__.d(__webpack_exports__, "u", function() {
            return setInObject;
          });
          __webpack_require__.d(__webpack_exports__, "f", function() {
            return getDataType;
          });
          __webpack_require__.d(__webpack_exports__, "j", function() {
            return getDisplayNameForReactElement;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return formatDataForPreview;
          });
          var lru_cache = __webpack_require__(52);
          var lru_cache_default = /* @__PURE__ */ __webpack_require__.n(lru_cache);
          var external_react_is_ = __webpack_require__(14);
          let REACT_ELEMENT_TYPE = 60103;
          let REACT_PORTAL_TYPE = 60106;
          let REACT_FRAGMENT_TYPE = 60107;
          let REACT_STRICT_MODE_TYPE = 60108;
          let REACT_PROFILER_TYPE = 60114;
          let REACT_PROVIDER_TYPE = 60109;
          let REACT_CONTEXT_TYPE = 60110;
          let REACT_FORWARD_REF_TYPE = 60112;
          let REACT_SUSPENSE_TYPE = 60113;
          let REACT_SUSPENSE_LIST_TYPE = 60120;
          let REACT_MEMO_TYPE = 60115;
          let REACT_LAZY_TYPE = 60116;
          let REACT_SCOPE_TYPE = 60119;
          let REACT_DEBUG_TRACING_MODE_TYPE = 60129;
          let REACT_OFFSCREEN_TYPE = 60130;
          let REACT_LEGACY_HIDDEN_TYPE = 60131;
          let REACT_CACHE_TYPE = 60132;
          if (typeof Symbol === "function" && Symbol.for) {
            const symbolFor = Symbol.for;
            REACT_ELEMENT_TYPE = symbolFor("react.element");
            REACT_PORTAL_TYPE = symbolFor("react.portal");
            REACT_FRAGMENT_TYPE = symbolFor("react.fragment");
            REACT_STRICT_MODE_TYPE = symbolFor("react.strict_mode");
            REACT_PROFILER_TYPE = symbolFor("react.profiler");
            REACT_PROVIDER_TYPE = symbolFor("react.provider");
            REACT_CONTEXT_TYPE = symbolFor("react.context");
            REACT_FORWARD_REF_TYPE = symbolFor("react.forward_ref");
            REACT_SUSPENSE_TYPE = symbolFor("react.suspense");
            REACT_SUSPENSE_LIST_TYPE = symbolFor("react.suspense_list");
            REACT_MEMO_TYPE = symbolFor("react.memo");
            REACT_LAZY_TYPE = symbolFor("react.lazy");
            REACT_SCOPE_TYPE = symbolFor("react.scope");
            REACT_DEBUG_TRACING_MODE_TYPE = symbolFor("react.debug_trace_mode");
            REACT_OFFSCREEN_TYPE = symbolFor("react.offscreen");
            REACT_LEGACY_HIDDEN_TYPE = symbolFor("react.legacy_hidden");
            REACT_CACHE_TYPE = symbolFor("react.cache");
          }
          const MAYBE_ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
          const FAUX_ITERATOR_SYMBOL = "@@iterator";
          function getIteratorFn(maybeIterable) {
            if (maybeIterable === null || typeof maybeIterable !== "object") {
              return null;
            }
            const maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
            if (typeof maybeIterator === "function") {
              return maybeIterator;
            }
            return null;
          }
          var constants = __webpack_require__(1);
          var types = __webpack_require__(2);
          var storage = __webpack_require__(8);
          var hydration = __webpack_require__(10);
          const isArray = Array.isArray;
          var src_isArray = isArray;
          const cachedDisplayNames = /* @__PURE__ */ new WeakMap();
          const encodedStringCache = new lru_cache_default.a({
            max: 1e3
          });
          function alphaSortKeys(a, b) {
            if (a.toString() > b.toString()) {
              return 1;
            } else if (b.toString() > a.toString()) {
              return -1;
            } else {
              return 0;
            }
          }
          function getAllEnumerableKeys(obj) {
            const keys = /* @__PURE__ */ new Set();
            let current = obj;
            while (current != null) {
              const currentKeys = [...Object.keys(current), ...Object.getOwnPropertySymbols(current)];
              const descriptors = Object.getOwnPropertyDescriptors(current);
              currentKeys.forEach((key) => {
                if (descriptors[key].enumerable) {
                  keys.add(key);
                }
              });
              current = Object.getPrototypeOf(current);
            }
            return keys;
          }
          function getDisplayName(type, fallbackName = "Anonymous") {
            const nameFromCache = cachedDisplayNames.get(type);
            if (nameFromCache != null) {
              return nameFromCache;
            }
            let displayName = fallbackName;
            if (typeof type.displayName === "string") {
              displayName = type.displayName;
            } else if (typeof type.name === "string" && type.name !== "") {
              displayName = type.name;
            }
            cachedDisplayNames.set(type, displayName);
            return displayName;
          }
          let uidCounter = 0;
          function getUID() {
            return ++uidCounter;
          }
          function utfDecodeString(array) {
            let string = "";
            for (let i = 0; i < array.length; i++) {
              const char = array[i];
              string += String.fromCodePoint(char);
            }
            return string;
          }
          function surrogatePairToCodePoint(charCode1, charCode2) {
            return ((charCode1 & 1023) << 10) + (charCode2 & 1023) + 65536;
          }
          function utfEncodeString(string) {
            const cached = encodedStringCache.get(string);
            if (cached !== void 0) {
              return cached;
            }
            const encoded = [];
            let i = 0;
            let charCode;
            while (i < string.length) {
              charCode = string.charCodeAt(i);
              if ((charCode & 63488) === 55296) {
                encoded.push(surrogatePairToCodePoint(charCode, string.charCodeAt(++i)));
              } else {
                encoded.push(charCode);
              }
              ++i;
            }
            encodedStringCache.set(string, encoded);
            return encoded;
          }
          function printOperationsArray(operations) {
            const rendererID = operations[0];
            const rootID = operations[1];
            const logs = [`operations for renderer:${rendererID} and root:${rootID}`];
            let i = 2;
            const stringTable = [
              null
            ];
            const stringTableSize = operations[i++];
            const stringTableEnd = i + stringTableSize;
            while (i < stringTableEnd) {
              const nextLength = operations[i++];
              const nextString = utfDecodeString(operations.slice(i, i + nextLength));
              stringTable.push(nextString);
              i += nextLength;
            }
            while (i < operations.length) {
              const operation = operations[i];
              switch (operation) {
                case constants["v"]: {
                  const id2 = operations[i + 1];
                  const type = operations[i + 2];
                  i += 3;
                  if (type === types["m"]) {
                    logs.push(`Add new root node ${id2}`);
                    i++;
                    i++;
                    i++;
                    i++;
                  } else {
                    const parentID = operations[i];
                    i++;
                    i++;
                    const displayNameStringID = operations[i];
                    const displayName = stringTable[displayNameStringID];
                    i++;
                    i++;
                    logs.push(`Add node ${id2} (${displayName || "null"}) as child of ${parentID}`);
                  }
                  break;
                }
                case constants["w"]: {
                  const removeLength = operations[i + 1];
                  i += 2;
                  for (let removeIndex = 0; removeIndex < removeLength; removeIndex++) {
                    const id2 = operations[i];
                    i += 1;
                    logs.push(`Remove node ${id2}`);
                  }
                  break;
                }
                case constants["x"]: {
                  i += 1;
                  logs.push(`Remove root ${rootID}`);
                  break;
                }
                case constants["z"]: {
                  const id2 = operations[i + 1];
                  const mode = operations[i + 1];
                  i += 3;
                  logs.push(`Mode ${mode} set for subtree with root ${id2}`);
                  break;
                }
                case constants["y"]: {
                  const id2 = operations[i + 1];
                  const numChildren = operations[i + 2];
                  i += 3;
                  const children = operations.slice(i, i + numChildren);
                  i += numChildren;
                  logs.push(`Re-order node ${id2} children ${children.join(",")}`);
                  break;
                }
                case constants["B"]:
                  i += 3;
                  break;
                case constants["A"]:
                  const id = operations[i + 1];
                  const numErrors = operations[i + 2];
                  const numWarnings = operations[i + 3];
                  i += 4;
                  logs.push(`Node ${id} has ${numErrors} errors and ${numWarnings} warnings`);
                  break;
                default:
                  throw Error(`Unsupported Bridge operation "${operation}"`);
              }
            }
            console.log(logs.join("\n  "));
          }
          function getDefaultComponentFilters() {
            return [{
              type: types["b"],
              value: types["i"],
              isEnabled: true
            }];
          }
          function getSavedComponentFilters() {
            try {
              const raw = Object(storage["a"])(constants["h"]);
              if (raw != null) {
                return JSON.parse(raw);
              }
            } catch (error) {
            }
            return getDefaultComponentFilters();
          }
          function saveComponentFilters(componentFilters) {
            Object(storage["b"])(constants["h"], JSON.stringify(componentFilters));
          }
          function getAppendComponentStack() {
            try {
              const raw = Object(storage["a"])(constants["m"]);
              if (raw != null) {
                return JSON.parse(raw);
              }
            } catch (error) {
            }
            return true;
          }
          function setAppendComponentStack(value) {
            Object(storage["b"])(constants["m"], JSON.stringify(value));
          }
          function getBreakOnConsoleErrors() {
            try {
              const raw = Object(storage["a"])(constants["l"]);
              if (raw != null) {
                return JSON.parse(raw);
              }
            } catch (error) {
            }
            return false;
          }
          function setBreakOnConsoleErrors(value) {
            Object(storage["b"])(constants["l"], JSON.stringify(value));
          }
          function getHideConsoleLogsInStrictMode() {
            try {
              const raw = Object(storage["a"])(constants["i"]);
              if (raw != null) {
                return JSON.parse(raw);
              }
            } catch (error) {
            }
            return false;
          }
          function sethideConsoleLogsInStrictMode(value) {
            Object(storage["b"])(constants["i"], JSON.stringify(value));
          }
          function getShowInlineWarningsAndErrors() {
            try {
              const raw = Object(storage["a"])(constants["n"]);
              if (raw != null) {
                return JSON.parse(raw);
              }
            } catch (error) {
            }
            return true;
          }
          function setShowInlineWarningsAndErrors(value) {
            Object(storage["b"])(constants["n"], JSON.stringify(value));
          }
          function getDefaultOpenInEditorURL() {
            return false ? null : "";
          }
          function getOpenInEditorURL() {
            try {
              const raw = Object(storage["a"])(constants["j"]);
              if (raw != null) {
                return JSON.parse(raw);
              }
            } catch (error) {
            }
            return getDefaultOpenInEditorURL();
          }
          function separateDisplayNameAndHOCs(displayName, type) {
            if (displayName === null) {
              return [null, null];
            }
            let hocDisplayNames = null;
            switch (type) {
              case types["e"]:
              case types["g"]:
              case types["h"]:
              case types["j"]:
                if (displayName.indexOf("(") >= 0) {
                  const matches = displayName.match(/[^()]+/g);
                  if (matches != null) {
                    displayName = matches.pop();
                    hocDisplayNames = matches;
                  }
                }
                break;
              default:
                break;
            }
            if (type === types["j"]) {
              if (hocDisplayNames === null) {
                hocDisplayNames = ["Memo"];
              } else {
                hocDisplayNames.unshift("Memo");
              }
            } else if (type === types["g"]) {
              if (hocDisplayNames === null) {
                hocDisplayNames = ["ForwardRef"];
              } else {
                hocDisplayNames.unshift("ForwardRef");
              }
            }
            return [displayName, hocDisplayNames];
          }
          function shallowDiffers(prev, next) {
            for (const attribute in prev) {
              if (!(attribute in next)) {
                return true;
              }
            }
            for (const attribute in next) {
              if (prev[attribute] !== next[attribute]) {
                return true;
              }
            }
            return false;
          }
          function getInObject(object, path) {
            return path.reduce((reduced, attr) => {
              if (reduced) {
                if (hasOwnProperty.call(reduced, attr)) {
                  return reduced[attr];
                }
                if (typeof reduced[Symbol.iterator] === "function") {
                  return Array.from(reduced)[attr];
                }
              }
              return null;
            }, object);
          }
          function deletePathInObject(object, path) {
            const length = path.length;
            const last = path[length - 1];
            if (object != null) {
              const parent = getInObject(object, path.slice(0, length - 1));
              if (parent) {
                if (src_isArray(parent)) {
                  parent.splice(last, 1);
                } else {
                  delete parent[last];
                }
              }
            }
          }
          function renamePathInObject(object, oldPath, newPath) {
            const length = oldPath.length;
            if (object != null) {
              const parent = getInObject(object, oldPath.slice(0, length - 1));
              if (parent) {
                const lastOld = oldPath[length - 1];
                const lastNew = newPath[length - 1];
                parent[lastNew] = parent[lastOld];
                if (src_isArray(parent)) {
                  parent.splice(lastOld, 1);
                } else {
                  delete parent[lastOld];
                }
              }
            }
          }
          function setInObject(object, path, value) {
            const length = path.length;
            const last = path[length - 1];
            if (object != null) {
              const parent = getInObject(object, path.slice(0, length - 1));
              if (parent) {
                parent[last] = value;
              }
            }
          }
          function getDataType(data) {
            if (data === null) {
              return "null";
            } else if (data === void 0) {
              return "undefined";
            }
            if (Object(external_react_is_["isElement"])(data)) {
              return "react_element";
            }
            if (typeof HTMLElement !== "undefined" && data instanceof HTMLElement) {
              return "html_element";
            }
            const type = typeof data;
            switch (type) {
              case "bigint":
                return "bigint";
              case "boolean":
                return "boolean";
              case "function":
                return "function";
              case "number":
                if (Number.isNaN(data)) {
                  return "nan";
                } else if (!Number.isFinite(data)) {
                  return "infinity";
                } else {
                  return "number";
                }
              case "object":
                if (src_isArray(data)) {
                  return "array";
                } else if (ArrayBuffer.isView(data)) {
                  return hasOwnProperty.call(data.constructor, "BYTES_PER_ELEMENT") ? "typed_array" : "data_view";
                } else if (data.constructor && data.constructor.name === "ArrayBuffer") {
                  return "array_buffer";
                } else if (typeof data[Symbol.iterator] === "function") {
                  const iterator = data[Symbol.iterator]();
                  if (!iterator) {
                  } else {
                    return iterator === data ? "opaque_iterator" : "iterator";
                  }
                } else if (data.constructor && data.constructor.name === "RegExp") {
                  return "regexp";
                } else {
                  const toStringValue = Object.prototype.toString.call(data);
                  if (toStringValue === "[object Date]") {
                    return "date";
                  } else if (toStringValue === "[object HTMLAllCollection]") {
                    return "html_all_collection";
                  }
                }
                return "object";
              case "string":
                return "string";
              case "symbol":
                return "symbol";
              case "undefined":
                if (Object.prototype.toString.call(data) === "[object HTMLAllCollection]") {
                  return "html_all_collection";
                }
                return "undefined";
              default:
                return "unknown";
            }
          }
          function getDisplayNameForReactElement(element) {
            const elementType = Object(external_react_is_["typeOf"])(element);
            switch (elementType) {
              case external_react_is_["ContextConsumer"]:
                return "ContextConsumer";
              case external_react_is_["ContextProvider"]:
                return "ContextProvider";
              case external_react_is_["ForwardRef"]:
                return "ForwardRef";
              case external_react_is_["Fragment"]:
                return "Fragment";
              case external_react_is_["Lazy"]:
                return "Lazy";
              case external_react_is_["Memo"]:
                return "Memo";
              case external_react_is_["Portal"]:
                return "Portal";
              case external_react_is_["Profiler"]:
                return "Profiler";
              case external_react_is_["StrictMode"]:
                return "StrictMode";
              case external_react_is_["Suspense"]:
                return "Suspense";
              case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
              default:
                const {
                  type
                } = element;
                if (typeof type === "string") {
                  return type;
                } else if (typeof type === "function") {
                  return getDisplayName(type, "Anonymous");
                } else if (type != null) {
                  return "NotImplementedInDevtools";
                } else {
                  return "Element";
                }
            }
          }
          const MAX_PREVIEW_STRING_LENGTH = 50;
          function truncateForDisplay(string, length = MAX_PREVIEW_STRING_LENGTH) {
            if (string.length > length) {
              return string.substr(0, length) + "\u2026";
            } else {
              return string;
            }
          }
          function formatDataForPreview(data, showFormattedValue) {
            if (data != null && hasOwnProperty.call(data, hydration["d"].type)) {
              return showFormattedValue ? data[hydration["d"].preview_long] : data[hydration["d"].preview_short];
            }
            const type = getDataType(data);
            switch (type) {
              case "html_element":
                return `<${truncateForDisplay(data.tagName.toLowerCase())} />`;
              case "function":
                return truncateForDisplay(`\u0192 ${typeof data.name === "function" ? "" : data.name}() {}`);
              case "string":
                return `"${data}"`;
              case "bigint":
                return truncateForDisplay(data.toString() + "n");
              case "regexp":
                return truncateForDisplay(data.toString());
              case "symbol":
                return truncateForDisplay(data.toString());
              case "react_element":
                return `<${truncateForDisplay(getDisplayNameForReactElement(data) || "Unknown")} />`;
              case "array_buffer":
                return `ArrayBuffer(${data.byteLength})`;
              case "data_view":
                return `DataView(${data.buffer.byteLength})`;
              case "array":
                if (showFormattedValue) {
                  let formatted = "";
                  for (let i = 0; i < data.length; i++) {
                    if (i > 0) {
                      formatted += ", ";
                    }
                    formatted += formatDataForPreview(data[i], false);
                    if (formatted.length > MAX_PREVIEW_STRING_LENGTH) {
                      break;
                    }
                  }
                  return `[${truncateForDisplay(formatted)}]`;
                } else {
                  const length = hasOwnProperty.call(data, hydration["d"].size) ? data[hydration["d"].size] : data.length;
                  return `Array(${length})`;
                }
              case "typed_array":
                const shortName = `${data.constructor.name}(${data.length})`;
                if (showFormattedValue) {
                  let formatted = "";
                  for (let i = 0; i < data.length; i++) {
                    if (i > 0) {
                      formatted += ", ";
                    }
                    formatted += data[i];
                    if (formatted.length > MAX_PREVIEW_STRING_LENGTH) {
                      break;
                    }
                  }
                  return `${shortName} [${truncateForDisplay(formatted)}]`;
                } else {
                  return shortName;
                }
              case "iterator":
                const name = data.constructor.name;
                if (showFormattedValue) {
                  const array = Array.from(data);
                  let formatted = "";
                  for (let i = 0; i < array.length; i++) {
                    const entryOrEntries = array[i];
                    if (i > 0) {
                      formatted += ", ";
                    }
                    if (src_isArray(entryOrEntries)) {
                      const key = formatDataForPreview(entryOrEntries[0], true);
                      const value = formatDataForPreview(entryOrEntries[1], false);
                      formatted += `${key} => ${value}`;
                    } else {
                      formatted += formatDataForPreview(entryOrEntries, false);
                    }
                    if (formatted.length > MAX_PREVIEW_STRING_LENGTH) {
                      break;
                    }
                  }
                  return `${name}(${data.size}) {${truncateForDisplay(formatted)}}`;
                } else {
                  return `${name}(${data.size})`;
                }
              case "opaque_iterator": {
                return data[Symbol.toStringTag];
              }
              case "date":
                return data.toString();
              case "object":
                if (showFormattedValue) {
                  const keys = Array.from(getAllEnumerableKeys(data)).sort(alphaSortKeys);
                  let formatted = "";
                  for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    if (i > 0) {
                      formatted += ", ";
                    }
                    formatted += `${key.toString()}: ${formatDataForPreview(data[key], false)}`;
                    if (formatted.length > MAX_PREVIEW_STRING_LENGTH) {
                      break;
                    }
                  }
                  return `{${truncateForDisplay(formatted)}}`;
                } else {
                  return "{\u2026}";
                }
              case "boolean":
              case "number":
              case "infinity":
              case "nan":
              case "null":
              case "undefined":
                return data;
              default:
                try {
                  return truncateForDisplay(String(data));
                } catch (error) {
                  return "unserializable";
                }
            }
          }
        },
        33: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return BRIDGE_PROTOCOL;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return currentBridgeProtocol;
          });
          var _events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37);
          function _defineProperty(obj, key, value) {
            if (key in obj) {
              Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
            } else {
              obj[key] = value;
            }
            return obj;
          }
          const BATCH_DURATION = 100;
          const BRIDGE_PROTOCOL = [
            {
              version: 0,
              minNpmVersion: '"<4.11.0"',
              maxNpmVersion: '"<4.11.0"'
            },
            {
              version: 1,
              minNpmVersion: "4.13.0",
              maxNpmVersion: "4.21.0"
            },
            {
              version: 2,
              minNpmVersion: "4.22.0",
              maxNpmVersion: null
            }
          ];
          const currentBridgeProtocol = BRIDGE_PROTOCOL[BRIDGE_PROTOCOL.length - 1];
          class Bridge extends _events__WEBPACK_IMPORTED_MODULE_0__["a"] {
            constructor(wall) {
              super();
              _defineProperty(this, "_isShutdown", false);
              _defineProperty(this, "_messageQueue", []);
              _defineProperty(this, "_timeoutID", null);
              _defineProperty(this, "_wallUnlisten", null);
              _defineProperty(this, "_flush", () => {
                if (this._timeoutID !== null) {
                  clearTimeout(this._timeoutID);
                  this._timeoutID = null;
                }
                if (this._messageQueue.length) {
                  for (let i = 0; i < this._messageQueue.length; i += 2) {
                    this._wall.send(this._messageQueue[i], ...this._messageQueue[i + 1]);
                  }
                  this._messageQueue.length = 0;
                  this._timeoutID = setTimeout(this._flush, BATCH_DURATION);
                }
              });
              _defineProperty(this, "overrideValueAtPath", ({
                id,
                path,
                rendererID,
                type,
                value
              }) => {
                switch (type) {
                  case "context":
                    this.send("overrideContext", {
                      id,
                      path,
                      rendererID,
                      wasForwarded: true,
                      value
                    });
                    break;
                  case "hooks":
                    this.send("overrideHookState", {
                      id,
                      path,
                      rendererID,
                      wasForwarded: true,
                      value
                    });
                    break;
                  case "props":
                    this.send("overrideProps", {
                      id,
                      path,
                      rendererID,
                      wasForwarded: true,
                      value
                    });
                    break;
                  case "state":
                    this.send("overrideState", {
                      id,
                      path,
                      rendererID,
                      wasForwarded: true,
                      value
                    });
                    break;
                }
              });
              this._wall = wall;
              this._wallUnlisten = wall.listen((message) => {
                if (message && message.event) {
                  this.emit(message.event, message.payload);
                }
              }) || null;
              this.addListener("overrideValueAtPath", this.overrideValueAtPath);
            }
            get wall() {
              return this._wall;
            }
            send(event, ...payload) {
              if (this._isShutdown) {
                console.warn(`Cannot send message "${event}" through a Bridge that has been shutdown.`);
                return;
              }
              this._messageQueue.push(event, payload);
              if (!this._timeoutID) {
                this._timeoutID = setTimeout(this._flush, 0);
              }
            }
            shutdown() {
              if (this._isShutdown) {
                console.warn("Bridge was already shutdown.");
                return;
              }
              this.send("shutdown");
              this._isShutdown = true;
              this.addListener = function() {
              };
              this.emit = function() {
              };
              this.removeAllListeners();
              const wallUnlisten = this._wallUnlisten;
              if (wallUnlisten) {
                wallUnlisten();
              }
              do {
                this._flush();
              } while (this._messageQueue.length);
              if (this._timeoutID !== null) {
                clearTimeout(this._timeoutID);
                this._timeoutID = null;
              }
            }
          }
          __webpack_exports__["c"] = Bridge;
        },
        36: function(module2, exports2) {
          var g;
          g = function() {
            return this;
          }();
          try {
            g = g || new Function("return this")();
          } catch (e) {
            if (typeof window === "object")
              g = window;
          }
          module2.exports = g;
        },
        37: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return EventEmitter;
          });
          function _defineProperty(obj, key, value) {
            if (key in obj) {
              Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
            } else {
              obj[key] = value;
            }
            return obj;
          }
          class EventEmitter {
            constructor() {
              _defineProperty(this, "listenersMap", /* @__PURE__ */ new Map());
            }
            addListener(event, listener) {
              const listeners = this.listenersMap.get(event);
              if (listeners === void 0) {
                this.listenersMap.set(event, [listener]);
              } else {
                const index = listeners.indexOf(listener);
                if (index < 0) {
                  listeners.push(listener);
                }
              }
            }
            emit(event, ...args) {
              const listeners = this.listenersMap.get(event);
              if (listeners !== void 0) {
                if (listeners.length === 1) {
                  const listener = listeners[0];
                  listener.apply(null, args);
                } else {
                  let didThrow = false;
                  let caughtError = null;
                  const clonedListeners = Array.from(listeners);
                  for (let i = 0; i < clonedListeners.length; i++) {
                    const listener = clonedListeners[i];
                    try {
                      listener.apply(null, args);
                    } catch (error) {
                      if (caughtError === null) {
                        didThrow = true;
                        caughtError = error;
                      }
                    }
                  }
                  if (didThrow) {
                    throw caughtError;
                  }
                }
              }
            }
            removeAllListeners() {
              this.listenersMap.clear();
            }
            removeListener(event, listener) {
              const listeners = this.listenersMap.get(event);
              if (listeners !== void 0) {
                const index = listeners.indexOf(listener);
                if (index >= 0) {
                  listeners.splice(index, 1);
                }
              }
            }
          }
        },
        40: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          var simpleIsEqual = function simpleIsEqual2(a, b) {
            return a === b;
          };
          __webpack_exports__["a"] = function(resultFn) {
            var isEqual = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : simpleIsEqual;
            var lastThis = void 0;
            var lastArgs = [];
            var lastResult = void 0;
            var calledOnce = false;
            var isNewArgEqualToLast = function isNewArgEqualToLast2(newArg, index) {
              return isEqual(newArg, lastArgs[index]);
            };
            var result = function result2() {
              for (var _len = arguments.length, newArgs = Array(_len), _key = 0; _key < _len; _key++) {
                newArgs[_key] = arguments[_key];
              }
              if (calledOnce && lastThis === this && newArgs.length === lastArgs.length && newArgs.every(isNewArgEqualToLast)) {
                return lastResult;
              }
              calledOnce = true;
              lastThis = this;
              lastArgs = newArgs;
              lastResult = resultFn.apply(this, newArgs);
              return lastResult;
            };
            return result;
          };
        },
        41: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          (function(global) {
            __webpack_require__.d(__webpack_exports__, "c", function() {
              return registerRenderer;
            });
            __webpack_require__.d(__webpack_exports__, "a", function() {
              return patch;
            });
            __webpack_require__.d(__webpack_exports__, "b", function() {
              return patchForStrictMode;
            });
            __webpack_require__.d(__webpack_exports__, "d", function() {
              return unpatchForStrictMode;
            });
            var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(16);
            var _renderer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(67);
            var _DevToolsFiberComponentStack__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(115);
            var react_devtools_feature_flags__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);
            const OVERRIDE_CONSOLE_METHODS = ["error", "trace", "warn"];
            const DIMMED_NODE_CONSOLE_COLOR = "[2m%s[0m";
            const PREFIX_REGEX = /\s{4}(in|at)\s{1}/;
            const ROW_COLUMN_NUMBER_REGEX = /:\d+:\d+(\n|$)/;
            function isStringComponentStack(text) {
              return PREFIX_REGEX.test(text) || ROW_COLUMN_NUMBER_REGEX.test(text);
            }
            const STYLE_DIRECTIVE_REGEX = /^%c/;
            function isStrictModeOverride(args, method) {
              return args.length === 2 && STYLE_DIRECTIVE_REGEX.test(args[0]) && args[1] === `color: ${getConsoleColor(method) || ""}`;
            }
            function getConsoleColor(method) {
              switch (method) {
                case "warn":
                  return consoleSettingsRef.browserTheme === "light" ? "rgba(250, 180, 50, 0.75)" : "rgba(250, 180, 50, 0.5)";
                case "error":
                  return consoleSettingsRef.browserTheme === "light" ? "rgba(250, 123, 130, 0.75)" : "rgba(250, 123, 130, 0.5)";
                case "log":
                default:
                  return consoleSettingsRef.browserTheme === "light" ? "rgba(125, 125, 125, 0.75)" : "rgba(125, 125, 125, 0.5)";
              }
            }
            const injectedRenderers = /* @__PURE__ */ new Map();
            let targetConsole = console;
            let targetConsoleMethods = {};
            for (const method in console) {
              targetConsoleMethods[method] = console[method];
            }
            let unpatchFn = null;
            let isNode = false;
            try {
              isNode = global === void 0;
            } catch (error) {
            }
            function dangerous_setTargetConsoleForTesting(targetConsoleForTesting) {
              targetConsole = targetConsoleForTesting;
              targetConsoleMethods = {};
              for (const method in targetConsole) {
                targetConsoleMethods[method] = console[method];
              }
            }
            function registerRenderer(renderer, onErrorOrWarning) {
              const {
                currentDispatcherRef,
                getCurrentFiber,
                findFiberByHostInstance,
                version
              } = renderer;
              if (typeof findFiberByHostInstance !== "function") {
                return;
              }
              if (currentDispatcherRef != null && typeof getCurrentFiber === "function") {
                const {
                  ReactTypeOfWork
                } = Object(_renderer__WEBPACK_IMPORTED_MODULE_1__["b"])(version);
                injectedRenderers.set(renderer, {
                  currentDispatcherRef,
                  getCurrentFiber,
                  workTagMap: ReactTypeOfWork,
                  onErrorOrWarning
                });
              }
            }
            const consoleSettingsRef = {
              appendComponentStack: false,
              breakOnConsoleErrors: false,
              showInlineWarningsAndErrors: false,
              hideConsoleLogsInStrictMode: false,
              browserTheme: "dark"
            };
            function patch({
              appendComponentStack,
              breakOnConsoleErrors,
              showInlineWarningsAndErrors,
              hideConsoleLogsInStrictMode,
              browserTheme
            }) {
              consoleSettingsRef.appendComponentStack = appendComponentStack;
              consoleSettingsRef.breakOnConsoleErrors = breakOnConsoleErrors;
              consoleSettingsRef.showInlineWarningsAndErrors = showInlineWarningsAndErrors;
              consoleSettingsRef.hideConsoleLogsInStrictMode = hideConsoleLogsInStrictMode;
              consoleSettingsRef.browserTheme = browserTheme;
              if (appendComponentStack || breakOnConsoleErrors || showInlineWarningsAndErrors) {
                if (unpatchFn !== null) {
                  return;
                }
                const originalConsoleMethods = {};
                unpatchFn = () => {
                  for (const method in originalConsoleMethods) {
                    try {
                      targetConsole[method] = originalConsoleMethods[method];
                    } catch (error) {
                    }
                  }
                };
                OVERRIDE_CONSOLE_METHODS.forEach((method) => {
                  try {
                    const originalMethod = originalConsoleMethods[method] = targetConsole[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__ ? targetConsole[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__ : targetConsole[method];
                    const overrideMethod = (...args) => {
                      let shouldAppendWarningStack = false;
                      if (method !== "log") {
                        if (consoleSettingsRef.appendComponentStack) {
                          const lastArg = args.length > 0 ? args[args.length - 1] : null;
                          const alreadyHasComponentStack = typeof lastArg === "string" && isStringComponentStack(lastArg);
                          shouldAppendWarningStack = !alreadyHasComponentStack;
                        }
                      }
                      const shouldShowInlineWarningsAndErrors = consoleSettingsRef.showInlineWarningsAndErrors && (method === "error" || method === "warn");
                      for (const {
                        currentDispatcherRef,
                        getCurrentFiber,
                        onErrorOrWarning,
                        workTagMap
                      } of injectedRenderers.values()) {
                        const current = getCurrentFiber();
                        if (current != null) {
                          try {
                            if (shouldShowInlineWarningsAndErrors) {
                              if (typeof onErrorOrWarning === "function") {
                                onErrorOrWarning(current, method, args.slice());
                              }
                            }
                            if (shouldAppendWarningStack) {
                              const componentStack = Object(_DevToolsFiberComponentStack__WEBPACK_IMPORTED_MODULE_2__["a"])(workTagMap, current, currentDispatcherRef);
                              if (componentStack !== "") {
                                if (isStrictModeOverride(args, method)) {
                                  args[0] = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["f"])(args[0], componentStack);
                                } else {
                                  args.push(componentStack);
                                }
                              }
                            }
                          } catch (error) {
                            setTimeout(() => {
                              throw error;
                            }, 0);
                          } finally {
                            break;
                          }
                        }
                      }
                      if (consoleSettingsRef.breakOnConsoleErrors) {
                        debugger;
                      }
                      originalMethod(...args);
                    };
                    overrideMethod.__REACT_DEVTOOLS_ORIGINAL_METHOD__ = originalMethod;
                    originalMethod.__REACT_DEVTOOLS_OVERRIDE_METHOD__ = overrideMethod;
                    targetConsole[method] = overrideMethod;
                  } catch (error) {
                  }
                });
              } else {
                unpatch();
              }
            }
            function unpatch() {
              if (unpatchFn !== null) {
                unpatchFn();
                unpatchFn = null;
              }
            }
            let unpatchForStrictModeFn = null;
            function patchForStrictMode() {
              if (react_devtools_feature_flags__WEBPACK_IMPORTED_MODULE_3__["a"]) {
                const overrideConsoleMethods = ["error", "trace", "warn", "log"];
                if (unpatchForStrictModeFn !== null) {
                  return;
                }
                const originalConsoleMethods = {};
                unpatchForStrictModeFn = () => {
                  for (const method in originalConsoleMethods) {
                    try {
                      targetConsole[method] = originalConsoleMethods[method];
                    } catch (error) {
                    }
                  }
                };
                overrideConsoleMethods.forEach((method) => {
                  try {
                    const originalMethod = originalConsoleMethods[method] = targetConsole[method].__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ ? targetConsole[method].__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ : targetConsole[method];
                    const overrideMethod = (...args) => {
                      if (!consoleSettingsRef.hideConsoleLogsInStrictMode) {
                        if (isNode) {
                          originalMethod(DIMMED_NODE_CONSOLE_COLOR, Object(_utils__WEBPACK_IMPORTED_MODULE_0__["f"])(...args));
                        } else {
                          const color = getConsoleColor(method);
                          if (color) {
                            originalMethod(`%c${Object(_utils__WEBPACK_IMPORTED_MODULE_0__["f"])(...args)}`, `color: ${color}`);
                          } else {
                            throw Error("Console color is not defined");
                          }
                        }
                      }
                    };
                    overrideMethod.__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__ = originalMethod;
                    originalMethod.__REACT_DEVTOOLS_STRICT_MODE_OVERRIDE_METHOD__ = overrideMethod;
                    targetConsole[method] = overrideMethod;
                  } catch (error) {
                  }
                });
              }
            }
            function unpatchForStrictMode() {
              if (react_devtools_feature_flags__WEBPACK_IMPORTED_MODULE_3__["a"]) {
                if (unpatchForStrictModeFn !== null) {
                  unpatchForStrictModeFn();
                  unpatchForStrictModeFn = null;
                }
              }
            }
          }).call(this, __webpack_require__(36));
        },
        44: function(module2, exports2, __webpack_require__) {
          "use strict";
          var getOwnPropertySymbols = Object.getOwnPropertySymbols;
          var hasOwnProperty2 = Object.prototype.hasOwnProperty;
          var propIsEnumerable = Object.prototype.propertyIsEnumerable;
          function toObject(val) {
            if (val === null || val === void 0) {
              throw new TypeError("Object.assign cannot be called with null or undefined");
            }
            return Object(val);
          }
          function shouldUseNative() {
            try {
              if (!Object.assign) {
                return false;
              }
              var test1 = new String("abc");
              test1[5] = "de";
              if (Object.getOwnPropertyNames(test1)[0] === "5") {
                return false;
              }
              var test2 = {};
              for (var i = 0; i < 10; i++) {
                test2["_" + String.fromCharCode(i)] = i;
              }
              var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
                return test2[n];
              });
              if (order2.join("") !== "0123456789") {
                return false;
              }
              var test3 = {};
              "abcdefghijklmnopqrst".split("").forEach(function(letter) {
                test3[letter] = letter;
              });
              if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
                return false;
              }
              return true;
            } catch (err) {
              return false;
            }
          }
          module2.exports = shouldUseNative() ? Object.assign : function(target, source) {
            var from;
            var to = toObject(target);
            var symbols;
            for (var s = 1; s < arguments.length; s++) {
              from = Object(arguments[s]);
              for (var key in from) {
                if (hasOwnProperty2.call(from, key)) {
                  to[key] = from[key];
                }
              }
              if (getOwnPropertySymbols) {
                symbols = getOwnPropertySymbols(from);
                for (var i = 0; i < symbols.length; i++) {
                  if (propIsEnumerable.call(from, symbols[i])) {
                    to[symbols[i]] = from[symbols[i]];
                  }
                }
              }
            }
            return to;
          };
        },
        45: function(module2, exports2, __webpack_require__) {
          (function(process2) {
            exports2 = module2.exports = SemVer;
            var debug;
            if (typeof process2 === "object" && process2.env && process2.env.NODE_DEBUG && /\bsemver\b/i.test(process2.env.NODE_DEBUG)) {
              debug = function() {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift("SEMVER");
                console.log.apply(console, args);
              };
            } else {
              debug = function() {
              };
            }
            exports2.SEMVER_SPEC_VERSION = "2.0.0";
            var MAX_LENGTH = 256;
            var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
            var MAX_SAFE_COMPONENT_LENGTH = 16;
            var re = exports2.re = [];
            var src = exports2.src = [];
            var t = exports2.tokens = {};
            var R = 0;
            function tok(n) {
              t[n] = R++;
            }
            tok("NUMERICIDENTIFIER");
            src[t.NUMERICIDENTIFIER] = "0|[1-9]\\d*";
            tok("NUMERICIDENTIFIERLOOSE");
            src[t.NUMERICIDENTIFIERLOOSE] = "[0-9]+";
            tok("NONNUMERICIDENTIFIER");
            src[t.NONNUMERICIDENTIFIER] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
            tok("MAINVERSION");
            src[t.MAINVERSION] = "(" + src[t.NUMERICIDENTIFIER] + ")\\.(" + src[t.NUMERICIDENTIFIER] + ")\\.(" + src[t.NUMERICIDENTIFIER] + ")";
            tok("MAINVERSIONLOOSE");
            src[t.MAINVERSIONLOOSE] = "(" + src[t.NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[t.NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[t.NUMERICIDENTIFIERLOOSE] + ")";
            tok("PRERELEASEIDENTIFIER");
            src[t.PRERELEASEIDENTIFIER] = "(?:" + src[t.NUMERICIDENTIFIER] + "|" + src[t.NONNUMERICIDENTIFIER] + ")";
            tok("PRERELEASEIDENTIFIERLOOSE");
            src[t.PRERELEASEIDENTIFIERLOOSE] = "(?:" + src[t.NUMERICIDENTIFIERLOOSE] + "|" + src[t.NONNUMERICIDENTIFIER] + ")";
            tok("PRERELEASE");
            src[t.PRERELEASE] = "(?:-(" + src[t.PRERELEASEIDENTIFIER] + "(?:\\." + src[t.PRERELEASEIDENTIFIER] + ")*))";
            tok("PRERELEASELOOSE");
            src[t.PRERELEASELOOSE] = "(?:-?(" + src[t.PRERELEASEIDENTIFIERLOOSE] + "(?:\\." + src[t.PRERELEASEIDENTIFIERLOOSE] + ")*))";
            tok("BUILDIDENTIFIER");
            src[t.BUILDIDENTIFIER] = "[0-9A-Za-z-]+";
            tok("BUILD");
            src[t.BUILD] = "(?:\\+(" + src[t.BUILDIDENTIFIER] + "(?:\\." + src[t.BUILDIDENTIFIER] + ")*))";
            tok("FULL");
            tok("FULLPLAIN");
            src[t.FULLPLAIN] = "v?" + src[t.MAINVERSION] + src[t.PRERELEASE] + "?" + src[t.BUILD] + "?";
            src[t.FULL] = "^" + src[t.FULLPLAIN] + "$";
            tok("LOOSEPLAIN");
            src[t.LOOSEPLAIN] = "[v=\\s]*" + src[t.MAINVERSIONLOOSE] + src[t.PRERELEASELOOSE] + "?" + src[t.BUILD] + "?";
            tok("LOOSE");
            src[t.LOOSE] = "^" + src[t.LOOSEPLAIN] + "$";
            tok("GTLT");
            src[t.GTLT] = "((?:<|>)?=?)";
            tok("XRANGEIDENTIFIERLOOSE");
            src[t.XRANGEIDENTIFIERLOOSE] = src[t.NUMERICIDENTIFIERLOOSE] + "|x|X|\\*";
            tok("XRANGEIDENTIFIER");
            src[t.XRANGEIDENTIFIER] = src[t.NUMERICIDENTIFIER] + "|x|X|\\*";
            tok("XRANGEPLAIN");
            src[t.XRANGEPLAIN] = "[v=\\s]*(" + src[t.XRANGEIDENTIFIER] + ")(?:\\.(" + src[t.XRANGEIDENTIFIER] + ")(?:\\.(" + src[t.XRANGEIDENTIFIER] + ")(?:" + src[t.PRERELEASE] + ")?" + src[t.BUILD] + "?)?)?";
            tok("XRANGEPLAINLOOSE");
            src[t.XRANGEPLAINLOOSE] = "[v=\\s]*(" + src[t.XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[t.XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[t.XRANGEIDENTIFIERLOOSE] + ")(?:" + src[t.PRERELEASELOOSE] + ")?" + src[t.BUILD] + "?)?)?";
            tok("XRANGE");
            src[t.XRANGE] = "^" + src[t.GTLT] + "\\s*" + src[t.XRANGEPLAIN] + "$";
            tok("XRANGELOOSE");
            src[t.XRANGELOOSE] = "^" + src[t.GTLT] + "\\s*" + src[t.XRANGEPLAINLOOSE] + "$";
            tok("COERCE");
            src[t.COERCE] = "(^|[^\\d])(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "})(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:$|[^\\d])";
            tok("COERCERTL");
            re[t.COERCERTL] = new RegExp(src[t.COERCE], "g");
            tok("LONETILDE");
            src[t.LONETILDE] = "(?:~>?)";
            tok("TILDETRIM");
            src[t.TILDETRIM] = "(\\s*)" + src[t.LONETILDE] + "\\s+";
            re[t.TILDETRIM] = new RegExp(src[t.TILDETRIM], "g");
            var tildeTrimReplace = "$1~";
            tok("TILDE");
            src[t.TILDE] = "^" + src[t.LONETILDE] + src[t.XRANGEPLAIN] + "$";
            tok("TILDELOOSE");
            src[t.TILDELOOSE] = "^" + src[t.LONETILDE] + src[t.XRANGEPLAINLOOSE] + "$";
            tok("LONECARET");
            src[t.LONECARET] = "(?:\\^)";
            tok("CARETTRIM");
            src[t.CARETTRIM] = "(\\s*)" + src[t.LONECARET] + "\\s+";
            re[t.CARETTRIM] = new RegExp(src[t.CARETTRIM], "g");
            var caretTrimReplace = "$1^";
            tok("CARET");
            src[t.CARET] = "^" + src[t.LONECARET] + src[t.XRANGEPLAIN] + "$";
            tok("CARETLOOSE");
            src[t.CARETLOOSE] = "^" + src[t.LONECARET] + src[t.XRANGEPLAINLOOSE] + "$";
            tok("COMPARATORLOOSE");
            src[t.COMPARATORLOOSE] = "^" + src[t.GTLT] + "\\s*(" + src[t.LOOSEPLAIN] + ")$|^$";
            tok("COMPARATOR");
            src[t.COMPARATOR] = "^" + src[t.GTLT] + "\\s*(" + src[t.FULLPLAIN] + ")$|^$";
            tok("COMPARATORTRIM");
            src[t.COMPARATORTRIM] = "(\\s*)" + src[t.GTLT] + "\\s*(" + src[t.LOOSEPLAIN] + "|" + src[t.XRANGEPLAIN] + ")";
            re[t.COMPARATORTRIM] = new RegExp(src[t.COMPARATORTRIM], "g");
            var comparatorTrimReplace = "$1$2$3";
            tok("HYPHENRANGE");
            src[t.HYPHENRANGE] = "^\\s*(" + src[t.XRANGEPLAIN] + ")\\s+-\\s+(" + src[t.XRANGEPLAIN] + ")\\s*$";
            tok("HYPHENRANGELOOSE");
            src[t.HYPHENRANGELOOSE] = "^\\s*(" + src[t.XRANGEPLAINLOOSE] + ")\\s+-\\s+(" + src[t.XRANGEPLAINLOOSE] + ")\\s*$";
            tok("STAR");
            src[t.STAR] = "(<|>)?=?\\s*\\*";
            for (var i = 0; i < R; i++) {
              debug(i, src[i]);
              if (!re[i]) {
                re[i] = new RegExp(src[i]);
              }
            }
            exports2.parse = parse;
            function parse(version, options) {
              if (!options || typeof options !== "object") {
                options = {
                  loose: !!options,
                  includePrerelease: false
                };
              }
              if (version instanceof SemVer) {
                return version;
              }
              if (typeof version !== "string") {
                return null;
              }
              if (version.length > MAX_LENGTH) {
                return null;
              }
              var r = options.loose ? re[t.LOOSE] : re[t.FULL];
              if (!r.test(version)) {
                return null;
              }
              try {
                return new SemVer(version, options);
              } catch (er) {
                return null;
              }
            }
            exports2.valid = valid;
            function valid(version, options) {
              var v = parse(version, options);
              return v ? v.version : null;
            }
            exports2.clean = clean;
            function clean(version, options) {
              var s = parse(version.trim().replace(/^[=v]+/, ""), options);
              return s ? s.version : null;
            }
            exports2.SemVer = SemVer;
            function SemVer(version, options) {
              if (!options || typeof options !== "object") {
                options = {
                  loose: !!options,
                  includePrerelease: false
                };
              }
              if (version instanceof SemVer) {
                if (version.loose === options.loose) {
                  return version;
                } else {
                  version = version.version;
                }
              } else if (typeof version !== "string") {
                throw new TypeError("Invalid Version: " + version);
              }
              if (version.length > MAX_LENGTH) {
                throw new TypeError("version is longer than " + MAX_LENGTH + " characters");
              }
              if (!(this instanceof SemVer)) {
                return new SemVer(version, options);
              }
              debug("SemVer", version, options);
              this.options = options;
              this.loose = !!options.loose;
              var m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
              if (!m) {
                throw new TypeError("Invalid Version: " + version);
              }
              this.raw = version;
              this.major = +m[1];
              this.minor = +m[2];
              this.patch = +m[3];
              if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
                throw new TypeError("Invalid major version");
              }
              if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
                throw new TypeError("Invalid minor version");
              }
              if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
                throw new TypeError("Invalid patch version");
              }
              if (!m[4]) {
                this.prerelease = [];
              } else {
                this.prerelease = m[4].split(".").map(function(id) {
                  if (/^[0-9]+$/.test(id)) {
                    var num = +id;
                    if (num >= 0 && num < MAX_SAFE_INTEGER) {
                      return num;
                    }
                  }
                  return id;
                });
              }
              this.build = m[5] ? m[5].split(".") : [];
              this.format();
            }
            SemVer.prototype.format = function() {
              this.version = this.major + "." + this.minor + "." + this.patch;
              if (this.prerelease.length) {
                this.version += "-" + this.prerelease.join(".");
              }
              return this.version;
            };
            SemVer.prototype.toString = function() {
              return this.version;
            };
            SemVer.prototype.compare = function(other) {
              debug("SemVer.compare", this.version, this.options, other);
              if (!(other instanceof SemVer)) {
                other = new SemVer(other, this.options);
              }
              return this.compareMain(other) || this.comparePre(other);
            };
            SemVer.prototype.compareMain = function(other) {
              if (!(other instanceof SemVer)) {
                other = new SemVer(other, this.options);
              }
              return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
            };
            SemVer.prototype.comparePre = function(other) {
              if (!(other instanceof SemVer)) {
                other = new SemVer(other, this.options);
              }
              if (this.prerelease.length && !other.prerelease.length) {
                return -1;
              } else if (!this.prerelease.length && other.prerelease.length) {
                return 1;
              } else if (!this.prerelease.length && !other.prerelease.length) {
                return 0;
              }
              var i2 = 0;
              do {
                var a = this.prerelease[i2];
                var b = other.prerelease[i2];
                debug("prerelease compare", i2, a, b);
                if (a === void 0 && b === void 0) {
                  return 0;
                } else if (b === void 0) {
                  return 1;
                } else if (a === void 0) {
                  return -1;
                } else if (a === b) {
                  continue;
                } else {
                  return compareIdentifiers(a, b);
                }
              } while (++i2);
            };
            SemVer.prototype.compareBuild = function(other) {
              if (!(other instanceof SemVer)) {
                other = new SemVer(other, this.options);
              }
              var i2 = 0;
              do {
                var a = this.build[i2];
                var b = other.build[i2];
                debug("prerelease compare", i2, a, b);
                if (a === void 0 && b === void 0) {
                  return 0;
                } else if (b === void 0) {
                  return 1;
                } else if (a === void 0) {
                  return -1;
                } else if (a === b) {
                  continue;
                } else {
                  return compareIdentifiers(a, b);
                }
              } while (++i2);
            };
            SemVer.prototype.inc = function(release, identifier) {
              switch (release) {
                case "premajor":
                  this.prerelease.length = 0;
                  this.patch = 0;
                  this.minor = 0;
                  this.major++;
                  this.inc("pre", identifier);
                  break;
                case "preminor":
                  this.prerelease.length = 0;
                  this.patch = 0;
                  this.minor++;
                  this.inc("pre", identifier);
                  break;
                case "prepatch":
                  this.prerelease.length = 0;
                  this.inc("patch", identifier);
                  this.inc("pre", identifier);
                  break;
                case "prerelease":
                  if (this.prerelease.length === 0) {
                    this.inc("patch", identifier);
                  }
                  this.inc("pre", identifier);
                  break;
                case "major":
                  if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
                    this.major++;
                  }
                  this.minor = 0;
                  this.patch = 0;
                  this.prerelease = [];
                  break;
                case "minor":
                  if (this.patch !== 0 || this.prerelease.length === 0) {
                    this.minor++;
                  }
                  this.patch = 0;
                  this.prerelease = [];
                  break;
                case "patch":
                  if (this.prerelease.length === 0) {
                    this.patch++;
                  }
                  this.prerelease = [];
                  break;
                case "pre":
                  if (this.prerelease.length === 0) {
                    this.prerelease = [0];
                  } else {
                    var i2 = this.prerelease.length;
                    while (--i2 >= 0) {
                      if (typeof this.prerelease[i2] === "number") {
                        this.prerelease[i2]++;
                        i2 = -2;
                      }
                    }
                    if (i2 === -1) {
                      this.prerelease.push(0);
                    }
                  }
                  if (identifier) {
                    if (this.prerelease[0] === identifier) {
                      if (isNaN(this.prerelease[1])) {
                        this.prerelease = [identifier, 0];
                      }
                    } else {
                      this.prerelease = [identifier, 0];
                    }
                  }
                  break;
                default:
                  throw new Error("invalid increment argument: " + release);
              }
              this.format();
              this.raw = this.version;
              return this;
            };
            exports2.inc = inc;
            function inc(version, release, loose, identifier) {
              if (typeof loose === "string") {
                identifier = loose;
                loose = void 0;
              }
              try {
                return new SemVer(version, loose).inc(release, identifier).version;
              } catch (er) {
                return null;
              }
            }
            exports2.diff = diff;
            function diff(version1, version2) {
              if (eq(version1, version2)) {
                return null;
              } else {
                var v1 = parse(version1);
                var v2 = parse(version2);
                var prefix = "";
                if (v1.prerelease.length || v2.prerelease.length) {
                  prefix = "pre";
                  var defaultResult = "prerelease";
                }
                for (var key in v1) {
                  if (key === "major" || key === "minor" || key === "patch") {
                    if (v1[key] !== v2[key]) {
                      return prefix + key;
                    }
                  }
                }
                return defaultResult;
              }
            }
            exports2.compareIdentifiers = compareIdentifiers;
            var numeric = /^[0-9]+$/;
            function compareIdentifiers(a, b) {
              var anum = numeric.test(a);
              var bnum = numeric.test(b);
              if (anum && bnum) {
                a = +a;
                b = +b;
              }
              return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
            }
            exports2.rcompareIdentifiers = rcompareIdentifiers;
            function rcompareIdentifiers(a, b) {
              return compareIdentifiers(b, a);
            }
            exports2.major = major;
            function major(a, loose) {
              return new SemVer(a, loose).major;
            }
            exports2.minor = minor;
            function minor(a, loose) {
              return new SemVer(a, loose).minor;
            }
            exports2.patch = patch;
            function patch(a, loose) {
              return new SemVer(a, loose).patch;
            }
            exports2.compare = compare;
            function compare(a, b, loose) {
              return new SemVer(a, loose).compare(new SemVer(b, loose));
            }
            exports2.compareLoose = compareLoose;
            function compareLoose(a, b) {
              return compare(a, b, true);
            }
            exports2.compareBuild = compareBuild;
            function compareBuild(a, b, loose) {
              var versionA = new SemVer(a, loose);
              var versionB = new SemVer(b, loose);
              return versionA.compare(versionB) || versionA.compareBuild(versionB);
            }
            exports2.rcompare = rcompare;
            function rcompare(a, b, loose) {
              return compare(b, a, loose);
            }
            exports2.sort = sort;
            function sort(list, loose) {
              return list.sort(function(a, b) {
                return exports2.compareBuild(a, b, loose);
              });
            }
            exports2.rsort = rsort;
            function rsort(list, loose) {
              return list.sort(function(a, b) {
                return exports2.compareBuild(b, a, loose);
              });
            }
            exports2.gt = gt;
            function gt(a, b, loose) {
              return compare(a, b, loose) > 0;
            }
            exports2.lt = lt;
            function lt(a, b, loose) {
              return compare(a, b, loose) < 0;
            }
            exports2.eq = eq;
            function eq(a, b, loose) {
              return compare(a, b, loose) === 0;
            }
            exports2.neq = neq;
            function neq(a, b, loose) {
              return compare(a, b, loose) !== 0;
            }
            exports2.gte = gte;
            function gte(a, b, loose) {
              return compare(a, b, loose) >= 0;
            }
            exports2.lte = lte;
            function lte(a, b, loose) {
              return compare(a, b, loose) <= 0;
            }
            exports2.cmp = cmp;
            function cmp(a, op, b, loose) {
              switch (op) {
                case "===":
                  if (typeof a === "object")
                    a = a.version;
                  if (typeof b === "object")
                    b = b.version;
                  return a === b;
                case "!==":
                  if (typeof a === "object")
                    a = a.version;
                  if (typeof b === "object")
                    b = b.version;
                  return a !== b;
                case "":
                case "=":
                case "==":
                  return eq(a, b, loose);
                case "!=":
                  return neq(a, b, loose);
                case ">":
                  return gt(a, b, loose);
                case ">=":
                  return gte(a, b, loose);
                case "<":
                  return lt(a, b, loose);
                case "<=":
                  return lte(a, b, loose);
                default:
                  throw new TypeError("Invalid operator: " + op);
              }
            }
            exports2.Comparator = Comparator;
            function Comparator(comp, options) {
              if (!options || typeof options !== "object") {
                options = {
                  loose: !!options,
                  includePrerelease: false
                };
              }
              if (comp instanceof Comparator) {
                if (comp.loose === !!options.loose) {
                  return comp;
                } else {
                  comp = comp.value;
                }
              }
              if (!(this instanceof Comparator)) {
                return new Comparator(comp, options);
              }
              debug("comparator", comp, options);
              this.options = options;
              this.loose = !!options.loose;
              this.parse(comp);
              if (this.semver === ANY) {
                this.value = "";
              } else {
                this.value = this.operator + this.semver.version;
              }
              debug("comp", this);
            }
            var ANY = {};
            Comparator.prototype.parse = function(comp) {
              var r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
              var m = comp.match(r);
              if (!m) {
                throw new TypeError("Invalid comparator: " + comp);
              }
              this.operator = m[1] !== void 0 ? m[1] : "";
              if (this.operator === "=") {
                this.operator = "";
              }
              if (!m[2]) {
                this.semver = ANY;
              } else {
                this.semver = new SemVer(m[2], this.options.loose);
              }
            };
            Comparator.prototype.toString = function() {
              return this.value;
            };
            Comparator.prototype.test = function(version) {
              debug("Comparator.test", version, this.options.loose);
              if (this.semver === ANY || version === ANY) {
                return true;
              }
              if (typeof version === "string") {
                try {
                  version = new SemVer(version, this.options);
                } catch (er) {
                  return false;
                }
              }
              return cmp(version, this.operator, this.semver, this.options);
            };
            Comparator.prototype.intersects = function(comp, options) {
              if (!(comp instanceof Comparator)) {
                throw new TypeError("a Comparator is required");
              }
              if (!options || typeof options !== "object") {
                options = {
                  loose: !!options,
                  includePrerelease: false
                };
              }
              var rangeTmp;
              if (this.operator === "") {
                if (this.value === "") {
                  return true;
                }
                rangeTmp = new Range(comp.value, options);
                return satisfies(this.value, rangeTmp, options);
              } else if (comp.operator === "") {
                if (comp.value === "") {
                  return true;
                }
                rangeTmp = new Range(this.value, options);
                return satisfies(comp.semver, rangeTmp, options);
              }
              var sameDirectionIncreasing = (this.operator === ">=" || this.operator === ">") && (comp.operator === ">=" || comp.operator === ">");
              var sameDirectionDecreasing = (this.operator === "<=" || this.operator === "<") && (comp.operator === "<=" || comp.operator === "<");
              var sameSemVer = this.semver.version === comp.semver.version;
              var differentDirectionsInclusive = (this.operator === ">=" || this.operator === "<=") && (comp.operator === ">=" || comp.operator === "<=");
              var oppositeDirectionsLessThan = cmp(this.semver, "<", comp.semver, options) && (this.operator === ">=" || this.operator === ">") && (comp.operator === "<=" || comp.operator === "<");
              var oppositeDirectionsGreaterThan = cmp(this.semver, ">", comp.semver, options) && (this.operator === "<=" || this.operator === "<") && (comp.operator === ">=" || comp.operator === ">");
              return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
            };
            exports2.Range = Range;
            function Range(range, options) {
              if (!options || typeof options !== "object") {
                options = {
                  loose: !!options,
                  includePrerelease: false
                };
              }
              if (range instanceof Range) {
                if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
                  return range;
                } else {
                  return new Range(range.raw, options);
                }
              }
              if (range instanceof Comparator) {
                return new Range(range.value, options);
              }
              if (!(this instanceof Range)) {
                return new Range(range, options);
              }
              this.options = options;
              this.loose = !!options.loose;
              this.includePrerelease = !!options.includePrerelease;
              this.raw = range;
              this.set = range.split(/\s*\|\|\s*/).map(function(range2) {
                return this.parseRange(range2.trim());
              }, this).filter(function(c) {
                return c.length;
              });
              if (!this.set.length) {
                throw new TypeError("Invalid SemVer Range: " + range);
              }
              this.format();
            }
            Range.prototype.format = function() {
              this.range = this.set.map(function(comps) {
                return comps.join(" ").trim();
              }).join("||").trim();
              return this.range;
            };
            Range.prototype.toString = function() {
              return this.range;
            };
            Range.prototype.parseRange = function(range) {
              var loose = this.options.loose;
              range = range.trim();
              var hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
              range = range.replace(hr, hyphenReplace);
              debug("hyphen replace", range);
              range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
              debug("comparator trim", range, re[t.COMPARATORTRIM]);
              range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
              range = range.replace(re[t.CARETTRIM], caretTrimReplace);
              range = range.split(/\s+/).join(" ");
              var compRe = loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
              var set = range.split(" ").map(function(comp) {
                return parseComparator(comp, this.options);
              }, this).join(" ").split(/\s+/);
              if (this.options.loose) {
                set = set.filter(function(comp) {
                  return !!comp.match(compRe);
                });
              }
              set = set.map(function(comp) {
                return new Comparator(comp, this.options);
              }, this);
              return set;
            };
            Range.prototype.intersects = function(range, options) {
              if (!(range instanceof Range)) {
                throw new TypeError("a Range is required");
              }
              return this.set.some(function(thisComparators) {
                return isSatisfiable(thisComparators, options) && range.set.some(function(rangeComparators) {
                  return isSatisfiable(rangeComparators, options) && thisComparators.every(function(thisComparator) {
                    return rangeComparators.every(function(rangeComparator) {
                      return thisComparator.intersects(rangeComparator, options);
                    });
                  });
                });
              });
            };
            function isSatisfiable(comparators, options) {
              var result = true;
              var remainingComparators = comparators.slice();
              var testComparator = remainingComparators.pop();
              while (result && remainingComparators.length) {
                result = remainingComparators.every(function(otherComparator) {
                  return testComparator.intersects(otherComparator, options);
                });
                testComparator = remainingComparators.pop();
              }
              return result;
            }
            exports2.toComparators = toComparators;
            function toComparators(range, options) {
              return new Range(range, options).set.map(function(comp) {
                return comp.map(function(c) {
                  return c.value;
                }).join(" ").trim().split(" ");
              });
            }
            function parseComparator(comp, options) {
              debug("comp", comp, options);
              comp = replaceCarets(comp, options);
              debug("caret", comp);
              comp = replaceTildes(comp, options);
              debug("tildes", comp);
              comp = replaceXRanges(comp, options);
              debug("xrange", comp);
              comp = replaceStars(comp, options);
              debug("stars", comp);
              return comp;
            }
            function isX(id) {
              return !id || id.toLowerCase() === "x" || id === "*";
            }
            function replaceTildes(comp, options) {
              return comp.trim().split(/\s+/).map(function(comp2) {
                return replaceTilde(comp2, options);
              }).join(" ");
            }
            function replaceTilde(comp, options) {
              var r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
              return comp.replace(r, function(_, M, m, p, pr) {
                debug("tilde", comp, _, M, m, p, pr);
                var ret;
                if (isX(M)) {
                  ret = "";
                } else if (isX(m)) {
                  ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
                } else if (isX(p)) {
                  ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
                } else if (pr) {
                  debug("replaceTilde pr", pr);
                  ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
                } else {
                  ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
                }
                debug("tilde return", ret);
                return ret;
              });
            }
            function replaceCarets(comp, options) {
              return comp.trim().split(/\s+/).map(function(comp2) {
                return replaceCaret(comp2, options);
              }).join(" ");
            }
            function replaceCaret(comp, options) {
              debug("caret", comp, options);
              var r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
              return comp.replace(r, function(_, M, m, p, pr) {
                debug("caret", comp, _, M, m, p, pr);
                var ret;
                if (isX(M)) {
                  ret = "";
                } else if (isX(m)) {
                  ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
                } else if (isX(p)) {
                  if (M === "0") {
                    ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
                  } else {
                    ret = ">=" + M + "." + m + ".0 <" + (+M + 1) + ".0.0";
                  }
                } else if (pr) {
                  debug("replaceCaret pr", pr);
                  if (M === "0") {
                    if (m === "0") {
                      ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + m + "." + (+p + 1);
                    } else {
                      ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
                    }
                  } else {
                    ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + (+M + 1) + ".0.0";
                  }
                } else {
                  debug("no pr");
                  if (M === "0") {
                    if (m === "0") {
                      ret = ">=" + M + "." + m + "." + p + " <" + M + "." + m + "." + (+p + 1);
                    } else {
                      ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
                    }
                  } else {
                    ret = ">=" + M + "." + m + "." + p + " <" + (+M + 1) + ".0.0";
                  }
                }
                debug("caret return", ret);
                return ret;
              });
            }
            function replaceXRanges(comp, options) {
              debug("replaceXRanges", comp, options);
              return comp.split(/\s+/).map(function(comp2) {
                return replaceXRange(comp2, options);
              }).join(" ");
            }
            function replaceXRange(comp, options) {
              comp = comp.trim();
              var r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
              return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
                debug("xRange", comp, ret, gtlt, M, m, p, pr);
                var xM = isX(M);
                var xm = xM || isX(m);
                var xp = xm || isX(p);
                var anyX = xp;
                if (gtlt === "=" && anyX) {
                  gtlt = "";
                }
                pr = options.includePrerelease ? "-0" : "";
                if (xM) {
                  if (gtlt === ">" || gtlt === "<") {
                    ret = "<0.0.0-0";
                  } else {
                    ret = "*";
                  }
                } else if (gtlt && anyX) {
                  if (xm) {
                    m = 0;
                  }
                  p = 0;
                  if (gtlt === ">") {
                    gtlt = ">=";
                    if (xm) {
                      M = +M + 1;
                      m = 0;
                      p = 0;
                    } else {
                      m = +m + 1;
                      p = 0;
                    }
                  } else if (gtlt === "<=") {
                    gtlt = "<";
                    if (xm) {
                      M = +M + 1;
                    } else {
                      m = +m + 1;
                    }
                  }
                  ret = gtlt + M + "." + m + "." + p + pr;
                } else if (xm) {
                  ret = ">=" + M + ".0.0" + pr + " <" + (+M + 1) + ".0.0" + pr;
                } else if (xp) {
                  ret = ">=" + M + "." + m + ".0" + pr + " <" + M + "." + (+m + 1) + ".0" + pr;
                }
                debug("xRange return", ret);
                return ret;
              });
            }
            function replaceStars(comp, options) {
              debug("replaceStars", comp, options);
              return comp.trim().replace(re[t.STAR], "");
            }
            function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
              if (isX(fM)) {
                from = "";
              } else if (isX(fm)) {
                from = ">=" + fM + ".0.0";
              } else if (isX(fp)) {
                from = ">=" + fM + "." + fm + ".0";
              } else {
                from = ">=" + from;
              }
              if (isX(tM)) {
                to = "";
              } else if (isX(tm)) {
                to = "<" + (+tM + 1) + ".0.0";
              } else if (isX(tp)) {
                to = "<" + tM + "." + (+tm + 1) + ".0";
              } else if (tpr) {
                to = "<=" + tM + "." + tm + "." + tp + "-" + tpr;
              } else {
                to = "<=" + to;
              }
              return (from + " " + to).trim();
            }
            Range.prototype.test = function(version) {
              if (!version) {
                return false;
              }
              if (typeof version === "string") {
                try {
                  version = new SemVer(version, this.options);
                } catch (er) {
                  return false;
                }
              }
              for (var i2 = 0; i2 < this.set.length; i2++) {
                if (testSet(this.set[i2], version, this.options)) {
                  return true;
                }
              }
              return false;
            };
            function testSet(set, version, options) {
              for (var i2 = 0; i2 < set.length; i2++) {
                if (!set[i2].test(version)) {
                  return false;
                }
              }
              if (version.prerelease.length && !options.includePrerelease) {
                for (i2 = 0; i2 < set.length; i2++) {
                  debug(set[i2].semver);
                  if (set[i2].semver === ANY) {
                    continue;
                  }
                  if (set[i2].semver.prerelease.length > 0) {
                    var allowed = set[i2].semver;
                    if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
                      return true;
                    }
                  }
                }
                return false;
              }
              return true;
            }
            exports2.satisfies = satisfies;
            function satisfies(version, range, options) {
              try {
                range = new Range(range, options);
              } catch (er) {
                return false;
              }
              return range.test(version);
            }
            exports2.maxSatisfying = maxSatisfying;
            function maxSatisfying(versions, range, options) {
              var max = null;
              var maxSV = null;
              try {
                var rangeObj = new Range(range, options);
              } catch (er) {
                return null;
              }
              versions.forEach(function(v) {
                if (rangeObj.test(v)) {
                  if (!max || maxSV.compare(v) === -1) {
                    max = v;
                    maxSV = new SemVer(max, options);
                  }
                }
              });
              return max;
            }
            exports2.minSatisfying = minSatisfying;
            function minSatisfying(versions, range, options) {
              var min = null;
              var minSV = null;
              try {
                var rangeObj = new Range(range, options);
              } catch (er) {
                return null;
              }
              versions.forEach(function(v) {
                if (rangeObj.test(v)) {
                  if (!min || minSV.compare(v) === 1) {
                    min = v;
                    minSV = new SemVer(min, options);
                  }
                }
              });
              return min;
            }
            exports2.minVersion = minVersion;
            function minVersion(range, loose) {
              range = new Range(range, loose);
              var minver = new SemVer("0.0.0");
              if (range.test(minver)) {
                return minver;
              }
              minver = new SemVer("0.0.0-0");
              if (range.test(minver)) {
                return minver;
              }
              minver = null;
              for (var i2 = 0; i2 < range.set.length; ++i2) {
                var comparators = range.set[i2];
                comparators.forEach(function(comparator) {
                  var compver = new SemVer(comparator.semver.version);
                  switch (comparator.operator) {
                    case ">":
                      if (compver.prerelease.length === 0) {
                        compver.patch++;
                      } else {
                        compver.prerelease.push(0);
                      }
                      compver.raw = compver.format();
                    case "":
                    case ">=":
                      if (!minver || gt(minver, compver)) {
                        minver = compver;
                      }
                      break;
                    case "<":
                    case "<=":
                      break;
                    default:
                      throw new Error("Unexpected operation: " + comparator.operator);
                  }
                });
              }
              if (minver && range.test(minver)) {
                return minver;
              }
              return null;
            }
            exports2.validRange = validRange;
            function validRange(range, options) {
              try {
                return new Range(range, options).range || "*";
              } catch (er) {
                return null;
              }
            }
            exports2.ltr = ltr;
            function ltr(version, range, options) {
              return outside(version, range, "<", options);
            }
            exports2.gtr = gtr;
            function gtr(version, range, options) {
              return outside(version, range, ">", options);
            }
            exports2.outside = outside;
            function outside(version, range, hilo, options) {
              version = new SemVer(version, options);
              range = new Range(range, options);
              var gtfn, ltefn, ltfn, comp, ecomp;
              switch (hilo) {
                case ">":
                  gtfn = gt;
                  ltefn = lte;
                  ltfn = lt;
                  comp = ">";
                  ecomp = ">=";
                  break;
                case "<":
                  gtfn = lt;
                  ltefn = gte;
                  ltfn = gt;
                  comp = "<";
                  ecomp = "<=";
                  break;
                default:
                  throw new TypeError('Must provide a hilo val of "<" or ">"');
              }
              if (satisfies(version, range, options)) {
                return false;
              }
              for (var i2 = 0; i2 < range.set.length; ++i2) {
                var comparators = range.set[i2];
                var high = null;
                var low = null;
                comparators.forEach(function(comparator) {
                  if (comparator.semver === ANY) {
                    comparator = new Comparator(">=0.0.0");
                  }
                  high = high || comparator;
                  low = low || comparator;
                  if (gtfn(comparator.semver, high.semver, options)) {
                    high = comparator;
                  } else if (ltfn(comparator.semver, low.semver, options)) {
                    low = comparator;
                  }
                });
                if (high.operator === comp || high.operator === ecomp) {
                  return false;
                }
                if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
                  return false;
                } else if (low.operator === ecomp && ltfn(version, low.semver)) {
                  return false;
                }
              }
              return true;
            }
            exports2.prerelease = prerelease;
            function prerelease(version, options) {
              var parsed = parse(version, options);
              return parsed && parsed.prerelease.length ? parsed.prerelease : null;
            }
            exports2.intersects = intersects;
            function intersects(r1, r2, options) {
              r1 = new Range(r1, options);
              r2 = new Range(r2, options);
              return r1.intersects(r2);
            }
            exports2.coerce = coerce;
            function coerce(version, options) {
              if (version instanceof SemVer) {
                return version;
              }
              if (typeof version === "number") {
                version = String(version);
              }
              if (typeof version !== "string") {
                return null;
              }
              options = options || {};
              var match = null;
              if (!options.rtl) {
                match = version.match(re[t.COERCE]);
              } else {
                var next;
                while ((next = re[t.COERCERTL].exec(version)) && (!match || match.index + match[0].length !== version.length)) {
                  if (!match || next.index + next[0].length !== match.index + match[0].length) {
                    match = next;
                  }
                  re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
                }
                re[t.COERCERTL].lastIndex = -1;
              }
              if (match === null) {
                return null;
              }
              return parse(match[2] + "." + (match[3] || "0") + "." + (match[4] || "0"), options);
            }
          }).call(this, __webpack_require__(59));
        },
        48: function(module2, exports2, __webpack_require__) {
          var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
          (function(root, factory) {
            "use strict";
            if (true) {
              !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(80)], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports2, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
            } else {
            }
          })(this, function ErrorStackParser(StackFrame) {
            "use strict";
            var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
            var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
            var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
            return {
              parse: function ErrorStackParser$$parse(error) {
                if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") {
                  return this.parseOpera(error);
                } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                  return this.parseV8OrIE(error);
                } else if (error.stack) {
                  return this.parseFFOrSafari(error);
                } else {
                  throw new Error("Cannot parse given Error object");
                }
              },
              extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
                if (urlLike.indexOf(":") === -1) {
                  return [urlLike];
                }
                var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
                var parts = regExp.exec(urlLike.replace(/[()]/g, ""));
                return [parts[1], parts[2] || void 0, parts[3] || void 0];
              },
              parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
                var filtered = error.stack.split("\n").filter(function(line) {
                  return !!line.match(CHROME_IE_STACK_REGEXP);
                }, this);
                return filtered.map(function(line) {
                  if (line.indexOf("(eval ") > -1) {
                    line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(\),.*$)/g, "");
                  }
                  var sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(");
                  var location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
                  sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
                  var tokens = sanitizedLine.split(/\s+/).slice(1);
                  var locationParts = this.extractLocation(location ? location[1] : tokens.pop());
                  var functionName = tokens.join(" ") || void 0;
                  var fileName = ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1 ? void 0 : locationParts[0];
                  return new StackFrame({
                    functionName,
                    fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                  });
                }, this);
              },
              parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
                var filtered = error.stack.split("\n").filter(function(line) {
                  return !line.match(SAFARI_NATIVE_CODE_REGEXP);
                }, this);
                return filtered.map(function(line) {
                  if (line.indexOf(" > eval") > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
                  }
                  if (line.indexOf("@") === -1 && line.indexOf(":") === -1) {
                    return new StackFrame({
                      functionName: line
                    });
                  } else {
                    var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                    var matches = line.match(functionNameRegex);
                    var functionName = matches && matches[1] ? matches[1] : void 0;
                    var locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
                    return new StackFrame({
                      functionName,
                      fileName: locationParts[0],
                      lineNumber: locationParts[1],
                      columnNumber: locationParts[2],
                      source: line
                    });
                  }
                }, this);
              },
              parseOpera: function ErrorStackParser$$parseOpera(e) {
                if (!e.stacktrace || e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length) {
                  return this.parseOpera9(e);
                } else if (!e.stack) {
                  return this.parseOpera10(e);
                } else {
                  return this.parseOpera11(e);
                }
              },
              parseOpera9: function ErrorStackParser$$parseOpera9(e) {
                var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
                var lines = e.message.split("\n");
                var result = [];
                for (var i = 2, len = lines.length; i < len; i += 2) {
                  var match = lineRE.exec(lines[i]);
                  if (match) {
                    result.push(new StackFrame({
                      fileName: match[2],
                      lineNumber: match[1],
                      source: lines[i]
                    }));
                  }
                }
                return result;
              },
              parseOpera10: function ErrorStackParser$$parseOpera10(e) {
                var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
                var lines = e.stacktrace.split("\n");
                var result = [];
                for (var i = 0, len = lines.length; i < len; i += 2) {
                  var match = lineRE.exec(lines[i]);
                  if (match) {
                    result.push(new StackFrame({
                      functionName: match[3] || void 0,
                      fileName: match[2],
                      lineNumber: match[1],
                      source: lines[i]
                    }));
                  }
                }
                return result;
              },
              parseOpera11: function ErrorStackParser$$parseOpera11(error) {
                var filtered = error.stack.split("\n").filter(function(line) {
                  return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
                }, this);
                return filtered.map(function(line) {
                  var tokens = line.split("@");
                  var locationParts = this.extractLocation(tokens.pop());
                  var functionCall = tokens.shift() || "";
                  var functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
                  var argsRaw;
                  if (functionCall.match(/\(([^)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, "$1");
                  }
                  var args = argsRaw === void 0 || argsRaw === "[arguments not available]" ? void 0 : argsRaw.split(",");
                  return new StackFrame({
                    functionName,
                    args,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                  });
                }, this);
              }
            };
          });
        },
        49: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          const isArrayImpl = Array.isArray;
          function isArray(a) {
            return isArrayImpl(a);
          }
          __webpack_exports__["a"] = isArray;
        },
        51: function(module2, exports2, __webpack_require__) {
          (function(global) {
            var FUNC_ERROR_TEXT = "Expected a function";
            var NAN = 0 / 0;
            var symbolTag = "[object Symbol]";
            var reTrim = /^\s+|\s+$/g;
            var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
            var reIsBinary = /^0b[01]+$/i;
            var reIsOctal = /^0o[0-7]+$/i;
            var freeParseInt = parseInt;
            var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
            var freeSelf = typeof self == "object" && self && self.Object === Object && self;
            var root = freeGlobal || freeSelf || Function("return this")();
            var objectProto = Object.prototype;
            var objectToString = objectProto.toString;
            var nativeMax = Math.max, nativeMin = Math.min;
            var now = function() {
              return root.Date.now();
            };
            function debounce(func, wait, options) {
              var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
              if (typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
              }
              wait = toNumber(wait) || 0;
              if (isObject(options)) {
                leading = !!options.leading;
                maxing = "maxWait" in options;
                maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
                trailing = "trailing" in options ? !!options.trailing : trailing;
              }
              function invokeFunc(time) {
                var args = lastArgs, thisArg = lastThis;
                lastArgs = lastThis = void 0;
                lastInvokeTime = time;
                result = func.apply(thisArg, args);
                return result;
              }
              function leadingEdge(time) {
                lastInvokeTime = time;
                timerId = setTimeout(timerExpired, wait);
                return leading ? invokeFunc(time) : result;
              }
              function remainingWait(time) {
                var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result2 = wait - timeSinceLastCall;
                return maxing ? nativeMin(result2, maxWait - timeSinceLastInvoke) : result2;
              }
              function shouldInvoke(time) {
                var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
                return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
              }
              function timerExpired() {
                var time = now();
                if (shouldInvoke(time)) {
                  return trailingEdge(time);
                }
                timerId = setTimeout(timerExpired, remainingWait(time));
              }
              function trailingEdge(time) {
                timerId = void 0;
                if (trailing && lastArgs) {
                  return invokeFunc(time);
                }
                lastArgs = lastThis = void 0;
                return result;
              }
              function cancel() {
                if (timerId !== void 0) {
                  clearTimeout(timerId);
                }
                lastInvokeTime = 0;
                lastArgs = lastCallTime = lastThis = timerId = void 0;
              }
              function flush() {
                return timerId === void 0 ? result : trailingEdge(now());
              }
              function debounced() {
                var time = now(), isInvoking = shouldInvoke(time);
                lastArgs = arguments;
                lastThis = this;
                lastCallTime = time;
                if (isInvoking) {
                  if (timerId === void 0) {
                    return leadingEdge(lastCallTime);
                  }
                  if (maxing) {
                    timerId = setTimeout(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                  }
                }
                if (timerId === void 0) {
                  timerId = setTimeout(timerExpired, wait);
                }
                return result;
              }
              debounced.cancel = cancel;
              debounced.flush = flush;
              return debounced;
            }
            function throttle2(func, wait, options) {
              var leading = true, trailing = true;
              if (typeof func != "function") {
                throw new TypeError(FUNC_ERROR_TEXT);
              }
              if (isObject(options)) {
                leading = "leading" in options ? !!options.leading : leading;
                trailing = "trailing" in options ? !!options.trailing : trailing;
              }
              return debounce(func, wait, {
                "leading": leading,
                "maxWait": wait,
                "trailing": trailing
              });
            }
            function isObject(value) {
              var type = typeof value;
              return !!value && (type == "object" || type == "function");
            }
            function isObjectLike(value) {
              return !!value && typeof value == "object";
            }
            function isSymbol(value) {
              return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
            }
            function toNumber(value) {
              if (typeof value == "number") {
                return value;
              }
              if (isSymbol(value)) {
                return NAN;
              }
              if (isObject(value)) {
                var other = typeof value.valueOf == "function" ? value.valueOf() : value;
                value = isObject(other) ? other + "" : other;
              }
              if (typeof value != "string") {
                return value === 0 ? value : +value;
              }
              value = value.replace(reTrim, "");
              var isBinary = reIsBinary.test(value);
              return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
            }
            module2.exports = throttle2;
          }).call(this, __webpack_require__(36));
        },
        52: function(module2, exports2, __webpack_require__) {
          "use strict";
          const Yallist = __webpack_require__(78);
          const MAX = Symbol("max");
          const LENGTH = Symbol("length");
          const LENGTH_CALCULATOR = Symbol("lengthCalculator");
          const ALLOW_STALE = Symbol("allowStale");
          const MAX_AGE = Symbol("maxAge");
          const DISPOSE = Symbol("dispose");
          const NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
          const LRU_LIST = Symbol("lruList");
          const CACHE = Symbol("cache");
          const UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
          const naiveLength = () => 1;
          class LRUCache {
            constructor(options) {
              if (typeof options === "number")
                options = {
                  max: options
                };
              if (!options)
                options = {};
              if (options.max && (typeof options.max !== "number" || options.max < 0))
                throw new TypeError("max must be a non-negative number");
              const max = this[MAX] = options.max || Infinity;
              const lc = options.length || naiveLength;
              this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
              this[ALLOW_STALE] = options.stale || false;
              if (options.maxAge && typeof options.maxAge !== "number")
                throw new TypeError("maxAge must be a number");
              this[MAX_AGE] = options.maxAge || 0;
              this[DISPOSE] = options.dispose;
              this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
              this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
              this.reset();
            }
            set max(mL) {
              if (typeof mL !== "number" || mL < 0)
                throw new TypeError("max must be a non-negative number");
              this[MAX] = mL || Infinity;
              trim(this);
            }
            get max() {
              return this[MAX];
            }
            set allowStale(allowStale) {
              this[ALLOW_STALE] = !!allowStale;
            }
            get allowStale() {
              return this[ALLOW_STALE];
            }
            set maxAge(mA) {
              if (typeof mA !== "number")
                throw new TypeError("maxAge must be a non-negative number");
              this[MAX_AGE] = mA;
              trim(this);
            }
            get maxAge() {
              return this[MAX_AGE];
            }
            set lengthCalculator(lC) {
              if (typeof lC !== "function")
                lC = naiveLength;
              if (lC !== this[LENGTH_CALCULATOR]) {
                this[LENGTH_CALCULATOR] = lC;
                this[LENGTH] = 0;
                this[LRU_LIST].forEach((hit) => {
                  hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
                  this[LENGTH] += hit.length;
                });
              }
              trim(this);
            }
            get lengthCalculator() {
              return this[LENGTH_CALCULATOR];
            }
            get length() {
              return this[LENGTH];
            }
            get itemCount() {
              return this[LRU_LIST].length;
            }
            rforEach(fn, thisp) {
              thisp = thisp || this;
              for (let walker = this[LRU_LIST].tail; walker !== null; ) {
                const prev = walker.prev;
                forEachStep(this, fn, walker, thisp);
                walker = prev;
              }
            }
            forEach(fn, thisp) {
              thisp = thisp || this;
              for (let walker = this[LRU_LIST].head; walker !== null; ) {
                const next = walker.next;
                forEachStep(this, fn, walker, thisp);
                walker = next;
              }
            }
            keys() {
              return this[LRU_LIST].toArray().map((k) => k.key);
            }
            values() {
              return this[LRU_LIST].toArray().map((k) => k.value);
            }
            reset() {
              if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
                this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
              }
              this[CACHE] = /* @__PURE__ */ new Map();
              this[LRU_LIST] = new Yallist();
              this[LENGTH] = 0;
            }
            dump() {
              return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
                k: hit.key,
                v: hit.value,
                e: hit.now + (hit.maxAge || 0)
              }).toArray().filter((h) => h);
            }
            dumpLru() {
              return this[LRU_LIST];
            }
            set(key, value, maxAge) {
              maxAge = maxAge || this[MAX_AGE];
              if (maxAge && typeof maxAge !== "number")
                throw new TypeError("maxAge must be a number");
              const now = maxAge ? Date.now() : 0;
              const len = this[LENGTH_CALCULATOR](value, key);
              if (this[CACHE].has(key)) {
                if (len > this[MAX]) {
                  del(this, this[CACHE].get(key));
                  return false;
                }
                const node = this[CACHE].get(key);
                const item = node.value;
                if (this[DISPOSE]) {
                  if (!this[NO_DISPOSE_ON_SET])
                    this[DISPOSE](key, item.value);
                }
                item.now = now;
                item.maxAge = maxAge;
                item.value = value;
                this[LENGTH] += len - item.length;
                item.length = len;
                this.get(key);
                trim(this);
                return true;
              }
              const hit = new Entry(key, value, len, now, maxAge);
              if (hit.length > this[MAX]) {
                if (this[DISPOSE])
                  this[DISPOSE](key, value);
                return false;
              }
              this[LENGTH] += hit.length;
              this[LRU_LIST].unshift(hit);
              this[CACHE].set(key, this[LRU_LIST].head);
              trim(this);
              return true;
            }
            has(key) {
              if (!this[CACHE].has(key))
                return false;
              const hit = this[CACHE].get(key).value;
              return !isStale(this, hit);
            }
            get(key) {
              return get(this, key, true);
            }
            peek(key) {
              return get(this, key, false);
            }
            pop() {
              const node = this[LRU_LIST].tail;
              if (!node)
                return null;
              del(this, node);
              return node.value;
            }
            del(key) {
              del(this, this[CACHE].get(key));
            }
            load(arr) {
              this.reset();
              const now = Date.now();
              for (let l = arr.length - 1; l >= 0; l--) {
                const hit = arr[l];
                const expiresAt = hit.e || 0;
                if (expiresAt === 0)
                  this.set(hit.k, hit.v);
                else {
                  const maxAge = expiresAt - now;
                  if (maxAge > 0) {
                    this.set(hit.k, hit.v, maxAge);
                  }
                }
              }
            }
            prune() {
              this[CACHE].forEach((value, key) => get(this, key, false));
            }
          }
          const get = (self2, key, doUse) => {
            const node = self2[CACHE].get(key);
            if (node) {
              const hit = node.value;
              if (isStale(self2, hit)) {
                del(self2, node);
                if (!self2[ALLOW_STALE])
                  return void 0;
              } else {
                if (doUse) {
                  if (self2[UPDATE_AGE_ON_GET])
                    node.value.now = Date.now();
                  self2[LRU_LIST].unshiftNode(node);
                }
              }
              return hit.value;
            }
          };
          const isStale = (self2, hit) => {
            if (!hit || !hit.maxAge && !self2[MAX_AGE])
              return false;
            const diff = Date.now() - hit.now;
            return hit.maxAge ? diff > hit.maxAge : self2[MAX_AGE] && diff > self2[MAX_AGE];
          };
          const trim = (self2) => {
            if (self2[LENGTH] > self2[MAX]) {
              for (let walker = self2[LRU_LIST].tail; self2[LENGTH] > self2[MAX] && walker !== null; ) {
                const prev = walker.prev;
                del(self2, walker);
                walker = prev;
              }
            }
          };
          const del = (self2, node) => {
            if (node) {
              const hit = node.value;
              if (self2[DISPOSE])
                self2[DISPOSE](hit.key, hit.value);
              self2[LENGTH] -= hit.length;
              self2[CACHE].delete(hit.key);
              self2[LRU_LIST].removeNode(node);
            }
          };
          class Entry {
            constructor(key, value, length, now, maxAge) {
              this.key = key;
              this.value = value;
              this.length = length;
              this.now = now;
              this.maxAge = maxAge || 0;
            }
          }
          const forEachStep = (self2, fn, node, thisp) => {
            let hit = node.value;
            if (isStale(self2, hit)) {
              del(self2, node);
              if (!self2[ALLOW_STALE])
                hit = void 0;
            }
            if (hit)
              fn.call(thisp, hit.value, hit.key, self2);
          };
          module2.exports = LRUCache;
        },
        59: function(module2, exports2) {
          var process2 = module2.exports = {};
          var cachedSetTimeout;
          var cachedClearTimeout;
          function defaultSetTimout() {
            throw new Error("setTimeout has not been defined");
          }
          function defaultClearTimeout() {
            throw new Error("clearTimeout has not been defined");
          }
          (function() {
            try {
              if (typeof setTimeout === "function") {
                cachedSetTimeout = setTimeout;
              } else {
                cachedSetTimeout = defaultSetTimout;
              }
            } catch (e) {
              cachedSetTimeout = defaultSetTimout;
            }
            try {
              if (typeof clearTimeout === "function") {
                cachedClearTimeout = clearTimeout;
              } else {
                cachedClearTimeout = defaultClearTimeout;
              }
            } catch (e) {
              cachedClearTimeout = defaultClearTimeout;
            }
          })();
          function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) {
              return setTimeout(fun, 0);
            }
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
              cachedSetTimeout = setTimeout;
              return setTimeout(fun, 0);
            }
            try {
              return cachedSetTimeout(fun, 0);
            } catch (e) {
              try {
                return cachedSetTimeout.call(null, fun, 0);
              } catch (e2) {
                return cachedSetTimeout.call(this, fun, 0);
              }
            }
          }
          function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) {
              return clearTimeout(marker);
            }
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
              cachedClearTimeout = clearTimeout;
              return clearTimeout(marker);
            }
            try {
              return cachedClearTimeout(marker);
            } catch (e) {
              try {
                return cachedClearTimeout.call(null, marker);
              } catch (e2) {
                return cachedClearTimeout.call(this, marker);
              }
            }
          }
          var queue = [];
          var draining = false;
          var currentQueue;
          var queueIndex = -1;
          function cleanUpNextTick() {
            if (!draining || !currentQueue) {
              return;
            }
            draining = false;
            if (currentQueue.length) {
              queue = currentQueue.concat(queue);
            } else {
              queueIndex = -1;
            }
            if (queue.length) {
              drainQueue();
            }
          }
          function drainQueue() {
            if (draining) {
              return;
            }
            var timeout = runTimeout(cleanUpNextTick);
            draining = true;
            var len = queue.length;
            while (len) {
              currentQueue = queue;
              queue = [];
              while (++queueIndex < len) {
                if (currentQueue) {
                  currentQueue[queueIndex].run();
                }
              }
              queueIndex = -1;
              len = queue.length;
            }
            currentQueue = null;
            draining = false;
            runClearTimeout(timeout);
          }
          process2.nextTick = function(fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
              for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
              }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
              runTimeout(drainQueue);
            }
          };
          function Item(fun, array) {
            this.fun = fun;
            this.array = array;
          }
          Item.prototype.run = function() {
            this.fun.apply(null, this.array);
          };
          process2.title = "browser";
          process2.browser = true;
          process2.env = {};
          process2.argv = [];
          process2.version = "";
          process2.versions = {};
          function noop() {
          }
          process2.on = noop;
          process2.addListener = noop;
          process2.once = noop;
          process2.off = noop;
          process2.removeListener = noop;
          process2.removeAllListeners = noop;
          process2.emit = noop;
          process2.prependListener = noop;
          process2.prependOnceListener = noop;
          process2.listeners = function(name) {
            return [];
          };
          process2.binding = function(name) {
            throw new Error("process.binding is not supported");
          };
          process2.cwd = function() {
            return "/";
          };
          process2.chdir = function(dir) {
            throw new Error("process.chdir is not supported");
          };
          process2.umask = function() {
            return 0;
          };
        },
        67: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return getInternalReactConstants;
          });
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return attach;
          });
          var semver = __webpack_require__(45);
          var types = __webpack_require__(2);
          var utils = __webpack_require__(3);
          var storage = __webpack_require__(8);
          var backend_utils = __webpack_require__(16);
          var constants = __webpack_require__(1);
          var error_stack_parser = __webpack_require__(48);
          var error_stack_parser_default = /* @__PURE__ */ __webpack_require__.n(error_stack_parser);
          var external_react_ = __webpack_require__(0);
          const ReactSharedInternals = external_react_["__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED"];
          var shared_ReactSharedInternals = ReactSharedInternals;
          const ReactWorkTags_FunctionComponent = 0;
          const ReactWorkTags_ClassComponent = 1;
          const ReactWorkTags_IndeterminateComponent = 2;
          const ReactWorkTags_HostRoot = 3;
          const ReactWorkTags_HostPortal = 4;
          const ReactWorkTags_HostComponent = 5;
          const ReactWorkTags_HostText = 6;
          const ReactWorkTags_Fragment = 7;
          const Mode = 8;
          const ReactWorkTags_ContextConsumer = 9;
          const ContextProvider = 10;
          const ReactWorkTags_ForwardRef = 11;
          const ReactWorkTags_Profiler = 12;
          const ReactWorkTags_SuspenseComponent = 13;
          const ReactWorkTags_MemoComponent = 14;
          const ReactWorkTags_SimpleMemoComponent = 15;
          const ReactWorkTags_LazyComponent = 16;
          const ReactWorkTags_IncompleteClassComponent = 17;
          const DehydratedFragment = 18;
          const ReactWorkTags_SuspenseListComponent = 19;
          const ReactWorkTags_ScopeComponent = 21;
          const ReactWorkTags_OffscreenComponent = 22;
          const ReactWorkTags_LegacyHiddenComponent = 23;
          const ReactWorkTags_CacheComponent = 24;
          let hookLog = [];
          let primitiveStackCache = null;
          function getPrimitiveStackCache() {
            if (primitiveStackCache === null) {
              const cache = /* @__PURE__ */ new Map();
              let readHookLog;
              try {
                Dispatcher.useContext({
                  _currentValue: null
                });
                Dispatcher.useState(null);
                Dispatcher.useReducer((s, a) => s, null);
                Dispatcher.useRef(null);
                if (typeof Dispatcher.useCacheRefresh === "function") {
                  Dispatcher.useCacheRefresh();
                }
                Dispatcher.useLayoutEffect(() => {
                });
                Dispatcher.useInsertionEffect(() => {
                });
                Dispatcher.useEffect(() => {
                });
                Dispatcher.useImperativeHandle(void 0, () => null);
                Dispatcher.useDebugValue(null);
                Dispatcher.useCallback(() => {
                });
                Dispatcher.useMemo(() => null);
              } finally {
                readHookLog = hookLog;
                hookLog = [];
              }
              for (let i = 0; i < readHookLog.length; i++) {
                const hook = readHookLog[i];
                cache.set(hook.primitive, error_stack_parser_default.a.parse(hook.stackError));
              }
              primitiveStackCache = cache;
            }
            return primitiveStackCache;
          }
          let currentHook = null;
          function nextHook() {
            const hook = currentHook;
            if (hook !== null) {
              currentHook = hook.next;
            }
            return hook;
          }
          function getCacheForType(resourceType) {
            throw new Error("Not implemented.");
          }
          function readContext(context) {
            return context._currentValue;
          }
          function useContext(context) {
            hookLog.push({
              primitive: "Context",
              stackError: new Error(),
              value: context._currentValue
            });
            return context._currentValue;
          }
          function useState(initialState) {
            const hook = nextHook();
            const state = hook !== null ? hook.memoizedState : typeof initialState === "function" ? initialState() : initialState;
            hookLog.push({
              primitive: "State",
              stackError: new Error(),
              value: state
            });
            return [state, (action) => {
            }];
          }
          function useReducer(reducer, initialArg, init) {
            const hook = nextHook();
            let state;
            if (hook !== null) {
              state = hook.memoizedState;
            } else {
              state = init !== void 0 ? init(initialArg) : initialArg;
            }
            hookLog.push({
              primitive: "Reducer",
              stackError: new Error(),
              value: state
            });
            return [state, (action) => {
            }];
          }
          function useRef(initialValue) {
            const hook = nextHook();
            const ref = hook !== null ? hook.memoizedState : {
              current: initialValue
            };
            hookLog.push({
              primitive: "Ref",
              stackError: new Error(),
              value: ref.current
            });
            return ref;
          }
          function useCacheRefresh() {
            const hook = nextHook();
            hookLog.push({
              primitive: "CacheRefresh",
              stackError: new Error(),
              value: hook !== null ? hook.memoizedState : function refresh() {
              }
            });
            return () => {
            };
          }
          function useLayoutEffect(create, inputs) {
            nextHook();
            hookLog.push({
              primitive: "LayoutEffect",
              stackError: new Error(),
              value: create
            });
          }
          function useInsertionEffect(create, inputs) {
            nextHook();
            hookLog.push({
              primitive: "InsertionEffect",
              stackError: new Error(),
              value: create
            });
          }
          function useEffect(create, inputs) {
            nextHook();
            hookLog.push({
              primitive: "Effect",
              stackError: new Error(),
              value: create
            });
          }
          function useImperativeHandle(ref, create, inputs) {
            nextHook();
            let instance = void 0;
            if (ref !== null && typeof ref === "object") {
              instance = ref.current;
            }
            hookLog.push({
              primitive: "ImperativeHandle",
              stackError: new Error(),
              value: instance
            });
          }
          function useDebugValue(value, formatterFn) {
            hookLog.push({
              primitive: "DebugValue",
              stackError: new Error(),
              value: typeof formatterFn === "function" ? formatterFn(value) : value
            });
          }
          function useCallback(callback, inputs) {
            const hook = nextHook();
            hookLog.push({
              primitive: "Callback",
              stackError: new Error(),
              value: hook !== null ? hook.memoizedState[0] : callback
            });
            return callback;
          }
          function useMemo(nextCreate, inputs) {
            const hook = nextHook();
            const value = hook !== null ? hook.memoizedState[0] : nextCreate();
            hookLog.push({
              primitive: "Memo",
              stackError: new Error(),
              value
            });
            return value;
          }
          function useMutableSource(source, getSnapshot, subscribe) {
            nextHook();
            nextHook();
            nextHook();
            nextHook();
            const value = getSnapshot(source._source);
            hookLog.push({
              primitive: "MutableSource",
              stackError: new Error(),
              value
            });
            return value;
          }
          function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
            nextHook();
            nextHook();
            const value = getSnapshot();
            hookLog.push({
              primitive: "SyncExternalStore",
              stackError: new Error(),
              value
            });
            return value;
          }
          function useTransition() {
            nextHook();
            nextHook();
            hookLog.push({
              primitive: "Transition",
              stackError: new Error(),
              value: void 0
            });
            return [false, (callback) => {
            }];
          }
          function useDeferredValue(value) {
            nextHook();
            nextHook();
            hookLog.push({
              primitive: "DeferredValue",
              stackError: new Error(),
              value
            });
            return value;
          }
          function useId() {
            const hook = nextHook();
            const id = hook !== null ? hook.memoizedState : "";
            hookLog.push({
              primitive: "Id",
              stackError: new Error(),
              value: id
            });
            return id;
          }
          const Dispatcher = {
            getCacheForType,
            readContext,
            useCacheRefresh,
            useCallback,
            useContext,
            useEffect,
            useImperativeHandle,
            useDebugValue,
            useLayoutEffect,
            useInsertionEffect,
            useMemo,
            useReducer,
            useRef,
            useState,
            useTransition,
            useMutableSource,
            useSyncExternalStore,
            useDeferredValue,
            useId
          };
          let mostLikelyAncestorIndex = 0;
          function findSharedIndex(hookStack, rootStack, rootIndex) {
            const source = rootStack[rootIndex].source;
            hookSearch:
              for (let i = 0; i < hookStack.length; i++) {
                if (hookStack[i].source === source) {
                  for (let a = rootIndex + 1, b = i + 1; a < rootStack.length && b < hookStack.length; a++, b++) {
                    if (hookStack[b].source !== rootStack[a].source) {
                      continue hookSearch;
                    }
                  }
                  return i;
                }
              }
            return -1;
          }
          function findCommonAncestorIndex(rootStack, hookStack) {
            let rootIndex = findSharedIndex(hookStack, rootStack, mostLikelyAncestorIndex);
            if (rootIndex !== -1) {
              return rootIndex;
            }
            for (let i = 0; i < rootStack.length && i < 5; i++) {
              rootIndex = findSharedIndex(hookStack, rootStack, i);
              if (rootIndex !== -1) {
                mostLikelyAncestorIndex = i;
                return rootIndex;
              }
            }
            return -1;
          }
          function isReactWrapper(functionName, primitiveName) {
            if (!functionName) {
              return false;
            }
            const expectedPrimitiveName = "use" + primitiveName;
            if (functionName.length < expectedPrimitiveName.length) {
              return false;
            }
            return functionName.lastIndexOf(expectedPrimitiveName) === functionName.length - expectedPrimitiveName.length;
          }
          function findPrimitiveIndex(hookStack, hook) {
            const stackCache = getPrimitiveStackCache();
            const primitiveStack = stackCache.get(hook.primitive);
            if (primitiveStack === void 0) {
              return -1;
            }
            for (let i = 0; i < primitiveStack.length && i < hookStack.length; i++) {
              if (primitiveStack[i].source !== hookStack[i].source) {
                if (i < hookStack.length - 1 && isReactWrapper(hookStack[i].functionName, hook.primitive)) {
                  i++;
                }
                if (i < hookStack.length - 1 && isReactWrapper(hookStack[i].functionName, hook.primitive)) {
                  i++;
                }
                return i;
              }
            }
            return -1;
          }
          function parseTrimmedStack(rootStack, hook) {
            const hookStack = error_stack_parser_default.a.parse(hook.stackError);
            const rootIndex = findCommonAncestorIndex(rootStack, hookStack);
            const primitiveIndex = findPrimitiveIndex(hookStack, hook);
            if (rootIndex === -1 || primitiveIndex === -1 || rootIndex - primitiveIndex < 2) {
              return null;
            }
            return hookStack.slice(primitiveIndex, rootIndex - 1);
          }
          function parseCustomHookName(functionName) {
            if (!functionName) {
              return "";
            }
            let startIndex = functionName.lastIndexOf(".");
            if (startIndex === -1) {
              startIndex = 0;
            }
            if (functionName.substr(startIndex, 3) === "use") {
              startIndex += 3;
            }
            return functionName.substr(startIndex);
          }
          function buildTree(rootStack, readHookLog, includeHooksSource) {
            const rootChildren = [];
            let prevStack = null;
            let levelChildren = rootChildren;
            let nativeHookID = 0;
            const stackOfChildren = [];
            for (let i = 0; i < readHookLog.length; i++) {
              const hook = readHookLog[i];
              const stack = parseTrimmedStack(rootStack, hook);
              if (stack !== null) {
                let commonSteps = 0;
                if (prevStack !== null) {
                  while (commonSteps < stack.length && commonSteps < prevStack.length) {
                    const stackSource = stack[stack.length - commonSteps - 1].source;
                    const prevSource = prevStack[prevStack.length - commonSteps - 1].source;
                    if (stackSource !== prevSource) {
                      break;
                    }
                    commonSteps++;
                  }
                  for (let j = prevStack.length - 1; j > commonSteps; j--) {
                    levelChildren = stackOfChildren.pop();
                  }
                }
                for (let j = stack.length - commonSteps - 1; j >= 1; j--) {
                  const children = [];
                  const stackFrame = stack[j];
                  const levelChild2 = {
                    id: null,
                    isStateEditable: false,
                    name: parseCustomHookName(stack[j - 1].functionName),
                    value: void 0,
                    subHooks: children
                  };
                  if (includeHooksSource) {
                    levelChild2.hookSource = {
                      lineNumber: stackFrame.lineNumber,
                      columnNumber: stackFrame.columnNumber,
                      functionName: stackFrame.functionName,
                      fileName: stackFrame.fileName
                    };
                  }
                  levelChildren.push(levelChild2);
                  stackOfChildren.push(levelChildren);
                  levelChildren = children;
                }
                prevStack = stack;
              }
              const {
                primitive
              } = hook;
              const id = primitive === "Context" || primitive === "DebugValue" ? null : nativeHookID++;
              const isStateEditable = primitive === "Reducer" || primitive === "State";
              const levelChild = {
                id,
                isStateEditable,
                name: primitive,
                value: hook.value,
                subHooks: []
              };
              if (includeHooksSource) {
                const hookSource = {
                  lineNumber: null,
                  functionName: null,
                  fileName: null,
                  columnNumber: null
                };
                if (stack && stack.length >= 1) {
                  const stackFrame = stack[0];
                  hookSource.lineNumber = stackFrame.lineNumber;
                  hookSource.functionName = stackFrame.functionName;
                  hookSource.fileName = stackFrame.fileName;
                  hookSource.columnNumber = stackFrame.columnNumber;
                }
                levelChild.hookSource = hookSource;
              }
              levelChildren.push(levelChild);
            }
            processDebugValues(rootChildren, null);
            return rootChildren;
          }
          function processDebugValues(hooksTree, parentHooksNode) {
            const debugValueHooksNodes = [];
            for (let i = 0; i < hooksTree.length; i++) {
              const hooksNode = hooksTree[i];
              if (hooksNode.name === "DebugValue" && hooksNode.subHooks.length === 0) {
                hooksTree.splice(i, 1);
                i--;
                debugValueHooksNodes.push(hooksNode);
              } else {
                processDebugValues(hooksNode.subHooks, hooksNode);
              }
            }
            if (parentHooksNode !== null) {
              if (debugValueHooksNodes.length === 1) {
                parentHooksNode.value = debugValueHooksNodes[0].value;
              } else if (debugValueHooksNodes.length > 1) {
                parentHooksNode.value = debugValueHooksNodes.map(({
                  value
                }) => value);
              }
            }
          }
          function inspectHooks(renderFunction, props, currentDispatcher, includeHooksSource = false) {
            if (currentDispatcher == null) {
              currentDispatcher = shared_ReactSharedInternals.ReactCurrentDispatcher;
            }
            const previousDispatcher = currentDispatcher.current;
            let readHookLog;
            currentDispatcher.current = Dispatcher;
            let ancestorStackError;
            try {
              ancestorStackError = new Error();
              renderFunction(props);
            } finally {
              readHookLog = hookLog;
              hookLog = [];
              currentDispatcher.current = previousDispatcher;
            }
            const rootStack = error_stack_parser_default.a.parse(ancestorStackError);
            return buildTree(rootStack, readHookLog, includeHooksSource);
          }
          function setupContexts(contextMap, fiber) {
            let current = fiber;
            while (current) {
              if (current.tag === ContextProvider) {
                const providerType = current.type;
                const context = providerType._context;
                if (!contextMap.has(context)) {
                  contextMap.set(context, context._currentValue);
                  context._currentValue = current.memoizedProps.value;
                }
              }
              current = current.return;
            }
          }
          function restoreContexts(contextMap) {
            contextMap.forEach((value, context) => context._currentValue = value);
          }
          function inspectHooksOfForwardRef(renderFunction, props, ref, currentDispatcher, includeHooksSource) {
            const previousDispatcher = currentDispatcher.current;
            let readHookLog;
            currentDispatcher.current = Dispatcher;
            let ancestorStackError;
            try {
              ancestorStackError = new Error();
              renderFunction(props, ref);
            } finally {
              readHookLog = hookLog;
              hookLog = [];
              currentDispatcher.current = previousDispatcher;
            }
            const rootStack = error_stack_parser_default.a.parse(ancestorStackError);
            return buildTree(rootStack, readHookLog, includeHooksSource);
          }
          function resolveDefaultProps(Component, baseProps) {
            if (Component && Component.defaultProps) {
              const props = Object.assign({}, baseProps);
              const defaultProps = Component.defaultProps;
              for (const propName in defaultProps) {
                if (props[propName] === void 0) {
                  props[propName] = defaultProps[propName];
                }
              }
              return props;
            }
            return baseProps;
          }
          function inspectHooksOfFiber(fiber, currentDispatcher, includeHooksSource = false) {
            if (currentDispatcher == null) {
              currentDispatcher = shared_ReactSharedInternals.ReactCurrentDispatcher;
            }
            if (fiber.tag !== ReactWorkTags_FunctionComponent && fiber.tag !== ReactWorkTags_SimpleMemoComponent && fiber.tag !== ReactWorkTags_ForwardRef) {
              throw new Error("Unknown Fiber. Needs to be a function component to inspect hooks.");
            }
            getPrimitiveStackCache();
            const type = fiber.type;
            let props = fiber.memoizedProps;
            if (type !== fiber.elementType) {
              props = resolveDefaultProps(type, props);
            }
            currentHook = fiber.memoizedState;
            const contextMap = /* @__PURE__ */ new Map();
            try {
              setupContexts(contextMap, fiber);
              if (fiber.tag === ReactWorkTags_ForwardRef) {
                return inspectHooksOfForwardRef(type.render, props, fiber.ref, currentDispatcher, includeHooksSource);
              }
              return inspectHooks(type, props, currentDispatcher, includeHooksSource);
            } finally {
              currentHook = null;
              restoreContexts(contextMap);
            }
          }
          var backend_console = __webpack_require__(41);
          var ReactSymbols = __webpack_require__(9);
          var DevToolsFeatureFlags_default = __webpack_require__(12);
          function is(x, y) {
            return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
          }
          const objectIs = typeof Object.is === "function" ? Object.is : is;
          var shared_objectIs = objectIs;
          var isArray = __webpack_require__(49);
          const hasOwnProperty_hasOwnProperty = Object.prototype.hasOwnProperty;
          var shared_hasOwnProperty = hasOwnProperty_hasOwnProperty;
          const cachedStyleNameToValueMap = /* @__PURE__ */ new Map();
          function getStyleXData(data) {
            const sources = /* @__PURE__ */ new Set();
            const resolvedStyles = {};
            crawlData(data, sources, resolvedStyles);
            return {
              sources: Array.from(sources).sort(),
              resolvedStyles
            };
          }
          function crawlData(data, sources, resolvedStyles) {
            if (Array.isArray(data)) {
              data.forEach((entry) => {
                if (Array.isArray(entry)) {
                  crawlData(entry, sources, resolvedStyles);
                } else {
                  crawlObjectProperties(entry, sources, resolvedStyles);
                }
              });
            } else {
              crawlObjectProperties(data, sources, resolvedStyles);
            }
            resolvedStyles = Object.fromEntries(Object.entries(resolvedStyles).sort());
          }
          function crawlObjectProperties(entry, sources, resolvedStyles) {
            const keys = Object.keys(entry);
            keys.forEach((key) => {
              const value = entry[key];
              if (typeof value === "string") {
                if (key === value) {
                  sources.add(key);
                } else {
                  resolvedStyles[key] = getPropertyValueForStyleName(value);
                }
              } else {
                const nestedStyle = {};
                resolvedStyles[key] = nestedStyle;
                crawlData([value], sources, nestedStyle);
              }
            });
          }
          function getPropertyValueForStyleName(styleName) {
            if (cachedStyleNameToValueMap.has(styleName)) {
              return cachedStyleNameToValueMap.get(styleName);
            }
            for (let styleSheetIndex = 0; styleSheetIndex < document.styleSheets.length; styleSheetIndex++) {
              const styleSheet = document.styleSheets[styleSheetIndex];
              const rules = styleSheet.rules || styleSheet.cssRules;
              for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
                const rule = rules[ruleIndex];
                const {
                  cssText,
                  selectorText,
                  style
                } = rule;
                if (selectorText != null) {
                  if (selectorText.startsWith(`.${styleName}`)) {
                    const match = cssText.match(/{ *([a-z\-]+):/);
                    if (match !== null) {
                      const property = match[1];
                      const value = style.getPropertyValue(property);
                      cachedStyleNameToValueMap.set(styleName, value);
                      return value;
                    } else {
                      return null;
                    }
                  }
                }
              }
            }
            return null;
          }
          function getFiberFlags(fiber) {
            return fiber.flags !== void 0 ? fiber.flags : fiber.effectTag;
          }
          const getCurrentTime = typeof performance === "object" && typeof performance.now === "function" ? () => performance.now() : () => Date.now();
          function getInternalReactConstants(version) {
            const ReactTypeOfSideEffect = {
              DidCapture: 128,
              NoFlags: 0,
              PerformedWork: 1,
              Placement: 2,
              Incomplete: 8192,
              Hydrating: 4096
            };
            let ReactPriorityLevels = {
              ImmediatePriority: 99,
              UserBlockingPriority: 98,
              NormalPriority: 97,
              LowPriority: 96,
              IdlePriority: 95,
              NoPriority: 90
            };
            if (Object(semver["gt"])(version, "17.0.2")) {
              ReactPriorityLevels = {
                ImmediatePriority: 1,
                UserBlockingPriority: 2,
                NormalPriority: 3,
                LowPriority: 4,
                IdlePriority: 5,
                NoPriority: 0
              };
            }
            let StrictModeBits = 0;
            if (Object(semver["gte"])(version, "18.0.0-alpha")) {
              StrictModeBits = 24;
            } else if (Object(semver["gte"])(version, "16.9.0")) {
              StrictModeBits = 1;
            } else if (Object(semver["gte"])(version, "16.3.0")) {
              StrictModeBits = 2;
            }
            let ReactTypeOfWork = null;
            if (Object(semver["gt"])(version, "17.0.1")) {
              ReactTypeOfWork = {
                CacheComponent: 24,
                ClassComponent: 1,
                ContextConsumer: 9,
                ContextProvider: 10,
                CoroutineComponent: -1,
                CoroutineHandlerPhase: -1,
                DehydratedSuspenseComponent: 18,
                ForwardRef: 11,
                Fragment: 7,
                FunctionComponent: 0,
                HostComponent: 5,
                HostPortal: 4,
                HostRoot: 3,
                HostText: 6,
                IncompleteClassComponent: 17,
                IndeterminateComponent: 2,
                LazyComponent: 16,
                LegacyHiddenComponent: 23,
                MemoComponent: 14,
                Mode: 8,
                OffscreenComponent: 22,
                Profiler: 12,
                ScopeComponent: 21,
                SimpleMemoComponent: 15,
                SuspenseComponent: 13,
                SuspenseListComponent: 19,
                YieldComponent: -1
              };
            } else if (Object(semver["gte"])(version, "17.0.0-alpha")) {
              ReactTypeOfWork = {
                CacheComponent: -1,
                ClassComponent: 1,
                ContextConsumer: 9,
                ContextProvider: 10,
                CoroutineComponent: -1,
                CoroutineHandlerPhase: -1,
                DehydratedSuspenseComponent: 18,
                ForwardRef: 11,
                Fragment: 7,
                FunctionComponent: 0,
                HostComponent: 5,
                HostPortal: 4,
                HostRoot: 3,
                HostText: 6,
                IncompleteClassComponent: 17,
                IndeterminateComponent: 2,
                LazyComponent: 16,
                LegacyHiddenComponent: 24,
                MemoComponent: 14,
                Mode: 8,
                OffscreenComponent: 23,
                Profiler: 12,
                ScopeComponent: 21,
                SimpleMemoComponent: 15,
                SuspenseComponent: 13,
                SuspenseListComponent: 19,
                YieldComponent: -1
              };
            } else if (Object(semver["gte"])(version, "16.6.0-beta.0")) {
              ReactTypeOfWork = {
                CacheComponent: -1,
                ClassComponent: 1,
                ContextConsumer: 9,
                ContextProvider: 10,
                CoroutineComponent: -1,
                CoroutineHandlerPhase: -1,
                DehydratedSuspenseComponent: 18,
                ForwardRef: 11,
                Fragment: 7,
                FunctionComponent: 0,
                HostComponent: 5,
                HostPortal: 4,
                HostRoot: 3,
                HostText: 6,
                IncompleteClassComponent: 17,
                IndeterminateComponent: 2,
                LazyComponent: 16,
                LegacyHiddenComponent: -1,
                MemoComponent: 14,
                Mode: 8,
                OffscreenComponent: -1,
                Profiler: 12,
                ScopeComponent: -1,
                SimpleMemoComponent: 15,
                SuspenseComponent: 13,
                SuspenseListComponent: 19,
                YieldComponent: -1
              };
            } else if (Object(semver["gte"])(version, "16.4.3-alpha")) {
              ReactTypeOfWork = {
                CacheComponent: -1,
                ClassComponent: 2,
                ContextConsumer: 11,
                ContextProvider: 12,
                CoroutineComponent: -1,
                CoroutineHandlerPhase: -1,
                DehydratedSuspenseComponent: -1,
                ForwardRef: 13,
                Fragment: 9,
                FunctionComponent: 0,
                HostComponent: 7,
                HostPortal: 6,
                HostRoot: 5,
                HostText: 8,
                IncompleteClassComponent: -1,
                IndeterminateComponent: 4,
                LazyComponent: -1,
                LegacyHiddenComponent: -1,
                MemoComponent: -1,
                Mode: 10,
                OffscreenComponent: -1,
                Profiler: 15,
                ScopeComponent: -1,
                SimpleMemoComponent: -1,
                SuspenseComponent: 16,
                SuspenseListComponent: -1,
                YieldComponent: -1
              };
            } else {
              ReactTypeOfWork = {
                CacheComponent: -1,
                ClassComponent: 2,
                ContextConsumer: 12,
                ContextProvider: 13,
                CoroutineComponent: 7,
                CoroutineHandlerPhase: 8,
                DehydratedSuspenseComponent: -1,
                ForwardRef: 14,
                Fragment: 10,
                FunctionComponent: 1,
                HostComponent: 5,
                HostPortal: 4,
                HostRoot: 3,
                HostText: 6,
                IncompleteClassComponent: -1,
                IndeterminateComponent: 0,
                LazyComponent: -1,
                LegacyHiddenComponent: -1,
                MemoComponent: -1,
                Mode: 11,
                OffscreenComponent: -1,
                Profiler: 15,
                ScopeComponent: -1,
                SimpleMemoComponent: -1,
                SuspenseComponent: 16,
                SuspenseListComponent: -1,
                YieldComponent: 9
              };
            }
            function getTypeSymbol(type) {
              const symbolOrNumber = typeof type === "object" && type !== null ? type.$$typeof : type;
              return typeof symbolOrNumber === "symbol" ? symbolOrNumber.toString() : symbolOrNumber;
            }
            const {
              CacheComponent,
              ClassComponent,
              IncompleteClassComponent,
              FunctionComponent,
              IndeterminateComponent,
              ForwardRef,
              HostRoot,
              HostComponent,
              HostPortal,
              HostText,
              Fragment,
              LazyComponent,
              LegacyHiddenComponent,
              MemoComponent,
              OffscreenComponent,
              Profiler,
              ScopeComponent,
              SimpleMemoComponent,
              SuspenseComponent,
              SuspenseListComponent
            } = ReactTypeOfWork;
            function resolveFiberType(type) {
              const typeSymbol = getTypeSymbol(type);
              switch (typeSymbol) {
                case ReactSymbols["j"]:
                case ReactSymbols["k"]:
                  return resolveFiberType(type.type);
                case ReactSymbols["f"]:
                case ReactSymbols["g"]:
                  return type.render;
                default:
                  return type;
              }
            }
            function getDisplayNameForFiber(fiber) {
              const {
                elementType,
                type,
                tag
              } = fiber;
              let resolvedType = type;
              if (typeof type === "object" && type !== null) {
                resolvedType = resolveFiberType(type);
              }
              let resolvedContext = null;
              switch (tag) {
                case CacheComponent:
                  return "Cache";
                case ClassComponent:
                case IncompleteClassComponent:
                  return Object(utils["i"])(resolvedType);
                case FunctionComponent:
                case IndeterminateComponent:
                  return Object(utils["i"])(resolvedType);
                case ForwardRef:
                  return type && type.displayName || Object(utils["i"])(resolvedType, "Anonymous");
                case HostRoot:
                  const fiberRoot = fiber.stateNode;
                  if (fiberRoot != null && fiberRoot._debugRootType !== null) {
                    return fiberRoot._debugRootType;
                  }
                  return null;
                case HostComponent:
                  return type;
                case HostPortal:
                case HostText:
                case Fragment:
                  return null;
                case LazyComponent:
                  return "Lazy";
                case MemoComponent:
                case SimpleMemoComponent:
                  return elementType && elementType.displayName || type && type.displayName || Object(utils["i"])(resolvedType, "Anonymous");
                case SuspenseComponent:
                  return "Suspense";
                case LegacyHiddenComponent:
                  return "LegacyHidden";
                case OffscreenComponent:
                  return "Offscreen";
                case ScopeComponent:
                  return "Scope";
                case SuspenseListComponent:
                  return "SuspenseList";
                case Profiler:
                  return "Profiler";
                default:
                  const typeSymbol = getTypeSymbol(type);
                  switch (typeSymbol) {
                    case ReactSymbols["a"]:
                    case ReactSymbols["b"]:
                    case ReactSymbols["e"]:
                      return null;
                    case ReactSymbols["n"]:
                    case ReactSymbols["o"]:
                      resolvedContext = fiber.type._context || fiber.type.context;
                      return `${resolvedContext.displayName || "Context"}.Provider`;
                    case ReactSymbols["c"]:
                    case ReactSymbols["d"]:
                      resolvedContext = fiber.type._context || fiber.type;
                      return `${resolvedContext.displayName || "Context"}.Consumer`;
                    case ReactSymbols["r"]:
                    case ReactSymbols["s"]:
                      return null;
                    case ReactSymbols["l"]:
                    case ReactSymbols["m"]:
                      return `Profiler(${fiber.memoizedProps.id})`;
                    case ReactSymbols["p"]:
                    case ReactSymbols["q"]:
                      return "Scope";
                    default:
                      return null;
                  }
              }
            }
            return {
              getDisplayNameForFiber,
              getTypeSymbol,
              ReactPriorityLevels,
              ReactTypeOfWork,
              ReactTypeOfSideEffect,
              StrictModeBits
            };
          }
          function attach(hook, rendererID, renderer, global) {
            const version = renderer.reconcilerVersion || renderer.version;
            const {
              getDisplayNameForFiber,
              getTypeSymbol,
              ReactPriorityLevels,
              ReactTypeOfWork,
              ReactTypeOfSideEffect,
              StrictModeBits
            } = getInternalReactConstants(version);
            const {
              DidCapture,
              Hydrating,
              NoFlags,
              PerformedWork,
              Placement
            } = ReactTypeOfSideEffect;
            const {
              CacheComponent,
              ClassComponent,
              ContextConsumer,
              DehydratedSuspenseComponent,
              ForwardRef,
              Fragment,
              FunctionComponent,
              HostRoot,
              HostPortal,
              HostComponent,
              HostText,
              IncompleteClassComponent,
              IndeterminateComponent,
              LegacyHiddenComponent,
              MemoComponent,
              OffscreenComponent,
              SimpleMemoComponent,
              SuspenseComponent,
              SuspenseListComponent
            } = ReactTypeOfWork;
            const {
              ImmediatePriority,
              UserBlockingPriority,
              NormalPriority,
              LowPriority,
              IdlePriority,
              NoPriority
            } = ReactPriorityLevels;
            const {
              overrideHookState,
              overrideHookStateDeletePath,
              overrideHookStateRenamePath,
              overrideProps,
              overridePropsDeletePath,
              overridePropsRenamePath,
              scheduleRefresh,
              setErrorHandler,
              setSuspenseHandler,
              scheduleUpdate
            } = renderer;
            const supportsTogglingError = typeof setErrorHandler === "function" && typeof scheduleUpdate === "function";
            const supportsTogglingSuspense = typeof setSuspenseHandler === "function" && typeof scheduleUpdate === "function";
            if (typeof scheduleRefresh === "function") {
              renderer.scheduleRefresh = (...args) => {
                try {
                  hook.emit("fastRefreshScheduled");
                } finally {
                  return scheduleRefresh(...args);
                }
              };
            }
            const fibersWithChangedErrorOrWarningCounts = /* @__PURE__ */ new Set();
            const pendingFiberToErrorsMap = /* @__PURE__ */ new Map();
            const pendingFiberToWarningsMap = /* @__PURE__ */ new Map();
            const fiberIDToErrorsMap = /* @__PURE__ */ new Map();
            const fiberIDToWarningsMap = /* @__PURE__ */ new Map();
            function clearErrorsAndWarnings() {
              for (const id of fiberIDToErrorsMap.keys()) {
                const fiber = idToArbitraryFiberMap.get(id);
                if (fiber != null) {
                  fibersWithChangedErrorOrWarningCounts.add(fiber);
                  updateMostRecentlyInspectedElementIfNecessary(id);
                }
              }
              for (const id of fiberIDToWarningsMap.keys()) {
                const fiber = idToArbitraryFiberMap.get(id);
                if (fiber != null) {
                  fibersWithChangedErrorOrWarningCounts.add(fiber);
                  updateMostRecentlyInspectedElementIfNecessary(id);
                }
              }
              fiberIDToErrorsMap.clear();
              fiberIDToWarningsMap.clear();
              flushPendingEvents();
            }
            function clearMessageCountHelper(fiberID, pendingFiberToMessageCountMap, fiberIDToMessageCountMap) {
              const fiber = idToArbitraryFiberMap.get(fiberID);
              if (fiber != null) {
                pendingFiberToErrorsMap.delete(fiber);
                if (fiberIDToMessageCountMap.has(fiberID)) {
                  fiberIDToMessageCountMap.delete(fiberID);
                  fibersWithChangedErrorOrWarningCounts.add(fiber);
                  flushPendingEvents();
                  updateMostRecentlyInspectedElementIfNecessary(fiberID);
                } else {
                  fibersWithChangedErrorOrWarningCounts.delete(fiber);
                }
              }
            }
            function clearErrorsForFiberID(fiberID) {
              clearMessageCountHelper(fiberID, pendingFiberToErrorsMap, fiberIDToErrorsMap);
            }
            function clearWarningsForFiberID(fiberID) {
              clearMessageCountHelper(fiberID, pendingFiberToWarningsMap, fiberIDToWarningsMap);
            }
            function updateMostRecentlyInspectedElementIfNecessary(fiberID) {
              if (mostRecentlyInspectedElement !== null && mostRecentlyInspectedElement.id === fiberID) {
                hasElementUpdatedSinceLastInspected = true;
              }
            }
            function onErrorOrWarning(fiber, type, args) {
              if (type === "error") {
                const maybeID = getFiberIDUnsafe(fiber);
                if (maybeID != null && forceErrorForFiberIDs.get(maybeID) === true) {
                  return;
                }
              }
              const message = Object(backend_utils["f"])(...args);
              if (constants["D"]) {
                debug("onErrorOrWarning", fiber, null, `${type}: "${message}"`);
              }
              fibersWithChangedErrorOrWarningCounts.add(fiber);
              const fiberMap = type === "error" ? pendingFiberToErrorsMap : pendingFiberToWarningsMap;
              const messageMap = fiberMap.get(fiber);
              if (messageMap != null) {
                const count = messageMap.get(message) || 0;
                messageMap.set(message, count + 1);
              } else {
                fiberMap.set(fiber, /* @__PURE__ */ new Map([[message, 1]]));
              }
              flushPendingErrorsAndWarningsAfterDelay();
            }
            if (true) {
              Object(backend_console["c"])(renderer, onErrorOrWarning);
              const appendComponentStack = window.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ !== false;
              const breakOnConsoleErrors = window.__REACT_DEVTOOLS_BREAK_ON_CONSOLE_ERRORS__ === true;
              const showInlineWarningsAndErrors = window.__REACT_DEVTOOLS_SHOW_INLINE_WARNINGS_AND_ERRORS__ !== false;
              const hideConsoleLogsInStrictMode = window.__REACT_DEVTOOLS_HIDE_CONSOLE_LOGS_IN_STRICT_MODE__ === true;
              const browserTheme = window.__REACT_DEVTOOLS_BROWSER_THEME__;
              Object(backend_console["a"])({
                appendComponentStack,
                breakOnConsoleErrors,
                showInlineWarningsAndErrors,
                hideConsoleLogsInStrictMode,
                browserTheme
              });
            }
            const debug = (name, fiber, parentFiber, extraString = "") => {
              if (constants["D"]) {
                const displayName = fiber.tag + ":" + (getDisplayNameForFiber(fiber) || "null");
                const maybeID = getFiberIDUnsafe(fiber) || "<no id>";
                const parentDisplayName = parentFiber ? parentFiber.tag + ":" + (getDisplayNameForFiber(parentFiber) || "null") : "";
                const maybeParentID = parentFiber ? getFiberIDUnsafe(parentFiber) || "<no-id>" : "";
                console.groupCollapsed(`[renderer] %c${name} %c${displayName} (${maybeID}) %c${parentFiber ? `${parentDisplayName} (${maybeParentID})` : ""} %c${extraString}`, "color: red; font-weight: bold;", "color: blue;", "color: purple;", "color: black;");
                console.log(new Error().stack.split("\n").slice(1).join("\n"));
                console.groupEnd();
              }
            };
            const hideElementsWithDisplayNames = /* @__PURE__ */ new Set();
            const hideElementsWithPaths = /* @__PURE__ */ new Set();
            const hideElementsWithTypes = /* @__PURE__ */ new Set();
            let traceUpdatesEnabled = false;
            const traceUpdatesForNodes = /* @__PURE__ */ new Set();
            function applyComponentFilters(componentFilters) {
              hideElementsWithTypes.clear();
              hideElementsWithDisplayNames.clear();
              hideElementsWithPaths.clear();
              componentFilters.forEach((componentFilter) => {
                if (!componentFilter.isEnabled) {
                  return;
                }
                switch (componentFilter.type) {
                  case types["a"]:
                    if (componentFilter.isValid && componentFilter.value !== "") {
                      hideElementsWithDisplayNames.add(new RegExp(componentFilter.value, "i"));
                    }
                    break;
                  case types["b"]:
                    hideElementsWithTypes.add(componentFilter.value);
                    break;
                  case types["d"]:
                    if (componentFilter.isValid && componentFilter.value !== "") {
                      hideElementsWithPaths.add(new RegExp(componentFilter.value, "i"));
                    }
                    break;
                  case types["c"]:
                    hideElementsWithDisplayNames.add(new RegExp("\\("));
                    break;
                  default:
                    console.warn(`Invalid component filter type "${componentFilter.type}"`);
                    break;
                }
              });
            }
            if (window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ != null) {
              applyComponentFilters(window.__REACT_DEVTOOLS_COMPONENT_FILTERS__);
            } else {
              applyComponentFilters(Object(utils["g"])());
            }
            function updateComponentFilters(componentFilters) {
              if (isProfiling) {
                throw Error("Cannot modify filter preferences while profiling");
              }
              hook.getFiberRoots(rendererID).forEach((root) => {
                currentRootID = getOrGenerateFiberID(root.current);
                pushOperation(constants["x"]);
                flushPendingEvents(root);
                currentRootID = -1;
              });
              applyComponentFilters(componentFilters);
              rootDisplayNameCounter.clear();
              hook.getFiberRoots(rendererID).forEach((root) => {
                currentRootID = getOrGenerateFiberID(root.current);
                setRootPseudoKey(currentRootID, root.current);
                mountFiberRecursively(root.current, null, false, false);
                flushPendingEvents(root);
                currentRootID = -1;
              });
              reevaluateErrorsAndWarnings();
              flushPendingEvents();
            }
            function shouldFilterFiber(fiber) {
              const {
                _debugSource,
                tag,
                type
              } = fiber;
              switch (tag) {
                case DehydratedSuspenseComponent:
                  return true;
                case HostPortal:
                case HostText:
                case Fragment:
                case LegacyHiddenComponent:
                case OffscreenComponent:
                  return true;
                case HostRoot:
                  return false;
                default:
                  const typeSymbol = getTypeSymbol(type);
                  switch (typeSymbol) {
                    case ReactSymbols["a"]:
                    case ReactSymbols["b"]:
                    case ReactSymbols["e"]:
                    case ReactSymbols["r"]:
                    case ReactSymbols["s"]:
                      return true;
                    default:
                      break;
                  }
              }
              const elementType = getElementTypeForFiber(fiber);
              if (hideElementsWithTypes.has(elementType)) {
                return true;
              }
              if (hideElementsWithDisplayNames.size > 0) {
                const displayName = getDisplayNameForFiber(fiber);
                if (displayName != null) {
                  for (const displayNameRegExp of hideElementsWithDisplayNames) {
                    if (displayNameRegExp.test(displayName)) {
                      return true;
                    }
                  }
                }
              }
              if (_debugSource != null && hideElementsWithPaths.size > 0) {
                const {
                  fileName
                } = _debugSource;
                for (const pathRegExp of hideElementsWithPaths) {
                  if (pathRegExp.test(fileName)) {
                    return true;
                  }
                }
              }
              return false;
            }
            function getElementTypeForFiber(fiber) {
              const {
                type,
                tag
              } = fiber;
              switch (tag) {
                case ClassComponent:
                case IncompleteClassComponent:
                  return types["e"];
                case FunctionComponent:
                case IndeterminateComponent:
                  return types["h"];
                case ForwardRef:
                  return types["g"];
                case HostRoot:
                  return types["m"];
                case HostComponent:
                  return types["i"];
                case HostPortal:
                case HostText:
                case Fragment:
                  return types["k"];
                case MemoComponent:
                case SimpleMemoComponent:
                  return types["j"];
                case SuspenseComponent:
                  return types["n"];
                case SuspenseListComponent:
                  return types["o"];
                default:
                  const typeSymbol = getTypeSymbol(type);
                  switch (typeSymbol) {
                    case ReactSymbols["a"]:
                    case ReactSymbols["b"]:
                    case ReactSymbols["e"]:
                      return types["k"];
                    case ReactSymbols["n"]:
                    case ReactSymbols["o"]:
                      return types["f"];
                    case ReactSymbols["c"]:
                    case ReactSymbols["d"]:
                      return types["f"];
                    case ReactSymbols["r"]:
                    case ReactSymbols["s"]:
                      return types["k"];
                    case ReactSymbols["l"]:
                    case ReactSymbols["m"]:
                      return types["l"];
                    default:
                      return types["k"];
                  }
              }
            }
            const fiberToIDMap = /* @__PURE__ */ new Map();
            const idToArbitraryFiberMap = /* @__PURE__ */ new Map();
            const idToTreeBaseDurationMap = /* @__PURE__ */ new Map();
            const idToRootMap = /* @__PURE__ */ new Map();
            let currentRootID = -1;
            function getOrGenerateFiberID(fiber) {
              let id = null;
              if (fiberToIDMap.has(fiber)) {
                id = fiberToIDMap.get(fiber);
              } else {
                const {
                  alternate: alternate2
                } = fiber;
                if (alternate2 !== null && fiberToIDMap.has(alternate2)) {
                  id = fiberToIDMap.get(alternate2);
                }
              }
              let didGenerateID = false;
              if (id === null) {
                didGenerateID = true;
                id = Object(utils["p"])();
              }
              const refinedID = id;
              if (!fiberToIDMap.has(fiber)) {
                fiberToIDMap.set(fiber, refinedID);
                idToArbitraryFiberMap.set(refinedID, fiber);
              }
              const {
                alternate
              } = fiber;
              if (alternate !== null) {
                if (!fiberToIDMap.has(alternate)) {
                  fiberToIDMap.set(alternate, refinedID);
                }
              }
              if (constants["D"]) {
                if (didGenerateID) {
                  debug("getOrGenerateFiberID()", fiber, fiber.return, "Generated a new UID");
                }
              }
              return refinedID;
            }
            function getFiberIDThrows(fiber) {
              const maybeID = getFiberIDUnsafe(fiber);
              if (maybeID !== null) {
                return maybeID;
              }
              throw Error(`Could not find ID for Fiber "${getDisplayNameForFiber(fiber) || ""}"`);
            }
            function getFiberIDUnsafe(fiber) {
              if (fiberToIDMap.has(fiber)) {
                return fiberToIDMap.get(fiber);
              } else {
                const {
                  alternate
                } = fiber;
                if (alternate !== null && fiberToIDMap.has(alternate)) {
                  return fiberToIDMap.get(alternate);
                }
              }
              return null;
            }
            function untrackFiberID(fiber) {
              if (constants["D"]) {
                debug("untrackFiberID()", fiber, fiber.return, "schedule after delay");
              }
              untrackFibersSet.add(fiber);
              const alternate = fiber.alternate;
              if (alternate !== null) {
                untrackFibersSet.add(alternate);
              }
              if (untrackFibersTimeoutID === null) {
                untrackFibersTimeoutID = setTimeout(untrackFibers, 1e3);
              }
            }
            const untrackFibersSet = /* @__PURE__ */ new Set();
            let untrackFibersTimeoutID = null;
            function untrackFibers() {
              if (untrackFibersTimeoutID !== null) {
                clearTimeout(untrackFibersTimeoutID);
                untrackFibersTimeoutID = null;
              }
              untrackFibersSet.forEach((fiber) => {
                const fiberID = getFiberIDUnsafe(fiber);
                if (fiberID !== null) {
                  idToArbitraryFiberMap.delete(fiberID);
                  clearErrorsForFiberID(fiberID);
                  clearWarningsForFiberID(fiberID);
                }
                fiberToIDMap.delete(fiber);
                const {
                  alternate
                } = fiber;
                if (alternate !== null) {
                  fiberToIDMap.delete(alternate);
                }
                if (forceErrorForFiberIDs.has(fiberID)) {
                  forceErrorForFiberIDs.delete(fiberID);
                  if (forceErrorForFiberIDs.size === 0 && setErrorHandler != null) {
                    setErrorHandler(shouldErrorFiberAlwaysNull);
                  }
                }
              });
              untrackFibersSet.clear();
            }
            function getChangeDescription(prevFiber, nextFiber) {
              switch (getElementTypeForFiber(nextFiber)) {
                case types["e"]:
                case types["h"]:
                case types["j"]:
                case types["g"]:
                  if (prevFiber === null) {
                    return {
                      context: null,
                      didHooksChange: false,
                      isFirstMount: true,
                      props: null,
                      state: null
                    };
                  } else {
                    const data = {
                      context: getContextChangedKeys(nextFiber),
                      didHooksChange: false,
                      isFirstMount: false,
                      props: getChangedKeys(prevFiber.memoizedProps, nextFiber.memoizedProps),
                      state: getChangedKeys(prevFiber.memoizedState, nextFiber.memoizedState)
                    };
                    if (DevToolsFeatureFlags_default["d"]) {
                      const indices = getChangedHooksIndices(prevFiber.memoizedState, nextFiber.memoizedState);
                      data.hooks = indices;
                      data.didHooksChange = indices !== null && indices.length > 0;
                    } else {
                      data.didHooksChange = didHooksChange(prevFiber.memoizedState, nextFiber.memoizedState);
                    }
                    return data;
                  }
                default:
                  return null;
              }
            }
            function updateContextsForFiber(fiber) {
              switch (getElementTypeForFiber(fiber)) {
                case types["e"]:
                case types["g"]:
                case types["h"]:
                case types["j"]:
                  if (idToContextsMap !== null) {
                    const id = getFiberIDThrows(fiber);
                    const contexts = getContextsForFiber(fiber);
                    if (contexts !== null) {
                      idToContextsMap.set(id, contexts);
                    }
                  }
                  break;
                default:
                  break;
              }
            }
            const NO_CONTEXT = {};
            function getContextsForFiber(fiber) {
              let legacyContext = NO_CONTEXT;
              let modernContext = NO_CONTEXT;
              switch (getElementTypeForFiber(fiber)) {
                case types["e"]:
                  const instance = fiber.stateNode;
                  if (instance != null) {
                    if (instance.constructor && instance.constructor.contextType != null) {
                      modernContext = instance.context;
                    } else {
                      legacyContext = instance.context;
                      if (legacyContext && Object.keys(legacyContext).length === 0) {
                        legacyContext = NO_CONTEXT;
                      }
                    }
                  }
                  return [legacyContext, modernContext];
                case types["g"]:
                case types["h"]:
                case types["j"]:
                  const dependencies = fiber.dependencies;
                  if (dependencies && dependencies.firstContext) {
                    modernContext = dependencies.firstContext;
                  }
                  return [legacyContext, modernContext];
                default:
                  return null;
              }
            }
            function crawlToInitializeContextsMap(fiber) {
              updateContextsForFiber(fiber);
              let current = fiber.child;
              while (current !== null) {
                crawlToInitializeContextsMap(current);
                current = current.sibling;
              }
            }
            function getContextChangedKeys(fiber) {
              if (idToContextsMap !== null) {
                const id = getFiberIDThrows(fiber);
                const prevContexts = idToContextsMap.has(id) ? idToContextsMap.get(id) : null;
                const nextContexts = getContextsForFiber(fiber);
                if (prevContexts == null || nextContexts == null) {
                  return null;
                }
                const [prevLegacyContext, prevModernContext] = prevContexts;
                const [nextLegacyContext, nextModernContext] = nextContexts;
                switch (getElementTypeForFiber(fiber)) {
                  case types["e"]:
                    if (prevContexts && nextContexts) {
                      if (nextLegacyContext !== NO_CONTEXT) {
                        return getChangedKeys(prevLegacyContext, nextLegacyContext);
                      } else if (nextModernContext !== NO_CONTEXT) {
                        return prevModernContext !== nextModernContext;
                      }
                    }
                    break;
                  case types["g"]:
                  case types["h"]:
                  case types["j"]:
                    if (nextModernContext !== NO_CONTEXT) {
                      let prevContext = prevModernContext;
                      let nextContext = nextModernContext;
                      while (prevContext && nextContext) {
                        if (!shared_objectIs(prevContext.memoizedValue, nextContext.memoizedValue)) {
                          return true;
                        }
                        prevContext = prevContext.next;
                        nextContext = nextContext.next;
                      }
                      return false;
                    }
                    break;
                  default:
                    break;
                }
              }
              return null;
            }
            function areHookInputsEqual(nextDeps, prevDeps) {
              if (prevDeps === null) {
                return false;
              }
              for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
                if (shared_objectIs(nextDeps[i], prevDeps[i])) {
                  continue;
                }
                return false;
              }
              return true;
            }
            function isEffect(memoizedState) {
              if (memoizedState === null || typeof memoizedState !== "object") {
                return false;
              }
              const {
                deps
              } = memoizedState;
              const boundHasOwnProperty = shared_hasOwnProperty.bind(memoizedState);
              return boundHasOwnProperty("create") && boundHasOwnProperty("destroy") && boundHasOwnProperty("deps") && boundHasOwnProperty("next") && boundHasOwnProperty("tag") && (deps === null || Object(isArray["a"])(deps));
            }
            function didHookChange(prev, next) {
              const prevMemoizedState = prev.memoizedState;
              const nextMemoizedState = next.memoizedState;
              if (isEffect(prevMemoizedState) && isEffect(nextMemoizedState)) {
                return prevMemoizedState !== nextMemoizedState && !areHookInputsEqual(nextMemoizedState.deps, prevMemoizedState.deps);
              }
              return nextMemoizedState !== prevMemoizedState;
            }
            function didHooksChange(prev, next) {
              if (prev == null || next == null) {
                return false;
              }
              if (next.hasOwnProperty("baseState") && next.hasOwnProperty("memoizedState") && next.hasOwnProperty("next") && next.hasOwnProperty("queue")) {
                while (next !== null) {
                  if (didHookChange(prev, next)) {
                    return true;
                  } else {
                    next = next.next;
                    prev = prev.next;
                  }
                }
              }
              return false;
            }
            function getChangedHooksIndices(prev, next) {
              if (DevToolsFeatureFlags_default["d"]) {
                if (prev == null || next == null) {
                  return null;
                }
                const indices = [];
                let index = 0;
                if (next.hasOwnProperty("baseState") && next.hasOwnProperty("memoizedState") && next.hasOwnProperty("next") && next.hasOwnProperty("queue")) {
                  while (next !== null) {
                    if (didHookChange(prev, next)) {
                      indices.push(index);
                    }
                    next = next.next;
                    prev = prev.next;
                    index++;
                  }
                }
                return indices;
              }
              return null;
            }
            function getChangedKeys(prev, next) {
              if (prev == null || next == null) {
                return null;
              }
              if (next.hasOwnProperty("baseState") && next.hasOwnProperty("memoizedState") && next.hasOwnProperty("next") && next.hasOwnProperty("queue")) {
                return null;
              }
              const keys = /* @__PURE__ */ new Set([...Object.keys(prev), ...Object.keys(next)]);
              const changedKeys = [];
              for (const key of keys) {
                if (prev[key] !== next[key]) {
                  changedKeys.push(key);
                }
              }
              return changedKeys;
            }
            function didFiberRender(prevFiber, nextFiber) {
              switch (nextFiber.tag) {
                case ClassComponent:
                case FunctionComponent:
                case ContextConsumer:
                case MemoComponent:
                case SimpleMemoComponent:
                  return (getFiberFlags(nextFiber) & PerformedWork) === PerformedWork;
                default:
                  return prevFiber.memoizedProps !== nextFiber.memoizedProps || prevFiber.memoizedState !== nextFiber.memoizedState || prevFiber.ref !== nextFiber.ref;
              }
            }
            const pendingOperations = [];
            const pendingRealUnmountedIDs = [];
            const pendingSimulatedUnmountedIDs = [];
            let pendingOperationsQueue = [];
            const pendingStringTable = /* @__PURE__ */ new Map();
            let pendingStringTableLength = 0;
            let pendingUnmountedRootID = null;
            function pushOperation(op) {
              if (false) {
              }
              pendingOperations.push(op);
            }
            function flushOrQueueOperations(operations) {
              if (operations.length === 3) {
                if (!isProfiling || currentCommitProfilingMetadata == null || currentCommitProfilingMetadata.durations.length === 0) {
                  return;
                }
              }
              if (pendingOperationsQueue !== null) {
                pendingOperationsQueue.push(operations);
              } else {
                hook.emit("operations", operations);
              }
            }
            let flushPendingErrorsAndWarningsAfterDelayTimeoutID = null;
            function clearPendingErrorsAndWarningsAfterDelay() {
              if (flushPendingErrorsAndWarningsAfterDelayTimeoutID !== null) {
                clearTimeout(flushPendingErrorsAndWarningsAfterDelayTimeoutID);
                flushPendingErrorsAndWarningsAfterDelayTimeoutID = null;
              }
            }
            function flushPendingErrorsAndWarningsAfterDelay() {
              clearPendingErrorsAndWarningsAfterDelay();
              flushPendingErrorsAndWarningsAfterDelayTimeoutID = setTimeout(() => {
                flushPendingErrorsAndWarningsAfterDelayTimeoutID = null;
                if (pendingOperations.length > 0) {
                  return;
                }
                recordPendingErrorsAndWarnings();
                if (pendingOperations.length === 0) {
                  return;
                }
                const operations = new Array(3 + pendingOperations.length);
                operations[0] = rendererID;
                operations[1] = currentRootID;
                operations[2] = 0;
                for (let j = 0; j < pendingOperations.length; j++) {
                  operations[3 + j] = pendingOperations[j];
                }
                flushOrQueueOperations(operations);
                pendingOperations.length = 0;
              }, 1e3);
            }
            function reevaluateErrorsAndWarnings() {
              fibersWithChangedErrorOrWarningCounts.clear();
              fiberIDToErrorsMap.forEach((countMap, fiberID) => {
                const fiber = idToArbitraryFiberMap.get(fiberID);
                if (fiber != null) {
                  fibersWithChangedErrorOrWarningCounts.add(fiber);
                }
              });
              fiberIDToWarningsMap.forEach((countMap, fiberID) => {
                const fiber = idToArbitraryFiberMap.get(fiberID);
                if (fiber != null) {
                  fibersWithChangedErrorOrWarningCounts.add(fiber);
                }
              });
              recordPendingErrorsAndWarnings();
            }
            function mergeMapsAndGetCountHelper(fiber, fiberID, pendingFiberToMessageCountMap, fiberIDToMessageCountMap) {
              let newCount = 0;
              let messageCountMap = fiberIDToMessageCountMap.get(fiberID);
              const pendingMessageCountMap = pendingFiberToMessageCountMap.get(fiber);
              if (pendingMessageCountMap != null) {
                if (messageCountMap == null) {
                  messageCountMap = pendingMessageCountMap;
                  fiberIDToMessageCountMap.set(fiberID, pendingMessageCountMap);
                } else {
                  const refinedMessageCountMap = messageCountMap;
                  pendingMessageCountMap.forEach((pendingCount, message) => {
                    const previousCount = refinedMessageCountMap.get(message) || 0;
                    refinedMessageCountMap.set(message, previousCount + pendingCount);
                  });
                }
              }
              if (!shouldFilterFiber(fiber)) {
                if (messageCountMap != null) {
                  messageCountMap.forEach((count) => {
                    newCount += count;
                  });
                }
              }
              pendingFiberToMessageCountMap.delete(fiber);
              return newCount;
            }
            function recordPendingErrorsAndWarnings() {
              clearPendingErrorsAndWarningsAfterDelay();
              fibersWithChangedErrorOrWarningCounts.forEach((fiber) => {
                const fiberID = getFiberIDUnsafe(fiber);
                if (fiberID === null) {
                } else {
                  const errorCount = mergeMapsAndGetCountHelper(fiber, fiberID, pendingFiberToErrorsMap, fiberIDToErrorsMap);
                  const warningCount = mergeMapsAndGetCountHelper(fiber, fiberID, pendingFiberToWarningsMap, fiberIDToWarningsMap);
                  pushOperation(constants["A"]);
                  pushOperation(fiberID);
                  pushOperation(errorCount);
                  pushOperation(warningCount);
                }
                pendingFiberToErrorsMap.delete(fiber);
                pendingFiberToWarningsMap.delete(fiber);
              });
              fibersWithChangedErrorOrWarningCounts.clear();
            }
            function flushPendingEvents(root) {
              recordPendingErrorsAndWarnings();
              if (pendingOperations.length === 0 && pendingRealUnmountedIDs.length === 0 && pendingSimulatedUnmountedIDs.length === 0 && pendingUnmountedRootID === null) {
                if (!isProfiling) {
                  return;
                }
              }
              const numUnmountIDs = pendingRealUnmountedIDs.length + pendingSimulatedUnmountedIDs.length + (pendingUnmountedRootID === null ? 0 : 1);
              const operations = new Array(2 + 1 + pendingStringTableLength + (numUnmountIDs > 0 ? 2 + numUnmountIDs : 0) + pendingOperations.length);
              let i = 0;
              operations[i++] = rendererID;
              operations[i++] = currentRootID;
              operations[i++] = pendingStringTableLength;
              pendingStringTable.forEach((entry, stringKey) => {
                const encodedString = entry.encodedString;
                const length = encodedString.length;
                operations[i++] = length;
                for (let j = 0; j < length; j++) {
                  operations[i + j] = encodedString[j];
                }
                i += length;
              });
              if (numUnmountIDs > 0) {
                operations[i++] = constants["w"];
                operations[i++] = numUnmountIDs;
                for (let j = pendingRealUnmountedIDs.length - 1; j >= 0; j--) {
                  operations[i++] = pendingRealUnmountedIDs[j];
                }
                for (let j = 0; j < pendingSimulatedUnmountedIDs.length; j++) {
                  operations[i + j] = pendingSimulatedUnmountedIDs[j];
                }
                i += pendingSimulatedUnmountedIDs.length;
                if (pendingUnmountedRootID !== null) {
                  operations[i] = pendingUnmountedRootID;
                  i++;
                }
              }
              for (let j = 0; j < pendingOperations.length; j++) {
                operations[i + j] = pendingOperations[j];
              }
              i += pendingOperations.length;
              flushOrQueueOperations(operations);
              pendingOperations.length = 0;
              pendingRealUnmountedIDs.length = 0;
              pendingSimulatedUnmountedIDs.length = 0;
              pendingUnmountedRootID = null;
              pendingStringTable.clear();
              pendingStringTableLength = 0;
            }
            function getStringID(string) {
              if (string === null) {
                return 0;
              }
              const existingEntry = pendingStringTable.get(string);
              if (existingEntry !== void 0) {
                return existingEntry.id;
              }
              const id = pendingStringTable.size + 1;
              const encodedString = Object(utils["x"])(string);
              pendingStringTable.set(string, {
                encodedString,
                id
              });
              pendingStringTableLength += encodedString.length + 1;
              return id;
            }
            function recordMount(fiber, parentFiber) {
              const isRoot = fiber.tag === HostRoot;
              const id = getOrGenerateFiberID(fiber);
              if (constants["D"]) {
                debug("recordMount()", fiber, parentFiber);
              }
              const hasOwnerMetadata = fiber.hasOwnProperty("_debugOwner");
              const isProfilingSupported = fiber.hasOwnProperty("treeBaseDuration");
              if (isRoot) {
                pushOperation(constants["v"]);
                pushOperation(id);
                pushOperation(types["m"]);
                pushOperation((fiber.mode & StrictModeBits) !== 0 ? 1 : 0);
                pushOperation(isProfilingSupported ? 1 : 0);
                pushOperation(StrictModeBits !== 0 ? 1 : 0);
                pushOperation(hasOwnerMetadata ? 1 : 0);
                if (isProfiling) {
                  if (displayNamesByRootID !== null) {
                    displayNamesByRootID.set(id, getDisplayNameForRoot(fiber));
                  }
                }
              } else {
                const {
                  key
                } = fiber;
                const displayName = getDisplayNameForFiber(fiber);
                const elementType = getElementTypeForFiber(fiber);
                const {
                  _debugOwner
                } = fiber;
                const ownerID = _debugOwner != null ? getOrGenerateFiberID(_debugOwner) : 0;
                const parentID = parentFiber ? getFiberIDThrows(parentFiber) : 0;
                const displayNameStringID = getStringID(displayName);
                const keyString = key === null ? null : String(key);
                const keyStringID = getStringID(keyString);
                pushOperation(constants["v"]);
                pushOperation(id);
                pushOperation(elementType);
                pushOperation(parentID);
                pushOperation(ownerID);
                pushOperation(displayNameStringID);
                pushOperation(keyStringID);
                if ((fiber.mode & StrictModeBits) !== 0 && (parentFiber.mode & StrictModeBits) === 0) {
                  pushOperation(constants["z"]);
                  pushOperation(id);
                  pushOperation(types["p"]);
                }
              }
              if (isProfilingSupported) {
                idToRootMap.set(id, currentRootID);
                recordProfilingDurations(fiber);
              }
            }
            function recordUnmount(fiber, isSimulated) {
              if (constants["D"]) {
                debug("recordUnmount()", fiber, null, isSimulated ? "unmount is simulated" : "");
              }
              if (trackedPathMatchFiber !== null) {
                if (fiber === trackedPathMatchFiber || fiber === trackedPathMatchFiber.alternate) {
                  setTrackedPath(null);
                }
              }
              const unsafeID = getFiberIDUnsafe(fiber);
              if (unsafeID === null) {
                return;
              }
              const id = unsafeID;
              const isRoot = fiber.tag === HostRoot;
              if (isRoot) {
                pendingUnmountedRootID = id;
              } else if (!shouldFilterFiber(fiber)) {
                if (isSimulated) {
                  pendingSimulatedUnmountedIDs.push(id);
                } else {
                  pendingRealUnmountedIDs.push(id);
                }
              }
              if (!fiber._debugNeedsRemount) {
                untrackFiberID(fiber);
                const isProfilingSupported = fiber.hasOwnProperty("treeBaseDuration");
                if (isProfilingSupported) {
                  idToRootMap.delete(id);
                  idToTreeBaseDurationMap.delete(id);
                }
              }
            }
            function mountFiberRecursively(firstChild, parentFiber, traverseSiblings, traceNearestHostComponentUpdate) {
              let fiber = firstChild;
              while (fiber !== null) {
                getOrGenerateFiberID(fiber);
                if (constants["D"]) {
                  debug("mountFiberRecursively()", fiber, parentFiber);
                }
                const mightSiblingsBeOnTrackedPath = updateTrackedPathStateBeforeMount(fiber);
                const shouldIncludeInTree = !shouldFilterFiber(fiber);
                if (shouldIncludeInTree) {
                  recordMount(fiber, parentFiber);
                }
                if (traceUpdatesEnabled) {
                  if (traceNearestHostComponentUpdate) {
                    const elementType = getElementTypeForFiber(fiber);
                    if (elementType === types["i"]) {
                      traceUpdatesForNodes.add(fiber.stateNode);
                      traceNearestHostComponentUpdate = false;
                    }
                  }
                }
                const isSuspense = fiber.tag === ReactTypeOfWork.SuspenseComponent;
                if (isSuspense) {
                  const isTimedOut = fiber.memoizedState !== null;
                  if (isTimedOut) {
                    const primaryChildFragment = fiber.child;
                    const fallbackChildFragment = primaryChildFragment ? primaryChildFragment.sibling : null;
                    const fallbackChild = fallbackChildFragment ? fallbackChildFragment.child : null;
                    if (fallbackChild !== null) {
                      mountFiberRecursively(fallbackChild, shouldIncludeInTree ? fiber : parentFiber, true, traceNearestHostComponentUpdate);
                    }
                  } else {
                    let primaryChild = null;
                    const areSuspenseChildrenConditionallyWrapped = OffscreenComponent === -1;
                    if (areSuspenseChildrenConditionallyWrapped) {
                      primaryChild = fiber.child;
                    } else if (fiber.child !== null) {
                      primaryChild = fiber.child.child;
                    }
                    if (primaryChild !== null) {
                      mountFiberRecursively(primaryChild, shouldIncludeInTree ? fiber : parentFiber, true, traceNearestHostComponentUpdate);
                    }
                  }
                } else {
                  if (fiber.child !== null) {
                    mountFiberRecursively(fiber.child, shouldIncludeInTree ? fiber : parentFiber, true, traceNearestHostComponentUpdate);
                  }
                }
                updateTrackedPathStateAfterMount(mightSiblingsBeOnTrackedPath);
                fiber = traverseSiblings ? fiber.sibling : null;
              }
            }
            function unmountFiberChildrenRecursively(fiber) {
              if (constants["D"]) {
                debug("unmountFiberChildrenRecursively()", fiber);
              }
              const isTimedOutSuspense = fiber.tag === ReactTypeOfWork.SuspenseComponent && fiber.memoizedState !== null;
              let child = fiber.child;
              if (isTimedOutSuspense) {
                const primaryChildFragment = fiber.child;
                const fallbackChildFragment = primaryChildFragment ? primaryChildFragment.sibling : null;
                child = fallbackChildFragment ? fallbackChildFragment.child : null;
              }
              while (child !== null) {
                if (child.return !== null) {
                  unmountFiberChildrenRecursively(child);
                  recordUnmount(child, true);
                }
                child = child.sibling;
              }
            }
            function recordProfilingDurations(fiber) {
              const id = getFiberIDThrows(fiber);
              const {
                actualDuration,
                treeBaseDuration
              } = fiber;
              idToTreeBaseDurationMap.set(id, treeBaseDuration || 0);
              if (isProfiling) {
                const {
                  alternate
                } = fiber;
                if (alternate == null || treeBaseDuration !== alternate.treeBaseDuration) {
                  const convertedTreeBaseDuration = Math.floor((treeBaseDuration || 0) * 1e3);
                  pushOperation(constants["B"]);
                  pushOperation(id);
                  pushOperation(convertedTreeBaseDuration);
                }
                if (alternate == null || didFiberRender(alternate, fiber)) {
                  if (actualDuration != null) {
                    let selfDuration = actualDuration;
                    let child = fiber.child;
                    while (child !== null) {
                      selfDuration -= child.actualDuration || 0;
                      child = child.sibling;
                    }
                    const metadata = currentCommitProfilingMetadata;
                    metadata.durations.push(id, actualDuration, selfDuration);
                    metadata.maxActualDuration = Math.max(metadata.maxActualDuration, actualDuration);
                    if (recordChangeDescriptions) {
                      const changeDescription = getChangeDescription(alternate, fiber);
                      if (changeDescription !== null) {
                        if (metadata.changeDescriptions !== null) {
                          metadata.changeDescriptions.set(id, changeDescription);
                        }
                      }
                      updateContextsForFiber(fiber);
                    }
                  }
                }
              }
            }
            function recordResetChildren(fiber, childSet) {
              if (constants["D"]) {
                debug("recordResetChildren()", childSet, fiber);
              }
              const nextChildren = [];
              let child = childSet;
              while (child !== null) {
                findReorderedChildrenRecursively(child, nextChildren);
                child = child.sibling;
              }
              const numChildren = nextChildren.length;
              if (numChildren < 2) {
                return;
              }
              pushOperation(constants["y"]);
              pushOperation(getFiberIDThrows(fiber));
              pushOperation(numChildren);
              for (let i = 0; i < nextChildren.length; i++) {
                pushOperation(nextChildren[i]);
              }
            }
            function findReorderedChildrenRecursively(fiber, nextChildren) {
              if (!shouldFilterFiber(fiber)) {
                nextChildren.push(getFiberIDThrows(fiber));
              } else {
                let child = fiber.child;
                const isTimedOutSuspense = fiber.tag === SuspenseComponent && fiber.memoizedState !== null;
                if (isTimedOutSuspense) {
                  const primaryChildFragment = fiber.child;
                  const fallbackChildFragment = primaryChildFragment ? primaryChildFragment.sibling : null;
                  const fallbackChild = fallbackChildFragment ? fallbackChildFragment.child : null;
                  if (fallbackChild !== null) {
                    child = fallbackChild;
                  }
                }
                while (child !== null) {
                  findReorderedChildrenRecursively(child, nextChildren);
                  child = child.sibling;
                }
              }
            }
            function updateFiberRecursively(nextFiber, prevFiber, parentFiber, traceNearestHostComponentUpdate) {
              const id = getOrGenerateFiberID(nextFiber);
              if (constants["D"]) {
                debug("updateFiberRecursively()", nextFiber, parentFiber);
              }
              if (traceUpdatesEnabled) {
                const elementType = getElementTypeForFiber(nextFiber);
                if (traceNearestHostComponentUpdate) {
                  if (elementType === types["i"]) {
                    traceUpdatesForNodes.add(nextFiber.stateNode);
                    traceNearestHostComponentUpdate = false;
                  }
                } else {
                  if (elementType === types["h"] || elementType === types["e"] || elementType === types["f"] || elementType === types["j"] || elementType === types["g"]) {
                    traceNearestHostComponentUpdate = didFiberRender(prevFiber, nextFiber);
                  }
                }
              }
              if (mostRecentlyInspectedElement !== null && mostRecentlyInspectedElement.id === id && didFiberRender(prevFiber, nextFiber)) {
                hasElementUpdatedSinceLastInspected = true;
              }
              const shouldIncludeInTree = !shouldFilterFiber(nextFiber);
              const isSuspense = nextFiber.tag === SuspenseComponent;
              let shouldResetChildren = false;
              const prevDidTimeout = isSuspense && prevFiber.memoizedState !== null;
              const nextDidTimeOut = isSuspense && nextFiber.memoizedState !== null;
              if (prevDidTimeout && nextDidTimeOut) {
                const nextFiberChild = nextFiber.child;
                const nextFallbackChildSet = nextFiberChild ? nextFiberChild.sibling : null;
                const prevFiberChild = prevFiber.child;
                const prevFallbackChildSet = prevFiberChild ? prevFiberChild.sibling : null;
                if (nextFallbackChildSet != null && prevFallbackChildSet != null && updateFiberRecursively(nextFallbackChildSet, prevFallbackChildSet, nextFiber, traceNearestHostComponentUpdate)) {
                  shouldResetChildren = true;
                }
              } else if (prevDidTimeout && !nextDidTimeOut) {
                const nextPrimaryChildSet = nextFiber.child;
                if (nextPrimaryChildSet !== null) {
                  mountFiberRecursively(nextPrimaryChildSet, shouldIncludeInTree ? nextFiber : parentFiber, true, traceNearestHostComponentUpdate);
                }
                shouldResetChildren = true;
              } else if (!prevDidTimeout && nextDidTimeOut) {
                unmountFiberChildrenRecursively(prevFiber);
                const nextFiberChild = nextFiber.child;
                const nextFallbackChildSet = nextFiberChild ? nextFiberChild.sibling : null;
                if (nextFallbackChildSet != null) {
                  mountFiberRecursively(nextFallbackChildSet, shouldIncludeInTree ? nextFiber : parentFiber, true, traceNearestHostComponentUpdate);
                  shouldResetChildren = true;
                }
              } else {
                if (nextFiber.child !== prevFiber.child) {
                  let nextChild = nextFiber.child;
                  let prevChildAtSameIndex = prevFiber.child;
                  while (nextChild) {
                    if (nextChild.alternate) {
                      const prevChild = nextChild.alternate;
                      if (updateFiberRecursively(nextChild, prevChild, shouldIncludeInTree ? nextFiber : parentFiber, traceNearestHostComponentUpdate)) {
                        shouldResetChildren = true;
                      }
                      if (prevChild !== prevChildAtSameIndex) {
                        shouldResetChildren = true;
                      }
                    } else {
                      mountFiberRecursively(nextChild, shouldIncludeInTree ? nextFiber : parentFiber, false, traceNearestHostComponentUpdate);
                      shouldResetChildren = true;
                    }
                    nextChild = nextChild.sibling;
                    if (!shouldResetChildren && prevChildAtSameIndex !== null) {
                      prevChildAtSameIndex = prevChildAtSameIndex.sibling;
                    }
                  }
                  if (prevChildAtSameIndex !== null) {
                    shouldResetChildren = true;
                  }
                } else {
                  if (traceUpdatesEnabled) {
                    if (traceNearestHostComponentUpdate) {
                      const hostFibers = findAllCurrentHostFibers(getFiberIDThrows(nextFiber));
                      hostFibers.forEach((hostFiber) => {
                        traceUpdatesForNodes.add(hostFiber.stateNode);
                      });
                    }
                  }
                }
              }
              if (shouldIncludeInTree) {
                const isProfilingSupported = nextFiber.hasOwnProperty("treeBaseDuration");
                if (isProfilingSupported) {
                  recordProfilingDurations(nextFiber);
                }
              }
              if (shouldResetChildren) {
                if (shouldIncludeInTree) {
                  let nextChildSet = nextFiber.child;
                  if (nextDidTimeOut) {
                    const nextFiberChild = nextFiber.child;
                    nextChildSet = nextFiberChild ? nextFiberChild.sibling : null;
                  }
                  if (nextChildSet != null) {
                    recordResetChildren(nextFiber, nextChildSet);
                  }
                  return false;
                } else {
                  return true;
                }
              } else {
                return false;
              }
            }
            function cleanup() {
            }
            function rootSupportsProfiling(root) {
              if (root.memoizedInteractions != null) {
                return true;
              } else if (root.current != null && root.current.hasOwnProperty("treeBaseDuration")) {
                return true;
              } else {
                return false;
              }
            }
            function flushInitialOperations() {
              const localPendingOperationsQueue = pendingOperationsQueue;
              pendingOperationsQueue = null;
              if (localPendingOperationsQueue !== null && localPendingOperationsQueue.length > 0) {
                localPendingOperationsQueue.forEach((operations) => {
                  hook.emit("operations", operations);
                });
              } else {
                if (trackedPath !== null) {
                  mightBeOnTrackedPath = true;
                }
                hook.getFiberRoots(rendererID).forEach((root) => {
                  currentRootID = getOrGenerateFiberID(root.current);
                  setRootPseudoKey(currentRootID, root.current);
                  if (isProfiling && rootSupportsProfiling(root)) {
                    currentCommitProfilingMetadata = {
                      changeDescriptions: recordChangeDescriptions ? /* @__PURE__ */ new Map() : null,
                      durations: [],
                      commitTime: getCurrentTime() - profilingStartTime,
                      maxActualDuration: 0,
                      priorityLevel: null,
                      updaters: getUpdatersList(root),
                      effectDuration: null,
                      passiveEffectDuration: null
                    };
                  }
                  mountFiberRecursively(root.current, null, false, false);
                  flushPendingEvents(root);
                  currentRootID = -1;
                });
              }
            }
            function getUpdatersList(root) {
              return root.memoizedUpdaters != null ? Array.from(root.memoizedUpdaters).map(fiberToSerializedElement) : null;
            }
            function handleCommitFiberUnmount(fiber) {
              recordUnmount(fiber, false);
            }
            function handlePostCommitFiberRoot(root) {
              if (isProfiling && rootSupportsProfiling(root)) {
                if (currentCommitProfilingMetadata !== null) {
                  const {
                    effectDuration,
                    passiveEffectDuration
                  } = Object(backend_utils["g"])(root);
                  currentCommitProfilingMetadata.effectDuration = effectDuration;
                  currentCommitProfilingMetadata.passiveEffectDuration = passiveEffectDuration;
                }
              }
            }
            function handleCommitFiberRoot(root, priorityLevel) {
              const current = root.current;
              const alternate = current.alternate;
              untrackFibers();
              currentRootID = getOrGenerateFiberID(current);
              if (trackedPath !== null) {
                mightBeOnTrackedPath = true;
              }
              if (traceUpdatesEnabled) {
                traceUpdatesForNodes.clear();
              }
              const isProfilingSupported = rootSupportsProfiling(root);
              if (isProfiling && isProfilingSupported) {
                currentCommitProfilingMetadata = {
                  changeDescriptions: recordChangeDescriptions ? /* @__PURE__ */ new Map() : null,
                  durations: [],
                  commitTime: getCurrentTime() - profilingStartTime,
                  maxActualDuration: 0,
                  priorityLevel: priorityLevel == null ? null : formatPriorityLevel(priorityLevel),
                  updaters: getUpdatersList(root),
                  effectDuration: null,
                  passiveEffectDuration: null
                };
              }
              if (alternate) {
                const wasMounted = alternate.memoizedState != null && alternate.memoizedState.element != null;
                const isMounted = current.memoizedState != null && current.memoizedState.element != null;
                if (!wasMounted && isMounted) {
                  setRootPseudoKey(currentRootID, current);
                  mountFiberRecursively(current, null, false, false);
                } else if (wasMounted && isMounted) {
                  updateFiberRecursively(current, alternate, null, false);
                } else if (wasMounted && !isMounted) {
                  removeRootPseudoKey(currentRootID);
                  recordUnmount(current, false);
                }
              } else {
                setRootPseudoKey(currentRootID, current);
                mountFiberRecursively(current, null, false, false);
              }
              if (isProfiling && isProfilingSupported) {
                if (currentCommitProfilingMetadata != null && currentCommitProfilingMetadata.durations.length > 0) {
                  const commitProfilingMetadata = rootToCommitProfilingMetadataMap.get(currentRootID);
                  if (commitProfilingMetadata != null) {
                    commitProfilingMetadata.push(currentCommitProfilingMetadata);
                  } else {
                    rootToCommitProfilingMetadataMap.set(currentRootID, [currentCommitProfilingMetadata]);
                  }
                }
              }
              flushPendingEvents(root);
              if (traceUpdatesEnabled) {
                hook.emit("traceUpdates", traceUpdatesForNodes);
              }
              currentRootID = -1;
            }
            function findAllCurrentHostFibers(id) {
              const fibers = [];
              const fiber = findCurrentFiberUsingSlowPathById(id);
              if (!fiber) {
                return fibers;
              }
              let node = fiber;
              while (true) {
                if (node.tag === HostComponent || node.tag === HostText) {
                  fibers.push(node);
                } else if (node.child) {
                  node.child.return = node;
                  node = node.child;
                  continue;
                }
                if (node === fiber) {
                  return fibers;
                }
                while (!node.sibling) {
                  if (!node.return || node.return === fiber) {
                    return fibers;
                  }
                  node = node.return;
                }
                node.sibling.return = node.return;
                node = node.sibling;
              }
              return fibers;
            }
            function findNativeNodesForFiberID(id) {
              try {
                let fiber = findCurrentFiberUsingSlowPathById(id);
                if (fiber === null) {
                  return null;
                }
                const isTimedOutSuspense = fiber.tag === SuspenseComponent && fiber.memoizedState !== null;
                if (isTimedOutSuspense) {
                  const maybeFallbackFiber = fiber.child && fiber.child.sibling;
                  if (maybeFallbackFiber != null) {
                    fiber = maybeFallbackFiber;
                  }
                }
                const hostFibers = findAllCurrentHostFibers(id);
                return hostFibers.map((hostFiber) => hostFiber.stateNode).filter(Boolean);
              } catch (err) {
                return null;
              }
            }
            function getDisplayNameForFiberID(id) {
              const fiber = idToArbitraryFiberMap.get(id);
              return fiber != null ? getDisplayNameForFiber(fiber) : null;
            }
            function getFiberIDForNative(hostInstance, findNearestUnfilteredAncestor = false) {
              let fiber = renderer.findFiberByHostInstance(hostInstance);
              if (fiber != null) {
                if (findNearestUnfilteredAncestor) {
                  while (fiber !== null && shouldFilterFiber(fiber)) {
                    fiber = fiber.return;
                  }
                }
                return getFiberIDThrows(fiber);
              }
              return null;
            }
            function assertIsMounted(fiber) {
              if (getNearestMountedFiber(fiber) !== fiber) {
                throw new Error("Unable to find node on an unmounted component.");
              }
            }
            function getNearestMountedFiber(fiber) {
              let node = fiber;
              let nearestMounted = fiber;
              if (!fiber.alternate) {
                let nextNode = node;
                do {
                  node = nextNode;
                  if ((node.flags & (Placement | Hydrating)) !== NoFlags) {
                    nearestMounted = node.return;
                  }
                  nextNode = node.return;
                } while (nextNode);
              } else {
                while (node.return) {
                  node = node.return;
                }
              }
              if (node.tag === HostRoot) {
                return nearestMounted;
              }
              return null;
            }
            function findCurrentFiberUsingSlowPathById(id) {
              const fiber = idToArbitraryFiberMap.get(id);
              if (fiber == null) {
                console.warn(`Could not find Fiber with id "${id}"`);
                return null;
              }
              const alternate = fiber.alternate;
              if (!alternate) {
                const nearestMounted = getNearestMountedFiber(fiber);
                if (nearestMounted === null) {
                  throw new Error("Unable to find node on an unmounted component.");
                }
                if (nearestMounted !== fiber) {
                  return null;
                }
                return fiber;
              }
              let a = fiber;
              let b = alternate;
              while (true) {
                const parentA = a.return;
                if (parentA === null) {
                  break;
                }
                const parentB = parentA.alternate;
                if (parentB === null) {
                  const nextParent = parentA.return;
                  if (nextParent !== null) {
                    a = b = nextParent;
                    continue;
                  }
                  break;
                }
                if (parentA.child === parentB.child) {
                  let child = parentA.child;
                  while (child) {
                    if (child === a) {
                      assertIsMounted(parentA);
                      return fiber;
                    }
                    if (child === b) {
                      assertIsMounted(parentA);
                      return alternate;
                    }
                    child = child.sibling;
                  }
                  throw new Error("Unable to find node on an unmounted component.");
                }
                if (a.return !== b.return) {
                  a = parentA;
                  b = parentB;
                } else {
                  let didFindChild = false;
                  let child = parentA.child;
                  while (child) {
                    if (child === a) {
                      didFindChild = true;
                      a = parentA;
                      b = parentB;
                      break;
                    }
                    if (child === b) {
                      didFindChild = true;
                      b = parentA;
                      a = parentB;
                      break;
                    }
                    child = child.sibling;
                  }
                  if (!didFindChild) {
                    child = parentB.child;
                    while (child) {
                      if (child === a) {
                        didFindChild = true;
                        a = parentB;
                        b = parentA;
                        break;
                      }
                      if (child === b) {
                        didFindChild = true;
                        b = parentB;
                        a = parentA;
                        break;
                      }
                      child = child.sibling;
                    }
                    if (!didFindChild) {
                      throw new Error("Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.");
                    }
                  }
                }
                if (a.alternate !== b) {
                  throw new Error("Return fibers should always be each others' alternates. This error is likely caused by a bug in React. Please file an issue.");
                }
              }
              if (a.tag !== HostRoot) {
                throw new Error("Unable to find node on an unmounted component.");
              }
              if (a.stateNode.current === a) {
                return fiber;
              }
              return alternate;
            }
            function prepareViewAttributeSource(id, path) {
              if (isMostRecentlyInspectedElement(id)) {
                window.$attribute = Object(utils["l"])(mostRecentlyInspectedElement, path);
              }
            }
            function prepareViewElementSource(id) {
              const fiber = idToArbitraryFiberMap.get(id);
              if (fiber == null) {
                console.warn(`Could not find Fiber with id "${id}"`);
                return;
              }
              const {
                elementType,
                tag,
                type
              } = fiber;
              switch (tag) {
                case ClassComponent:
                case IncompleteClassComponent:
                case IndeterminateComponent:
                case FunctionComponent:
                  global.$type = type;
                  break;
                case ForwardRef:
                  global.$type = type.render;
                  break;
                case MemoComponent:
                case SimpleMemoComponent:
                  global.$type = elementType != null && elementType.type != null ? elementType.type : type;
                  break;
                default:
                  global.$type = null;
                  break;
              }
            }
            function fiberToSerializedElement(fiber) {
              return {
                displayName: getDisplayNameForFiber(fiber) || "Anonymous",
                id: getFiberIDThrows(fiber),
                key: fiber.key,
                type: getElementTypeForFiber(fiber)
              };
            }
            function getOwnersList(id) {
              const fiber = findCurrentFiberUsingSlowPathById(id);
              if (fiber == null) {
                return null;
              }
              const {
                _debugOwner
              } = fiber;
              const owners = [fiberToSerializedElement(fiber)];
              if (_debugOwner) {
                let owner = _debugOwner;
                while (owner !== null) {
                  owners.unshift(fiberToSerializedElement(owner));
                  owner = owner._debugOwner || null;
                }
              }
              return owners;
            }
            function getInstanceAndStyle(id) {
              let instance = null;
              let style = null;
              const fiber = findCurrentFiberUsingSlowPathById(id);
              if (fiber !== null) {
                instance = fiber.stateNode;
                if (fiber.memoizedProps !== null) {
                  style = fiber.memoizedProps.style;
                }
              }
              return {
                instance,
                style
              };
            }
            function isErrorBoundary(fiber) {
              const {
                tag,
                type
              } = fiber;
              switch (tag) {
                case ClassComponent:
                case IncompleteClassComponent:
                  const instance = fiber.stateNode;
                  return typeof type.getDerivedStateFromError === "function" || instance !== null && typeof instance.componentDidCatch === "function";
                default:
                  return false;
              }
            }
            function getNearestErrorBoundaryID(fiber) {
              let parent = fiber.return;
              while (parent !== null) {
                if (isErrorBoundary(parent)) {
                  return getFiberIDUnsafe(parent);
                }
                parent = parent.return;
              }
              return null;
            }
            function inspectElementRaw(id) {
              const fiber = findCurrentFiberUsingSlowPathById(id);
              if (fiber == null) {
                return null;
              }
              const {
                _debugOwner,
                _debugSource,
                stateNode,
                key,
                memoizedProps,
                memoizedState,
                dependencies,
                tag,
                type
              } = fiber;
              const elementType = getElementTypeForFiber(fiber);
              const usesHooks = (tag === FunctionComponent || tag === SimpleMemoComponent || tag === ForwardRef) && (!!memoizedState || !!dependencies);
              const showState = !usesHooks && tag !== CacheComponent;
              const typeSymbol = getTypeSymbol(type);
              let canViewSource = false;
              let context = null;
              if (tag === ClassComponent || tag === FunctionComponent || tag === IncompleteClassComponent || tag === IndeterminateComponent || tag === MemoComponent || tag === ForwardRef || tag === SimpleMemoComponent) {
                canViewSource = true;
                if (stateNode && stateNode.context != null) {
                  const shouldHideContext = elementType === types["e"] && !(type.contextTypes || type.contextType);
                  if (!shouldHideContext) {
                    context = stateNode.context;
                  }
                }
              } else if (typeSymbol === ReactSymbols["c"] || typeSymbol === ReactSymbols["d"]) {
                const consumerResolvedContext = type._context || type;
                context = consumerResolvedContext._currentValue || null;
                let current2 = fiber.return;
                while (current2 !== null) {
                  const currentType = current2.type;
                  const currentTypeSymbol = getTypeSymbol(currentType);
                  if (currentTypeSymbol === ReactSymbols["n"] || currentTypeSymbol === ReactSymbols["o"]) {
                    const providerResolvedContext = currentType._context || currentType.context;
                    if (providerResolvedContext === consumerResolvedContext) {
                      context = current2.memoizedProps.value;
                      break;
                    }
                  }
                  current2 = current2.return;
                }
              }
              let hasLegacyContext = false;
              if (context !== null) {
                hasLegacyContext = !!type.contextTypes;
                context = {
                  value: context
                };
              }
              let owners = null;
              if (_debugOwner) {
                owners = [];
                let owner = _debugOwner;
                while (owner !== null) {
                  owners.push(fiberToSerializedElement(owner));
                  owner = owner._debugOwner || null;
                }
              }
              const isTimedOutSuspense = tag === SuspenseComponent && memoizedState !== null;
              let hooks = null;
              if (usesHooks) {
                const originalConsoleMethods = {};
                for (const method in console) {
                  try {
                    originalConsoleMethods[method] = console[method];
                    console[method] = () => {
                    };
                  } catch (error) {
                  }
                }
                try {
                  hooks = inspectHooksOfFiber(fiber, renderer.currentDispatcherRef, true);
                } finally {
                  for (const method in originalConsoleMethods) {
                    try {
                      console[method] = originalConsoleMethods[method];
                    } catch (error) {
                    }
                  }
                }
              }
              let rootType = null;
              let current = fiber;
              while (current.return !== null) {
                current = current.return;
              }
              const fiberRoot = current.stateNode;
              if (fiberRoot != null && fiberRoot._debugRootType !== null) {
                rootType = fiberRoot._debugRootType;
              }
              const errors = fiberIDToErrorsMap.get(id) || /* @__PURE__ */ new Map();
              const warnings = fiberIDToWarningsMap.get(id) || /* @__PURE__ */ new Map();
              const isErrored = (fiber.flags & DidCapture) !== NoFlags || forceErrorForFiberIDs.get(id) === true;
              let targetErrorBoundaryID;
              if (isErrorBoundary(fiber)) {
                targetErrorBoundaryID = isErrored ? id : getNearestErrorBoundaryID(fiber);
              } else {
                targetErrorBoundaryID = getNearestErrorBoundaryID(fiber);
              }
              const plugins = {
                stylex: null
              };
              if (DevToolsFeatureFlags_default["e"]) {
                if (memoizedProps.hasOwnProperty("xstyle")) {
                  plugins.stylex = getStyleXData(memoizedProps.xstyle);
                }
              }
              return {
                id,
                canEditHooks: typeof overrideHookState === "function",
                canEditFunctionProps: typeof overrideProps === "function",
                canEditHooksAndDeletePaths: typeof overrideHookStateDeletePath === "function",
                canEditHooksAndRenamePaths: typeof overrideHookStateRenamePath === "function",
                canEditFunctionPropsDeletePaths: typeof overridePropsDeletePath === "function",
                canEditFunctionPropsRenamePaths: typeof overridePropsRenamePath === "function",
                canToggleError: supportsTogglingError && targetErrorBoundaryID != null,
                isErrored,
                targetErrorBoundaryID,
                canToggleSuspense: supportsTogglingSuspense && (!isTimedOutSuspense || forceFallbackForSuspenseIDs.has(id)),
                canViewSource,
                hasLegacyContext,
                key: key != null ? key : null,
                displayName: getDisplayNameForFiber(fiber),
                type: elementType,
                context,
                hooks,
                props: memoizedProps,
                state: showState ? memoizedState : null,
                errors: Array.from(errors.entries()),
                warnings: Array.from(warnings.entries()),
                owners,
                source: _debugSource || null,
                rootType,
                rendererPackageName: renderer.rendererPackageName,
                rendererVersion: renderer.version,
                plugins
              };
            }
            let mostRecentlyInspectedElement = null;
            let hasElementUpdatedSinceLastInspected = false;
            let currentlyInspectedPaths = {};
            function isMostRecentlyInspectedElement(id) {
              return mostRecentlyInspectedElement !== null && mostRecentlyInspectedElement.id === id;
            }
            function isMostRecentlyInspectedElementCurrent(id) {
              return isMostRecentlyInspectedElement(id) && !hasElementUpdatedSinceLastInspected;
            }
            function mergeInspectedPaths(path) {
              let current = currentlyInspectedPaths;
              path.forEach((key) => {
                if (!current[key]) {
                  current[key] = {};
                }
                current = current[key];
              });
            }
            function createIsPathAllowed(key, secondaryCategory) {
              return function isPathAllowed(path) {
                switch (secondaryCategory) {
                  case "hooks":
                    if (path.length === 1) {
                      return true;
                    }
                    if (path[path.length - 2] === "hookSource" && path[path.length - 1] === "fileName") {
                      return true;
                    }
                    if (path[path.length - 1] === "subHooks" || path[path.length - 2] === "subHooks") {
                      return true;
                    }
                    break;
                  default:
                    break;
                }
                let current = key === null ? currentlyInspectedPaths : currentlyInspectedPaths[key];
                if (!current) {
                  return false;
                }
                for (let i = 0; i < path.length; i++) {
                  current = current[path[i]];
                  if (!current) {
                    return false;
                  }
                }
                return true;
              };
            }
            function updateSelectedElement(inspectedElement) {
              const {
                hooks,
                id,
                props
              } = inspectedElement;
              const fiber = idToArbitraryFiberMap.get(id);
              if (fiber == null) {
                console.warn(`Could not find Fiber with id "${id}"`);
                return;
              }
              const {
                elementType,
                stateNode,
                tag,
                type
              } = fiber;
              switch (tag) {
                case ClassComponent:
                case IncompleteClassComponent:
                case IndeterminateComponent:
                  global.$r = stateNode;
                  break;
                case FunctionComponent:
                  global.$r = {
                    hooks,
                    props,
                    type
                  };
                  break;
                case ForwardRef:
                  global.$r = {
                    hooks,
                    props,
                    type: type.render
                  };
                  break;
                case MemoComponent:
                case SimpleMemoComponent:
                  global.$r = {
                    hooks,
                    props,
                    type: elementType != null && elementType.type != null ? elementType.type : type
                  };
                  break;
                default:
                  global.$r = null;
                  break;
              }
            }
            function storeAsGlobal(id, path, count) {
              if (isMostRecentlyInspectedElement(id)) {
                const value = Object(utils["l"])(mostRecentlyInspectedElement, path);
                const key = `$reactTemp${count}`;
                window[key] = value;
                console.log(key);
                console.log(value);
              }
            }
            function copyElementPath(id, path) {
              if (isMostRecentlyInspectedElement(id)) {
                Object(backend_utils["b"])(Object(utils["l"])(mostRecentlyInspectedElement, path));
              }
            }
            function inspectElement(requestID, id, path, forceFullData) {
              if (path !== null) {
                mergeInspectedPaths(path);
              }
              if (isMostRecentlyInspectedElement(id) && !forceFullData) {
                if (!hasElementUpdatedSinceLastInspected) {
                  if (path !== null) {
                    let secondaryCategory = null;
                    if (path[0] === "hooks") {
                      secondaryCategory = "hooks";
                    }
                    return {
                      id,
                      responseID: requestID,
                      type: "hydrated-path",
                      path,
                      value: Object(backend_utils["a"])(Object(utils["l"])(mostRecentlyInspectedElement, path), createIsPathAllowed(null, secondaryCategory), path)
                    };
                  } else {
                    return {
                      id,
                      responseID: requestID,
                      type: "no-change"
                    };
                  }
                }
              } else {
                currentlyInspectedPaths = {};
              }
              hasElementUpdatedSinceLastInspected = false;
              try {
                mostRecentlyInspectedElement = inspectElementRaw(id);
              } catch (error) {
                console.error("Error inspecting element.\n\n", error);
                return {
                  type: "error",
                  id,
                  responseID: requestID,
                  message: error.message,
                  stack: error.stack
                };
              }
              if (mostRecentlyInspectedElement === null) {
                return {
                  id,
                  responseID: requestID,
                  type: "not-found"
                };
              }
              updateSelectedElement(mostRecentlyInspectedElement);
              const cleanedInspectedElement = __spreadValues({}, mostRecentlyInspectedElement);
              cleanedInspectedElement.context = Object(backend_utils["a"])(cleanedInspectedElement.context, createIsPathAllowed("context", null));
              cleanedInspectedElement.hooks = Object(backend_utils["a"])(cleanedInspectedElement.hooks, createIsPathAllowed("hooks", "hooks"));
              cleanedInspectedElement.props = Object(backend_utils["a"])(cleanedInspectedElement.props, createIsPathAllowed("props", null));
              cleanedInspectedElement.state = Object(backend_utils["a"])(cleanedInspectedElement.state, createIsPathAllowed("state", null));
              return {
                id,
                responseID: requestID,
                type: "full-data",
                value: cleanedInspectedElement
              };
            }
            function logElementToConsole(id) {
              const result = isMostRecentlyInspectedElementCurrent(id) ? mostRecentlyInspectedElement : inspectElementRaw(id);
              if (result === null) {
                console.warn(`Could not find Fiber with id "${id}"`);
                return;
              }
              const supportsGroup = typeof console.groupCollapsed === "function";
              if (supportsGroup) {
                console.groupCollapsed(`[Click to expand] %c<${result.displayName || "Component"} />`, "color: var(--dom-tag-name-color); font-weight: normal;");
              }
              if (result.props !== null) {
                console.log("Props:", result.props);
              }
              if (result.state !== null) {
                console.log("State:", result.state);
              }
              if (result.hooks !== null) {
                console.log("Hooks:", result.hooks);
              }
              const nativeNodes = findNativeNodesForFiberID(id);
              if (nativeNodes !== null) {
                console.log("Nodes:", nativeNodes);
              }
              if (result.source !== null) {
                console.log("Location:", result.source);
              }
              if (window.chrome || /firefox/i.test(navigator.userAgent)) {
                console.log("Right-click any value to save it as a global variable for further inspection.");
              }
              if (supportsGroup) {
                console.groupEnd();
              }
            }
            function deletePath(type, id, hookID, path) {
              const fiber = findCurrentFiberUsingSlowPathById(id);
              if (fiber !== null) {
                const instance = fiber.stateNode;
                switch (type) {
                  case "context":
                    path = path.slice(1);
                    switch (fiber.tag) {
                      case ClassComponent:
                        if (path.length === 0) {
                        } else {
                          Object(utils["a"])(instance.context, path);
                        }
                        instance.forceUpdate();
                        break;
                      case FunctionComponent:
                        break;
                    }
                    break;
                  case "hooks":
                    if (typeof overrideHookStateDeletePath === "function") {
                      overrideHookStateDeletePath(fiber, hookID, path);
                    }
                    break;
                  case "props":
                    if (instance === null) {
                      if (typeof overridePropsDeletePath === "function") {
                        overridePropsDeletePath(fiber, path);
                      }
                    } else {
                      fiber.pendingProps = Object(backend_utils["c"])(instance.props, path);
                      instance.forceUpdate();
                    }
                    break;
                  case "state":
                    Object(utils["a"])(instance.state, path);
                    instance.forceUpdate();
                    break;
                }
              }
            }
            function renamePath(type, id, hookID, oldPath, newPath) {
              const fiber = findCurrentFiberUsingSlowPathById(id);
              if (fiber !== null) {
                const instance = fiber.stateNode;
                switch (type) {
                  case "context":
                    oldPath = oldPath.slice(1);
                    newPath = newPath.slice(1);
                    switch (fiber.tag) {
                      case ClassComponent:
                        if (oldPath.length === 0) {
                        } else {
                          Object(utils["r"])(instance.context, oldPath, newPath);
                        }
                        instance.forceUpdate();
                        break;
                      case FunctionComponent:
                        break;
                    }
                    break;
                  case "hooks":
                    if (typeof overrideHookStateRenamePath === "function") {
                      overrideHookStateRenamePath(fiber, hookID, oldPath, newPath);
                    }
                    break;
                  case "props":
                    if (instance === null) {
                      if (typeof overridePropsRenamePath === "function") {
                        overridePropsRenamePath(fiber, oldPath, newPath);
                      }
                    } else {
                      fiber.pendingProps = Object(backend_utils["d"])(instance.props, oldPath, newPath);
                      instance.forceUpdate();
                    }
                    break;
                  case "state":
                    Object(utils["r"])(instance.state, oldPath, newPath);
                    instance.forceUpdate();
                    break;
                }
              }
            }
            function overrideValueAtPath(type, id, hookID, path, value) {
              const fiber = findCurrentFiberUsingSlowPathById(id);
              if (fiber !== null) {
                const instance = fiber.stateNode;
                switch (type) {
                  case "context":
                    path = path.slice(1);
                    switch (fiber.tag) {
                      case ClassComponent:
                        if (path.length === 0) {
                          instance.context = value;
                        } else {
                          Object(utils["u"])(instance.context, path, value);
                        }
                        instance.forceUpdate();
                        break;
                      case FunctionComponent:
                        break;
                    }
                    break;
                  case "hooks":
                    if (typeof overrideHookState === "function") {
                      overrideHookState(fiber, hookID, path, value);
                    }
                    break;
                  case "props":
                    switch (fiber.tag) {
                      case ClassComponent:
                        fiber.pendingProps = Object(backend_utils["e"])(instance.props, path, value);
                        instance.forceUpdate();
                        break;
                      default:
                        if (typeof overrideProps === "function") {
                          overrideProps(fiber, path, value);
                        }
                        break;
                    }
                    break;
                  case "state":
                    switch (fiber.tag) {
                      case ClassComponent:
                        Object(utils["u"])(instance.state, path, value);
                        instance.forceUpdate();
                        break;
                    }
                    break;
                }
              }
            }
            let currentCommitProfilingMetadata = null;
            let displayNamesByRootID = null;
            let idToContextsMap = null;
            let initialTreeBaseDurationsMap = null;
            let initialIDToRootMap = null;
            let isProfiling = false;
            let profilingStartTime = 0;
            let recordChangeDescriptions = false;
            let rootToCommitProfilingMetadataMap = null;
            function getProfilingData() {
              const dataForRoots = [];
              if (rootToCommitProfilingMetadataMap === null) {
                throw Error("getProfilingData() called before any profiling data was recorded");
              }
              rootToCommitProfilingMetadataMap.forEach((commitProfilingMetadata, rootID) => {
                const commitData = [];
                const initialTreeBaseDurations = [];
                const displayName = displayNamesByRootID !== null && displayNamesByRootID.get(rootID) || "Unknown";
                if (initialTreeBaseDurationsMap != null) {
                  initialTreeBaseDurationsMap.forEach((treeBaseDuration, id) => {
                    if (initialIDToRootMap != null && initialIDToRootMap.get(id) === rootID) {
                      initialTreeBaseDurations.push([id, treeBaseDuration]);
                    }
                  });
                }
                commitProfilingMetadata.forEach((commitProfilingData, commitIndex) => {
                  const {
                    changeDescriptions,
                    durations,
                    effectDuration,
                    maxActualDuration,
                    passiveEffectDuration,
                    priorityLevel,
                    commitTime,
                    updaters
                  } = commitProfilingData;
                  const fiberActualDurations = [];
                  const fiberSelfDurations = [];
                  for (let i = 0; i < durations.length; i += 3) {
                    const fiberID = durations[i];
                    fiberActualDurations.push([fiberID, durations[i + 1]]);
                    fiberSelfDurations.push([fiberID, durations[i + 2]]);
                  }
                  commitData.push({
                    changeDescriptions: changeDescriptions !== null ? Array.from(changeDescriptions.entries()) : null,
                    duration: maxActualDuration,
                    effectDuration,
                    fiberActualDurations,
                    fiberSelfDurations,
                    passiveEffectDuration,
                    priorityLevel,
                    timestamp: commitTime,
                    updaters
                  });
                });
                dataForRoots.push({
                  commitData,
                  displayName,
                  initialTreeBaseDurations,
                  rootID
                });
              });
              return {
                dataForRoots,
                rendererID
              };
            }
            function startProfiling(shouldRecordChangeDescriptions) {
              if (isProfiling) {
                return;
              }
              recordChangeDescriptions = shouldRecordChangeDescriptions;
              displayNamesByRootID = /* @__PURE__ */ new Map();
              initialTreeBaseDurationsMap = new Map(idToTreeBaseDurationMap);
              initialIDToRootMap = new Map(idToRootMap);
              idToContextsMap = /* @__PURE__ */ new Map();
              hook.getFiberRoots(rendererID).forEach((root) => {
                const rootID = getFiberIDThrows(root.current);
                displayNamesByRootID.set(rootID, getDisplayNameForRoot(root.current));
                if (shouldRecordChangeDescriptions) {
                  crawlToInitializeContextsMap(root.current);
                }
              });
              isProfiling = true;
              profilingStartTime = getCurrentTime();
              rootToCommitProfilingMetadataMap = /* @__PURE__ */ new Map();
            }
            function stopProfiling() {
              isProfiling = false;
              recordChangeDescriptions = false;
            }
            if (Object(storage["c"])(constants["t"]) === "true") {
              startProfiling(Object(storage["c"])(constants["s"]) === "true");
            }
            function shouldErrorFiberAlwaysNull() {
              return null;
            }
            const forceErrorForFiberIDs = /* @__PURE__ */ new Map();
            function shouldErrorFiberAccordingToMap(fiber) {
              if (typeof setErrorHandler !== "function") {
                throw new Error("Expected overrideError() to not get called for earlier React versions.");
              }
              const id = getFiberIDUnsafe(fiber);
              if (id === null) {
                return null;
              }
              let status = null;
              if (forceErrorForFiberIDs.has(id)) {
                status = forceErrorForFiberIDs.get(id);
                if (status === false) {
                  forceErrorForFiberIDs.delete(id);
                  if (forceErrorForFiberIDs.size === 0) {
                    setErrorHandler(shouldErrorFiberAlwaysNull);
                  }
                }
              }
              return status;
            }
            function overrideError(id, forceError) {
              if (typeof setErrorHandler !== "function" || typeof scheduleUpdate !== "function") {
                throw new Error("Expected overrideError() to not get called for earlier React versions.");
              }
              forceErrorForFiberIDs.set(id, forceError);
              if (forceErrorForFiberIDs.size === 1) {
                setErrorHandler(shouldErrorFiberAccordingToMap);
              }
              const fiber = idToArbitraryFiberMap.get(id);
              if (fiber != null) {
                scheduleUpdate(fiber);
              }
            }
            function shouldSuspendFiberAlwaysFalse() {
              return false;
            }
            const forceFallbackForSuspenseIDs = /* @__PURE__ */ new Set();
            function shouldSuspendFiberAccordingToSet(fiber) {
              const maybeID = getFiberIDUnsafe(fiber);
              return maybeID !== null && forceFallbackForSuspenseIDs.has(maybeID);
            }
            function overrideSuspense(id, forceFallback) {
              if (typeof setSuspenseHandler !== "function" || typeof scheduleUpdate !== "function") {
                throw new Error("Expected overrideSuspense() to not get called for earlier React versions.");
              }
              if (forceFallback) {
                forceFallbackForSuspenseIDs.add(id);
                if (forceFallbackForSuspenseIDs.size === 1) {
                  setSuspenseHandler(shouldSuspendFiberAccordingToSet);
                }
              } else {
                forceFallbackForSuspenseIDs.delete(id);
                if (forceFallbackForSuspenseIDs.size === 0) {
                  setSuspenseHandler(shouldSuspendFiberAlwaysFalse);
                }
              }
              const fiber = idToArbitraryFiberMap.get(id);
              if (fiber != null) {
                scheduleUpdate(fiber);
              }
            }
            let trackedPath = null;
            let trackedPathMatchFiber = null;
            let trackedPathMatchDepth = -1;
            let mightBeOnTrackedPath = false;
            function setTrackedPath(path) {
              if (path === null) {
                trackedPathMatchFiber = null;
                trackedPathMatchDepth = -1;
                mightBeOnTrackedPath = false;
              }
              trackedPath = path;
            }
            function updateTrackedPathStateBeforeMount(fiber) {
              if (trackedPath === null || !mightBeOnTrackedPath) {
                return false;
              }
              const returnFiber = fiber.return;
              const returnAlternate = returnFiber !== null ? returnFiber.alternate : null;
              if (trackedPathMatchFiber === returnFiber || trackedPathMatchFiber === returnAlternate && returnAlternate !== null) {
                const actualFrame = getPathFrame(fiber);
                const expectedFrame = trackedPath[trackedPathMatchDepth + 1];
                if (expectedFrame === void 0) {
                  throw new Error("Expected to see a frame at the next depth.");
                }
                if (actualFrame.index === expectedFrame.index && actualFrame.key === expectedFrame.key && actualFrame.displayName === expectedFrame.displayName) {
                  trackedPathMatchFiber = fiber;
                  trackedPathMatchDepth++;
                  if (trackedPathMatchDepth === trackedPath.length - 1) {
                    mightBeOnTrackedPath = false;
                  } else {
                    mightBeOnTrackedPath = true;
                  }
                  return false;
                }
              }
              mightBeOnTrackedPath = false;
              return true;
            }
            function updateTrackedPathStateAfterMount(mightSiblingsBeOnTrackedPath) {
              mightBeOnTrackedPath = mightSiblingsBeOnTrackedPath;
            }
            const rootPseudoKeys = /* @__PURE__ */ new Map();
            const rootDisplayNameCounter = /* @__PURE__ */ new Map();
            function setRootPseudoKey(id, fiber) {
              const name = getDisplayNameForRoot(fiber);
              const counter = rootDisplayNameCounter.get(name) || 0;
              rootDisplayNameCounter.set(name, counter + 1);
              const pseudoKey = `${name}:${counter}`;
              rootPseudoKeys.set(id, pseudoKey);
            }
            function removeRootPseudoKey(id) {
              const pseudoKey = rootPseudoKeys.get(id);
              if (pseudoKey === void 0) {
                throw new Error("Expected root pseudo key to be known.");
              }
              const name = pseudoKey.substring(0, pseudoKey.lastIndexOf(":"));
              const counter = rootDisplayNameCounter.get(name);
              if (counter === void 0) {
                throw new Error("Expected counter to be known.");
              }
              if (counter > 1) {
                rootDisplayNameCounter.set(name, counter - 1);
              } else {
                rootDisplayNameCounter.delete(name);
              }
              rootPseudoKeys.delete(id);
            }
            function getDisplayNameForRoot(fiber) {
              let preferredDisplayName = null;
              let fallbackDisplayName = null;
              let child = fiber.child;
              for (let i = 0; i < 3; i++) {
                if (child === null) {
                  break;
                }
                const displayName = getDisplayNameForFiber(child);
                if (displayName !== null) {
                  if (typeof child.type === "function") {
                    preferredDisplayName = displayName;
                  } else if (fallbackDisplayName === null) {
                    fallbackDisplayName = displayName;
                  }
                }
                if (preferredDisplayName !== null) {
                  break;
                }
                child = child.child;
              }
              return preferredDisplayName || fallbackDisplayName || "Anonymous";
            }
            function getPathFrame(fiber) {
              const {
                key
              } = fiber;
              let displayName = getDisplayNameForFiber(fiber);
              const index = fiber.index;
              switch (fiber.tag) {
                case HostRoot:
                  const id = getFiberIDThrows(fiber);
                  const pseudoKey = rootPseudoKeys.get(id);
                  if (pseudoKey === void 0) {
                    throw new Error("Expected mounted root to have known pseudo key.");
                  }
                  displayName = pseudoKey;
                  break;
                case HostComponent:
                  displayName = fiber.type;
                  break;
                default:
                  break;
              }
              return {
                displayName,
                key,
                index
              };
            }
            function getPathForElement(id) {
              let fiber = idToArbitraryFiberMap.get(id);
              if (fiber == null) {
                return null;
              }
              const keyPath = [];
              while (fiber !== null) {
                keyPath.push(getPathFrame(fiber));
                fiber = fiber.return;
              }
              keyPath.reverse();
              return keyPath;
            }
            function getBestMatchForTrackedPath() {
              if (trackedPath === null) {
                return null;
              }
              if (trackedPathMatchFiber === null) {
                return null;
              }
              let fiber = trackedPathMatchFiber;
              while (fiber !== null && shouldFilterFiber(fiber)) {
                fiber = fiber.return;
              }
              if (fiber === null) {
                return null;
              }
              return {
                id: getFiberIDThrows(fiber),
                isFullMatch: trackedPathMatchDepth === trackedPath.length - 1
              };
            }
            const formatPriorityLevel = (priorityLevel) => {
              if (priorityLevel == null) {
                return "Unknown";
              }
              switch (priorityLevel) {
                case ImmediatePriority:
                  return "Immediate";
                case UserBlockingPriority:
                  return "User-Blocking";
                case NormalPriority:
                  return "Normal";
                case LowPriority:
                  return "Low";
                case IdlePriority:
                  return "Idle";
                case NoPriority:
                default:
                  return "Unknown";
              }
            };
            function setTraceUpdatesEnabled(isEnabled) {
              traceUpdatesEnabled = isEnabled;
            }
            return {
              cleanup,
              clearErrorsAndWarnings,
              clearErrorsForFiberID,
              clearWarningsForFiberID,
              copyElementPath,
              deletePath,
              findNativeNodesForFiberID,
              flushInitialOperations,
              getBestMatchForTrackedPath,
              getDisplayNameForFiberID,
              getFiberIDForNative,
              getInstanceAndStyle,
              getOwnersList,
              getPathForElement,
              getProfilingData,
              handleCommitFiberRoot,
              handleCommitFiberUnmount,
              handlePostCommitFiberRoot,
              inspectElement,
              logElementToConsole,
              patchConsoleForStrictMode: backend_console["b"],
              prepareViewAttributeSource,
              prepareViewElementSource,
              overrideError,
              overrideSuspense,
              overrideValueAtPath,
              renamePath,
              renderer,
              setTraceUpdatesEnabled,
              setTrackedPath,
              startProfiling,
              stopProfiling,
              storeAsGlobal,
              unpatchConsoleForStrictMode: backend_console["d"],
              updateComponentFilters
            };
          }
        },
        76: function(module2, exports2, __webpack_require__) {
          (function(global) {
            var scope = typeof global !== "undefined" && global || typeof self !== "undefined" && self || window;
            var apply = Function.prototype.apply;
            exports2.setTimeout = function() {
              return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
            };
            exports2.setInterval = function() {
              return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
            };
            exports2.clearTimeout = exports2.clearInterval = function(timeout) {
              if (timeout) {
                timeout.close();
              }
            };
            function Timeout(id, clearFn) {
              this._id = id;
              this._clearFn = clearFn;
            }
            Timeout.prototype.unref = Timeout.prototype.ref = function() {
            };
            Timeout.prototype.close = function() {
              this._clearFn.call(scope, this._id);
            };
            exports2.enroll = function(item, msecs) {
              clearTimeout(item._idleTimeoutId);
              item._idleTimeout = msecs;
            };
            exports2.unenroll = function(item) {
              clearTimeout(item._idleTimeoutId);
              item._idleTimeout = -1;
            };
            exports2._unrefActive = exports2.active = function(item) {
              clearTimeout(item._idleTimeoutId);
              var msecs = item._idleTimeout;
              if (msecs >= 0) {
                item._idleTimeoutId = setTimeout(function onTimeout() {
                  if (item._onTimeout)
                    item._onTimeout();
                }, msecs);
              }
            };
            __webpack_require__(77);
            exports2.setImmediate = typeof self !== "undefined" && self.setImmediate || typeof global !== "undefined" && global.setImmediate || this && this.setImmediate;
            exports2.clearImmediate = typeof self !== "undefined" && self.clearImmediate || typeof global !== "undefined" && global.clearImmediate || this && this.clearImmediate;
          }).call(this, __webpack_require__(36));
        },
        77: function(module2, exports2, __webpack_require__) {
          (function(global, process2) {
            (function(global2, undefined2) {
              "use strict";
              if (global2.setImmediate) {
                return;
              }
              var nextHandle = 1;
              var tasksByHandle = {};
              var currentlyRunningATask = false;
              var doc = global2.document;
              var registerImmediate;
              function setImmediate(callback) {
                if (typeof callback !== "function") {
                  callback = new Function("" + callback);
                }
                var args = new Array(arguments.length - 1);
                for (var i = 0; i < args.length; i++) {
                  args[i] = arguments[i + 1];
                }
                var task = {
                  callback,
                  args
                };
                tasksByHandle[nextHandle] = task;
                registerImmediate(nextHandle);
                return nextHandle++;
              }
              function clearImmediate(handle) {
                delete tasksByHandle[handle];
              }
              function run(task) {
                var callback = task.callback;
                var args = task.args;
                switch (args.length) {
                  case 0:
                    callback();
                    break;
                  case 1:
                    callback(args[0]);
                    break;
                  case 2:
                    callback(args[0], args[1]);
                    break;
                  case 3:
                    callback(args[0], args[1], args[2]);
                    break;
                  default:
                    callback.apply(undefined2, args);
                    break;
                }
              }
              function runIfPresent(handle) {
                if (currentlyRunningATask) {
                  setTimeout(runIfPresent, 0, handle);
                } else {
                  var task = tasksByHandle[handle];
                  if (task) {
                    currentlyRunningATask = true;
                    try {
                      run(task);
                    } finally {
                      clearImmediate(handle);
                      currentlyRunningATask = false;
                    }
                  }
                }
              }
              function installNextTickImplementation() {
                registerImmediate = function(handle) {
                  process2.nextTick(function() {
                    runIfPresent(handle);
                  });
                };
              }
              function canUsePostMessage() {
                if (global2.postMessage && !global2.importScripts) {
                  var postMessageIsAsynchronous = true;
                  var oldOnMessage = global2.onmessage;
                  global2.onmessage = function() {
                    postMessageIsAsynchronous = false;
                  };
                  global2.postMessage("", "*");
                  global2.onmessage = oldOnMessage;
                  return postMessageIsAsynchronous;
                }
              }
              function installPostMessageImplementation() {
                var messagePrefix = "setImmediate$" + Math.random() + "$";
                var onGlobalMessage = function(event) {
                  if (event.source === global2 && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
                    runIfPresent(+event.data.slice(messagePrefix.length));
                  }
                };
                if (global2.addEventListener) {
                  global2.addEventListener("message", onGlobalMessage, false);
                } else {
                  global2.attachEvent("onmessage", onGlobalMessage);
                }
                registerImmediate = function(handle) {
                  global2.postMessage(messagePrefix + handle, "*");
                };
              }
              function installMessageChannelImplementation() {
                var channel = new MessageChannel();
                channel.port1.onmessage = function(event) {
                  var handle = event.data;
                  runIfPresent(handle);
                };
                registerImmediate = function(handle) {
                  channel.port2.postMessage(handle);
                };
              }
              function installReadyStateChangeImplementation() {
                var html = doc.documentElement;
                registerImmediate = function(handle) {
                  var script = doc.createElement("script");
                  script.onreadystatechange = function() {
                    runIfPresent(handle);
                    script.onreadystatechange = null;
                    html.removeChild(script);
                    script = null;
                  };
                  html.appendChild(script);
                };
              }
              function installSetTimeoutImplementation() {
                registerImmediate = function(handle) {
                  setTimeout(runIfPresent, 0, handle);
                };
              }
              var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global2);
              attachTo = attachTo && attachTo.setTimeout ? attachTo : global2;
              if ({}.toString.call(global2.process) === "[object process]") {
                installNextTickImplementation();
              } else if (canUsePostMessage()) {
                installPostMessageImplementation();
              } else if (global2.MessageChannel) {
                installMessageChannelImplementation();
              } else if (doc && "onreadystatechange" in doc.createElement("script")) {
                installReadyStateChangeImplementation();
              } else {
                installSetTimeoutImplementation();
              }
              attachTo.setImmediate = setImmediate;
              attachTo.clearImmediate = clearImmediate;
            })(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self);
          }).call(this, __webpack_require__(36), __webpack_require__(59));
        },
        78: function(module2, exports2, __webpack_require__) {
          "use strict";
          module2.exports = Yallist;
          Yallist.Node = Node2;
          Yallist.create = Yallist;
          function Yallist(list) {
            var self2 = this;
            if (!(self2 instanceof Yallist)) {
              self2 = new Yallist();
            }
            self2.tail = null;
            self2.head = null;
            self2.length = 0;
            if (list && typeof list.forEach === "function") {
              list.forEach(function(item) {
                self2.push(item);
              });
            } else if (arguments.length > 0) {
              for (var i = 0, l = arguments.length; i < l; i++) {
                self2.push(arguments[i]);
              }
            }
            return self2;
          }
          Yallist.prototype.removeNode = function(node) {
            if (node.list !== this) {
              throw new Error("removing node which does not belong to this list");
            }
            var next = node.next;
            var prev = node.prev;
            if (next) {
              next.prev = prev;
            }
            if (prev) {
              prev.next = next;
            }
            if (node === this.head) {
              this.head = next;
            }
            if (node === this.tail) {
              this.tail = prev;
            }
            node.list.length--;
            node.next = null;
            node.prev = null;
            node.list = null;
            return next;
          };
          Yallist.prototype.unshiftNode = function(node) {
            if (node === this.head) {
              return;
            }
            if (node.list) {
              node.list.removeNode(node);
            }
            var head = this.head;
            node.list = this;
            node.next = head;
            if (head) {
              head.prev = node;
            }
            this.head = node;
            if (!this.tail) {
              this.tail = node;
            }
            this.length++;
          };
          Yallist.prototype.pushNode = function(node) {
            if (node === this.tail) {
              return;
            }
            if (node.list) {
              node.list.removeNode(node);
            }
            var tail = this.tail;
            node.list = this;
            node.prev = tail;
            if (tail) {
              tail.next = node;
            }
            this.tail = node;
            if (!this.head) {
              this.head = node;
            }
            this.length++;
          };
          Yallist.prototype.push = function() {
            for (var i = 0, l = arguments.length; i < l; i++) {
              push(this, arguments[i]);
            }
            return this.length;
          };
          Yallist.prototype.unshift = function() {
            for (var i = 0, l = arguments.length; i < l; i++) {
              unshift(this, arguments[i]);
            }
            return this.length;
          };
          Yallist.prototype.pop = function() {
            if (!this.tail) {
              return void 0;
            }
            var res = this.tail.value;
            this.tail = this.tail.prev;
            if (this.tail) {
              this.tail.next = null;
            } else {
              this.head = null;
            }
            this.length--;
            return res;
          };
          Yallist.prototype.shift = function() {
            if (!this.head) {
              return void 0;
            }
            var res = this.head.value;
            this.head = this.head.next;
            if (this.head) {
              this.head.prev = null;
            } else {
              this.tail = null;
            }
            this.length--;
            return res;
          };
          Yallist.prototype.forEach = function(fn, thisp) {
            thisp = thisp || this;
            for (var walker = this.head, i = 0; walker !== null; i++) {
              fn.call(thisp, walker.value, i, this);
              walker = walker.next;
            }
          };
          Yallist.prototype.forEachReverse = function(fn, thisp) {
            thisp = thisp || this;
            for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
              fn.call(thisp, walker.value, i, this);
              walker = walker.prev;
            }
          };
          Yallist.prototype.get = function(n) {
            for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
              walker = walker.next;
            }
            if (i === n && walker !== null) {
              return walker.value;
            }
          };
          Yallist.prototype.getReverse = function(n) {
            for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
              walker = walker.prev;
            }
            if (i === n && walker !== null) {
              return walker.value;
            }
          };
          Yallist.prototype.map = function(fn, thisp) {
            thisp = thisp || this;
            var res = new Yallist();
            for (var walker = this.head; walker !== null; ) {
              res.push(fn.call(thisp, walker.value, this));
              walker = walker.next;
            }
            return res;
          };
          Yallist.prototype.mapReverse = function(fn, thisp) {
            thisp = thisp || this;
            var res = new Yallist();
            for (var walker = this.tail; walker !== null; ) {
              res.push(fn.call(thisp, walker.value, this));
              walker = walker.prev;
            }
            return res;
          };
          Yallist.prototype.reduce = function(fn, initial) {
            var acc;
            var walker = this.head;
            if (arguments.length > 1) {
              acc = initial;
            } else if (this.head) {
              walker = this.head.next;
              acc = this.head.value;
            } else {
              throw new TypeError("Reduce of empty list with no initial value");
            }
            for (var i = 0; walker !== null; i++) {
              acc = fn(acc, walker.value, i);
              walker = walker.next;
            }
            return acc;
          };
          Yallist.prototype.reduceReverse = function(fn, initial) {
            var acc;
            var walker = this.tail;
            if (arguments.length > 1) {
              acc = initial;
            } else if (this.tail) {
              walker = this.tail.prev;
              acc = this.tail.value;
            } else {
              throw new TypeError("Reduce of empty list with no initial value");
            }
            for (var i = this.length - 1; walker !== null; i--) {
              acc = fn(acc, walker.value, i);
              walker = walker.prev;
            }
            return acc;
          };
          Yallist.prototype.toArray = function() {
            var arr = new Array(this.length);
            for (var i = 0, walker = this.head; walker !== null; i++) {
              arr[i] = walker.value;
              walker = walker.next;
            }
            return arr;
          };
          Yallist.prototype.toArrayReverse = function() {
            var arr = new Array(this.length);
            for (var i = 0, walker = this.tail; walker !== null; i++) {
              arr[i] = walker.value;
              walker = walker.prev;
            }
            return arr;
          };
          Yallist.prototype.slice = function(from, to) {
            to = to || this.length;
            if (to < 0) {
              to += this.length;
            }
            from = from || 0;
            if (from < 0) {
              from += this.length;
            }
            var ret = new Yallist();
            if (to < from || to < 0) {
              return ret;
            }
            if (from < 0) {
              from = 0;
            }
            if (to > this.length) {
              to = this.length;
            }
            for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
              walker = walker.next;
            }
            for (; walker !== null && i < to; i++, walker = walker.next) {
              ret.push(walker.value);
            }
            return ret;
          };
          Yallist.prototype.sliceReverse = function(from, to) {
            to = to || this.length;
            if (to < 0) {
              to += this.length;
            }
            from = from || 0;
            if (from < 0) {
              from += this.length;
            }
            var ret = new Yallist();
            if (to < from || to < 0) {
              return ret;
            }
            if (from < 0) {
              from = 0;
            }
            if (to > this.length) {
              to = this.length;
            }
            for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
              walker = walker.prev;
            }
            for (; walker !== null && i > from; i--, walker = walker.prev) {
              ret.push(walker.value);
            }
            return ret;
          };
          Yallist.prototype.splice = function(start, deleteCount) {
            if (start > this.length) {
              start = this.length - 1;
            }
            if (start < 0) {
              start = this.length + start;
            }
            for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
              walker = walker.next;
            }
            var ret = [];
            for (var i = 0; walker && i < deleteCount; i++) {
              ret.push(walker.value);
              walker = this.removeNode(walker);
            }
            if (walker === null) {
              walker = this.tail;
            }
            if (walker !== this.head && walker !== this.tail) {
              walker = walker.prev;
            }
            for (var i = 2; i < arguments.length; i++) {
              walker = insert(this, walker, arguments[i]);
            }
            return ret;
          };
          Yallist.prototype.reverse = function() {
            var head = this.head;
            var tail = this.tail;
            for (var walker = head; walker !== null; walker = walker.prev) {
              var p = walker.prev;
              walker.prev = walker.next;
              walker.next = p;
            }
            this.head = tail;
            this.tail = head;
            return this;
          };
          function insert(self2, node, value) {
            var inserted = node === self2.head ? new Node2(value, null, node, self2) : new Node2(value, node, node.next, self2);
            if (inserted.next === null) {
              self2.tail = inserted;
            }
            if (inserted.prev === null) {
              self2.head = inserted;
            }
            self2.length++;
            return inserted;
          }
          function push(self2, item) {
            self2.tail = new Node2(item, self2.tail, null, self2);
            if (!self2.head) {
              self2.head = self2.tail;
            }
            self2.length++;
          }
          function unshift(self2, item) {
            self2.head = new Node2(item, null, self2.head, self2);
            if (!self2.tail) {
              self2.tail = self2.head;
            }
            self2.length++;
          }
          function Node2(value, prev, next, list) {
            if (!(this instanceof Node2)) {
              return new Node2(value, prev, next, list);
            }
            this.list = list;
            this.value = value;
            if (prev) {
              prev.next = this;
              this.prev = prev;
            } else {
              this.prev = null;
            }
            if (next) {
              next.prev = this;
              this.next = next;
            } else {
              this.next = null;
            }
          }
          try {
            __webpack_require__(79)(Yallist);
          } catch (er) {
          }
        },
        79: function(module2, exports2, __webpack_require__) {
          "use strict";
          module2.exports = function(Yallist) {
            Yallist.prototype[Symbol.iterator] = function* () {
              for (let walker = this.head; walker; walker = walker.next) {
                yield walker.value;
              }
            };
          };
        },
        8: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return localStorageGetItem;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return localStorageSetItem;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return sessionStorageGetItem;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return sessionStorageRemoveItem;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return sessionStorageSetItem;
          });
          function localStorageGetItem(key) {
            try {
              return localStorage.getItem(key);
            } catch (error) {
              return null;
            }
          }
          function localStorageRemoveItem(key) {
            try {
              localStorage.removeItem(key);
            } catch (error) {
            }
          }
          function localStorageSetItem(key, value) {
            try {
              return localStorage.setItem(key, value);
            } catch (error) {
            }
          }
          function sessionStorageGetItem(key) {
            try {
              return sessionStorage.getItem(key);
            } catch (error) {
              return null;
            }
          }
          function sessionStorageRemoveItem(key) {
            try {
              sessionStorage.removeItem(key);
            } catch (error) {
            }
          }
          function sessionStorageSetItem(key, value) {
            try {
              return sessionStorage.setItem(key, value);
            } catch (error) {
            }
          }
        },
        80: function(module2, exports2, __webpack_require__) {
          var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
          (function(root, factory) {
            "use strict";
            if (true) {
              !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports2, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
            } else {
            }
          })(this, function() {
            "use strict";
            function _isNumber(n) {
              return !isNaN(parseFloat(n)) && isFinite(n);
            }
            function _capitalize(str) {
              return str.charAt(0).toUpperCase() + str.substring(1);
            }
            function _getter(p) {
              return function() {
                return this[p];
              };
            }
            var booleanProps = ["isConstructor", "isEval", "isNative", "isToplevel"];
            var numericProps = ["columnNumber", "lineNumber"];
            var stringProps = ["fileName", "functionName", "source"];
            var arrayProps = ["args"];
            var props = booleanProps.concat(numericProps, stringProps, arrayProps);
            function StackFrame(obj) {
              if (!obj)
                return;
              for (var i2 = 0; i2 < props.length; i2++) {
                if (obj[props[i2]] !== void 0) {
                  this["set" + _capitalize(props[i2])](obj[props[i2]]);
                }
              }
            }
            StackFrame.prototype = {
              getArgs: function() {
                return this.args;
              },
              setArgs: function(v) {
                if (Object.prototype.toString.call(v) !== "[object Array]") {
                  throw new TypeError("Args must be an Array");
                }
                this.args = v;
              },
              getEvalOrigin: function() {
                return this.evalOrigin;
              },
              setEvalOrigin: function(v) {
                if (v instanceof StackFrame) {
                  this.evalOrigin = v;
                } else if (v instanceof Object) {
                  this.evalOrigin = new StackFrame(v);
                } else {
                  throw new TypeError("Eval Origin must be an Object or StackFrame");
                }
              },
              toString: function() {
                var fileName = this.getFileName() || "";
                var lineNumber = this.getLineNumber() || "";
                var columnNumber = this.getColumnNumber() || "";
                var functionName = this.getFunctionName() || "";
                if (this.getIsEval()) {
                  if (fileName) {
                    return "[eval] (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
                  }
                  return "[eval]:" + lineNumber + ":" + columnNumber;
                }
                if (functionName) {
                  return functionName + " (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
                }
                return fileName + ":" + lineNumber + ":" + columnNumber;
              }
            };
            StackFrame.fromString = function StackFrame$$fromString(str) {
              var argsStartIndex = str.indexOf("(");
              var argsEndIndex = str.lastIndexOf(")");
              var functionName = str.substring(0, argsStartIndex);
              var args = str.substring(argsStartIndex + 1, argsEndIndex).split(",");
              var locationString = str.substring(argsEndIndex + 1);
              if (locationString.indexOf("@") === 0) {
                var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, "");
                var fileName = parts[1];
                var lineNumber = parts[2];
                var columnNumber = parts[3];
              }
              return new StackFrame({
                functionName,
                args: args || void 0,
                fileName,
                lineNumber: lineNumber || void 0,
                columnNumber: columnNumber || void 0
              });
            };
            for (var i = 0; i < booleanProps.length; i++) {
              StackFrame.prototype["get" + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
              StackFrame.prototype["set" + _capitalize(booleanProps[i])] = function(p) {
                return function(v) {
                  this[p] = Boolean(v);
                };
              }(booleanProps[i]);
            }
            for (var j = 0; j < numericProps.length; j++) {
              StackFrame.prototype["get" + _capitalize(numericProps[j])] = _getter(numericProps[j]);
              StackFrame.prototype["set" + _capitalize(numericProps[j])] = function(p) {
                return function(v) {
                  if (!_isNumber(v)) {
                    throw new TypeError(p + " must be a Number");
                  }
                  this[p] = Number(v);
                };
              }(numericProps[j]);
            }
            for (var k = 0; k < stringProps.length; k++) {
              StackFrame.prototype["get" + _capitalize(stringProps[k])] = _getter(stringProps[k]);
              StackFrame.prototype["set" + _capitalize(stringProps[k])] = function(p) {
                return function(v) {
                  this[p] = String(v);
                };
              }(stringProps[k]);
            }
            return StackFrame;
          });
        },
        9: function(module2, __webpack_exports__, __webpack_require__) {
          "use strict";
          __webpack_require__.d(__webpack_exports__, "a", function() {
            return CONCURRENT_MODE_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "b", function() {
            return CONCURRENT_MODE_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "c", function() {
            return CONTEXT_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "d", function() {
            return CONTEXT_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "e", function() {
            return DEPRECATED_ASYNC_MODE_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "f", function() {
            return FORWARD_REF_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "g", function() {
            return FORWARD_REF_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "h", function() {
            return LAZY_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "i", function() {
            return LAZY_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "j", function() {
            return MEMO_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "k", function() {
            return MEMO_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "l", function() {
            return PROFILER_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "m", function() {
            return PROFILER_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "n", function() {
            return PROVIDER_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "o", function() {
            return PROVIDER_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "p", function() {
            return SCOPE_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "q", function() {
            return SCOPE_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "r", function() {
            return STRICT_MODE_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "s", function() {
            return STRICT_MODE_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "v", function() {
            return SUSPENSE_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "w", function() {
            return SUSPENSE_SYMBOL_STRING;
          });
          __webpack_require__.d(__webpack_exports__, "t", function() {
            return SUSPENSE_LIST_NUMBER;
          });
          __webpack_require__.d(__webpack_exports__, "u", function() {
            return SUSPENSE_LIST_SYMBOL_STRING;
          });
          const CONCURRENT_MODE_NUMBER = 60111;
          const CONCURRENT_MODE_SYMBOL_STRING = "Symbol(react.concurrent_mode)";
          const CONTEXT_NUMBER = 60110;
          const CONTEXT_SYMBOL_STRING = "Symbol(react.context)";
          const DEPRECATED_ASYNC_MODE_SYMBOL_STRING = "Symbol(react.async_mode)";
          const ELEMENT_NUMBER = 60103;
          const ELEMENT_SYMBOL_STRING = "Symbol(react.element)";
          const DEBUG_TRACING_MODE_NUMBER = 60129;
          const DEBUG_TRACING_MODE_SYMBOL_STRING = "Symbol(react.debug_trace_mode)";
          const FORWARD_REF_NUMBER = 60112;
          const FORWARD_REF_SYMBOL_STRING = "Symbol(react.forward_ref)";
          const FRAGMENT_NUMBER = 60107;
          const FRAGMENT_SYMBOL_STRING = "Symbol(react.fragment)";
          const LAZY_NUMBER = 60116;
          const LAZY_SYMBOL_STRING = "Symbol(react.lazy)";
          const MEMO_NUMBER = 60115;
          const MEMO_SYMBOL_STRING = "Symbol(react.memo)";
          const PORTAL_NUMBER = 60106;
          const PORTAL_SYMBOL_STRING = "Symbol(react.portal)";
          const PROFILER_NUMBER = 60114;
          const PROFILER_SYMBOL_STRING = "Symbol(react.profiler)";
          const PROVIDER_NUMBER = 60109;
          const PROVIDER_SYMBOL_STRING = "Symbol(react.provider)";
          const SCOPE_NUMBER = 60119;
          const SCOPE_SYMBOL_STRING = "Symbol(react.scope)";
          const STRICT_MODE_NUMBER = 60108;
          const STRICT_MODE_SYMBOL_STRING = "Symbol(react.strict_mode)";
          const SUSPENSE_NUMBER = 60113;
          const SUSPENSE_SYMBOL_STRING = "Symbol(react.suspense)";
          const SUSPENSE_LIST_NUMBER = 60120;
          const SUSPENSE_LIST_SYMBOL_STRING = "Symbol(react.suspense_list)";
        }
      });
    }
  });

  // ../../node_modules/react-devtools-inline/backend.js
  var require_backend2 = __commonJS({
    "../../node_modules/react-devtools-inline/backend.js"(exports, module) {
      module.exports = require_backend();
    }
  });

  // editorRuntime/index.ts
  var import_backend = __toESM(require_backend2());

  // ../studio-core/dist/constants.js
  var DEFINITION_KEY = Symbol.for("studio.componentDefinition");
  var RUNTIME_PROP_NODE_ID = "__studioNodeId";
  var RUNTIME_PROP_STUDIO_SLOTS = "__studioSlots";
  var RUNTIME_PROP_STUDIO_SLOTS_TYPE = "__studioSlotsType";

  // src/utils/geometry.ts
  function getRelativeBoundingBox(containerElm, childElm) {
    const containerRect = containerElm.getBoundingClientRect();
    const childRect = childElm.getBoundingClientRect();
    return {
      x: childRect.x - containerRect.x,
      y: childRect.y - containerRect.y,
      width: childRect.width,
      height: childRect.height
    };
  }

  // editorRuntime/pageViewState.ts
  function getNodeViewState(fiber, viewElm, elm, nodeId) {
    var _a, _b;
    if (nodeId) {
      const rect = getRelativeBoundingBox(viewElm, elm);
      return {
        nodeId,
        rect,
        props: (_b = (_a = fiber.child) == null ? void 0 : _a.memoizedProps) != null ? _b : {},
        slots: {}
      };
    }
    return null;
  }
  function walkFibers(node, visitor) {
    visitor(node);
    if (node.child) {
      walkFibers(node.child, visitor);
    }
    if (node.sibling) {
      walkFibers(node.sibling, visitor);
    }
  }
  function getViewState(viewElm) {
    var _a;
    const devtoolsHook = (_a = viewElm.ownerDocument.defaultView) == null ? void 0 : _a.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!devtoolsHook) {
      console.warn(`Can't read page layout as react devtools are not installed`);
      return {};
    }
    const viewState = {};
    const rendererId = 1;
    const nodeElms = /* @__PURE__ */ new Map();
    Array.from(devtoolsHook.getFiberRoots(rendererId)).forEach((fiberRoot) => {
      if (fiberRoot.current) {
        walkFibers(fiberRoot.current, (fiber) => {
          var _a2, _b;
          if (!fiber.memoizedProps) {
            return;
          }
          const studioNodeId = fiber.memoizedProps[RUNTIME_PROP_NODE_ID];
          if (studioNodeId) {
            console.log(studioNodeId);
            const nodeId = studioNodeId;
            const elm = (_a2 = devtoolsHook.renderers.get(rendererId)) == null ? void 0 : _a2.findHostInstanceByFiber(fiber);
            if (elm) {
              nodeElms.set(nodeId, elm);
              const nodeViewState = getNodeViewState(fiber, viewElm, elm, nodeId);
              if (nodeViewState) {
                viewState[nodeId] = nodeViewState;
              }
            }
          }
          const studioSlotName = fiber.memoizedProps[RUNTIME_PROP_STUDIO_SLOTS];
          if (studioSlotName) {
            const slotType = fiber.memoizedProps[RUNTIME_PROP_STUDIO_SLOTS_TYPE];
            const parentId = fiber.memoizedProps.parentId;
            const nodeViewState = viewState[parentId];
            const firstChildElm = (_b = devtoolsHook.renderers.get(rendererId)) == null ? void 0 : _b.findHostInstanceByFiber(fiber);
            const childContainerElm = firstChildElm == null ? void 0 : firstChildElm.parentElement;
            if (childContainerElm && nodeViewState) {
              const rect = getRelativeBoundingBox(viewElm, childContainerElm);
              const direction = window.getComputedStyle(childContainerElm).flexDirection;
              nodeViewState.slots[studioSlotName] = {
                type: slotType,
                rect,
                direction
              };
            }
          }
        });
      }
    });
    return viewState;
  }

  // editorRuntime/PinholeOverlay.ts
  var PinholeOverlay = class {
    constructor(doc, container) {
      this.root = doc.createElement("div");
      this.root.style.pointerEvents = "none";
      this.root.style.position = "fixed";
      this.root.style.top = "0";
      this.root.style.left = "0";
      this.root.style.right = "0";
      this.root.style.bottom = "0";
      this.root.style.width = "100%";
      this.root.style.height = "100%";
      container.appendChild(this.root);
      this.left = this.createSegment(doc, this.root);
      this.topLeft = this.createSegment(doc, this.root);
      this.top = this.createSegment(doc, this.root);
      this.topRight = this.createSegment(doc, this.root);
      this.right = this.createSegment(doc, this.root);
      this.bottomRight = this.createSegment(doc, this.root);
      this.bottom = this.createSegment(doc, this.root);
      this.bottomLeft = this.createSegment(doc, this.root);
      this.rect = null;
    }
    createSegment(doc, container) {
      const segment = doc.createElement("div");
      container.appendChild(segment);
      segment.style.display = "none";
      segment.style.pointerEvents = "initial";
      segment.style.position = "absolute";
      segment.style.left = "0";
      segment.style.top = "0";
      segment.style.right = "0";
      segment.style.bottom = "0";
      segment.style.background = "#000";
      segment.style.opacity = "0.1";
      return segment;
    }
    updateVisibility(visible) {
      this.left.style.display = visible ? "block" : "none";
      this.topLeft.style.display = visible ? "block" : "none";
      this.top.style.display = visible ? "block" : "none";
      this.topRight.style.display = visible ? "block" : "none";
      this.right.style.display = visible ? "block" : "none";
      this.bottomRight.style.display = visible ? "block" : "none";
      this.bottom.style.display = visible ? "block" : "none";
      this.bottomLeft.style.display = visible ? "block" : "none";
    }
    update() {
      if (this.rect) {
        this.left.style.top = `${this.rect.y}px`;
        this.left.style.width = `${this.rect.x}px`;
        this.left.style.height = `${this.rect.height}px`;
        this.topLeft.style.width = `${this.rect.x}px`;
        this.topLeft.style.height = `${this.rect.y}px`;
        this.top.style.left = `${this.rect.x}px`;
        this.top.style.width = `${this.rect.width}px`;
        this.top.style.height = `${this.rect.y}px`;
        this.topRight.style.left = `${this.rect.x + this.rect.width}px`;
        this.topRight.style.height = `${this.rect.y}px`;
        this.right.style.top = `${this.rect.y}px`;
        this.right.style.left = `${this.rect.x + this.rect.width}px`;
        this.right.style.height = `${this.rect.height}px`;
        this.bottomRight.style.left = `${this.rect.x + this.rect.width}px`;
        this.bottomRight.style.top = `${this.rect.y + this.rect.height}px`;
        this.bottom.style.left = `${this.rect.x}px`;
        this.bottom.style.width = `${this.rect.width}px`;
        this.bottom.style.top = `${this.rect.y + this.rect.height}px`;
        this.bottomLeft.style.width = `${this.rect.x}px`;
        this.bottomLeft.style.top = `${this.rect.y + this.rect.height}px`;
        this.updateVisibility(true);
      } else {
        this.updateVisibility(false);
      }
    }
    setRect(rect) {
      this.rect = rect;
      this.update();
    }
  };

  // editorRuntime/studioBridge.ts
  function throttle(fn, time) {
    return fn;
  }
  var SelectionOverlay = class {
    constructor(doc, container) {
      this.pinhole = new PinholeOverlay(doc, container);
      this.rect = doc.createElement("div");
    }
    update() {
      this.pinhole.update();
    }
    setSelection(rect, text) {
      this.pinhole.setRect(rect);
    }
    removeSelection() {
      this.pinhole.setRect(null);
    }
  };
  var StudioBridgeImpl = class {
    constructor(doc, container, studioRoot2) {
      this.viewState = {};
      this.mutationObserver = new MutationObserver(() => this.updateThrottled());
      this.resizeObserver = new ResizeObserver(() => this.updateThrottled());
      this.updateThrottled = throttle(() => this.update(), 100);
      this.selectionOverlay = new SelectionOverlay(doc, container);
      this.studioRoot = studioRoot2;
      this.mutationObserver.observe(this.studioRoot, {
        attributes: true,
        childList: true,
        subtree: true
      });
      this.resizeObserver.observe(this.studioRoot);
      this.update();
    }
    setSelection(nodeId) {
      if (nodeId) {
        const nodeState = this.viewState[nodeId];
        if (nodeState) {
          this.selectionOverlay.setSelection(nodeState.rect, "test 123");
        }
      } else {
        this.selectionOverlay.removeSelection();
      }
    }
    update() {
      this.viewState = getViewState(this.studioRoot);
      this.selectionOverlay.update();
    }
    getViewState() {
      return this.viewState;
    }
  };
  function createStudioBridge(window2, studioRoot2) {
    return new StudioBridgeImpl(window2.document, window2.document.body, studioRoot2);
  }

  // editorRuntime/index.ts
  (0, import_backend.initialize)(window);
  var studioRoot = document.getElementById("root");
  if (studioRoot) {
    window.__STUDIO = createStudioBridge(window, studioRoot);
  } else {
    console.error(`Can't initialize studio bridge, missing app root`);
  }
})();
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/*! promise-polyfill 2.0.1 */
/** @license React v17.0.2
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/** @license React v17.0.2
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
