var twoSum = function (nums, target) {
  for (const index in nums) {
    for (const index2 in nums) {
      if (nums[index2] !== nums[index]) {
        const sum = nums[index2] + nums[index];
        if (sum === target) {
          console.log("Done", index, index2);
          return [index, index2];
        }
      }
    }
  }
};
twoSum([2, 7, 11, 15], 9);
