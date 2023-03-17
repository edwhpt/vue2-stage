# vue2 基础



## 使用Rollup搭建开发环境

### 初始化环境

```bash
npm init -y
```

### 安装依赖

- rollup：打包工具，相对于webpack打包体积更小
- rollup-plugin-babel：rollup环境的babel插件，负责编译JS高级语法
- @babel/core：babel核心模块
- @babel/preset-env：babel预设插件，把高级语法转换为低级语法，比如let/const转换为var，箭头函数、类的转换

```bash
npm install rollup rollup-plugin-babel @babel/core @babel/preset-env --save-dev
```

### 在根目录创建rollup配置文件，默认名字为rollup.config.js

```js
import babel from 'rollup-plugin-babel'

// rollup默认可以导出一个对象，作为打包的配置文件
export default {
    input: './src/index.js', // 入口文件
    output: {
        file: './dist/vue.js', // 出口文件
        name: 'Vue', // 全局添加Vue属性，global.Vue
        format: 'umd', // esm es6模块  commonjs模块  iife自执行函数  umd（支持commonjs、amd）
        sourcemap: true // 希望可以调试源代码
    },
    // 配置一些插件
    plugins: [
      // 所有插件都是函数，直接执行
      babel({
        exclude: 'node_modules/**' // 排除node_modules所有文件
      })
    ]
}
```

### 创建打包入口文件 src/index.js

```js
const a = 100
// code...
export default {
  a:100
  // code...
}
```

### 创建babel配置文件 .babelrc，打包时使用babel会默认采用配置文件中的配置属性

```json
{
  "presets": [
    "@babel/preset-env"
  ]
}
```

### 在package.json中配置rollup命令脚本

