const RSXParser = require('./src/rsx-parser.js');
const fs = require('fs');

// 读取示例文件
const sampleContent = fs.readFileSync('./example/sample.rsx', 'utf8');

// 提取template部分
const parser = new RSXParser();
const sections = parser.extractSections(sampleContent);

console.log('Template content:');
console.log('================');
console.log(sections.template.content);
console.log('\n');

// 测试处理过程
const directives = [];
const processed = parser.preprocessTemplate(sections.template.content, directives);

console.log('Processed content:');
console.log('==================');
console.log(processed);
console.log('\n');

console.log('Directives found:');
console.log('=================');
directives.forEach((directive, index) => {
    console.log(`${index + 1}. ${directive.type}:`);
    if (directive.type === 'if_directive') {
        console.log(`   Condition: ${directive.condition}`);
        console.log(`   Branches: ${directive.branches.length}`);
        directive.branches.forEach((branch, i) => {
            console.log(`     ${i + 1}. ${branch.type}: ${branch.condition || '(no condition)'}`);
            console.log(`        Body length: ${branch.body.length} chars`);
            if (branch.processedBody) {
                console.log(`        Processed body: ${branch.processedBody.substring(0, 100)}...`);
            }
        });
    } else if (directive.type === 'each_directive') {
        console.log(`   Array: ${directive.array}`);
        console.log(`   Item: ${directive.item}`);
        console.log(`   Index: ${directive.index || 'none'}`);
        console.log(`   Body length: ${directive.body.length} chars`);
    } else if (directive.type === 'interpolation') {
        console.log(`   Expression: ${directive.expression}`);
    } else {
        console.log(`   Original: ${directive.original?.substring(0, 50) || directive.expression || directive.content}...`);
    }
    console.log('');
});
