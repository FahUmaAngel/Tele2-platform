import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, FileWarning, Eye } from 'lucide-react';

export default function AlertsPanel() {
  const alerts = [
    { id: 1, title: "Fiber Delivery Delayed", site: "SITE-ST-402", type: "delay", severity: "high", date: "2h ago" },
    { id: 2, title: "Frost Constraint Conflict", site: "SITE-NO-88", type: "schedule", severity: "medium", date: "4h ago" },
    { id: 3, title: "Missing Site Photos", site: "SITE-VX-12", type: "doc", severity: "low", date: "5h ago" },
    { id: 4, title: "Installation Failed QC", site: "SITE-ST-105", type: "quality", severity: "high", date: "1d ago" },
    { id: 5, title: "Subcontractor Capacity", site: "Region North", type: "resource", severity: "medium", date: "1d ago" },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'delay': return <Clock className="w-4 h-4" />;
      case 'doc': return <FileWarning className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getColor = (severity) => {
    switch(severity) {
      case 'high': return "text-red-600 bg-red-50 border-red-100";
      case 'medium': return "text-amber-600 bg-amber-50 border-amber-100";
      default: return "text-blue-600 bg-blue-50 border-blue-100";
    }
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alerts & Risks
          </CardTitle>
          <Badge variant="destructive" className="rounded-full">5 New</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${getColor(alert.severity)}`}>
                  {getIcon(alert.type)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-mono">{alert.site}</span>
                    <span>•</span>
                    <span>{alert.date}</span>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                <Eye className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100 text-center">
          <Button variant="ghost" size="sm" className="text-xs w-full text-gray-500">View All Alerts</Button>
        </div>
      </CardContent>
    </Card>
  );
}