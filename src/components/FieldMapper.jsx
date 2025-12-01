import React, { useState } from 'react';

export default function FieldMapper({ connector, onSave, onCancel }) {
  const [config, setConfig] = useState(connector.config);
  const [mappings, setMappings] = useState(config.fieldMapping || {});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddMapping = () => {
    if (newKey && newValue) {
      setMappings(prev => ({ ...prev, [newKey]: newValue }));
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemoveMapping = (key) => {
    const next = { ...mappings };
    delete next[key];
    setMappings(next);
  };

  const handleSave = () => {
    const updatedConfig = { ...config, fieldMapping: mappings };
    // In a real app we would update the connector config via a manager or context
    // Here we just pass it back
    connector.config = updatedConfig; 
    onSave();
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
      <h3 className="font-semibold text-gray-900">Configure {connector.name}</h3>
      
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">API URL (Fake)</label>
        <input 
          type="text" 
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          value={config.apiUrl}
          onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
          placeholder="https://api.example.com/v1"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">API Key (Fake)</label>
        <input 
          type="password" 
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          value={config.apiKey}
          onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
          placeholder="••••••••"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Field Mapping</label>
        <div className="flex gap-2">
          <input 
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
            placeholder="External Field"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <span className="self-center text-gray-400">→</span>
          <input 
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
            placeholder="Internal Field"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button 
            onClick={handleAddMapping}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <div className="space-y-1 mt-2">
          {Object.entries(mappings).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between bg-white px-3 py-2 border border-gray-200 rounded-md text-sm">
              <span>{k} → {v}</span>
              <button 
                onClick={() => handleRemoveMapping(k)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button 
          onClick={onCancel}
          className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}
