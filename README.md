# vue2 基础



## 1. 使用Rollup搭建开发环境

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



## 2. `Vue`响应式原理实现，对象属性劫持

## 3. 实现对数组的方法劫持

## 4. 模板的编译原理，将模板转化成`ast`语法树

## 5. 代码生成，实现虚拟`DOM`

## 6. 通过虚拟`DOM`生成真实`DOM`