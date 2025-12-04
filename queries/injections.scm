; Language injections for RSX

; Rust code in frontmatter section
((rust_section
  (rust_content) @content)
 (#set! injection.language "rust")
 (#set! injection.include-children))

; TypeScript in script section
((script_section
  (script_content) @content)
 (#set! injection.language "typescript")
 (#set! injection.include-children))

; SCSS/CSS in style section
((style_section
  (style_content) @content)
 (#set! injection.language "scss")
 (#set! injection.include-children))
