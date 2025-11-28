import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, History } from "lucide-react";

export default function ActivityLog() {
  const activities = [
      { user: "Amin", action: "Viewed order details", time: "Just now", initial: "A" },
      { user: "System", action: "Validation check passed", time: "1 hour ago", initial: "S" },
      { user: "Sarah", action: "Approved BOM v2.1", time: "Yesterday", initial: "S" },
      { user: "System", action: "Order created from Design", time: "2 days ago", initial: "S" },
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History className="w-4 h-4" /> Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-[300px]">
        <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-4">
                {activities.map((act, i) => (
                    <div key={i} className="flex gap-3">
                        <Avatar className="w-8 h-8 h-8 w-8">
                            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">{act.initial}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-900">{act.user}</p>
                            <p className="text-sm text-gray-500">{act.action}</p>
                            <p className="text-xs text-gray-400">{act.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
        
        <div className="mt-4 pt-4 border-t flex gap-2">
            <Input placeholder="Add internal note..." className="text-sm" />
            <Button size="icon" className="shrink-0">
                <Send className="w-4 h-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}