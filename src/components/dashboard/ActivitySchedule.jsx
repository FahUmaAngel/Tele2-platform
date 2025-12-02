import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, User, Clock, Loader2 } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, parseISO, isValid } from "date-fns";

export default function ActivitySchedule() {
  // Fetch orders and installation data
  const { data: fiberOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['fiber-orders-schedule'],
    queryFn: () => base44.entities.FiberOrder.list(),
  });

  const { data: installations, isLoading: isLoadingInstall } = useQuery({
    queryKey: ['naas-installations-schedule'],
    queryFn: () => base44.entities.NaasInstallationData.list(),
  });

  if (isLoadingOrders || isLoadingInstall) {
    return (
      <Card className="shadow-sm h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </Card>
    );
  }

  // Process and combine activities
  const activities = [];

  // 1. Add Installations
  if (installations) {
    installations.forEach(inst => {
      if (inst.scheduled_date) {
        activities.push({
          id: `inst-${inst.order_id}`,
          title: `Install: ${inst.facility_id}`,
          time: inst.scheduled_time_start || "09:00",
          date: inst.scheduled_date,
          type: "install",
          assignee: "Tech Team", // Could be enriched from FiberOrder
          sortTime: new Date(`${inst.scheduled_date}T${inst.scheduled_time_start || "09:00"}`).getTime()
        });
      }
    });
  }

  // 2. Add Deadlines from FiberOrders
  if (fiberOrders) {
    fiberOrders.forEach(order => {
      if (order.delivery_est_date) {
        activities.push({
          id: `dl-${order.order_id}`,
          title: `Deadline: ${order.facility_id}`,
          time: "EOD",
          date: order.delivery_est_date,
          type: "deadline",
          assignee: order.project_manager || "Admin",
          sortTime: new Date(order.delivery_est_date).getTime()
        });
      }
      // Add Surveys if status implies it (mock logic for now as we don't have explicit survey dates in FiberOrder)
      if (order.status === 'Planned') {
        activities.push({
          id: `srv-${order.order_id}`,
          title: `Survey: ${order.facility_id}`,
          time: "TBD",
          date: order.updated_date ? order.updated_date.split('T')[0] : "2025-06-01",
          type: "survey",
          assignee: "Surveyor",
          sortTime: new Date(order.updated_date || "2025-06-01").getTime()
        });
      }
    });
  }

  // Sort by time and take top 5
  const sortedActivities = activities
    .sort((a, b) => a.sortTime - b.sortTime)
    .filter(a => a.sortTime > new Date('2025-01-01').getTime()) // Filter out old stuff if needed
    .slice(0, 5);

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
          {sortedActivities.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No upcoming activities</div>
          ) : (
            sortedActivities.map((activity) => (
              <div key={activity.id} className="relative">
                {/* Dot */}
                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 bg-white ${activity.type === 'install' ? 'border-green-500' :
                    activity.type === 'deadline' ? 'border-red-500' :
                      'border-blue-500'
                  }`} />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(parseISO(activity.date), 'MMM d')} • {activity.time}
                    </span>
                    <Badge variant="outline" className={`text-[10px] h-5 ${activity.type === 'install' ? 'bg-green-50 text-green-700 border-green-200' :
                        activity.type === 'deadline' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{activity.title}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" /> {activity.assignee}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}