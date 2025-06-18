import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import { useAuth } from './Authentication/AuthContext';

// Default code for each language with comprehensive imports
const DEFAULT_CODE = {
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
const SUPPORTED_LANGUAGES = [
  { id: 71, name: 'Python (3.8.1)', icon: '🐍' },
  { id: 62, name: 'Java (OpenJDK 13.0.1)', icon: '☕' },
  { id: 50, name: 'C (GCC 9.2.0)', icon: '⚡' },
  { id: 54, name: 'C++ (GCC 9.2.0)', icon: '🚀' },
  { id: 63, name: 'JavaScript (Node.js 12.14.0)', icon: '🟨' },
  { id: 68, name: 'PHP (7.4.1)', icon: '🐘' }
];

// Map Judge0 language ID to Monaco language key
function getMonacoLangKey(judge0Id) {
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

function formatTime(ms) {
  if (ms <= 0) return "00:00:00";
  let totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  totalSeconds %= 3600;
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function TestTakingPage() {
  const { testId } = useParams();
  const { user } = useAuth();
  const token = user?.token;
  const [test, setTest] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState(DEFAULT_CODE[getMonacoLangKey(SUPPORTED_LANGUAGES[0].id)]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0].id.toString());
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testcaseResults, setTestcaseResults] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const autoSubmitRef = useRef(false);
  const [showTestEndedModal, setShowTestEndedModal] = useState(false);
  const [autoSubmitMarks, setAutoSubmitMarks] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [violationCount, setViolationCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');

  // Fetch test details and check if test is active
  useEffect(() => {
    async function fetchTest() {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`http://localhost:8080/api/tests/${testId}`, config);
        setTest(res.data);
        if (res.data.questions && res.data.questions.length > 0) {
          setSelectedQuestion(res.data.questions[0]);
        }
      } catch (err) {
        setError('Failed to fetch test details');
      }
    }
    if (testId && token) fetchTest();
  }, [testId, token]);

  // Set default code when language changes
  useEffect(() => {
    if (!selectedLanguage) return;
    setCode(DEFAULT_CODE[getMonacoLangKey(selectedLanguage)] || '');
    // eslint-disable-next-line
  }, [selectedLanguage]);

  // Timer effect
  useEffect(() => {
    if (!test || !test.endDateTime) return;
    const end = new Date(test.endDateTime).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const diff = end - now;
      setRemainingTime(diff > 0 ? diff : 0);
      if (diff <= 0 && !autoSubmitRef.current) {
        autoSubmitRef.current = true;
        setIsLocked(true);
        handleAutoSubmitTest();
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [test]);

  // Fullscreen and anti-tab-switch logic
  useEffect(() => {
    if (!testStarted) return;
    // Handler for fullscreen exit or tab switch
    const handleViolation = () => {
      setViolationCount(prev => {
        const next = prev + 1;
        if (next < 3) {
          setShowWarningModal(true);
          // Try to re-enter fullscreen after 1 second
          setTimeout(() => {
            const elem = document.documentElement;
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
          }, 1000);
        } else {
          // Auto-submit and logout
          setIsLocked(true);
          handleAutoSubmitTest();
          setTimeout(() => {
            logout();
            navigate('/');
          }, 2000);
        }
        return next;
      });
    };

    // Listen for fullscreen change
    const fullscreenChangeEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];
    const fullscreenListener = () => {
      if (!document.fullscreenElement &&
          !document.webkitFullscreenElement &&
          !document.mozFullScreenElement &&
          !document.msFullscreenElement) {
        handleViolation();
      }
    };
    fullscreenChangeEvents.forEach(event => {
      document.addEventListener(event, fullscreenListener);
    });

    // Listen for tab/window switch
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Clean up
    return () => {
      fullscreenChangeEvents.forEach(event => {
        document.removeEventListener(event, fullscreenListener);
      });
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line
  }, [testStarted]);

  // Start test handler (triggered by button)
  const handleStartTest = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    setTestStarted(true);
  };

  // Close warning modal
  const handleCloseWarning = () => setShowWarningModal(false);

  const handleCompile = async () => {
    setLoading(true);
    setOutput('');
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(
        'http://localhost:8080/api/code/run',
        {
          code,
          languageId: Number(selectedLanguage),
          stdin: '' // You can add user input here if needed
        },
        config
      );
      // Use the output field from the response
      setOutput(res.data.output || res.data.stdout || '');
    } catch (err) {
      setError('Failed to compile code: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handler for running all test cases
  const handleSubmitAllTestCases = async () => {
    setLoading(true);
    setError('');
    setTestcaseResults(null);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(
        `http://localhost:8080/api/questions/${selectedQuestion.id}/submit`,
        {
          code,
          languageId: Number(selectedLanguage)
        },
        config
      );
      setTestcaseResults(res.data); // { summary, results }
    } catch (err) {
      setError('Failed to check test cases: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit handler
  const handleAutoSubmitTest = async () => {
    setLoading(true);
    setError('');
    setTestcaseResults(null);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(
        `http://localhost:8080/api/questions/${selectedQuestion.id}/submit-test`,
        {
          code,
          languageId: Number(selectedLanguage),
          testId: test?.id
        },
        config
      );
      setAutoSubmitMarks(res.data.marks);
      setShowTestEndedModal(true);
    } catch (err) {
      setError('Failed to auto-submit test: ' + (err.response?.data?.error || err.message));
      setShowTestEndedModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Manual submit handler
  const handleSubmitTest = async () => {
    setLoading(true);
    setError('');
    setTestcaseResults(null);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(
        `http://localhost:8080/api/questions/${selectedQuestion.id}/submit-test`,
        {
          code,
          languageId: Number(selectedLanguage),
          testId: test?.id
        },
        config
      );
      alert(`Test submitted! Marks: ${res.data.marks}`);
    } catch (err) {
      setError('Failed to submit test: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Add this handler if not present
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-red-200">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!test || !selectedQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading test...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Start Test Modal */}
      {!testStarted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md mx-4 border-2 border-indigo-200">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold mb-6 text-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Start?
            </h2>
            <p className="mb-6 text-gray-600 leading-relaxed">
              Click the button below to start the test. The test will go fullscreen and you must not leave fullscreen or switch tabs/windows.
            </p>
            <button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={handleStartTest}
            >
              Start Test
            </button>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md mx-4 border-2 border-yellow-200">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold mb-6 text-yellow-600">Warning</h2>
            <p className="mb-6 text-gray-600 leading-relaxed">
              You are not allowed to leave fullscreen or switch tabs/windows during the test.<br/>
              If you do this <span className="font-bold text-red-600">{3 - violationCount}</span> more time(s), your test will be auto-submitted and you will be logged out.
            </p>
            <button
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={handleCloseWarning}
            >
              Continue Test
            </button>
          </div>
        </div>
      )}

      {/* Test Content */}
      {testStarted && (
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-800">Coding Test</h1>
                  <div className="px-4 py-2 bg-indigo-100 rounded-full">
                    <span className="text-indigo-700 font-semibold">{selectedQuestion.title}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {remainingTime !== null && (
                    <>
                      <div className="text-sm text-gray-600">Time Remaining:</div>
                      <div className="px-4 py-2 bg-red-100 rounded-lg">
                        <span className="text-red-700 font-bold text-lg">{formatTime(remainingTime)}</span>
                      </div>
                    </>
                  )}
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex bg-gray-50">
            {/* Left Panel - Problem Description */}
            <div className="w-1/3 bg-white shadow-lg border-r border-gray-200 flex flex-col">
              {/* Question Navigation */}
              {test.questions.length > 1 && (
                <div className="border-b border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Questions</h3>
                  <div className="flex flex-wrap gap-2">
                    {test.questions.map((q, idx) => (
                      <button
                        key={q.id}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          q.id === selectedQuestion.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedQuestion(q)}
                      >
                        Q{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">{selectedQuestion.title}</h2>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {selectedQuestion.description}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">📥 Input Format</h4>
                      <p className="text-blue-700 text-sm">{selectedQuestion.inputFormat}</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">📤 Output Format</h4>
                      <p className="text-green-700 text-sm">{selectedQuestion.outputFormat}</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2">💡 Sample Input</h4>
                      <pre className="text-purple-700 text-sm bg-white p-2 rounded border">
                        {selectedQuestion.sampleInput}
                      </pre>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">✅ Sample Output</h4>
                      <pre className="text-orange-700 text-sm bg-white p-2 rounded border">
                        {selectedQuestion.sampleOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Code Editor */}
            <div className="flex-1 flex flex-col bg-gray-900">
              {/* Editor Header */}
              <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="text-gray-300 text-sm font-medium">Language:</label>
                    <select
                      value={selectedLanguage}
                      onChange={e => setSelectedLanguage(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none transition-colors"
                      disabled={isLocked}
                    >
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.id} value={lang.id}>
                          {lang.icon} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCompile}
                      disabled={loading || isLocked}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>🔧</span>
                      <span>{loading ? 'Running...' : 'Run Code'}</span>
                    </button>
                    
                    <button
                      onClick={handleSubmitAllTestCases}
                      disabled={loading || isLocked}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>🧪</span>
                      <span>{loading ? 'Testing...' : 'Test All'}</span>
                    </button>
                    
                    <button
                      onClick={handleSubmitTest}
                      disabled={loading || isLocked}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>🚀</span>
                      <span>{loading ? 'Submitting...' : 'Submit'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 relative">
                <MonacoEditor
                  height="100%"
                  language={getMonacoLangKey(selectedLanguage)}
                  value={code}
                  onChange={value => setCode(value)}
                  theme="vs-dark"
                  options={{
                    fontSize: 16,
                    minimap: { enabled: true },
                    automaticLayout: true,
                    tabSize: 4,
                    insertSpaces: true,
                    readOnly: isLocked,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    renderWhitespace: 'selection',
                    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                    fontLigatures: true,
                    cursorBlinking: 'smooth',
                    cursorStyle: 'line',
                    wordWrap: 'on',
                    bracketPairColorization: { enabled: true }
                  }}
                />
              </div>

              {/* Output/Results Panel */}
              <div className="bg-gray-800 border-t border-gray-700 max-h-80 overflow-y-auto">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-600">
                  <button
                    onClick={() => setActiveTab('output')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'output'
                        ? 'text-white bg-gray-700 border-b-2 border-indigo-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Output
                  </button>
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'results'
                        ? 'text-white bg-gray-700 border-b-2 border-indigo-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Test Results
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                  {activeTab === 'output' && (
                    <div>
                      {error && (
                        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg border border-red-700">
                          <h4 className="font-semibold mb-1">❌ Error:</h4>
                          <pre className="text-sm whitespace-pre-wrap">{error}</pre>
                        </div>
                      )}
                      {output && (
                        <div className="p-3 bg-gray-900 text-green-400 rounded-lg border border-gray-600">
                          <h4 className="font-semibold mb-2 text-green-300">✅ Output:</h4>
                          <pre className="text-sm whitespace-pre-wrap">{output}</pre>
                        </div>
                      )}
                      {!output && !error && (
                        <div className="text-gray-400 text-center py-8">
                          <div className="text-4xl mb-2">💻</div>
                          <p>Run your code to see output here</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'results' && (
                    <div>
                      {testcaseResults && (
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
                            <h3 className="text-lg font-bold text-white mb-2">Test Case Results</h3>
                            <div className="flex items-center space-x-6">
                              <div className="text-green-400">
                                <span className="font-semibold">Passed:</span> {testcaseResults.summary.passed}/{testcaseResults.summary.total}
                              </div>
                              <div className="text-blue-400">
                                <span className="font-semibold">Score:</span> {testcaseResults.summary.score}%
                              </div>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full bg-gray-900 rounded-lg border border-gray-600">
                              <thead>
                                <tr className="bg-gray-800">
                                  <th className="px-4 py-3 text-left text-white font-semibold border-b border-gray-600">#</th>
                                  <th className="px-4 py-3 text-left text-white font-semibold border-b border-gray-600">Input</th>
                                  <th className="px-4 py-3 text-left text-white font-semibold border-b border-gray-600">Expected</th>
                                  <th className="px-4 py-3 text-left text-white font-semibold border-b border-gray-600">Actual</th>
                                  <th className="px-4 py-3 text-left text-white font-semibold border-b border-gray-600">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {testcaseResults.results.map((tc, index) => (
                                  <tr key={tc.testCase} className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                                    <td className="px-4 py-3 text-gray-300">{tc.testCase}</td>
                                    <td className="px-4 py-3">
                                      <pre className="text-gray-300 text-sm bg-gray-800 p-2 rounded max-w-xs overflow-x-auto">
                                        {tc.input}
                                      </pre>
                                    </td>
                                    <td className="px-4 py-3">
                                      <pre className="text-gray-300 text-sm bg-gray-800 p-2 rounded max-w-xs overflow-x-auto">
                                        {tc.expected}
                                      </pre>
                                    </td>
                                    <td className="px-4 py-3">
                                      <pre className="text-gray-300 text-sm bg-gray-800 p-2 rounded max-w-xs overflow-x-auto">
                                        {tc.actual}
                                      </pre>
                                    </td>
                                    <td className="px-4 py-3">
                                      {tc.passed ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-200 border border-green-700">
                                          ✅ Passed
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-900 text-red-200 border border-red-700">
                                          ❌ Failed
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {!testcaseResults && (
                        <div className="text-gray-400 text-center py-8">
                          <div className="text-4xl mb-2">🧪</div>
                          <p>Run test cases to see results here</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Test End Modal */}
          {showTestEndedModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 backdrop-blur-sm">
              <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md mx-4 border-2 border-red-200">
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-3xl font-bold mb-6 text-red-600">Test Ended</h2>
                {autoSubmitMarks !== null ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      Time is up! Your test was auto-submitted.
                    </p>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        Marks: {autoSubmitMarks}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mb-6 text-gray-600 leading-relaxed">
                    This test is no longer active. Your session has ended.
                  </p>
                )}
                <button
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mt-6"
                  onClick={handleLogout}
                >
                  Exit Test
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TestTakingPage;