import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';

function UserDashboard() {
  const { user } = useAuth();
  const token = user?.token;
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTests() {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const res = await axios.get('http://localhost:8080/api/tests/active-for-user', config);
        setTests(res.data);
      } catch (err) {
        setError('Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchTests();
  }, [token]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-orange-600">Available Tests</h2>
      {tests.length === 0 ? (
        <div className="text-gray-500 text-center">No active tests at this time.</div>
      ) : (
        <div className="space-y-6">
          {tests.map(test => (
            <div key={test.id} className="border rounded-lg p-4 bg-orange-50 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-orange-700">Test</h3>
                </div>
                <button
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  onClick={() => window.open(test.testLink, '_blank')}
                >
                  Start Test
                </button>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Questions:</h4>
                <ul className="list-disc ml-6">
                  {test.questions && test.questions.map(q => (
                    <li key={q.id} className="mb-1">
                      <span className="font-medium">{q.title}</span>
                      <div className="text-sm text-gray-600">{q.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Start: {new Date(test.startDateTime).toLocaleString()} | End: {new Date(test.endDateTime).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDashboard; 