import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Activity, Clock, TrendingUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function AIAssistant() {
  const handleCopy = (text) => {
      navigator.clipboard.writeText(text);
      toast.success("Explanation copied to clipboard");
  };

  const explanationText = "We are preparing to ship your hardware and have scheduled the installation for mid-November. Our team will contact you 2 days prior to confirm access details.";

  return (
    <Card className="bg-gradient-to-b from-white to-indigo-50/30 border-indigo-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-900">
          <Sparkles className="w-5 h-5 text-indigo-600" /> AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Check */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Order Health Check
          </h4>
          <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm text-sm">
            <div className="flex justify-between items-center mb-2">
               <span className="text-gray-500">Overall Risk</span>
               <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-xs">Low</span>
            </div>
            <p className="text-gray-600 leading-snug">
                Order is on track. All upstream dependencies are met. No major delays anticipated based on current supplier performance.
            </p>
          </div>
        </div>

        {/* Scheduling Risk */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Scheduling & Risk Scoring
          </h4>
           <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm text-sm space-y-3">
            <div className="flex justify-between items-center">
               <span className="text-gray-500">On-time Probability</span>
               <span className="font-bold text-indigo-700">94%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[94%]"></div>
            </div>
            <ul className="text-xs space-y-1 text-gray-500">
                <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> No frost constraints
                </li>
                 <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Hardware stock available
                </li>
                 <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Subcontractor load high
                </li>
            </ul>
          </div>
        </div>

        {/* Customer Explanation */}
        <div className="space-y-2">
             <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Explain to Customer
            </h4>
             <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm text-sm">
                <p className="text-gray-600 italic mb-2 text-xs">
                    "{explanationText}"
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => handleCopy(explanationText)}>
                    Copy Explanation
                </Button>
             </div>
        </div>

      </CardContent>
    </Card>
  );
}