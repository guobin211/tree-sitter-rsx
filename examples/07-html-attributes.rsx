---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "user": {
            "id": "user-123",
            "name": "Alice",
            "avatar": "/images/alice.png"
        },
        "isActive": true,
        "status": "online",
        "width": 200,
        "height": 150,
        "items": [
            { "id": 1, "count": 5 },
            { "id": 2, "count": 10 }
        ]
    })
}
---

<script>
interface User {
    id: string
    name: string
    avatar: string
}

interface Item {
    id: number
    count: number
}

const { user, isActive, status, width, height, items } = defineProps<{
    user: User
    isActive: boolean
    status: string
    width: number
    height: number
    items: Item[]
}>()
</script>

<template>
    <div class="attributes-demo">
        <!-- Dynamic class -->
        <div class="{{ isActive ? 'active' : 'inactive' }}">
            <span class="status-{{ status }}">{{ status }}</span>
        </div>

        <!-- Dynamic id -->
        <div id="user-{{ user.id }}">
            User Profile
        </div>

        <!-- Data attributes -->
        {{@each items as item, index}}
            <div data-id="{{ item.id }}" data-index="{{ index }}" data-count="{{ item.count }}">
                Item {{ item.id }}
            </div>
        {{/each}}

        <!-- src and alt attributes -->
        <img src="{{ user.avatar }}" alt="{{ user.name }}'s avatar" />

        <!-- Default value with || -->
        <img src="{{ user.avatar || '/default-avatar.png' }}" alt="Avatar" />

        <!-- href attribute -->
        <a href="/users/{{ user.id }}">View Profile</a>
        <a href="/users/{{ user.id }}/edit">Edit Profile</a>

        <!-- style attribute -->
        <div style="width: {{ width }}px; height: {{ height }}px;">
            Sized container
        </div>

        <!-- Boolean attributes -->
        <input type="checkbox" disabled />
        <button type="submit">Submit</button>
    </div>
</template>

<style>
.attributes-demo {
    padding: 20px;

    .active {
        background: #d4edda;
    }

    .inactive {
        background: #f8d7da;
    }

    .status-online {
        color: green;
    }

    .status-offline {
        color: red;
    }

    img {
        max-width: 100px;
        border-radius: 50%;
    }

    a {
        display: block;
        margin: 5px 0;
        color: #007bff;
    }
}
</style>
