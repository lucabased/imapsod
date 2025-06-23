'use client';

export default function EmailViewer({ selectedEmail }) {
  return (
    <div className="h-full p-2 flex flex-col">
      {selectedEmail ? (
        <div className="flex flex-col h-full">
          <div className="pb-1 border-b border-gray-200/20 dark:border-gray-700/20 mb-1">
            <h2 className="text-lg font-bold">{selectedEmail.subject}</h2>
            <p className="text-xs">From: {selectedEmail.from}</p>
            <p className="text-xs">To: {selectedEmail.to}</p>
            <p className="text-xs">
              {new Date(selectedEmail.date).toLocaleString()}
            </p>
          </div>
          {selectedEmail.loginLink && (
            <div className="my-1">
              <a
                href={selectedEmail.loginLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white dark:text-white px-2 py-1 rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 text-xs"
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
  );
}
