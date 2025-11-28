import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Financials({ siteId }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const milestones = [
      { name: "Design Approved", status: "completed", date: "2025-10-15" },
      { name: "Order Released", status: "pending", date: null },
      { name: "Installation Completed", status: "pending", date: null },
      { name: "RFS Signed", status: "pending", date: null },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" /> Financials & Contracts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
            <div>
                <span className="text-gray-500 block text-xs uppercase">Contract ID</span>
                <span className="font-mono font-medium">CTR-2025-882</span>
            </div>
            <div>
                <span className="text-gray-500 block text-xs uppercase">SLA Type</span>
                <span className="font-medium">Gold (4h Response)</span>
            </div>
            <div>
                <span className="text-gray-500 block text-xs uppercase">Billing Model</span>
                <span className="font-medium">Milestone-based</span>
            </div>
             <div>
                <span className="text-gray-500 block text-xs uppercase">Next Invoice</span>
                <span className="font-bold text-green-600">Upon Release</span>
            </div>
        </div>

        <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Invoicing Milestones</h4>
            <div className="space-y-2">
                {milestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            {m.status === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                                <Circle className="w-4 h-4 text-gray-300" />
                            )}
                            <span className={m.status === 'completed' ? 'text-gray-900' : 'text-gray-500'}>{m.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] h-5">
                            {m.status === 'completed' ? 'Paid' : 'Pending'}
                        </Badge>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full text-xs h-8">
                        Preview Invoice Impact
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invoice Preview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold">Item</span>
                            <span className="font-semibold">Amount</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Hardware (Upfront)</span>
                            <span>45,200 SEK</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Installation Service</span>
                            <span>8,500 SEK</span>
                        </div>
                         <div className="flex justify-between text-sm border-t pt-2 font-bold">
                            <span>Total Due</span>
                            <span>53,700 SEK</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Link to={`${createPageUrl('Rfs')}?siteId=${siteId}`}>
                <Button variant="ghost" className="w-full text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    Open Ready For Service <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
            </Link>
        </div>

      </CardContent>
    </Card>
  );
}