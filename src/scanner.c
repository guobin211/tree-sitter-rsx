#include <tree_sitter/parser.h>
#include <wctype.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

enum TokenType {
    RUST_CONTENT,
    SCRIPT_CONTENT,
    TEMPLATE_CONTENT,
    STYLE_CONTENT
};

// RSX文件的解析状态
typedef struct {
    bool in_rust_section;
    bool in_script_section;
    bool in_template_section;
    bool in_style_section;
} Scanner;

// 工具函数：跳过空白字符
static void skip_whitespace(TSLexer *lexer) {
    while (iswspace(lexer->lookahead)) {
        lexer->advance(lexer, true);
    }
}

// 工具函数：检查字符串匹配
static bool match_string(TSLexer *lexer, const char *string) {
    size_t len = strlen(string);
    for (size_t i = 0; i < len; i++) {
        if (lexer->lookahead != string[i]) {
            return false;
        }
        lexer->advance(lexer, false);
    }
    return true;
}

// 工具函数：查找结束标记
static bool find_end_marker(TSLexer *lexer, const char *end_marker) {
    while (lexer->lookahead != 0) {
        if (lexer->lookahead == end_marker[0] && match_string(lexer, end_marker)) {
            return true;
        }
        lexer->advance(lexer, false);
    }
    return false;
}

// 扫描Rust代码块
static bool scan_rust_content(Scanner *scanner, TSLexer *lexer) {
    // 查找 "---" 结束标记
    while (lexer->lookahead != 0) {
        if (lexer->lookahead == '-') {
            lexer->mark_end(lexer);
            if (match_string(lexer, "---")) {
                lexer->result_symbol = RUST_CONTENT;
                return true;
            }
        }
        lexer->advance(lexer, false);
    }
    return false;
}

// 扫描Script代码块
static bool scan_script_content(Scanner *scanner, TSLexer *lexer) {
    // 查找 "</script>" 结束标记
    while (lexer->lookahead != 0) {
        if (lexer->lookahead == '<') {
            lexer->mark_end(lexer);
            if (match_string(lexer, "</script>")) {
                lexer->result_symbol = SCRIPT_CONTENT;
                return true;
            }
        }
        lexer->advance(lexer, false);
    }
    return false;
}

// 扫描Template代码块
static bool scan_template_content(Scanner *scanner, TSLexer *lexer) {
    // 在template中需要特殊处理，因为包含HTML和模板语法
    int brace_depth = 0;
    
    while (lexer->lookahead != 0) {
        if (lexer->lookahead == '<') {
            lexer->mark_end(lexer);
            if (match_string(lexer, "</template>")) {
                lexer->result_symbol = TEMPLATE_CONTENT;
                return true;
            }
        } else if (lexer->lookahead == '{') {
            brace_depth++;
            lexer->advance(lexer, false);
        } else if (lexer->lookahead == '}') {
            brace_depth--;
            lexer->advance(lexer, false);
        } else {
            lexer->advance(lexer, false);
        }
    }
    return false;
}

// 扫描Style代码块
static bool scan_style_content(Scanner *scanner, TSLexer *lexer) {
    // 查找 "</style>" 结束标记
    while (lexer->lookahead != 0) {
        if (lexer->lookahead == '<') {
            lexer->mark_end(lexer);
            if (match_string(lexer, "</style>")) {
                lexer->result_symbol = STYLE_CONTENT;
                return true;
            }
        }
        lexer->advance(lexer, false);
    }
    return false;
}

void *tree_sitter_rsx_external_scanner_create() {
    Scanner *scanner = calloc(1, sizeof(Scanner));
    scanner->in_rust_section = false;
    scanner->in_script_section = false;
    scanner->in_template_section = false;
    scanner->in_style_section = false;
    return scanner;
}

void tree_sitter_rsx_external_scanner_destroy(void *payload) {
    Scanner *scanner = (Scanner*)payload;
    free(scanner);
}

