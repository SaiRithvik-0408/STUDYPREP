// Comprehensive LeetCode / NeetCode Style Problem Store
// Massive Catalog of Top LeetCode Problems + Dynamic Lookup by Number + Clean Boilerplate

window.LEETCODE_DATABASE = {
  1: {
    id: "two-sum",
    number: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    approach: "Hash map one-pass complement lookup",
    targetComplexity: "O(N) Time, O(N) Auxiliary Space",
    hints: [
      "A brute force approach scans all pairs in O(N^2). Can you do it in O(N) using a Hash Map?",
      "For each element nums[i], calculate complement = target - nums[i].",
      "If complement is already in your map, you found the pair! Otherwise, insert nums[i] -> i into the map."
    ],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.

**Constraints:**
* \`2 <= nums.length <= 10^4\`
* \`-10^9 <= nums[i] <= 10^9\`
* \`-10^9 <= target <= 10^9\`
* Only one valid answer exists.`,
    functionName: "twoSum",
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your one-pass hash map solution here
    
}`,
      java: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your one-pass hash map solution here
        
        return new int[]{};
    }
}`
    },
    solutionCode: {
      javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
    }
    return [];
}`,
      java: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[]{map.get(comp), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`
    },
    testCases: [
      { input: `nums = [2,7,11,15], target = 9`, args: [[2,7,11,15], 9], expected: [0,1] },
      { input: `nums = [3,2,4], target = 6`, args: [[3,2,4], 6], expected: [1,2] },
      { input: `nums = [3,3], target = 6`, args: [[3,3], 6], expected: [0,1] }
    ]
  },

  3: {
    id: "longest-substring-without-repeating",
    number: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    approach: "Sliding window with hash map jumping left pointer",
    targetComplexity: "O(N) Time, O(min(N, M)) Auxiliary Space",
    hints: [
      "Use a sliding window [left, right] to maintain substring uniqueness.",
      "Track the latest index of each character in a Hash Map.",
      "When a duplicate is encountered, update left = max(left, lastSeenIndex + 1)."
    ],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

**Constraints:**
* \`0 <= s.length <= 5 * 10^4\`
* \`s\` consists of English letters, digits, symbols and spaces.`,
    functionName: "lengthOfLongestSubstring",
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
    // Write your sliding window solution here
    
}`,
      java: `import java.util.HashMap;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your sliding window solution here
        
        return 0;
    }
}`
    },
    solutionCode: {
      javascript: `function lengthOfLongestSubstring(s) {
    let map = new Map(), maxLen = 0, left = 0;
    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        if (map.has(char) && map.get(char) >= left) left = map.get(char) + 1;
        map.set(char, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
      java: `import java.util.HashMap;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) left = map.get(c) + 1;
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`
    },
    testCases: [
      { input: `s = "abcabcbb"`, args: ["abcabcbb"], expected: 3 },
      { input: `s = "bbbbb"`, args: ["bbbbb"], expected: 1 },
      { input: `s = "pwwkew"`, args: ["pwwkew"], expected: 3 }
    ]
  },

  11: {
    id: "container-water",
    number: 11,
    title: "Container With Most Water",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Greedy"],
    leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
    approach: "Greedy two-pointer shrink from edges inward",
    targetComplexity: "O(N) Time, O(1) Auxiliary Space",
    hints: [
      "Area is min(height[left], height[right]) * (right - left).",
      "Always move the pointer pointing to the shorter vertical line inward."
    ],
    description: `You are given an integer array \`height\` of length \`n\`. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.`,
    functionName: "maxArea",
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
    // Write your solution here
    
}`,
      java: `class Solution {
    public int maxArea(int[] height) {
        // Write your solution here
        return 0;
    }
}`
    },
    solutionCode: {
      javascript: `function maxArea(height) {
    let max = 0, l = 0, r = height.length - 1;
    while (l < r) {
        max = Math.max(max, Math.min(height[l], height[r]) * (r - l));
        if (height[l] < height[r]) l++; else r--;
    }
    return max;
}`,
      java: `class Solution {
    public int maxArea(int[] height) {
        int max = 0, l = 0, r = height.length - 1;
        while (l < r) {
            max = Math.max(max, Math.min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++; else r--;
        }
        return max;
    }
}`
    },
    testCases: [
      { input: `height = [1,8,6,2,5,4,8,3,7]`, args: [[1,8,6,2,5,4,8,3,7]], expected: 49 },
      { input: `height = [1,1]`, args: [[1,1]], expected: 1 }
    ]
  },

  15: {
    id: "3sum",
    number: 15,
    title: "3Sum",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    leetcodeUrl: "https://leetcode.com/problems/3sum/",
    approach: "Sort array + fix first element + Two Sum II scan with duplicate skipping",
    targetComplexity: "O(N^2) Time, O(1) or O(N) Auxiliary Space",
    hints: [
      "Sort the array first. Sorting takes O(N log N) which does not hurt the O(N^2) overall complexity.",
      "Iterate with index i. If nums[i] > 0, break early because three positive numbers cannot sum to 0.",
      "For each i, run two pointers left = i + 1 and right = n - 1. Be careful to skip duplicate values for i, left, and right!"
    ],
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    functionName: "threeSum",
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
    // Write your sorted 3-sum solution here
    
}`,
      java: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your sorted 3-sum solution here
        return new ArrayList<>();
    }
}`
    },
    solutionCode: {
      javascript: `function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const res = [];
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        if (nums[i] > 0) break;
        let l = i + 1, r = nums.length - 1;
        while (l < r) {
            const sum = nums[i] + nums[l] + nums[r];
            if (sum === 0) {
                res.push([nums[i], nums[l], nums[r]]);
                while (l < r && nums[l] === nums[l + 1]) l++;
                while (l < r && nums[r] === nums[r - 1]) r--;
                l++; r--;
            } else if (sum < 0) l++;
            else r--;
        }
    }
    return res;
}`,
      java: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            if (nums[i] > 0) break;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) l++;
                else r--;
            }
        }
        return res;
    }
}`
    },
    testCases: [
      { input: `nums = [-1,0,1,2,-1,-4]`, args: [[-1,0,1,2,-1,-4]], expected: [[-1,-1,2],[-1,0,1]] },
      { input: `nums = [0,1,1]`, args: [[0,1,1]], expected: [] }
    ]
  },

  20: {
    id: "valid-parentheses",
    number: 20,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
    approach: "LIFO Stack matching opening and closing delimiter pairs",
    targetComplexity: "O(N) Time, O(N) Auxiliary Space",
    hints: [
      "Push opening brackets onto a stack.",
      "When encountering a closing bracket, pop from the stack and check if the pair matches."
    ],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.`,
    functionName: "isValid",
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Write your solution here
    
}`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        return false;
    }
}`
    },
    solutionCode: {
      javascript: `function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (char === '(' || char === '{' || char === '[') stack.push(char);
        else if (stack.length === 0 || stack.pop() !== pairs[char]) return false;
    }
    return stack.length === 0;
}`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
}`
    },
    testCases: [
      { input: `s = "()"`, args: ["()"], expected: true },
      { input: `s = "()[]{}"`, args: ["()[]{}"], expected: true },
      { input: `s = "(]"`, args: ["(]"], expected: false }
    ]
  },

  21: {
    id: "merge-two-sorted-lists",
    number: 21,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
    approach: "Dummy head pointer comparison merge",
    targetComplexity: "O(N + M) Time, O(1) Auxiliary Space",
    hints: [
      "Create a dummy head node to simplify edge cases with the head.",
      "Compare list1.val and list2.val. Attach the smaller node and advance that list's pointer.",
      "Attach the non-null remainder at the end."
    ],
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`. Merge the two lists into one **sorted** list. Return *the head of the merged linked list*.`,
    functionName: "mergeTwoLists",
    starterCode: {
      javascript: `/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
    // Write your solution here
    
}`,
      java: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your solution here
        return null;
    }
}`
    },
    solutionCode: {
      javascript: `function mergeTwoLists(list1, list2) {
    let dummy = { val: 0, next: null }, tail = dummy;
    while (list1 && list2) {
        if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
        else { tail.next = list2; list2 = list2.next; }
        tail = tail.next;
    }
    tail.next = list1 || list2;
    return dummy.next;
}`,
      java: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
            else { tail.next = list2; list2 = list2.next; }
            tail = tail.next;
        }
        tail.next = (list1 != null) ? list1 : list2;
        return dummy.next;
    }
}`
    },
    testCases: [
      { input: `list1 = [1,2,4], list2 = [1,3,4]`, args: [[1,2,4], [1,3,4]], expected: [1,1,2,3,4,4] }
    ]
  },

  26: {
    id: "remove-duplicates-sorted",
    number: 26,
    title: "Remove Duplicates from Sorted Array",
    difficulty: "Easy",
    tags: ["Array", "Two Pointers"],
    leetcodeUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    approach: "Slow / fast write pointer swap",
    targetComplexity: "O(N) Time, O(1) Space",
    hints: [
      "Keep a write pointer at index 1.",
      "Iterate read pointer from 1 to n - 1. When nums[read] != nums[read - 1], copy and increment write pointer."
    ],
    description: `Given an integer array \`nums\` sorted in non-decreasing order, remove duplicates **in-place** such that each unique element appears once. Return *the number of unique elements*.`,
    functionName: "removeDuplicates",
    starterCode: {
      javascript: `function removeDuplicates(nums) {\n    // Write your in-place solution here\n}`,
      java: `class Solution {\n    public int removeDuplicates(int[] nums) {\n        return 0;\n    }\n}`
    },
    solutionCode: {
      javascript: `function removeDuplicates(nums) {\n    if (!nums.length) return 0;\n    let w = 1;\n    for (let r = 1; r < nums.length; r++) {\n        if (nums[r] !== nums[r - 1]) nums[w++] = nums[r];\n    }\n    return w;\n}`,
      java: `class Solution {\n    public int removeDuplicates(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        int w = 1;\n        for (int r = 1; r < nums.length; r++) {\n            if (nums[r] != nums[r - 1]) nums[w++] = nums[r];\n        }\n        return w;\n    }\n}`
    },
    testCases: [
      { input: `nums = [1,1,2]`, args: [[1,1,2]], expected: 2 },
      { input: `nums = [0,0,1,1,1,2,2,3,3,4]`, args: [[0,0,1,1,1,2,2,3,3,4]], expected: 5 }
    ]
  },

  42: {
    id: "trapping-rain-water",
    number: 42,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Monotonic Stack"],
    leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/",
    approach: "Two pointers tracking leftMax and rightMax bounds",
    targetComplexity: "O(N) Time, O(1) Space",
    hints: [
      "Water above index i is bounded by min(maxLeft[i], maxRight[i]) - height[i].",
      "Using two pointers left and right, maintain leftMax and rightMax.",
      "Move the pointer with the smaller max inward, adding (max - height) to the total water."
    ],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    functionName: "trap",
    starterCode: {
      javascript: `/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n    // Write your O(1) space two-pointer solution here\n}`,
      java: `class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}`
    },
    solutionCode: {
      javascript: `function trap(height) {\n    let l = 0, r = height.length - 1, lMax = 0, rMax = 0, water = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            if (height[l] >= lMax) lMax = height[l];\n            else water += lMax - height[l];\n            l++;\n        } else {\n            if (height[r] >= rMax) rMax = height[r];\n            else water += rMax - height[r];\n            r--;\n        }\n    }\n    return water;\n}`,
      java: `class Solution {\n    public int trap(int[] height) {\n        int l = 0, r = height.length - 1, lMax = 0, rMax = 0, water = 0;\n        while (l < r) {\n            if (height[l] < height[r]) {\n                if (height[l] >= lMax) lMax = height[l];\n                else water += lMax - height[l];\n                l++;\n            } else {\n                if (height[r] >= rMax) rMax = height[r];\n                else water += rMax - height[r];\n                r--;\n            }\n        }\n        return water;\n    }\n}`
    },
    testCases: [
      { input: `height = [0,1,0,2,1,0,1,3,2,1,2,1]`, args: [[0,1,0,2,1,0,1,3,2,1,2,1]], expected: 6 },
      { input: `height = [4,2,0,3,2,5]`, args: [[4,2,0,3,2,5]], expected: 9 }
    ]
  },

  53: {
    id: "maximum-subarray",
    number: 53,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
    approach: "Kadane's Algorithm (in-place dynamic programming)",
    targetComplexity: "O(N) Time, O(1) Space",
    hints: [
      "Keep track of the current subarray sum.",
      "If the current sum becomes negative, discard it and restart the subarray from the next element."
    ],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.`,
    functionName: "maxSubArray",
    starterCode: {
      javascript: `function maxSubArray(nums) {\n    // Write Kadane's algorithm here\n}`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}`
    },
    solutionCode: {
      javascript: `function maxSubArray(nums) {\n    let max = nums[0], curr = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        max = Math.max(max, curr);\n    }\n    return max;\n}`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        int max = nums[0], curr = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            curr = Math.max(nums[i], curr + nums[i]);\n            max = Math.max(max, curr);\n        }\n        return max;\n    }\n}`
    },
    testCases: [
      { input: `nums = [-2,1,-3,4,-1,2,1,-5,4]`, args: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
      { input: `nums = [1]`, args: [[1]], expected: 1 },
      { input: `nums = [5,4,-1,7,8]`, args: [[5,4,-1,7,8]], expected: 23 }
    ]
  },

  70: {
    id: "climbing-stairs",
    number: 70,
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["Dynamic Programming", "Math", "Memoization"],
    leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
    approach: "Bottom-Up Fibonacci DP with O(1) space",
    targetComplexity: "O(N) Time, O(1) Space",
    hints: [
      "To reach step n, you can take a single step from n - 1 or a double step from n - 2.",
      "Ways(n) = Ways(n - 1) + Ways(n - 2). This is exactly the Fibonacci sequence!"
    ],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top. Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    functionName: "climbStairs",
    starterCode: {
      javascript: `function climbStairs(n) {\n    // Write your DP solution here\n}`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}`
    },
    solutionCode: {
      javascript: `function climbStairs(n) {\n    if (n <= 2) return n;\n    let prev2 = 1, prev1 = 2;\n    for (let i = 3; i <= n; i++) {\n        const curr = prev1 + prev2;\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return prev1;\n}`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int prev2 = 1, prev1 = 2;\n        for (int i = 3; i <= n; i++) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}`
    },
    testCases: [
      { input: `n = 2`, args: [2], expected: 2 },
      { input: `n = 3`, args: [3], expected: 3 },
      { input: `n = 5`, args: [5], expected: 8 }
    ]
  },

  121: {
    id: "best-time-to-buy-and-sell-stock",
    number: 121,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    approach: "One-pass greedy tracking minimum buy price",
    targetComplexity: "O(N) Time, O(1) Space",
    hints: [
      "Keep track of the minimum stock price seen so far.",
      "At each day, calculate profit = price[today] - minPrice. Update maxProfit if profit is larger."
    ],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    functionName: "maxProfit",
    starterCode: {
      javascript: `function maxProfit(prices) {\n    // Write your one-pass solution here\n}`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}`
    },
    solutionCode: {
      javascript: `function maxProfit(prices) {\n    let minPrice = Infinity, maxProfit = 0;\n    for (let p of prices) {\n        if (p < minPrice) minPrice = p;\n        else if (p - minPrice > maxProfit) maxProfit = p - minPrice;\n    }\n    return maxProfit;\n}`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        int min = Integer.MAX_VALUE, maxProf = 0;\n        for (int p : prices) {\n            if (p < min) min = p;\n            else if (p - min > maxProf) maxProf = p - min;\n        }\n        return maxProf;\n    }\n}`
    },
    testCases: [
      { input: `prices = [7,1,5,3,6,4]`, args: [[7,1,5,3,6,4]], expected: 5 },
      { input: `prices = [7,6,4,3,1]`, args: [[7,6,4,3,1]], expected: 0 }
    ]
  },

  125: {
    id: "valid-palindrome",
    number: 125,
    title: "Valid Palindrome",
    difficulty: "Easy",
    tags: ["Two Pointers", "String"],
    leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/",
    approach: "Two pointers inward from string boundaries",
    targetComplexity: "O(N) Time, O(1) Space",
    hints: ["Clean string of non-alphanumeric chars or skip in-place while comparing left and right."],
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.`,
    functionName: "isPalindrome",
    starterCode: {
      javascript: `function isPalindrome(s) {\n    // Write your two-pointer solution here\n}`,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}`
    },
    solutionCode: {
      javascript: `function isPalindrome(s) {\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    let l = 0, r = clean.length - 1;\n    while (l < r) if (clean[l++] !== clean[r--]) return false;\n    return true;\n}`,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        int l = 0, r = s.length() - 1;\n        while (l < r) {\n            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;\n            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;\n            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;\n            l++; r--;\n        }\n        return true;\n    }\n}`
    },
    testCases: [
      { input: `s = "A man, a plan, a canal: Panama"`, args: ["A man, a plan, a canal: Panama"], expected: true },
      { input: `s = "race a car"`, args: ["race a car"], expected: false }
    ]
  },

  146: {
    id: "lru-cache",
    number: 146,
    title: "LRU Cache",
    difficulty: "Medium",
    tags: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
    leetcodeUrl: "https://leetcode.com/problems/lru-cache/",
    approach: "Hash Map for O(1) lookup + Doubly Linked List for O(1) node detachment and head insertion",
    targetComplexity: "O(1) Time for get and put, O(capacity) Auxiliary Space",
    hints: [
      "To achieve O(1) for both get and put, you need O(1) key-node lookup and O(1) node re-linking.",
      "A Hash Map provides O(1) address lookup. A Doubly Linked List with dummy head and tail provides O(1) eviction and MRU update."
    ],
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
* \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
* \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
* \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, evict the least recently used key.

The functions \`get\` and \`put\` must each run in **$O(1)$ average time complexity**.`,
    functionName: "runLRUCache",
    starterCode: {
      javascript: `/**
 * @param {number} capacity
 */
class LRUCache {
    constructor(capacity) {
        // Initialize your LRU cache data structures here
    }

    get(key) {
        // Return key value or -1
    }

    put(key, value) {
        // Insert or update key-value pair and handle eviction
    }
}

// Test runner helper
function runLRUCache(ops, vals) {
    let cache = null, res = [];
    for (let i = 0; i < ops.length; i++) {
        if (ops[i] === "LRUCache") { cache = new LRUCache(vals[i][0]); res.push(null); }
        else if (ops[i] === "put") { cache.put(vals[i][0], vals[i][1]); res.push(null); }
        else if (ops[i] === "get") { res.push(cache.get(vals[i][0])); }
    }
    return res;
}`,
      java: `import java.util.*;

class LRUCache {
    // Implement O(1) LRU Cache in Java
    public LRUCache(int capacity) {
        
    }
    
    public int get(int key) {
        return -1;
    }
    
    public void put(int key, int value) {
        
    }
}`
    },
    solutionCode: {
      javascript: `class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
    }
    get(key) {
        if (!this.map.has(key)) return -1;
        const val = this.map.get(key);
        this.map.delete(key);
        this.map.set(key, val);
        return val;
    }
    put(key, value) {
        if (this.map.has(key)) this.map.delete(key);
        this.map.set(key, value);
        if (this.map.size > this.capacity) {
            const firstKey = this.map.keys().next().value;
            this.map.delete(firstKey);
        }
    }
}
function runLRUCache(ops, vals) {
    let cache = null, res = [];
    for (let i = 0; i < ops.length; i++) {
        if (ops[i] === "LRUCache") { cache = new LRUCache(vals[i][0]); res.push(null); }
        else if (ops[i] === "put") { cache.put(vals[i][0], vals[i][1]); res.push(null); }
        else if (ops[i] === "get") { res.push(cache.get(vals[i][0])); }
    }
    return res;
}`,
      java: `import java.util.LinkedHashMap;
import java.util.Map;

class LRUCache {
    private final int capacity;
    private final LinkedHashMap<Integer, Integer> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<Integer, Integer>(capacity, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                return size() > LRUCache.this.capacity;
            }
        };
    }
    
    public int get(int key) {
        return map.getOrDefault(key, -1);
    }
    
    public void put(int key, int value) {
        map.put(key, value);
    }
}`
    },
    testCases: [
      {
        input: `["LRUCache","put","put","get","put","get","put","get","get","get"], [[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]`,
        args: [["LRUCache","put","put","get","put","get","put","get","get","get"], [[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]],
        expected: [null,null,null,1,null,-1,null,-1,3,4]
      }
    ]
  },

  167: {
    id: "two-sum-ii",
    number: 167,
    title: "Two Sum II - Input Array Is Sorted",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Binary Search"],
    leetcodeUrl: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    approach: "Two-pointer opposite directional scan converging on sorted values",
    targetComplexity: "O(N) Time, O(1) Auxiliary Space",
    hints: [
      "The array is already sorted. Place left at 0 and right at n - 1.",
      "If sum < target, advance left. If sum > target, decrement right."
    ],
    description: `Given a **1-indexed** array of integers \`numbers\` that is already **sorted in non-decreasing order**, find two numbers such that they add up to a specific \`target\` number. Return the indices \`[index1, index2]\` of length 2.`,
    functionName: "twoSum",
    starterCode: {
      javascript: `function twoSum(numbers, target) {\n    // Write your O(1) space two-pointer solution here\n}`,
      java: `class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        return new int[]{};\n    }\n}`
    },
    solutionCode: {
      javascript: `function twoSum(numbers, target) {\n    let l = 0, r = numbers.length - 1;\n    while (l < r) {\n        const sum = numbers[l] + numbers[r];\n        if (sum === target) return [l + 1, r + 1];\n        if (sum < target) l++; else r--;\n    }\n    return [];\n}`,
      java: `class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        int l = 0, r = numbers.length - 1;\n        while (l < r) {\n            int sum = numbers[l] + numbers[r];\n            if (sum == target) return new int[]{l + 1, r + 1};\n            if (sum < target) l++; else r--;\n        }\n        return new int[]{};\n    }\n}`
    },
    testCases: [
      { input: `numbers = [2,7,11,15], target = 9`, args: [[2,7,11,15], 9], expected: [1,2] },
      { input: `numbers = [2,3,4], target = 6`, args: [[2,3,4], 6], expected: [1,3] },
      { input: `numbers = [-1,0], target = -1`, args: [[-1,0], -1], expected: [1,2] }
    ]
  },

  200: {
    id: "number-of-islands",
    number: 200,
    title: "Number of Islands",
    difficulty: "Medium",
    tags: ["Array", "DFS", "BFS", "Union Find", "Matrix"],
    leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
    approach: "In-place grid sinking DFS/BFS traversal",
    targetComplexity: "O(R * C) Time, O(R * C) Space",
    hints: [
      "Traverse each cell (r, c) in the grid.",
      "When you encounter '1', increment island count and kick off a BFS or DFS to sink all connected 4-directional land cells to '0'."
    ],
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    functionName: "numIslands",
    starterCode: {
      javascript: `/**\n * @param {character[][]} grid\n * @return {number}\n */\nfunction numIslands(grid) {\n    // Write your grid BFS/DFS sinking solution here\n}`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}`
    },
    solutionCode: {
      javascript: `function numIslands(grid) {\n    if (!grid || !grid.length) return 0;\n    let count = 0, R = grid.length, C = grid[0].length;\n    function dfs(r, c) {\n        if (r < 0 || c < 0 || r >= R || c >= C || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n    }\n    for (let r = 0; r < R; r++) {\n        for (let c = 0; c < C; c++) {\n            if (grid[r][c] === '1') { count++; dfs(r, c); }\n        }\n    }\n    return count;\n}`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        if (grid == null || grid.length == 0) return 0;\n        int count = 0, R = grid.length, C = grid[0].length;\n        for (int r = 0; r < R; r++) {\n            for (int c = 0; c < C; c++) {\n                if (grid[r][c] == '1') { count++; dfs(grid, r, c, R, C); }\n            }\n        }\n        return count;\n    }\n    private void dfs(char[][] g, int r, int c, int R, int C) {\n        if (r < 0 || c < 0 || r >= R || c >= C || g[r][c] != '1') return;\n        g[r][c] = '0';\n        dfs(g, r + 1, c, R, C); dfs(g, r - 1, c, R, C); dfs(g, r, c + 1, R, C); dfs(g, r, c - 1, R, C);\n    }\n}`
    },
    testCases: [
      {
        input: `grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]`,
        args: [[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]],
        expected: 1
      },
      {
        input: `grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]`,
        args: [[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]],
        expected: 3
      }
    ]
  },

  206: {
    id: "reverse-linked-list",
    number: 206,
    title: "Reverse Linked List",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion", "Iterative"],
    leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
    approach: "In-place pointer reversal using 3 pointers (prev, curr, temp)",
    targetComplexity: "O(N) Time, O(1) Auxiliary Space",
    hints: ["Save curr.next before updating curr.next = prev."],
    description: `Given the \`head\` of a singly linked list, reverse the list in-place, and return *the reversed list*.`,
    functionName: "reverseList",
    starterCode: {
      javascript: `function reverseList(head) {\n    // Write your in-place pointer reversal here\n}`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}`
    },
    solutionCode: {
      javascript: `function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        let temp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = temp;\n    }\n    return prev;\n}`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode temp = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = temp;\n        }\n        return prev;\n    }\n}`
    },
    testCases: [
      { input: `head = [1,2,3,4,5]`, args: [[1,2,3,4,5]], expected: [5,4,3,2,1] }
    ]
  },

  217: {
    id: "contains-duplicate",
    number: 217,
    title: "Contains Duplicate",
    difficulty: "Easy",
    tags: ["Array", "Hash Table", "Sorting"],
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
    approach: "Hash Set membership check",
    targetComplexity: "O(N) Time, O(N) Space",
    hints: ["Use a Set to track visited numbers. If a number is already in the set, return true."],
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
    functionName: "containsDuplicate",
    starterCode: {
      javascript: `function containsDuplicate(nums) {\n    // Write your solution here\n}`,
      java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}`
    },
    solutionCode: {
      javascript: `function containsDuplicate(nums) {\n    const set = new Set();\n    for (let x of nums) {\n        if (set.has(x)) return true;\n        set.add(x);\n    }\n    return false;\n}`,
      java: `import java.util.HashSet;\nclass Solution {\n    public boolean containsDuplicate(int[] nums) {\n        HashSet<Integer> set = new HashSet<>();\n        for (int x : nums) {\n            if (set.contains(x)) return true;\n            set.add(x);\n        }\n        return false;\n    }\n}`
    },
    testCases: [
      { input: `nums = [1,2,3,1]`, args: [[1,2,3,1]], expected: true },
      { input: `nums = [1,2,3,4]`, args: [[1,2,3,4]], expected: false }
    ]
  },

  226: {
    id: "invert-binary-tree",
    number: 226,
    title: "Invert Binary Tree",
    difficulty: "Easy",
    tags: ["Tree", "DFS", "BFS", "Binary Tree"],
    leetcodeUrl: "https://leetcode.com/problems/invert-binary-tree/",
    approach: "Recursive depth-first child swap",
    targetComplexity: "O(N) Time, O(H) Space",
    hints: ["Recursively swap root.left and root.right at each node."],
    description: `Given the \`root\` of a binary tree, invert the tree, and return *its root*.`,
    functionName: "invertTree",
    starterCode: {
      javascript: `function invertTree(root) {\n    // Write your tree inversion here\n}`,
      java: `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        return null;\n    }\n}`
    },
    solutionCode: {
      javascript: `function invertTree(root) {\n    if (!root) return null;\n    const temp = root.left;\n    root.left = invertTree(root.right);\n    root.right = invertTree(temp);\n    return root;\n}`,
      java: `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(temp);\n        return root;\n    }\n}`
    },
    testCases: [
      { input: `root = [4,2,7,1,3,6,9]`, args: [[4,2,7,1,3,6,9]], expected: [4,7,2,9,6,3,1] }
    ]
  },

  242: {
    id: "valid-anagram",
    number: 242,
    title: "Valid Anagram",
    difficulty: "Easy",
    tags: ["Hash Table", "String", "Sorting"],
    leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
    approach: "26-length frequency counter array",
    targetComplexity: "O(N) Time, O(1) Auxiliary Space",
    hints: ["Count frequency of each character in s, decrement for t. All frequencies must equal 0."],
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.`,
    functionName: "isAnagram",
    starterCode: {
      javascript: `function isAnagram(s, t) {\n    // Write your frequency counter here\n}`,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        return false;\n    }\n}`
    },
    solutionCode: {
      javascript: `function isAnagram(s, t) {\n    if (s.length !== t.length) return false;\n    const count = new Array(26).fill(0);\n    for (let i = 0; i < s.length; i++) {\n        count[s.charCodeAt(i) - 97]++;\n        count[t.charCodeAt(i) - 97]--;\n    }\n    return count.every(c => c === 0);\n}`,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (int i = 0; i < s.length(); i++) {\n            count[s.charAt(i) - 'a']++;\n            count[t.charAt(i) - 'a']--;\n        }\n        for (int c : count) if (c != 0) return false;\n        return true;\n    }\n}`
    },
    testCases: [
      { input: `s = "anagram", t = "nagaram"`, args: ["anagram", "nagaram"], expected: true },
      { input: `s = "rat", t = "car"`, args: ["rat", "car"], expected: false }
    ]
  },

  704: {
    id: "binary-search",
    number: 704,
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    leetcodeUrl: "https://leetcode.com/problems/binary-search/",
    approach: "Standard O(log N) binary search with overflow-safe mid calculation",
    targetComplexity: "O(log N) Time, O(1) Space",
    hints: ["mid = Math.floor((left + right) / 2). If target > nums[mid], left = mid + 1; else right = mid - 1."],
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.`,
    functionName: "search",
    starterCode: {
      javascript: `function search(nums, target) {\n    // Write your binary search here\n}`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}`
    },
    solutionCode: {
      javascript: `function search(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const mid = (l + r) >> 1;\n        if (nums[mid] === target) return mid;\n        if (nums[mid] < target) l = mid + 1; else r = mid - 1;\n    }\n    return -1;\n}`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) l = mid + 1; else r = mid - 1;\n        }\n        return -1;\n    }\n}`
    },
    testCases: [
      { input: `nums = [-1,0,3,5,9,12], target = 9`, args: [[-1,0,3,5,9,12], 9], expected: 4 },
      { input: `nums = [-1,0,3,5,9,12], target = 2`, args: [[-1,0,3,5,9,12], 2], expected: -1 }
    ]
  }
};

