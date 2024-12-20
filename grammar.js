/**
 * @file rsx language
 * @author guobin211
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check


module.exports = grammar({
  name: 'rsx',

  extras: $ => [
    /\s/,
    $.comment
  ],

  rules: {
    // 文件根节点，使用唯一性约束
    source_file: $ => choice(
      // 4个块组合
      seq($.rust_block, $.script_block, $.template_block, $.style_block),
      seq($.rust_block, $.template_block, $.script_block, $.style_block),
      // 三个块的组合
      seq($.rust_block, $.script_block, $.template_block),
      seq($.rust_block, $.template_block, $.script_block),
      seq($.rust_block, $.template_block, $.style_block),
      // 两个块的组合
      seq($.rust_block, $.template_block),

      // 单个块
      $.rust_block,
      $.template_block,
      $.style_block,
      $.script_block
    ),

    // Rust 代码块
    rust_block: $ => seq(
      '---',
      alias(
        repeat(choice(
          /[^-]/,
          seq('-', /[^-]/),
          seq('-', '-', /[^-]/)
        )),
        $.rust_content
      ),
      '---'
    ),

    // HTML 模板块
    template_block: $ => seq(
      '<template>',
      alias(
        repeat(choice(
          /[^<]/,
          seq('<', /[^/]/),
          seq('</', /[^t]/),
          seq('</t', /[^e]/),
          seq('</te', /[^m]/),
          seq('</tem', /[^p]/),
          seq('</temp', /[^l]/),
          seq('</templ', /[^a]/),
          seq('</templa', /[^t]/),
          seq('</templat', /[^e]/),
          seq('</template', /[^>]/)
        )),
        $.html_content
      ),
      '</template>'
    ),

    // CSS 样式块
    style_block: $ => seq(
      '<style>',
      alias(
        repeat(choice(
          /[^<]/,
          seq('<', /[^/]/),
          seq('</', /[^s]/),
          seq('</s', /[^t]/),
          seq('</st', /[^y]/),
          seq('</sty', /[^l]/),
          seq('</styl', /[^e]/),
          seq('</style', /[^>]/)
        )),
        $.css_content
      ),
      '</style>'
    ),

    // JavaScript 脚本块
    script_block: $ => seq(
      '<script>',
      alias(
        repeat(choice(
          /[^<]/,
          seq('<', /[^/]/),
          seq('</', /[^s]/),
          seq('</s', /[^c]/),
          seq('</sc', /[^r]/),
          seq('</scr', /[^i]/),
          seq('</scri', /[^p]/),
          seq('</scrip', /[^t]/),
          seq('</script', /[^>]/)
        )),
        $.js_content
      ),
      '</script>'
    ),

    // 注释
    comment: $ => choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    )
  }
});
