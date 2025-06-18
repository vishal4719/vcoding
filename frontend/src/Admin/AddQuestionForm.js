import React, { useState } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';

function AddQuestionForm() {
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState([
    {
      title: '',
      description: '',
      difficulty: 'Easy',
      questionType: 'array',
      inputStructure: {
        type: 'array',
        description: 'Array of integers',
        format: 'First line: n (size), Second line: n space-separated integers'
      },
      outputStructure: {
        type: 'integer',
        description: 'Sum of array elements',
        format: 'Single integer'
      },
      sampleInput: '5\n1 2 3 4 5',
      sampleOutput: '15',
      testCases: Array(5).fill({ input: '', output: '', explanation: '' }),
      constraints: '',
      timeLimit: 1000, // in milliseconds
      memoryLimit: 256 // in MB
    }
  ]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Predefined input/output templates for common question types
  const questionTemplates = {
    array: {
      inputStructure: {
        type: 'array',
        description: 'Array of integers',
        format: 'First line: n (size), Second line: n space-separated integers'
      },
      outputStructure: {
        type: 'integer',
        description: 'Result based on array operation',
        format: 'Single integer'
      },
      sampleInput: '5\n1 2 3 4 5',
      sampleOutput: '15'
    },
    string: {
      inputStructure: {
        type: 'string',
        description: 'Input string',
        format: 'Single line containing the string'
      },
      outputStructure: {
        type: 'string',
        description: 'Modified or analyzed string',
        format: 'Single line output'
      },
      sampleInput: 'hello world',
      sampleOutput: 'dlrow olleh'
    },
    matrix: {
      inputStructure: {
        type: 'matrix',
        description: '2D matrix of integers',
        format: 'First line: m n (rows cols), Next m lines: n space-separated integers each'
      },
      outputStructure: {
        type: 'integer',
        description: 'Result of matrix operation',
        format: 'Single integer or matrix'
      },
      sampleInput: '2 3\n1 2 3\n4 5 6',
      sampleOutput: '21'
    },
    graph: {
      inputStructure: {
        type: 'graph',
        description: 'Graph representation',
        format: 'First line: n m (vertices edges), Next m lines: u v (edge between u and v)'
      },
      outputStructure: {
        type: 'integer',
        description: 'Graph algorithm result',
        format: 'Single integer or path'
      },
      sampleInput: '4 4\n1 2\n2 3\n3 4\n4 1',
      sampleOutput: '4'
    },
    tree: {
      inputStructure: {
        type: 'tree',
        description: 'Tree structure',
        format: 'First line: n (nodes), Next n-1 lines: parent child relationships'
      },
      outputStructure: {
        type: 'integer',
        description: 'Tree algorithm result',
        format: 'Single integer or tree traversal'
      },
      sampleInput: '5\n1 2\n1 3\n2 4\n2 5',
      sampleOutput: '3'
    },
    multiple_queries: {
      inputStructure: {
        type: 'multiple',
        description: 'Multiple test cases',
        format: 'First line: t (test cases), Next t blocks: each test case format'
      },
      outputStructure: {
        type: 'multiple',
        description: 'Output for each test case',
        format: 'One output per test case'
      },
      sampleInput: '2\n3\n1 2 3\n4\n1 2 3 4',
      sampleOutput: '6\n10'
    }
  };

  // Handle number of questions change
  const handleNumQuestionsChange = (e) => {
    const val = e.target.value;
    const value = Math.max(1, parseInt(val) || 1);
    setNumQuestions(value);
    setQuestions((prev) => {
      const arr = [...prev];
      while (arr.length < value) {
        arr.push({
          title: '',
          description: '',
          difficulty: 'Easy',
          questionType: 'array',
          inputStructure: { ...questionTemplates.array.inputStructure },
          outputStructure: { ...questionTemplates.array.outputStructure },
          sampleInput: questionTemplates.array.sampleInput,
          sampleOutput: questionTemplates.array.sampleOutput,
          testCases: Array(5).fill({ input: '', output: '', explanation: '' }),
          constraints: '',
          timeLimit: 1000,
          memoryLimit: 256
        });
      }
      return arr.slice(0, value);
    });
  };

  // Handle change for each question
  const handleQuestionChange = (qIdx, field, value) => {
    const updated = [...questions];
    updated[qIdx][field] = value;
    setQuestions(updated);
  };

  // Handle nested object changes (inputStructure, outputStructure)
  const handleStructureChange = (qIdx, structureType, field, value) => {
    const updated = [...questions];
    updated[qIdx][structureType] = { ...updated[qIdx][structureType], [field]: value };
    setQuestions(updated);
  };

  // Handle question type change and apply template
  const handleQuestionTypeChange = (qIdx, type) => {
    const updated = [...questions];
    updated[qIdx].questionType = type;
    updated[qIdx].inputStructure = { ...questionTemplates[type].inputStructure };
    updated[qIdx].outputStructure = { ...questionTemplates[type].outputStructure };
    updated[qIdx].sampleInput = questionTemplates[type].sampleInput;
    updated[qIdx].sampleOutput = questionTemplates[type].sampleOutput;
    setQuestions(updated);
  };

  // Handle test case change for each question
  const handleTestCaseChange = (qIdx, tIdx, field, value) => {
    const updated = [...questions];
    const testCases = [...updated[qIdx].testCases];
    testCases[tIdx] = { ...testCases[tIdx], [field]: value };
    updated[qIdx].testCases = testCases;
    setQuestions(updated);
  };

  // Submit all questions in bulk
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess('');
    setError('');
    
    try {
      // Transform data for backend
      const questionsData = questions.map(q => ({
        ...q,
        inputFormat: `${q.inputStructure.format}\nDescription: ${q.inputStructure.description}`,
        outputFormat: `${q.outputStructure.format}\nDescription: ${q.outputStructure.description}`
      }));
      
      // Simulate API call - replace with actual axios call
      console.log('Submitting questions:', questionsData);
      // Example of what to send to backend:
      await axios.post(`${process.env.REACT_APP_API_URL}/api/questions/bulk`, questionsData);
      
      setSuccess('Questions added successfully! Check console for formatted data.');
      
      // Reset form after successful submission
      setTimeout(() => {
        setQuestions(Array(numQuestions).fill().map(() => ({
          title: '',
          description: '',
          difficulty: 'Easy',
          questionType: 'array',
          inputStructure: { ...questionTemplates.array.inputStructure },
          outputStructure: { ...questionTemplates.array.outputStructure },
          sampleInput: questionTemplates.array.sampleInput,
          sampleOutput: questionTemplates.array.sampleOutput,
          testCases: Array(5).fill({ input: '', output: '', explanation: '' }),
          constraints: '',
          timeLimit: 1000,
          memoryLimit: 256
        })));
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError('Failed to add questions');
      console.error(err);
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-orange-600">Add Multiple Coding Questions</h2>
        
        <div className="space-y-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="font-semibold mr-3 text-gray-700">Number of Questions:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={numQuestions}
              onChange={handleNumQuestionsChange}
              className="border border-gray-300 p-2 rounded w-20 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <form onSubmit={handleSubmit}>
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h3 className="text-xl font-bold text-orange-600 border-b pb-2">
                  Question {qIdx + 1}
                </h3>
                
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={q.title}
                    onChange={(e) => handleQuestionChange(qIdx, 'title', e.target.value)}
                    placeholder="Question Title (e.g., Array Sum Problem)"
                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  
                  <select
                    value={q.difficulty}
                    onChange={(e) => handleQuestionChange(qIdx, 'difficulty', e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <textarea
                  value={q.description}
                  onChange={(e) => handleQuestionChange(qIdx, 'description', e.target.value)}
                  placeholder="Detailed problem description..."
                  className="w-full border border-gray-300 p-3 rounded h-24 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />

                {/* Question Type Selection */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Question Type:</label>
                  <select
                    value={q.questionType}
                    onChange={(e) => handleQuestionTypeChange(qIdx, e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="array">Array Problems</option>
                    <option value="string">String Manipulation</option>
                    <option value="matrix">Matrix Operations</option>
                    <option value="graph">Graph Algorithms</option>
                    <option value="tree">Tree Problems</option>
                    <option value="multiple_queries">Multiple Test Cases</option>
                  </select>
                </div>

                {/* Input Structure */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Input Structure:</label>
                  <textarea
                    value={q.inputStructure.format}
                    onChange={(e) => handleStructureChange(qIdx, 'inputStructure', 'format', e.target.value)}
                    placeholder="Input format description..."
                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Output Structure */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Output Structure:</label>
                  <textarea
                    value={q.outputStructure.format}
                    onChange={(e) => handleStructureChange(qIdx, 'outputStructure', 'format', e.target.value)}
                    placeholder="Output format description..."
                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Sample Input */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Sample Input:</label>
                  <textarea
                    value={q.sampleInput}
                    onChange={(e) => handleQuestionChange(qIdx, 'sampleInput', e.target.value)}
                    placeholder="Sample input..."
                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Sample Output */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Sample Output:</label>
                  <textarea
                    value={q.sampleOutput}
                    onChange={(e) => handleQuestionChange(qIdx, 'sampleOutput', e.target.value)}
                    placeholder="Sample output..."
                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Test Cases */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Test Cases:</label>
                  <div className="text-xs text-gray-500 mb-2">Enter the input exactly as the user's code should read it from standard input. For arrays, use:<br/>5<br/>1 2 3 4 5</div>
                  {q.testCases.map((testCase, tIdx) => (
                    <div key={tIdx} className="flex gap-2 mb-2">
                      <textarea
                        placeholder={`Test Case ${tIdx + 1} Input (multi-line allowed)`}
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(qIdx, tIdx, 'input', e.target.value)}
                        className="w-1/2 border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={2}
                        required
                      />
                      <input
                        placeholder="Output"
                        value={testCase.output}
                        onChange={(e) => handleTestCaseChange(qIdx, tIdx, 'output', e.target.value)}
                        className="w-1/2 border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Constraints:</label>
                  <textarea
                    value={q.constraints}
                    onChange={(e) => handleQuestionChange(qIdx, 'constraints', e.target.value)}
                    placeholder="Problem constraints..."
                    className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Time and Memory Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Time Limit (ms):</label>
                    <input
                      type="number"
                      value={q.timeLimit}
                      onChange={(e) => handleQuestionChange(qIdx, 'timeLimit', parseInt(e.target.value))}
                      className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Memory Limit (MB):</label>
                    <input
                      type="number"
                      value={q.memoryLimit}
                      onChange={(e) => handleQuestionChange(qIdx, 'memoryLimit', parseInt(e.target.value))}
                      className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
              Add Questions
            </button>
          </form>
          {success && (
            <div className="text-green-600 mt-2">
              {success}
              <div className="text-sm text-gray-500 mt-1">Redirecting to questions list...</div>
            </div>
          )}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default AddQuestionForm;