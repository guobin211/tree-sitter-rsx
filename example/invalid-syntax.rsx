---
async fn get_server_side_props(req: Request) -> Response {
    let data = fetch_data().await;
    Response::json!({
        "data": data,
    })
}
---

<script>
const { users } = defineProps<{
    users: string[];
}>();
</script>

<template>
    <div>
        <h1>Hello, {{ name }}!</h1>

        {{#if users.length > 0}}
            <ul>
                {{#each users as user}}
                    <li>{{ user }}</li>
                {{/each}}
            </ul>
        {{:else}}
            <p>No users</p>
        {{/if}}
    </div>
</template>

<style>
.container { padding: 20px; }
</style>
