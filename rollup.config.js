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