---
use rsx::{Request, Response};
use chrono::Utc;

async fn get_server_side_props(req: Request) -> Response {
    let timestamp = Utc::now().timestamp();
    
    Response::json!({
        "serverTime": timestamp,
        "message": "Server-rendered content"
    })
}
---

<template>
    <div class="server-rendered">
        <h1>Server-Side Only</h1>
        <p>This page has Rust backend and template, but no client script.</p>
        <p>Server time: {{ serverTime }}</p>
        <p>{{ message }}</p>
    </div>
</template>
