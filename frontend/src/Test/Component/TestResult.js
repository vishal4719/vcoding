import React from 'react';

const TestResults = ({ testcaseResults }) => {
  if (!Array.isArray(testcaseResults)) {
    return <div className="mt-4 text-red-600">Invalid test case results format.</div>;
  }
  return (
    <div className="mt-4">
      <h4 className="font-semibold text-gray-900 mb-2">Test Case Results:</h4>
      <ul className="space-y-2">
        {testcaseResults.map((result, index) => (
          <li key={index} className="p-2 bg-gray-100 rounded-md">
            <span className="font-medium">Test Case {index + 1}:</span> {result.passed ? 'Passed' : 'Failed'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestResults;
