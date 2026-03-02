#include "tree_sitter/parser.h"

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
  (void)payload;
}

unsigned tree_sitter_rsx_external_scanner_serialize(void *payload, char *buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_rsx_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

static void advance(TSLexer *lexer) {
  lexer->advance(lexer, false);
}

static bool is_line_break(int32_t ch) {
  return ch == '\n' || ch == '\r';
}

// Scan rust content until ---
static bool scan_rust_content(TSLexer *lexer) {
  bool found_content = false;
  bool at_line_start = true;
  
  while (lexer->lookahead != 0) {
    // Frontmatter end must be a standalone line delimiter.
    if (at_line_start && lexer->lookahead == '-') {
      lexer->mark_end(lexer);
      advance(lexer);
      if (lexer->lookahead == '-') {
        advance(lexer);
        if (lexer->lookahead == '-') {
          advance(lexer);
          if (lexer->lookahead == 0 || is_line_break(lexer->lookahead)) {
            // Found closing line `---`, don't consume it.
            return found_content;
          }
        }
      }

      found_content = true;
      at_line_start = false;
      lexer->mark_end(lexer);
    } else {
      int32_t current = lexer->lookahead;
      advance(lexer);
      found_content = true;
      at_line_start = is_line_break(current);
      lexer->mark_end(lexer);
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
      lexer->mark_end(lexer);
    } else {
      advance(lexer);
      found_content = true;
      lexer->mark_end(lexer);
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
      lexer->mark_end(lexer);
    } else {
      advance(lexer);
      found_content = true;
      lexer->mark_end(lexer);
    }
  }
  
  return found_content;
}

// Scan template text until we hit special characters
static bool scan_template_text(TSLexer *lexer) {
  bool found_content = false;
  
  while (lexer->lookahead != 0) {
    // Stop at < (HTML tag) or {{ (interpolation/directive) or end of template.
    if (lexer->lookahead == '<') {
      break;
    }

    if (lexer->lookahead == '{') {
      lexer->mark_end(lexer);
      advance(lexer);
      if (lexer->lookahead == '{') {
        break;
      }

      found_content = true;
      lexer->mark_end(lexer);
      continue;
    }

    advance(lexer);
    found_content = true;
    lexer->mark_end(lexer);
  }
  
  return found_content;
}

bool tree_sitter_rsx_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  (void)payload;

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
