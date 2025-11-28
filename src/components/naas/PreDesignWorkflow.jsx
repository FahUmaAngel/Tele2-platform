import React from 'react';
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export default function PreDesignWorkflow({ currentStep = 2 }) {
  const steps = [
    { id: 1, label: "Fiber Ordering", status: "completed" },
    { id: 2, label: "NaaS Pre-Design", status: "in_progress" },
    { id: 3, label: "Site Survey", status: "pending" },
    { id: 4, label: "Design Approval", status: "pending" },
    { id: 5, label: "Order Processing", status: "pending" },
    { id: 6, label: "Installation", status: "pending" },
    { id: 7, label: "RFS", status: "pending" },
  ];

  return (
    <div className="relative py-4">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
      <div className="flex justify-between overflow-x-auto px-2">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2 min-w-[100px]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300
              ${step.status === 'completed' ? 'border-green-500 text-green-500' : 
                step.status === 'in_progress' ? 'border-blue-600 text-blue-600 ring-4 ring-blue-50 scale-110' : 
                'border-gray-300 text-gray-300'}`}
            >
              {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
               step.status === 'in_progress' ? <Loader2 className="w-4 h-4 animate-spin" /> :
               <Circle className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-medium text-center ${step.id === currentStep ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}