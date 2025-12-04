; Bracket pairs for RSX

; HTML tags
("<" @open ">" @close)
("</" @open ">" @close)

; Section tags
("<script>" @open "</script>" @close)
("<style>" @open "</style>" @close)
("<template>" @open "</template>" @close)

; Rust section delimiters
("---" @open "---" @close)

; Template interpolation (double braces)
("{{" @open "}}" @close)

; Control flow directives (double braces)
("{{#if" @open "{{/if}}" @close)
("{{#each" @open "{{/each}}" @close)
("{{@each" @open "{{/each}}" @close)

; String quotes
("'" @open "'" @close)
("\"" @open "\"" @close)

; Parentheses
("(" @open ")" @close)

; Curly braces (for Rust/JS code blocks)
("{" @open "}" @close)

; Square brackets
("[" @open "]" @close)
