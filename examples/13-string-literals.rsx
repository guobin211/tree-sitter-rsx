---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "name": "Alice",
        "status": "active"
    })
}
---

<script>
const { name, status } = defineProps<{
    name: string
    status: string
}>()

function greet(greeting: string, target: string): string {
    return `${greeting}, ${target}!`
}

function getLabel(key: string): string {
    const labels: Record<string, string> = {
        'active': 'Active User',
        'inactive': 'Inactive User'
    }
    return labels[key] || 'Unknown'
}
</script>

<template>
    <div class="string-literals">
        <!-- Double-quoted strings -->
        <p class="greeting">{{ greet("Hello", name) }}</p>
        <p data-status="active">Status indicator</p>

        <!-- Single-quoted strings -->
        <p class="alt-greeting">{{ greet('Hi', name) }}</p>
        <p data-type='primary'>Type indicator</p>

        <!-- String comparison -->
        {{@if status == "active"}}
            <span class="badge active">Active</span>
        {{/if}}

        {{@if status == 'active'}}
            <span class="badge">Also Active (single quotes)</span>
        {{/if}}

        <!-- Function with string argument -->
        <p>{{ getLabel("active") }}</p>
        <p>{{ getLabel('inactive') }}</p>

        <!-- Mixed quotes in attributes -->
        <div 
            class="container"
            data-label="User's Profile"
            data-desc='Say "Hello"'>
            Mixed quotes demo
        </div>

        <!-- Empty strings -->
        {{@if name != ""}}
            <p>Name is not empty</p>
        {{/if}}

        <!-- String concatenation in ternary -->
        <p class="{{ status == 'active' ? 'text-green' : 'text-red' }}">
            Status: {{ status }}
        </p>
    </div>
</template>

<style>
.string-literals {
    padding: 20px;

    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        background: #e0e0e0;

        &.active {
            background: #d4edda;
            color: #28a745;
        }
    }

    .text-green {
        color: #28a745;
    }

    .text-red {
        color: #dc3545;
    }
}
</style>
