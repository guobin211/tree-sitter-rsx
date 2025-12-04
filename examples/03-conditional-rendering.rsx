---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "porridge": {
            "temperature": 85
        },
        "isLoggedIn": true,
        "userRole": "admin"
    })
}
---

<script>
interface Porridge {
    temperature: number
}

const { porridge, isLoggedIn, userRole } = defineProps<{
    porridge: Porridge
    isLoggedIn: boolean
    userRole: string
}>()
</script>

<template>
    <div class="conditions">
        {{@if porridge.temperature > 100}}
            <p class="hot">Too hot!</p>
        {{:else if porridge.temperature < 80}}
            <p class="cold">Too cold!</p>
        {{:else}}
            <p class="perfect">Just right!</p>
        {{/if}}

        {{@if isLoggedIn}}
            <div class="user-panel">
                {{@if userRole == "admin"}}
                    <p>Welcome, Administrator!</p>
                {{:else if userRole == "moderator"}}
                    <p>Welcome, Moderator!</p>
                {{:else}}
                    <p>Welcome, User!</p>
                {{/if}}
            </div>
        {{:else}}
            <p>Please log in to continue.</p>
        {{/if}}
    </div>
</template>

<style>
.conditions {
    padding: 20px;

    .hot {
        color: red;
    }

    .cold {
        color: blue;
    }

    .perfect {
        color: green;
    }

    .user-panel {
        background: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
    }
}
</style>
