import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import TestResults from './TestResult';

const CodeEditorialPanel = ({
  supportedLanguages,
  selectedLanguage,
  onLanguageChange,
  code,
  onCodeChange,
  getMonacoLangKey,
  isLocked,
  loading,
  onCompile,
  onSubmitAllTestCases,
  onSubmitTest,
  output,
  error,
  testcaseResults,
  input,
  setInput
}) => {
  return (
    <div className="w-1/2 p-8 flex flex-col">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Language
        </label>
        <select
          value={selectedLanguage}
          onChange={e => onLanguageChange(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
          disabled={isLocked}
        >
          {supportedLanguages.map(lang => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex-1 mb-4">
        <MonacoEditor
          height="350px"
          language={getMonacoLangKey(selectedLanguage)}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            readOnly: isLocked
          }}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Input (if needed)
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
          placeholder="Enter input for your code (e.g., array, string, etc.)"
          rows="3"
        />
      </div>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={onCompile}
          disabled={loading || isLocked}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-orange-300"
        >
          {loading ? 'Compiling...' : 'Compile & Run'}
        </button>
        <button
          onClick={onSubmitAllTestCases}
          disabled={loading || isLocked}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Checking...' : 'Run All Test Cases'}
        </button>
        <button
          onClick={onSubmitTest}
          disabled={loading || isLocked}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
        >
          {loading ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>
      
      {output && (
        <div className="mb-2">
          <h4 className="font-semibold text-gray-900 mb-1">Output:</h4>
          <pre className="p-3 bg-gray-100 rounded-md overflow-x-auto text-sm">{output}</pre>
        </div>
      )}
      
      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      
      {testcaseResults && <TestResults testcaseResults={testcaseResults} />}
    </div>
  );
};

export default CodeEditorialPanel;