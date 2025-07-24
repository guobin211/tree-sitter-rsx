# RSX Parser 使用指南

## 概述

这个项目提供了一个基于Tree-sitter的RSX语言解析器。RSX是一个全栈Web框架，支持在单个文件中混合使用Rust、TypeScript、HTML模板和CSS/SCSS。

## 解析器架构

### 1. Grammar.js 方法
使用Tree-sitter的标准语法定义文件，定义了RSX文件的基本结构：
- `rust_section`: Rust服务端代码部分
- `script_section`: JavaScript/TypeScript客户端代码部分  
- `template_section`: HTML模板部分（支持Handlebars语法）
- `style_section`: CSS/SCSS样式部分

### 2. 外部扫描器 (scanner.c)
实现了外部扫描器来处理复杂的多语言混合内容。

### 3. JavaScript包装器方法 (推荐)
使用现有的成熟tree-sitter解析器来处理各个代码块：
- `tree-sitter-rust`: 解析Rust代码
- `tree-sitter-typescript`: 解析TypeScript代码
- `tree-sitter-html`: 解析HTML结构
- `tree-sitter-scss`: 解析SCSS样式

## 安装依赖

```bash
npm install
```

## 使用方法

### 基本用法

```javascript
const RSXParser = require('./src/rsx-parser');

const parser = new RSXParser();
const rsxContent = `
---
async fn get_server_side_props(req: Request) -> Response {
    let data = fetch_data().await;
    Response::json!({"data": data})
}
---

<script>
const { users } = defineProps<{ users: User[] }>();
</script>

<template>
    <div>
        {#each users as user}
            <p>{{ user.name }}</p>
        {/each}
    </div>
</template>

<style>
div { padding: 20px; }
</style>
`;

const result = parser.parse(rsxContent);
console.log(result);
```

### 解析结果结构

```javascript
{
  type: 'rsx_file',
  sections: [
    {
      type: 'rust_section',
      start: 0,
      end: 120,
      content: 'async fn get_server_side_props...',
      ast: RustAST,
      errors: []
    },
    {
      type: 'script_section', 
      start: 122,
      end: 180,
      content: 'const { users } = defineProps...',
      ast: TypeScriptAST,
      errors: []
    },
    {
      type: 'template_section',
      start: 182,
      end: 280,
      content: '<div>...</div>',
      ast: HTMLAST,
      directives: [
        {
          type: 'each_directive',
          array: 'users',
          item: 'user',
          body: '<p>{{ user.name }}</p>'
        }
      ],
      errors: []
    },
    {
      type: 'style_section',
      start: 282,
      end: 320,
      content: 'div { padding: 20px; }',
      ast: SCSSAST,
      errors: []
    }
  ],
  errors: []
}
```

## 支持的模板语法

### 文本插值
```html
<h1>Hello, {{ name }}!</h1>
<span class="{{ isActive ? 'active' : 'inactive' }}">Status</span>
```

### 条件渲染
```html
{#if condition}
    <p>True branch</p>
{:else if otherCondition}
    <p>Else if branch</p>
{:else}
    <p>Else branch</p>
{/if}
```

### 列表渲染
```html
{#each items as item, index}
    <li data-index="{{ index }}">{{ item.name }}</li>
{/each}
```

### Raw HTML输出
```html
<div>{{@html rawContent}}</div>
```

## 运行测试

```bash
node example/test-parser.js
```

这将解析示例RSX文件并输出详细的解析结果。

## 文件结构

```
tree-sitter-rsx/
├── grammar.js              # Tree-sitter语法定义
├── src/
│   ├── scanner.c           # 外部扫描器（C语言）
│   └── rsx-parser.js       # JavaScript包装器解析器
├── example/
│   ├── sample.rsx          # 示例RSX文件
│   ├── test-parser.js      # 测试脚本
│   └── parse-result.json   # 解析结果输出
└── package.json            # 项目依赖
```

## 特性

✅ **多语言支持**: Rust + TypeScript + HTML + SCSS  
✅ **模板语法**: 支持Handlebars风格的模板指令  
✅ **错误报告**: 详细的语法错误信息  
✅ **AST输出**: 每个部分都提供完整的AST  
✅ **位置信息**: 准确的源码位置映射  
✅ **指令提取**: 自动提取和解析模板指令  

## 扩展

要添加新的语法支持，可以：

1. 修改 `grammar.js` 添加新的语法规则
2. 更新 `scanner.c` 处理新的token类型
3. 在 `rsx-parser.js` 中添加新的解析逻辑
4. 添加相应的Tree-sitter语言包依赖

## 注意事项

- 确保安装了所有依赖的tree-sitter语言包
- Rust部分需要有效的Rust语法
- TypeScript部分支持标准TS语法和类型注解
- 模板部分的HTML必须是有效的XML格式
- SCSS部分支持嵌套和变量语法

## 贡献

欢迎提交Issue和Pull Request来改进这个解析器！
