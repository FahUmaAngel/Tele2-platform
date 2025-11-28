import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkflowPipeline() {
  const stages = [
    { id: 1, name: "Fiber Order", count: 45, delayed: 2, color: "bg-blue-500", percentage: 75 },
    { id: 2, name: "Fiber Delivery", count: 32, delayed: 5, color: "bg-indigo-500", percentage: 60 },
    { id: 3, name: "Site Survey", count: 28, delayed: 1, color: "bg-cyan-500", percentage: 45 },
    { id: 4, name: "Design", count: 15, delayed: 0, color: "bg-purple-500", percentage: 30 },
    { id: 5, name: "Installation", count: 12, delayed: 3, color: "bg-orange-500", percentage: 80 },
    { id: 6, name: "Activation", count: 8, delayed: 1, color: "bg-pink-500", percentage: 50 },
    { id: 7, name: "RFS", count: 892, delayed: 0, color: "bg-green-500", percentage: 100 },
  ];

  return (
    <Card className="col-span-full lg:col-span-2 xl:col-span-3 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">Rollout Workflow Pipeline</CardTitle>
          <Link to="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Full Kanban</Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-2">
          {stages.map((stage) => (
            <div key={stage.id} className="group relative p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-600 uppercase truncate" title={stage.name}>
                  {stage.name}
                </span>
                {stage.delayed > 0 && (
                  <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                    {stage.delayed}
                  </span>
                )}
              </div>
              
              <div className="flex items-end gap-2 mb-3">
                <span className="text-2xl font-bold text-gray-900">{stage.count}</span>
                <span className="text-[10px] text-gray-400 mb-1">sites</span>
              </div>

              <div className="space-y-1">
                <Progress value={stage.percentage} className="h-1.5" indicatorClassName={stage.color} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}