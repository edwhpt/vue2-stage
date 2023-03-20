import { compileToFunction } from './compiler'
import { mountComponent } from './lifecycle'
import { initState } from './state'

// 用来给Vue增加init方法
export function initMixin(Vue) {
    // 用于初始化操作
    Vue.prototype._init = function (options) {
        // vue vm.$options 就是获取用户的配置

        // 我们使用vue的时候，以$开头的（$nextTick, $data, $attr）是vue内置属性
        const vm = this
        vm.$options = options // 将用户的选项挂载到实例上

        // 初始化状态
        initState(vm)

        if (options.el) {
            vm.$mount(options.el) // 实现数据的挂载
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        // 先进行查找有没有render函数
        if (!ops.render) {
            let template // 没有render看一下是否写了template，没写template才有外部的template
            // 没写模版但是写了el
            if (!ops.template && el) {
                template = el.outerHTML
            } else {
                if (el) {
                    template = ops.template
                }
            }
            // 写了template，就有写了的template
            if (template) {
                // 这里需要对模版进行编译
                const render = compileToFunction(template)
                ops.render = render
            }
            // console.log(template)
        }

        mountComponent(vm, el) // 组件的挂载
        // 最终就可以获取render方法
        // script 标签引用的vue.global.js 这个编译过程是在浏览器运行的
        // runtime是不包括模版编译的，整个是打包的时候通过loader来转义.vue文件的，用runtime的时候不能使用template
        console.log(ops.render)
    }
}
