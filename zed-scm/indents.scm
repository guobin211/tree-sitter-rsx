; Indentation rules for RSX

; Section blocks
(rust_section "---" @start "---" @end) @indent
(script_section "<script>" @start "</script>" @end) @indent
(style_section "<style>" @start "</style>" @end) @indent
(template_section "<template>" @start "</template>" @end) @indent

; HTML elements
(html_element "<" @start [("</" ">") ("/>")] @end) @indent

; Control flow directives (double braces)
(if_directive "{{#if" @start "{{/if}}" @end) @indent
(each_directive "{{#each" @start "{{/each}}" @end) @indent
(each_directive_alt "{{@each" @start "{{/each}}" @end) @indent

; Else clauses create dedent then indent
(else_clause "{{:else}}" @branch)
(else_if_clause "{{:else" @branch)
