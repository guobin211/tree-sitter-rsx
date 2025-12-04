; Language injections for RSX

; Rust code in frontmatter section
(rust_section
  (rust_content) @content
  (#set! language "rust"))

; TypeScript in script section
(script_section
  (script_content) @content
  (#set! language "typescript"))

; SCSS/CSS in style section
(style_section
  (style_content) @content
  (#set! language "scss"))
