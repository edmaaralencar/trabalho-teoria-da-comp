#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <dirent.h>
#include <sys/stat.h>
#include <time.h>

#define DATASET_DIR "../../analysis/datasets"
#define DATA_DIR    "../../analysis/data"
#define TIMES       15

int subset_sum(const int *arr, int n, int target);

static uint64_t now_ns() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (uint64_t)ts.tv_sec * 1000000000ULL + (uint64_t)ts.tv_nsec;
}

static int load_json_array(const char *path, int **outArr, int *outN, int *outTarget, int *outMaxVal) {
    FILE *f = fopen(path, "r");
    if (!f) return -1;

    struct stat st;
    if (stat(path, &st) != 0) { fclose(f); return -1; }

    char *buf = (char *)malloc((size_t)st.st_size + 1);
    if (!buf) { fclose(f); return -1; }

    size_t rd = fread(buf, 1, (size_t)st.st_size, f);
    buf[rd] = 0;
    fclose(f);

    char *p;

    p = strstr(buf, "\"n\"");
    if (!p) { free(buf); return -1; }
    sscanf(p, "\"n\"%*[^0-9]%d", outN);

    p = strstr(buf, "\"maxVal\"");
    if (!p) { free(buf); return -1; }
    sscanf(p, "\"maxVal\"%*[^0-9]%d", outMaxVal);

    p = strstr(buf, "\"target\"");
    if (!p) { free(buf); return -1; }
    sscanf(p, "\"target\"%*[^0-9]%d", outTarget);

    p = strstr(buf, "\"arr\"");
    if (!p) { free(buf); return -1; }
    char *arrStart = strchr(p, '[');
    char *arrEnd   = strchr(arrStart ? arrStart : p, ']');
    if (!arrStart || !arrEnd || arrEnd <= arrStart) { free(buf); return -1; }

    int count = 1;
    for (char *q = arrStart; q < arrEnd; q++) if (*q == ',') count++;

    int *arr = (int *)malloc(sizeof(int) * count);
    if (!arr) { free(buf); return -1; }

    char *cur = arrStart + 1;
    for (int i = 0; i < count; i++) {
        while (*cur == ' ' || *cur == '\n' || *cur == '\r' || *cur == '\t') cur++;
        sscanf(cur, "%d", &arr[i]);
        char *next = strchr(cur, ',');
        if (!next || next > arrEnd) { break; }
        cur = next + 1;
    }

    *outArr = arr;
    free(buf);
    return 0;
}

typedef struct {
    char **items;
    size_t len;
    size_t cap;
} strvec;

static void sv_init(strvec *v) { v->items=NULL; v->len=0; v->cap=0; }

static void sv_push(strvec *v, const char *s) {
    if (v->len + 1 > v->cap) {
        size_t ncap = v->cap ? v->cap * 2 : 64;
        char **nitems = (char **)realloc(v->items, ncap * sizeof(char *));
        if (!nitems) return;
        v->items = nitems; v->cap = ncap;
    }
    v->items[v->len++] = strdup(s);
}

static int ends_with_json(const char *s) {
    size_t n = strlen(s);
    return n >= 5 && strcmp(s + n - 5, ".json") == 0;
}

static void list_json_files(const char *base, strvec *out) {
    DIR *dir = opendir(base);
    if (!dir) return;
    struct dirent *ent;
    while ((ent = readdir(dir))) {
        if (!strcmp(ent->d_name, ".") || !strcmp(ent->d_name, "..")) continue;
        char path[1024];
        snprintf(path, sizeof(path), "%s/%s", base, ent->d_name);
        struct stat st;
        if (stat(path, &st) != 0) continue;
        if (S_ISDIR(st.st_mode)) {
            list_json_files(path, out);
        } else if (S_ISREG(st.st_mode) && ends_with_json(ent->d_name)) {
            sv_push(out, path);
        }
    }
    closedir(dir);
}

static int cmp_strptr(const void *a, const void *b) {
    const char *sa = *(const char * const *)a;
    const char *sb = *(const char * const *)b;
    return strcmp(sa, sb);
}

static void upsert_data_dir(void) {
    struct stat st = {0};
    if (stat(DATA_DIR, &st) == -1) {
        mkdir(DATA_DIR, 0700);
    }
}

static const char* get_label_from_path(const char *fullpath) {
    const char *last_slash = strrchr(fullpath, '/');
    if (!last_slash) return fullpath;
    size_t len = (size_t)(last_slash - fullpath);
    static char label[512];
    const char *p = fullpath + len - 1;
    while (p > fullpath && *p != '/') p--;
    if (*p == '/') p++;
    size_t L = (size_t)(last_slash - p);
    if (L >= sizeof(label)) L = sizeof(label) - 1;
    memcpy(label, p, L);
    label[L] = 0;
    return label;
}

int main() {
    strvec files; sv_init(&files);
    list_json_files(DATASET_DIR, &files);
    if (files.len == 0) {
        fprintf(stderr, "No .json files found under %s\n", DATASET_DIR);
        return 1;
    }
    qsort(files.items, files.len, sizeof(char *), cmp_strptr);

    upsert_data_dir();

    for (int run = 1; run <= TIMES; run++) {
        printf("\n=== Run %d/%d ===\n", run, TIMES);

        char outPath[256];
        snprintf(outPath, sizeof(outPath), DATA_DIR "/c_results-%d.csv", run);
        FILE *out = fopen(outPath, "w");
        if (!out) {
            perror("opening output csv");
            for (size_t i = 0; i < files.len; i++) free(files.items[i]);
            free(files.items);
            return 1;
        }
        fprintf(out, "language,label,n,maxVal,file,elapsed_ms\n");

        for (size_t i = 0; i < files.len; i++) {
            const char *file = files.items[i];
            const char *label = get_label_from_path(file);
            const char *filename = strrchr(file, '/');
            filename = filename ? filename + 1 : file;

            int *arr = NULL, n = 0, target = 0, maxVal = 0;
            if (load_json_array(file, &arr, &n, &target, &maxVal) != 0) {
                fprintf(stderr, "warn: failed to parse %s\n", file);
                continue;
            }

            uint64_t t0 = now_ns();
            subset_sum(arr, n, target);
            uint64_t t1 = now_ns();
            double ms = (double)(t1 - t0) / 1e6;

            fprintf(out, "c,%s,%d,%d,%s,%.6f\n", label, n, maxVal, filename, ms);
            printf("✅ %s/%s: %.3f ms\n", label, filename, ms);

            free(arr);
        }
        fclose(out);
        printf("📊 Resultados salvos em: %s\n", outPath);
    }

    for (size_t i = 0; i < files.len; i++) free(files.items[i]);
    free(files.items);
    return 0;
}
