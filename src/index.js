import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'

// options是用户的选项
function Vue(options) {
    this._init(options) // 默认调用init，options是用户的配置选项
}

initMixin(Vue) // 扩展init方法（_init、$mount 等）
initLifeCycle(Vue) // 扩展生命周期方法（_render、_update、_c、_v、_s 等）

export default Vue
