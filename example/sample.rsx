---
use rsx::{Request, Response};
use api::{fetch_data};

async fn get_server_side_props(req: Request) -> Response {
    let data = fetch_data().await;
    Response::json!({
        "users": data,
        "showAvatar": false
    })
}
---

<script>
import { defineProps } from 'rsx';
import App from './react/app.tsx';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

const { users, onUserClick, showAvatar } = defineProps<{
    users: User[];
    showAvatar: boolean;
}>();
</script>

<template>
    <div class="user-container">
        <h1>Hello, {{ name }}!</h1>

        {{#if users.length > 0}}
            <ul class="user-list">
                {{#each users as user, index}}
                    <li class="user-item {{ showAvatar ? 'with-avatar' : 'no-avatar' }}"
                        data-index="{{ index }}">
                        {{#if showAvatar && user.avatar}}
                            <img src="{{ user.avatar }}" alt="{{ user.name }}" />
                        {{/if}}
                        <span class="user-name">{{ user.name }}</span>
                        <span class="user-email">{{ user.email }}</span>
                    </li>
                {{/each}}
            </ul>
        {{:else}}
            <p class="empty-message">No users found.</p>
        {{/if}}

        <div class="raw-content">
            {{@html rawHtmlContent}}
        </div>

        <App client="react" users="{{users}}"></App>
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
