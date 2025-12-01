import React, { useState } from 'react';
import IntegrationsPanel from '../components/IntegrationsPanel';
import UnifiedDataView from '../components/UnifiedDataView';
import { Button } from "@/components/ui/button";

export default function IntegrationPlayground() {
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const handleFetch = () => {
    setFetchTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">DCP Integration Framework</h1>
          <p className="text-gray-500">
            Simulate enterprise integrations with mock data. Enable connectors below and fetch consolidated data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <IntegrationsPanel onConfigChange={() => {}} />
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                <li>Enable one or more connectors above.</li>
                <li>Click "Configure" to set fake API keys or map fields.</li>
                <li>Click "Fetch & Consolidate" to run the integration engine.</li>
                <li>The system simulates async fetching from each source and normalizes the data.</li>
              </ul>
            </div>
          </div>

          {/* Right Panel: Data View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-end">
              <Button 
                onClick={handleFetch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-all transform active:scale-95"
              >
                Fetch & Consolidate Data
              </Button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
              <UnifiedDataView triggerFetch={fetchTrigger} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
