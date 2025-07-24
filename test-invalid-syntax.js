const RSXParser = require('./src/rsx-parser.js');
const fs = require('fs');

console.log('🧪 Testing RSX Parser with invalid single-brace syntax...\n');

// 读取无效语法的文件
const invalidContent = fs.readFileSync('./example/invalid-syntax.rsx', 'utf8');

const parser = new RSXParser();
const result = parser.parse(invalidContent);

console.log('📄 Parse Result:');
console.log('================');
console.log(`Type: ${result.type}`);
console.log(`Sections found: ${result.sections.length}`);
console.log(`Global errors: ${result.errors.length}`);
console.log();

// 检查template section
const templateSection = result.sections.find(s => s.type === 'template_section');
if (templateSection) {
    console.log('📝 Template Section:');
    console.log('-------------------');
    console.log(`Template directives found: ${templateSection.directives?.length || 0}`);

    if (templateSection.directives && templateSection.directives.length > 0) {
        console.log('Directives:');
        templateSection.directives.forEach((directive, index) => {
            console.log(`  ${index + 1}. ${directive.type}: ${directive.original?.substring(0, 30) || directive.expression}...`);
        });
    } else {
        console.log('❌ No template directives found - single braces correctly rejected!');
    }

    console.log('\nTemplate content was processed as:');
    console.log(templateSection.content.substring(0, 200) + '...');
}

console.log('\n✅ Test completed!');
