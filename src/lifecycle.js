import { createElementVNode, createTextVNode } from './vdom'

function createElm(vnode) {
    let { tag, data, children, text } = vnode

    if (typeof tag === 'string') {
        // 处理标签
        // 将真实节点和虚拟节点对应起来，后续如果修改属性可以通过虚拟节点找到真实节点，然后完成更新
        vnode.el = document.createElement(tag)

        // 处理属性
        patchProps(vnode.el, data)

        // 处理子元素
        children.forEach((child) => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        // 处理文本
        vnode.el = document.createTextNode(text)
    }

    return vnode.el
}

function patchProps(el, props) {
    for (const key in props) {
        // 处理样式
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
        // Todo: 处理其他属性 ...
    }
}

function patch(oldVNode, vnode) {
    const isRealElement = oldVNode.nodeType
    if (isRealElement) {
        // 初步渲染流程
        const elm = oldVNode // 获取真实DOM元素

        const parentElm = elm.parentNode // 获取父元素
        let newElm = createElm(vnode) // 获取新节点

        parentElm.insertBefore(newElm, elm.nextSibling) // 插入新节点
        parentElm.removeChild(elm) // 删除老节点

        return newElm
    } else {
        // Todo: diff算法
    }
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
        // 将vnode转换成真实dom

        const vm = this
        const el = vm.$el

        // patch 既有初始化的功能，又有更新的逻辑
        vm.$el = patch(el, vnode)
    }

    // _c("div", {}, ...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }
    // _v(text)
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }

    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value
        return JSON.stringify(value)
    }

    Vue.prototype._render = function () {
        // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起

        // 让with中的this指向vm
        return this.$options.render.call(this) // 通过AST语法转义后生成的render方法
    }
}

export function mountComponent(vm, el) {
    vm.$el = el // 这里的el是通过querySelector处理过的 (#app)

    // 1.调用render方法产生虚拟节点 虚拟DOM
    vm._update(vm._render()) // vm.$options.render() 虚拟节点

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
