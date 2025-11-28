import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, AlertTriangle, FileText, Cpu, Sparkles } from "lucide-react";

export default function DraftDesignPreview({ design }) {
  if (!design) {
    return (
      <Card className="h-full border-dashed flex items-center justify-center p-8 bg-gray-50">
        <div className="text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium">No Draft Generated</h3>
          <p className="text-sm">Enter parameters and use AI to generate a preliminary design.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feasibility Assessment */}
      <Card className="bg-blue-50/50 border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-800">
            <CheckCircle2 className="w-5 h-5" /> Technical Feasibility Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-900 mb-3">
            Based on the <strong>{design.site_category}</strong> category and <strong>{design.location_type}</strong> type:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-xs font-bold text-gray-500 uppercase">Estimated Bandwidth</span>
              <div className="font-semibold text-gray-900">1 Gbps / 1 Gbps</div>
            </div>
            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-xs font-bold text-gray-500 uppercase">Coverage Estimate</span>
              <div className="font-semibold text-gray-900">~350 m²</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BOM Preview */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-gray-600" /> Preliminary BOM
          </CardTitle>
          <Badge variant="outline">Draft V0.1</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8">Component</TableHead>
                <TableHead className="h-8 text-right">Qty</TableHead>
                <TableHead className="h-8 text-right">Est. Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {design.bom?.map((item, i) => (
                <TableRow key={i} className="text-sm">
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.qty}</TableCell>
                  <TableCell className="text-right">{item.cost} SEK</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-gray-50">
                <TableCell>Total Estimated</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">
                  {design.bom?.reduce((acc, item) => acc + item.cost * item.qty, 0)} SEK
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Recommendations
        </h4>
        <div className="p-3 bg-purple-50 border border-purple-100 rounded-md text-sm text-purple-900">
            <strong>Optimization:</strong> For {design.location_type} environments, we recommend adding redundant power supplies to the main switch stack.
        </div>
        <div className="p-3 bg-orange-50 border border-orange-100 rounded-md text-sm text-orange-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
                <strong>Survey Focus:</strong> Please verify ceiling height and cabling paths in the main area, as {design.location_type} ceilings can exceed 4m.
            </span>
        </div>
      </div>
    </div>
  );
}