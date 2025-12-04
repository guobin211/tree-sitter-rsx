---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "users": [
            { "id": "1", "name": "Alice", "email": "alice@example.com" },
            { "id": "2", "name": "Bob", "email": "bob@example.com" },
            { "id": "3", "name": "Charlie", "email": "charlie@example.com" }
        ],
        "tags": ["rust", "typescript", "web"]
    })
}
---

<script>
interface User {
    id: string
    name: string
    email: string
}

const { users, tags } = defineProps<{
    users: User[]
    tags: string[]
}>()
</script>

<template>
    <div class="lists">
        <h2>User List</h2>
        <ul class="user-list">
            {{@each users as user, index}}
                <li class="user-item" data-index="{{ index }}">
                    <span class="name">{{ user.name }}</span>
                    <span class="email">{{ user.email }}</span>
                </li>
            {{/each}}
        </ul>

        <h2>Tags</h2>
        <div class="tags">
            {{@each tags as tag, i}}
                <span class="tag">{{ i }}: {{ tag }}</span>
            {{/each}}
        </div>
    </div>
</template>

<style>
.lists {
    padding: 20px;

    .user-list {
        list-style: none;
        padding: 0;

        .user-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid #eee;

            .name {
                font-weight: bold;
            }

            .email {
                color: #666;
            }
        }
    }

    .tags {
        display: flex;
        gap: 8px;

        .tag {
            background: #e0e0e0;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
        }
    }
}
</style>
