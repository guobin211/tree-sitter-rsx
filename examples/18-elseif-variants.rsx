---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "score": 75,
        "level": 3
    })
}
---

<script>
const { score, level } = defineProps<{
    score: number
    level: number
}>()
</script>

<template>
    <div class="elseif-demo">
        <h1>Else If Variants</h1>

        <!-- Using {{:else if}} with space -->
        <section>
            <h2>Score Grade (else if)</h2>
            {{@if score >= 90}}
                <p class="grade-a">Grade: A</p>
            {{:else if score >= 80}}
                <p class="grade-b">Grade: B</p>
            {{:else if score >= 70}}
                <p class="grade-c">Grade: C</p>
            {{:else if score >= 60}}
                <p class="grade-d">Grade: D</p>
            {{:else}}
                <p class="grade-f">Grade: F</p>
            {{/if}}
        </section>

        <!-- Using {{:elseif}} without space -->
        <section>
            <h2>Level Badge (elseif)</h2>
            {{@if level >= 5}}
                <span class="badge gold">Gold</span>
            {{:elseif level >= 3}}
                <span class="badge silver">Silver</span>
            {{:elseif level >= 1}}
                <span class="badge bronze">Bronze</span>
            {{:else}}
                <span class="badge none">No Badge</span>
            {{/if}}
        </section>

        <!-- Mixed usage -->
        <section>
            <h2>Combined Check</h2>
            {{@if score >= 90 && level >= 5}}
                <p>Elite Player</p>
            {{:else if score >= 80 && level >= 3}}
                <p>Advanced Player</p>
            {{:elseif score >= 70}}
                <p>Intermediate Player</p>
            {{:else}}
                <p>Beginner Player</p>
            {{/if}}
        </section>
    </div>
</template>

<style>
.elseif-demo {
    padding: 20px;

    section {
        margin-bottom: 20px;
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 4px;
    }

    .grade-a { color: #28a745; }
    .grade-b { color: #17a2b8; }
    .grade-c { color: #ffc107; }
    .grade-d { color: #fd7e14; }
    .grade-f { color: #dc3545; }

    .badge {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;

        &.gold { background: #ffd700; color: #333; }
        &.silver { background: #c0c0c0; color: #333; }
        &.bronze { background: #cd7f32; color: #fff; }
        &.none { background: #e0e0e0; color: #666; }
    }
}
</style>
