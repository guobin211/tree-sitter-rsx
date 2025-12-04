const Parser = require('tree-sitter')
const Rust = require('tree-sitter-rust')
const TypeScript = require('tree-sitter-typescript').typescript
const HTML = require('tree-sitter-html')
const SCSS = require('tree-sitter-scss')

// 指令类型常量
const DIRECTIVE_TYPES = {
    IF: 'if_directive',
    EACH: 'each_directive',
    RAW_HTML: 'raw_html_directive',
    INTERPOLATION: 'interpolation',
    CLIENT_COMPONENT: 'client_component'
}

// 支持的客户端框架
const SUPPORTED_CLIENT_TYPES = ['react', 'vue', 'svelte']

// 二元运算符优先级（从低到高）
const BINARY_OPERATORS = [
    { ops: ['||'], name: 'logical_or' },
    { ops: ['&&'], name: 'logical_and' },
    { ops: ['===', '!==', '==', '!='], name: 'equality' },
    { ops: ['>=', '<=', '>', '<'], name: 'comparison' },
    { ops: ['+', '-'], name: 'additive' },
    { ops: ['*', '/', '%'], name: 'multiplicative' }
]

class RSXParser {
    constructor() {
        this.rustParser = new Parser()
        this.rustParser.setLanguage(Rust)

        this.tsParser = new Parser()
        this.tsParser.setLanguage(TypeScript)

        this.htmlParser = new Parser()
        this.htmlParser.setLanguage(HTML)

        this.scssParser = new Parser()
        this.scssParser.setLanguage(SCSS)
    }

    /**
     * 解析RSX文件内容
     * @param {string} content - RSX文件内容
     * @returns {Object} 解析结果
     */
    parse(content) {
        const sections = this.extractSections(content)
        const result = {
            type: 'rsx_file',
            sections: [],
            errors: [],
            originalContent: content // 保存原始内容用于验证
        }

        // 解析Rust部分
        if (sections.rust) {
            try {
                const rustTree = this.rustParser.parse(sections.rust.content)
                result.sections.push({
                    type: 'rust_section',
                    start: sections.rust.start,
                    end: sections.rust.end,
                    content: sections.rust.content,
                    ast: rustTree.rootNode,
                    errors: this.extractErrors(rustTree)
                })
            } catch (error) {
                result.errors.push({
                    type: 'rust_parse_error',
                    message: error.message,
                    start: sections.rust.start
                })
            }
        }

        // 解析Script部分
        if (sections.script) {
            try {
                const tsTree = this.tsParser.parse(sections.script.content)
                result.sections.push({
                    type: 'script_section',
                    start: sections.script.start,
                    end: sections.script.end,
                    content: sections.script.content,
                    ast: tsTree.rootNode,
                    errors: this.extractErrors(tsTree)
                })
            } catch (error) {
                result.errors.push({
                    type: 'script_parse_error',
                    message: error.message,
                    start: sections.script.start
                })
            }
        }

        // 解析Template部分
        if (sections.template) {
            try {
                const templateResult = this.parseTemplate(sections.template.content)
                result.sections.push({
                    type: 'template_section',
                    start: sections.template.start,
                    end: sections.template.end,
                    content: sections.template.content,
                    ast: templateResult.ast,
                    directives: templateResult.directives,
                    errors: templateResult.errors
                })
            } catch (error) {
                result.errors.push({
                    type: 'template_parse_error',
                    message: error.message,
                    start: sections.template.start
                })
            }
        }

        // 解析Style部分
        if (sections.style) {
            try {
                const scssTree = this.scssParser.parse(sections.style.content)
                result.sections.push({
                    type: 'style_section',
                    start: sections.style.start,
                    end: sections.style.end,
                    content: sections.style.content,
                    ast: scssTree.rootNode,
                    errors: this.extractErrors(scssTree)
                })
            } catch (error) {
                result.errors.push({
                    type: 'style_parse_error',
                    message: error.message,
                    start: sections.style.start
                })
            }
        }

        // 执行结构验证
        const validationErrors = this.validateRSXStructure(result)
        result.errors = result.errors.concat(validationErrors)

        return result
    }

    /**
     * 获取解析统计信息
     * @param {Object} parseResult - 解析结果
     * @returns {Object} 统计信息
     */
    getParseStatistics(parseResult) {
        const stats = {
            totalSections: parseResult.sections.length,
            sectionTypes: {},
            totalErrors: parseResult.errors.length,
            errorTypes: {},
            directiveCount: 0,
            directiveTypes: {}
        }

        // 统计section类型
        parseResult.sections.forEach((section) => {
            const type = section.type
            stats.sectionTypes[type] = (stats.sectionTypes[type] || 0) + 1

            // 统计模板指令
            if (section.directives) {
                stats.directiveCount += section.directives.length
                section.directives.forEach((directive) => {
                    const dirType = directive.type
                    stats.directiveTypes[dirType] = (stats.directiveTypes[dirType] || 0) + 1
                })
            }
        })

        // 统计错误类型
        parseResult.errors.forEach((error) => {
            const type = error.type
            stats.errorTypes[type] = (stats.errorTypes[type] || 0) + 1
        })

        return stats
    }

