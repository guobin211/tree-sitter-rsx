package tree_sitter_rsx_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_rsx "github.com/tree-sitter/tree-sitter-rsx/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_rsx.Language())
	if language == nil {
		t.Errorf("Error loading Rsx grammar")
	}
}
