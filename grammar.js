/**
 * @file The rsx language
 * @author michael <michaelbguo@tencent.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "rsx",

  externals: $ => [
    $.rust_content,
    $.script_content,
    $.template_content,
    $.style_content,
  ],

  conflicts: $ => [
    [$.template_interpolation, $.template_directive],
    [$.template_body, $.if_directive],
    [$.template_body, $.each_directive]
  ],

  rules: {
    // RSX文件的主要结构
    source_file: $ => repeat(choice(
      $.rust_section,
      $.script_section,
      $.template_section,
      $.style_section,
      $.comment,
      /\s+/
    )),

    // Rust部分：用三个破折号包围，内容由外部解析器处理
    rust_section: $ => seq(
      '---',
      optional(/\r?\n/),
      optional($.rust_content),
      '---',
      optional(/\r?\n/)
    ),

    // Script部分：JavaScript/TypeScript，内容由外部解析器处理
    script_section: $ => seq(
      '<script>',
      optional(/\r?\n/),
      optional($.script_content),
      '</script>',
      optional(/\r?\n/)
    ),

    // Template部分：HTML + Handlebars模板语法
    template_section: $ => seq(
      '<template>',
      optional(/\r?\n/),
      optional($.template_body),
      '</template>',
      optional(/\r?\n/)
    ),

    // Template内容包含HTML和模板指令
    template_body: $ => repeat1(choice(
      $.template_content, // HTML内容由外部解析器处理
      $.template_interpolation,
      $.template_directive,
      $.template_comment,
      /[^{<]+/ // 普通文本
    )),

    // 模板插值 {{ expression }}
    template_interpolation: $ => seq(
      '{{',
      optional(/\s+/),
      field('expression', choice(
        $.identifier,
        $.property_access,
        $.conditional_expression
      )),
      optional(/\s+/),
      '}}'
    ),

    // 模板指令：条件和循环
    template_directive: $ => choice(
      $.if_directive,
      $.each_directive,
      $.raw_html_directive
    ),

    // 条件指令 {#if} {:else if} {:else} {/if}
    if_directive: $ => seq(
      '{#if',
      /\s+/,
      field('condition', $.condition_expression),
      '}',
      repeat(/[^{]+/),
      optional(seq(
        '{:else}',
        repeat(/[^{]+/)
      )),
      '{/if}'
    ),

    // 循环指令 {#each array as item, index}
    each_directive: $ => seq(
      '{#each',
      /\s+/,
      field('array', $.identifier),
      /\s+/,
      'as',
      /\s+/,
      field('item', $.identifier),
      optional(seq(
        ',',
        /\s*/,
        field('index', $.identifier)
      )),
      '}',
      repeat(/[^{]+/),
      '{/each}'
    ),

    // Raw HTML指令 {{@html content}}
    raw_html_directive: $ => seq(
      '{{@html',
      /\s+/,
      field('content', $.identifier),
      '}}'
    ),

    // 条件表达式
    condition_expression: $ => seq(
      field('left', $.identifier),
      optional(seq(
        field('operator', choice('>', '<', '>=', '<=', '==', '!=')),
        field('right', choice($.identifier, $.number_literal))
      ))
    ),

    // 属性访问 user.name
    property_access: $ => prec.left(1, seq(
      $.identifier,
      repeat1(seq('.', $.identifier))
    )),

    // 条件表达式 condition ? true_value : false_value
    conditional_expression: $ => seq(
      field('condition', $.identifier),
      /\s*/,
      '?',
      /\s*/,
      field('true_value', choice($.identifier, $.string_literal)),
      /\s*/,
      ':',
      /\s*/,
      field('false_value', choice($.identifier, $.string_literal))
    ),

    // 模板注释
    template_comment: $ => seq(
      '<!--',
      repeat(choice(
        /[^-]+/,
        /-[^-]/,
        /--[^>]/
      )),
      '-->'
    ),

    // Style部分：CSS/SCSS，内容由外部解析器处理
    style_section: $ => seq(
      '<style>',
      optional(/\r?\n/),
      optional($.style_content),
      '</style>',
      optional(/\r?\n/)
    ),

    // 基本tokens
    identifier: $ => /[a-zA-Z_$][a-zA-Z0-9_$]*/,
    
    string_literal: $ => choice(
      seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),
      seq("'", repeat(choice(/[^'\\]/, /\\./)), "'")
    ),
    
    number_literal: $ => /\d+(\.\d+)?/,
    
    boolean_literal: $ => choice('true', 'false'),

    // 注释
    comment: $ => choice(
      seq('//', /.*/),
      seq('/*', repeat(choice(/[^*]+/, /\*[^\/]/)), '*/')
    )
  }
});
