; RSX Syntax Highlighting

; Comments
(comment) @comment
(template_comment) @comment

; Section delimiters
(rust_section "---" @punctuation.special)
(script_section "<script>" @tag)
(script_section "</script>" @tag)
(style_section "<style>" @tag)
(style_section "</style>" @tag)
(template_section "<template>" @tag)
(template_section "</template>" @tag)

; HTML Elements
(html_element
  tag_name: (tag_name) @tag)

(html_element "<" @tag.delimiter)
(html_element ">" @tag.delimiter)
(html_element "/>" @tag.delimiter)
(html_element "</" @tag.delimiter)

; HTML attributes
(html_attribute
  name: (attribute_name) @attribute)

"=" @operator

; Template interpolation
"{{" @punctuation.bracket
"}}" @punctuation.bracket

(template_interpolation
  expression: (identifier) @variable)

(template_interpolation
  expression: (property_access))

; Control flow directives
"{{#if" @keyword.control
"{{:else" @keyword.control
"{{:else}}" @keyword.control
"{{/if}}" @keyword.control
"{{#each" @keyword.control
"{{@each" @keyword.control
"{{/each}}" @keyword.control
"{{@html" @keyword.directive

"as" @keyword
"if" @keyword.control

; Expressions
(binary_expression
  operator: _ @operator)

(unary_expression
  operator: _ @operator)

(conditional_expression "?" @operator)
(conditional_expression ":" @operator)

; Property access
(property_access
  property: (identifier) @property)

(property_access
  object: (identifier) @variable)

"." @punctuation.delimiter

; Function calls
(function_call
  function: (identifier) @function)

"(" @punctuation.bracket
")" @punctuation.bracket

; Each directive variables
(each_directive
  iterable: (identifier) @variable)

(each_directive
  item: (identifier) @variable.parameter)

(each_directive
  index: (identifier) @variable.parameter)

(each_directive_alt
  iterable: (identifier) @variable)

(each_directive_alt
  item: (identifier) @variable.parameter)

(each_directive_alt
  index: (identifier) @variable.parameter)

; Raw HTML content
(raw_html_directive
  content: (identifier) @variable)

; Literals
(number_literal) @number
(string_literal) @string
(boolean_literal) @constant.builtin

; Punctuation
"," @punctuation.delimiter

; Identifiers (fallback)
(identifier) @variable
