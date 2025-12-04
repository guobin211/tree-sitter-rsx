# RSX Parser 使用指南

## 安装

```bash
npm install
```

## 快速开始

```javascript
const RSXParser = require('./src/rsx-parser')

const parser = new RSXParser()
const result = parser.parse(rsxContent)
```

## API

### `parse(content: string): RSXFile`

解析 RSX 文件内容，返回结构化的解析结果。

```javascript
const result = parser.parse(rsxContent)
// result.sections - 各部分解析结果
// result.errors - 错误列表
```

### `getParseStatistics(parseResult: RSXFile): ParseStatistics`

获取解析统计信息。

```javascript
const stats = parser.getParseStatistics(result)
// stats.totalSections - Section 总数
// stats.directiveCount - 指令总数
// stats.totalErrors - 错误总数
```

### `generateReport(parseResult: RSXFile): string`

生成格式化的解析报告。

```javascript
const report = parser.generateReport(result)
console.log(report)
```

## 解析结果结构

```typescript
interface RSXFile {
    type: 'rsx_file'
    sections: Section[]
    errors: ParseError[]
}

interface Section {
    type: 'rust_section' | 'script_section' | 'template_section' | 'style_section'
    content: string
    ast: SyntaxNode
    directives?: Directive[]  // 仅 template_section
    errors: ParseError[]
}
```

## 指令类型

- `interpolation` - 文本插值 `{{ expression }}`
- `if_directive` - 条件指令 `{{#if}}...{{/if}}`
- `each_directive` - 循环指令 `{{#each}}` 或 `{{@each}}`
- `raw_html_directive` - 原始 HTML `{{@html}}`
- `client_component` - 客户端组件

## 验证规则

Parser 会自动验证以下内容：

- **结构验证**: 检查重复 section、禁用标签
- **Rust 验证**: 检查 `get_server_side_props` 函数签名
- **Script 验证**: 检查 `defineProps` 使用
- **Template 验证**: 检查指令语法、客户端组件类型
- **Style 验证**: 检查大括号匹配

## 运行测试

```bash
node example/test-parser.js
```

## 项目结构

```
tree-sitter-rsx/
├── src/
│   ├── grammar.json      # Tree-sitter 语法规则
│   ├── node-types.json   # 节点类型定义
│   ├── rsx-parser.js     # 解析器实现
│   └── rsx-parser.d.ts   # TypeScript 类型定义
├── syntaxes/
│   ├── rsx.tmLanguage.json  # TextMate 语法高亮
│   └── rsx.snippets.json    # 代码片段
├── example/
│   ├── sample.rsx        # 示例文件
│   └── test-parser.js    # 测试脚本
├── language-configuration.json  # 语言配置
└── README.md             # RSX 语言规范
```

## 相关文档

- [README.md](./README.md) - RSX 语言规范
- [PARSER_CHECK_REPORT.md](./PARSER_CHECK_REPORT.md) - 测试报告
