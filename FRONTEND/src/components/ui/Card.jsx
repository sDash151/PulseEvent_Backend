import React from 'react';

const Card = ({ children, className = '', title, action }) => {
  return (
    <div
      className={`bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 ${className}`}
    >
      {(title || action) && (
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-6 text-gray-200">
        {children}
      </div>
    </div>
  );
};

export default Card;
