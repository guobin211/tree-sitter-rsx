; Outline/structure for RSX files

; Main sections
(rust_section "---" @name) @item
(script_section "<script>" @name) @item
(style_section "<style>" @name) @item
(template_section "<template>" @name) @item

; HTML elements with tag names
(html_element (tag_name: (identifier) @name)) @item

; Control flow directives (double braces)
(if_directive "{{#if" @name) @item
(else_if_clause "{{:else" @name) @item
(else_clause "{{:else}}" @name) @item
(each_directive "{{#each" @name) @item
(each_directive_alt "{{@each" @name) @item
(raw_html_directive "{{@html" @name) @item
