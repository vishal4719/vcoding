import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

function TestManagement() {
  const { user } = useAuth();
  const token = user?.token;
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    questionIds: [],
    startDateTime: '',
    endDateTime: '',
    complexityLevels: {}
  });
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [olderTests, setOlderTests] = useState([]);
  const navigate = useNavigate();

  // Complexity levels
  const complexityLevels = [
    { value: 'EASY', label: 'Easy', color: 'text-green-600' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
    { value: 'HARD', label: 'Hard', color: 'text-red-600' }
  ];

  // Fetch tests, questions
  useEffect(() => {
    async function fetchData() {
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const [testsRes, questionsRes, olderTestsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/tests/active', config),
          axios.get('http://localhost:8080/api/questions', config),
          axios.get('http://localhost:8080/api/tests/inactive-for-user', config)
        ]);
        
        // Process data with complexity information
        const processedTests = Array.isArray(testsRes.data) 
          ? testsRes.data.map(test => ({
              ...test,
              id: test.id || test._id || null,
              questions: Array.isArray(test.questions) ? test.questions.map(q => ({
                ...q,
                complexity: q.complexity || 'MEDIUM' // Default complexity
              })) : []
            }))
          : [];
        
        const processedQuestions = Array.isArray(questionsRes.data)
          ? questionsRes.data.map(q => ({
              ...q,
              id: q.id || q._id || null,
              complexity: q.complexity || 'MEDIUM' // Default complexity
            }))
          : [];
        
        const processedOlderTests = Array.isArray(olderTestsRes.data)
          ? olderTestsRes.data.map(test => ({
              ...test,
              id: test.id || test._id || null,
              questions: Array.isArray(test.questions) ? test.questions.map(q => ({
                ...q,
                complexity: q.complexity || 'MEDIUM' // Default complexity
              })) : []
            }))
          : [];

        setTests(processedTests);
        setQuestions(processedQuestions);
        setOlderTests(processedOlderTests);
      } catch (err) {
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
        console.error('Fetch error:', err);
        setTests([]);
        setQuestions([]);
        setOlderTests([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      // Transform formData to include complexity levels
      const testData = {
        ...formData,
        questions: formData.questionIds.map(id => ({
          questionId: id,
          complexity: formData.complexityLevels[id] || 'MEDIUM'
        }))
      };

      const response = await axios.post('http://localhost:8080/api/tests', testData, config);
      setTests([...tests, response.data]);
      setShowCreateForm(false);
      setFormData({
        questionIds: [],
        startDateTime: '',
        endDateTime: '',
        complexityLevels: {}
      });
    } catch (err) {
      setError('Failed to create test: ' + (err.response?.data?.message || err.message));
      console.error('Create test error:', err);
    }
  };

  const handleDeactivateTest = async (id) => {
    try {
      setError('');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.delete(`http://localhost:8080/api/tests/${id}`, config);
      setTests(tests.filter(test => test.id !== id));
    } catch (err) {
      setError('Failed to deactivate test: ' + (err.response?.data?.message || err.message));
      console.error('Deactivate test error:', err);
    }
  };

  // Add this debug function at the top of the component
  const logTestData = (test) => {
    if (!test) {
      console.log('Test is null or undefined');
      return;
    }
    console.log('Full test object:', test);
    console.log('Test ID:', test._id);
    console.log('Test ID type:', typeof test._id);
    console.log('All test properties:', Object.keys(test));
  };

  const getTestId = (test) => {
    if (!test) {
      console.error('Test is null or undefined');
      return null;
    }
    
    // Try all possible ID fields
    const possibleId = test.id || test._id || test.testId;
    
    if (!possibleId) {
      console.error('No valid ID found in test:', test);
      return null;
    }
    
    // Convert ObjectId to string if needed
    if (typeof possibleId === 'object' && possibleId.$oid) {
      return possibleId.$oid;
    }
    
    // Ensure we return a string
    return String(possibleId);
  };

  const handleLaunchTest = async (testId, testLink) => {
    try {
      setError('');
      if (!testId) {
        throw new Error('Test ID is required');
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.post(
        `http://localhost:8080/api/tests/${testId}/launch`,
        {},
        config
      );
      // Show modal instead of opening the link
      setShowLaunchModal(true);
      // Refresh the test list
      const testsRes = await axios.get('http://localhost:8080/api/tests/active', config);
      setTests(testsRes.data);
    } catch (err) {
      setError('Failed to launch test: ' + (err.response?.data?.message || err.message));
      console.error('Launch test error:', err);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const renderTest = (test, isOlderTest = false) => {
    if (!test) return null;
    
    const testId = getTestId(test);
    if (!testId) return null;

    return (
      <div key={testId} className={`border rounded-lg p-4 ${isOlderTest ? 'bg-gray-100 shadow-sm opacity-70 relative' : 'bg-white shadow-sm'}`}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Questions:</h4>
            <ul className="list-disc ml-6 mb-2">
              {Array.isArray(test.questions) && test.questions.length > 0 ? (
                test.questions.map(q => {
                  if (!q) return null;
                  const questionId = q.id || q._id;
                  if (!questionId) return null;
                  
                  const complexity = q.complexity || 'MEDIUM';
                  const complexityColor = complexityLevels.find(c => c.value === complexity)?.color || 'text-gray-600';
                  
                  return (
                    <li key={String(questionId)} className="mb-2">
                      <div className="flex items-center">
                        <span className="font-medium">{q.title || 'Untitled Question'}</span>
                        <span className={`ml-2 text-sm ${complexityColor}`}>
                          [{complexity}]
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 ml-2">{q.description || 'No description'}</span>
                    </li>
                  );
                })
              ) : (
                <li className="text-gray-500">No questions</li>
              )}
            </ul>
            <p className="text-sm text-gray-600">
              Start: {formatDateTime(test.startDateTime)}
            </p>
            <p className="text-sm text-gray-600">
              End: {formatDateTime(test.endDateTime)}
            </p>
            {test.testLink && (
              <a
                href={`${window.location.origin}${test.testLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 text-sm"
              >
                Test Link: {window.location.origin}{test.testLink}
              </a>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {isOlderTest ? (
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold px-2"
                onClick={() => {
                  console.log('Navigating to result page with test ID:', testId);
                  navigate(`/result/${testId}`);
                }}
                title="View Result"
              >
                Result
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    const id = getTestId(test);
                    if (id) {
                      handleLaunchTest(id, test.testLink);
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm mb-2"
                >
                  Launch Test
                </button>
                <button
                  onClick={() => {
                    const id = getTestId(test);
                    if (id) {
                      handleDeactivateTest(id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Deactivate
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading test data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        {/* Launch Modal */}
        {showLaunchModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4 text-green-600">Test Launched</h2>
              <p className="mb-4">Test link is now live for users.</p>
              <button
                className="bg-orange-600 text-white px-4 py-2 rounded"
                onClick={() => setShowLaunchModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        <h2 className="text-2xl font-bold mb-4 text-orange-600">Test Management</h2>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded mb-4"
        >
          {showCreateForm ? 'Cancel' : 'Create New Test'}
        </button>

        {showCreateForm && (
          <form onSubmit={handleCreateTest} className="space-y-4 p-4 bg-orange-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Questions</label>
              <div className="mt-2 space-y-2">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-center space-x-4 p-2 bg-white rounded border">
                    <input
                      type="checkbox"
                      id={`question-${q.id}`}
                      checked={formData.questionIds.includes(q.id)}
                      onChange={(e) => {
                        const newQuestionIds = e.target.checked
                          ? [...formData.questionIds, q.id]
                          : formData.questionIds.filter(id => id !== q.id);
                        setFormData({ ...formData, questionIds: newQuestionIds });
                      }}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`question-${q.id}`} className="flex-grow">
                      {q.title}
                    </label>
                    {formData.questionIds.includes(q.id) && (
                      <select
                        value={formData.complexityLevels[q.id] || 'MEDIUM'}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            complexityLevels: {
                              ...formData.complexityLevels,
                              [q.id]: e.target.value
                            }
                          });
                        }}
                        className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      >
                        {complexityLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.startDateTime}
                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.endDateTime}
                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Test
            </button>
          </form>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Tests</h3>
          <div className="space-y-4">
            {Array.isArray(tests) && tests.length > 0 ? (
              tests.map(test => renderTest(test, false))
            ) : (
              <p className="text-gray-500 text-center">No active tests</p>
            )}
          </div>
        </div>
        {/* Older Tests Section */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Older Tests</h3>
          <div className="space-y-4">
            {Array.isArray(olderTests) && olderTests.length > 0 ? (
              olderTests.map(test => renderTest(test, true))
            ) : (
              <p className="text-gray-400 text-center">No older tests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestManagement;