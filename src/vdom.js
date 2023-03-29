// h()  _c()
export function createElementVNode(vm, tag, data = {}, ...children) {
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) {
        delete data.key
    }
    return vnode(vm, tag, key, data, children)
}

// _v()
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

// AST和VNode的区别
// AST 是语法层面的转化，描述的是语法本身（可以描述JS、CSS ...）
// 虚拟DOM 是描述的DOM元素，可以增加一些自定义属性（描述DOM的）
function vnode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}
