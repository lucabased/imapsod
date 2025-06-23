import React from 'react';

const Button = ({ children, onClick, className = '', variant = 'default', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-50';

  const variants = {
    default: 'bg-blue-500 text-black hover:bg-blue-600',
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-black hover:from-blue-600 hover:to-purple-700',
    secondary: 'bg-gray-900 text-black hover:bg-gray-600',
    success: 'bg-green-500 text-black hover:bg-green-600',
    danger: 'bg-red-500 text-black hover:bg-red-600',
    'quick-add': 'bg-gradient-to-r from-green-400 to-blue-500 text-black hover:from-green-500 hover:to-blue-600',
    'bulk-add': 'bg-gradient-to-r from-purple-500 to-pink-500 text-black hover:from-purple-600 hover:to-pink-600',
    find: 'bg-cyan-500 text-black hover:bg-cyan-600',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
