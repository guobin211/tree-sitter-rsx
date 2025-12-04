---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "user": {
            "name": "Alice",
            "avatar": "/images/avatar.png"
        },
        "videoUrl": "https://example.com/video.mp4"
    })
}
---

<script>
interface User {
    name: string
    avatar: string
}

const { user, videoUrl } = defineProps<{
    user: User
    videoUrl: string
}>()
</script>

<template>
    <div class="self-closing-demo">
        <h1>Self-Closing Tags</h1>

        <!-- Image tags -->
        <img src="{{ user.avatar }}" alt="{{ user.name }}" />
        <img src="/logo.png" alt="Logo" />

        <!-- Input elements -->
        <input type="text" placeholder="Enter name" />
        <input type="email" placeholder="Enter email" />
        <input type="checkbox" checked />
        <input type="radio" name="option" value="1" />

        <!-- Line break and horizontal rule -->
        <br />
        <hr />

        <!-- Meta-like elements -->
        <meta name="description" content="Demo page" />
        <link rel="stylesheet" href="/styles.css" />

        <!-- Area and base -->
        <area shape="rect" coords="0,0,100,100" href="#" />
        <base href="/" />

        <!-- Embed and source -->
        <embed type="video/mp4" src="{{ videoUrl }}" />
        <source src="{{ videoUrl }}" type="video/mp4" />

        <!-- Track for video -->
        <track kind="subtitles" src="/subtitles.vtt" srclang="en" />

        <!-- Wbr for word break opportunity -->
        <p>Supercalifragilisticexpialidocious<wbr />isalongword</p>
    </div>
</template>

<style>
.self-closing-demo {
    padding: 20px;

    img {
        max-width: 100px;
        display: block;
        margin: 10px 0;
    }

    input {
        display: block;
        margin: 10px 0;
        padding: 8px;
    }

    hr {
        margin: 20px 0;
        border: none;
        border-top: 1px solid #eee;
    }
}
</style>
