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
 * 表达式类型
 */
export type ExpressionType = 
    | 'unknown' 
    | 'conditional' 
    | 'function_call' 
    | 'binary_expression' 
    | 'unary_expression' 
    | 'property_access' 
    | 'identifier'
    | 'string_literal'
    | 'number_literal'
    | 'boolean_literal'

/**
 * 二元运算符类型
 */
export type BinaryOperatorType = 
    | 'logical_or' 
    | 'logical_and' 
    | 'equality' 
    | 'comparison' 
    | 'additive' 
    | 'multiplicative'

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
    type: ExpressionType
    raw: string
    parts?: string[]
    // 条件表达式
    condition?: string
    trueValue?: string
    falseValue?: string
    // 函数调用
    function?: string
    parsedFunction?: ParsedExpression
    arguments?: string[]
    parsedArguments?: ParsedExpression[]
    // 二元表达式
    operator?: string
    operatorType?: BinaryOperatorType
    left?: string
    right?: string
    parsedLeft?: ParsedExpression
    parsedRight?: ParsedExpression
    // 一元表达式
    operand?: string
    parsedOperand?: ParsedExpression
    // 属性访问
    object?: string
    property?: string
    // 标识符
    name?: string
    // 字面量
    value?: string | number | boolean
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
 * 条件指令 {{@if}} ... {{/if}}
 */
export interface IfDirective extends Directive {
    type: 'if_directive'
    condition: string
    branches: ConditionBranch[]
}

/**
 * 循环指令 {{@each array as item, index}} ... {{/each}}
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
 * RSX 解析器
 * 
 * 解析 RSX 文件，将其分解为 Rust、TypeScript(script)、HTML(template) 和 SCSS(style) 部分。
 * 
 * RSX 语法规范:
 * - 条件渲染: {{@if condition}}...{{:else if condition}}...{{:elseif condition}}...{{:else}}...{{/if}}
 * - 列表渲染: {{@each array as item, index}}...{{/each}}
 * - 原始HTML: {{@html content}}
 * - 文本插值: {{ expression }}
 * - 客户端组件: <ComponentName client="react|vue|svelte" />
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
     * 处理if指令
     * 语法: {{@if condition}}...{{:else if condition}}...{{:elseif condition}}...{{:else}}...{{/if}}
     */
    processIfDirectives(content: string, directives: AnyDirective[]): string

    /**
     * 递归处理分支内容中的嵌套指令
     */
    preprocessBranchContent(content: string, directives: AnyDirective[]): string

    /**
     * 处理客户端组件
     */
    processClientComponents(content: string, directives: AnyDirective[]): string

    /**
     * 解析表达式
     */
    parseExpression(expression: string): ParsedExpression

    /**
     * 解析三元表达式
     */
    parseTernaryExpression(expression: string): ParsedExpression | null

    /**
     * 解析二元表达式
     */
    parseBinaryExpression(expression: string): ParsedExpression | null

    /**
     * 解析函数调用表达式
     */
    parseCallExpression(expression: string): ParsedExpression | null

    /**
     * 解析参数列表
     */
    parseArgumentList(argsString: string): string[]

    /**
     * 解析HTML属性
     */
    parseAttributes(attributeString: string): Record<string, string | boolean>

    /**
     * 从Tree-sitter树中提取错误
     */
    extractErrors(tree: Tree): SyntaxError[]

    /**
     * 验证RSX文件结构
     */
    validateRSXStructure(parseResult: RSXFile): ParseError[]

    /**
     * 检查重复的section
     */
    checkDuplicateSections(content: string): ParseError[]

    /**
     * 验证Rust section
     */
    validateRustSection(section: ParsedSection): ParseError[]

    /**
     * 验证Script section
     */
    validateScriptSection(section: ParsedSection): ParseError[]

    /**
     * 验证Template section
     */
    validateTemplateSection(section: TemplateSection): ParseError[]

    /**
     * 验证Style section
     */
    validateStyleSection(section: ParsedSection): ParseError[]

    /**
     * 格式化错误信息
     */
    formatErrors(errors: ParseError[]): string
}
