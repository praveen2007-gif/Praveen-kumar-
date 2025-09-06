import React from 'react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="relative text-center">
      <div className="absolute top-0 right-0 flex items-center gap-4">
        <ThemeToggle />
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-indigo-600 dark:text-indigo-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
            <path d="M12 11a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z"></path>
            <path d="M12 5c-1.654 0-3 1.346-3 3v2h6V8c0-1.654-1.346-3-3-3z"></path>
          </svg>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          Vocal Health AI
        </h1>
      </div>
      <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        Your voice can tell a story about your health. Let our AI provide a
        preliminary analysis for potential risks.
      </p>
    </header>
  );
};

export default Header;
