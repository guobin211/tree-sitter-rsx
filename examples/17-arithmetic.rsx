---
use rsx::{Request, Response};

async fn get_server_side_props(req: Request) -> Response {
    Response::json!({
        "price": 100,
        "quantity": 5,
        "discount": 0.1,
        "tax": 0.08,
        "values": [10, 20, 30, 40, 50]
    })
}
---

<script>
const { price, quantity, discount, tax, values } = defineProps<{
    price: number
    quantity: number
    discount: number
    tax: number
    values: number[]
}>()

function sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0)
}

function average(arr: number[]): number {
    return arr.length > 0 ? sum(arr) / arr.length : 0
}
</script>

<template>
    <div class="arithmetic-demo">
        <h1>Arithmetic Expressions</h1>

        <!-- Basic arithmetic -->
        <section>
            <h2>Basic Operations</h2>
            <p>Addition: {{ price + 50 }}</p>
            <p>Subtraction: {{ price - 20 }}</p>
            <p>Multiplication: {{ price * quantity }}</p>
            <p>Division: {{ price / 2 }}</p>
            <p>Modulo: {{ quantity % 3 }}</p>
        </section>

        <!-- Complex calculations -->
        <section>
            <h2>Order Calculation</h2>
            <p>Subtotal: ${{ price * quantity }}</p>
            <p>Discount ({{ discount * 100 }}%): -${{ price * quantity * discount }}</p>
            <p>After Discount: ${{ price * quantity * (1 - discount) }}</p>
            <p>Tax ({{ tax * 100 }}%): +${{ price * quantity * (1 - discount) * tax }}</p>
            <p>Total: ${{ price * quantity * (1 - discount) * (1 + tax) }}</p>
        </section>

        <!-- Negative numbers -->
        <section>
            <h2>Negative Numbers</h2>
            <p>Negative price: {{ -price }}</p>
            <p>Double negative: {{ --price }}</p>
        </section>

        <!-- Array operations -->
        <section>
            <h2>Array Calculations</h2>
            <p>Sum: {{ sum(values) }}</p>
            <p>Average: {{ average(values) }}</p>
            <p>Count: {{ values.length }}</p>
        </section>

        <!-- Conditional with arithmetic -->
        {{@if price * quantity > 400}}
            <p class="free-shipping">Free shipping on orders over $400!</p>
        {{:else}}
            <p class="shipping-cost">Shipping: ${{ 500 - price * quantity > 0 ? 10 : 0 }}</p>
        {{/if}}
    </div>
</template>

<style>
.arithmetic-demo {
    padding: 20px;

    section {
        margin-bottom: 20px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 4px;

        h2 {
            margin-bottom: 10px;
            font-size: 16px;
        }

        p {
            margin: 5px 0;
        }
    }

    .free-shipping {
        color: #28a745;
        font-weight: bold;
    }

    .shipping-cost {
        color: #666;
    }
}
</style>
