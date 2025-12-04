---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "message": "Hello, RSX!"
    })
}
---

<script>
const { message } = defineProps<{
    message: string
}>()
</script>

<template>
    <div class="container">
        <h1>{{ message }}</h1>
    </div>
</template>

<style>
.container {
    padding: 20px;
    text-align: center;
}
</style>
