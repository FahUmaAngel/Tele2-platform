import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function BOMTable({ items = [], orderId }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    product_code: "",
    description: "",
    category: "Hardware",
    quantity: 1,
    unit_price: 0
  });

  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: (data) => base44.entities.OrderLineItem.create({ ...data, order_id: orderId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bomItems']);
      setIsAddOpen(false);
      setNewItem({ product_code: "", description: "", category: "Hardware", quantity: 1, unit_price: 0 });
      toast.success("Item added to BOM");
    },
    onError: () => toast.error("Failed to add item")
  });

  const handleExport = () => {
    if (!items.length) return toast.error("No items to export");
    
    const headers = ["Product Code", "Description", "Category", "Quantity", "Unit Price", "Total"];
    const csvContent = [
      headers.join(","),
      ...items.map(item => [
        item.product_code,
        `"${item.description}"`,
        item.category,
        item.quantity,
        item.unit_price,
        item.quantity * item.unit_price
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `BOM_Export_${orderId || 'Draft'}.csv`;
    link.click();
    toast.success("BOM Exported Successfully");
  };

  const handleAddItem = () => {
    if (!orderId) return toast.error("Order ID missing, cannot add item");
    if (!newItem.product_code) return toast.error("Product Code is required");
    if (!newItem.quantity || newItem.quantity < 1) return toast.error("Quantity must be at least 1");
    
    addItemMutation.mutate(newItem);
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold">Bill of Materials (BOM)</CardTitle>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Synced with Design
             </Badge>
             <span className="text-xs text-gray-500">Version 2.1</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="w-3 h-3 mr-2" /> Export
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#0a1f33]">
                <Plus className="w-3 h-3 mr-2" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add BOM Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Code</Label>
                    <Input value={newItem.product_code} onChange={e => setNewItem({...newItem, product_code: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <Label>Category</Label>
                     <Input value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price (SEK)</Label>
                    <Input type="number" value={newItem.unit_price} onChange={e => setNewItem({...newItem, unit_price: parseFloat(e.target.value)})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddItem} disabled={addItemMutation.isPending}>
                  {addItemMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Product Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell>{item.product_code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                        {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.unit_price?.toLocaleString()} SEK</TableCell>
                  <TableCell className="text-right font-medium">
                    {((item.unit_price || 0) * (item.quantity || 0)).toLocaleString()} SEK
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No line items added yet.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 flex justify-end gap-8 border-t pt-4">
            <div className="text-right">
                <div className="text-sm text-gray-500">Total CAPEX</div>
                <div className="text-xl font-bold">45,200 SEK</div>
            </div>
            <div className="text-right">
                <div className="text-sm text-gray-500">Monthly OPEX</div>
                <div className="text-xl font-bold">3,500 SEK</div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}