    /**
     * 生成解析报告
     * @param {Object} parseResult - 解析结果
     * @returns {string} 格式化的报告
     */
    generateReport(parseResult) {
        const stats = this.getParseStatistics(parseResult)
        let report = '=== RSX 解析报告 ===\n\n'

        report += `文件结构:\n`
        report += `- 总section数: ${stats.totalSections}\n`
        Object.entries(stats.sectionTypes).forEach(([type, count]) => {
            report += `- ${type}: ${count}\n`
        })

        if (stats.directiveCount > 0) {
            report += `\n模板指令:\n`
            report += `- 总指令数: ${stats.directiveCount}\n`
            Object.entries(stats.directiveTypes).forEach(([type, count]) => {
                report += `- ${type}: ${count}\n`
            })
        }

        if (stats.totalErrors > 0) {
            report += `\n错误统计:\n`
            report += `- 总错误数: ${stats.totalErrors}\n`
            Object.entries(stats.errorTypes).forEach(([type, count]) => {
                report += `- ${type}: ${count}\n`
            })

            report += `\n详细错误:\n`
            parseResult.errors.forEach((error, index) => {
                report += `${index + 1}. [${error.severity || 'error'}] ${error.type}: ${error.message}\n`
                if (error.section) {
                    report += `   位置: ${error.section} section\n`
                }
            })
        } else {
            report += `\n✅ 没有发现错误\n`
        }

        return report
    }

    /**
     * 从RSX内容中提取各个部分
     * @param {string} content - RSX文件内容
     * @returns {Object} 各部分内容
     */
    extractSections(content) {
        const sections = {}

        // 提取Rust部分 - 查找所有匹配
        const rustMatches = [...content.matchAll(/^---\s*\n([\s\S]*?)\n---\s*$/gm)]
        if (rustMatches.length > 0) {
            const firstMatch = rustMatches[0]
            const start = content.indexOf(firstMatch[0])
            sections.rust = {
                content: firstMatch[1],
                start: start,
                end: start + firstMatch[0].length,
                count: rustMatches.length
            }
        }

        // 提取Script部分 - 查找所有匹配
        const scriptMatches = [...content.matchAll(/<script>\s*\n?([\s\S]*?)\n?\s*<\/script>/g)]
        if (scriptMatches.length > 0) {
            const firstMatch = scriptMatches[0]
            const start = content.indexOf(firstMatch[0])
            sections.script = {
                content: firstMatch[1],
                start: start,
                end: start + firstMatch[0].length,
                count: scriptMatches.length
            }
        }

        // 提取Template部分 - 使用手动解析避免嵌套问题
        const templateStart = content.indexOf('<template>')
        if (templateStart !== -1) {
            const templateEnd = content.lastIndexOf('</template>')
            if (templateEnd !== -1) {
                const _fullTemplateMatch = content.substring(templateStart, templateEnd + 11) // 11 = '</template>'.length
                const templateContent = content.substring(templateStart + 10, templateEnd) // 10 = '<template>'.length

                // 计算template section的数量
                const templateMatches = content.match(/<template>/g)
                const templateCount = templateMatches ? templateMatches.length : 0

                sections.template = {
                    content: templateContent.trim(),
                    start: templateStart,
                    end: templateEnd + 11,
                    count: templateCount
                }
            }
        }

        // 提取Style部分 - 查找所有匹配
        const styleMatches = [...content.matchAll(/<style>\s*\n?([\s\S]*?)\n?\s*<\/style>/g)]
        if (styleMatches.length > 0) {
            const firstMatch = styleMatches[0]
            const start = content.indexOf(firstMatch[0])
            sections.style = {
                content: firstMatch[1],
                start: start,
                end: start + firstMatch[0].length,
                count: styleMatches.length
            }
        }

        return sections
    }

    /**
     * 解析Template部分，处理Handlebars指令
     * @param {string} content - Template内容
     * @returns {Object} 解析结果
     */
    parseTemplate(content) {
        const result = {
            ast: null,
            directives: [],
            errors: []
        }

        // 先处理模板指令
        const processedContent = this.preprocessTemplate(content, result.directives)

        try {
            // 使用HTML解析器解析处理后的内容
            const htmlTree = this.htmlParser.parse(processedContent)
            result.ast = htmlTree.rootNode
            result.errors = result.errors.concat(this.extractErrors(htmlTree))
        } catch (error) {
            result.errors.push({
                type: 'html_parse_error',
                message: error.message
            })
        }

        return result
    }

