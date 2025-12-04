---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "categories": [
            {
                "name": "Electronics",
                "items": [
                    { "name": "Laptop", "price": 999.99 },
                    { "name": "Phone", "price": 699.99 }
                ]
            },
            {
                "name": "Books",
                "items": [
                    { "name": "Rust Programming", "price": 49.99 },
                    { "name": "TypeScript Guide", "price": 39.99 }
                ]
            }
        ]
    })
}
---

<script>
interface Item {
    name: string
    price: number
}

interface Category {
    name: string
    items: Item[]
}

const { categories } = defineProps<{
    categories: Category[]
}>()

function formatPrice(price: number): string {
    return `$${price.toFixed(2)}`
}
</script>

<template>
    <div class="catalog">
        {{@each categories as category}}
            <div class="category">
                <h2>{{ category.name }}</h2>
                <ul class="items">
                    {{@each category.items as item, index}}
                        <li class="item">
                            <span class="item-name">{{ item.name }}</span>
                            <span class="item-price">{{ formatPrice(item.price) }}</span>
                        </li>
                    {{/each}}
                </ul>
            </div>
        {{/each}}
    </div>
</template>

<style>
.catalog {
    padding: 20px;

    .category {
        margin-bottom: 30px;

        h2 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }

        .items {
            list-style: none;
            padding: 0;

            .item {
                display: flex;
                justify-content: space-between;
                padding: 12px;
                background: #f9f9f9;
                margin-bottom: 8px;
                border-radius: 4px;

                .item-name {
                    font-weight: 500;
                }

                .item-price {
                    color: #2ecc71;
                    font-weight: bold;
                }
            }
        }
    }
}
</style>
