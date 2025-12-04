# rsx-parser

RSX 文件的 AST 解析器，用于将 RSX 文件转换为前端可用的 AST。

## 安装

```bash
npm install tree-sitter tree-sitter-rust tree-sitter-typescript tree-sitter-html tree-sitter-scss
```

## 使用

```javascript
const RSXParser = require('./parser')

const parser = new RSXParser()
const content = `
---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "message": "Hello"
    })
}
---

<script>
const { message } = defineProps<{ message: string }>()
</script>

<template>
    <div>{{ message }}</div>
</template>

<style>
div { color: red; }
</style>
`

const result = parser.parse(content)
console.log(parser.generateReport(result))
```

## RSX 语法规范

### 文件结构

RSX 文件包含四个可选的代码块，每种代码块最多出现一次：

- **Rust Section**: `---` ... `---` - 服务端 Rust 代码
- **Script Section**: `<script>` ... `</script>` - 客户端 TypeScript 代码
- **Template Section**: `<template>` ... `</template>` - HTML 模板
- **Style Section**: `<style>` ... `</style>` - SCSS 样式

### 模板指令

#### 条件渲染

```html
{{@if condition}}
    <p>条件为真时显示</p>
{{:else if anotherCondition}}
    <p>另一个条件为真时显示</p>
{{:elseif yetAnotherCondition}}
    <p>elseif 也支持（无空格）</p>
{{:else}}
    <p>所有条件都为假时显示</p>
{{/if}}
```

#### 列表渲染

```html
{{@each items as item, index}}
    <li>{{ index }}: {{ item.name }}</li>
{{/each}}
```

#### 原始 HTML

```html
{{@html rawHtmlContent}}
```

#### 文本插值

```html
<p>{{ message }}</p>
<p>{{ user.name }}</p>
<p>{{ formatDate(date) }}</p>
<p>{{ isActive ? 'Active' : 'Inactive' }}</p>
```

### 客户端组件

```html
<ReactApp client="react" users="{{ users }}" />
<VueChart client="vue" data="{{ chartData }}" />
<SvelteWidget client="svelte" items="{{ items }}" />
```

## API

### `parse(content: string): RSXFile`

解析 RSX 文件内容，返回解析结果。

### `getParseStatistics(parseResult: RSXFile): ParseStatistics`

获取解析统计信息。

### `generateReport(parseResult: RSXFile): string`

生成格式化的解析报告。

### `parseExpression(expression: string): ParsedExpression`

解析模板表达式。

### `validateRSXStructure(parseResult: RSXFile): ParseError[]`

验证 RSX 文件结构。

## 支持的表达式类型

- 标识符: `message`
- 属性访问: `user.name`, `data.items.length`
- 函数调用: `formatDate(date)`, `items.filter(x => x.active)`
- 二元表达式: `a + b`, `x > 0 && y < 10`, `a === b`
- 一元表达式: `!isActive`, `-value`
- 条件表达式: `condition ? trueValue : falseValue`
- 字面量: `"string"`, `'string'`, `123`, `true`, `false`

## 错误处理

解析器会检测以下错误：

- 重复的代码块
- 语法错误
- 无效的指令
- 不支持的客户端组件类型
- 模板中的禁用标签
- HTML 标签中的事件属性
