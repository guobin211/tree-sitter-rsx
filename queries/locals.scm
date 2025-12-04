; Local variable scopes for RSX

; Template section creates a scope
(template_section) @local.scope

; Each directive creates a scope
(each_directive) @local.scope

; If directive creates a scope
(if_directive) @local.scope
(else_if_clause) @local.scope
(else_clause) @local.scope

; Client component creates a scope
(client_component) @local.scope

; Each directive item and index are definitions
(each_directive
  item: (identifier) @local.definition)

(each_directive
  index: (identifier) @local.definition)

; References in template interpolation
(template_interpolation
  expression: (identifier) @local.reference)

; References in property access
(property_access
  object: (identifier) @local.reference)

; References in function calls
(function_call
  function: (identifier) @local.reference)
