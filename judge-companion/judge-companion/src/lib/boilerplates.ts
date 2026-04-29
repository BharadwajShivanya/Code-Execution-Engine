export const boilerplates: Record<string, Record<string, string>> = {
  "two-sum": {
    javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
const nums = input[0].trim().split(' ').map(Number);
const target = Number(input[1].trim());

function twoSum(nums, target) {
    // Write your code here
    
    return [];
}

console.log(JSON.stringify(twoSum(nums, target)));`,
    typescript: `import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
const nums: number[] = input[0].trim().split(' ').map(Number);
const target: number = Number(input[1].trim());

function twoSum(nums: number[], target: number): number[] {
    // Write your code here
    
    return [];
}

console.log(JSON.stringify(twoSum(nums, target)));`,
    python: `import sys

nums = list(map(int, sys.stdin.readline().split()))
target = int(sys.stdin.readline().strip())

class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your code here
        
        return []

sol = Solution()
result = sol.twoSum(nums, target)
# Convert list to JSON string for proper formatting
import json
print(json.dumps(result).replace(" ", ""))`,
    java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your code here
        
        return new int[] {};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] numStr = sc.nextLine().trim().split("\\\\s+");
        int[] nums = new int[numStr.length];
        for (int i = 0; i < numStr.length; i++) {
            nums[i] = Integer.parseInt(numStr[i]);
        }
        int target = sc.nextInt();
        int[] result = twoSum(nums, target);
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i < result.length - 1) System.out.print(",");
        }
        System.out.println("]");
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    
    return {};
}

int main() {
    vector<int> nums;
    int target;
    string line;
    getline(cin, line);
    stringstream ss(line);
    int num;
    while (ss >> num) {
        nums.push_back(num);
    }
    cin >> target;
    vector<int> result = twoSum(nums, target);
    cout << "[";
    for (size_t i = 0; i < result.size(); ++i) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    
    *returnSize = 0;
    return NULL;
}

int main() {
    int nums[100];
    int numsSize = 0;
    int target;
    
    char line[256];
    fgets(line, sizeof(line), stdin);
    char* token = strtok(line, " ");
    while (token != NULL) {
        nums[numsSize++] = atoi(token);
        token = strtok(NULL, " ");
    }
    
    scanf("%d", &target);
    
    int returnSize;
    int* result = twoSum(nums, numsSize, target, &returnSize);
    
    printf("[");
    for (int i = 0; i < returnSize; i++) {
        printf("%d", result[i]);
        if (i < returnSize - 1) printf(",");
    }
    printf("]\\n");
    
    if (result != NULL) free(result);
    return 0;
}`,
    go: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strconv"
    "strings"
)

func twoSum(nums []int, target int) []int {
    // Write your code here
    
    return nil
}

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Scan()
    line := scanner.Text()
    parts := strings.Fields(line)
    nums := make([]int, len(parts))
    for i, part := range parts {
        nums[i], _ = strconv.Atoi(part)
    }
    
    scanner.Scan()
    targetStr := scanner.Text()
    target, _ := strconv.Atoi(targetStr)
    
    result := twoSum(nums, target)
    
    // Output JSON array format
    fmt.Print("[")
    for i, val := range result {
        fmt.Print(val)
        if i < len(result)-1 {
            fmt.Print(",")
        }
    }
    fmt.Println("]")
}`,
    rust: `use std::io::{self, BufRead};

