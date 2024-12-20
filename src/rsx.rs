use std::collections::HashMap;

use serde::Deserialize;
use zed_extension_api::{self as zed};

const SERVER_PATH: &str = "node_modules/@rsx/language-server/bin/rsx-language-server.js";
const PACKAGE_NAME: &str = "@rsx/language-server";

const TYPESCRIPT_PACKAGE_NAME: &str = "typescript";

/// The relative path to TypeScript's SDK.
const TYPESCRIPT_TSDK_PATH: &str = "node_modules/typescript/lib";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PackageJson {
    #[serde(default)]
    dependencies: HashMap<String, String>,
    #[serde(default)]
    dev_dependencies: HashMap<String, String>,
}

struct RsxExtension {
    did_find_server: bool,
    typescript_tsdk_path: String,
}
impl zed::Extension for RsxExtension {
    fn new() -> Self {
        Self {
            did_find_server: false,
            typescript_tsdk_path: TYPESCRIPT_TSDK_PATH.to_owned(),
        }
    }
}

zed::register_extension!(RsxExtension);