// Map day numbers to custom problem sets
window.DSA_PROBLEMS_STORE = {
  1: [window.LEETCODE_DATABASE[167], window.LEETCODE_DATABASE[26], window.LEETCODE_DATABASE[125], window.LEETCODE_DATABASE[1]],
  2: [window.LEETCODE_DATABASE[11], window.LEETCODE_DATABASE[15], window.LEETCODE_DATABASE[42]],
  3: [window.LEETCODE_DATABASE[643], window.LEETCODE_DATABASE[3]],
  4: [window.LEETCODE_DATABASE[3], window.LEETCODE_DATABASE[121]],
  5: [window.LEETCODE_DATABASE[70], window.LEETCODE_DATABASE[53]],
  11: [window.LEETCODE_DATABASE[206], window.LEETCODE_DATABASE[21]],
  12: [window.LEETCODE_DATABASE[20], window.LEETCODE_DATABASE[146]],
  16: [window.LEETCODE_DATABASE[226], window.LEETCODE_DATABASE[704]],
  22: [window.LEETCODE_DATABASE[200], window.LEETCODE_DATABASE[217]]
};

// Global function to resolve ANY problem by number
window.getLeetCodeProblemByNumber = function(num) {
  const parsed = parseInt(num, 10);
  if (!parsed || parsed <= 0) return null;

  // 1. Check if in database
  if (window.LEETCODE_DATABASE[parsed]) {
    return window.LEETCODE_DATABASE[parsed];
  }

  // 2. Generate structured problem representation on the fly for any number!
  return {
    id: `custom-lc-${parsed}`,
    number: parsed,
    title: `LeetCode Problem #${parsed}`,
    difficulty: parsed % 3 === 0 ? "Hard" : parsed % 2 === 0 ? "Medium" : "Easy",
    tags: ["Algorithms", "Data Structures", "LeetCode"],
    leetcodeUrl: `https://leetcode.com/problemset/all/?search=${parsed}`,
    approach: "Analyze constraints and determine optimal time & space complexity pattern",
    targetComplexity: "Optimal Big-O",
    hints: [
      `Review standard patterns for problem #${parsed} on LeetCode.`,
      "Consider whether a two-pointer, hash table, sliding window, tree traversal, or dynamic programming approach applies.",
      "Check the 'Open on LeetCode' link for full test scenarios and constraints."
    ],
    description: `### LeetCode #${parsed}

Solve problem **#${parsed}** directly in this code playground or click **"Open on LeetCode ↗"** above to inspect official test sets and submissions.

**Instructions:**
* Choose JavaScript or Java.
* Write your solution respecting standard LeetCode signature conventions.
* Test against inputs or add custom test cases.`,
    functionName: "solution",
    starterCode: {
      javascript: `/**
 * LeetCode #${parsed}
 * @param {any} input
 * @return {any}
 */
function solution(input) {
    // Write your solution for LeetCode #${parsed} here
    
}`,
      java: `class Solution {
    // LeetCode #${parsed}
    public Object solution(Object input) {
        // Write your solution for LeetCode #${parsed} here
        
        return null;
    }
}`
    },
    solutionCode: {
      javascript: `function solution(input) {
    return input;
}`,
      java: `class Solution {
    public Object solution(Object input) {
        return input;
    }
}`
    },
    testCases: [
      { input: `input = [1, 2, 3]`, args: [[1, 2, 3]], expected: [1, 2, 3] }
    ]
  };
};

// Helper to get problems for a given day
window.getProblemsForDay = function(dayNumber) {
  if (window.DSA_PROBLEMS_STORE[dayNumber]) {
    return window.DSA_PROBLEMS_STORE[dayNumber].filter(Boolean);
  }
  return [window.getLeetCodeProblemByNumber(1), window.getLeetCodeProblemByNumber(20), window.getLeetCodeProblemByNumber(704)];
};
