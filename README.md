# Rsx Support

`rsx` is a server-side web framework. it's like `jsx` + `rust`.

```rsx
---
use rsx::{Request, Response};
use api::user::{UserInfo};

async fn get_server_props(req: Request) -> Response {
    let cookies = req.cookies();
    match UserInfo::from_cookies(cookies).await {
        Ok(user) {
            Response::json!({
                "code": 0,
                "user": user,
                "msg": ""
            })
        }
        Err(err) {
            Response::json!({
                "code": -1,
                "user": None,
                "msg": format!("{}", err)
            })
        }
    }
}
---

<script>
    import Header from 'components/header.tsx';
    const { user } = $props;
</script>

<template>
    <div>
        <h1 class="title">Hello {{user.name}}!</h1>
        <Header client:only="react" user={{}}></Header>
    </div>
</template>

<style>
    .title {
        font-size: 1.5em;
        text-align: center;
    }
</style>
```
