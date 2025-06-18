import React, { useState, useEffect } from 'react';

const TestEndedModel = ({ autoSubmitMarks, onLogout }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Test Ended</h2>
        {autoSubmitMarks !== null ? (
          <div className="space-y-4">
            <p className="mb-4">
              Time is up! Your test was auto-submitted.<br/>
              Marks: <b>{autoSubmitMarks}</b>
            </p>
            <p className="text-sm text-gray-600">
              You will be logged out in {countdown} seconds...
            </p>
          </div>
        ) : (
          <p className="mb-4">This test is no longer active. Your session has ended.</p>
        )}
        <button
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
          onClick={onLogout}
        >
          Logout Now
        </button>
      </div>
    </div>
  );
};

export default TestEndedModel;