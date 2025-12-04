// rsx-parser.d.ts
import type { Parser, Tree, SyntaxNode, Point } from 'tree-sitter'

/**
 * 支持的客户端框架类型
 */
export type ClientType = 'react' | 'vue' | 'svelte'

/**
 * 错误严重级别
 */
export type ErrorSeverity = 'error' | 'warning' | 'info'

/**
 * Section 类型
 */
export type SectionType = 'rust_section' | 'script_section' | 'template_section' | 'style_section'

/**
 * 表示代码中的一个位置点
 */
export interface Position {
    row: number
    column: number
}

/**
 * 表示解析过程中遇到的错误
 */
export interface ParseError {
    type: string
    message: string
    start?: Position | number
    end?: Position
    severity?: ErrorSeverity
    section?: string
}

/**
 * 表示从 Tree-sitter 树中提取的语法错误
 */
export interface SyntaxError extends ParseError {
    type: 'syntax_error'
    message: string
    start: Point
    end: Point
}

/**
 * 表示一个代码区块的基本内容
 */
export interface SectionContent {
    content: string
    start: number
    end: number
    count?: number
}

/**
 * 表示一个已解析的代码区块
 */
export interface ParsedSection extends SectionContent {
    type: SectionType
    ast: SyntaxNode
    errors: SyntaxError[]
}

/**
 * 表示模板中的一个指令
 */
export interface Directive {
    type: string
    start: number
    end: number
    original: string
}

/**
 * 解析后的表达式
 */
export interface ParsedExpression {
    type: 'unknown' | 'conditional' | 'function_call' | 'binary_expression' | 'unary_expression' | 'property_access' | 'identifier'
    raw: string
    parts?: string[]
    condition?: string
    trueValue?: string
    falseValue?: string
    function?: string
    arguments?: string[]
    operator?: string
    operatorType?: string
    left?: string
    right?: string
    operand?: string
    name?: string
}

/**
 * 文本插值指令 {{ expression }}
 */
export interface InterpolationDirective extends Directive {
    type: 'interpolation'
    expression: string
    parsedExpression: ParsedExpression
}

/**
 * 条件分支
 */
export interface ConditionBranch {
    type: 'if' | 'else_if' | 'else'
    condition: string | null
    body: string
    processedBody?: string
}

/**
 * 条件指令 {#if} ... {/if}
 */
export interface IfDirective extends Directive {
    type: 'if_directive'
    condition: string
    branches: ConditionBranch[]
}

/**
 * 循环指令 {#each} 或 {{@each}}
 */
export interface EachDirective extends Directive {
    type: 'each_directive'
    array: string
    item: string
    index: string | null
    body: string
}

/**
 * Raw HTML 指令 {{@html content}}
 */
export interface RawHTMLDirective extends Directive {
    type: 'raw_html_directive'
    content: string
}

/**
 * 客户端组件
 */
export interface ClientComponentDirective extends Directive {
    type: 'client_component'
    tagName: string
    clientType: ClientType
    attributes: Record<string, string | boolean>
    children: string
}

export type AnyDirective = InterpolationDirective | IfDirective | EachDirective | RawHTMLDirective | ClientComponentDirective

/**
 * 表示已解析的模板区块
 */
export interface TemplateSection extends SectionContent {
    type: 'template_section'
    ast: SyntaxNode | null
    directives: AnyDirective[]
    errors: ParseError[]
}

/**
 * 表示从 RSX 文件中提取的各个区块
 */
export interface ExtractedSections {
    rust?: SectionContent
    script?: SectionContent
    template?: SectionContent
    style?: SectionContent
}

/**
 * 表示一个完整的、已解析的 RSX 文件
 */
export interface RSXFile {
    type: 'rsx_file'
    sections: (ParsedSection | TemplateSection)[]
    errors: ParseError[]
    originalContent?: string
}

/**
 * 解析统计信息
 */
export interface ParseStatistics {
    totalSections: number
    sectionTypes: Record<string, number>
    totalErrors: number
    errorTypes: Record<string, number>
    directiveCount: number
    directiveTypes: Record<string, number>
}

/**
 * 解析 RSX 文件，将其分解为 Rust、TypeScript(script)、HTML(template) 和 SCSS(style) 部分。
 */
export default class RSXParser {
    rustParser: Parser
    tsParser: Parser
    htmlParser: Parser
    scssParser: Parser

    constructor()

    /**
     * 解析RSX文件内容
     */
    parse(content: string): RSXFile

    /**
     * 获取解析统计信息
     */
    getParseStatistics(parseResult: RSXFile): ParseStatistics

    /**
     * 生成解析报告
     */
    generateReport(parseResult: RSXFile): string

    /**
     * 从RSX内容中提取各个部分
     */
    extractSections(content: string): ExtractedSections

    /**
     * 解析Template部分，处理模板指令
     */
    parseTemplate(content: string): {
        ast: SyntaxNode | null
        directives: AnyDirective[]
        errors: ParseError[]
    }

    /**
     * 预处理Template内容，提取模板指令并替换为占位符
     */
    preprocessTemplate(content: string, directives: AnyDirective[]): string

    /**
     * 解析表达式
     */
    parseExpression(expression: string): ParsedExpression

    /**
     * 从Tree-sitter树中提取错误
     */
    extractErrors(tree: Tree): SyntaxError[]

    /**
     * 验证RSX文件结构
     */
    validateRSXStructure(parseResult: RSXFile): ParseError[]

    /**
     * 格式化错误信息
     */
    formatErrors(errors: ParseError[]): string
}
