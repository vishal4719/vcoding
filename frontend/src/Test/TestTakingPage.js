import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';

// Import components
import StartTestModel from '../Test/Component/StartTestModel';
import WarningModel from '../Test/Component/WarningModel';
import TestEndedModal from '../Test/Component/TestEndedModel';
import QuestionPanel from '../Test/Component/QuestionPanel';
import CodeEditorialPanel from '../Test/Component/CodeEditorialPanel';

// Import services and utilities
import { ApiService } from './ApiService';
import { useFullscreenHandler, enterFullscreen } from './Hooks/useFullscreenHandler';
import { DEFAULT_CODE, SUPPORTED_LANGUAGES, getMonacoLangKey, formatTime } from './Component/Constants';

function TestTakingPage() {
  const { testId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = user?.token;
  const apiService = new ApiService(token);
  
  // State variables
  const [test, setTest] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState(DEFAULT_CODE[getMonacoLangKey(SUPPORTED_LANGUAGES[0].id)]);
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0].id.toString());
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testcaseResults, setTestcaseResults] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showTestEndedModal, setShowTestEndedModal] = useState(false);
  const [autoSubmitMarks, setAutoSubmitMarks] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarningModel, setShowWarningModel] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [input, setInput] = useState('');
  
  const autoSubmitRef = useRef(false);

  // Fetch test details
  useEffect(() => {
    async function fetchTest() {
      try {
        const testData = await apiService.fetchTest(testId);
        setTest(testData);
        if (testData.questions && testData.questions.length > 0) {
          setSelectedQuestion(testData.questions[0]);
        }
      } catch (err) {
        setError('Failed to fetch test details');
      }
    }
    if (testId && token) fetchTest();
  }, [testId, token]);

  // Set default code when language changes
  useEffect(() => {
    if (!selectedLanguage) return;
    setCode(DEFAULT_CODE[getMonacoLangKey(selectedLanguage)] || '');
  }, [selectedLanguage]);

  // Timer effect
  useEffect(() => {
    if (!test || !test.endDateTime) return;
    const end = new Date(test.endDateTime).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const diff = end - now;
      setRemainingTime(diff > 0 ? diff : 0);
      if (diff <= 0 && !autoSubmitRef.current) {
        autoSubmitRef.current = true;
        setIsLocked(true);
        handleAutoSubmitTest();
        // Auto logout after 5 seconds
        setTimeout(() => {
          handleLogout();
        }, 5000);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [test]);

  // Violation handler for fullscreen monitoring
  const handleViolation = () => {
    setViolationCount(prev => {
      const next = prev + 1;
      if (next < 3) {
        setShowWarningModel(true);
        // Try to re-enter fullscreen after 1 second
        setTimeout(() => {
          enterFullscreen();
        }, 1000);
      } else {
        // Auto-submit and logout
        setIsLocked(true);
        handleAutoSubmitTest();
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      }
      return next;
    });
  };
  

  // Use fullscreen handler hook
  useFullscreenHandler(testStarted, handleViolation, showTestEndedModal);

  // Event handlers
  const handleStartTest = () => {
    enterFullscreen();
    setTestStarted(true);
  };

  const handleCloseWarning = () => setShowWarningModel(false);

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
  };

  const handleLanguageChange = (languageId) => {
    setSelectedLanguage(languageId);
  };

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleCompile = async () => {
    setLoading(true);
    setOutput('');
    setError('');
    try {
      const result = await apiService.compileAndRun(code, selectedLanguage);
      setOutput(result.output || result.stdout || '');
    } catch (err) {
      setError('Failed to compile code: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAllTestCases = async () => {
    setLoading(true);
    setError('');
    setTestcaseResults(null);
    try {
      const result = await apiService.submitAllTestCases(selectedQuestion.id, code, selectedLanguage);
      const visibleResults = Array.isArray(result) ? result.slice(0, 2) : [];
      setTestcaseResults(visibleResults);
    } catch (err) {
      setError('Failed to check test cases: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmitTest = async () => {
    setLoading(true);
    setError('');
    setTestcaseResults(null);
    try {
      const result = await apiService.submitTest(selectedQuestion.id, code, selectedLanguage, test?.id);
      setAutoSubmitMarks(result.marks);
      setShowTestEndedModal(true);
    } catch (err) {
      setError('Failed to auto-submit test: ' + (err.response?.data?.error || err.message));
      setShowTestEndedModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTest = async () => {
    setLoading(true);
    setError('');
    setTestcaseResults(null);
    try {
      const result = await apiService.submitTest(selectedQuestion.id, code, selectedLanguage, test?.id);
      alert(`Test submitted! Marks: ${result.marks}`);
    } catch (err) {
      setError('Failed to submit test: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }
  if (!test || !selectedQuestion) {
    return <div className="text-center text-gray-500 py-8">Loading test...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Start Test Modal */}
      {!testStarted && (
        <StartTestModel onStartTest={handleStartTest} />
      )}
      
      {/* Warning Modal for screen/tab switch */}
      {showWarningModel && (
        <WarningModel 
          violationCount={violationCount} 
          onClose={handleCloseWarning} 
        />
      )}
      
      {/* Test Content (only show if testStarted) */}
      {testStarted && (
        <div className="flex flex-1 max-w-7xl mx-auto w-full mt-8 bg-white rounded shadow-lg overflow-hidden">
          <div className="flex justify-end items-center gap-6 p-4 bg-white shadow">
            <div className="text-xl font-bold text-red-600">
              Time Remaining: {formatTime(remainingTime)}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
          <QuestionPanel
            test={test}
            selectedQuestion={selectedQuestion}
            onQuestionSelect={handleQuestionSelect}
            remainingTime={remainingTime}
            formatTime={formatTime}
          />
          
          <CodeEditorialPanel
            supportedLanguages={SUPPORTED_LANGUAGES}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            code={code}
            onCodeChange={handleCodeChange}
            getMonacoLangKey={getMonacoLangKey}
            isLocked={isLocked}
            loading={loading}
            onCompile={handleCompile}
            onSubmitAllTestCases={handleSubmitAllTestCases}
            onSubmitTest={handleSubmitTest}
            output={output}
            error={error}
            testcaseResults={testcaseResults}
            input={input}
            setInput={setInput}
          />
        </div>
      )}
      
      {/* Modal for test ended or time up */}
      {showTestEndedModal && (
        <TestEndedModal 
          autoSubmitMarks={autoSubmitMarks} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}

export default TestTakingPage;