'use client';

export default function NotesModal({ showNotes, setShowNotes }) {
  if (!showNotes) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-1/2 h-1/2 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Notes</h2>
        <textarea className="flex-grow w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"></textarea>
        <div className="flex justify-end mt-4">
          <button onClick={() => setShowNotes(false)} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