    /**
     * 预处理Template内容，提取模板指令
     * @param {string} content - 原始模板内容
     * @param {Array} directives - 用于存储指令的数组
     * @returns {string} 处理后的HTML内容
     */
    preprocessTemplate(content, directives) {
        let processedContent = content

        // 递归处理所有模板指令，直到没有更多指令需要处理
        let hasChanges = true
        let iterations = 0
        const maxIterations = 10

        while (hasChanges && iterations < maxIterations) {
            const initialDirectiveCount = directives.length

            // 处理复杂的条件指令，支持嵌套的 else if
            processedContent = this.processIfDirectives(processedContent, directives)

            // 处理循环指令 {{@each array as item, index}}
            processedContent = processedContent.replace(
                /\{\{@each\s+([\w.]+)\s+as\s+(\w+)(?:,\s*(\w+))?\}\}([\s\S]*?)\{\{\/each\}\}/g,
                (match, array, item, index, body, offset) => {
                    directives.push({
                        type: 'each_directive',
                        array: array,
                        item: item,
                        index: index || null,
                        body: body ? body.trim() : '',
                        start: offset,
                        end: offset + match.length,
                        original: match
                    })
                    return `<!-- EACH_DIRECTIVE_${directives.length - 1} -->`
                }
            )

            // 处理Raw HTML指令 {{@html content}}
            processedContent = processedContent.replace(/\{\{@html\s+([\w.]+)\}\}/g, (match, content, offset) => {
                directives.push({
                    type: 'raw_html_directive',
                    content: content,
                    start: offset,
                    end: offset + match.length,
                    original: match
                })
                return `<!-- RAW_HTML_${directives.length - 1} -->`
            })

            // 检查是否有新的指令被添加
            hasChanges = directives.length > initialDirectiveCount
            iterations++
        }

        // 最后处理文本插值 {{ expression }}（必须在结构化指令之后）
        // 排除指令标记: {{/...}}, {{:...}}, {{@...}}
        processedContent = processedContent.replace(/\{\{\s*([^}@/:][^}]*?)\s*\}\}/g, (match, expression, offset) => {
            const trimmedExpr = expression.trim()
            // 跳过空表达式
            if (!trimmedExpr) {
                return match
            }
            const parsedExpression = this.parseExpression(trimmedExpr)
            directives.push({
                type: 'interpolation',
                expression: trimmedExpr,
                parsedExpression: parsedExpression,
                start: offset,
                end: offset + match.length,
                original: match
            })
            return `<!-- INTERPOLATION_${directives.length - 1} -->`
        })

        // 处理客户端组件
        processedContent = this.processClientComponents(processedContent, directives)

        return processedContent
    }

    /**
     * 处理复杂的if指令，支持多个else if分支
     * 语法: {{@if condition}}...{{:else if condition}}...{{:else}}...{{/if}}
     * @param {string} content - 模板内容
     * @param {Array} directives - 指令数组
     * @returns {string} 处理后的内容
     */
    processIfDirectives(content, directives) {
        let processedContent = content
        let offset = 0

        // 找到所有if指令的开始和结束位置（{{@if}} 语法）
        const findMatchingDirectives = (text) => {
            const stack = []
            const matches = []
            let index = 0

            while (index < text.length) {
                // 匹配 {{@if condition}}
                const ifMatch = text.slice(index).match(/^\{\{@if\s+([^}]+)\}\}/)
                // 匹配 {{:else}} 或 {{:else if condition}} 或 {{:elseif condition}}
                const elseMatch = text.slice(index).match(/^\{\{:else(?:\s+if\s+([^}]+))?\}\}/)
                const elseifMatch = text.slice(index).match(/^\{\{:elseif\s+([^}]+)\}\}/)
                // 匹配 {{/if}}
                const endIfMatch = text.slice(index).match(/^\{\{\/if\}\}/)

                if (ifMatch) {
                    stack.push({
                        type: 'if',
                        condition: ifMatch[1].trim(),
                        start: index,
                        startLength: ifMatch[0].length
                    })
                    index += ifMatch[0].length
                } else if ((elseMatch || elseifMatch) && stack.length > 0) {
                    const current = stack[stack.length - 1]
                    if (!current.branches) {
                        current.branches = []
                    }
                    
                    if (elseifMatch) {
                        current.branches.push({
                            type: 'else_if',
                            condition: elseifMatch[1].trim(),
                            start: index,
                            length: elseifMatch[0].length
                        })
                        index += elseifMatch[0].length
                    } else if (elseMatch) {
                        current.branches.push({
                            type: elseMatch[1] ? 'else_if' : 'else',
                            condition: elseMatch[1] ? elseMatch[1].trim() : null,
                            start: index,
                            length: elseMatch[0].length
                        })
                        index += elseMatch[0].length
                    }
                } else if (endIfMatch && stack.length > 0) {
                    const directive = stack.pop()
                    directive.end = index
                    directive.endLength = endIfMatch[0].length

                    if (stack.length === 0) {
                        matches.push(directive)
                    }
                    index += endIfMatch[0].length
                } else {
                    index++
                }
            }

            return matches
        }

        const matches = findMatchingDirectives(processedContent)

        // 从后往前处理，避免位置偏移问题
        for (let i = matches.length - 1; i >= 0; i--) {
            const match = matches[i]
            const fullMatch = processedContent.substring(match.start, match.end + match.endLength)

            // 解析分支内容
            let bodyStart = match.start + match.startLength
            const branches = [
                {
                    type: 'if',
                    condition: match.condition,
                    body: ''
                }
            ]

            // 处理else分支
            if (match.branches) {
                let currentStart = bodyStart

                for (const branch of match.branches) {
                    // 上一个分支的内容
                    const prevBranch = branches[branches.length - 1]
                    prevBranch.body = processedContent.substring(currentStart, branch.start).trim()

                    // 添加新分支
                    branches.push({
                        type: branch.type,
                        condition: branch.condition,
                        body: ''
                    })

                    currentStart = branch.start + branch.length
                }

                // 最后一个分支的内容
                const lastBranch = branches[branches.length - 1]
                lastBranch.body = processedContent.substring(currentStart, match.end).trim()
            } else {
                // 只有if分支
                branches[0].body = processedContent.substring(bodyStart, match.end).trim()
            }

            const ifDirective = {
                type: 'if_directive',
                condition: match.condition,
                branches: branches.map((branch) => ({
                    ...branch,
                    // 递归处理分支内容中的嵌套指令
                    body: branch.body,
                    processedBody: this.preprocessBranchContent(branch.body, directives)
                })),
                start: match.start + offset,
                end: match.end + match.endLength + offset,
                original: fullMatch
            }

            directives.push(ifDirective)

            // 替换内容
            const replacement = `<!-- IF_DIRECTIVE_${directives.length - 1} -->`
            processedContent =
                processedContent.substring(0, match.start) +
                replacement +
                processedContent.substring(match.end + match.endLength)
        }

        return processedContent
    }

    /**
     * 找到正确的template匹配，处理嵌套template标签的情况
     * @param {string} content - 完整内容
     * @param {Array} matches - 所有匹配结果
     * @returns {Object|null} 正确的匹配对象
     */
    findCorrectTemplateMatch(content, _matches) {
        // 查找最外层的<template>标签
        const openTag = '<template>'
        const closeTag = '</template>'

        let startIndex = content.indexOf(openTag)
        if (startIndex === -1) {
            return null
        }

        // 使用栈来匹配正确的闭合标签
        let depth = 0
        let currentIndex = startIndex

        while (currentIndex < content.length) {
            const nextOpen = content.indexOf(openTag, currentIndex)
            const nextClose = content.indexOf(closeTag, currentIndex)

            // 如果没有找到闭合标签，说明不匹配
            if (nextClose === -1) {
                break
            }

            // 如果下一个开放标签在下一个闭合标签之前
            if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++
                currentIndex = nextOpen + openTag.length
            } else {
                if (depth === 0) {
                    // 找到匹配的闭合标签
                    const fullMatch = content.substring(startIndex, nextClose + closeTag.length)
                    const innerContent = content.substring(startIndex + openTag.length, nextClose).trim()

                    return {
                        fullMatch: fullMatch,
                        content: innerContent
                    }
                }
                depth--
                currentIndex = nextClose + closeTag.length
            }
        }

        return null
    }

    /**
     * 递归处理分支内容中的嵌套指令
     * @param {string} content - 分支内容
     * @param {Array} directives - 指令数组
     * @returns {string} 处理后的内容
     */
    preprocessBranchContent(content, directives) {
        let processedContent = content

        // 处理循环指令 {{@each}}
        processedContent = processedContent.replace(
            /\{\{@each\s+([\w.]+)\s+as\s+(\w+)(?:,\s*(\w+))?\}\}([\s\S]*?)\{\{\/each\}\}/g,
            (match, array, item, index, body, offset) => {
                directives.push({
                    type: 'each_directive',
                    array: array,
                    item: item,
                    index: index || null,
                    body: body ? body.trim() : '',
                    start: offset,
                    end: offset + match.length,
                    original: match
                })
                return `<!-- EACH_DIRECTIVE_${directives.length - 1} -->`
            }
        )

        // 处理嵌套的if指令
        processedContent = this.processIfDirectives(processedContent, directives)

        // 处理Raw HTML指令
        processedContent = processedContent.replace(/\{\{@html\s+([\w.]+)\}\}/g, (match, content, offset) => {
            directives.push({
                type: 'raw_html_directive',
                content: content,
                start: offset,
                end: offset + match.length,
                original: match
            })
            return `<!-- RAW_HTML_${directives.length - 1} -->`
        })

        // 处理文本插值（排除指令标记）
        processedContent = processedContent.replace(/\{\{\s*([^}@/:][^}]*?)\s*\}\}/g, (match, expression, offset) => {
            const trimmedExpr = expression.trim()
            if (!trimmedExpr) {
                return match
            }
            const parsedExpression = this.parseExpression(trimmedExpr)
            directives.push({
                type: 'interpolation',
                expression: trimmedExpr,
                parsedExpression: parsedExpression,
                start: offset,
                end: offset + match.length,
                original: match
            })
            return `<!-- INTERPOLATION_${directives.length - 1} -->`
        })

        return processedContent
    }

    /**
     * 处理客户端组件
     * @param {string} content - 模板内容
     * @param {Array} directives - 指令数组
     * @returns {string} 处理后的内容
     */
    processClientComponents(content, directives) {
        let processedContent = content
        const clientComponentPattern = /<(\w+)([^>]*?client\s*=\s*["']([^"']+)["'][^>]*?)(\/?>)/g

        let match
        const replacements = []

        while ((match = clientComponentPattern.exec(content)) !== null) {
            const [fullMatch, tagName, attributes, clientType, closingTag] = match
            const isSelfClosing = closingTag === '/>'
            let children = ''
            let endTag = ''
            let fullComponentMatch = fullMatch

            if (!isSelfClosing) {
                const endTagPattern = new RegExp(`</${tagName}>`, 'g')
                endTagPattern.lastIndex = match.index + fullMatch.length
                const endMatch = endTagPattern.exec(content)

                if (endMatch) {
                    children = content.substring(match.index + fullMatch.length, endMatch.index)
                    endTag = endMatch[0]
                    fullComponentMatch = content.substring(match.index, endMatch.index + endTag.length)
                }
            }

            const component = {
                type: 'client_component',
                tagName: tagName,
                clientType: clientType,
                attributes: this.parseAttributes(attributes),
                children: children.trim(),
                start: match.index,
                end: match.index + fullComponentMatch.length,
                original: fullComponentMatch
            }

            replacements.push({
                start: match.index,
                end: match.index + fullComponentMatch.length,
                replacement: `<!-- CLIENT_COMPONENT_${directives.length} -->`,
                component: component
            })

            directives.push(component)
        }

        // 从后往前替换，避免位置偏移
        for (let i = replacements.length - 1; i >= 0; i--) {
            const { start, end, replacement } = replacements[i]
            processedContent = processedContent.substring(0, start) + replacement + processedContent.substring(end)
        }

        return processedContent
    }

    /**
     * 解析HTML属性
     * @param {string} attributeString - 属性字符串
     * @returns {Object} 解析后的属性对象
     */
    parseAttributes(attributeString) {
        const attributes = {}
        const attrPattern = /(\w+)(?:\s*=\s*["']([^"']*)["'])?/g

        let match = attrPattern.exec(attributeString)
        while (match !== null) {
            const [, name, value] = match
            attributes[name] = value || true
            match = attrPattern.exec(attributeString)
        }

        return attributes
    }

    /**
     * 解析表达式
     * @param {string} expression - 表达式字符串
     * @returns {Object} 解析后的表达式对象
     */
    parseExpression(expression) {
        const result = {
            type: 'unknown',
            raw: expression,
            parts: []
        }

        const trimmed = expression.trim()
        if (!trimmed) {
            return result
        }

        // 检查是否是条件表达式 (三元运算符) - 需要处理嵌套括号
        const ternaryResult = this.parseTernaryExpression(trimmed)
        if (ternaryResult) {
            return ternaryResult
        }

        // 检查是否是二元表达式（按优先级从低到高）
        const binaryResult = this.parseBinaryExpression(trimmed)
        if (binaryResult) {
            return binaryResult
        }

        // 检查是否是一元表达式
        if (trimmed.startsWith('!') || (trimmed.startsWith('-') && trimmed.length > 1 && !/^\d/.test(trimmed[1]))) {
            result.type = 'unary_expression'
            result.operator = trimmed[0]
            result.operand = trimmed.slice(1).trim()
            result.parsedOperand = this.parseExpression(result.operand)
            return result
        }

        // 检查是否是函数调用或链式调用 (如 obj.method() 或 func())
        const callResult = this.parseCallExpression(trimmed)
        if (callResult) {
            return callResult
        }

        // 检查是否是属性访问 (不含函数调用)
        if (trimmed.includes('.') && !trimmed.includes('(')) {
            result.type = 'property_access'
            result.parts = trimmed.split('.')
            result.object = result.parts.slice(0, -1).join('.')
            result.property = result.parts[result.parts.length - 1]
            return result
        }

        // 检查字面量
        if (/^["'].*["']$/.test(trimmed)) {
            result.type = 'string_literal'
            result.value = trimmed.slice(1, -1)
            return result
        }

        if (/^\d+(\.\d+)?$/.test(trimmed)) {
            result.type = 'number_literal'
            result.value = parseFloat(trimmed)
            return result
        }

        if (trimmed === 'true' || trimmed === 'false') {
            result.type = 'boolean_literal'
            result.value = trimmed === 'true'
            return result
        }

        // 简单标识符
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed)) {
            result.type = 'identifier'
            result.name = trimmed
            return result
        }

        return result
    }

    /**
     * 解析三元表达式
     * @param {string} expression - 表达式字符串
     * @returns {Object|null} 解析结果
     */
    parseTernaryExpression(expression) {
        let depth = 0
        let questionIndex = -1

        for (let i = 0; i < expression.length; i++) {
            const char = expression[i]
            if (char === '(' || char === '[' || char === '{') {
                depth++
            } else if (char === ')' || char === ']' || char === '}') {
                depth--
            } else if (char === '?' && depth === 0) {
                questionIndex = i
                break
            }
        }

        if (questionIndex === -1) return null

        // 找到对应的冒号
        depth = 0
        let colonIndex = -1
        for (let i = questionIndex + 1; i < expression.length; i++) {
            const char = expression[i]
            if (char === '(' || char === '[' || char === '{') {
                depth++
            } else if (char === ')' || char === ']' || char === '}') {
                depth--
            } else if (char === ':' && depth === 0) {
                colonIndex = i
                break
            }
        }

        if (colonIndex === -1) return null

        return {
            type: 'conditional',
            raw: expression,
            condition: expression.substring(0, questionIndex).trim(),
            trueValue: expression.substring(questionIndex + 1, colonIndex).trim(),
            falseValue: expression.substring(colonIndex + 1).trim()
        }
    }

    /**
     * 解析二元表达式
     * @param {string} expression - 表达式字符串
     * @returns {Object|null} 解析结果
     */
    parseBinaryExpression(expression) {
        // 按优先级从低到高查找运算符
        for (const { ops, name } of BINARY_OPERATORS) {
            for (const op of ops) {
                const index = this.findOperatorIndex(expression, op)
                if (index !== -1) {
                    const left = expression.substring(0, index).trim()
                    const right = expression.substring(index + op.length).trim()

                    if (left && right) {
                        return {
                            type: 'binary_expression',
                            raw: expression,
                            operator: op,
                            operatorType: name,
                            left: left,
                            right: right,
                            parsedLeft: this.parseExpression(left),
                            parsedRight: this.parseExpression(right)
                        }
                    }
                }
            }
        }
        return null
    }

    /**
     * 在表达式中查找运算符位置（考虑括号嵌套）
     * @param {string} expression - 表达式字符串
     * @param {string} op - 运算符
     * @returns {number} 运算符位置，未找到返回 -1
     */
    findOperatorIndex(expression, op) {
        let depth = 0

        for (let i = 0; i < expression.length - op.length + 1; i++) {
            const char = expression[i]
            if (char === '(' || char === '[' || char === '{') {
                depth++
            } else if (char === ')' || char === ']' || char === '}') {
                depth--
            } else if (depth === 0 && expression.substring(i, i + op.length) === op) {
                // 确保不是更长运算符的一部分
                const before = i > 0 ? expression[i - 1] : ''
                const after = i + op.length < expression.length ? expression[i + op.length] : ''

                // 排除 >= <= == != && || 的部分匹配
                if (op === '>' && after === '=') continue
                if (op === '<' && after === '=') continue
                if (op === '=' && (before === '!' || before === '=' || before === '>' || before === '<' || after === '=')) continue
                if (op === '!' && after === '=') continue
                if (op === '&' && (before === '&' || after === '&')) continue
                if (op === '|' && (before === '|' || after === '|')) continue

                return i
            }
        }
        return -1
    }

    /**
     * 解析函数调用或链式调用表达式
     * @param {string} expression - 表达式字符串
     * @returns {Object|null} 解析结果
     */
    parseCallExpression(expression) {
        // 从右向左找到最外层的函数调用括号
        let depth = 0
        let lastOpenParen = -1

        for (let i = expression.length - 1; i >= 0; i--) {
            const char = expression[i]
            if (char === ')') {
                depth++
            } else if (char === '(') {
                depth--
                if (depth === 0) {
                    lastOpenParen = i
                    break
                }
            }
        }

        if (lastOpenParen === -1 || expression[expression.length - 1] !== ')') {
            return null
        }

        const funcPart = expression.substring(0, lastOpenParen).trim()
        const argsPart = expression.substring(lastOpenParen + 1, expression.length - 1).trim()

        if (!funcPart) return null

        // 解析参数列表
        const args = this.parseArgumentList(argsPart)

        return {
            type: 'function_call',
            raw: expression,
            function: funcPart,
            parsedFunction: this.parseExpression(funcPart),
            arguments: args,
            parsedArguments: args.map(arg => this.parseExpression(arg))
        }
    }

    /**
     * 解析参数列表
     * @param {string} argsString - 参数字符串
     * @returns {Array} 参数数组
     */
    parseArgumentList(argsString) {
        if (!argsString.trim()) return []

        const args = []
        let depth = 0
        let current = ''

        for (const char of argsString) {
            if (char === '(' || char === '[' || char === '{') {
                depth++
                current += char
            } else if (char === ')' || char === ']' || char === '}') {
                depth--
                current += char
            } else if (char === ',' && depth === 0) {
                args.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }

        if (current.trim()) {
            args.push(current.trim())
        }

        return args
    }

    /**
     * 从Tree-sitter树中提取错误
     * @param {Tree} tree - Tree-sitter解析树
     * @returns {Array} 错误列表
     */
    extractErrors(tree) {
        const errors = []

        function walk(node) {
            if (node.hasError) {
                errors.push({
                    type: 'syntax_error',
                    message: `语法错误在 ${node.type}`,
                    start: node.startPosition,
                    end: node.endPosition,
                    severity: 'error'
                })
            }

            // 检查缺失的节点
            if (node.isMissing) {
                errors.push({
                    type: 'missing_node',
                    message: `缺失节点: ${node.type}`,
                    start: node.startPosition,
                    end: node.endPosition,
                    severity: 'error'
                })
            }

            for (let child of node.children) {
                walk(child)
            }
        }

        walk(tree.rootNode)
        return errors
    }

    /**
     * 验证RSX文件结构
     * @param {Object} parseResult - 解析结果
     * @returns {Array} 验证错误列表
     */
    validateRSXStructure(parseResult) {
        const errors = []
        const sections = parseResult.sections

        // 1. 检查是否有重复的section（通过extractSections的count检查）
        const sectionTypes = sections.map((s) => s.type)
        const duplicates = []
        const seenTypes = new Set()

        sectionTypes.forEach((type) => {
            if (seenTypes.has(type)) {
                if (!duplicates.includes(type)) {
                    duplicates.push(type)
                }
            } else {
                seenTypes.add(type)
            }
        })

        duplicates.forEach((type) => {
            errors.push({
                type: 'duplicate_section',
                message: `代码块只能出现一次，发现重复的 ${type}`,
                severity: 'error'
            })
        })

        // 1.1 通过原始内容检查重复section（更准确的方法）
        errors.push(...this.checkDuplicateSections(parseResult.originalContent || ''))

        // 验证各个section的内容
        sections.forEach((section) => {
            switch (section.type) {
                case 'rust_section':
                    errors.push(...this.validateRustSection(section))
                    break
                case 'script_section':
                    errors.push(...this.validateScriptSection(section))
                    break
                case 'template_section':
                    errors.push(...this.validateTemplateSection(section))
                    break
                case 'style_section':
                    errors.push(...this.validateStyleSection(section))
                    break
            }
        })

        return errors
    }

    /**
     * 检查重复的section
     * @param {string} content - 原始内容
     * @returns {Array} 错误列表
     */
    checkDuplicateSections(content) {
        const errors = []

        // 检查rust section重复
        const rustMatches = content.match(/^---[\s\S]*?---$/gm)
        if (rustMatches && rustMatches.length > 1) {
            errors.push({
                type: 'duplicate_section',
                message: `代码块只能出现一次，发现 ${rustMatches.length} 个 rust section`,
                severity: 'error'
            })
        }

        // 检查script section重复
        const scriptMatches = content.match(/<script>[\s\S]*?<\/script>/g)
        if (scriptMatches && scriptMatches.length > 1) {
            errors.push({
                type: 'duplicate_section',
                message: `代码块只能出现一次，发现 ${scriptMatches.length} 个 script section`,
                severity: 'error'
            })
        }

        // 检查template section重复
        const templateMatches = content.match(/<template>[\s\S]*?<\/template>/g)
        if (templateMatches && templateMatches.length > 1) {
            errors.push({
                type: 'duplicate_section',
                message: `代码块只能出现一次，发现 ${templateMatches.length} 个 template section`,
                severity: 'error'
            })
        }

        // 检查style section重复
        const styleMatches = content.match(/<style>[\s\S]*?<\/style>/g)
        if (styleMatches && styleMatches.length > 1) {
            errors.push({
                type: 'duplicate_section',
                message: `代码块只能出现一次，发现 ${styleMatches.length} 个 style section`,
                severity: 'error'
            })
        }

        return errors
    }

    /**
     * 验证Rust section
     * @param {Object} section - Rust section
     * @returns {Array} 错误列表
     */
    validateRustSection(section) {
        const errors = []

        // 检查是否包含get_server_side_props函数
        if (!section.content.includes('get_server_side_props')) {
            errors.push({
                type: 'missing_server_props',
                message: 'Rust section应该包含get_server_side_props函数',
                severity: 'warning',
                section: 'rust'
            })
        }

        // 检查函数签名
        const funcPattern = /async\s+fn\s+get_server_side_props\s*\([^)]*\)\s*->\s*Response/
        if (section.content.includes('get_server_side_props') && !funcPattern.test(section.content)) {
            errors.push({
                type: 'invalid_function_signature',
                message: 'get_server_side_props函数签名不正确',
                severity: 'error',
                section: 'rust'
            })
        }

        return errors
    }

    /**
     * 验证Script section
     * @param {Object} section - Script section
     * @returns {Array} 错误列表
     */
    validateScriptSection(section) {
        const errors = []

        // 检查是否使用了defineProps
        if (!section.content.includes('defineProps')) {
            errors.push({
                type: 'missing_define_props',
                message: 'Script section建议使用defineProps定义组件属性',
                severity: 'info',
                section: 'script'
            })
        }

        // 检查TypeScript接口定义
        const interfacePattern = /interface\s+\w+\s*\{[\s\S]*?\}/g
        const interfaces = section.content.match(interfacePattern)

        if (interfaces) {
            interfaces.forEach((interfaceStr) => {
                // 简单检查接口是否有属性
                if (!interfaceStr.includes(':')) {
                    errors.push({
                        type: 'empty_interface',
                        message: '接口定义为空或格式不正确',
                        severity: 'warning',
                        section: 'script'
                    })
                }
            })
        }

        return errors
    }

    /**
     * 验证Template section
     * @param {Object} section - Template section
     * @returns {Array} 错误列表
     */
    validateTemplateSection(section) {
        const errors = []

        // 2. 检查template中是否包含禁用的标签
        const forbiddenTags = ['template', 'script', 'style']
        const content = section.content

        forbiddenTags.forEach((tag) => {
            const tagPattern = new RegExp(`<${tag}[^>]*>`, 'gi')
            const matches = content.match(tagPattern)
            if (matches) {
                errors.push({
                    type: 'forbidden_tag',
                    message: `template部分不允许使用 <${tag}> 标签`,
                    severity: 'error',
                    section: 'template'
                })
            }
        })

        // 3. 检查HTML标签中的事件属性（只检查HTML5标准标签）
        const html5Tags = [
            'a',
            'abbr',
            'address',
            'area',
            'article',
            'aside',
            'audio',
            'b',
            'base',
            'bdi',
            'bdo',
            'blockquote',
            'body',
            'br',
            'button',
            'canvas',
            'caption',
            'cite',
            'code',
            'col',
            'colgroup',
            'data',
            'datalist',
            'dd',
            'del',
            'details',
            'dfn',
            'dialog',
            'div',
            'dl',
            'dt',
            'em',
            'embed',
            'fieldset',
            'figcaption',
            'figure',
            'footer',
            'form',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'head',
            'header',
            'hr',
            'html',
            'i',
            'iframe',
            'img',
            'input',
            'ins',
            'kbd',
            'keygen',
            'label',
            'legend',
            'li',
            'link',
            'main',
            'map',
            'mark',
            'menu',
            'menuitem',
            'meta',
            'meter',
            'nav',
            'noscript',
            'object',
            'ol',
            'optgroup',
            'option',
            'output',
            'p',
            'param',
            'picture',
            'pre',
            'progress',
            'q',
            'rp',
            'rt',
            'ruby',
            's',
            'samp',
            'script',
            'section',
            'select',
            'small',
            'source',
            'span',
            'strong',
            'style',
            'sub',
            'summary',
            'sup',
            'table',
            'tbody',
            'td',
            'template',
            'textarea',
            'tfoot',
            'th',
            'thead',
            'time',
            'title',
            'tr',
            'track',
            'u',
            'ul',
            'var',
            'video',
            'wbr'
        ]

        // 创建匹配标准HTML标签的正则表达式
        const htmlTagPattern = new RegExp(`<(${html5Tags.join('|')})(\\s[^>]*?)?>`, 'gi')

        // 找到所有HTML标签
        let tagMatch
        const htmlTagsWithAttributes = []

        while ((tagMatch = htmlTagPattern.exec(content)) !== null) {
            const tagName = tagMatch[1].toLowerCase()
            const attributes = tagMatch[2] || ''

            // 检查这些标签上的事件属性
            const eventAttributePattern = /\s(on[a-z]+)\s*=/gi
            let eventMatch
            const foundEvents = new Set()

            while ((eventMatch = eventAttributePattern.exec(attributes)) !== null) {
                foundEvents.add(eventMatch[1].toLowerCase())
            }

            if (foundEvents.size > 0) {
                foundEvents.forEach((event) => {
                    htmlTagsWithAttributes.push({
                        tagName: tagName,
                        event: event,
                        index: tagMatch.index
                    })
                })
            }
        }

        // 为找到的事件属性添加错误
        htmlTagsWithAttributes.forEach((tagWithEvent) => {
            errors.push({
                type: 'forbidden_event_attribute',
                message: `HTML标签 <${tagWithEvent.tagName}> 中不允许使用事件属性: ${tagWithEvent.event}`,
                severity: 'error',
                section: 'template'
            })
        })

        // 检查模板指令的正确性
        if (section.directives) {
            section.directives.forEach((directive) => {
                switch (directive.type) {
                    case 'if_directive':
                        if (!directive.condition || directive.condition.trim() === '') {
                            errors.push({
                                type: 'empty_condition',
                                message: 'if指令的条件不能为空',
                                severity: 'error',
                                section: 'template'
                            })
                        }
                        break
                    case 'each_directive':
                        if (!directive.array || !directive.item) {
                            errors.push({
                                type: 'invalid_each_directive',
                                message: 'each指令缺少必要的参数',
                                severity: 'error',
                                section: 'template'
                            })
                        }
                        break
                    case 'client_component':
                        if (!SUPPORTED_CLIENT_TYPES.includes(directive.clientType)) {
                            errors.push({
                                type: 'invalid_client_type',
                                message: `不支持的客户端组件类型: ${directive.clientType}，支持的类型: ${SUPPORTED_CLIENT_TYPES.join(', ')}`,
                                severity: 'error',
                                section: 'template'
                            })
                        }
                        break
                }
            })
        }

        return errors
    }

    /**
     * 验证Style section
     * @param {Object} section - Style section
     * @returns {Array} 错误列表
     */
    validateStyleSection(section) {
        const errors = []

        // 检查SCSS语法的基本错误
        const content = section.content

        // 检查未闭合的大括号
        const openBraces = (content.match(/\{/g) || []).length
        const closeBraces = (content.match(/\}/g) || []).length

        if (openBraces !== closeBraces) {
            errors.push({
                type: 'unmatched_braces',
                message: '样式中存在未匹配的大括号',
                severity: 'error',
                section: 'style'
            })
        }

        return errors
    }

    /**
     * 格式化错误信息
     * @param {Array} errors - 错误列表
     * @returns {string} 格式化的错误信息
     */
    formatErrors(errors) {
        return errors
            .map((error) => {
                const pos = error.start
                    ? `Line ${error.start.row + 1}, Column ${error.start.column + 1}`
                    : 'Unknown position'
                return `${error.type}: ${error.message} (${pos})`
            })
            .join('\n')
    }
}

module.exports = RSXParser
