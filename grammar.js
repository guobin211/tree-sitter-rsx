/**
 * @file RSX grammar for tree-sitter
 * @author michael <michaelbguo@tencent.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'rsx',

  extras: $ => [/\s/],

  externals: $ => [
    $.rust_content,
    $.script_content,
    $.style_content,
    $.template_text,
  ],

  rules: {
    // RSX file structure: each section can appear at most once
    source_file: $ => seq(
      optional($.rust_section),
      optional($.script_section),
      optional($.template_section),
      optional($.style_section),
    ),

    // Rust frontmatter section: ---\n...\n---
    rust_section: $ => seq(
      '---',
      optional(/\r?\n/),
      optional($.rust_content),
      '---',
      optional(/\r?\n/),
    ),

    // Script section: <script>...</script>
    script_section: $ => seq(
      '<script>',
      optional(/\r?\n/),
      optional($.script_content),
      '</script>',
      optional(/\r?\n/),
    ),

    // Template section: <template>...</template>
    template_section: $ => seq(
      '<template>',
      optional($.template_body),
      '</template>',
      optional(/\r?\n/),
    ),

    // Style section: <style>...</style>
    style_section: $ => seq(
      '<style>',
      optional(/\r?\n/),
      optional($.style_content),
      '</style>',
      optional(/\r?\n/),
    ),

    // Template body content
    template_body: $ => repeat1(choice(
      $.template_text,
      $.template_interpolation,
      $.if_directive,
      $.each_directive,
      $.raw_html_directive,
      $.template_comment,
      $.html_element,
      $.client_component,
    )),

    // HTML element: <tag ...>...</tag> or <tag ... />
    html_element: $ => choice(
      // Self-closing tag
      seq(
        '<',
        field('tag_name', $.tag_name),
        repeat($.html_attribute),
        '/>',
      ),
      // Opening and closing tag
      seq(
        '<',
        field('tag_name', $.tag_name),
        repeat($.html_attribute),
        '>',
        optional($.template_body),
        '</',
        $.tag_name,
        '>',
      ),
    ),

    // Client component: <Component client="react|vue|svelte" ... />
    client_component: $ => choice(
      // Self-closing client component
      seq(
        '<',
        field('component_name', $.component_name),
        repeat($.html_attribute),
        '/>',
      ),
      // Opening and closing client component
      seq(
        '<',
        field('component_name', $.component_name),
        repeat($.html_attribute),
        '>',
        optional($.template_body),
        '</',
        $.component_name,
        '>',
      ),
    ),

    // Component name starts with uppercase (PascalCase)
    component_name: $ => /[A-Z][a-zA-Z0-9_]*/,

    // HTML tag name starts with lowercase
    tag_name: $ => /[a-z][a-zA-Z0-9_-]*/,

    // HTML attribute: name="value" or name={{value}} or name
    html_attribute: $ => seq(
      field('name', $.attribute_name),
      optional(seq(
        '=',
        field('value', choice(
          $.quoted_attribute_value,
          $.template_interpolation,
        )),
      )),
    ),

    attribute_name: $ => /[a-zA-Z_:@][a-zA-Z0-9_:@.-]*/,

    quoted_attribute_value: $ => choice(
      seq('"', optional($.attribute_value_content), '"'),
      seq("'", optional($.attribute_value_content_single), "'"),
    ),

    attribute_value_content: $ => repeat1(choice(
      /[^"{}]+/,
      $.template_interpolation,
    )),

    attribute_value_content_single: $ => repeat1(choice(
      /[^'{}]+/,
      $.template_interpolation,
    )),

    // Template interpolation: {{ expression }}
    template_interpolation: $ => seq(
      '{{',
      field('expression', $._expression),
      '}}',
    ),

    // If directive: {{@if condition}}...{{:else if}}...{{:else}}...{{/if}}
    if_directive: $ => seq(
      '{{@if',
      field('condition', $._expression),
      '}}',
      field('consequence', optional($.template_body)),
      repeat($.else_if_clause),
      optional($.else_clause),
      '{{/if}}',
    ),

    // else if clause: {{:else if condition}}
    else_if_clause: $ => seq(
      choice('{{:else if', '{{:elseif'),
      field('condition', $._expression),
      '}}',
      field('body', optional($.template_body)),
    ),

    else_clause: $ => seq(
      '{{:else}}',
      field('body', optional($.template_body)),
    ),

    // Each directive: {{@each array as item, index}}...{{/each}}
    each_directive: $ => seq(
      '{{@each',
      field('iterable', $._expression),
      'as',
      field('item', $.identifier),
      optional(seq(',', field('index', $.identifier))),
      '}}',
      field('body', optional($.template_body)),
      '{{/each}}',
    ),

    // Raw HTML directive: {{@html content}}
    raw_html_directive: $ => seq(
      '{{@html',
      field('content', $._expression),
      '}}',
    ),

    // Expressions
    _expression: $ => choice(
      $.identifier,
      $.property_access,
      $.function_call,
      $.binary_expression,
      $.unary_expression,
      $.conditional_expression,
      $.parenthesized_expression,
      $.string_literal,
      $.number_literal,
      $.boolean_literal,
    ),

    // Parenthesized expression: (expression)
    parenthesized_expression: $ => seq(
      '(',
      $._expression,
      ')',
    ),

    // Binary expression: left op right
    binary_expression: $ => prec.left(1, seq(
      field('left', $._expression),
      field('operator', choice(
        '>', '<', '>=', '<=', '==', '!=', '===', '!==',
        '&&', '||',
        '+', '-', '*', '/', '%',
      )),
      field('right', $._expression),
    )),

    // Unary expression: !operand or -operand
    unary_expression: $ => prec(3, seq(
      field('operator', choice('!', '-')),
      field('operand', $._expression),
    )),

    // Property access: obj.prop.subprop
    property_access: $ => prec.left(2, seq(
      field('object', $._callable),
      '.',
      field('property', $.identifier),
    )),

    // Function call: func(args)
    function_call: $ => prec.left(3, seq(
      field('function', $._callable),
      '(',
      field('arguments', optional($.argument_list)),
      ')',
    )),

    _callable: $ => choice(
      $.identifier,
      $.property_access,
      $.function_call,
    ),

    argument_list: $ => seq(
      $._expression,
      repeat(seq(',', $._expression)),
    ),

    // Conditional (ternary) expression: cond ? true : false
    conditional_expression: $ => prec.right(0, seq(
      field('condition', $._expression),
      '?',
      field('consequence', $._expression),
      ':',
      field('alternative', $._expression),
    )),

    // HTML comment: <!-- ... -->
    template_comment: $ => seq(
      '<!--',
      /[^-]*(-[^-]+)*/,
      '-->',
    ),

    // Identifiers
    identifier: $ => /[a-zA-Z_$][a-zA-Z0-9_$]*/,

    // String literal: "..." or '...'
    string_literal: $ => choice(
      seq('"', /[^"]*/, '"'),
      seq("'", /[^']*/, "'"),
    ),

    // Number literal
    number_literal: $ => /\d+(\.\d+)?/,

    // Boolean literal
    boolean_literal: $ => choice('true', 'false'),
  },
});
