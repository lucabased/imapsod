'use client';

import { useState } from 'react';
import { FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Button from './Button';

export default function AddAccountForm({ 
  email, setEmail, password, setPassword, imapConfig, setImapConfig, manualConfig, setManualConfig,
  findImapServer, isFindingImapServer, imapError, checkAccount, handleSubmit,
  quickAdd, setQuickAdd, handleQuickAdd, setShowBulkAdd 
}) {
  return (
    <div className="mb-4">
      <div>
        <form onSubmit={handleQuickAdd} className="space-y-2 mt-2">
          <input
            type="text"
            placeholder="email:password"
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
          />
          <Button
            type="submit"
            variant="quick-add"
            className="w-full transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Quick Add
          </Button>
        </form>
      <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <input
        type="email"
        placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600"
          required
        />
        <Button
          type="button"
          onClick={findImapServer}
          variant="find"
          className="w-full transition-colors disabled:opacity-50"
          disabled={isFindingImapServer}
        >
          {isFindingImapServer ? 'Searching...' : 'Find IMAP Server'}
        </Button>
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
            <Button
              type="button"
              onClick={async () => await checkAccount()}
              variant="success"
              className="w-full transition-colors"
            >
              Check Account
            </Button>
          </div>
        )}
        <Button
          type="submit"
          variant="primary"
          className="w-full transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Add Account
        </Button>
      </form>
      <Button
        onClick={() => setShowBulkAdd(true)}
        variant="bulk-add"
        className="w-full mt-4 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
      >
        <FaPlus className="mr-2" /> Bulk Add
      </Button>
      </div>
    </div>
  );
}