- rollup -c（rollup --config）打包时使用配置文件（rollup.config.js）里面的配置属性
- rollup -w (rollup --watch）监控文件变化，文件发生变化时重新打包

```json
{
  "scripts": {
    "dev": "rollup -cw"
  }
}
```



### 报错处理

npm run dev 报错

```
internal/modules/cjs/loader.js:883
  throw err;
  ^

Error: Cannot find module 'node:process'
Require stack:
- /Users/Wxw/Workspace/front-end/code/vue/vue2-stage/node_modules/rollup/dist/bin/rollup
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:880:15)
    at Function.Module._load (internal/modules/cjs/loader.js:725:27)
    at Module.require (internal/modules/cjs/loader.js:952:19)
    at require (internal/modules/cjs/helpers.js:88:18)
    at Module.<anonymous> (/Users/Wxw/Workspace/front-end/code/vue/vue2-stage/node_modules/rollup/dist/bin/rollup:16:19)
    at Module._compile (internal/modules/cjs/loader.js:1063:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1092:10)
    at Module.load (internal/modules/cjs/loader.js:928:32)
    at Function.Module._load (internal/modules/cjs/loader.js:769:14)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:72:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/Users/Wxw/Workspace/front-end/code/vue/vue2-stage/node_modules/rollup/dist/bin/rollup'
  ]
}
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! vue2-stage@1.0.0 dev: `rollup -cw`
npm ERR! Exit status 1
npm ERR! 
npm ERR! Failed at the vue2-stage@1.0.0 dev script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /Users/Wxw/.npm/_logs/2023-03-14T12_38_11_707Z-debug.log
```

本地环境：

- node v14.16.0
- npm 6.14.11

package.json 配置

```json
{
  "name": "vue2-stage",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "rollup -cw"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.21.0",
    "@babel/preset-env": "^7.20.2",
    "rollup": "^3.19.1",
    "rollup-plugin-babel": "^4.4.0"
  }
}
```

解决方案1：降级rollup版本

```json
{
  
  "devDependencies": {
    "@babel/core": "^7.16.0",
    "@babel/preset-env": "^7.16.4",
    "rollup": "^2.61.1"
  }
}
```

解决方案2：升级node版本(v16.19.1)



## Vue2 响应式原理

响应式基本原理就是，在 Vue 的构造函数中，对 options 的 data 进行处理。即在初始化vue实例的时候，对data、props等对象的每一个属性都通过 Object.defineProperty 定义一次，在数据被set的时候，做一些操作，改变相应的视图。

### 数据观测

基于 Object.defineProperty 来实现对数组和对象的劫持

```js
import { newArrayProto } from './array'

class Observer {
  constructor(data){
    if (Array.isArray(data)) {
      // 这里我们可以重写可以修改数组本身的方法 7个方法，切片编程：需要保留数组原有的特性，并且可以重写部分方法
      data.__proto__ = newArrayProto
      this.observeArray(data) // 如果数组中放的是对象 可以监控到对象的变化
    } else {
      this.walk(data)
    }
  }
  // 循环对象"重新定义属性",对属性依次劫持，性能差
  walk(data) {
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
  // 观测数组
  observeArray(data) {
    data.forEach(item => observe(item))
  }
}

function defineReactive(data,key,value){
  observe(value)  // 深度属性劫持，对所有的对象都进行属性劫持

  Object.defineProperty(data,key,{
    get(){
      return value
    },
    set(newValue){
      if(newValue == value) return
      observe(newValue) // 修改属性之后重新观测，目的：新值为对象或数组的话，可以劫持其数据
      value = newValue
    }
  })
}

export function observe(data) {
  // 只对对象进行劫持
  if(typeof data !== 'object' || data == null){
    return
  }
  return new Observer(data)
}
```

### 重写数组7个变异方法

7个方法是指：push、pop、shift、unshift、sort、reverse、splice。（这七个都是会改变原数组的） 实现思路：面向切片编程！！！

> 不是直接粗暴重写 Array.prototype 上的方法，而是通过原型链继承与函数劫持进行的移花接木。

利用 Object.create(Array.prototype) 生成一个新的对象 newArrayProto，该对象的 __proto__ 指向 Array.prototype，然后将我们数组的 __proto__ 指向拥有重写方法的新对象 newArrayProto，这样就保证了 newArrayProto 和 Array.prototype 都在数组的原型链上。

```js
arr.__proto__ === newArrayProto；newArrayProto.__proto__ === Array.prototype
```

然后在重写方法的内部使用 Array.prototype[method].call 调用原来的方法，并对新增数据进行劫持观测。

```js
let oldArrayProto = Array.prototype // 获取数组的原型

export let newArrayProto = Object.create(oldArrayProto)

// 找到所有的变异方法
let methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']

methods.forEach(method => {
  // 这里重写了数组的方法
  newArrayProto[method] = function (...args) {
    // args reset参数收集，args为真正数组，arguments为伪数组
    const result = oldArrayProto[method].call(this, ...args) // 内部调用原来的方法，函数的劫持，切片编程

    // 我们需要对新增的数据再次进行劫持
    let inserted
    let ob = this.__ob__

    switch (method) {
      case 'push':
      case 'unshift': // arr.unshift(1,2,3)
        inserted = args
        break
      case 'splice': // arr.splice(0,1,{a:1},{a:1})
        inserted = args.slice(2)
      default:
        break
    }

    if (inserted) {
      // 对新增的内容再次进行观测
      ob.observeArray(inserted)
    }
    return result
  }
})
```

### 增加\__ob__属性

这是一个恶心又巧妙的属性，我们在 Observer 类内部，把 this 实例添加到了响应式数据上。相当于给所有响应式数据增加了一个标识，并且可以在响应式数据上获取 Observer 实例上的方法

```js
class Observer {
  constructor(data) {
    // data.__ob__ = this // 给数据加了一个标识 如果数据上有__ob__ 则说明这个属性被观测过了
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false, // 将__ob__ 变成不可枚举 （循环的时候无法获取到，防止栈溢出）
    })

    if (Array.isArray(data)) {
      // 这里我们可以重写可以修改数组本身的方法 7个方法，切片编程：需要保留数组原有的特性，并且可以重写部分方法
      data.__proto__ = newArrayProto
      this.observeArray(data) // 如果数组中放的是对象 可以监控到对象的变化
    } else {
      this.walk(data)
    }
  }

}
```

**\__ob__有两大用处：**

1. 如果一个对象被劫持过了，那就不需要再被劫持了，要判断一个对象是否被劫持过，可以通过 \__ob__ 来判断

```js
// 数据观测
export function observe(data) {
  // 只对对象进行劫持
  if (typeof data !== 'object' || data == null) {
    return
  }

  // 如果一个对象被劫持过了，那就不需要再被劫持了 (要判断一个对象是否被劫持过，可以在对象上增添一个实例，用实例的原型链来判断是否被劫持过)
  if (data.__ob__ instanceof Observer) {
    return data.__ob__
  }

  return new Observer(data)
}
```

2. 我们重写了数组的7个变异方法，其中 push、unshift、splice 这三个方法会给数组新增成员。此时需要对新增的成员再次进行观测，可以通过 \__ob__ 调用 Observer 实例上的 observeArray 方法



## Todo

- [x] 1、使用Rollup搭建开发环境
- [x] 2、`Vue`响应式原理实现，对象属性劫持
- [x] 3、实现对数组的方法劫持
- [ ] 4、模板的编译原理，将模板转化成`ast`语法树
- [ ] 5、代码生成，实现虚拟`DOM
- [ ] 6、通过虚拟`DOM`生成真实`DOM`