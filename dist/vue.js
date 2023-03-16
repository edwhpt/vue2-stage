(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // Object.defineProperty 只能劫持已存在的属性（vue里面会为此单独写一些api  $set $delete）
      this.walk(data);
    }
    // 循环对象，对属性依次劫持
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // “重新定义”属性，性能差
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }]);
    return Observer;
  }(); // 属性劫持(闭包)
  function defineReactive(target, key, value) {
    observe(value); // 深度劫持，对所有对象都进行属性劫持
    Object.defineProperty(target, key, {
      // 取值的时候，会执行get
      get: function get() {
        return value;
      },
      // 修改的时候，会执行set
      set: function set(newValue) {
        if (newValue === value) return; // 如果修改的值和原来的值相同，直接返回
        observe(newValue); // 如果修改的值是一个对象，对这个对象进行劫持
        value = newValue;
      }
    });
  }

  // 观测（劫持）data对象
  function observe(data) {
    // 只对对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return;
    }

    // 如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以添加一个实例，用实例来判断是够被劫持过）
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; // 获取所有的选项
    if (opts.data) {
      initData(vm); // 初始化数据
    }
  }

  function proxy(vm, target, key) {
    // vm.name --> vm._data.name
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data; // data 可能是函数和对象
    data = typeof data === 'function' ? data.call(this) : data;
    vm._data = data; // 把数据添加到实例的_data上
    // 对数据进行劫持 vue2里采用了一个API：Object.defineProperty
    observe(data);

    // 将vm._data 用vm来代理
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  // 用来给Vue增加init方法
  function initMixin(Vue) {
    // 用于初始化操作
    Vue.prototype._init = function (options) {
      // vue vm.$options 就是获取用户的配置

      // 我们使用vue的时候，以$开头的（$nextTick, $data, $attr）是vue内置属性
      var vm = this;
      vm.$options = options; // 将用户的选项挂载到实例上

      // 初始化状态
      initState(vm);
    };
  }

  // options是用户的选项
  function Vue(options) {
    this._init(options); // 默认调用init
  }

  initMixin(Vue); // 扩展了init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
