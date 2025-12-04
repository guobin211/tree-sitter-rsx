const RSXParser = require('../src/rsx-parser')
const fs = require('fs')
const path = require('path')

function testRSXParser() {
    console.log('🚀 Testing RSX Parser...\n')

    try {
        const parser = new RSXParser()

        const samplePath = path.join(__dirname, 'sample.rsx')
        const sampleRSXContent = fs.readFileSync(samplePath, 'utf8')

        const result = parser.parse(sampleRSXContent)

        console.log('📄 Parse Result:')
        console.log('================')
        console.log(`Type: ${result.type}`)
        console.log(`Sections found: ${result.sections.length}`)
        console.log(`Global errors: ${result.errors.length}`)
        console.log()

        result.sections.forEach((section, index) => {
            console.log(`📝 Section ${index + 1}: ${section.type}`)
            console.log('----------------------------')
            console.log(`Start: ${section.start}, End: ${section.end}`)
            console.log(`Content length: ${section.content.length} characters`)

            if (section.ast) {
                console.log(`AST root: ${section.ast.type}`)
                console.log(`AST children: ${section.ast.childCount}`)
            }

            if (section.directives) {
                console.log(`Template directives: ${section.directives.length}`)
                section.directives.forEach((directive) => {
                    const preview = directive.original?.substring(0, 40) || ''
                    console.log(`  - ${directive.type}: ${preview}...`)
                })
            }

            if (section.errors && section.errors.length > 0) {
                console.log(`❌ Errors: ${section.errors.length}`)
                section.errors.forEach((error) => {
                    console.log(`  - ${error.type}: ${error.message}`)
                })
            } else {
                console.log('✅ No errors')
            }

            console.log()
        })

        if (result.errors.length > 0) {
            console.log('❌ Global Errors:')
            console.log('==================')
            result.errors.forEach((error) => {
                console.log(`- [${error.severity || 'error'}] ${error.type}: ${error.message}`)
            })
            console.log()
        }

        const stats = parser.getParseStatistics(result)
        console.log('📊 Statistics:')
        console.log('===============')
        console.log(`Total sections: ${stats.totalSections}`)
        console.log(`Total directives: ${stats.directiveCount}`)
        console.log(`Total errors: ${stats.totalErrors}`)
        console.log()

        const outputPath = path.join(__dirname, 'parse-result.json')
        const outputData = {
            ...result,
            sections: result.sections.map(section => ({
                ...section,
                ast: section.ast ? { type: section.ast.type, childCount: section.ast.childCount } : null
            }))
        }
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2))
        console.log(`💾 Parse result saved to: ${outputPath}`)

        console.log('\n✨ RSX Parser test completed successfully!')
    } catch (error) {
        console.error('❌ Error testing RSX parser:', error)
        console.error(error.stack)
    }
}

if (require.main === module) {
    testRSXParser()
}

module.exports = { testRSXParser }
