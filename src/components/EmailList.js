'use client';

import { FaSync, FaStickyNote } from 'react-icons/fa';

export default function EmailList({ emailsLoading, selectedAccount, emails, selectedEmail, setSelectedEmail, accounts, onRefresh, onShowNotes }) {
  const account = accounts.find(a => a._id === selectedAccount);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-1 border-b glass rounded-t-lg">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-base font-bold">Inbox</h2>
          <div className="flex items-center gap-1">
            {account && (
              <button onClick={() => onRefresh(account._id)} className="p-1 rounded-full hover:bg-gray-300/20 dark:hover:bg-gray-600/20">
                <FaSync className="w-3 h-3" />
              </button>
            )}
            <button onClick={onShowNotes} className="p-1 rounded-full hover:bg-gray-300/20 dark:hover:bg-gray-600/20">
              <FaStickyNote className="w-3 h-3" />
            </button>
          </div>
        </div>
        {account && (
          <div className="text-xs text-gray-400">
            <p>{account.email}</p>
            <p>Last updated: {new Date(account.lastChecked).toLocaleString()}</p>
          </div>
        )}
      </div>
      {emailsLoading ? (
        <div className="space-y-1 p-1">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded p-3 animate-pulse"></div>
          ))}
        </div>
      ) : selectedAccount && emails[selectedAccount] ? (
        <ul>
          {emails[selectedAccount]
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((email) => (
            <li
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-1 border-b border-gray-200/20 dark:border-gray-700/20 cursor-pointer ${
                selectedEmail?.id === email.id
                  ? 'bg-blue-500/20'
                  : 'hover:bg-gray-100/20 dark:hover:bg-gray-800/20'
              }`}
            >
              <p className="font-bold truncate text-sm">{email.from}</p>
              <p className="font-semibold truncate text-sm">{email.subject}</p>
              <p className="text-xs">
                {new Date(email.date).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Select an account.</p>
        </div>
      )}
    </div>
  );
}
