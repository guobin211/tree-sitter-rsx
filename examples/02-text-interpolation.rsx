---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "name": "Alice",
        "site": {
            "name": "RSX Framework",
            "version": "1.0.0"
        },
        "count": 42
    })
}
---

<script>
interface Site {
    name: string
    version: string
}

const { name, site, count } = defineProps<{
    name: string
    site: Site
    count: number
}>()
</script>

<template>
    <div class="welcome">
        <h1>Hello, {{ name }}!</h1>
        <p>Welcome to {{ site.name }} v{{ site.version }}</p>
        <p>You have {{ count }} notifications</p>
    </div>
</template>

<style>
.welcome {
    font-family: sans-serif;
    padding: 20px;

    h1 {
        color: #333;
    }

    p {
        color: #666;
    }
}
</style>
