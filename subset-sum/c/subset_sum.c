#include <stdlib.h>

int subset_sum(const int *arr, int n, int target) {
    if (target < 0) return 0;
    if (target == 0) return 1;
    if (n <= 0) return 0;

    unsigned char *dp = (unsigned char *)calloc((size_t)target + 1, 1);
    if (!dp) return 0;

    dp[0] = 1;

    for (int i = 0; i < n; i++) {
        int v = arr[i];
        if (v > target) continue;
        for (int s = target; s >= v; s--) {
            if (dp[s - v]) dp[s] = 1;
        }
        if (dp[target]) { free(dp); return 1; }
    }

    int result = dp[target] ? 1 : 0;
    free(dp);
    return result;
}
