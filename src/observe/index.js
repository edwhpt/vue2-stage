class Observer {
    constructor(data) {
        // Object.defineProperty 只能劫持已存在的属性（vue里面会为此单独写一些api  $set $delete）
        this.walk(data)
    }
    // 循环对象，对属性依次劫持
    walk(data) {
        // “重新定义”属性，性能差
        Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
    }
}

// 属性劫持(闭包)
export function defineReactive(target, key, value) {
    observe(value) // 深度劫持，对所有对象都进行属性劫持
    Object.defineProperty(target, key, {
        // 取值的时候，会执行get
        get() {
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

    // 如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以添加一个实例，用实例来判断是够被劫持过）
    return new Observer(data)
}
