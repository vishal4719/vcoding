// Default code for each language with comprehensive imports
export const DEFAULT_CODE = {
  python: `import sys
import os
import math
import collections
from collections import defaultdict, deque, Counter
import heapq
import bisect
import itertools
from itertools import combinations, permutations
import re
from functools import lru_cache
import copy

def solution():
    # Write your code here
    print("Hello")

if __name__ == "__main__":
    solution()`,

  java: `import java.util.*;
import java.io.*;
import java.math.*;
import java.text.*;
import java.util.regex.*;
import java.util.stream.*;
import java.time.*;
import java.nio.file.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your code here
        System.out.println("Hello");
        sc.close();
    }
}`,

  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>
#include <queue>
#include <stack>
#include <deque>
#include <cmath>
#include <climits>
#include <cstring>
#include <utility>
#include <iomanip>
#include <sstream>
#include <fstream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Write your code here
    cout << "Hello" << endl;
    
    return 0;
}`,

  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <limits.h>
#include <stdbool.h>
#include <ctype.h>
#include <time.h>

int main() {
    // Write your code here
    printf("Hello\\n");
    return 0;
}`,

  javascript: `// Node.js built-in modules
const fs = require('fs');
const path = require('path');
const util = require('util');
const readline = require('readline');

// Helper functions for competitive programming
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
}

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
}

function main() {
    // Write your code here
    console.log("Hello");
}

main();`,

  php: `<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Common PHP functions and classes are available by default
// Including: array functions, string functions, math functions, etc.

function solution() {
    // Write your code here
    echo "Hello\\n";
}

// Helper function for reading input
function readLine() {
    return trim(fgets(STDIN));
}

function readInt() {
    return intval(trim(fgets(STDIN)));
}

function readArray() {
    return array_map('intval', explode(' ', trim(fgets(STDIN))));
}

// Main execution
solution();
?>`
};

// Hardcoded supported languages and their Judge0 IDs
export const SUPPORTED_LANGUAGES = [
  { id: 71, name: 'Python (3.8.1)' },
  { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  { id: 50, name: 'C (GCC 9.2.0)' },
  { id: 54, name: 'C++ (GCC 9.2.0)' },
  { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  { id: 68, name: 'PHP (7.4.1)' }
];

// Map Judge0 language ID to Monaco language key
export function getMonacoLangKey(judge0Id) {
  switch (Number(judge0Id)) {
    case 71: return 'python';
    case 62: return 'java';
    case 54: return 'cpp';
    case 50: return 'c';
    case 63: return 'javascript';
    case 68: return 'php';
    default: return 'cpp';
  }
}

// Format time helper function
export function formatTime(ms) {
  if (ms <= 0) return "00:00:00";
  let totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  totalSeconds %= 3600;
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}