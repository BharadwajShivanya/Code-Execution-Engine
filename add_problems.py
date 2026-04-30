import re

problems_to_add_go = """		{
			ID:          "median-of-two-sorted-arrays",
			Title:       "Median of Two Sorted Arrays",
			Difficulty:  "Hard",
			Description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
			Examples: []models.ProblemExample{
				{Input: "1 3\\n2", Output: "2.00000", Explanation: "merged array = [1,2,3] and median is 2."},
			},
			Tests: []models.TestCase{
				{Input: "1 3\\n2", Expected: "2.00000"},
				{Input: "1 2\\n3 4", Expected: "2.50000"},
			},
		},
		{
			ID:          "trapping-rain-water",
			Title:       "Trapping Rain Water",
			Difficulty:  "Hard",
			Description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
			Examples: []models.ProblemExample{
				{Input: "0 1 0 2 1 0 1 3 2 1 2 1", Output: "6", Explanation: "The elevation map traps 6 units of rain water."},
			},
			Tests: []models.TestCase{
				{Input: "0 1 0 2 1 0 1 3 2 1 2 1", Expected: "6"},
				{Input: "4 2 0 3 2 5", Expected: "9"},
			},
		},
		{
			ID:          "first-missing-positive",
			Title:       "First Missing Positive",
			Difficulty:  "Hard",
			Description: "Given an unsorted integer array nums, return the smallest missing positive integer.",
			Examples: []models.ProblemExample{
				{Input: "1 2 0", Output: "3"},
				{Input: "3 4 -1 1", Output: "2"},
			},
			Tests: []models.TestCase{
				{Input: "1 2 0", Expected: "3"},
				{Input: "3 4 -1 1", Expected: "2"},
			},
		},
		{
			ID:          "edit-distance",
			Title:       "Edit Distance",
			Difficulty:  "Hard",
			Description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.",
			Examples: []models.ProblemExample{
				{Input: "horse\\nros", Output: "3"},
			},
			Tests: []models.TestCase{
				{Input: "horse\\nros", Expected: "3"},
				{Input: "intention\\nexecution", Expected: "5"},
			},
		},
		{
			ID:          "longest-valid-parentheses",
			Title:       "Longest Valid Parentheses",
			Difficulty:  "Hard",
			Description: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
			Examples: []models.ProblemExample{
				{Input: "(()", Output: "2"},
				{Input: ")()())", Output: "4"},
			},
			Tests: []models.TestCase{
				{Input: "(()", Expected: "2"},
				{Input: ")()())", Expected: "4"},
			},
		},
		{
			ID:          "container-with-most-water",
			Title:       "Container With Most Water",
			Difficulty:  "Medium",
			Description: "You are given an integer array height of length n. Return the maximum amount of water a container can store.",
			Examples: []models.ProblemExample{
				{Input: "1 8 6 2 5 4 8 3 7", Output: "49"},
			},
			Tests: []models.TestCase{
				{Input: "1 8 6 2 5 4 8 3 7", Expected: "49"},
				{Input: "1 1", Expected: "1"},
			},
		},
		{
			ID:          "maximum-subarray",
			Title:       "Maximum Subarray",
			Difficulty:  "Medium",
			Description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
			Examples: []models.ProblemExample{
				{Input: "-2 1 -3 4 -1 2 1 -5 4", Output: "6"},
			},
			Tests: []models.TestCase{
				{Input: "-2 1 -3 4 -1 2 1 -5 4", Expected: "6"},
				{Input: "1", Expected: "1"},
			},
		},
		{
			ID:          "search-in-rotated-sorted-array",
			Title:       "Search in Rotated Sorted Array",
			Difficulty:  "Medium",
			Description: "Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
			Examples: []models.ProblemExample{
				{Input: "4 5 6 7 0 1 2\\n0", Output: "4"},
			},
			Tests: []models.TestCase{
				{Input: "4 5 6 7 0 1 2\\n0", Expected: "4"},
				{Input: "4 5 6 7 0 1 2\\n3", Expected: "-1"},
			},
		},
		{
			ID:          "longest-palindromic-substring",
			Title:       "Longest Palindromic Substring",
			Difficulty:  "Medium",
			Description: "Given a string s, return the longest palindromic substring in s.",
			Examples: []models.ProblemExample{
				{Input: "babad", Output: "bab"},
			},
			Tests: []models.TestCase{
				{Input: "babad", Expected: "bab"},
				{Input: "cbbd", Expected: "bb"},
			},
		},
		{
			ID:          "jump-game",
			Title:       "Jump Game",
			Difficulty:  "Medium",
			Description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
			Examples: []models.ProblemExample{
				{Input: "2 3 1 1 4", Output: "true"},
				{Input: "3 2 1 0 4", Output: "false"},
			},
			Tests: []models.TestCase{
				{Input: "2 3 1 1 4", Expected: "true"},
				{Input: "3 2 1 0 4", Expected: "false"},
			},
		},
		{
			ID:          "single-number",
			Title:       "Single Number",
			Difficulty:  "Easy",
			Description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
			Examples: []models.ProblemExample{
				{Input: "2 2 1", Output: "1"},
			},
			Tests: []models.TestCase{
				{Input: "2 2 1", Expected: "1"},
				{Input: "4 1 2 1 2", Expected: "4"},
			},
		},
		{
			ID:          "missing-number",
			Title:       "Missing Number",
			Difficulty:  "Easy",
			Description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
			Examples: []models.ProblemExample{
				{Input: "3 0 1", Output: "2"},
			},
			Tests: []models.TestCase{
				{Input: "3 0 1", Expected: "2"},
				{Input: "0 1", Expected: "2"},
			},
		},
		{
			ID:          "majority-element",
			Title:       "Majority Element",
			Difficulty:  "Easy",
			Description: "Given an array nums of size n, return the majority element.",
			Examples: []models.ProblemExample{
				{Input: "3 2 3", Output: "3"},
			},
			Tests: []models.TestCase{
				{Input: "3 2 3", Expected: "3"},
				{Input: "2 2 1 1 1 2 2", Expected: "2"},
			},
		},
"""

