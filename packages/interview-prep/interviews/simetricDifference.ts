function sym(...args) {
  function symmetricDifference(arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const result = new Set();

    for (const item of set1) {
      if (!set2.has(item)) result.add(item);
    }
    for (const item of set2) {
      if (!set1.has(item)) result.add(item);
    }
    return [...result];
  }

  return args.reduce((acc, curr) => symmetricDifference(acc, curr)).sort((a, b) => a - b);
}