package executor

import (
	"strings"

	"Code-Execution-Engine/internal/models"
)

func InjectDriverCode(sub *models.Submission) {
	if strings.ToLower(sub.Language) != "cpp" {
		return
	}
	// If the code already contains "int main", assume the user wrote it.
	if strings.Contains(sub.Code, "int main") {
		return
	}

	driver := ""
	switch sub.ProblemID {
	case "palindrome-number":
		driver = `
int main() {
    int x;
    if (cin >> x) {
        Solution sol;
        bool result = sol.isPalindrome(x);
        cout << (result ? "true" : "false") << endl;
    }
    return 0;
}
`
	case "two-sum":
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
        vector<int> res = sol.twoSum(nums, target);
        cout << "[";
        for(size_t i=0; i<res.size(); ++i) {
            cout << res[i] << (i==res.size()-1 ? "" : ",");
        }
        cout << "]" << endl;
    }
    return 0;
}
`
	case "fizz-buzz":
		driver = `
int main() {
    int n;
    if (cin >> n) {
        Solution sol;
        vector<string> res = sol.fizzBuzz(n);
        cout << "[";
        for(size_t i=0; i<res.size(); ++i) {
            cout << "\"" << res[i] << "\"" << (i==res.size()-1 ? "" : ",");
        }
        cout << "]" << endl;
    }
    return 0;
}
`
	case "valid-parentheses":
		driver = `
int main() {
    string s;
    if (cin >> s) {
        Solution sol;
        bool res = sol.isValid(s);
        cout << (res ? "true" : "false") << endl;
    }
    return 0;
}
`
	case "reverse-integer":
		driver = `
int main() {
    int x;
    if (cin >> x) {
        Solution sol;
        int res = sol.reverse(x);
        cout << res << endl;
    }
    return 0;
}
`
	case "climbing-stairs":
		driver = `
int main() {
    int n;
    if (cin >> n) {
        Solution sol;
        int res = sol.climbStairs(n);
        cout << res << endl;
    }
    return 0;
}
`
	case "longest-substring-without-repeating-characters":
		driver = `
int main() {
    string s;
    if (cin >> s) {
        Solution sol;
        int res = sol.lengthOfLongestSubstring(s);
        cout << res << endl;
    }
    return 0;
}
`
	case "median-of-two-sorted-arrays":
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

	}

	if driver != "" {
		// Prepend standard includes if they are missing
		headers := ""
		if !strings.Contains(sub.Code, "<iostream>") {
			headers += "#include <iostream>\n"
		}
		if !strings.Contains(sub.Code, "<vector>") {
			headers += "#include <vector>\n"
		}
		if !strings.Contains(sub.Code, "<string>") {
			headers += "#include <string>\n"
		}
		if !strings.Contains(sub.Code, "using namespace std;") {
			headers += "using namespace std;\n"
		}

		sub.Code = headers + sub.Code + "\n" + driver
	}
}
