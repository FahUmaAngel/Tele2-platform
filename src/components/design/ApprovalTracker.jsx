import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, FileEdit, Lock, Send, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export default function ApprovalTracker({ design, onStatusChange }) {
  
  const getStatusColor = (status) => {
      switch(status) {
          case 'approved': return 'bg-green-100 text-green-800 border-green-200';
          case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'revision_requested': return 'bg-orange-100 text-orange-800 border-orange-200';
          case 'locked': return 'bg-gray-100 text-gray-800 border-gray-200';
          default: return 'bg-gray-100 text-gray-500 border-gray-200';
      }
  };

  const getStatusIcon = (status) => {
       switch(status) {
          case 'approved': return <CheckCircle2 className="w-4 h-4" />;
          case 'submitted': return <Send className="w-4 h-4" />;
          case 'revision_requested': return <FileEdit className="w-4 h-4" />;
          case 'locked': return <Lock className="w-4 h-4" />;
          default: return <Clock className="w-4 h-4" />;
      }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
           <div className="flex items-center gap-2">
               <History className="w-5 h-5 text-gray-600" />
               Approval Status
           </div>
           <Badge variant="outline" className={`${getStatusColor(design.status)} flex items-center gap-1`}>
               {getStatusIcon(design.status)}
               {design.status.replace('_', ' ').toUpperCase()}
           </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Timeline / History */}
        <div className="relative border-l border-gray-200 ml-2 space-y-6 pl-6 py-2">
            {design.approval_history?.map((event, i) => (
                <div key={i} className="relative">
                    <div className="absolute -left-[29px] bg-white p-1 rounded-full border border-gray-200">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900">{event.action}</span>
                        <span className="text-xs text-gray-500">{format(new Date(event.date), 'MMM d, HH:mm')} • {event.user}</span>
                        {event.comments && (
                            <p className="mt-1 text-xs bg-gray-50 p-2 rounded text-gray-600 border">
                                "{event.comments}"
                            </p>
                        )}
                    </div>
                </div>
            ))}
            {(!design.approval_history || design.approval_history.length === 0) && (
                 <div className="text-xs text-gray-400 italic">No history yet. Design is in Draft.</div>
            )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t grid gap-2">
            {design.status === 'draft' && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => onStatusChange('submitted')}>
                    <Send className="w-4 h-4 mr-2" /> Submit for Approval
                </Button>
            )}
            {design.status === 'submitted' && (
                <div className="grid grid-cols-2 gap-2">
                     <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => onStatusChange('revision_requested')}>
                        Request Revision
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => onStatusChange('approved')}>
                        Approve Design
                    </Button>
                </div>
            )}
             {design.status === 'approved' && (
                <Button variant="secondary" className="w-full" onClick={() => onStatusChange('locked')}>
                    <Lock className="w-4 h-4 mr-2" /> Lock Final Design
                </Button>
            )}
             {design.status === 'locked' && (
                <div className="bg-gray-50 p-3 rounded text-xs text-center text-gray-500 flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3" /> Design is locked for production
                </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
}