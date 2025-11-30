# Experimento Subset Sum — Análise de Desempenho (JavaScript vs C)

Este projeto implementa e compara o desempenho do **algoritmo Subset Sum com Programação Dinâmica 1D**, em duas linguagens:

* **JavaScript (Node.js)**
* **C (compilado com Clang)**

O objetivo é medir e comparar o tempo médio de execução do mesmo algoritmo em diferentes tamanhos de entrada e configurações, analisando **eficiência**, **escalabilidade** e **consistência de resultados**.

---

## Estrutura Geral do Projeto

### 1. `analysis/` - Geração, Processamento e Resultados
  - **`generateDataset.js`**: gera os datasets com base em SPECS definidas no próprio arquivo;
  - **`analyzeComparisons.js`**: realiza as comparações e cálculos de tempo médio, desvio padrão, etc e agrupa na própria pasta;
  - **`data/`**: contém os resultados das execuções do código;
  - **`datasets/`**: armazena todos os datasets gerados automaticamente pelo arquivo **`generateDataset.js`**.

### 2. `python/` - Gráficos
  - **`charts.ipynb`**: notebook contendo:
    - gráficos comparativos (JS vs C);
    - gráficos teóricos vs práticos;
    - preparação visual para relatório.

### 3. `subset-sum/` - Implementações equivalentes do algoritmo Subset Sum
  - **`subset-sum/javascript/`**
    - `subsetSum.js` — implementação DP com `Uint8Array`
    - `benchmark.js` — executa o algoritmo para cada dataset e salva tempos

  - **`subset-sum/c/`**
    - `subset_sum.c` / `subset_sum.h` — implementação do algoritmo em C
    - `benchmark.c` — executa o benchmark usando os mesmos datasets do JS

### 4. Arquivos na raiz do projeto
- **`Makefile`**  
  Automatiza todo o pipeline:
  1. Geração dos datasets  
  2. Execução dos benchmarks JS  
  3. Compilação e execução dos benchmarks C  
  4. Consolidação das métricas  

- **`README.md`**  
  Documentação principal do experimento.

---

## Execução Completa

### Rodar tudo de forma automática:

```bash
make
```

O comando acima executa **todas as etapas** na ordem correta:

1. Geração dos datasets (`node analysis/generateDataset.js`)
2. Execução dos benchmarks em JavaScript (`node subset-sum/javascript/benchmark.js`)
3. Compilação e execução dos benchmarks em C (`cd subset-sum/c && gcc -O3 -o benchmark benchmark.c subset_sum.c`)
4. Execução dos benchmarks em C (`./benchmark`)
4. Análise comparativa e geração do CSV final (`node analysis/analyzeComparison.js`)
