---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "title": "Comments Demo",
        "showContent": true
    })
}
---

<script>
const { title, showContent } = defineProps<{
    title: string
    showContent: boolean
}>()
</script>

<template>
    <div class="comments-demo">
        <!-- This is a simple HTML comment -->
        <h1>{{ title }}</h1>

        <!-- 
            Multi-line comment
            explaining the section below
        -->
        <section>
            <!-- Conditional section -->
            {{@if showContent}}
                <!-- Content is visible -->
                <p>This content is shown</p>
            {{:else}}
                <!-- Content is hidden -->
                <p>Content hidden</p>
            {{/if}}
        </section>

        <!-- TODO: Add more features -->
        <!-- FIXME: Fix styling issues -->
        <!-- NOTE: This is important -->

        <!--
            Comments can contain special characters:
            <div> tags, {{ interpolation }}, @directives
            They are all treated as plain text
        -->
    </div>
</template>

<style>
.comments-demo {
    padding: 20px;
}
</style>
