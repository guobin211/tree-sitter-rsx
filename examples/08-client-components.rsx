---
use rsx::{Request, Response, Context};

async fn get_server_side_props(req: Request, ctx: Context) -> Response {
    let user_id = ctx.get_user_id().unwrap_or_default();
    let users = fetch_users().await;
    let chart_data = fetch_chart_data().await;

    Response::json!({
        "users": users,
        "chartData": chart_data,
        "appConfig": {
            "theme": "dark",
            "locale": "en"
        }
    })
}
---

<script>
import ReactApp from './react/app.tsx'
import VueChart from './vue/chart.vue'
import SvelteWidget from './svelte/widget.svelte'

interface User {
    id: string
    name: string
}

interface ChartData {
    labels: string[]
    values: number[]
}

interface AppConfig {
    theme: string
    locale: string
}

const { users, chartData, appConfig } = defineProps<{
    users: User[]
    chartData: ChartData
    appConfig: AppConfig
}>()

function handleUserClick(user: User) {
    console.log('User clicked:', user)
}

function handleUpdate(data: any) {
    console.log('Update:', data)
}
</script>

<template>
    <div class="client-components">
        <h1>Client Components Demo</h1>

        <!-- React component with simple props -->
        <section class="section">
            <h2>React Component</h2>
            <ReactApp client="react" users="{{ users }}" />
        </section>

        <!-- React component with multiple props -->
        <section class="section">
            <h2>React with Multiple Props</h2>
            <ReactApp
                client="react"
                users="{{ users }}"
                count="{{ users.length }}"
                onUserClick="{{ handleUserClick }}"
                onUpdate="{{ handleUpdate }}">
            </ReactApp>
        </section>

        <!-- Vue component -->
        <section class="section">
            <h2>Vue Chart</h2>
            <VueChart client="vue" data="{{ chartData }}" config="{{ appConfig }}" />
        </section>

        <!-- Svelte component -->
        <section class="section">
            <h2>Svelte Widget</h2>
            <SvelteWidget client="svelte" items="{{ users }}" />
        </section>

        <!-- Mixed components -->
        <section class="section">
            <h2>Mixed Framework Components</h2>
            <div class="grid">
                <ReactApp client="react" users="{{ users }}" />
                <VueChart client="vue" data="{{ chartData }}" />
                <SvelteWidget client="svelte" items="{{ users }}" />
            </div>
        </section>
    </div>
</template>

<style>
.client-components {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;

    h1 {
        text-align: center;
        margin-bottom: 30px;
    }

    .section {
        margin-bottom: 40px;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;

        h2 {
            margin-bottom: 15px;
            color: #333;
        }
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }
}
</style>
