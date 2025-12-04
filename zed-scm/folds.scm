; Folding rules for RSX

; Section blocks can be folded
(rust_section) @fold
(script_section) @fold
(style_section) @fold
(template_section) @fold

; HTML elements can be folded
(html_element) @fold

; Control flow blocks can be folded
(if_directive) @fold
(each_directive) @fold
(each_directive_alt) @fold

; Comments can be folded
(comment) @fold
(template_comment) @fold
