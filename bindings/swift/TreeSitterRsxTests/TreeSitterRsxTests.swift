import XCTest
import SwiftTreeSitter
import TreeSitterRsx

final class TreeSitterRsxTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_rsx())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Rsx grammar")
    }
}
