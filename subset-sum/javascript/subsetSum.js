function subsetSum(arr, target) {
  const dp = new Uint8Array(target + 1);
  dp[0] = 1;

  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    for (let s = target; s >= v; s--) {
      if (dp[s - v]) dp[s] = 1;
    }
  }
  return dp[target] === 1;
}

module.exports = { subsetSum };
