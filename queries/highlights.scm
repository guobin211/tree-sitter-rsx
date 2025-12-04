; RSX Syntax Highlighting

; Comments
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

; Client Components (PascalCase)
(client_component
  component_name: (component_name) @type)

(client_component "<" @tag.delimiter)
(client_component ">" @tag.delimiter)
(client_component "/>" @tag.delimiter)
(client_component "</" @tag.delimiter)

; HTML attributes
(html_attribute
  name: (attribute_name) @attribute)

; client attribute special highlighting
(html_attribute
  name: (attribute_name) @attribute.special
  (#eq? @attribute.special "client"))

(quoted_attribute_value) @string

"=" @operator

; Template text content
(template_text) @text

; Template interpolation
"{{" @punctuation.special
"}}" @punctuation.special

(template_interpolation
  expression: (identifier) @variable)

(template_interpolation
  expression: (property_access))

; Control flow directives
"{{@if" @keyword.control.conditional
"{{:else if" @keyword.control.conditional
"{{:elseif" @keyword.control.conditional
"{{:else}}" @keyword.control.conditional
"{{/if}}" @keyword.control.conditional
"{{@each" @keyword.control.repeat
"{{/each}}" @keyword.control.repeat
"{{@html" @keyword.directive

"as" @keyword

; If directive
(if_directive
  condition: (_) @variable)

(else_if_clause
  condition: (_) @variable)

; Expressions
(binary_expression
  operator: _ @operator)

(unary_expression
  operator: _ @operator)

(conditional_expression "?" @operator)
(conditional_expression ":" @operator)

; Parenthesized expression
(parenthesized_expression "(" @punctuation.bracket)
(parenthesized_expression ")" @punctuation.bracket)

; Property access
(property_access
  property: (identifier) @property)

(property_access
  object: (identifier) @variable)

"." @punctuation.delimiter

; Function calls
(function_call
  function: (identifier) @function)

(function_call
  function: (property_access
    property: (identifier) @function.method))

"(" @punctuation.bracket
")" @punctuation.bracket

; Each directive variables
(each_directive
  iterable: (identifier) @variable)

(each_directive
  iterable: (property_access))

(each_directive
  item: (identifier) @variable.parameter)

(each_directive
  index: (identifier) @variable.parameter)

; Raw HTML content
(raw_html_directive
  content: (identifier) @variable)

(raw_html_directive
  content: (property_access))

; Literals
(number_literal) @number
(string_literal) @string
(boolean_literal) @constant.builtin

; Punctuation
"," @punctuation.delimiter

; Identifiers (fallback)
(identifier) @variable
