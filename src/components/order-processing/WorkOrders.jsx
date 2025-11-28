import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, Calendar, User, Sparkles, Loader2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WorkOrders({ workOrders = [], siteId, orderId }) {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [newWO, setNewWO] = useState({ type: "Installation", status: "Scheduled", scheduled_date: "" });
  const [assignTech, setAssignTech] = useState("");
  const queryClient = useQueryClient();

  const generateWOMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkOrder.create({ ...data, order_id: orderId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrders']);
      setIsGenerateOpen(false);
      toast.success("Work Order Generated");
    }
  });

  const handleSuggestStructure = () => {
    toast.info("AI Analysis: Based on BOM, suggesting 'Installation' and 'Configuration' phases.");
  };

  const assignMutation = useMutation({
    mutationFn: ({ id, tech }) => base44.entities.WorkOrder.update(id, { assigned_technician: tech, status: "Scheduled" }),
    onSuccess: () => {
        queryClient.invalidateQueries(['workOrders']);
        setIsAssignOpen(false);
        toast.success(`Technician ${assignTech} assigned successfully.`);
    },
    onError: () => toast.error("Failed to assign technician")
  });

  const handleGenerate = () => {
      if (!orderId) return toast.error("Order ID missing");
      if (!newWO.scheduled_date) return toast.error("Scheduled Date is required");
      generateWOMutation.mutate(newWO);
  };

  const handleAssign = () => {
      if (!assignTech) return toast.error("Please select a technician");
      
      // Find the first unassigned work order or alert user
      const targetWO = workOrders.find(wo => !wo.assigned_technician || wo.assigned_technician === "Unassigned");
      
      if (!targetWO) {
          return toast.error("No unassigned work orders found to update.");
      }
      
      assignMutation.mutate({ id: targetWO.id, tech: assignTech });
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Wrench className="w-4 h-4" /> Work Orders
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleSuggestStructure} className="h-8 gap-1 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
            <Sparkles className="w-3 h-3" /> Suggest Structure
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tech</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {workOrders.map((wo, i) => (
                   <TableRow key={i}>
                       <TableCell className="font-mono text-xs">{wo.id || "WO-NEW"}</TableCell>
                       <TableCell className="text-xs font-medium">{wo.type}</TableCell>
                       <TableCell className="text-xs text-gray-500">{wo.assigned_technician || "Unassigned"}</TableCell>
                       <TableCell className="text-xs">{wo.scheduled_date || "TBD"}</TableCell>
                       <TableCell className="text-right">
                           <Badge variant="outline" className="text-xs">{wo.status}</Badge>
                       </TableCell>
                   </TableRow>
               ))}
               {workOrders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-xs text-gray-500">
                            No work orders generated yet.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full text-xs h-9">
                        <Plus className="w-3 h-3 mr-2" /> Generate Work Order
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Generate Work Order</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={newWO.type} onValueChange={v => setNewWO({...newWO, type: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Installation">Installation</SelectItem>
                                    <SelectItem value="Configuration Only">Configuration Only</SelectItem>
                                    <SelectItem value="Survey follow-up">Survey follow-up</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Scheduled Date</Label>
                            <Input type="date" value={newWO.scheduled_date} onChange={e => setNewWO({...newWO, scheduled_date: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                        <Button onClick={handleGenerate} disabled={generateWOMutation.isPending}>
                            {generateWOMutation.isPending && <Loader2 className="w-3 h-3 mr-2 animate-spin" />} Generate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full text-xs h-9">
                        <User className="w-3 h-3 mr-2" /> Assign Technician
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Assign Technician</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Technician</Label>
                            <Select value={assignTech} onValueChange={setAssignTech}>
                                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tech A (John)">Tech A (John)</SelectItem>
                                    <SelectItem value="Tech B (Sarah)">Tech B (Sarah)</SelectItem>
                                    <SelectItem value="Tech C (Mike)">Tech C (Mike)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssign}>Confirm Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        
        <Link to={`${createPageUrl('NaasInstallation')}?siteId=${siteId}`}>
            <Button className="w-full bg-[#0a1f33] h-9 text-xs mt-2">
                Open Installation Page
            </Button>
        </Link>
      </CardContent>
    </Card>
  );
}