; Comments
(comment) @comment
(template_comment) @comment

; Section delimiters
(rust_section "---" @punctuation.special)
(script_section ["<script>" "</script>"] @tag)
(style_section ["<style>" "</style>"] @tag)
(template_section ["<template>" "</template>"] @tag)

; HTML tags (lowercase = tag, uppercase = component)
(html_element (tag_name: (identifier) @tag) (#match? @tag "^[a-z]"))
(html_element (tag_name: (identifier) @type) (#match? @type "^[A-Z]"))

; HTML attributes
(html_attribute (name: (attribute_name) @attribute))
(html_attribute (name: (attribute_name) @attribute.builtin) (#match? @attribute.builtin "^(client|slot)$"))
(html_attribute (value: (string_literal) @string))
(html_attribute (value: (template_interpolation) @punctuation.special))

; Tag punctuation
["<" ">" "/>"] @tag.delimiter
["{{" "}}"] @punctuation.bracket

; Operators and delimiters
"=" @operator
"," @punctuation.delimiter
"." @punctuation.delimiter

; Expressions
(binary_expression (operator: (_) @operator))
(unary_expression (operator: (_) @operator))
(conditional_expression ["?" ":"] @punctuation.delimiter)

; Control flow directives (double braces)
("{{#if") @keyword.control
("{{:else") @keyword.control
(else_if_clause "if" @keyword.control)
("{{:else}}") @keyword.control
("{{/if}}") @keyword.control
("{{#each") @keyword.control
("{{@each") @keyword.control
(each_directive "as" @keyword)
(each_directive_alt "as" @keyword)
("{{/each}}") @keyword.control
("{{@html") @keyword.directive

; Property access
(property_access) @variable.member

; Interpolation expressions
(template_interpolation (expression: (identifier) @variable))
(template_interpolation (expression: (property_access) @variable.member))
(template_interpolation (expression: (function_call (function: (identifier) @function))))
(template_interpolation (expression: (function_call (function: (property_access) @function.method))))

; Literals
(number_literal) @number
(string_literal) @string
(boolean_literal) @constant.builtin
