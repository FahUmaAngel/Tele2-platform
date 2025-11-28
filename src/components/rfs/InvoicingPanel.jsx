import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, DollarSign, CalendarClock, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function InvoicingPanel({ status, onGenerateInvoice, rfsReady }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInvoice = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onGenerateInvoice();
    }, 2000);
  };

  const milestones = [
    { name: "Order Confirmation", amount: "20%", status: "paid" },
    { name: "Equipment Delivery", amount: "30%", status: "paid" },
    { name: "Installation Completion", amount: "30%", status: "pending" },
    { name: "RFS Acceptance", amount: "20%", status: "pending" }
  ];

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
                  <span className="font-medium text-sm">{m.name}</span>
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
            <span className="text-sm font-medium text-blue-800">Total Remaining</span>
            <span className="text-lg font-bold text-blue-900">12,500.00 SEK</span>
          </div>
          <p className="text-xs text-blue-600">
            Invoice #INV-2024-001 will be generated automatically upon RFS completion.
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