unsigned tree_sitter_rsx_external_scanner_serialize(void *payload, char *buffer) {
    Scanner *scanner = (Scanner*)payload;
    buffer[0] = (char)((scanner->in_rust_section ? 1 : 0) |
                      (scanner->in_script_section ? 2 : 0) |
                      (scanner->in_template_section ? 4 : 0) |
                      (scanner->in_style_section ? 8 : 0));
    return 1;
}

void tree_sitter_rsx_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
    Scanner *scanner = (Scanner*)payload;
    if (length >= 1) {
        char flags = buffer[0];
        scanner->in_rust_section = (flags & 1) != 0;
        scanner->in_script_section = (flags & 2) != 0;
        scanner->in_template_section = (flags & 4) != 0;
        scanner->in_style_section = (flags & 8) != 0;
    } else {
        scanner->in_rust_section = false;
        scanner->in_script_section = false;
        scanner->in_template_section = false;
        scanner->in_style_section = false;
    }
}

// 简化的内容扫描：直接返回到结束标记前的所有内容
static bool scan_content_until(TSLexer *lexer, const char *end_marker, enum TokenType token_type) {
    while (lexer->lookahead != 0) {
        // 检查是否遇到结束标记
        if (lexer->lookahead == end_marker[0]) {
            // 保存当前位置
            TSLexer saved_lexer = *lexer;
            bool matches = true;
            
            // 检查完整的结束标记
            for (size_t i = 0; i < strlen(end_marker); i++) {
                if (lexer->lookahead != end_marker[i]) {
                    matches = false;
                    break;
                }
                if (i < strlen(end_marker) - 1) {
                    lexer->advance(lexer, false);
                }
            }
            
            if (matches) {
                // 如果匹配，设置结束位置并返回token
                lexer->mark_end(lexer);
                lexer->result_symbol = token_type;
                return true;
            } else {
                // 如果不匹配，恢复位置继续
                *lexer = saved_lexer;
            }
        }
        lexer->advance(lexer, false);
    }
    return false;
}

bool tree_sitter_rsx_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
    Scanner *scanner = (Scanner*)payload;
    
    // 扫描Rust内容
    if (valid_symbols[RUST_CONTENT]) {
        return scan_content_until(lexer, "---", RUST_CONTENT);
    }
    
    // 扫描Script内容
    if (valid_symbols[SCRIPT_CONTENT]) {
        return scan_content_until(lexer, "</script>", SCRIPT_CONTENT);
    }
    
    // 扫描Template内容（HTML部分）
    if (valid_symbols[TEMPLATE_CONTENT]) {
        // Template内容比较复杂，需要处理HTML元素
        while (lexer->lookahead != 0) {
            if (lexer->lookahead == '<') {
                // 检查是否是结束标记或模板指令
                TSLexer saved_lexer = *lexer;
                lexer->advance(lexer, false);
                
                if (lexer->lookahead == '/') {
                    *lexer = saved_lexer;
                    // 检查是否是</template>
                    if (scan_content_until(lexer, "</template>", TEMPLATE_CONTENT)) {
                        return true;
                    }
                } else if (lexer->lookahead == '!' && 
                          lexer->lookahead == '-') {
                    // HTML注释，继续处理
                    *lexer = saved_lexer;
                } else {
                    // 普通HTML标签，继续处理
                    *lexer = saved_lexer;
                }
            } else if (lexer->lookahead == '{') {
                // 模板指令，不作为template_content处理
                lexer->mark_end(lexer);
                lexer->result_symbol = TEMPLATE_CONTENT;
                return true;
            }
            lexer->advance(lexer, false);
        }
    }
    
    // 扫描Style内容
    if (valid_symbols[STYLE_CONTENT]) {
        return scan_content_until(lexer, "</style>", STYLE_CONTENT);
    }
    
    return false;
}
