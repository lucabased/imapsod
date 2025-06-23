'use client';

import { FaMoon, FaSun, FaBug, FaInfoCircle, FaTags } from 'react-icons/fa';
import Button from './Button';

export default function Header({ darkMode, setDarkMode, setDebugMode, debugMode, setImapConfigs, setShowImapConfigs, setTags, setShowTags }) {
  return (
    <header className="glass rounded-lg p-1 m-2">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">Imapsod</h1>
        <div className="flex items-center space-x-1">
          <Button
            onClick={() => setShowTags(true)}
            className="p-1.5 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white dark:text-white transform hover:scale-110 transition-transform duration-300"
          >
            <FaTags className="w-3 h-3" />
          </Button>
          <Button
            onClick={async () => {
              const res = await fetch('/api/imap-configs');
              if (res.ok) {
                const data = await res.json();
                setImapConfigs(data);
                setShowImapConfigs(true);
              }
            }}
            className="p-1.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white dark:text-white transform hover:scale-110 transition-transform duration-300"
          >
            <FaInfoCircle className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => setDebugMode(!debugMode)}
            className={`p-1.5 rounded-full transform hover:scale-110 transition-transform duration-300 ${
              debugMode ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <FaBug className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white dark:text-white transform hover:scale-110 transition-transform duration-300"
          >
            {darkMode ? <FaSun className="w-3 h-3" /> : <FaMoon className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
