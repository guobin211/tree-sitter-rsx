#include "tree_sitter/parser.h"
#include <string.h>
#include <wctype.h>

enum TokenType {
  RUST_CONTENT,
  SCRIPT_CONTENT,
  STYLE_CONTENT,
  TEMPLATE_TEXT,
};

void *tree_sitter_rsx_external_scanner_create() {
  return NULL;
}

void tree_sitter_rsx_external_scanner_destroy(void *payload) {
}

unsigned tree_sitter_rsx_external_scanner_serialize(void *payload, char *buffer) {
  return 0;
}

void tree_sitter_rsx_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
}

static void advance(TSLexer *lexer) {
  lexer->advance(lexer, false);
}

static void skip(TSLexer *lexer) {
  lexer->advance(lexer, true);
}

// Scan rust content until ---
static bool scan_rust_content(TSLexer *lexer) {
  bool found_content = false;
  
  while (lexer->lookahead != 0) {
    if (lexer->lookahead == '-') {
      lexer->mark_end(lexer);
      advance(lexer);
      if (lexer->lookahead == '-') {
        advance(lexer);
        if (lexer->lookahead == '-') {
          // Found ---, don't consume it
          return found_content;
        }
      }
      found_content = true;
    } else {
      advance(lexer);
      found_content = true;
    }
  }
  
  return found_content;
}

// Scan script content until </script>
static bool scan_script_content(TSLexer *lexer) {
  bool found_content = false;
  
  while (lexer->lookahead != 0) {
    if (lexer->lookahead == '<') {
      lexer->mark_end(lexer);
      advance(lexer);
      if (lexer->lookahead == '/') {
        advance(lexer);
        if (lexer->lookahead == 's') {
          advance(lexer);
          if (lexer->lookahead == 'c') {
            advance(lexer);
            if (lexer->lookahead == 'r') {
              advance(lexer);
              if (lexer->lookahead == 'i') {
                advance(lexer);
                if (lexer->lookahead == 'p') {
                  advance(lexer);
                  if (lexer->lookahead == 't') {
                    advance(lexer);
                    if (lexer->lookahead == '>') {
                      // Found </script>, don't consume it
                      return found_content;
                    }
                  }
                }
              }
            }
          }
        }
      }
      found_content = true;
    } else {
      advance(lexer);
      found_content = true;
    }
  }
  
  return found_content;
}

// Scan style content until </style>
static bool scan_style_content(TSLexer *lexer) {
  bool found_content = false;
  
  while (lexer->lookahead != 0) {
    if (lexer->lookahead == '<') {
      lexer->mark_end(lexer);
      advance(lexer);
      if (lexer->lookahead == '/') {
        advance(lexer);
        if (lexer->lookahead == 's') {
          advance(lexer);
          if (lexer->lookahead == 't') {
            advance(lexer);
            if (lexer->lookahead == 'y') {
              advance(lexer);
              if (lexer->lookahead == 'l') {
                advance(lexer);
                if (lexer->lookahead == 'e') {
                  advance(lexer);
                  if (lexer->lookahead == '>') {
                    // Found </style>, don't consume it
                    return found_content;
                  }
                }
              }
            }
          }
        }
      }
      found_content = true;
    } else {
      advance(lexer);
      found_content = true;
    }
  }
  
  return found_content;
}

// Scan template text until we hit special characters
static bool scan_template_text(TSLexer *lexer) {
  bool found_content = false;
  
  while (lexer->lookahead != 0) {
    // Stop at < (HTML tag) or { (interpolation/directive) or end of template
    if (lexer->lookahead == '<' || lexer->lookahead == '{') {
      break;
    }
    
    advance(lexer);
    found_content = true;
  }
  
  if (found_content) {
    lexer->mark_end(lexer);
  }
  
  return found_content;
}

bool tree_sitter_rsx_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  // Skip leading whitespace for content tokens
  if (valid_symbols[RUST_CONTENT] || valid_symbols[SCRIPT_CONTENT] || valid_symbols[STYLE_CONTENT]) {
    while (iswspace(lexer->lookahead)) {
      skip(lexer);
    }
  }

  if (valid_symbols[RUST_CONTENT]) {
    if (scan_rust_content(lexer)) {
      lexer->result_symbol = RUST_CONTENT;
      return true;
    }
  }

  if (valid_symbols[SCRIPT_CONTENT]) {
    if (scan_script_content(lexer)) {
      lexer->result_symbol = SCRIPT_CONTENT;
      return true;
    }
  }

  if (valid_symbols[STYLE_CONTENT]) {
    if (scan_style_content(lexer)) {
      lexer->result_symbol = STYLE_CONTENT;
      return true;
    }
  }

  if (valid_symbols[TEMPLATE_TEXT]) {
    if (scan_template_text(lexer)) {
      lexer->result_symbol = TEMPLATE_TEXT;
      return true;
    }
  }

  return false;
}
