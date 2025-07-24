# 增强版RSX解析器使用指南

## 概述

增强版RSX解析器是基于README.md中的RSX语法规范开发的完整解析器，支持复杂的模板指令、客户端组件、错误验证和详细的解析报告。

## 主要功能

### 1. 完整的RSX文件解析
- **Rust Section**: 解析服务端逻辑，验证`get_server_side_props`函数
- **Script Section**: 解析TypeScript代码，检查`defineProps`使用
- **Template Section**: 解析HTML模板和指令
- **Style Section**: 解析SCSS样式

### 2. 增强的模板指令支持

#### 条件指令
```rsx
{#if user.isActive}
    <p>用户活跃</p>
{:else if user.isPending}
    <p>用户待审核</p>
{:else}
    <p>用户未激活</p>
{/if}
```

#### 循环指令
```rsx
{#each categories as category, index}
    <div class="category-{{ index }}">
        <h3>{{ category.name }}</h3>
        {#each category.items as item}
            <p>{{ item.name }} - ¥{{ item.price }}</p>
        {/each}
    </div>
{/each}
```

#### 客户端组件
```rsx
<ReactApp client="react" user="{{user}}" />
<VueChart client="vue" data="{{chartData}}" />
<SvelteWidget client="svelte" config="{{widgetConfig}}" />
```

#### Raw HTML
```rsx
<div class="content">
    {{@html user.bio}}
</div>
```

### 3. 表达式解析

支持多种表达式类型：
- **简单标识符**: `{{ name }}`
- **属性访问**: `{{ user.profile.name }}`
- **条件表达式**: `{{ isActive ? 'active' : 'inactive' }}`
- **函数调用**: `{{ formatPrice(item.price) }}`
- **二元表达式**: `{{ count > 0 }}`

### 4. 错误验证

#### 结构验证
- 检查重复的section
- 验证必要的函数和属性

#### 语法验证
- Rust函数签名检查
- TypeScript接口验证
- 模板指令完整性
- SCSS语法基本检查

#### 错误级别
- **error**: 严重错误，影响解析
- **warning**: 警告，建议修复
- **info**: 信息提示

## 使用方法

### 基本使用

```javascript
const RSXParser = require('./src/rsx-parser');

const parser = new RSXParser();
const result = parser.parse(rsxContent);

console.log('解析结果:', result);
```

### 获取统计信息

```javascript
const stats = parser.getParseStatistics(result);
console.log('统计信息:', stats);
```

### 生成解析报告

```javascript
const report = parser.generateReport(result);
console.log(report);
```

## 解析结果结构

```javascript
{
  type: 'rsx_file',
  sections: [
    {
      type: 'rust_section',
      content: '...',
      ast: TreeNode,
      errors: [...],
      start: 0,
      end: 100
    },
    {
      type: 'template_section',
      content: '...',
      ast: TreeNode,
      directives: [
        {
          type: 'if_directive',
          condition: 'user.isActive',
          branches: [
            { type: 'if', condition: '...', body: '...' },
            { type: 'else_if', condition: '...', body: '...' },
            { type: 'else', body: '...' }
          ]
        },
        {
          type: 'client_component',
          tagName: 'ReactApp',
          clientType: 'react',
          attributes: { user: '{{user}}' }
        }
      ],
      errors: [...]
    }
  ],
  errors: [...]
}
```

## 错误处理

### 常见错误类型

1. **syntax_error**: 语法错误
2. **missing_server_props**: 缺少服务端属性函数
3. **invalid_function_signature**: 函数签名不正确
4. **empty_condition**: 条件表达式为空
5. **invalid_client_type**: 不支持的客户端组件类型
6. **unmatched_braces**: 未匹配的大括号

### 错误信息格式

```javascript
{
  type: 'error_type',
  message: '错误描述',
  severity: 'error|warning|info',
  section: 'rust|script|template|style',
  start: { row: 0, column: 0 },
  end: { row: 0, column: 10 }
}
```

## 测试示例

运行增强测试：

```bash
cd example
node enhanced-test.js
```

这将解析一个复杂的RSX文件并生成详细的报告。

## 扩展功能

### 自定义验证规则

可以扩展验证器来添加自定义规则：

```javascript
class CustomRSXParser extends RSXParser {
    validateCustomRules(parseResult) {
        // 添加自定义验证逻辑
        return [];
    }
}
```

### 自定义指令处理

可以添加新的模板指令处理：

```javascript
preprocessTemplate(content, directives) {
    content = super.preprocessTemplate(content, directives);

    // 处理自定义指令
    content = content.replace(/\{#custom\s+([^}]+)\}/g, (match, params) => {
        // 自定义指令处理逻辑
        return processedContent;
    });

    return content;
}
```

## 性能优化

- 使用Tree-sitter进行高效的语法解析
- 缓存解析结果避免重复计算
- 增量解析支持（计划中）

## 兼容性

- Node.js 22+
- 支持所有主流操作系统
- 兼容Tree-sitter生态系统

## 贡献指南

欢迎提交Issue和Pull Request来改进RSX解析器。请确保：

1. 遵循现有的代码风格
2. 添加适当的测试用例
3. 更新相关文档

## 许可证

MIT License
