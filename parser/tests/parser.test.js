const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const RSXParser = require('..')

test('aggregates syntax errors into result.errors', () => {
    const parser = new RSXParser()
    const content = `---
async fn get_server_side_props(req: Request) -> Response {
    let x = ;
}
---
<template><div>ok</div></template>`

    const result = parser.parse(content)
    assert.ok(result.errors.length > 0)
    assert.ok(result.errors.some((error) => error.section === 'rust'))
    assert.ok(result.errors.some((error) => error.type === 'syntax_error' || error.type === 'missing_node'))
})

test('extracts nested each directives from example', () => {
    const parser = new RSXParser()
    const filePath = path.join(__dirname, '..', '..', 'examples', '05-nested-loops.rsx')
    const content = fs.readFileSync(filePath, 'utf8')
    const result = parser.parse(content)
    const templateSection = result.sections.find((section) => section.type === 'template_section')
    const eachDirectives = templateSection.directives.filter((directive) => directive.type === 'each_directive')

    assert.equal(eachDirectives.length, 2)
    assert.ok(eachDirectives.some((directive) => directive.array === 'categories'))
    assert.ok(eachDirectives.some((directive) => directive.array === 'category.items'))
})

test('supports raw html directive with function call expression', () => {
    const parser = new RSXParser()
    const content = '<template><div>{{@html renderMarkdown(content)}}</div></template>'
    const result = parser.parse(content)
    const templateSection = result.sections.find((section) => section.type === 'template_section')
    const rawHtmlDirectives = templateSection.directives.filter((directive) => directive.type === 'raw_html_directive')

    assert.equal(rawHtmlDirectives.length, 1)
    assert.equal(rawHtmlDirectives[0].content, 'renderMarkdown(content)')
})

test('reports invalid section order', () => {
    const parser = new RSXParser()
    const content = '<style>.a { color: red; }</style>\n<template><div>ok</div></template>'
    const result = parser.parse(content)

    assert.ok(result.errors.some((error) => error.type === 'invalid_section_order'))
})

test('only uppercase tags with client attribute are treated as client components', () => {
    const parser = new RSXParser()
    const content = `
<template>
    <div client="react"></div>
    <ReactApp client="react" />
</template>`
    const result = parser.parse(content)
    const templateSection = result.sections.find((section) => section.type === 'template_section')
    const clientComponents = templateSection.directives.filter((directive) => directive.type === 'client_component')

    assert.equal(clientComponents.length, 1)
    assert.equal(clientComponents[0].tagName, 'ReactApp')
})

test('parses component attributes with hyphen and colon characters', () => {
    const parser = new RSXParser()
    const content = `
<template>
    <ReactApp client="react" data-id="demo" aria-label="label" v-on:click="handleClick" />
</template>`
    const result = parser.parse(content)
    const templateSection = result.sections.find((section) => section.type === 'template_section')
    const clientComponent = templateSection.directives.find((directive) => directive.type === 'client_component')

    assert.ok(clientComponent)
    assert.equal(clientComponent.attributes['data-id'], 'demo')
    assert.equal(clientComponent.attributes['aria-label'], 'label')
    assert.equal(clientComponent.attributes['v-on:click'], 'handleClick')
})
