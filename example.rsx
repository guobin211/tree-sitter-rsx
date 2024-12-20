---
use rsx::{Request, Response, json};

pub async fn get_server_props(req: Request) -> Response {
    Response::json!({
        "code": 0,
        "userInfo": json!({ "name": "jack" }),
        "newsInfo": json!({ "title": "test" }),
        "newsList": json!([]),
        "title": "ssr"
    })
}
---

<script>
    import Meta from '../components/meta.rsx';
    import Skeleton from '../components/skeleton.rsx';
    // csr components
    import NewsApp from '../react/news.app.tsx';
    // $props is the server props
    const { userInfo, newsInfo, title } = $props;
</script>

<template>
    <html lang="en-us">
        <head>
            <Meta></Meta>
            <title>{{ title }}</title>
        </head>
        <body>
            <div id="app">
                <Skeleton>
                    <NewsApp client:only="react" newsInfo={{newsInfo}}></NewsApp>
                </Skeleton>
            </div>
        </body>
    </html>
</template>

<style>
    #app {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }
</style>
