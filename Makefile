# Makefile
SHELL := /bin/bash

JS_DIR := javascript
C_DIR  := c
BIN    := benchmark

.PHONY: all generate compile run analyze clean

# Full pipeline
all: generate run analyze

# 1) Generate dataset
generate:
	@echo "=== Generating dataset ==="
	@node $(JS_DIR)/generateDataset.js

# 2) Compile C inside ./c
compile:
	@echo "=== Compiling C benchmark ==="
	@cd $(C_DIR) && gcc -O3 -o $(BIN) benchmark.c subset_sum.c && chmod +x $(BIN)

# 3) Run benchmarks (JS + C)
run: compile
	@echo "=== Running JS benchmark ==="
	@node $(JS_DIR)/benchmark.js
	@echo "=== Executing C benchmark ==="
	@cd $(C_DIR) && ./$(BIN)

# 4) Analyze results
analyze:
	@echo "=== Analyzing comparisons ==="
	@node $(JS_DIR)/analyzeComparisons.js

# Cleanup compiled binary inside ./c
clean:
	@echo "=== Cleaning build artifacts ==="
	@cd $(C_DIR) && rm -f $(BIN)
