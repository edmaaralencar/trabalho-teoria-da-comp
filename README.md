# Experimento Subset Sum — Análise de Desempenho (JavaScript vs C)

Este projeto implementa e compara o desempenho do **algoritmo Subset Sum com Programação Dinâmica 1D**, em duas linguagens:

* **JavaScript (Node.js)**
* **C (compilado com Clang)**

O objetivo é medir e comparar o tempo médio de execução do mesmo algoritmo em diferentes tamanhos de entrada e configurações, analisando **eficiência**, **escalabilidade** e **consistência de resultados**.

---

## Estrutura Geral do Projeto

```
project/
│
├── datasets/              # Instâncias geradas automaticamente (JSON)
│   ├── array-size-100-with-max-value-50/
│   │   ├── 1.json
│   │   ├── 2.json
│   │   └── ...
│   ├── array-size-500-with-max-value-100/
│   └── ...
│
├── data/                  # Resultados de benchmarks
│   ├── js_results-1.csv
│   ├── js_results-2.csv
│   ├── ...
│   ├── c_results-1.csv
│   ├── ...
│   └── comparison_summary.csv
│
├── src/
│   ├── generateDataset.js     # Geração dos datasets
│   ├── subsetSum.js            # Algoritmo Subset Sum (JS)
│   ├── benchmark.js         # Executa benchmarks em JS
│   ├── analyzeComparison.js    # Agrega médias e gera resumo CSV
│
├── c/
│   ├── subset_sum.c / .h       # Implementação em C
│   ├── benchmark.c    # Benchmark em C (equivalente ao JS)
│
├── Makefile                    # Orquestra todo o pipeline
└── README.md                   # (este arquivo)
```

---

## Execução Completa

### Rodar tudo de forma automática:

```bash
make
```

O comando acima executa **todas as etapas** na ordem correta:

1. Geração dos datasets (`node analysis/generateDataset.js`)
2. Execução dos benchmarks em JavaScript (`node subset-sum/javascript/benchmark.js`)
3. Compilação e execução dos benchmarks em C (`cd c && gcc -O3 -o ...`)
4. Execução dos benchmarks em C (`./benchmark`)
4. Análise comparativa e geração do CSV final (`node analysis/analyzeComparison.js`)
