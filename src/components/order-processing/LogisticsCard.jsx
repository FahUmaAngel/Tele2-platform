import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Truck, Thermometer, AlertTriangle, Info } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LogisticsCard({ fiberOrder }) {
  const isFrostRisk = false; // Mock logic

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Truck className="w-4 h-4" /> Logistics & Constraints
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fiber Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 border-b pb-1 flex justify-between">
            <span>Fiber Delivery</span>
            <Link to={createPageUrl('FiberOrdering')} className="text-xs text-blue-600 hover:underline">
                View Fiber Page
            </Link>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Est. Delivery</span>
              <span className="font-medium">{fiberOrder?.delivery_est_date || "Pending"}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Conf. Delivery</span>
              <span className={`font-medium ${fiberOrder?.delivery_conf_date ? 'text-green-600' : 'text-orange-500'}`}>
                {fiberOrder?.delivery_conf_date || "Not Confirmed"}
              </span>
            </div>
            <div>
               <span className="text-gray-500 block text-xs">Permit Lead</span>
               <span className="font-medium">{fiberOrder?.permit_lead_time || 0} Days</span>
            </div>
             <div>
               <span className="text-gray-500 block text-xs">Facility ID</span>
               <span className="font-mono text-xs bg-gray-100 px-1 rounded">{fiberOrder?.facility_id}</span>
            </div>
          </div>
        </div>

        {/* Frost Constraint */}
        <div className="space-y-2">
             <h4 className="text-sm font-medium text-gray-900 border-b pb-1">Frost Constraints</h4>
             
             {isFrostRisk ? (
                 <div className="bg-red-50 border border-red-100 p-3 rounded text-sm text-red-800 flex gap-2">
                     <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                     <div>
                         <p className="font-semibold">Frost Risk Detected</p>
                         <p className="text-xs mt-1">Planned installation falls within frost period.</p>
                     </div>
                 </div>
             ) : (
                 <div className="bg-blue-50 border border-blue-100 p-3 rounded text-sm text-blue-800 flex gap-2">
                     <Thermometer className="w-4 h-4 shrink-0 mt-0.5" />
                     <div>
                         <p className="font-semibold">Frost Period: {fiberOrder?.frost_constraint || "None"}</p>
                         <p className="text-xs mt-1">Current schedule is safe.</p>
                     </div>
                 </div>
             )}
             
             {/* AI Panel */}
             <div className="mt-2 p-3 bg-indigo-50 rounded border border-indigo-100 text-xs text-indigo-900">
                 <div className="flex items-center gap-1 font-semibold mb-1">
                     <SparklesIcon className="w-3 h-3" /> AI Recommendation
                 </div>
                 Recommended window: April 15 - Oct 31 to avoid frost delays.
             </div>
        </div>

        {/* Supplier */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 border-b pb-1">Supplier & Hardware</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
              <span className="text-gray-500 block text-xs">Subcontractor</span>
              <span className="font-medium">{fiberOrder?.subcontractor || "TBD"}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">HW Lead Time</span>
              <span className="font-medium">15 Days</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 pt-1">
              Earliest feasible install: <span className="font-bold text-gray-900">2025-11-10</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

function SparklesIcon(props) {
    return (
        <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
    )
}