struct Solution;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Write your code here
        
        vec![]
    }
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lines();
    
    let nums_line = lines.next().unwrap().unwrap();
    let nums: Vec<i32> = nums_line.trim().split_whitespace()
        .map(|s| s.parse().unwrap())
        .collect();
    
    let target_line = lines.next().unwrap().unwrap();
    let target: i32 = target_line.trim().parse().unwrap();
    
    let result = Solution::two_sum(nums, target);
    
    print!("[");
    for (i, val) in result.iter().enumerate() {
        print!("{}", val);
        if i < result.len() - 1 {
            print!(",");
        }
    }
    println!("]");
}`
  },
  "palindrome-number": {
    javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const x = Number(input);

/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
    // Write your code here
    
    return false;
}

console.log(isPalindrome(x));`,
    typescript: `import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim();
const x: number = Number(input);

function isPalindrome(x: number): boolean {
    // Write your code here
    
    return false;
}

console.log(isPalindrome(x));`,
    python: `import sys
x = int(sys.stdin.read().strip())

class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Write your code here
        
        return False

sol = Solution()
result = sol.isPalindrome(x)
print("true" if result else "false")`,
    java: `import java.util.*;

public class Main {
    public static boolean isPalindrome(int x) {
        // Write your code here
        
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(sc.hasNextInt()) {
            int x = sc.nextInt();
            boolean result = isPalindrome(x);
            System.out.println(result ? "true" : "false");
        }
    }
}`,
    cpp: `#include <iostream>
using namespace std;

bool isPalindrome(int x) {
    // Write your code here
    
    return false;
}

int main() {
    int x;
    if (cin >> x) {
        bool result = isPalindrome(x);
        cout << (result ? "true" : "false") << endl;
    }
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdbool.h>

bool isPalindrome(int x) {
    // Write your code here
    
    return false;
}

int main() {
    int x;
    if (scanf("%d", &x) == 1) {
        bool result = isPalindrome(x);
        printf(result ? "true\\n" : "false\\n");
    }
    return 0;
}`,
    go: `package main

import (
    "fmt"
)

func isPalindrome(x int) bool {
    // Write your code here
    
    return false
}

func main() {
    var x int
    if _, err := fmt.Scan(&x); err == nil {
        result := isPalindrome(x)
        if result {
            fmt.Println("true")
        } else {
            fmt.Println("false")
        }
    }
}`,
    rust: `use std::io::{self, Read};

struct Solution;

impl Solution {
    pub fn is_palindrome(x: i32) -> bool {
        // Write your code here
        
        false
    }
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let x: i32 = input.trim().parse().unwrap();
    
    let result = Solution::is_palindrome(x);
    println!("{}", if result { "true" } else { "false" });
}`
  },
  "fizz-buzz": {
    javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const n = Number(input);

/**
 * @param {number} n
 * @return {string[]}
 */
function fizzBuzz(n) {
    // Write your code here
    
    return [];
}

console.log(JSON.stringify(fizzBuzz(n)));`,
    typescript: `import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim();
const n: number = Number(input);

function fizzBuzz(n: number): string[] {
    // Write your code here
    
    return [];
}

console.log(JSON.stringify(fizzBuzz(n)));`,
    python: `import sys
import json
n = int(sys.stdin.read().strip())

class Solution:
    def fizzBuzz(self, n: int) -> list[str]:
        # Write your code here
        
        return []

sol = Solution()
result = sol.fizzBuzz(n)
print(json.dumps(result).replace(" ", ""))`,
    java: `import java.util.*;

public class Main {
    public static List<String> fizzBuzz(int n) {
        // Write your code here
        
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(sc.hasNextInt()) {
            int n = sc.nextInt();
            List<String> result = fizzBuzz(n);
            
            System.out.print("[");
            for (int i = 0; i < result.size(); i++) {
                System.out.print("\\"" + result.get(i) + "\\"");
                if (i < result.size() - 1) System.out.print(",");
            }
            System.out.println("]");
        }
    }
}`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<string> fizzBuzz(int n) {
    // Write your code here
    
    return {};
}

int main() {
    int n;
    if (cin >> n) {
        vector<string> result = fizzBuzz(n);
        cout << "[";
        for (size_t i = 0; i < result.size(); ++i) {
            cout << "\\"" << result[i] << "\\"";
            if (i < result.size() - 1) cout << ",";
        }
        cout << "]" << endl;
    }
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
char ** fizzBuzz(int n, int* returnSize) {
    // Write your code here
    
    *returnSize = 0;
    return NULL;
}

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        int returnSize;
        char** result = fizzBuzz(n, &returnSize);
        
        printf("[");
        for (int i = 0; i < returnSize; i++) {
            printf("\\"%s\\"", result[i]);
            if (i < returnSize - 1) printf(",");
            free(result[i]);
        }
        printf("]\\n");
        if (result != NULL) free(result);
    }
    return 0;
}`,
    go: `package main

import (
    "fmt"
)

func fizzBuzz(n int) []string {
    // Write your code here
    
    return nil
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        result := fizzBuzz(n)
        
        fmt.Print("[")
        for i, val := range result {
            fmt.Printf("\\"%s\\"", val)
            if i < len(result)-1 {
                fmt.Print(",")
            }
        }
        fmt.Println("]")
    }
}`,
    rust: `use std::io::{self, Read};

struct Solution;

impl Solution {
    pub fn fizz_buzz(n: i32) -> Vec<String> {
        // Write your code here
        
        vec![]
    }
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let n: i32 = input.trim().parse().unwrap();
    
    let result = Solution::fizz_buzz(n);
    
    print!("[");
    for (i, val) in result.iter().enumerate() {
        print!("\\"{}\\"", val);
        if i < result.len() - 1 {
            print!(",");
        }
    }
    println!("]");
}`
  },
  "valid-parentheses": {
    javascript: `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();

/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Write your code here
    
    return false;
}

console.log(isValid(s));`,
    typescript: `import * as fs from 'fs';
const s: string = fs.readFileSync(0, 'utf-8').trim();

function isValid(s: string): boolean {
    // Write your code here
    
    return false;
}

console.log(isValid(s));`,
    python: `import sys
s = sys.stdin.read().strip()

class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        
        return False

sol = Solution()
result = sol.isValid(s)
print("true" if result else "false")`,
    java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Write your code here
        
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(sc.hasNextLine()) {
            String s = sc.nextLine().trim();
            boolean result = isValid(s);
            System.out.println(result ? "true" : "false");
        }
    }
}`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

bool isValid(string s) {
    // Write your code here
    
    return false;
}

int main() {
    string s;
    if (getline(cin, s)) {
        bool result = isValid(s);
        cout << (result ? "true" : "false") << endl;
    }
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdbool.h>

bool isValid(char * s) {
    // Write your code here
    
    return false;
}

int main() {
    char s[10005];
    if (scanf("%10000s", s) == 1) {
        bool result = isValid(s);
        printf(result ? "true\\n" : "false\\n");
    }
    return 0;
}`,
    go: `package main

import (
    "fmt"
)

func isValid(s string) bool {
    // Write your code here
    
    return false
}

func main() {
    var s string
    if _, err := fmt.Scan(&s); err == nil {
        result := isValid(s)
        if result {
            fmt.Println("true")
        } else {
            fmt.Println("false")
        }
    }
}`,
    rust: `use std::io::{self, Read};

struct Solution;

impl Solution {
    pub fn is_valid(s: String) -> bool {
        // Write your code here
        
        false
    }
}

fn main() {
    let mut s = String::new();
    io::stdin().read_to_string(&mut s).unwrap();
    let s = s.trim().to_string();
    
    let result = Solution::is_valid(s);
    println!("{}", if result { "true" } else { "false" });
}`
  },
  "reverse-integer": {
    javascript: `const fs = require('fs');
const x = Number(fs.readFileSync(0, 'utf-8').trim());

/**
 * @param {number} x
 * @return {number}
 */
function reverse(x) {
    // Write your code here
    
    return 0;
}

console.log(reverse(x));`,
    typescript: `import * as fs from 'fs';
const x: number = Number(fs.readFileSync(0, 'utf-8').trim());

function reverse(x: number): number {
    // Write your code here
    
    return 0;
}

console.log(reverse(x));`,
    python: `import sys
x = int(sys.stdin.read().strip())

class Solution:
    def reverse(self, x: int) -> int:
        # Write your code here
        
        return 0

sol = Solution()
print(sol.reverse(x))`,
    java: `import java.util.*;

public class Main {
    public static int reverse(int x) {
        // Write your code here
        
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if(sc.hasNextInt()) {
            int x = sc.nextInt();
            System.out.println(reverse(x));
        }
    }
}`,
    cpp: `#include <iostream>
using namespace std;

int reverse(int x) {
    // Write your code here
    
    return 0;
}

int main() {
    int x;
    if (cin >> x) {
        cout << reverse(x) << endl;
    }
    return 0;
}`,
    c: `#include <stdio.h>

int reverse(int x) {
    // Write your code here
    
    return 0;
}

int main() {
    int x;
    if (scanf("%d", &x) == 1) {
        printf("%d\\n", reverse(x));
    }
    return 0;
}`,
    go: `package main

import (
    "fmt"
)

func reverse(x int) int {
    // Write your code here
    
    return 0
}

func main() {
    var x int
    if _, err := fmt.Scan(&x); err == nil {
        fmt.Println(reverse(x))
    }
}`,
    rust: `use std::io::{self, Read};

struct Solution;

impl Solution {
    pub fn reverse(x: i32) -> i32 {
        // Write your code here
        
        0
    }
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let x: i32 = input.trim().parse().unwrap();
    
    println!("{}", Solution::reverse(x));
}`
  }
};
