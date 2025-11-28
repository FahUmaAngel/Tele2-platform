import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, User, Clock } from 'lucide-react';

export default function ActivitySchedule() {
  const activities = [
    { id: 1, title: "Site Survey: Stockholm Central", time: "10:00 AM", type: "survey", assignee: "Tech A" },
    { id: 2, title: "Install: NordGräv / Kista", time: "01:00 PM", type: "install", assignee: "Team B" },
    { id: 3, title: "Design Review: SITE-AB-99", time: "03:30 PM", type: "review", assignee: "Eng. C" },
    { id: 4, title: "Documentation Deadline", time: "Tomorrow", type: "deadline", assignee: "Admin" },
  ];

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          Upcoming Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 relative pl-4 border-l border-gray-200 ml-2">
          {activities.map((activity, idx) => (
            <div key={activity.id} className="relative">
              {/* Dot */}
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-blue-500" />
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5">{activity.type}</Badge>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-tight">{activity.title}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="w-3 h-3" /> {activity.assignee}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}