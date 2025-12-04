; Local variable scopes for RSX

; Each directive creates a scope
(each_directive) @local.scope
(each_directive_alt) @local.scope

; If directive creates a scope
(if_directive) @local.scope

; Each directive item and index are definitions
(each_directive
  item: (identifier) @local.definition)

(each_directive
  index: (identifier) @local.definition)

(each_directive_alt
  item: (identifier) @local.definition)

(each_directive_alt
  index: (identifier) @local.definition)

; References
(template_interpolation
  expression: (identifier) @local.reference)
