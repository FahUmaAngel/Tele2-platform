import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingUp, AlertCircle } from 'lucide-react';

export default function SubcontractorStatus() {
  const subs = [
    { name: "NordGräv AB", active: 12, onTime: "98%", capacity: "Full", risk: "low" },
    { name: "Svea Fiber", active: 8, onTime: "85%", capacity: "Available", risk: "medium" },
    { name: "ConnectTech", active: 15, onTime: "92%", capacity: "High", risk: "low" },
    { name: "CityInstall", active: 4, onTime: "76%", capacity: "Limited", risk: "high" },
  ];

  const getRiskBadge = (risk) => {
    switch(risk) {
      case 'low': return <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Low Risk</span>;
      case 'medium': return <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Watch</span>;
      case 'high': return <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Critical</span>;
      default: return null;
    }
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Subcontractor Performance
          </CardTitle>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 text-xs">Partner</TableHead>
              <TableHead className="h-8 text-xs text-right">Active Jobs</TableHead>
              <TableHead className="h-8 text-xs text-right">On-Time</TableHead>
              <TableHead className="h-8 text-xs text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs.map((sub) => (
              <TableRow key={sub.name} className="hover:bg-gray-50">
                <TableCell className="py-3 font-medium text-sm">{sub.name}</TableCell>
                <TableCell className="py-3 text-right font-mono text-xs">{sub.active}</TableCell>
                <TableCell className="py-3 text-right text-xs">{sub.onTime}</TableCell>
                <TableCell className="py-3 text-right">{getRiskBadge(sub.risk)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}