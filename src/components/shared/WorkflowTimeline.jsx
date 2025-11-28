import React from 'react';
import { CheckCircle2, Circle, Loader2, Ban } from "lucide-react";

export default function WorkflowTimeline({ currentStep }) {
  const steps = [
    { id: 1, label: "Fiber Ordering" },
    { id: 2, label: "NaaS Pre-Design" },
    { id: 3, label: "Site Survey" },
    { id: 4, label: "Design Approval" },
    { id: 5, label: "Order Processing" },
    { id: 6, label: "Installation" },
    { id: 7, label: "RFS" },
  ];

  const getStatus = (stepId) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "in_progress";
    return "pending";
  };

  return (
    <div className="relative py-6 mb-6">
      {/* Connecting Line */}
      <div className="absolute top-[34px] left-0 w-full h-0.5 bg-gray-200 -z-10" />
      
      <div className="flex justify-between overflow-x-auto px-2 pb-2 scrollbar-hide">
        {steps.map((step) => {
          const status = getStatus(step.id);
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 min-w-[100px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300
                ${status === 'completed' ? 'border-green-500 text-green-500' : 
                  status === 'in_progress' ? 'border-blue-600 text-blue-600 ring-4 ring-blue-50 scale-110' : 
                  status === 'blocked' ? 'border-red-300 text-red-300' :
                  'border-gray-300 text-gray-300'}`}
              >
                {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                 status === 'in_progress' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 status === 'blocked' ? <Ban className="w-4 h-4" /> :
                 <Circle className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium text-center whitespace-nowrap ${step.id === currentStep ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}