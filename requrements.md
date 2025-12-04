# RSX Parser 需求文档

## Handlebars 语法参考

> 参考: [handlebars-rust](https://github.com/sunng87/handlebars-rust) | [handlebarsjs.com](https://handlebarsjs.com/guide/)

### 核心语法

- **插值**: `{{var}}` / `{{{raw}}}`
- **条件**: `{{#if}}...{{else}}...{{/if}}`
- **循环**: `{{#each items}}...{{/each}}`
- **注释**: `{{! comment }}` / `{{!-- comment --}}`
- **局部模板**: `{{> partialName}}`

---

## RSX 语法（与 Handlebars 一致）

| 功能 | 语法 | 示例 |
|------|------|------|
| 条件开始 | `{{#if}}` | `{{#if count > 0}}` |
| 条件分支 | `{{:else if}}` | `{{:else if count == 0}}` |
| 条件否则 | `{{:else}}` | `{{:else}}` |
| 条件结束 | `{{/if}}` | `{{/if}}` |
| 循环 | `{{#each}}` 或 `{{@each}}` | `{{#each users as user}}` |
| 循环结束 | `{{/each}}` | `{{/each}}` |
| 原始HTML | `{{@html}}` | `{{@html content}}` |

---

## 实现状态

### ✅ 已完成

- 四个 Section 解析（Rust/Script/Template/Style）
- 条件指令 `{{#if}}` `{{:else if}}` `{{:else}}` `{{/if}}`
- 循环指令 `{{#each}}` 和 `{{@each}}`
- 表达式解析（属性访问、函数调用、二元/一元/三元）
- 客户端组件解析（React/Vue/Svelte）
- Raw HTML 指令 `{{@html}}`
- 错误验证系统
- 语法高亮规则

### 📋 待优化

- [ ] 增量解析和缓存机制
- [ ] IDE 集成（VSCode 扩展）
- [ ] 错误恢复能力增强
- [ ] 测试用例扩展
- [ ] 性能基准测试

---

## 相关文档

- [README.md](./README.md) - RSX 语言规范
- [RSX_PARSER_SUMMARY.md](./RSX_PARSER_SUMMARY.md) - Parser 使用指南
- [PARSER_CHECK_REPORT.md](./PARSER_CHECK_REPORT.md) - 测试报告
