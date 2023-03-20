import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'

// options是用户的选项
function Vue(options) {
    this._init(options) // 默认调用init
}

initMixin(Vue) // 扩展了init方法
initLifeCycle(Vue)

export default Vue
