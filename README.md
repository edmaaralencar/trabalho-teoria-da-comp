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

1. Geração dos datasets (`node src/genDatasetsFinal.js`)
2. Execução dos benchmarks em JavaScript (`node src/benchmark.js`)
3. Compilação e execução dos benchmarks em C (`cd c && gcc -O3 -o ...`)
4. Execução dos benchmarks em C (`./benchmark`)
4. Análise comparativa e geração do CSV final (`node src/analyzeComparison.js`)

---

## Geração dos Datasets

A geração é feita via o script `genDatasetsFinal.js`.
Ele cria pastas sob `datasets/`, uma para cada **SPEC** (tamanho e valor máximo).

### SPECS utilizadas:

```js
const SPECS = [
  { label: "array-size-100-with-max-value-50", n: 100, maxVal: 50 },
  { label: "array-size-500-with-max-value-100", n: 500, maxVal: 100 },
  { label: "array-size-500-with-max-value-500", n: 500, maxVal: 500 },
  { label: "array-size-1000-with-max-value-100", n: 1000, maxVal: 100 },
  { label: "array-size-1000-with-max-value-500", n: 1000, maxVal: 500 },
  { label: "array-size-5000-with-max-value-50", n: 5000, maxVal: 50 },
];
```

### Para cada SPEC:

* São gerados **20 arquivos JSON** (ex: `1.json` a `20.json`);
* Cada arquivo contém:

  * `n`: tamanho do array;
  * `maxVal`: valor máximo permitido para elementos;
  * `arr`: lista de números inteiros;
  * `sum`: soma total do array;
  * `target`: metade aproximada da soma (usado como alvo do Subset Sum);
  * `seed`: semente usada para gerar o array (garante reprodutibilidade).

Exemplo:

```json
{
  "n": 500,
  "maxVal": 100,
  "arr": [33, 57, 4, 21, ...],
  "sum": 24321,
  "target": 12160,
  "seed": 123456789
}
```

---

## Reprodutibilidade

* A geração usa um **gerador pseudoaleatório determinístico (LCG)** com a semente fixa `123456789`.
* O mesmo gerador é usado tanto em **JavaScript** quanto em **C**.
* Assim, as instâncias geradas são **idênticas** nas duas linguagens.
* Isso garante que os testes são **comparáveis e reexecutáveis** em qualquer ambiente.

---

## Execução dos Benchmarks

### JavaScript

O arquivo `src/benchmark.js`:

* Executa **20 rodadas** completas (`TIMES = 20`);
* Cada rodada percorre **todos os datasets (todos os arquivos dentro de cada SPEC)**;
* Mede o tempo de execução (em milissegundos) de `subsetSum(arr, target)`;
* Cria arquivos:

  ```
  data/js_results-1.csv
  data/js_results-2.csv
  ...
  ```

Cada linha do CSV tem:

```
language,label,n,maxVal,file,elapsed_ms
javascript,array-size-500-with-max-value-100,500,100,1.json,12.345678
```

---

### C

O arquivo `c/benchmark.c` faz o mesmo processo em C:

* Percorre recursivamente `../datasets/`
* Executa **20 rodadas** (gera `c_results-1.csv` até `c_results-20.csv`)
* Mede tempo com `clock_gettime(CLOCK_MONOTONIC)`
* Estrutura idêntica ao CSV do JavaScript

---

## Análise dos Resultados

Após coletar todos os CSVs (`js_results-*.csv` e `c_results-*.csv`),
executa-se o script:

```bash
node src/analyzeComparison.js
```

Esse script:

1. Lê **todos os arquivos** de resultados;
2. Agrupa por label (`array-size-...`);
3. Calcula:

   * Média (`mean_js_ms`, `mean_c_ms`);
   * Razão (`ratio_js_c = mean_js_ms / mean_c_ms`);
4. Gera o arquivo final:

   ```
   data/comparison_summary.csv
   ```

---

## Exemplo de Saída Final

```
label,n,maxVal,mean_js_ms,mean_c_ms,ratio_js_c
array-size-100-with-max-value-50,100,50,0.021,0.005,4.20
array-size-500-with-max-value-100,500,100,12.650,1.230,10.29
array-size-1000-with-max-value-100,1000,100,25.700,2.320,11.08
array-size-5000-with-max-value-50,5000,50,123.460,11.970,10.31
```

---

<!-- ## 📜 Interpretação dos Resultados

* **C** é em média **10× mais rápido** que JavaScript;
* O comportamento de crescimento é **linear em ambos**;
* A diferença é **estrutural**, não algorítmica — o código é idêntico;
* Benchmarks são **reprodutíveis e determinísticos**.

--- -->

## 🧾 Conclusão

| Etapa               | Linguagem   | Saída                                           |
| ------------------- | ----------- | ----------------------------------------------- |
| Geração de datasets | Node.js     | `datasets/label/*.json`                         |
| Execução benchmark  | Node.js / C | `data/js_results-*.csv`, `data/c_results-*.csv` |
| Análise e resumo    | Node.js     | `data/comparison_summary.csv`                   |

Para reproduzir tudo:

```bash
make clean && make
```

E os resultados finais estarão prontos para análise no diretório `data/`.