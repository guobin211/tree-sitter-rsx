// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterRsx",
    products: [
        .library(name: "TreeSitterRsx", targets: ["TreeSitterRsx"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterRsx",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterRsxTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterRsx",
            ],
            path: "bindings/swift/TreeSitterRsxTests"
        )
    ],
    cLanguageStandard: .c11
)
