const Parser = require('tree-sitter');
const Rust = require('tree-sitter-rust');
const TypeScript = require('tree-sitter-typescript').typescript;
const HTML = require('tree-sitter-html');
const SCSS = require('tree-sitter-scss');

class RSXParser {
    constructor() {
        // 初始化各种语言的解析器
        this.rustParser = new Parser();
        this.rustParser.setLanguage(Rust);

        this.tsParser = new Parser();
        this.tsParser.setLanguage(TypeScript);

        this.htmlParser = new Parser();
        this.htmlParser.setLanguage(HTML);

        this.scssParser = new Parser();
        this.scssParser.setLanguage(SCSS);
    }

    /**
     * 解析RSX文件内容
     * @param {string} content - RSX文件内容
     * @returns {Object} 解析结果
     */
    parse(content) {
        const sections = this.extractSections(content);
        const result = {
            type: 'rsx_file',
            sections: [],
            errors: []
        };

        // 解析Rust部分
        if (sections.rust) {
            try {
                const rustTree = this.rustParser.parse(sections.rust.content);
                result.sections.push({
                    type: 'rust_section',
                    start: sections.rust.start,
                    end: sections.rust.end,
                    content: sections.rust.content,
                    ast: rustTree.rootNode,
                    errors: this.extractErrors(rustTree)
                });
            } catch (error) {
                result.errors.push({
                    type: 'rust_parse_error',
                    message: error.message,
                    start: sections.rust.start
                });
            }
        }

        // 解析Script部分
        if (sections.script) {
            try {
                const tsTree = this.tsParser.parse(sections.script.content);
                result.sections.push({
                    type: 'script_section',
                    start: sections.script.start,
                    end: sections.script.end,
                    content: sections.script.content,
                    ast: tsTree.rootNode,
                    errors: this.extractErrors(tsTree)
                });
            } catch (error) {
                result.errors.push({
                    type: 'script_parse_error',
                    message: error.message,
                    start: sections.script.start
                });
            }
        }

        // 解析Template部分
        if (sections.template) {
            try {
                const templateResult = this.parseTemplate(sections.template.content);
                result.sections.push({
                    type: 'template_section',
                    start: sections.template.start,
                    end: sections.template.end,
                    content: sections.template.content,
                    ast: templateResult.ast,
                    directives: templateResult.directives,
                    errors: templateResult.errors
                });
            } catch (error) {
                result.errors.push({
                    type: 'template_parse_error',
                    message: error.message,
                    start: sections.template.start
                });
            }
        }

        // 解析Style部分
        if (sections.style) {
            try {
                const scssTree = this.scssParser.parse(sections.style.content);
                result.sections.push({
                    type: 'style_section',
                    start: sections.style.start,
                    end: sections.style.end,
                    content: sections.style.content,
                    ast: scssTree.rootNode,
                    errors: this.extractErrors(scssTree)
                });
            } catch (error) {
                result.errors.push({
                    type: 'style_parse_error',
                    message: error.message,
                    start: sections.style.start
                });
            }
        }

        // 执行结构验证
        const validationErrors = this.validateRSXStructure(result);
        result.errors = result.errors.concat(validationErrors);

        return result;
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
        };

        // 统计section类型
        parseResult.sections.forEach(section => {
            const type = section.type;
            stats.sectionTypes[type] = (stats.sectionTypes[type] || 0) + 1;

            // 统计模板指令
            if (section.directives) {
                stats.directiveCount += section.directives.length;
                section.directives.forEach(directive => {
                    const dirType = directive.type;
                    stats.directiveTypes[dirType] = (stats.directiveTypes[dirType] || 0) + 1;
                });
            }
        });

        // 统计错误类型
        parseResult.errors.forEach(error => {
            const type = error.type;
            stats.errorTypes[type] = (stats.errorTypes[type] || 0) + 1;
        });

