import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Clock, Thermometer, AlertTriangle, CheckCircle2, Calendar, AlertCircle } from "lucide-react";

export default function FiberStats({ activeOrder, onConfirmDelivery }) {
  // Use passed activeOrder
  const order = activeOrder;

  // Mock AI Data if missing
  const predictedDate = order?.delivery_est_date || new Date().toISOString().split('T')[0];
  const confidence = "94%";
  const confirmedDate = order?.delivery_conf_date;
  const frostRisk = order?.frost_constraint ? "High" : "Low";
  
  // Delay Risk Logic
  let delayRisk = order?.delay_risk || "None";
  if (delayRisk === "None") delayRisk = "On track"; // Map None to "On track" for display
  
  let delayReason = "Delivery matches schedule";
  if (delayRisk === "At risk") delayReason = "Confirmed date > AI prediction";
  if (delayRisk === "Delayed") delayReason = "Shipment overdue";
  if (!confirmedDate && order?.status === 'Planned') delayReason = "Pending confirmation";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Predicted Delivery ETA (AI) */}
      <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Predicted Delivery (AI)</p>
                <div className="flex items-baseline gap-2 mt-1">
                   <h3 className="text-xl font-bold text-gray-900">{new Date(predictedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
                   <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                      {confidence} conf.
                   </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Based on historical fiber delivery & traffic</p>
             </div>
             <div className="p-2 bg-purple-50 rounded-full">
                <Clock className="w-4 h-4 text-purple-600" />
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Confirmed Delivery Date */}
      <Card className={`bg-white border-l-4 shadow-sm ${confirmedDate ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
        <CardContent className="p-4">
           <div className="flex justify-between items-start">
             <div className="w-full">
                <p className="text-xs font-medium text-gray-500 uppercase">Confirmed Delivery</p>
                {confirmedDate ? (
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-xl font-bold text-gray-900">{new Date(confirmedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                ) : (
                    <div className="mt-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">Not confirmed yet</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs w-full" onClick={() => onConfirmDelivery(order)}>
                            Confirm with Subcontractor
                        </Button>
                    </div>
                )}
             </div>
             {confirmedDate && (
                <div className="p-2 bg-green-50 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Frost Window Risk */}
      <Card className={`bg-white border-l-4 shadow-sm ${frostRisk === 'High' ? 'border-l-red-500' : 'border-l-orange-500'}`}>
        <CardContent className="p-4">
           <div className="flex justify-between items-start">
             <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Frost Window Risk</p>
                <div className="flex items-baseline gap-2 mt-1">
                   <h3 className="text-xl font-bold text-gray-900">{frostRisk}</h3>
                   {frostRisk === 'High' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                    Constraint: {order?.frost_constraint || "Standard Trenching"}
                </p>
             </div>
             <div className="p-2 bg-orange-50 rounded-full">
                <Thermometer className="w-4 h-4 text-orange-600" />
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Delivery Delay Risk (AI) */}
      <Card className={`bg-white border-l-4 shadow-sm ${delayRisk === 'On track' ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardContent className="p-4">
           <div className="flex justify-between items-start">
             <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Delay Risk (AI)</p>
                <div className="flex items-baseline gap-2 mt-1">
                   <h3 className="text-xl font-bold text-gray-900">{delayRisk}</h3>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{delayReason}</p>
             </div>
             <div className="p-2 bg-gray-50 rounded-full">
                <AlertCircle className={`w-4 h-4 ${delayRisk === 'On track' ? 'text-green-500' : 'text-red-500'}`} />
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}