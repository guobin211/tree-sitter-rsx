---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "user": {
            "name": "Alice",
            "age": 25,
            "isActive": true,
            "score": 85
        },
        "items": [1, 2, 3, 4, 5],
        "discount": 0.2
    })
}
---

<script>
interface User {
    name: string
    age: number
    isActive: boolean
    score: number
}

const { user, items, discount } = defineProps<{
    user: User
    items: number[]
    discount: number
}>()

function formatDate(date: Date, format: string): string {
    return format
}
</script>

<template>
    <div class="expressions">
        <!-- Property access -->
        <p>Name: {{ user.name }}</p>
        <p>Age: {{ user.age }}</p>

        <!-- Binary expressions -->
        {{@if user.age >= 18 && user.isActive}}
            <p class="verified">Verified adult user</p>
        {{/if}}

        {{@if user.score > 90}}
            <p>Grade: A</p>
        {{:else if user.score >= 80 && user.score <= 90}}
            <p>Grade: B</p>
        {{:else if user.score >= 70}}
            <p>Grade: C</p>
        {{:else}}
            <p>Grade: D</p>
        {{/if}}

        <!-- Conditional (ternary) expressions -->
        <p class="{{ user.isActive ? 'active' : 'inactive' }}">
            Status: {{ user.isActive ? 'Active' : 'Inactive' }}
        </p>

        <!-- Arithmetic expressions -->
        <p>Items count: {{ items.length }}</p>
        <p>Discount: {{ discount * 100 }}%</p>

        <!-- Function calls -->
        <p>Date: {{ formatDate(user.createdAt, 'YYYY-MM-DD') }}</p>

        <!-- Unary expressions -->
        {{@if !user.isActive}}
            <p class="warning">User is not active</p>
        {{/if}}
    </div>
</template>

<style>
.expressions {
    padding: 20px;

    .verified {
        color: green;
        font-weight: bold;
    }

    .active {
        color: #2ecc71;
    }

    .inactive {
        color: #e74c3c;
    }

    .warning {
        background: #fff3cd;
        padding: 10px;
        border-radius: 4px;
    }
}
</style>