driver_to_add_cpp = """	case "median-of-two-sorted-arrays":
		driver = `
#include <sstream>
#include <iomanip>
int main() {
    string line1, line2;
    if (getline(cin, line1) && getline(cin, line2)) {
        stringstream ss1(line1), ss2(line2);
        vector<int> nums1, nums2;
        int val;
        while (ss1 >> val) nums1.push_back(val);
        while (ss2 >> val) nums2.push_back(val);
        Solution sol;
        double res = sol.findMedianSortedArrays(nums1, nums2);
        cout << fixed << setprecision(5) << res << endl;
    }
    return 0;
}
`
	case "trapping-rain-water":
		driver = `
#include <sstream>
int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        Solution sol;
        int res = sol.trap(nums);
        cout << res << endl;
    }
    return 0;
}
`
	case "first-missing-positive":
		driver = `
#include <sstream>
int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        Solution sol;
        int res = sol.firstMissingPositive(nums);
        cout << res << endl;
    }
    return 0;
}
`
	case "edit-distance":
		driver = `
int main() {
    string w1, w2;
    if (cin >> w1 >> w2) {
        Solution sol;
        int res = sol.minDistance(w1, w2);
        cout << res << endl;
    }
    return 0;
}
`
	case "longest-valid-parentheses":
		driver = `
int main() {
    string s;
    if (cin >> s) {
        Solution sol;
        int res = sol.longestValidParentheses(s);
        cout << res << endl;
    }
    return 0;
}
`
	case "container-with-most-water":
		driver = `
#include <sstream>
int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        Solution sol;
        int res = sol.maxArea(nums);
        cout << res << endl;
    }
    return 0;
}
`
	case "maximum-subarray":
		driver = `
#include <sstream>
int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        Solution sol;
        int res = sol.maxSubArray(nums);
        cout << res << endl;
    }
    return 0;
}
`
	case "search-in-rotated-sorted-array":
		driver = `
#include <sstream>
int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        int target;
        cin >> target;
        Solution sol;
        int res = sol.search(nums, target);
        cout << res << endl;
    }
    return 0;
}
`
	case "longest-palindromic-substring":
		driver = `
int main() {
    string s;
    if (cin >> s) {
        Solution sol;
        string res = sol.longestPalindrome(s);
        cout << res << endl;
    }
    return 0;
}
`
	case "jump-game":
		driver = `
#include <sstream>
int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        Solution sol;
        bool res = sol.canJump(nums);
        cout << (res ? "true" : "false") << endl;
    }
    return 0;
}
`
	case "single-number":
		driver = `
#include <sstream>
int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        Solution sol;
        int res = sol.singleNumber(nums);
        cout << res << endl;
    }
    return 0;
}
`
	case "missing-number":
		driver = `
#include <sstream>
int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        Solution sol;
        int res = sol.missingNumber(nums);
        cout << res << endl;
    }
    return 0;
}
`
	case "majority-element":
		driver = `
#include <sstream>
int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        Solution sol;
        int res = sol.majorityElement(nums);
        cout << res << endl;
    }
    return 0;
}
`
"""

def update_file(filename, replacement_marker, content_to_insert):
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()
    
    # insert before the replacement marker
    content = content.replace(replacement_marker, content_to_insert + "\n" + replacement_marker)
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

update_file("cmd/api/handlers.go", "\t}\n\n\tc.JSON(http.StatusOK, problems)", problems_to_add_go)
update_file("internal/executor/driver.go", "\t}\n\n\tif driver != \"\"", driver_to_add_cpp)
