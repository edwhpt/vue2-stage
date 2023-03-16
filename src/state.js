import { observe } from './observe/index'

export function initState(vm) {
    const opts = vm.$options // 获取所有的选项
    if (opts.data) {
        initData(vm) // 初始化数据
    }
}

function proxy(vm, target, key) {
    // vm.name --> vm._data.name
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key]
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data // data 可能是函数和对象
    data = typeof data === 'function' ? data.call(this) : data

    vm._data = data // 把数据添加到实例的_data上
    // 对数据进行劫持 vue2里采用了一个API：Object.defineProperty
    observe(data)

    // 将vm._data 用vm来代理
    for (let key in data) {
        proxy(vm, '_data', key)
    }
}
