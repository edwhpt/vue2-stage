import { parseHTML } from './parse'

function genProps(attrs) {
    let str = ''
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            // 对样式属性进行处理 'color: red;background: white;'  -->  {color: 'red', background: 'white'}
            let obj = {}
            attr.value.split(';').forEach((item) => {
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }

    return `{${str.slice(0, -1)}}`
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{ abc }} 匹配到的内容是表达式的变量
function gen(node) {
    if (node.type === 1) {
        return codegen(node)
    } else {
        let text = node.text
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        } else {
            let tokens = []
            let match
            defaultTagRE.lastIndex = 0
            let lastIndex = 0
            while ((match = defaultTagRE.exec(text))) {
                let index = match.index
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }

            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }

            return `_v(${tokens.join('+')})`
        }
    }
}

function genChildren(el) {
    const children = el.children
    if (children) {
        return children.map((child) => gen(child)).join(',')
    }
}

function codegen(ast) {
    let children = genChildren(ast)
    let code = `_c('${ast.tag}', ${
        ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
    }${ast.children.length ? `,${children}` : ''})`
    return code
}

// 对模版进行编译处理（vue3采用的不是使用正则）
export function compileToFunction(template) {
    // 1.将template 转化成ast语法树
    let ast = parseHTML(template)

    // 2.生成render方法 （render方法执行后返回的结果就是 虚拟DOM）
    // 模版引擎的实现原理：with + new Function
    let code = codegen(ast)
    code = `with(this){return ${code}}`
    let render = new Function(code) // 根据相关代码生成render函数
    console.log(render)
    return render
}
