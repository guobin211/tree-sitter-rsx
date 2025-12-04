; Language injections for RSX

; Rust code in frontmatter section
((rust_section
  (rust_content) @injection.content)
  (#set! injection.language "rust"))

; TypeScript in script section
((script_section
  (script_content) @injection.content)
  (#set! injection.language "typescript"))

; SCSS/CSS in style section
((style_section
  (style_content) @injection.content)
  (#set! injection.language "scss"))
