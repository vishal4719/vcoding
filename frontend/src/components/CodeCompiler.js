import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';

function CodeCompiler() {
  const { user } = useAuth();
  const token = user?.token;
  const [sourceCode, setSourceCode] = useState('');
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/judge0/languages');
      setLanguages(response.data);
      if (response.data.length > 0) {
        setSelectedLanguage(response.data[0].id.toString());
      }
    } catch (err) {
      setError('Failed to fetch languages');
      console.error('Error fetching languages:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setOutput('');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        'http://localhost:8080/api/judge0/submit',
        {
          sourceCode,
          languageId: selectedLanguage
        },
        config
      );

      // Handle the response
      const result = response.data;
      if (result.status && result.status.id === 3) { // 3 is the status code for "Accepted"
        setOutput(result.stdout || 'Program executed successfully!');
      } else {
        setOutput(result.stderr || 'Compilation error or runtime error');
      }
    } catch (err) {
      setError('Failed to compile code: ' + (err.response?.data?.message || err.message));
      console.error('Compilation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-orange-600">Code Compiler</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Language
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500"
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source Code
        </label>
        <textarea
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          rows="10"
          className="w-full p-2 border rounded-md font-mono focus:ring-orange-500 focus:border-orange-500"
          placeholder="Write your code here..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-orange-300"
      >
        {loading ? 'Compiling...' : 'Compile & Run'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Output:</h3>
          <pre className="p-3 bg-gray-100 rounded-md overflow-x-auto">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

export default CodeCompiler; 