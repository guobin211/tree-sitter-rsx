// rsx-parser.d.ts
import type { Parser, Tree, SyntaxNode, Point } from 'tree-sitter';

/**
 * 表示代码中的一个位置点
 */
export interface Position {
    row: number;
    column: number;
}

/**
 * 表示解析过程中遇到的错误
 */
export interface ParseError {
    type: string;
    message: string;
    start?: Position | number;
    end?: Position;
}

/**
 * 表示从 Tree-sitter 树中提取的语法错误
 */
export interface SyntaxError extends ParseError {
    type: 'syntax_error';
    message: string;
    start: Point;
    end: Point;
}

/**
 * 表示一个代码区块的基本内容
 */
export interface SectionContent {
    content: string;
    start: number;
    end: number;
}

/**
 * 表示一个已解析的代码区块
 */
export interface ParsedSection extends SectionContent {
    type: 'rust_section' | 'script_section' | 'style_section';
    ast: SyntaxNode;
    errors: SyntaxError[];
}

/**
 * 表示模板中的一个指令
 */
export interface Directive {
    type: string;
    start: number;
    end: number;
    original: string;
}

/**
 * 文本插值指令 {{ expression }}
 */
export interface InterpolationDirective extends Directive {
    type: 'interpolation';
    expression: string;
}

/**
 * 条件指令 {#if} ... {/if}
 */
export interface IfDirective extends Directive {
    type: 'if_directive';
    condition: string;
    thenBody: string;
    elseIfCondition: string | null;
    elseIfBody: string | null;
    elseBody: string | null;
}

/**
 * 循环指令 {#each} ... {/each}
 */
export interface EachDirective extends Directive {
    type: 'each_directive';
    array: string;
    item: string;
    index: string | null;
    body: string;
}

/**
 * Raw HTML 指令 {{@html content}}
 */
export interface RawHTMLDirective extends Directive {
    type: 'raw_html_directive';
    content: string;
}

export type AnyDirective = InterpolationDirective | IfDirective | EachDirective | RawHTMLDirective;

/**
 * 表示已解析的模板区块
 */
export interface TemplateSection extends SectionContent {
    type: 'template_section';
    ast: SyntaxNode | null;
    directives: AnyDirective[];
    errors: ParseError[];
}

/**
 * 表示从 RSX 文件中提取的各个区块
 */
export interface ExtractedSections {
    rust?: SectionContent;
    script?: SectionContent;
    template?: SectionContent;
    style?: SectionContent;
}

/**
 * 表示一个完整的、已解析的 RSX 文件
 */
export interface RSXFile {
    type: 'rsx_file';
    sections: (ParsedSection | TemplateSection)[];
    errors: ParseError[];
}

/**
 * 解析 RSX 文件，将其分解为 Rust、TypeScript(script)、HTML(template) 和 SCSS(style) 部分。
 */
export default class RSXParser {
    rustParser: Parser;
    tsParser: Parser;
    htmlParser: Parser;
    scssParser: Parser;

    constructor();

    /**
     * 解析RSX文件内容
     * @param content - RSX文件内容
     * @returns 解析结果对象
     */
    parse(content: string): RSXFile;

    /**
     * 从RSX内容中提取各个部分
     * @param content - RSX文件内容
     * @returns 包含各部分内容的对象
     */
    extractSections(content: string): ExtractedSections;

    /**
     * 解析Template部分，处理模板指令
     * @param content - Template内容
     * @returns 解析结果
     */
    parseTemplate(content: string): {
        ast: SyntaxNode | null;
        directives: AnyDirective[];
        errors: ParseError[];
    };

    /**
     * 预处理Template内容，提取模板指令并替换为占位符
     * @param content - 原始模板内容
     * @param directives - 用于存储提取出的指令的数组
     * @returns 处理后的HTML内容
     */
    preprocessTemplate(content: string, directives: AnyDirective[]): string;

    /**
     * 从Tree-sitter树中提取错误
     * @param tree - Tree-sitter解析树
     * @returns 错误列表
     */
    extractErrors(tree: Tree): SyntaxError[];

    /**
     * 格式化错误信息
     * @param errors - 错误列表
     * @returns 格式化的错误信息字符串
     */
    formatErrors(errors: ParseError[]): string;
}
