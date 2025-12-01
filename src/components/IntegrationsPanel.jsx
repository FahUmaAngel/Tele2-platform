import React, { useState, useEffect } from 'react';
import IntegrationManager from '../core/IntegrationManager';
import ConnectorCard from './ConnectorCard';
import FieldMapper from './FieldMapper';

// Import connectors to register them
import erpConnector from '../connectors/erpConnector';
import hrConnector from '../connectors/hrConnector';
import workflowConnector from '../connectors/workflowConnector';

// Register connectors (idempotent)
IntegrationManager.register(erpConnector);
IntegrationManager.register(hrConnector);
IntegrationManager.register(workflowConnector);

export default function IntegrationsPanel({ onConfigChange }) {
  const [connectors, setConnectors] = useState(IntegrationManager.getAllConnectors());
  const [enabledState, setEnabledState] = useState(IntegrationManager.enabled);
  const [editingConnector, setEditingConnector] = useState(null);

  const handleToggle = (id, value) => {
    IntegrationManager.setEnabled(id, value);
    setEnabledState({ ...IntegrationManager.enabled });
    if (onConfigChange) onConfigChange();
  };

  const handleConfigure = (connector) => {
    setEditingConnector(connector);
  };

  const handleSaveConfig = () => {
    setEditingConnector(null);
    if (onConfigChange) onConfigChange();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Available Integrations</h2>
      
      {editingConnector ? (
        <FieldMapper 
          connector={editingConnector} 
          onSave={handleSaveConfig}
          onCancel={() => setEditingConnector(null)}
        />
      ) : (
        <div className="grid gap-3">
          {connectors.map(c => (
            <ConnectorCard 
              key={c.id} 
              connector={c} 
              isEnabled={enabledState[c.id]} 
              onToggle={handleToggle}
              onConfigure={handleConfigure}
            />
          ))}
        </div>
      )}
    </div>
  );
}
