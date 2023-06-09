(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
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
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配到的分组是一个 标签名 <div 匹配到的是开始标签的名字
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是 </xxx> 最终匹配到的分组是结束标签的名字
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性，第一个分组是属性的key，value可能是分组3/分组4/分组5
  var startTagClose = /^\s*(\/?)>/; // <div>  <br/>

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stark = []; // 用于存放元素
    var currentParent; // 指向栈中最后一个元素
    var root; // 根元素

    // 需要转化成一颗抽象语法树

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        parent: null,
        children: [],
        attrs: attrs
      };
    }
    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); // 创建一个ast节点
      // 看一下是否是空树
      if (!root) {
        root = node; // 如果为空树，则当前是树的根节点
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stark.push(node);
      currentParent = node; // currentParent为栈中最后一个
    }

    function chars(text) {
      // 文本直接放到当前指向的节点中
      text = text.replace(/\s/g, ''); // todo：如果空格超过2就删除2个以上的
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      stark.pop(); // 弹出最后一个, todo：可以和tag比较，校验标签是否合法
      currentParent = stark[stark.length - 1];
    }
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          //标签名
          attrs: []
        };
        advance(start[0].length);

        // 如果不是开始标签的闭合标签，就一致匹配下去（匹配属性）
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      return false; // 不是开始标签
    }

    while (html) {
      // html最开始肯定是一个 <
      // 如果textEnd 为0， 说明是一个开始标签活着结束标签
      // 如果textEnd > 0，说明是文本结束的位置
      var textEnd = html.indexOf('<'); // 若果indexOf中的索引是0，则说明是个标签

      if (textEnd === 0) {
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          // 解析到的开始标签
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 文本内容
        if (text) {
          advance(text.length); // 解析到的文本
          chars(text);
        }
      }
    }
    return root;
  }

  function genProps(attrs) {
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        // 对样式属性进行处理 'color: red;background: white;'  -->  {color: 'red', background: 'white'}
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ abc }} 匹配到的内容是表达式的变量
  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  function genChildren(el) {
    var children = el.children;
    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }
  function codegen(ast) {
    var children = genChildren(ast);
    var code = "_c('".concat(ast.tag, "', ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    return code;
  }

  // 对模版进行编译处理（vue3采用的不是使用正则）
  function compileToFunction(template) {
    // 1.将template 转化成ast语法树
    var ast = parseHTML(template);

    // 2.生成render方法 （render方法执行后返回的结果就是 虚拟DOM）
    // 模版引擎的实现原理：with + new Function
    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); // 根据相关代码生成render函数
    console.log(render);
    return render;
  }

  // h()  _c()
  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }

  // _v()
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  // AST和VNode的区别
  // AST 是语法层面的转化，描述的是语法本身（可以描述JS、CSS ...）
  // 虚拟DOM 是描述的DOM元素，可以增加一些自定义属性（描述DOM的）
  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      // 处理标签
      // 将真实节点和虚拟节点对应起来，后续如果修改属性可以通过虚拟节点找到真实节点，然后完成更新
      vnode.el = document.createElement(tag);

      // 处理属性
      patchProps(vnode.el, data);

      // 处理子元素
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 处理文本
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el, props) {
    for (var key in props) {
      // 处理样式
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
      // Todo: 处理其他属性 ...
    }
  }

  function patch(oldVNode, vnode) {
    var isRealElement = oldVNode.nodeType;
    if (isRealElement) {
      // 初步渲染流程
      var elm = oldVNode; // 获取真实DOM元素

      var parentElm = elm.parentNode; // 获取父元素
      var newElm = createElm(vnode); // 获取新节点

      parentElm.insertBefore(newElm, elm.nextSibling); // 插入新节点
      parentElm.removeChild(elm); // 删除老节点

      return newElm;
    }
  }
  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      // 将vnode转换成真实dom

      var vm = this;
      var el = vm.$el;

      // patch 既有初始化的功能，又有更新的逻辑
      vm.$el = patch(el, vnode);
    };

    // _c("div", {}, ...children)
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    // _v(text)
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };
    Vue.prototype._render = function () {
      // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起

      // 让with中的this指向vm
      return this.$options.render.call(this); // 通过AST语法转义后生成的render方法
    };
  }

  function mountComponent(vm, el) {
    vm.$el = el; // 这里的el是通过querySelector处理过的 (#app)

    // 1.调用render方法产生虚拟节点 虚拟DOM
    vm._update(vm._render()); // vm.$options.render() 虚拟节点

    // Todo
    // 2.根据虚拟DOM产生真实DOM
    // 3.插入到el元素中
  }

  /**
   * vue核心流程：
   * 1. 创造了响应式数据
   * 2. 将模板转换成ast语法树
   * 3. 将ast语法树转换成了render函数
   * 4. 后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）
   *
   * render函数会产生虚拟节点（使用响应式数据）
   * 根据生成的虚拟节点创造真实DOM
   */

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

      // 最终就可以获取render方法
      // console.log(ops.render)

      mountComponent(vm, el); // 组件的挂载

      // script 标签引用的vue.global.js 这个编译过程是在浏览器运行的
      // runtime是不包括模版编译的，整个是打包的时候通过loader来转义.vue文件的，用runtime的时候不能使用template
    };
  }

  // options是用户的选项
  function Vue(options) {
    this._init(options); // 默认调用init，options是用户的配置选项
  }

  initMixin(Vue); // 扩展init方法（_init、$mount 等）
  initLifeCycle(Vue); // 扩展生命周期方法（_render、_update、_c、_v、_s 等）

  return Vue;

}));
//# sourceMappingURL=vue.js.map
