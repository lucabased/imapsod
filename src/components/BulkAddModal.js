'use client';

import Button from './Button';

export default function BulkAddModal({ showBulkAdd, setShowBulkAdd, bulkAddAccounts, setBulkAddAccounts, handleBulkAddSubmit }) {
  if (!showBulkAdd) return null;

  return (
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
            <Button type="button" onClick={() => setShowBulkAdd(false)} className="bg-gray-200 text-black">Cancel</Button>
            <Button type="submit" className="bg-blue-600 text-white">Add Accounts</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
