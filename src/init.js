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
    }
}
