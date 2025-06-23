'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import Button from './Button';

export default function EditAccountModal({ editingAccount, setEditingAccount, handleEditSubmit, fetchAccounts, tags, setAccounts }) {
  const [unassignedTags, setUnassignedTags] = useState([]);

  useEffect(() => {
    if (editingAccount) {
      setUnassignedTags(tags.filter(tag => !editingAccount.tags.some(t => t._id === tag._id)));
    }
  }, [editingAccount, tags]);

  if (!editingAccount) return null;

  const handleAssignTag = async (tagId) => {
    const res = await fetch(`/api/accounts/${editingAccount._id}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagId }),
    });
    if (res.ok) {
      const updatedAccount = await res.json();
      setEditingAccount(updatedAccount);
      setAccounts(prev => prev.map(a => a._id === updatedAccount._id ? updatedAccount : a));
    }
  };

  const handleUnassignTag = async (tagId) => {
    const res = await fetch(`/api/accounts/${editingAccount._id}/tags`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagId }),
    });
    if (res.ok) {
      const updatedAccount = await res.json();
      setEditingAccount(updatedAccount);
      setAccounts(prev => prev.map(a => a._id === updatedAccount._id ? updatedAccount : a));
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4 text-black">Edit Account</h2>
        <form onSubmit={handleEditSubmit}>
          <input
            type="email"
            value={editingAccount.email}
            onChange={(e) => setEditingAccount({ ...editingAccount, email: e.target.value })}
            className="w-full p-2 border rounded mb-2 text-gray-500"
          />
          <input
            type="text"
            value={editingAccount.password}
            onChange={(e) => setEditingAccount({ ...editingAccount, password: e.target.value })}
            className="w-full p-2 border rounded mb-4 text-gray-500"
          />
          <textarea
            placeholder="Notes"
            value={editingAccount.notes || ''}
            onChange={(e) => setEditingAccount({ ...editingAccount, notes: e.target.value })}
            className="w-full p-2 border rounded mb-4 text-gray-500"
          ></textarea>
          <h3 className="text-md font-bold text-gray-900 dark:text-white">IMAP Settings</h3>
          <input
            type="text"
            placeholder="IMAP Server"
            value={editingAccount.imapConfig?.imap_server || ''}
            onChange={(e) => setEditingAccount({ ...editingAccount, imapConfig: { ...editingAccount.imapConfig, imap_server: e.target.value }})}
            className="w-full p-2 border rounded mb-2 text-gray-500"
          />
          <input
            type="number"
            placeholder="IMAP Port"
            value={editingAccount.imapConfig?.imap_port || ''}
            onChange={(e) => setEditingAccount({ ...editingAccount, imapConfig: { ...editingAccount.imapConfig, imap_port: e.target.value }})}
            className="w-full p-2 border rounded mb-2 text-gray-500"
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
          <h3 className="text-md font-bold text-gray-900 dark:text-white">Tags</h3>
          <div className="flex flex-wrap gap-2 my-2">
            {editingAccount.tags.map(tag => (
              <Button
                key={tag._id}
                className="px-2 py-1 rounded-full text-sm flex items-center"
                style={{ backgroundColor: tag.color, color: 'white' }}
                onClick={() => handleUnassignTag(tag._id)}
              >
                <FaTimes className="mr-1" />
                {tag.name}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 my-2">
            {unassignedTags.map(tag => (
              <Button
                key={tag._id}
                className="px-2 py-1 rounded-full text-sm cursor-pointer flex items-center"
                style={{ backgroundColor: tag.color, color: 'white' }}
                onClick={() => handleAssignTag(tag._id)}
              >
                <FaPlus className="mr-1" />
                {tag.name}
              </Button>
            ))}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" onClick={() => setEditingAccount(null)} className="bg-gray-200 text-black">Cancel</Button>
            <Button type="button" onClick={async () => {
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
            }} className="bg-green-600 text-white">Check</Button>
            <Button type="submit" className="bg-blue-600 text-white">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
