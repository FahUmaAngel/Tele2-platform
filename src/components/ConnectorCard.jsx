import React, { useState } from 'react';

export default function ConnectorCard({ connector, isEnabled, onToggle, onConfigure }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
        <div>
          <h3 className="font-semibold text-gray-900">{connector.name}</h3>
          <p className="text-xs text-gray-500">ID: {connector.id}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onConfigure(connector)}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Configure
        </button>
        <button
          onClick={() => onToggle(connector.id, !isEnabled)}
          className={`px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
            isEnabled 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
}
