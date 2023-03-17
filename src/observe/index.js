import { newArrayProto } from './array'

class Observer {
    constructor(data) {
        // Object.defineProperty 只能劫持已存在的属性（vue里面会为此单独写一些api  $set $delete）
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false // 将__ob__变成不可枚举（循环的时候无法获取）
        })

        // console.log('Observer', data)
        // data.__ob__ = this // 给数组加了一个标识，如果数据上有__ob__则说明这个属性被观测过了
        if (Array.isArray(data)) {
            // 重写数组的方法

            data.__proto__ = newArrayProto // 需要保留数组原有的特性，并且可以重写部分方法
            this.observeArray(data) //如果数组中的元素是对象，可以监控到对象的变化
        } else {
            this.walk(data)
        }
    }
    // 循环对象，对属性依次劫持
    walk(data) {
        // “重新定义”属性，性能差
        Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
    }
    // 观测数组
    observeArray(data) {
        data.forEach((item) => observe(item))
    }
}

// 属性劫持(闭包)
export function defineReactive(target, key, value) {
    observe(value) // 深度劫持，对所有对象都进行属性劫持
    Object.defineProperty(target, key, {
        // 取值的时候，会执行get
        get() {
            console.log('get', key, value)
            return value
        },
        // 修改的时候，会执行set
        set(newValue) {
            if (newValue === value) return // 如果修改的值和原来的值相同，直接返回
            observe(newValue) // 如果修改的值是一个对象，对这个对象进行劫持
            value = newValue
        }
    })
}

// 观测（劫持）data对象
export function observe(data) {
    // 只对对象进行劫持
    if (typeof data !== 'object' || data == null) {
        return
    }

    // 这个对象已经被代理过
    if (data.__ob__ instanceof Observer) {
        return
    }

    // 如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以添加一个实例，用实例来判断是够被劫持过）
    return new Observer(data)
}
