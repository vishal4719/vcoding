import React from 'react';

const StartTestModel = ({ onStartTest }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">Ready to Start?</h2>
        <p className="mb-4">
          Click the button below to start the test. The test will go fullscreen and you must not leave fullscreen or switch tabs/windows.
        </p>
        <button
          className="bg-orange-600 text-white px-4 py-2 rounded"
          onClick={onStartTest}
        >
          Start Test
        </button>
      </div>
    </div>
  );
};

export default StartTestModel;