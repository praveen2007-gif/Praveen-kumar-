import React, { useState, useCallback } from 'react';
import { AnalysisResult } from './types';
import { analyzeVoice } from './services/geminiService';
import VoiceRecorder from './components/VoiceRecorder';
import AnalysisDisplay from './components/AnalysisDisplay';
import Header from './components/Header';
import LoginPage from './components/LoginPage';

type AppState = 'idle' | 'recording' | 'analyzing' | 'results' | 'error';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("FileReader result is not a string"));
      }
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleRecordingComplete = useCallback(async (audioBlob: Blob | null) => {
    if (!audioBlob) {
      setError("Recording failed. Please check microphone permissions and try again.");
      setAppState('error');
      return;
    }
    
    setAppState('analyzing');
    setError(null);

    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const result = await analyzeVoice(audioBase64, audioBlob.type);
      setAnalysisResult(result);
      setAppState('results');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
      setAppState('error');
    }
  }, []);

  const resetApp = () => {
    setAppState('idle');
    setAnalysisResult(null);
    setError(null);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    resetApp();
  };


  const renderContent = () => {
    switch (appState) {
      case 'recording':
      case 'idle':
        return <VoiceRecorder onStateChange={setAppState} onRecordingComplete={handleRecordingComplete} />;
      case 'analyzing':
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500 mb-6"></div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Analyzing Your Voice...</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Our AI is listening for vocal biomarkers. This may take a moment.</p>
            </div>
        );
      case 'results':
        return analysisResult && <AnalysisDisplay result={analysisResult} onReset={resetApp} />;
      case 'error':
        return (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">An Error Occurred</h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={resetApp}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
       <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 flex flex-col items-center justify-center p-4">
         <LoginPage onLogin={handleLogin} />
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header onLogout={handleLogout}/>
        <main className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-100 dark:border-gray-700">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;