const RSXParser = require('../src/rsx-parser')
const fs = require('fs')
const path = require('path')

// 创建一个示例RSX文件内容
const sampleRSXContent = `---
async fn get_server_side_props(req: Request) -> Response {
    let data = fetch_data().await;
    Response::json!({
        "data": data,
    })
}
---

<script>
interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

const { users, onUserClick, showAvatar } = defineProps<{
    users: User[];
    onUserClick: (user: User) => void;
    showAvatar: boolean;
}>();
</script>

<template>
    <div class="user-container">
        <h1>Hello, {{ name }}!</h1>

        {#if users.length > 0}
            <ul class="user-list">
                {#each users as user, index}
                    <li class="user-item {{ showAvatar ? 'with-avatar' : 'no-avatar' }}"
                        data-index="{{ index }}">
                        {#if showAvatar && user.avatar}
                            <img src="{{ user.avatar }}" alt="{{ user.name }}" />
                        {/if}
                        <span class="user-name">{{ user.name }}</span>
                        <span class="user-email">{{ user.email }}</span>
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="empty-message">No users found.</p>
        {/if}

        <div class="raw-content">
            {{@html rawHtmlContent}}
        </div>
    </div>
</template>

<style>
.user-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.user-list {
    list-style: none;
    padding: 0;

    .user-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;

        &.with-avatar {
            padding-left: 60px;
        }

        img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
        }

        .user-name {
            font-weight: bold;
            margin-right: 10px;
        }

        .user-email {
            color: #666;
        }
    }
}

.empty-message {
    text-align: center;
    color: #999;
    font-style: italic;
}
</style>
`

// 创建并测试解析器
function testRSXParser() {
    console.log('🚀 Testing RSX Parser...\n')

    try {
        const parser = new RSXParser()

        // 从example/sample.rsx读取内容
        const samplePath = path.join(__dirname, 'sample.rsx')
        const sampleRSXContent = fs.readFileSync(samplePath, 'utf8')

        const result = parser.parse(sampleRSXContent)

        console.log('📄 Parse Result:')
        console.log('================')
        console.log(`Type: ${result.type}`)
        console.log(`Sections found: ${result.sections.length}`)
        console.log(`Global errors: ${result.errors.length}`)
        console.log()

        // 显示每个部分的解析结果
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
                section.directives.forEach((directive, _dirIndex) => {
                    console.log(`  - ${directive.type}: ${directive.original?.substring(0, 30)}...`)
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

        // 显示全局错误
        if (result.errors.length > 0) {
            console.log('❌ Global Errors:')
            console.log('==================')
            result.errors.forEach((error) => {
                console.log(`- ${error.type}: ${error.message}`)
            })
            console.log()
        }

        // 保存解析结果到文件
        const outputPath = path.join(__dirname, 'parse-result.json')
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
        console.log(`💾 Parse result saved to: ${outputPath}`)

        console.log('\n✨ RSX Parser test completed successfully!')
    } catch (error) {
        console.error('❌ Error testing RSX parser:', error)
        console.error(error.stack)
    }
}

// 运行测试
if (require.main === module) {
    testRSXParser()
}

module.exports = { testRSXParser, sampleRSXContent }
