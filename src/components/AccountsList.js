'use client';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaEdit, FaSync } from 'react-icons/fa';
import Button from './Button';

export default function AccountsList({
  accounts,
  selectedAccount,
  setSelectedAccount,
  accountsLoading,
  checkAllAccounts,
  isCheckingAll,
  checkAllProgress,
  checkAllLog,
  bulkAddProgress,
  bulkAddLog,
  recheckAccount,
  setEditingAccount,
  setShowBulkAdd,
  tags,
}) {
  const [showAccounts, setShowAccounts] = useState(true);
  const [showWorking, setShowWorking] = useState(true);
  const [showBurned, setShowBurned] = useState(true);
  const [showUnknown, setShowUnknown] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [openProviders, setOpenProviders] = useState({});

  const filteredAccounts = selectedTag
    ? accounts.filter(account => account.tags.some(t => t._id === selectedTag))
    : accounts;

  const groupAccounts = (accounts) => {
    const grouped = {
      working: {},
      burned: {},
      unknown: {},
    };

    accounts.forEach(account => {
      const provider = account.email.split('@')[1] || 'unknown';
      const status = account.status;
      if (!grouped[status]) grouped[status] = {};
      if (!grouped[status][provider]) {
        grouped[status][provider] = [];
      }
      grouped[status][provider].push(account);
    });

    return grouped;
  };

  const groupedAccounts = groupAccounts(filteredAccounts);

  const toggleProvider = (status, provider) => {
    const key = `${status}-${provider}`;
    setOpenProviders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderAccountList = (status, accounts) => {
    const providers = Object.keys(groupedAccounts[status]).sort();

    return providers.map(provider => (
      <div key={provider} className="pl-2 mt-0.5">
        <Button onClick={() => toggleProvider(status, provider)} className="w-full text-left flex justify-between items-center p-1 rounded glass hover:bg-gray-300/20 dark:hover:bg-gray-600/20">
          <h4 className="text-xs font-bold text-white">{provider} ({groupedAccounts[status][provider].length})</h4>
          {openProviders[`${status}-${provider}`] ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
        </Button>
        {openProviders[`${status}-${provider}`] && (
          <ul className="pl-2 mt-0.5 space-y-0.5">
            {groupedAccounts[status][provider].map(account => (
              <li
                key={account._id}
                className={`p-1 rounded cursor-pointer transition-colors glass ${
                  selectedAccount === account._id
                    ? 'bg-blue-100/30 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    : 'hover:bg-gray-200/20 dark:hover:bg-gray-700/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="truncate text-sm" onClick={() => setSelectedAccount(account._id)}>{account.email}</span>
                    {account.notes && <span className="text-xs text-gray-400">{account.notes}</span>}
                  </div>
                  <div className="flex space-x-1">
                    <Button onClick={() => setEditingAccount(account)} className="p-0.5 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white dark:text-white transform hover:scale-110 transition-transform duration-300">
                      <FaEdit className="w-3 h-3" />
                    </Button>
                    <Button onClick={() => recheckAccount(account._id)} className="p-0.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white dark:text-white transform hover:scale-110 transition-transform duration-300">
                      <FaSync className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-1 glass rounded-lg flex flex-col flex-grow">
        <Button onClick={() => setShowAccounts(!showAccounts)} className="w-full text-left flex justify-between items-center p-1 rounded glass hover:bg-gray-300/20 dark:hover:bg-gray-600/20">
          <h2 className="text-base font-bold text-white">Accounts</h2>
          {showAccounts ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
        </Button>
        
        {showAccounts && (
          <div className="pl-2 flex flex-col flex-grow min-h-0">
            <Button
              onClick={checkAllAccounts}
              className="w-full mt-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white dark:text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed text-sm py-1"
              disabled={isCheckingAll}
            >
              {isCheckingAll ? 'Checking All Accounts...' : 'Check All Accounts'}
            </Button>
            {(bulkAddProgress > 0 && bulkAddProgress < 100) && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${bulkAddProgress}%` }}></div>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {bulkAddLog.map((log, index) => (
                    <div key={index}>
                      <span>{log.email}</span> - <span className={log.status === 'added' ? 'text-green-500' : 'text-red-500'}>{log.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isCheckingAll && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${checkAllProgress}%` }}></div>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {checkAllLog.map((log, index) => (
                    <div key={index}>
                      <span>{log.email}</span> - <span className={log.status === 'working' ? 'text-green-500' : 'text-red-500'}>{log.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-1 my-1">
              <Button onClick={() => setSelectedTag(null)} className={`px-1.5 py-0.5 rounded-full text-xs ${!selectedTag ? 'bg-blue-600 text-white' : 'bg-gray-200 text-white'}`}>All</Button>
              {tags.map(tag => (
                <Button key={tag._id} onClick={() => setSelectedTag(tag._id)} className={`px-1.5 py-0.5 rounded-full text-xs`} style={{ backgroundColor: selectedTag === tag._id ? tag.color : '', color: selectedTag === tag._id ? 'white' : 'white' }}>
                  {tag.name}
                </Button>
              ))}
            </div>
            <div className="flex-grow">
              {accountsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded p-4 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="mt-1 p-1 glass rounded-lg">
                    <Button onClick={() => setShowWorking(!showWorking)} className="w-full text-left flex justify-between items-center p-1 rounded hover:bg-gray-200/20 dark:hover:bg-gray-600/20">
                      <h3 className="text-sm font-bold">Working Accounts ({filteredAccounts.filter(a => a.status === 'working').length})</h3>
                      {showWorking ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                    </Button>
                    {showWorking && renderAccountList('working', groupedAccounts.working)}
                  </div>
                  <div className="mt-1 p-1 glass rounded-lg">
                    <Button onClick={() => setShowBurned(!showBurned)} className="w-full text-left flex justify-between items-center p-1 rounded hover:bg-gray-200/20 dark:hover:bg-gray-600/20">
                      <h3 className="text-sm font-bold">Burned Accounts ({filteredAccounts.filter(a => a.status === 'burned').length})</h3>
                      {showBurned ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                    </Button>
                    {showBurned && renderAccountList('burned', groupedAccounts.burned)}
                  </div>
                  <div className="mt-1 p-1 glass rounded-lg">
                    <Button onClick={() => setShowUnknown(!showUnknown)} className="w-full text-left flex justify-between items-center p-1 rounded hover:bg-gray-200/20 dark:hover:bg-gray-600/20">
                      <h3 className="text-sm font-bold">Unknown Accounts ({filteredAccounts.filter(a => a.status === 'unknown').length})</h3>
                      {showUnknown ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                    </Button>
                    {showUnknown && renderAccountList('unknown', groupedAccounts.unknown)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
