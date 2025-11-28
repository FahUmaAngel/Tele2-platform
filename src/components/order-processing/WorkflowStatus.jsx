import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function WorkflowStatus({ currentStep = 5, dependencies }) {
  const [isChecking, setIsChecking] = useState(false);

  const handleRunAICheck = () => {
    setIsChecking(true);
    toast.info("Running AI Readiness Check...");
    setTimeout(() => {
      setIsChecking(false);
      toast.success("AI Check Complete: No new issues found.");
    }, 2000);
  };
  const steps = [
    { id: 1, label: "Fiber Ordering", status: "completed" },
    { id: 2, label: "NaaS Pre-Design", status: "completed" },
    { id: 3, label: "Site Survey", status: "completed" },
    { id: 4, label: "Design Approval", status: "completed" },
    { id: 5, label: "Order Processing", status: "in_progress" },
    { id: 6, label: "Installation", status: "pending" },
    { id: 7, label: "RFS", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
        <div className="flex justify-between overflow-x-auto pb-4 px-2">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 min-w-[100px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white
                ${step.status === 'completed' ? 'border-green-500 text-green-500' : 
                  step.status === 'in_progress' ? 'border-blue-600 text-blue-600 ring-4 ring-blue-50' : 
                  'border-gray-300 text-gray-300'}`}
              >
                {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                 step.status === 'in_progress' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 <Circle className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium text-center ${step.id === currentStep ? 'text-blue-700' : 'text-gray-600'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dependencies Panel */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Upstream Readiness & Dependencies</CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={handleRunAICheck}
            disabled={isChecking}
          >
            {isChecking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {isChecking ? "Checking..." : "Re-run AI Check"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Readiness Checks */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500 uppercase">Readiness Checks</h4>
              <div className="space-y-2">
                <CheckItem label="Fiber Ordering Status" status="ready" details="Confirmed" />
                <CheckItem label="NaaS Pre-Design" status="ready" details="Complete" />
                <CheckItem label="Site Survey" status="ready" details="Complete" />
                <CheckItem label="Design Approval" status="warning" details="Pending Customer Sign-off" />
              </div>
            </div>

            {/* Blocking Issues */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500 uppercase">Blocking Issues</h4>
              {dependencies?.blockingIssues?.length > 0 ? (
                dependencies.blockingIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded text-sm text-red-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))
              ) : (
                 <div className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>No blocking issues detected.</span>
                  </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CheckItem({ label, status, details }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xs">{details}</span>
        {status === 'ready' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        {status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
        {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>
    </div>
  );
}