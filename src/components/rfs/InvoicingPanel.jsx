import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, DollarSign, CheckCircle2, Loader2 } from "lucide-react";

export default function InvoicingPanel({ status, onGenerateInvoice, rfsReady, fiberOrder, rfsReport }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInvoice = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onGenerateInvoice();
    }, 2000);
  };

  // Dynamic milestone calculation based on actual order status
  const getMilestoneStatus = () => {
    const orderExists = !!fiberOrder?.id;
    const hasDeliveryConfirmed = !!fiberOrder?.delivery_conf_date || fiberOrder?.status === 'Delivered' || fiberOrder?.status === 'Confirming';
    const installationComplete = fiberOrder?.status === 'Completed' || fiberOrder?.status === 'completed';
    const rfsAccepted = !!rfsReport?.customer_signature;

    return [
      { 
        name: "Order Confirmation", 
        amount: "20%", 
        status: orderExists ? "paid" : "pending",
        description: "Initial order placed"
      },
      { 
        name: "Equipment Delivery", 
        amount: "30%", 
        status: hasDeliveryConfirmed ? "paid" : "pending",
        description: "Fiber equipment delivered"
      },
      { 
        name: "Installation Completion", 
        amount: "30%", 
        status: installationComplete ? "paid" : "pending",
        description: "On-site installation finished"
      },
      { 
        name: "RFS Acceptance", 
        amount: "20%", 
        status: rfsAccepted ? "paid" : "pending",
        description: "Customer sign-off received"
      }
    ];
  };

  const milestones = getMilestoneStatus();
  const totalPaid = milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + parseInt(m.amount), 0);
  const remainingPercentage = 100 - totalPaid;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-gray-600" /> Automated Invoicing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Payment Milestones</h4>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${m.status === 'paid' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <span className="font-medium text-sm block">{m.name}</span>
                    <span className="text-xs text-gray-500">{m.description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-700">{m.amount}</span>
                  {m.status === 'paid' ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-800">Total Paid</span>
            <span className="text-lg font-bold text-blue-900">{totalPaid}%</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-blue-800">Remaining</span>
            <span className="text-lg font-bold text-blue-900">{remainingPercentage}%</span>
          </div>
          <p className="text-xs text-blue-600">
            {remainingPercentage > 0 
              ? `Invoice for remaining ${remainingPercentage}% will be generated upon RFS completion.`
              : 'All milestones completed. Ready for final invoice.'}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        {status === 'sent' || status === 'generated' ? (
           <Button className="w-full bg-green-600 hover:bg-green-700 cursor-default">
             <CheckCircle2 className="w-4 h-4 mr-2" /> Invoice Generated
           </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleInvoice} 
            disabled={!rfsReady || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" /> Generate Final Invoice
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}