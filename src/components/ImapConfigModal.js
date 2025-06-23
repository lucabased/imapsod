'use client';

import Button from './Button';

export default function ImapConfigModal({ showImapConfigs, setShowImapConfigs, imapConfigs }) {
  if (!showImapConfigs) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">IMAP Configurations</h3>
          <Button onClick={() => setShowImapConfigs(null)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            &times;
          </Button>
        </div>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(imapConfigs, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
