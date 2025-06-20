'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaMoon, FaSun, FaBug, FaChevronDown, FaChevronUp, FaEdit, FaSync, FaTrash } from 'react-icons/fa';
import { FiCheckCircle, FiXCircle, FiHelpCircle } from 'react-icons/fi';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imapConfig, setImapConfig] = useState(null);
  const [manualConfig, setManualConfig] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [emails, setEmails] = useState({});
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isFindingImapServer, setIsFindingImapServer] = useState(false);
  const [imapError, setImapError] = useState(null);
  const [showAddAccount, setShowAddAccount] = useState(true);
  const [showAccounts, setShowAccounts] = useState(true);
  const [quickAdd, setQuickAdd] = useState('');
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [checkAllLog, setCheckAllLog] = useState([]);
  const [checkAllProgress, setCheckAllProgress] = useState(0);
  const [showWorking, setShowWorking] = useState(true);
  const [showBurned, setShowBurned] = useState(true);
  const [showUnknown, setShowUnknown] = useState(true);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddAccounts, setBulkAddAccounts] = useState('');
  const [bulkAddLog, setBulkAddLog] = useState([]);
  const [bulkAddProgress, setBulkAddProgress] = useState(0);

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setShowAccounts(true);
        }
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Failed to fetch accounts', error);
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  const fetchEmails = async (accountId) => {
    setEmailsLoading(true);
    setErrorDetails(null);
    try {
      const res = await fetch(`/api/emails?accountId=${accountId}`);
      if (res.ok) {
        const data = await res.json();
        setEmails((prevEmails) => ({ ...prevEmails, [accountId]: data }));
      } else {
        let errorData;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          errorData = await res.json();
        } else {
          errorData = { message: await res.text() };
        }
        if (debugMode) {
          setErrorDetails(errorData);
        }
        console.error('Failed to fetch emails', errorData);
      }
    } catch (error) {
      if (debugMode) {
        setErrorDetails({ message: error.message, stack: error.stack });
      }
      console.error('Failed to fetch emails', error);
    } finally {
      setEmailsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchEmails(selectedAccount);
      setSelectedEmail(null); // Reset selected email when account changes
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const findImapServer = async () => {
    setIsFindingImapServer(true);
    setImapError(null);
    const res = await fetch('/api/imap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      const data = await res.json();
      setImapConfig(data);
      setManualConfig(false);
    } else {
      const errorData = await res.json();
      setImapError(errorData.error);
      setManualConfig(true);
      setImapConfig({
        imap_server: '',
        imap_port: 993,
        imap_tls: true,
      });
    }
    setIsFindingImapServer(false);
  };

  const checkAccount = async () => {
    const res = await fetch('/api/accounts/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, imapConfig }),
    });
    if (res.ok) {
        alert('Connection successful!');
    } else {
        const data = await res.json();
        alert(data.error);
    }
  };

  const recheckAccount = async (accountId) => {
    const res = await fetch('/api/accounts/recheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId }),
    });
    if (res.ok) {
      await fetchAccounts();
    }
  };

  const checkAllAccounts = () => {
    const ws = new WebSocket(`ws://${window.location.host}`);
    setIsCheckingAll(true);
    setCheckAllLog([]);
    setCheckAllProgress(0);

    ws.onopen = () => {
      ws.send('check-all');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'log') {
        setCheckAllLog(prev => [...prev, message.data]);
        setCheckAllProgress(message.data.progress);
      } else if (message.type === 'done') {
        fetchAccounts();
        setIsCheckingAll(false);
        ws.close();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsCheckingAll(false);
    };
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    const [email, password] = quickAdd.split(':');
    if (!email || !password) {
      alert('Invalid format. Please use email:password');
      return;
    }
    setEmail(email);
    setPassword(password);
    // The rest of the logic will be triggered by the state updates
    // and the existing handleSubmit function can be called after setting the state.
    // However, since the state updates are async, we need to pass the values directly.
    
    const findImapRes = await fetch('/api/imap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    let imapConfigData;
    if (findImapRes.ok) {
      imapConfigData = await findImapRes.json();
    } else {
      // Fallback to manual config if findImapServer fails
      imapConfigData = {
        imap_server: '',
        imap_port: 993,
        imap_tls: true,
      };
    }

    const addAccountRes = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, imapConfig: imapConfigData }),
    });

    if (addAccountRes.ok) {
      setQuickAdd('');
      setEmail('');
      setPassword('');
      setImapConfig(null);
      setManualConfig(false);
      fetchAccounts();
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAccount) return;

    const res = await fetch(`/api/accounts/${editingAccount._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: editingAccount.email,
        password: editingAccount.password,
        imapConfig: editingAccount.imapConfig,
      }),
    });

    if (res.ok) {
      setEditingAccount(null);
      fetchAccounts();
    } else {
      // Handle error
      alert('Failed to update account');
    }
  };

  const handleBulkAddSubmit = async (e) => {
    e.preventDefault();
    const accountsToAdd = bulkAddAccounts.split('\n').filter(line => line.trim() !== '');
    setBulkAddLog([]);
    setBulkAddProgress(0);
    setShowBulkAdd(false); // Close the modal and show progress in the main view

    let addedCount = 0;
    for (const accountStr of accountsToAdd) {
      const [email, password] = accountStr.split(':');
      if (!email || !password) {
        setBulkAddLog(prev => [...prev, { email: accountStr, status: 'invalid format' }]);
        continue;
      }

      const findImapRes = await fetch('/api/imap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      let imapConfigData;
      if (findImapRes.ok) {
        imapConfigData = await findImapRes.json();
      } else {
        imapConfigData = { imap_server: '', imap_port: 993, imap_tls: true };
      }

      const addAccountRes = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, imapConfig: imapConfigData }),
      });

      if (addAccountRes.ok) {
        setBulkAddLog(prev => [...prev, { email, status: 'added' }]);
      } else {
        setBulkAddLog(prev => [...prev, { email, status: 'failed' }]);
      }
      addedCount++;
      setBulkAddProgress((addedCount / accountsToAdd.length) * 100);
    }
    fetchAccounts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, imapConfig }),
    });
    if (res.ok) {
      setEmail('');
      setPassword('');
      setImapConfig(null);
      setManualConfig(false);
      fetchAccounts();
    }
  };

  return (
    <div className={`min-h-screen max-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm p-2 border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Imapsod</h1>
          <div className="flex items-center space-x-2">
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`p-2 rounded-full ${
                  debugMode ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <FaBug />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
          </div>
        </div>
      </header>
      <main className="flex-grow flex relative overflow-hidden">
        <div className="w-1/5 min-w-96 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 p-2 flex flex-col">
          <div className="mb-4">
            <button onClick={() => setShowAddAccount(!showAddAccount)} className="w-full text-left flex justify-between items-center">
              <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Add Account</h2>
              {showAddAccount ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {showAddAccount && <div>
              <form onSubmit={handleQuickAdd} className="space-y-2 mt-2">
                <input
                  type="text"
                  placeholder="email:password"
                  value={quickAdd}
                  onChange={(e) => setQuickAdd(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  type="submit"
                  className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaPlus className="mr-2" /> Quick Add
                </button>
              </form>
              <button
                onClick={() => setShowBulkAdd(true)}
                className="w-full p-2 mt-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Bulk Add
              </button>
              <form onSubmit={handleSubmit} className="space-y-2 mt-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                required
              />
              <button
                type="button"
                onClick={findImapServer}
                className="w-full p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={isFindingImapServer}
              >
                {isFindingImapServer ? 'Searching...' : 'Find IMAP Server'}
              </button>
              {imapError && <p className="text-red-500 text-sm mt-1">{imapError}</p>}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                required
              />
              {(imapConfig || manualConfig) && (
                <div className="space-y-2 border-t pt-2 mt-2">
                  <h3 className="text-md font-bold text-gray-900 dark:text-white">IMAP Settings</h3>
                  <input
                    type="text"
                    placeholder="IMAP Server"
                    value={imapConfig.imap_server}
                    onChange={(e) => setImapConfig({ ...imapConfig, imap_server: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <input
                    type="number"
                    placeholder="IMAP Port"
                    value={imapConfig.imap_port}
                    onChange={(e) => setImapConfig({ ...imapConfig, imap_port: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={imapConfig.imap_tls}
                      onChange={(e) => setImapConfig({ ...imapConfig, imap_tls: e.target.checked })}
                      className="rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white">Use TLS</span>
                  </label>
                  <button
                    type="button"
                    onClick={checkAccount}
                    className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Check Account
                  </button>
                </div>
              )}
              <button
                type="submit"
                className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </form>
            </div>}
          </div>
          <div className="flex-grow overflow-y-auto">
            <button onClick={() => setShowAccounts(!showAccounts)} className="w-full text-left flex justify-between items-center">
              <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Accounts</h2>
              {showAccounts ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <button
              onClick={checkAllAccounts}
              className="w-full p-2 mt-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
              disabled={isCheckingAll}
            >
              {isCheckingAll ? 'Checking...' : 'Check All Accounts'}
            </button>
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
            {showAccounts && (accountsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded p-4 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => setShowWorking(!showWorking)} className="w-full text-left flex justify-between items-center mt-4">
                  <h3 className="text-md font-bold text-green-600 dark:text-green-400">Working Accounts</h3>
                  <svg className={`w-5 h-5 transform transition-transform ${showWorking ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {showWorking && <ul className="space-y-1">
                  {accounts.filter(a => a.status === 'working').map((account) => (
                    <li
                      key={account._id}
                      className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${
                        selectedAccount === account._id
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="truncate" onClick={() => setSelectedAccount(account._id)}>{account.email}</span>
                      <div>
                        <button onClick={() => setEditingAccount(account)} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                          <FaEdit />
                        </button>
                        <button onClick={() => recheckAccount(account._id)} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                          <FaSync />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>}
                <button onClick={() => setShowBurned(!showBurned)} className="w-full text-left flex justify-between items-center mt-4">
                  <h3 className="text-md font-bold text-red-600 dark:text-red-400">Burned Accounts</h3>
                  <svg className={`w-5 h-5 transform transition-transform ${showBurned ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {showBurned && <ul className="space-y-1">
                  {accounts.filter(a => a.status === 'burned').map((account) => (
                    <li
                      key={account._id}
                      onClick={() => recheckAccount(account._id)}
                      className="flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <span className="truncate text-gray-500">{account.email}</span>
                      <button onClick={() => setEditingAccount(account)} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                      </button>
                    </li>
                  ))}
                </ul>}
                <button onClick={() => setShowUnknown(!showUnknown)} className="w-full text-left flex justify-between items-center mt-4">
                  <h3 className="text-md font-bold text-gray-600 dark:text-gray-400">Unknown Accounts</h3>
                  <svg className={`w-5 h-5 transform transition-transform ${showUnknown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {showUnknown && <ul className="space-y-1">
                  {accounts.filter(a => a.status === 'unknown').map((account) => (
                    <li
                      key={account._id}
                      className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${
                        selectedAccount === account._id
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="truncate" onClick={() => setSelectedAccount(account._id)}>{account.email}</span>
                      <div>
                        <button onClick={() => setEditingAccount(account)} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => recheckAccount(account._id)} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.14-5.14M20 15a9 9 0 01-14.14 5.14" /></svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>}
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/3 bg-white dark:bg-gray-900 border-r dark:border-gray-700 overflow-y-auto">
          {emailsLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded p-4 animate-pulse"></div>
              ))}
            </div>
          ) : selectedAccount && emails[selectedAccount] ? (
            <ul>
              {emails[selectedAccount].map((email) => (
                <li
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-2 border-b dark:border-gray-700 cursor-pointer ${
                    selectedEmail?.id === email.id
                      ? 'bg-blue-50 dark:bg-blue-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <p className="font-bold truncate text-gray-900 dark:text-white">{email.from}</p>
                  <p className="font-semibold truncate text-gray-800 dark:text-gray-300">{email.subject}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
        <div className="w-full bg-white dark:bg-gray-900 p-4 flex flex-col">
          {selectedEmail ? (
            <div className="flex flex-col h-full">
              <div className="pb-2 border-b dark:border-gray-700 mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedEmail.subject}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">From: {selectedEmail.from}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(selectedEmail.date).toLocaleString()}
                </p>
              </div>
              {selectedEmail.loginLink && (
                <div className="my-2">
                  <a
                    href={selectedEmail.loginLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors text-sm"
                  >
                    Login Link
                  </a>
                </div>
              )}
              <div className="flex-grow">
                <iframe
                  sandbox="allow-same-origin"
                  srcDoc={selectedEmail.html}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select an email to read.</p>
            </div>
          )}
        </div>
        {errorDetails && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-red-600">Connection Error</h3>
                <button onClick={() => setErrorDetails(null)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  &times;
                </button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
        {editingAccount && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Edit Account</h2>
              <form onSubmit={handleEditSubmit}>
                <input
                  type="email"
                  value={editingAccount.email}
                  onChange={(e) => setEditingAccount({ ...editingAccount, email: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  value={editingAccount.password}
                  onChange={(e) => setEditingAccount({ ...editingAccount, password: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />
                <h3 className="text-md font-bold text-gray-900 dark:text-white">IMAP Settings</h3>
                <input
                  type="text"
                  placeholder="IMAP Server"
                  value={editingAccount.imapConfig?.imap_server || ''}
                  onChange={(e) => setEditingAccount({ ...editingAccount, imapConfig: { ...editingAccount.imapConfig, imap_server: e.target.value }})}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="number"
                  placeholder="IMAP Port"
                  value={editingAccount.imapConfig?.imap_port || ''}
                  onChange={(e) => setEditingAccount({ ...editingAccount, imapConfig: { ...editingAccount.imapConfig, imap_port: e.target.value }})}
                  className="w-full p-2 border rounded mb-2"
                />
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={editingAccount.imapConfig?.imap_tls || false}
                    onChange={(e) => setEditingAccount({ ...editingAccount, imapConfig: { ...editingAccount.imapConfig, imap_tls: e.target.checked }})}
                    className="rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">Use TLS</span>
                </label>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setEditingAccount(null)} className="p-2 rounded bg-gray-200">Cancel</button>
                  <button type="button" onClick={async () => {
                    const res = await fetch('/api/accounts/check', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: editingAccount.email,
                        password: editingAccount.password,
                        imapConfig: editingAccount.imapConfig,
                      }),
                    });
                    if (res.ok) {
                      alert('Connection successful!');
                    } else {
                      const data = await res.json();
                      alert(data.error);
                    }
                  }} className="p-2 rounded bg-green-600 text-white">Check</button>
                  <button type="submit" className="p-2 rounded bg-blue-600 text-white">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showBulkAdd && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Bulk Add Accounts</h2>
              <form onSubmit={handleBulkAddSubmit}>
                <textarea
                  value={bulkAddAccounts}
                  onChange={(e) => setBulkAddAccounts(e.target.value)}
                  className="w-full h-40 p-2 border rounded mb-4"
                  placeholder="email:password (one per line)"
                />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowBulkAdd(false)} className="p-2 rounded bg-gray-200">Cancel</button>
                  <button type="submit" className="p-2 rounded bg-blue-600 text-white">Add Accounts</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
