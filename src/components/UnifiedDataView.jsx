import React, { useState } from 'react';
import { consolidate } from '../core/consolidate';
import IntegrationManager from '../core/IntegrationManager';

export default function UnifiedDataView({ triggerFetch }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const enabledConnectors = IntegrationManager.getEnabledConnectors();
    
    if (enabledConnectors.length === 0) {
      setData([]);
      setLoading(false);
      return;
    }

    const result = await consolidate(enabledConnectors);
    setData(result);
    setLastUpdated(new Date());
    setLoading(false);
  };

  // Expose fetch method via effect if trigger changes
  React.useEffect(() => {
    if (triggerFetch) {
      fetchData();
    }
  }, [triggerFetch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Unified Data Layer</h2>
        <div className="text-xs text-gray-500">
          {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'No data fetched'}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          Fetching and consolidating data...
        </div>
      ) : data.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          No data available. Enable integrations and click "Fetch & Consolidate".
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Source</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Raw Data Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.source}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.error ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.error ? 'Error' : 'Success'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {item.error ? (
                      <span className="text-red-600">{item.error}</span>
                    ) : (
                      <pre className="whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {JSON.stringify(item.data, null, 2)}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
