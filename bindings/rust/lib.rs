//! This crate provides RSX language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][language func] function to add this language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = r#"
//! ---
//! fn get_server_side_props() {}
//! ---
//! <template>
//!     <div>Hello</div>
//! </template>
//! "#;
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_rsx::language()).expect("Error loading RSX grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

extern "C" {
    fn tree_sitter_rsx() -> Language;
}

/// Get the tree-sitter [Language][] for this grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_rsx() }
}

/// The content of the [`node-types.json`][] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES: &str = include_str!("../../src/node-types.json");

/// The syntax highlighting query for this language.
pub const HIGHLIGHTS_QUERY: &str = include_str!("../../queries/highlights.scm");

/// The injection query for this language.
pub const INJECTIONS_QUERY: &str = include_str!("../../queries/injections.scm");

/// The locals query for this language.
pub const LOCALS_QUERY: &str = include_str!("../../queries/locals.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(super::language())
            .expect("Error loading RSX grammar");
    }
}
