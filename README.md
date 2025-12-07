# Tree-sitter RSX

Tree-sitter grammar for RSX (Rust + TypeScript + Template + SCSS) files.

## Features

- Multi-section parsing: Rust, Script, Template, Style sections
- Template directive support:
    - Conditional rendering: `{{@if}}`, `{{:else if}}`, `{{:elseif}}`, `{{:else}}`, `{{/if}}`
    - List rendering: `{{@each items as item, index}}`, `{{/each}}`
    - Raw HTML: `{{@html content}}`
    - Text interpolation: `{{ expression }}`
- Expression parsing:
    - Identifiers and property access
    - Function calls
    - Binary expressions (comparison, logical, arithmetic)
    - Unary expressions
    - Conditional (ternary) expressions
    - Parenthesized expressions
    - Literals (string, number, boolean)
- Client component detection (React, Vue, Svelte)
- HTML element and attribute parsing
- HTML comments

## Installation

```bash
npm install tree-sitter-rsx
```

## Usage

### Node.js

```javascript
const Parser = require('tree-sitter');
const RSX = require('tree-sitter-rsx');

const parser = new Parser();
parser.setLanguage(RSX);

const sourceCode = `
<template>
    <div>{{ message }}</div>
</template>
`;

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

### Rust

```rust
use tree_sitter::Parser;

fn main() {
    let mut parser = Parser::new();
    parser.set_language(tree_sitter_rsx::language()).unwrap();

    let source_code = r#"
<template>
    <div>{{ message }}</div>
</template>
"#;

    let tree = parser.parse(source_code, None).unwrap();
    println!("{}", tree.root_node().to_sexp());
}
```

## RSX File Structure

RSX files contain four optional sections:

```rsx
---
// Rust section: server-side logic
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({})
}
---

<script>
// TypeScript section: client-side logic
const { data } = defineProps<{ data: any }>()
</script>

<template>
<!-- Template section: Handlebars-like syntax -->
<div>{{ data }}</div>
</template>

<style>
/* Style section: SCSS */
div { padding: 20px; }
</style>
```

## Grammar Highlights

### Template Directives

```html
<!-- Conditional rendering -->
{{@if condition}}
<p>True branch</p>
{{:else if otherCondition}}
<p>Else if branch</p>
{{:elseif anotherCondition}}
<p>Elseif also works</p>
{{:else}}
<p>Else branch</p>
{{/if}}

<!-- List rendering -->
{{@each items as item, index}}
<li>{{ index }}: {{ item.name }}</li>
{{/each}}

<!-- Raw HTML -->
{{@html rawHtmlContent}}
```

### Expressions

```html
<!-- Property access -->
{{ user.profile.name }}

<!-- Function calls -->
{{ formatDate(date, 'YYYY-MM-DD') }}

<!-- Binary expressions -->
{{@if count > 0 && count < 100}}

<!-- Ternary expressions -->
{{ isActive ? 'Active' : 'Inactive' }}

<!-- Parenthesized expressions -->
{{ (price * quantity) * (1 - discount) }}
```

### Client Components

```html
<ReactApp client="react" data="{{ data }}" />
<VueChart client="vue" config="{{ config }}" />
<SvelteWidget client="svelte" items="{{ items }}" />
```

## Supported Operators

- Comparison: `>`, `<`, `>=`, `<=`, `==`, `!=`, `===`, `!==`
- Logical: `&&`, `||`
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Unary: `!`, `-`

## Development

### Build

```bash
npm run build
```

### Generate

```bash
npx tree-sitter generate
```

### Test

```bash
npx tree-sitter test
```

### Parse a file

```bash
npx tree-sitter parse path/to/file.rsx
```

## Test Coverage

The grammar includes comprehensive test cases covering:

- Basic file structure (all section combinations)
- Text interpolation (identifiers, property access, function calls, ternary)
- Conditional rendering (if, else if, elseif, else, nested conditions)
- List rendering (simple loop, with index, nested loops)
- Expressions (all operators, literals, parenthesized)
- HTML elements (self-closing, attributes, interpolation in attributes)
- Client components (React, Vue, Svelte)
- Raw HTML directive

## Related Documentation

- [RSX Language Specification](../../RSX_LANGUAGE.md)
- [RSX Parser](../../RSX_PARSER.md)
- [RSX Compiler](../../RSX_COMPILER.MD)

## License

MIT
