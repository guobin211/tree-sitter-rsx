---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    let markdown_content = render_markdown("# Hello\n\nThis is **bold** text.").await;
    let sanitized_html = sanitize_html(user_input).await;

    Response::json!({
        "rawHtmlContent": "<strong>Bold</strong> and <em>italic</em> text",
        "markdownRendered": markdown_content,
        "userContent": sanitized_html,
        "richText": {
            "html": "<p>Paragraph with <a href='#'>link</a></p>"
        }
    })
}
---

<script>
interface RichText {
    html: string
}

const { rawHtmlContent, markdownRendered, userContent, richText } = defineProps<{
    rawHtmlContent: string
    markdownRendered: string
    userContent: string
    richText: RichText
}>()
</script>

<template>
    <div class="raw-html-demo">
        <h1>Raw HTML Output Demo</h1>

        <!-- Basic raw HTML -->
        <section class="section">
            <h2>Basic Raw HTML</h2>
            <div class="content">
                {{@html rawHtmlContent}}
            </div>
        </section>

        <!-- Markdown rendered content -->
        <section class="section">
            <h2>Markdown Content</h2>
            <article class="markdown-body">
                {{@html markdownRendered}}
            </article>
        </section>

        <!-- User generated content (sanitized) -->
        <section class="section">
            <h2>User Content</h2>
            <div class="user-content">
                {{@html userContent}}
            </div>
        </section>

        <!-- Property access with raw HTML -->
        <section class="section">
            <h2>Rich Text Editor Output</h2>
            <div class="rich-text">
                {{@html richText.html}}
            </div>
        </section>

        <!-- Conditional raw HTML -->
        {{@if rawHtmlContent}}
            <section class="section">
                <h2>Conditional Raw HTML</h2>
                <div>
                    {{@html rawHtmlContent}}
                </div>
            </section>
        {{/if}}
    </div>
</template>

<style>
.raw-html-demo {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;

    h1 {
        text-align: center;
        margin-bottom: 30px;
    }

    .section {
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 8px;

        h2 {
            margin-bottom: 15px;
            font-size: 18px;
            color: #333;
        }
    }

    .content {
        padding: 10px;
        background: #f5f5f5;
        border-radius: 4px;
    }

    .markdown-body {
        line-height: 1.6;

        h1, h2, h3 {
            margin-top: 20px;
            margin-bottom: 10px;
        }

        p {
            margin-bottom: 10px;
        }

        a {
            color: #007bff;
        }
    }

    .user-content {
        padding: 15px;
        background: #fff3cd;
        border-radius: 4px;
        border-left: 4px solid #ffc107;
    }

    .rich-text {
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 100px;
    }
}
</style>
