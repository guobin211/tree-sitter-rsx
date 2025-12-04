# RSX Language Specification

[中文文档](./README.zh-CN.md)

RSX is a full-stack web framework that combines Rust's server-side performance, TypeScript's type safety, Handlebars template syntax, and SCSS styling capabilities.

## Table of Contents

- [File Structure](#file-structure)
- [Basic Syntax Rules](#basic-syntax-rules)
- [Rust Section](#rust-section)
- [TypeScript Section](#typescript-section)
- [Template Section](#template-section)
- [Style Section](#style-section)
- [Core Features Summary](#core-features-summary)

---

## File Structure

RSX files use the `.rsx` extension and contain four main sections:

```rsx
---
// Rust section: server-side logic
---

<script>
// JavaScript/TypeScript section
</script>

<template>
<!-- Template section: handlebars templates -->
</template>

<style>
/* Style section: SCSS styles */
</style>
```

---

## Basic Syntax Rules

- Use 4 spaces for indentation
- Use UTF-8 encoding
- Use Unix-style line endings (LF)

---

## Rust Section

### Syntax Rules

- Starts and ends with `---`
- Uses Rust language for server-side logic

### Server-Side Data Fetching

#### Basic Format

Fetch data on the server using the `get_server_side_props` function, with async support:

```rust
---
async fn get_server_side_props(req: Request) -> Response {
    // Server-side logic
    let data = fetch_data().await;
    Response::json!({
        "data": data,
    })
}
---
```

#### Format with Context

Supports request context (`Request`) and runtime context (`Context`):

```rust
---
async fn get_server_side_props(req: Request, ctx: Context) -> Response {
    // Use context information
    let user_id = ctx.get_user_id();
    let data = fetch_user_data(user_id).await;
    Response::json!({
        "data": data,
    })
}
---
```

---

## TypeScript Section

### Syntax Rules

- Starts with `<script>` and ends with `</script>`
- Uses TypeScript for client-side logic

### Component Props Definition

#### Basic Props

Use `defineProps` to define component property types:

```typescript
<script>
const { data, loading, error } = defineProps<{
    data: string[]
    loading: boolean
    error?: string
}>()
</script>
```

#### Complex Props

Supports interface definitions and complex types:

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

## Template Section

### Basic Syntax

#### Text Interpolation

Use double curly braces for text interpolation:

```html
<template>
    <h1>Hello, {{ name }}!</h1>
    <p>Welcome to {{ site.name }}</p>
</template>
```

#### Conditional Rendering

Supports `if`, `else if`, `else` conditional rendering:

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

#### List Rendering

Use `{{#each}}` or `{{@each}}` for list rendering, with index support:

```html
<template>
    <ul class="user-list">
        {{#each users as user, index}}
        <li class="user-item" data-index="{{ index }}">{{ user.name }}</li>
        {{/each}}
    </ul>
</template>
```

**Syntax Notes**:
- List directive: `{{#each array as item, index}}` or `{{@each array as item, index}}`
- Closing tag: `{{/each}}`
- Index parameter is optional

#### Nested Loops

Supports multi-level nested loops:

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

#### Nested Conditional Directives

Supports nesting conditional directives inside other conditional directives:

```html
<template>
    {{#if user.isActive}}
    <div class="user-active">
        {{#if user.hasPermission}}
        <p>User has permission</p>
        {{:else}}
        <p>User has no permission</p>
        {{/if}}
    </div>
    {{:else}}
    <p>User is not active</p>
    {{/if}}
</template>
```

### Expression Syntax

Templates support various expression types for text interpolation, HTML attributes, conditional checks, etc.:

#### Property Access

Use dot notation to access object properties:

```html
<template>
    <p>{{ user.profile.name }}</p>
    <p>{{ category.items.length }}</p>
</template>
```

#### Function Calls

Supports calling functions with arguments:

```html
<template>
    <p>Price: {{ formatPrice(item.price) }}</p>
    <p>Date: {{ formatDate(user.createdAt, 'YYYY-MM-DD') }}</p>
</template>
```

#### Binary Expressions

Supports comparison and logical operators:

```html
<template>
    {{#if count > 0 && count < 100}}
    <p>Count is within range</p>
    {{/if}}

    {{#if user.age >= 18 && user.isVerified}}
    <p>Verified adult user</p>
    {{/if}}
</template>
```

Supported operators:
- Comparison operators: `>`, `<`, `>=`, `<=`, `==`, `!=`
- Logical operators: `&&`, `||`
- Arithmetic operators: `+`, `-`, `*`, `/`

#### Conditional Expressions (Ternary Operator)

Use ternary operator for conditional evaluation:

```html
<template>
    <p>{{ isActive ? 'Active' : 'Inactive' }}</p>
    <p>{{ count > 0 ? count : 'None' }}</p>
</template>
```

### Expressions in HTML Attributes

You can use expressions in any HTML attribute:

```html
<template>
    <!-- class attribute -->
    <div class="{{ isActive ? 'active' : 'inactive' }}">
        <span class="status-{{ status }}">{{ status }}</span>
    </div>

    <!-- id attribute -->
    <div id="user-{{ user.id }}"></div>

    <!-- data attributes -->
    <div data-index="{{ index }}" data-count="{{ items.length }}"></div>

    <!-- src attribute -->
    <img src="{{ user.avatar || '/default-avatar.png' }}" alt="{{ user.name }}" />

    <!-- href attribute -->
    <a href="/users/{{ user.id }}">View User</a>

    <!-- style attribute -->
    <div style="width: {{ width }}px; height: {{ height }}px;"></div>
</template>
```

### Style Binding

Supports dynamic class binding and conditional expressions:

```html
<template>
    <div class="{{ isActive ? 'active' : 'inactive' }}">
        <span class="status-{{ status }}">{{ status }}</span>
    </div>
</template>
```

### Raw HTML Output

Use `{{@html}}` directive to output raw HTML content:

```html
<template>
    <div>{{@html rawHtmlContent}}</div>
</template>
```

### Client Components

Supports using React, Vue, Svelte and other client-side framework components in templates:

#### Usage

- Use the `client` attribute to specify the component type
- Use `client="react"` for React components
- Use `client="vue"` for Vue components
- Use `client="svelte"` for Svelte components

#### Passing Props

Client component props can be passed using double curly brace syntax, with expression support:

```html
<script>
    import SvelteApp from './svelte/app.tsx'
    import ReactApp from './react/app.tsx'
    import VueApp from './vue/app.tsx'
</script>

<template>
    <div>
        <!-- Passing simple props -->
        <SvelteApp client="svelte" users="{{users}}"></SvelteApp>

        <!-- Passing multiple props -->
        <ReactApp
            client="react"
            users="{{users}}"
            count="{{users.length}}"
            isActive="{{currentUser.isActive}}">
        </ReactApp>

        <!-- Passing complex props (objects, arrays) -->
        <VueApp
            client="vue"
            config="{{appConfig}}"
            items="{{category.items}}">
        </VueApp>

        <!-- Passing function props -->
        <ReactApp
            client="react"
            onUserClick="{{handleUserClick}}"
            onUpdate="{{updateHandler}}">
        </ReactApp>
    </div>
</template>
```

#### Self-Closing Tags

Client components support self-closing tag syntax:

```html
<template>
    <ReactApp client="react" users="{{users}}" />
    <VueApp client="vue" data="{{chartData}}" />
</template>
```

---

## Style Section

### Syntax Rules

- Starts with `<style>` and ends with `</style>`
- Uses SCSS for styling

### Example

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

## Core Features Summary

### 1. Multi-Language Hybrid Architecture

RSX integrates four technology stacks in a single file:

- **Rust Section**: Server-side logic, wrapped with `---` delimiters
- **TypeScript Section**: Client-side logic, using `<script>` tags
- **Handlebars Templates**: View layer, using `<template>` tags
- **SCSS Styles**: Style layer, using `<style>` tags

### 2. Server-Side Rendering (SSR) Support

- Fetch data on server via `get_server_side_props` function
- Supports async data fetching
- Supports request context (`Request`) and runtime context (`Context`)
- Returns JSON format response data

### 3. Type Safety

- TypeScript provides client-side type checking
- Use `defineProps` to define component property types
- Supports interface definitions and complex types

### 4. Template Features

- **Text Interpolation**: `{{ variable }}`
- **Conditional Rendering**: `{{#if}}`, `{{:else if}}`, `{{:else}}`, `{{/if}}`
- **List Rendering**: `{{#each array as item, index}}` or `{{@each array as item, index}}`
- **Nested Directives**: Supports multi-level nested loops and conditional directives
- **Expression Syntax**:
  - Property access: `user.profile.name`
  - Function calls: `formatPrice(item.price)`
  - Binary expressions: `count > 0 && count < 100`
  - Conditional expressions: `isActive ? 'active' : 'inactive'`
- **HTML Attribute Expressions**: Supports expressions in any HTML attribute
- **Style Binding**: Supports dynamic class binding
- **Raw HTML**: `{{@html content}}` for raw HTML output

### 5. Multi-Framework Client Component Support

- React components: `client="react"`
- Vue components: `client="vue"`
- Svelte components: `client="svelte"`
- Allows mixing components from different frameworks in the same template

### 6. Code Standards

- Consistent 4-space indentation
- UTF-8 encoding
- Unix-style line endings (LF)

---

## Complete Example

Here's a complete RSX file example showing all sections working together:

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
        {{#if loading}}
        <p>Loading...</p>
        {{:else}}
        <ul class="user-list">
            {{@each users as user, index}}
            <li class="user-item" data-index="{{ index }}">
                {{#if user.avatar}}
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

## Quick Reference

### Template Directive Syntax Comparison

| Feature | Syntax Format | Example |
|---------|---------------|---------|
| Text Interpolation | `{{ expression }}` | `{{ user.name }}` |
| Condition Start | `{{#if condition}}` | `{{#if count > 0}}` |
| Condition Branch | `{{:else if condition}}` | `{{:else if count == 0}}` |
| Condition Else | `{{:else}}` | `{{:else}}` |
| Condition End | `{{/if}}` | `{{/if}}` |
| Loop Start | `{{#each array as item, index}}` or `{{@each array as item, index}}` | `{{#each users as user, i}}` |
| Loop End | `{{/each}}` | `{{/each}}` |
| Raw HTML | `{{@html variable}}` | `{{@html content}}` |
| Client Component | `<Component client="framework" />` | `<App client="react" />` |

### Expression Types

| Type | Syntax | Example |
|------|--------|---------|
| Property Access | `object.property.subproperty` | `user.profile.name` |
| Function Call | `function(arg1, arg2)` | `formatPrice(item.price)` |
| Binary Expression | `left operator right` | `count > 0 && count < 100` |
| Ternary Expression | `condition ? true_value : false_value` | `isActive ? 'active' : 'inactive'` |

### Supported Operators

| Type | Operators |
|------|-----------|
| Comparison | `>`, `<`, `>=`, `<=`, `==`, `!=` |
| Logical | `&&`, `||` |
| Arithmetic | `+`, `-`, `*`, `/` |
| Unary | `!`, `-` |

### Client Framework Support

| Framework | client Attribute | Example |
|-----------|-----------------|---------|
| React | `client="react"` | `<ReactApp client="react" data="{{data}}" />` |
| Vue | `client="vue"` | `<VueChart client="vue" config="{{config}}" />` |
| Svelte | `client="svelte"` | `<SvelteWidget client="svelte" items="{{items}}" />` |

### Common Patterns

#### Conditional List Rendering

```html
{{#if items.length > 0}}
    {{@each items as item, index}}
    <div>{{ item.name }}</div>
    {{/each}}
{{:else}}
    <p>No data available</p>
{{/if}}
```

#### Nested Loops

```html
{{@each categories as category}}
    <h2>{{ category.name }}</h2>
    {{@each category.items as item}}
        <p>{{ item.name }}</p>
    {{/each}}
{{/each}}
```

#### Dynamic Styles

```html
<div class="{{ isActive ? 'active' : 'inactive' }}">
    <span class="status-{{ status }}">{{ status }}</span>
</div>
```

#### Client Component Integration

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
