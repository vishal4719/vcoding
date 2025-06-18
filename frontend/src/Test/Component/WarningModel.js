import React from 'react';

const WarningModel = ({ violationCount, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-yellow-600">Warning</h2>
        <p className="mb-4">
          You are not allowed to leave fullscreen or switch tabs/windows during the test.<br/>
          If you do this {3 - violationCount} more time(s), your test will be auto-submitted and you will be logged out.
        </p>
        <button
          className="bg-orange-600 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Continue Test
        </button>
      </div>
    </div>
  );
};

export default WarningModel;