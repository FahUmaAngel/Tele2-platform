import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Trash2, Cpu, Sparkles, Server } from "lucide-react";

export default function TechnicalSpecs({ design, setDesign, readOnly = false }) {
  const [newItem, setNewItem] = React.useState({ category: 'Hardware', model: '', quantity: 1, unit_price: 0 });

  const addItem = () => {
    if (!newItem.model) return;
    const updatedSpecs = [...(design.hardware_specs || []), newItem];
    setDesign({ ...design, hardware_specs: updatedSpecs });
    setNewItem({ category: 'Hardware', model: '', quantity: 1, unit_price: 0 });
  };

  const removeItem = (index) => {
    const updatedSpecs = [...design.hardware_specs];
    updatedSpecs.splice(index, 1);
    setDesign({ ...design, hardware_specs: updatedSpecs });
  };

  const generateAIDesign = () => {
      // Mock AI generation
      const mockSpecs = [
          { category: 'Hardware', model: 'Cisco ISR 1100', quantity: 1, unit_price: 1200 },
          { category: 'Hardware', model: 'Catalyst 9200 Switch', quantity: 2, unit_price: 2500 },
          { category: 'Hardware', model: 'Meraki MR46 AP', quantity: 4, unit_price: 600 },
          { category: 'Software', model: 'DNA Essentials License 3Y', quantity: 1, unit_price: 1500 },
          { category: 'Service', model: 'Installation L2', quantity: 1, unit_price: 800 },
      ];
      setDesign({ ...design, hardware_specs: mockSpecs });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            Technical Design
        </CardTitle>
        {!readOnly && (
             <Button variant="outline" size="sm" onClick={generateAIDesign} className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">
                <Sparkles className="w-4 h-4 mr-2" /> Auto-Generate Topology
            </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Specs Table */}
        <div className="border rounded-md overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Component / Model</TableHead>
                        <TableHead className="w-20">Qty</TableHead>
                        {!readOnly && <TableHead className="w-10"></TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {design.hardware_specs?.map((item, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Badge variant="secondary" className="font-normal">
                                    {item.category}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.model}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            {!readOnly && (
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeItem(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                    {(!design.hardware_specs || design.hardware_specs.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                No components added. Use AI Auto-Generate or add manually.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>

        {/* Add Item Form */}
        {!readOnly && (
            <div className="flex gap-2 items-end p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="space-y-1 w-32">
                    <label className="text-xs font-medium text-gray-500">Type</label>
                    <Select value={newItem.category} onValueChange={(v) => setNewItem({...newItem, category: v})}>
                        <SelectTrigger className="h-9 bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hardware">Hardware</SelectItem>
                            <SelectItem value="Software">Software</SelectItem>
                            <SelectItem value="Service">Service</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1 flex-1">
                    <label className="text-xs font-medium text-gray-500">Model / Description</label>
                    <Input 
                        className="h-9 bg-white" 
                        placeholder="e.g. Cisco Catalyst 9200" 
                        value={newItem.model}
                        onChange={(e) => setNewItem({...newItem, model: e.target.value})}
                    />
                </div>
                <div className="space-y-1 w-20">
                    <label className="text-xs font-medium text-gray-500">Qty</label>
                    <Input 
                        type="number" 
                        className="h-9 bg-white" 
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    />
                </div>
                 <div className="space-y-1 w-24">
                    <label className="text-xs font-medium text-gray-500">Unit Cost</label>
                    <Input 
                        type="number" 
                        className="h-9 bg-white" 
                        value={newItem.unit_price}
                        onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value)})}
                    />
                </div>
                <Button size="sm" className="h-9" onClick={addItem}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}