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

        return result;
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
            directives.push({
                type: 'interpolation',
                expression: expression.trim(),
                start: offset,
                end: offset + match.length,
                original: match
            });
            return `<!-- INTERPOLATION_${directives.length - 1} -->`;
        });

        // 处理条件指令 {#if} {:else if} {:else} {/if}
        processedContent = processedContent.replace(
            /\{#if\s+([^}]+)\}([\s\S]*?)(?:\{:else\s+if\s+([^}]+)\}([\s\S]*?))*(?:\{:else\}([\s\S]*?))?\{\/if\}/g,
            (match, condition, thenBody, elseIfCondition, elseIfBody, elseBody, offset) => {
                directives.push({
                    type: 'if_directive',
                    condition: condition.trim(),
                    thenBody: thenBody ? thenBody.trim() : '',
                    elseIfCondition: elseIfCondition ? elseIfCondition.trim() : null,
                    elseIfBody: elseIfBody ? elseIfBody.trim() : null,
                    elseBody: elseBody ? elseBody.trim() : null,
                    start: offset,
                    end: offset + match.length,
                    original: match
                });
                return `<!-- IF_DIRECTIVE_${directives.length - 1} -->`;
            }
        );

        // 处理循环指令 {#each array as item, index}
        processedContent = processedContent.replace(
            /\{#each\s+(\w+)\s+as\s+(\w+)(?:,\s*(\w+))?\}([\s\S]*?)\{\/each\}/g,
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
        processedContent = processedContent.replace(/\{\{@html\s+(\w+)\}\}/g, (match, content, offset) => {
            directives.push({
                type: 'raw_html_directive',
                content: content,
                start: offset,
                end: offset + match.length,
                original: match
            });
            return `<!-- RAW_HTML_${directives.length - 1} -->`;
        });

        return processedContent;
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
                    message: `Syntax error at ${node.type}`,
                    start: node.startPosition,
                    end: node.endPosition
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
