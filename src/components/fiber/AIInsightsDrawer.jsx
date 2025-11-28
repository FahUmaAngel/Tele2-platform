import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

export default function AIInsightsDrawer({ open, onClose, siteId }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-purple-700">
            <Sparkles className="w-5 h-5" /> AI Insights & Predictions
          </SheetTitle>
          <SheetDescription>
            Real-time analysis for Site {siteId} based on logistics data.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 mt-8">
          
          {/* ETA Prediction */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Predictive Delivery ETA
            </h3>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-bold text-blue-900">Oct 24</span>
                <span className="text-sm font-medium text-blue-700 mb-1">94% Confidence</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Based on subcontractor "NordGräv" historical performance in the Kiruna region, deliveries are averaging 2 days faster than scheduled.
              </p>
            </div>
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              Update Order ETA
            </Button>
          </div>

          <Separator />

          {/* Weather / Frost */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" /> Frost Risk Warning
            </h3>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded border border-orange-200 text-center min-w-[60px]">
                  <span className="block text-xs text-orange-500 uppercase font-bold">Nov</span>
                  <span className="block text-xl font-bold text-gray-900">15</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Frost Window Begins</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ground freezing expected to impact trenching. Schedule installation before Nov 10 to avoid delays.
                  </p>
                </div>
              </div>
            </div>
             <Button variant="outline" size="sm" className="w-full">
              View Weather Calendar
            </Button>
          </div>

          <Separator />

           {/* NLG Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" /> Stakeholder Summary
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 font-mono leading-relaxed relative">
               "Fiber delivery for site {siteId} is on track for Oct 24. Subcontractor assigned. Installation should be scheduled immediately to beat the Nov 15 frost window."
               <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-6 text-[10px]">Copy</Button>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}