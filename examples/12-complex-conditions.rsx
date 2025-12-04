---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "user": {
            "age": 25,
            "role": "admin",
            "isVerified": true,
            "isPremium": false,
            "loginCount": 100
        },
        "settings": {
            "darkMode": true,
            "notifications": true
        },
        "items": [1, 2, 3]
    })
}
---

<script>
interface User {
    age: number
    role: string
    isVerified: boolean
    isPremium: boolean
    loginCount: number
}

interface Settings {
    darkMode: boolean
    notifications: boolean
}

const { user, settings, items } = defineProps<{
    user: User
    settings: Settings
    items: number[]
}>()
</script>

<template>
    <div class="complex-conditions">
        <!-- Multiple AND conditions -->
        {{@if user.age >= 18 && user.isVerified && user.role == "admin"}}
            <div class="admin-panel">Full Admin Access</div>
        {{/if}}

        <!-- Multiple OR conditions -->
        {{@if user.role == "admin" || user.role == "moderator" || user.isPremium}}
            <div class="privileged">Privileged User</div>
        {{/if}}

        <!-- Mixed AND/OR with parentheses -->
        {{@if (user.age >= 18 && user.isVerified) || user.role == "admin"}}
            <div class="verified-or-admin">Verified Adult or Admin</div>
        {{/if}}

        <!-- Negation with complex conditions -->
        {{@if !(user.isPremium || user.role == "admin")}}
            <div class="upgrade-prompt">Consider upgrading to Premium!</div>
        {{/if}}

        <!-- Numeric comparisons -->
        {{@if user.loginCount > 50 && user.loginCount <= 200}}
            <div class="regular-user">Regular User</div>
        {{:else if user.loginCount > 200}}
            <div class="power-user">Power User</div>
        {{:else}}
            <div class="new-user">New User</div>
        {{/if}}

        <!-- Equality checks -->
        {{@if user.role === "admin"}}
            <p>Strict equality: admin</p>
        {{/if}}

        {{@if user.role !== "guest"}}
            <p>Strict inequality: not guest</p>
        {{/if}}

        <!-- Array length check -->
        {{@if items.length > 0}}
            <p>Has {{ items.length }} items</p>
        {{/if}}

        <!-- Boolean settings -->
        {{@if settings.darkMode && settings.notifications}}
            <p>Dark mode with notifications</p>
        {{:else if settings.darkMode}}
            <p>Dark mode only</p>
        {{:else if settings.notifications}}
            <p>Notifications only</p>
        {{:else}}
            <p>Default settings</p>
        {{/if}}

        <!-- Deeply nested conditions -->
        {{@if user.isVerified}}
            {{@if user.isPremium}}
                {{@if user.role == "admin"}}
                    <p>Verified Premium Admin</p>
                {{:else}}
                    <p>Verified Premium User</p>
                {{/if}}
            {{:else}}
                <p>Verified Free User</p>
            {{/if}}
        {{/if}}
    </div>
</template>

<style>
.complex-conditions {
    padding: 20px;

    div, p {
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
    }

    .admin-panel {
        background: #d4edda;
        border: 1px solid #28a745;
    }

    .privileged {
        background: #fff3cd;
        border: 1px solid #ffc107;
    }

    .upgrade-prompt {
        background: #cce5ff;
        border: 1px solid #007bff;
    }
}
</style>
