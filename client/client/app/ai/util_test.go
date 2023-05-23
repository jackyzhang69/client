package ai

import (
	"fmt"
	"testing"
)

// test enbeding
func TestEmbedding(t *testing.T) {
	embeded, ok := Embedding()
	if !ok {
		t.Error(ok)
	}
	fmt.Println(len(embeded))
	for _, v := range embeded {
		Upsert("21311", v)
	}
}

// test Get
func TestGet(t *testing.T) {
	Get()
}

// test CreateIndex
func TestCreateIndex(t *testing.T) {
	CreateIndex("noc2021v1")
}
