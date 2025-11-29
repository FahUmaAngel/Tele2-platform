import React from 'react';
import {
  CheckSquare,
  Camera,
  UploadCloud,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

import rackImg from '@/assets/rack_installation.jpg';
import cablingImg from '@/assets/cabling_setup.jpg';

export default function WorkExecution({ siteId }) {
  const [checklistItems, setChecklistItems] = React.useState([
    { id: 1, label: "Equipment received and verified against BOM", checked: true, description: "Check all serial numbers against the delivery note." },
    { id: 2, label: "Rack mounting completed according to design", checked: true, description: "Ensure 1U spacing between active equipment." },
    { id: 3, label: "Power redundancy verified (UPS/PDU)", checked: false, description: "Test both A and B feeds." },
    { id: 4, label: "Structured cabling & labeling completed", checked: false, description: "Labels must be printed, not handwritten." },
    { id: 5, label: "Initial power-on test passed", checked: false, description: "Verify all status LEDs are green." },
    { id: 6, label: "Port connectivity verification", checked: false, description: "Test uplink connectivity." },
  ]);

  const toggleItem = (id) => {
    setChecklistItems(items => items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const progress = (checklistItems.filter(i => i.checked).length / checklistItems.length) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Installation Checklist */}
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Installation Checklist
          </CardTitle>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Smartphone className="w-3 h-3 mr-1" /> Mobile View
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Mobile Technician View</SheetTitle>
                  <SheetDescription>
                    Simulating mobile interface for field technicians.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 border-4 border-gray-800 rounded-[3rem] overflow-hidden h-[600px] bg-gray-50 relative shadow-xl mx-auto max-w-[320px]">
                  <div className="absolute top-0 w-full h-6 bg-gray-800 flex justify-center">
                    <div className="w-1/3 h-4 bg-black rounded-b-xl"></div>
                  </div>
                  <div className="p-6 pt-12 h-full overflow-y-auto">
                    <h3 className="font-bold text-lg mb-4">Installation Tasks</h3>
                    <div className="space-y-4">
                      {checklistItems.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                          <Checkbox
                            id={`mobile-task-${item.id}`}
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={`mobile-task-${item.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {item.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-6" size="lg">Complete Section</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open('#', '_blank')}>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-3">
            {checklistItems.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={`task-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={`task-${item.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {item.label}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">View Full Checklist</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Detailed Installation Checklist</DialogTitle>
                  <DialogDescription>
                    Complete all required items to proceed to the next phase.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                        <Checkbox
                          id={`dialog-task-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`dialog-task-${item.id}`}
                            className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {item.label}
                          </label>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Photo & Evidence Upload */}
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Photo Evidence
          </CardTitle>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            2 Pending
          </Badge>
        </CardHeader>
        <CardContent>
          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
            <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
              <UploadCloud className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="mt-2 font-medium text-gray-900">Drop photos here</h3>
            <p className="text-xs text-gray-500 mt-1">or click to browse (JPG, PNG)</p>
          </div>

          {/* AI Vision Analysis */}
          <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg flex items-start gap-3">
            <Eye className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-purple-900">AI Vision Analysis</div>
              <div className="text-xs text-purple-700 mt-0.5">
                Last upload detected: <span className="font-medium">Cisco ISR 1100</span>.
                <br />
                Status: <span className="text-green-600 font-medium">Correctly Mounted</span>.
              </div>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Uploads</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                <img src={rackImg} alt="Rack" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="h-7 text-xs">View</Button>
                </div>
                <div className="absolute bottom-1 right-1">
                  <div className="bg-green-500 rounded-full p-0.5">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                <img src={cablingImg} alt="Cabling" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="h-7 text-xs">View</Button>
                </div>
                <div className="absolute bottom-1 right-1">
                  <div className="bg-green-500 rounded-full p-0.5">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}