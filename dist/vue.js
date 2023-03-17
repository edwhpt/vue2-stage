(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  // 对模版进行编译处理
  function compileToFunction(template) {
    // 1.将template 转化成ast语法书

    // 2.生成render方法 （render方法执行后返回的结果就是 虚拟DOM）
    console.log(template);
  }

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

  // 重写数组中的部分方法

  var oldArrayProto = Array.prototype; // 获取数组的原型

  // newArrayProto.__proto__ = oldArrayProto
  var newArrayProto = Object.create(oldArrayProto);

  // 找到所有的变异方法（会改变原数组）
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    // 这里重写了数组的方法
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法，函数的劫持，切片编程

      // 需要对数据新增的数据再次进行劫持
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.slice(2);
      }
      // console.log('ob', this) // 新增的内容
      if (inserted) {
        // 对新增的内容再次进行观测
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // Object.defineProperty 只能劫持已存在的属性（vue里面会为此单独写一些api  $set $delete）
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false // 将__ob__变成不可枚举（循环的时候无法获取）
      });

      // console.log('Observer', data)
      // data.__ob__ = this // 给数组加了一个标识，如果数据上有__ob__则说明这个属性被观测过了
      if (Array.isArray(data)) {
        // 重写数组的方法

        data.__proto__ = newArrayProto; // 需要保留数组原有的特性，并且可以重写部分方法
        this.observeArray(data); //如果数组中的元素是对象，可以监控到对象的变化
      } else {
        this.walk(data);
      }
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
      // 观测数组
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
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
        console.log('get', key, value);
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

    // 这个对象已经被代理过
    if (data.__ob__ instanceof Observer) {
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
      if (options.el) {
        vm.$mount(options.el); // 实现数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      // 先进行查找有没有render函数
      if (!ops.render) {
        var template; // 没有render看一下是否写了template，没写template才有外部的template
        // 没写模版但是写了el
        if (!ops.template && el) {
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template;
          }
        }
        // 写了template，就有写了的template
        if (template) {
          // 这里需要对模版进行编译
          var render = compileToFunction(template);
          ops.render = render;
        }
        // console.log(template)
      }

      ops.render; // 最终就可以获取render方法
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
