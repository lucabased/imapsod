'use client';

import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Header from '../components/Header';
import AddAccountForm from '../components/AddAccountForm';
import AccountsList from '../components/AccountsList';
import EmailList from '../components/EmailList';
import EmailViewer from '../components/EmailViewer';
import DebugModal from '../components/DebugModal';
import EditAccountModal from '../components/EditAccountModal';
import BulkAddModal from '../components/BulkAddModal';
import ImapConfigModal from '../components/ImapConfigModal';
import TagModal from '../components/TagModal';
import NotesModal from '../components/NotesModal';

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
  const [quickAdd, setQuickAdd] = useState('');
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [checkAllLog, setCheckAllLog] = useState([]);
  const [checkAllProgress, setCheckAllProgress] = useState(0);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddAccounts, setBulkAddAccounts] = useState('');
  const [bulkAddLog, setBulkAddLog] = useState([]);
  const [bulkAddProgress, setBulkAddProgress] = useState(0);
  const [showImapConfigs, setShowImapConfigs] = useState(false);
  const [imapConfigs, setImapConfigs] = useState([]);
  const [tags, setTags] = useState([]);
  const [showTags, setShowTags] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
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

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        setTags(Array.isArray(data) ? data : []);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error('Failed to fetch tags', error);
      setTags([]);
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
    fetchTags();

    const ws = new WebSocket(`ws://${window.location.host}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'account-status') {
        setAccounts(prevAccounts =>
          prevAccounts.map(account =>
            account._id === message.payload.id
              ? { ...account, status: message.payload.status }
              : account
          )
        );
      }
    };

    return () => {
      ws.close();
    };
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

  const checkAllAccounts = async () => {
    setIsCheckingAll(true);
    setCheckAllLog([]);
    setCheckAllProgress(0);
    try {
      await fetch('/api/accounts/check-all', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to check all accounts', error);
    } finally {
      // Maybe set a timeout to give websockets time to report.
      setTimeout(() => {
        setIsCheckingAll(false);
        fetchAccounts(); // final sync
      }, 2000);
    }
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
        tags: editingAccount.tags.map(t => t._id),
      }),
    });

    if (res.ok) {
      setEditingAccount(null);
      fetchAccounts();
    } else {
      alert('Failed to update account');
    }
  };

  const handleBulkAddSubmit = async (e) => {
    e.preventDefault();
    const accountsToAdd = bulkAddAccounts.split('\n').filter(line => line.trim() !== '');
    setBulkAddLog([]);
    setBulkAddProgress(0);
    setShowBulkAdd(false);

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
      <Header 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        setDebugMode={setDebugMode} 
        debugMode={debugMode} 
        setImapConfigs={setImapConfigs} 
        setShowImapConfigs={setShowImapConfigs}
        setTags={setTags}
        setShowTags={setShowTags}
      />
      <main className="flex-grow flex relative overflow-hidden p-2 gap-2">
        <div className="w-1/4 flex flex-col gap-2 glass rounded-t-lg overflow-y-auto">
          <div className="p-1 flex flex-col">
            <div className="p-1 rounded-lg mb-1">
              <button onClick={() => setShowAddAccount(!showAddAccount)} className="w-full text-left flex justify-between items-center p-1 rounded glass hover:bg-gray-300/20 dark:hover:bg-gray-600/20">
                <h2 className="text-base font-bold">Add Account</h2>
                {showAddAccount ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
              </button>
              {showAddAccount && (
                <div className="pl-2 mt-1">
                  <AddAccountForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    imapConfig={imapConfig}
                    setImapConfig={setImapConfig}
                    manualConfig={manualConfig}
                    setManualConfig={setManualConfig}
                    findImapServer={findImapServer}
                    isFindingImapServer={isFindingImapServer}
                    imapError={imapError}
                    checkAccount={checkAccount}
                    handleSubmit={handleSubmit}
                    quickAdd={quickAdd}
                    setQuickAdd={setQuickAdd}
                    handleQuickAdd={handleQuickAdd}
                    setShowBulkAdd={setShowBulkAdd}
                  />
                </div>
              )}
            </div>
            <AccountsList
              accounts={accounts}
              selectedAccount={selectedAccount}
              setSelectedAccount={setSelectedAccount}
              accountsLoading={accountsLoading}
              checkAllAccounts={checkAllAccounts}
              isCheckingAll={isCheckingAll}
              checkAllProgress={checkAllProgress}
              checkAllLog={checkAllLog}
              bulkAddProgress={bulkAddProgress}
              bulkAddLog={bulkAddLog}
              recheckAccount={recheckAccount}
              setEditingAccount={setEditingAccount}
              fetchAccounts={fetchAccounts}
              setShowBulkAdd={setShowBulkAdd}
              tags={tags}
            />
          </div>
        </div>
        <div className="w-1/4 glass rounded-t-lg flex flex-col">
          <EmailList
            emailsLoading={emailsLoading}
            selectedAccount={selectedAccount}
            emails={emails}
            selectedEmail={selectedEmail}
            setSelectedEmail={setSelectedEmail}
            accounts={accounts}
            onRefresh={fetchEmails}
            onShowNotes={() => setShowNotes(true)}
          />
        </div>
        <div className="w-1/2 glass rounded-t-lg flex flex-col flex-grow">
          <EmailViewer selectedEmail={selectedEmail} />
        </div>
        <DebugModal errorDetails={errorDetails} setErrorDetails={setErrorDetails} />
        <EditAccountModal 
          editingAccount={editingAccount}
          setEditingAccount={setEditingAccount}
          handleEditSubmit={handleEditSubmit}
          fetchAccounts={fetchAccounts}
          tags={tags}
          setAccounts={setAccounts}
        />
        <BulkAddModal 
          showBulkAdd={showBulkAdd}
          setShowBulkAdd={setShowBulkAdd}
          bulkAddAccounts={bulkAddAccounts}
          setBulkAddAccounts={setBulkAddAccounts}
          handleBulkAddSubmit={handleBulkAddSubmit}
        />
        <ImapConfigModal 
          showImapConfigs={showImapConfigs}
          setShowImapConfigs={setShowImapConfigs}
          imapConfigs={imapConfigs}
        />
        <TagModal
          showTags={showTags}
          setShowTags={setShowTags}
          tags={tags}
          fetchTags={fetchTags}
        />
        <NotesModal showNotes={showNotes} setShowNotes={setShowNotes} />
      </main>
    </div>
  );
}
