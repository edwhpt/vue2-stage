const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配到的分组是一个 标签名 <div 匹配到的是开始标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配的是 </xxx> 最终匹配到的分组是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性，第一个分组是属性的key，value可能是分组3/分组4/分组5
const startTagClose = /^\s*(\/?)>/ // <div>  <br/>

export function parseHTML(html) {
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stark = [] // 用于存放元素
    let currentParent // 指向栈中最后一个元素
    let root // 根元素

    // 需要转化成一颗抽象语法树

    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            parent: null,
            children: [],
            attrs
        }
    }

    function start(tag, attrs) {
        let node = createASTElement(tag, attrs) // 创建一个ast节点
        // 看一下是否是空树
        if (!root) {
            root = node // 如果为空树，则当前是树的根节点
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }

        stark.push(node)
        currentParent = node // currentParent为栈中最后一个
    }
    function chars(text) {
        // 文本直接放到当前指向的节点中
        text = text.replace(/\s/g, '') // todo：如果空格超过2就删除2个以上的
        text &&
            currentParent.children.push({
                type: TEXT_TYPE,
                text,
                parent: currentParent
            })
    }
    function end(tag) {
        let node = stark.pop() // 弹出最后一个, todo：可以和tag比较，校验标签是否合法
        currentParent = stark[stark.length - 1]
    }
    function advance(n) {
        html = html.substring(n)
    }
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1], //标签名
                attrs: []
            }
            advance(start[0].length)

            // 如果不是开始标签的闭合标签，就一致匹配下去（匹配属性）
            let attr, end
            while (
                !(end = html.match(startTagClose)) &&
                (attr = html.match(attribute))
            ) {
                advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
            }

            if (end) {
                advance(end[0].length)
            }
            return match
        }

        return false // 不是开始标签
    }
    while (html) {
        // html最开始肯定是一个 <
        // 如果textEnd 为0， 说明是一个开始标签活着结束标签
        // 如果textEnd > 0，说明是文本结束的位置
        let textEnd = html.indexOf('<') // 若果indexOf中的索引是0，则说明是个标签

        if (textEnd === 0) {
            const startTagMatch = parseStartTag()

            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                // 解析到的开始标签
                continue
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }

        if (textEnd > 0) {
            let text = html.substring(0, textEnd) // 文本内容
            if (text) {
                advance(text.length) // 解析到的文本
                chars(text)
            }
        }
    }

    return root
}
