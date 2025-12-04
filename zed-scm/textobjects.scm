; Text objects for RSX

; Function/block objects
(rust_section) @function.outer
(rust_content) @function.inner

(script_section) @function.outer
(script_content) @function.inner

(style_section) @function.outer
(style_content) @function.inner

(template_section) @function.outer
(template_body) @function.inner

; HTML element objects
(html_element) @class.outer

; Control flow objects
(if_directive) @conditional.outer
(if_directive (then_body) @conditional.inner)

(each_directive) @loop.outer
(each_directive (body) @loop.inner)

(each_directive_alt) @loop.outer
(each_directive_alt (body) @loop.inner)

; Comment objects
(comment) @comment.outer
(template_comment) @comment.outer

; Parameter objects
(html_attribute) @parameter.outer
(argument_list) @parameter.outer