        return stats;
    }

    /**
     * 生成解析报告
     * @param {Object} parseResult - 解析结果
     * @returns {string} 格式化的报告
     */
    generateReport(parseResult) {
        const stats = this.getParseStatistics(parseResult);
        let report = '=== RSX 解析报告 ===\n\n';

        report += `文件结构:\n`;
        report += `- 总section数: ${stats.totalSections}\n`;
        Object.entries(stats.sectionTypes).forEach(([type, count]) => {
            report += `- ${type}: ${count}\n`;
        });

        if (stats.directiveCount > 0) {
            report += `\n模板指令:\n`;
            report += `- 总指令数: ${stats.directiveCount}\n`;
            Object.entries(stats.directiveTypes).forEach(([type, count]) => {
                report += `- ${type}: ${count}\n`;
            });
        }

        if (stats.totalErrors > 0) {
            report += `\n错误统计:\n`;
            report += `- 总错误数: ${stats.totalErrors}\n`;
            Object.entries(stats.errorTypes).forEach(([type, count]) => {
                report += `- ${type}: ${count}\n`;
            });

            report += `\n详细错误:\n`;
            parseResult.errors.forEach((error, index) => {
                report += `${index + 1}. [${error.severity || 'error'}] ${error.type}: ${error.message}\n`;
                if (error.section) {
                    report += `   位置: ${error.section} section\n`;
                }
            });
        } else {
            report += `\n✅ 没有发现错误\n`;
        }

        return report;
    }

    /**
     * 从RSX内容中提取各个部分
     * @param {string} content - RSX文件内容
     * @returns {Object} 各部分内容
     */
    extractSections(content) {
        const sections = {};

        // 提取Rust部分
        const rustMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*$/m);
        if (rustMatch) {
            const start = content.indexOf(rustMatch[0]);
            sections.rust = {
                content: rustMatch[1],
                start: start,
                end: start + rustMatch[0].length
            };
        }

        // 提取Script部分
        const scriptMatch = content.match(/<script>\s*\n?([\s\S]*?)\n?\s*<\/script>/);
        if (scriptMatch) {
            const start = content.indexOf(scriptMatch[0]);
            sections.script = {
                content: scriptMatch[1],
                start: start,
                end: start + scriptMatch[0].length
            };
        }

        // 提取Template部分
        const templateMatch = content.match(/<template>\s*\n?([\s\S]*?)\n?\s*<\/template>/);
        if (templateMatch) {
            const start = content.indexOf(templateMatch[0]);
            sections.template = {
                content: templateMatch[1],
                start: start,
                end: start + templateMatch[0].length
            };
        }

        // 提取Style部分
        const styleMatch = content.match(/<style>\s*\n?([\s\S]*?)\n?\s*<\/style>/);
        if (styleMatch) {
            const start = content.indexOf(styleMatch[0]);
            sections.style = {
                content: styleMatch[1],
                start: start,
                end: start + styleMatch[0].length
            };
        }

        return sections;
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
        };

        // 先处理模板指令
        const processedContent = this.preprocessTemplate(content, result.directives);

        try {
            // 使用HTML解析器解析处理后的内容
            const htmlTree = this.htmlParser.parse(processedContent);
            result.ast = htmlTree.rootNode;
            result.errors = result.errors.concat(this.extractErrors(htmlTree));
        } catch (error) {
            result.errors.push({
                type: 'html_parse_error',
                message: error.message
            });
        }

        return result;
    }

    /**
     * 预处理Template内容，提取模板指令
     * @param {string} content - 原始模板内容
     * @param {Array} directives - 用于存储指令的数组
     * @returns {string} 处理后的HTML内容
     */
    preprocessTemplate(content, directives) {
        let processedContent = content;

        // 处理文本插值 {{ expression }}
        processedContent = processedContent.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, expression, offset) => {
            const parsedExpression = this.parseExpression(expression.trim());
            directives.push({
                type: 'interpolation',
                expression: expression.trim(),
                parsedExpression: parsedExpression,
                start: offset,
                end: offset + match.length,
                original: match
            });
            return `<!-- INTERPOLATION_${directives.length - 1} -->`;
        });

        // 处理复杂的条件指令，支持嵌套的 else if
        processedContent = this.processIfDirectives(processedContent, directives);

        // 处理循环指令 {#each array as item, index}
        processedContent = processedContent.replace(
            /\{#each\s+([\w.]+)\s+as\s+(\w+)(?:,\s*(\w+))?\}([\s\S]*?)\{\/each\}/g,
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
                });
                return `<!-- EACH_DIRECTIVE_${directives.length - 1} -->`;
            }
        );

        // 处理Raw HTML指令 {{@html content}}
        processedContent = processedContent.replace(/\{\{@html\s+([\w.]+)\}\}/g, (match, content, offset) => {
            directives.push({
                type: 'raw_html_directive',
                content: content,
                start: offset,
                end: offset + match.length,
                original: match
            });
            return `<!-- RAW_HTML_${directives.length - 1} -->`;
        });

        // 处理客户端组件
        processedContent = this.processClientComponents(processedContent, directives);

        return processedContent;
    }

    /**
     * 处理复杂的if指令，支持多个else if分支
     * @param {string} content - 模板内容
     * @param {Array} directives - 指令数组
     * @returns {string} 处理后的内容
     */
    processIfDirectives(content, directives) {
        // 使用递归方式处理嵌套的if指令
        const ifPattern = /\{#if\s+([^}]+)\}([\s\S]*?)\{\/if\}/g;

        return content.replace(ifPattern, (match, condition, body, offset) => {
            const ifDirective = {
                type: 'if_directive',
                condition: condition.trim(),
                branches: [],
                start: offset,
                end: offset + match.length,
                original: match
            };

            // 解析if分支体，查找else if和else
            let currentBody = body;
            let currentCondition = condition.trim();

            // 添加主if分支
            const elseIfPattern = /\{:else\s+if\s+([^}]+)\}/g;
            const elsePattern = /\{:else\}/g;

            let parts = currentBody.split(/\{:else(?:\s+if\s+[^}]+)?\}/);
            let matches = [...currentBody.matchAll(/\{:else(?:\s+if\s+([^}]+))?\}/g)];

            // 主if分支
            ifDirective.branches.push({
                type: 'if',
                condition: currentCondition,
                body: parts[0] ? parts[0].trim() : ''
            });

            // 处理else if和else分支
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const elseIfCondition = match[1];
                const branchBody = parts[i + 1] ? parts[i + 1].trim() : '';

                if (elseIfCondition) {
                    // else if分支
                    ifDirective.branches.push({
                        type: 'else_if',
                        condition: elseIfCondition.trim(),
                        body: branchBody
                    });
                } else {
                    // else分支
                    ifDirective.branches.push({
                        type: 'else',
                        body: branchBody
                    });
                }
            }

            directives.push(ifDirective);
            return `<!-- IF_DIRECTIVE_${directives.length - 1} -->`;
        });
    }

    /**
     * 处理客户端组件
     * @param {string} content - 模板内容
     * @param {Array} directives - 指令数组
     * @returns {string} 处理后的内容
     */
    processClientComponents(content, directives) {
        // 匹配带有client属性的组件
        const clientComponentPattern = /<(\w+)([^>]*?client\s*=\s*["']([^"']+)["'][^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;

        return content.replace(clientComponentPattern, (match, tagName, attributes, clientType, children, offset) => {
            const component = {
                type: 'client_component',
                tagName: tagName,
                clientType: clientType, // react, vue, svelte
                attributes: this.parseAttributes(attributes),
                children: children ? children.trim() : '',
                start: offset,
                end: offset + match.length,
                original: match
            };

            directives.push(component);
            return `<!-- CLIENT_COMPONENT_${directives.length - 1} -->`;
        });
    }

    /**
     * 解析HTML属性
     * @param {string} attributeString - 属性字符串
     * @returns {Object} 解析后的属性对象
     */
    parseAttributes(attributeString) {
        const attributes = {};
        const attrPattern = /(\w+)(?:\s*=\s*["']([^"']*)["'])?/g;

        let match = attrPattern.exec(attributeString);
        while (match !== null) {
            const [, name, value] = match;
            attributes[name] = value || true;
            match = attrPattern.exec(attributeString);
        }

        return attributes;
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
        };

        // 检查是否是条件表达式 (三元运算符)
        if (expression.includes('?') && expression.includes(':')) {
            const ternaryMatch = expression.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
            if (ternaryMatch) {
                result.type = 'conditional';
                result.condition = ternaryMatch[1].trim();
                result.trueValue = ternaryMatch[2].trim();
                result.falseValue = ternaryMatch[3].trim();
                return result;
            }
        }

        // 检查是否是属性访问
        if (expression.includes('.')) {
            result.type = 'property_access';
            result.parts = expression.split('.');
            return result;
        }

        // 检查是否是函数调用
        if (expression.includes('(') && expression.includes(')')) {
            const funcMatch = expression.match(/^([\w.]+)\((.*)\)$/);
            if (funcMatch) {
                result.type = 'function_call';
                result.function = funcMatch[1];
                result.arguments = funcMatch[2] ? funcMatch[2].split(',').map(arg => arg.trim()) : [];
                return result;
            }
        }

        // 检查是否是二元表达式
        const binaryOperators = ['>', '<', '>=', '<=', '==', '!=', '&&', '||', '+', '-', '*', '/'];
        for (const op of binaryOperators) {
            if (expression.includes(op)) {
                const parts = expression.split(op);
                if (parts.length === 2) {
                    result.type = 'binary_expression';
                    result.operator = op;
                    result.left = parts[0].trim();
                    result.right = parts[1].trim();
                    return result;
                }
            }
        }

        // 简单标识符
        result.type = 'identifier';
        result.name = expression;
        return result;
    }

    /**
     * 从Tree-sitter树中提取错误
     * @param {Tree} tree - Tree-sitter解析树
     * @returns {Array} 错误列表
     */
    extractErrors(tree) {
        const errors = [];

        function walk(node) {
            if (node.hasError) {
                errors.push({
                    type: 'syntax_error',
                    message: `语法错误在 ${node.type}`,
                    start: node.startPosition,
                    end: node.endPosition,
                    severity: 'error'
                });
            }

            // 检查缺失的节点
            if (node.isMissing) {
                errors.push({
                    type: 'missing_node',
                    message: `缺失节点: ${node.type}`,
                    start: node.startPosition,
                    end: node.endPosition,
                    severity: 'error'
                });
            }

            for (let child of node.children) {
                walk(child);
            }
        }

        walk(tree.rootNode);
        return errors;
    }

    /**
     * 验证RSX文件结构
     * @param {Object} parseResult - 解析结果
     * @returns {Array} 验证错误列表
     */
    validateRSXStructure(parseResult) {
        const errors = [];
        const sections = parseResult.sections;

        // 检查是否有重复的section
        const sectionTypes = sections.map(s => s.type);
        const duplicates = sectionTypes.filter((type, index) => sectionTypes.indexOf(type) !== index);

        duplicates.forEach(type => {
            errors.push({
                type: 'duplicate_section',
                message: `重复的section: ${type}`,
                severity: 'warning'
            });
        });

        // 验证各个section的内容
        sections.forEach(section => {
            switch (section.type) {
                case 'rust_section':
                    errors.push(...this.validateRustSection(section));
                    break;
                case 'script_section':
                    errors.push(...this.validateScriptSection(section));
                    break;
                case 'template_section':
                    errors.push(...this.validateTemplateSection(section));
                    break;
                case 'style_section':
                    errors.push(...this.validateStyleSection(section));
                    break;
            }
        });

        return errors;
    }

    /**
     * 验证Rust section
     * @param {Object} section - Rust section
     * @returns {Array} 错误列表
     */
    validateRustSection(section) {
        const errors = [];

        // 检查是否包含get_server_side_props函数
        if (!section.content.includes('get_server_side_props')) {
            errors.push({
                type: 'missing_server_props',
                message: 'Rust section应该包含get_server_side_props函数',
                severity: 'warning',
                section: 'rust'
            });
        }

        // 检查函数签名
        const funcPattern = /async\s+fn\s+get_server_side_props\s*\([^)]*\)\s*->\s*Response/;
        if (section.content.includes('get_server_side_props') && !funcPattern.test(section.content)) {
            errors.push({
                type: 'invalid_function_signature',
                message: 'get_server_side_props函数签名不正确',
                severity: 'error',
                section: 'rust'
            });
        }

        return errors;
    }

    /**
     * 验证Script section
     * @param {Object} section - Script section
     * @returns {Array} 错误列表
     */
    validateScriptSection(section) {
        const errors = [];

        // 检查是否使用了defineProps
        if (!section.content.includes('defineProps')) {
            errors.push({
                type: 'missing_define_props',
                message: 'Script section建议使用defineProps定义组件属性',
                severity: 'info',
                section: 'script'
            });
        }

        // 检查TypeScript接口定义
        const interfacePattern = /interface\s+\w+\s*\{[\s\S]*?\}/g;
        const interfaces = section.content.match(interfacePattern);

        if (interfaces) {
            interfaces.forEach(interfaceStr => {
                // 简单检查接口是否有属性
                if (!interfaceStr.includes(':')) {
                    errors.push({
                        type: 'empty_interface',
                        message: '接口定义为空或格式不正确',
                        severity: 'warning',
                        section: 'script'
                    });
                }
            });
        }

        return errors;
    }

    /**
     * 验证Template section
     * @param {Object} section - Template section
     * @returns {Array} 错误列表
     */
    validateTemplateSection(section) {
        const errors = [];

        // 检查模板指令的正确性
        if (section.directives) {
            section.directives.forEach(directive => {
                switch (directive.type) {
                    case 'if_directive':
                        if (!directive.condition || directive.condition.trim() === '') {
                            errors.push({
                                type: 'empty_condition',
                                message: 'if指令的条件不能为空',
                                severity: 'error',
                                section: 'template'
                            });
                        }
                        break;
                    case 'each_directive':
                        if (!directive.array || !directive.item) {
                            errors.push({
                                type: 'invalid_each_directive',
                                message: 'each指令缺少必要的参数',
                                severity: 'error',
                                section: 'template'
                            });
                        }
                        break;
                    case 'client_component':
                        if (!['react', 'vue', 'svelte'].includes(directive.clientType)) {
                            errors.push({
                                type: 'invalid_client_type',
                                message: `不支持的客户端组件类型: ${directive.clientType}`,
                                severity: 'error',
                                section: 'template'
                            });
                        }
                        break;
                }
            });
        }

        return errors;
    }

    /**
     * 验证Style section
     * @param {Object} section - Style section
     * @returns {Array} 错误列表
     */
    validateStyleSection(section) {
        const errors = [];

        // 检查SCSS语法的基本错误
        const content = section.content;

        // 检查未闭合的大括号
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;

        if (openBraces !== closeBraces) {
            errors.push({
                type: 'unmatched_braces',
                message: '样式中存在未匹配的大括号',
                severity: 'error',
                section: 'style'
            });
        }

        return errors;
    }

    /**
     * 格式化错误信息
     * @param {Array} errors - 错误列表
     * @returns {string} 格式化的错误信息
     */
    formatErrors(errors) {
        return errors.map(error => {
            const pos = error.start ? `Line ${error.start.row + 1}, Column ${error.start.column + 1}` : 'Unknown position';
            return `${error.type}: ${error.message} (${pos})`;
        }).join('\n');
    }
}

module.exports = RSXParser;
