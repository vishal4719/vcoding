import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/questions');
        setQuestions(response.data);
      } catch (err) {
        setError('Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-gray-500">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-600">Questions</h2>
          <Link
            to="/admin/add-question"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Add New Question
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No questions found. Click "Add New Question" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {question.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {question.description}
                    </p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-gray-600">
                        Difficulty: <span className="font-medium">{question.difficulty}</span>
                      </span>
                      <span className="text-gray-600">
                        Input Format: <span className="font-medium">{question.inputFormat}</span>
                      </span>
                      <span className="text-gray-600">
                        Output Format: <span className="font-medium">{question.outputFormat}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionList; 