import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Truck, Package, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Supplier() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    category: "hardware",
    contact_email: "",
    status: "active"
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list()
  });

  const createSupplier = useMutation({
    mutationFn: (data) => base44.entities.Supplier.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsCreateOpen(false);
      setNewSupplier({ name: "", category: "hardware", contact_email: "", status: "active" });
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-500 mt-1">Manage hardware and service vendors.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0a1f33] hover:bg-[#153250]">
              <Plus className="w-4 h-4 mr-2" /> Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input 
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newSupplier.category}
                  onValueChange={(v) => setNewSupplier({...newSupplier, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="cabling">Cabling</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input 
                  value={newSupplier.contact_email}
                  onChange={(e) => setNewSupplier({...newSupplier, contact_email: e.target.value})}
                />
              </div>
              <Button 
                className="w-full bg-blue-600" 
                onClick={() => createSupplier.mutate(newSupplier)}
              >
                Add Supplier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers?.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  supplier.status === 'active' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {supplier.status}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{supplier.name}</h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  <span className="capitalize">{supplier.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span>{supplier.contact_email}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}