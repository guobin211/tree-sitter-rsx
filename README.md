# RSX

### 文件结构

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

### 基本语法规则

- 使用4个空格缩进
- 使用UTF-8编码
- 使用Unix风格换行符(LF)

## Rust部分规范

### 语法规则

- 以`---`开头和结尾
- 使用Rust语言编写服务端逻辑

### 服务端属性函数

#### 基本格式

```rust
async fn get_server_side_props(req: Request) -> Response {
    // 服务端逻辑
    let data = fetch_data().await;
    Response::json!({
        "data": data,
    })
}
```

#### 带上下文的格式

```rust
async fn get_server_side_props(req: Request, ctx: Context) -> Response {
    // 使用上下文信息
    let user_id = ctx.get_user_id();
    let data = fetch_user_data(user_id).await;
    Response::json!({
        "data": data,
    })
}
```

## JavaScript/TypeScript部分规范

### 语法规则

- 以`<script>`开头，以`</script>`结尾
- 使用TypeScript编写客户端逻辑

### 组件属性定义

#### 基本属性

```typescript
const { data, loading, error } = defineProps<{
    data: string[];
    loading: boolean;
    error?: string;
}>();
```

#### 复杂属性

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

const { users, onUserClick, showAvatar } = defineProps<{
    users: User[];
    onUserClick: (user: User) => void;
    showAvatar: boolean;
}>();
```

## Template部分规范

### 基本语法

#### 文本插值

```html
<template>
    <h1>Hello, {{ name }}!</h1>
</template>
```

#### 条件渲染

```html
<template>
    {{#if porridge.temperature > 100}}
        <p>too hot!</p>
    {{:else if 80 > porridge.temperature}}
        <p>too cold!</p>
    {{:else}}
        <p>just right!</p>
    {{/if}}
</template>
```

#### 列表渲染

```html
<template>
    <ul class="user-list">
        {{#each users as user, index}}
            <li class="user-item" data-index="{{ index }}">
                {{ user.name }}
            </li>
        {{/each}}
    </ul>
</template>
```

#### 嵌套循环

```html
<template>
    {{#each categories as category}}
        <div class="category">
            <h3>{{ category.name }}</h3>
            <ul class="items">
                {{#each category.items as item}}
                    <li>{{ item.name }} - {{ item.price }}</li>
                {{/each}}
            </ul>
        </div>
    {{/each}}
</template>
```

### 样式绑定

```html
<template>
    <div class="{{ isActive ? 'active' : 'inactive' }}">
        <span class="status-{{ status }}">{{ status }}</span>
    </div>
</template>
```

### Raw HTML输出

```html
<template>
    <div>
        {{@html rawHtmlContent}}
    </div>
</template>
```

### 客户端组件

- 使用`client`属性指定组件的类型
- 使用`client="react"`指定React组件
- 使用`client="vue"`指定Vue组件
- 使用`client="svelte"`指定Svelte组件

```html
<script>
    import SvelteApp from './svelte/app.tsx';
    import ReactApp from './react/app.tsx';
    import VueApp from './vue/app.tsx';
</script>
<template>
    <div>
        <SvelteApp client="svelte" users="{{users}}"></SvelteApp>
        <ReactApp client="react" users="{{users}}"></ReactApp>
        <VueApp client="vue" users="{{users}}"></VueApp>
    </div>
</template>
```

## Style部分规范

### 语法规则

- 以`<style>`开头，以`</style>`结尾
- 使用SCSS编写样式
