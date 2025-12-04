const RSXParser = require('./src/rsx-parser.js')
const fs = require('fs')

const parser = new RSXParser()

console.log('=== RSX Parser 功能测试 ===\n')

// Test 1: 双大括号条件指令
console.log('测试 1: 双大括号条件指令 {{#if}}')
const test1 = `
<template>
    {{#if count > 0}}
    <p>有数据</p>
    {{:else}}
    <p>无数据</p>
    {{/if}}
</template>
`
const result1 = parser.parse(test1)
const ifDirective = result1.sections[0]?.directives?.find(d => d.type === 'if_directive')
console.log('✓ 找到if指令:', ifDirective ? '是' : '否')
console.log('✓ 条件:', ifDirective?.condition)
console.log('✓ 分支数:', ifDirective?.branches?.length)
console.log()

// Test 2: {{@each}} 循环指令
console.log('测试 2: {{@each}} 循环指令')
const test2 = `
<template>
    {{@each users as user, index}}
    <li>{{ user.name }}</li>
    {{/each}}
</template>
`
const result2 = parser.parse(test2)
const eachDirective1 = result2.sections[0]?.directives?.find(d => d.type === 'each_directive')
console.log('✓ 找到each指令:', eachDirective1 ? '是' : '否')
console.log('✓ 数组:', eachDirective1?.array)
console.log('✓ 项目变量:', eachDirective1?.item)
console.log('✓ 索引变量:', eachDirective1?.index)
console.log()

// Test 3: {{#each}} 循环指令
console.log('测试 3: {{#each}} 循环指令')
const test3 = `
<template>
    {{#each items as item}}
    <div>{{ item }}</div>
    {{/each}}
</template>
`
const result3 = parser.parse(test3)
const eachDirective2 = result3.sections[0]?.directives?.find(d => d.type === 'each_directive')
console.log('✓ 找到each指令:', eachDirective2 ? '是' : '否')
console.log('✓ 数组:', eachDirective2?.array)
console.log('✓ 项目变量:', eachDirective2?.item)
console.log()

// Test 4: 复杂二元表达式
console.log('测试 4: 复杂二元表达式')
const test4 = `
<template>
    {{#if count > 0 && count < 100}}
    <p>范围内</p>
    {{/if}}
</template>
`
const result4 = parser.parse(test4)
const ifDirective2 = result4.sections[0]?.directives?.find(d => d.type === 'if_directive')
console.log('✓ 条件表达式:', ifDirective2?.condition)
console.log()

// Test 5: 三元表达式
console.log('测试 5: 三元表达式')
const test5 = `
<template>
    <p>{{ isActive ? 'active' : 'inactive' }}</p>
</template>
`
const result5 = parser.parse(test5)
const interpolation = result5.sections[0]?.directives?.find(d => d.type === 'interpolation')
console.log('✓ 找到插值:', interpolation ? '是' : '否')
console.log('✓ 表达式类型:', interpolation?.parsedExpression?.type)
console.log('✓ 条件:', interpolation?.parsedExpression?.condition)
console.log('✓ 真值:', interpolation?.parsedExpression?.trueValue)
console.log('✓ 假值:', interpolation?.parsedExpression?.falseValue)
console.log()

// Test 6: 一元表达式
console.log('测试 6: 一元表达式')
const test6 = `
<template>
    {{#if !isHidden}}
    <p>显示</p>
    {{/if}}
</template>
`
const result6 = parser.parse(test6)
const ifDirective3 = result6.sections[0]?.directives?.find(d => d.type === 'if_directive')
console.log('✓ 条件表达式:', ifDirective3?.condition)
console.log()

// Test 7: 客户端组件
console.log('测试 7: 客户端组件')
const test7 = `
<template>
    <ReactApp client="react" users="{{users}}" />
    <VueChart client="vue" data="{{data}}" />
</template>
`
const result7 = parser.parse(test7)
const clientComponents = result7.sections[0]?.directives?.filter(d => d.type === 'client_component')
console.log('✓ 找到客户端组件数:', clientComponents?.length)
console.log('✓ React组件:', clientComponents?.find(c => c.clientType === 'react')?.tagName)
console.log('✓ Vue组件:', clientComponents?.find(c => c.clientType === 'vue')?.tagName)
console.log()

// Test 8: 完整示例文件
console.log('测试 8: 完整示例文件')
const sampleContent = fs.readFileSync('./example/sample.rsx', 'utf-8')
const sampleResult = parser.parse(sampleContent)
console.log(parser.generateReport(sampleResult))

console.log('\n=== 所有测试完成 ===')
