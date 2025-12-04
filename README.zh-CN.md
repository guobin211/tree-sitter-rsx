# RSX 语言规范

[English](./README.md)

RSX是一个全栈Web框架，结合了Rust的服务端性能、TypeScript的类型安全、Handlebars的模板语法和SCSS的样式能力。

## 目录

- [文件结构](#文件结构)
- [基本语法规则](#基本语法规则)
- [Rust部分](#rust部分)
- [TypeScript部分](#typescript部分)
- [Template部分](#template部分)
- [Style部分](#style部分)
- [核心特性总结](#核心特性总结)

---

## 文件结构

RSX文件使用`.rsx`扩展名，包含四个主要部分：

```rsx
---
// Rust部分：服务端逻辑
---

<script>
// JavaScript/TypeScript部分
</script>

<template>
<!-- Template部分：handlebars模板 -->
</template>

<style>
/* Style部分：SCSS样式 */
</style>
```

---

## 基本语法规则

- 使用4个空格缩进
- 使用UTF-8编码
- 使用Unix风格换行符(LF)

---

## Rust部分

### 语法规则

- 以`---`开头和结尾
- 使用Rust语言编写服务端逻辑

### 服务端数据获取

#### 基本格式

通过`get_server_side_props`函数在服务端获取数据，支持异步操作：

```rust
---
async fn get_server_side_props(req: Request) -> Response {
    // 服务端逻辑
    let data = fetch_data().await;
    Response::json!({
        "data": data,
    })
}
---
```

#### 带上下文的格式

支持请求上下文(`Request`)和运行时上下文(`Context`)：

```rust
---
async fn get_server_side_props(req: Request, ctx: Context) -> Response {
    // 使用上下文信息
    let user_id = ctx.get_user_id();
    let data = fetch_user_data(user_id).await;
    Response::json!({
        "data": data,
    })
}
---
```

---

## TypeScript部分

### 语法规则

- 以`<script>`开头，以`</script>`结尾
- 使用TypeScript编写客户端逻辑

### 组件属性定义

#### 基本属性

使用`defineProps`定义组件属性类型：

```typescript
<script>
const { data, loading, error } = defineProps<{
    data: string[]
    loading: boolean
    error?: string
}>()
</script>
```

#### 复杂属性

支持接口定义和复杂类型：

```typescript
<script>
interface User {
    id: string
    name: string
    email: string
    avatar?: string
}

const { users, onUserClick, showAvatar } = defineProps<{
    users: User[]
    onUserClick: (user: User) => void
    showAvatar: boolean
}>()
</script>
```

---

## Template部分

### 基本语法

#### 文本插值

使用双大括号进行文本插值：

```html
<template>
    <h1>Hello, {{ name }}!</h1>
    <p>Welcome to {{ site.name }}</p>
</template>
```

#### 条件渲染

支持`if`、`else if`、`else`条件渲染：

```html
<template>
    {{@if porridge.temperature > 100}}
    <p>too hot!</p>
    {{:else if 80 > porridge.temperature}}
    <p>too cold!</p>
    {{:else}}
    <p>just right!</p>
    {{/if}}
</template>
```

#### 列表渲染

使用`{{@each}}`进行列表渲染，支持索引：

```html
<template>
    <ul class="user-list">
        {{@each users as user, index}}
        <li class="user-item" data-index="{{ index }}">{{ user.name }}</li>
        {{/each}}
    </ul>
</template>
```

**语法说明**：
- 列表指令：`{{@each array as item, index}}`
- 结束标签：`{{/each}}`
- 索引参数是可选的

#### 嵌套循环

支持多层嵌套的循环：

```html
<template>
    {{@each categories as category}}
    <div class="category">
        <h3>{{ category.name }}</h3>
        <ul class="items">
            {{@each category.items as item}}
            <li>{{ item.name }} - {{ item.price }}</li>
            {{/each}}
        </ul>
    </div>
    {{/each}}
</template>
```

#### 嵌套条件指令

支持在条件指令内部嵌套其他条件指令：

```html
<template>
    {{@if user.isActive}}
    <div class="user-active">
        {{@if user.hasPermission}}
        <p>用户有权限</p>
        {{:else}}
        <p>用户无权限</p>
        {{/if}}
    </div>
    {{:else}}
    <p>用户未激活</p>
    {{/if}}
</template>
```

### 表达式语法

模板中支持多种表达式类型，可以在文本插值、HTML属性、条件判断等场景使用：

#### 属性访问

使用点号访问对象属性：

```html
<template>
    <p>{{ user.profile.name }}</p>
    <p>{{ category.items.length }}</p>
</template>
```

#### 函数调用

支持调用函数并传递参数：

```html
<template>
    <p>价格：{{ formatPrice(item.price) }}</p>
    <p>日期：{{ formatDate(user.createdAt, 'YYYY-MM-DD') }}</p>
</template>
```

#### 二元表达式

支持比较和逻辑运算符：

```html
<template>
    {{@if count > 0 && count < 100}}
    <p>数量在范围内</p>
    {{/if}}

    {{@if user.age >= 18 && user.isVerified}}
    <p>已验证的成年用户</p>
    {{/if}}
</template>
```

支持的运算符：
- 比较运算符：`>`, `<`, `>=`, `<=`, `==`, `!=`
- 逻辑运算符：`&&`, `||`
- 算术运算符：`+`, `-`, `*`, `/`

#### 条件表达式（三元运算符）

使用三元运算符进行条件判断：

```html
<template>
    <p>{{ isActive ? '激活' : '未激活' }}</p>
    <p>{{ count > 0 ? count : '无' }}</p>
</template>
```

### HTML属性中的表达式

可以在任何HTML属性中使用表达式：

```html
<template>
    <!-- class属性 -->
    <div class="{{ isActive ? 'active' : 'inactive' }}">
        <span class="status-{{ status }}">{{ status }}</span>
    </div>

    <!-- id属性 -->
    <div id="user-{{ user.id }}"></div>

    <!-- data属性 -->
    <div data-index="{{ index }}" data-count="{{ items.length }}"></div>

    <!-- src属性 -->
    <img src="{{ user.avatar || '/default-avatar.png' }}" alt="{{ user.name }}" />

    <!-- href属性 -->
    <a href="/users/{{ user.id }}">查看用户</a>

    <!-- style属性 -->
    <div style="width: {{ width }}px; height: {{ height }}px;"></div>
</template>
```

### 样式绑定

支持动态class绑定和条件表达式：

```html
<template>
    <div class="{{ isActive ? 'active' : 'inactive' }}">
        <span class="status-{{ status }}">{{ status }}</span>
    </div>
</template>
```

### Raw HTML输出

使用`{{@html}}`指令输出原始HTML内容：

```html
<template>
    <div>{{@html rawHtmlContent}}</div>
</template>
```

### 客户端组件

支持在模板中使用React、Vue、Svelte等客户端框架组件：

#### 使用方式

- 使用`client`属性指定组件的类型
- 使用`client="react"`指定React组件
- 使用`client="vue"`指定Vue组件
- 使用`client="svelte"`指定Svelte组件

#### 属性传递

客户端组件的属性可以通过双大括号语法传递，支持表达式：

```html
<script>
    import SvelteApp from './svelte/app.tsx'
    import ReactApp from './react/app.tsx'
    import VueApp from './vue/app.tsx'
</script>

<template>
    <div>
        <!-- 传递简单属性 -->
        <SvelteApp client="svelte" users="{{users}}"></SvelteApp>

        <!-- 传递多个属性 -->
        <ReactApp
            client="react"
            users="{{users}}"
            count="{{users.length}}"
            isActive="{{currentUser.isActive}}">
        </ReactApp>

        <!-- 传递复杂属性（对象、数组） -->
        <VueApp
            client="vue"
            config="{{appConfig}}"
            items="{{category.items}}">
        </VueApp>

        <!-- 传递函数属性 -->
        <ReactApp
            client="react"
            onUserClick="{{handleUserClick}}"
            onUpdate="{{updateHandler}}">
        </ReactApp>
    </div>
</template>
```

#### 自闭合标签

客户端组件支持自闭合标签语法：

```html
<template>
    <ReactApp client="react" users="{{users}}" />
    <VueApp client="vue" data="{{chartData}}" />
</template>
```

---

## Style部分

### 语法规则

- 以`<style>`开头，以`</style>`结尾
- 使用SCSS编写样式

### 示例

```scss
<style>
    .user-list {
        padding: 0;
        margin: 0;
        list-style: none;

        .user-item {
            padding: 10px;
            border-bottom: 1px solid #eee;

            &:hover {
                background-color: #f5f5f5;
            }
        }
    }
</style>
```

---

## 核心特性总结

### 1. 多语言混合架构

RSX将四种技术栈整合在一个文件中：

- **Rust部分**：服务端逻辑，使用`---`分隔符包裹
- **TypeScript部分**：客户端逻辑，使用`<script>`标签
- **Handlebars模板**：视图层，使用`<template>`标签
- **SCSS样式**：样式层，使用`<style>`标签

### 2. 服务端渲染(SSR)支持

- 通过`get_server_side_props`函数在服务端获取数据
- 支持异步数据获取
- 支持请求上下文(`Request`)和运行时上下文(`Context`)
- 返回JSON格式的响应数据

### 3. 类型安全

- TypeScript提供客户端类型检查
- 使用`defineProps`定义组件属性类型
- 支持接口定义和复杂类型

### 4. 模板功能

- **文本插值**：`{{ variable }}`
- **条件渲染**：`{{@if}}`、`{{:else if}}`、`{{:else}}`、`{{/if}}`
- **列表渲染**：`{{@each array as item, index}}`
- **嵌套指令**：支持多层嵌套的循环和条件指令
- **表达式语法**：
  - 属性访问：`user.profile.name`
  - 函数调用：`formatPrice(item.price)`
  - 二元表达式：`count > 0 && count < 100`
  - 条件表达式：`isActive ? 'active' : 'inactive'`
- **HTML属性表达式**：支持在任何HTML属性中使用表达式
- **样式绑定**：支持动态class绑定
- **Raw HTML**：`{{@html content}}`支持原始HTML输出

### 5. 多框架客户端组件支持

- 支持React组件：`client="react"`
- 支持Vue组件：`client="vue"`
- 支持Svelte组件：`client="svelte"`
- 允许在同一个模板中混合使用不同框架的组件

### 6. 代码规范

- 统一使用4个空格缩进
- UTF-8编码
- Unix风格换行符(LF)

---

## 完整示例

以下是一个完整的RSX文件示例，展示了所有部分的协同工作：

```rsx
---
use rsx::{Request, Response, Context};

async fn get_server_side_props(req: Request, ctx: Context) -> Response {
    let user_id = ctx.get_user_id().unwrap_or_default();
    let users = fetch_users(user_id).await;

    Response::json!({
        "users": users,
        "loading": false,
    })
}
---

<script>
interface User {
    id: string
    name: string
    email: string
    avatar?: string
}

const { users, loading } = defineProps<{
    users: User[]
    loading: boolean
}>()
</script>

<template>
    <div class="user-container">
        {{@if loading}}
        <p>Loading...</p>
        {{:else}}
        <ul class="user-list">
            {{@each users as user, index}}
            <li class="user-item" data-index="{{ index }}">
                {{@if user.avatar}}
                <img src="{{ user.avatar }}" alt="{{ user.name }}" />
                {{/if}}
                <div>
                    <h3>{{ user.name }}</h3>
                    <p>{{ user.email }}</p>
                </div>
            </li>
            {{/each}}
        </ul>
        {{/if}}
    </div>
</template>

<style>
    .user-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .user-list {
        list-style: none;
        padding: 0;
        margin: 0;

        .user-item {
            display: flex;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s;

            &:hover {
                background-color: #f5f5f5;
            }

            img {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                margin-right: 15px;
            }

            h3 {
                margin: 0 0 5px 0;
                font-size: 16px;
            }

            p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
        }
    }
</style>
```

---

## 语法快速参考

### 模板指令语法对比表

| 功能 | 语法格式 | 示例 |
|------|----------|------|
| 文本插值 | `{{ expression }}` | `{{ user.name }}` |
| 条件开始 | `{{@if condition}}` | `{{@if count > 0}}` |
| 条件分支 | `{{:else if condition}}` | `{{:else if count == 0}}` |
| 条件否分支 | `{{:else}}` | `{{:else}}` |
| 条件结束 | `{{/if}}` | `{{/if}}` |
| 循环开始 | `{{@each array as item, index}}` | `{{@each users as user, i}}` |
| 循环结束 | `{{/each}}` | `{{/each}}` |
| Raw HTML | `{{@html variable}}` | `{{@html content}}` |
| 客户端组件 | `<Component client="framework" />` | `<App client="react" />` |

### 表达式类型

| 类型 | 语法 | 示例 |
|------|------|------|
| 属性访问 | `object.property.subproperty` | `user.profile.name` |
| 函数调用 | `function(arg1, arg2)` | `formatPrice(item.price)` |
| 二元表达式 | `left operator right` | `count > 0 && count < 100` |
| 三元表达式 | `condition ? true_value : false_value` | `isActive ? 'active' : 'inactive'` |

### 支持的运算符

| 类型 | 运算符 |
|------|--------|
| 比较运算符 | `>`, `<`, `>=`, `<=`, `==`, `!=` |
| 逻辑运算符 | `&&`, `||` |
| 算术运算符 | `+`, `-`, `*`, `/` |
| 一元运算符 | `!`, `-` |

### 客户端框架支持

| 框架 | client属性值 | 示例 |
|------|-------------|------|
| React | `client="react"` | `<ReactApp client="react" data="{{data}}" />` |
| Vue | `client="vue"` | `<VueChart client="vue" config="{{config}}" />` |
| Svelte | `client="svelte"` | `<SvelteWidget client="svelte" items="{{items}}" />` |

### 常见模式示例

#### 条件渲染列表

```html
{{@if items.length > 0}}
    {{@each items as item, index}}
    <div>{{ item.name }}</div>
    {{/each}}
{{:else}}
    <p>暂无数据</p>
{{/if}}
```

#### 嵌套循环

```html
{{@each categories as category}}
    <h2>{{ category.name }}</h2>
    {{@each category.items as item}}
        <p>{{ item.name }}</p>
    {{/each}}
{{/each}}
```

#### 动态样式

```html
<div class="{{ isActive ? 'active' : 'inactive' }}">
    <span class="status-{{ status }}">{{ status }}</span>
</div>
```

#### 客户端组件集成

```html
<script>
import ReactApp from './react/app.tsx'
import VueChart from './vue/chart.vue'
</script>

<template>
    <ReactApp client="react" users="{{users}}" onUpdate="{{handleUpdate}}" />
    <VueChart client="vue" data="{{chartData}}" />
</template>
```
