# Makefile
SHELL := /bin/bash

JS_DIR := javascript
C_DIR  := c
BIN    := benchmark

.PHONY: all generate compile run analyze clean

# Full pipeline
all: deletefiles generate run analyze

deletefiles:
	@echo "=== Deletando arquivos data e datasets ==="
	rm -rf data datasets

generate:
	@echo "=== Gerando datasets ==="
	@node $(JS_DIR)/generateDataset.js

compile:
	@echo "=== Compilando arquivo de C benchmark.c ==="
	@cd $(C_DIR) && gcc -O3 -o $(BIN) benchmark.c subset_sum.c && chmod +x $(BIN)

run: compile
	@echo "=== Executando benchmark de JS ==="
	@node $(JS_DIR)/benchmark.js
	@echo "=== Executando benchmark de C ==="
	@cd $(C_DIR) && ./$(BIN)

analyze:
	@echo "=== Analisando ==="
	@node $(JS_DIR)/analyzeComparisons.js

clean:
	@echo "=== Cleanup ==="
	@cd $(C_DIR) && rm -f $(BIN)
