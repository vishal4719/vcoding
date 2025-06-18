import React from 'react';

const QuestionPanel = ({ test, selectedQuestion, onQuestionSelect, remainingTime, formatTime }) => {
  return (
    <div className="w-1/2 p-8 border-r border-gray-200 flex flex-col">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">{selectedQuestion.title}</h2>
      <div className="mb-4 text-gray-800 whitespace-pre-line">{selectedQuestion.description}</div>
      <div className="mb-2 text-sm text-gray-600">
        <b>Input Format:</b> {selectedQuestion.inputFormat}
      </div>
      <div className="mb-2 text-sm text-gray-600">
        <b>Output Format:</b> {selectedQuestion.outputFormat}
      </div>
      <div className="mb-2 text-sm text-gray-600">
        <b>Sample Input:</b> {selectedQuestion.sampleInput}
      </div>
      <div className="mb-2 text-sm text-gray-600">
        <b>Sample Output:</b> {selectedQuestion.sampleOutput}
      </div>
      
      {/* If multiple questions, allow switching */}
      {test.questions.length > 1 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Other Questions:</h4>
          <ul className="space-y-1">
            {test.questions.map((q, idx) => (
              <li key={q.id}>
                <button
                  className={`text-left px-2 py-1 rounded ${
                    q.id === selectedQuestion.id 
                      ? 'bg-orange-100 font-bold' 
                      : 'hover:bg-orange-50'
                  }`}
                  onClick={() => onQuestionSelect(q)}
                >
                  Q{idx + 1}: {q.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {remainingTime !== null && (
        <div className="mb-4 text-xl font-bold text-red-600">
          Time Remaining: {formatTime(remainingTime)}
        </div>
      )}
    </div>
  );
};

export default QuestionPanel;