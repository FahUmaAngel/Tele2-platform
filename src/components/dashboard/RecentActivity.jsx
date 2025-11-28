import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, CheckCircle, FileText, AlertOctagon } from 'lucide-react';

export default function RecentActivity() {
  const activities = [
    { id: 1, user: "Amin", action: "created order", target: "FO-2024-001", time: "10 min ago", icon: Zap, color: "text-blue-500" },
    { id: 2, user: "System", action: "detected delay", target: "Site Survey #44", time: "25 min ago", icon: AlertOctagon, color: "text-red-500" },
    { id: 3, user: "Sarah", action: "uploaded docs", target: "RFS Report", time: "1h ago", icon: FileText, color: "text-gray-500" },
    { id: 4, user: "NordGräv", action: "completed", target: "Installation at Storgatan", time: "2h ago", icon: CheckCircle, color: "text-green-500" },
    { id: 5, user: "Amin", action: "approved design", target: "Design V2.1", time: "3h ago", icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3 text-sm">
                <act.icon className={`w-4 h-4 mt-0.5 shrink-0 ${act.color}`} />
                <div>
                  <p className="text-gray-900">
                    <span className="font-semibold">{act.user}</span> {act.action} <span className="font-medium text-gray-700">{act.target}</span>
                  </p>
                  <p className="text-xs text-gray-400">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}