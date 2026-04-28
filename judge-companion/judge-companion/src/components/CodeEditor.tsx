import Editor from "@monaco-editor/react";
import { useTheme } from "@/components/ThemeProvider";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

const defaultCode: Record<string, string> = {
  javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
const nums = input[0].trim().split(' ').map(Number);
const target = Number(input[1].trim());

function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}

console.log(JSON.stringify(twoSum(nums, target)));`,
  typescript: `import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
const nums: number[] = input[0].trim().split(' ').map(Number);
const target: number = Number(input[1].trim());

function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}

console.log(JSON.stringify(twoSum(nums, target)));`,
  python: `import sys

nums = list(map(int, sys.stdin.readline().split()))
target = int(sys.stdin.readline().strip())

class Solution:
    def twoSum(self, nums, target):
        seen = {}
        
        for i, num in enumerate(nums):
            complement = target - num
            
            if complement in seen:
                return [seen[complement], i]
            
            seen[num] = i
        
        return []

sol = Solution()
result = sol.twoSum(nums, target)
print(result)`,
  java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            
            map.put(nums[i], i);
        }
        
        return new int[] {};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] numStr = sc.nextLine().split(" ");
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
    unordered_map<int, int> map;
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        
        map[nums[i]] = i;
    }
    
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

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* result = (int*)malloc(2 * sizeof(int));
    *returnSize = 2;
    
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    
    return result;
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
    
    free(result);
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
    seen := make(map[int]int)
    
    for i, num := range nums {
        complement := target - num
        
        if j, ok := seen[complement]; ok {
            return []int{j, i}
        }
        
        seen[num] = i
    }
    
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
    fmt.Printf("%v\\n", result)
}`,
  rust: `use std::io::{self, BufRead};
use std::collections::HashMap;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut map = HashMap::new();
        
        for (i, &num) in nums.iter().enumerate() {
            let complement = target - num;
            
            if let Some(&j) = map.get(&complement) {
                return vec![j as i32, i as i32];
            }
            
            map.insert(num, i);
        }
        
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
    println!("{:?}", result);
}`,
};

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  const editorValue = value || defaultCode[language] || defaultCode.javascript;

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border">
      <Editor
        height="100%"
        language={language === "cpp" ? "cpp" : language === "c" ? "c" : language}
        value={editorValue}
        onChange={onChange}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: "line",
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "off",
          contextmenu: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  );
}

export { defaultCode };
