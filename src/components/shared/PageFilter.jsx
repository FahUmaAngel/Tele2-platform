import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function PageFilter({ onFilterChange, className, defaultFilters }) {
   const [filters, setFilters] = useState({
      search: "",
      facility_id: "all",
      order_id: "all",
      status: "all",
      priority: "all",
      ...defaultFilters
   });

   // Fetch distinct values for dropdowns
   const { data: orders } = useQuery({
      queryKey: ['fiber-orders-filter'],
      queryFn: () => base44.entities.FiberOrder.list(),
      initialData: []
   });

   const uniqueFacilityIds = Array.from(new Set(orders.map(o => o.facility_id))).filter(Boolean).sort();

   const filteredOrdersForDropdown = filters.facility_id && filters.facility_id !== 'all'
      ? orders.filter(o => o.facility_id === filters.facility_id)
      : orders;
   const uniqueOrderIds = Array.from(new Set(filteredOrdersForDropdown.map(o => o.order_id))).filter(Boolean).sort();

   useEffect(() => {
      // Convert "all" to empty string for parent consumers if they expect empty string for no filter
      // Or keep "all" if they handle it. The previous implementation used empty string for Input.
      // Let's normalize: if "all", send empty string.
      const effectiveFilters = {
         ...filters,
         facility_id: filters.facility_id === "all" ? "" : filters.facility_id,
         order_id: filters.order_id === "all" ? "" : filters.order_id,
         status: filters.status === "all" ? "" : filters.status,
         priority: filters.priority === "all" ? "" : filters.priority
      };
      onFilterChange(effectiveFilters);
   }, [filters, onFilterChange]);

   const handleChange = (key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
   };

   const clearFilters = () => {
      setFilters({
         search: "",
         facility_id: "all",
         order_id: "all",
         status: "all",
         priority: "all"
      });
   };

   return (
      <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 ${className}`}>
         <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 min-w-[200px]">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
               <Input
                  placeholder="Search..."
                  className="pl-9 bg-gray-50"
                  value={filters.search}
                  onChange={(e) => handleChange('search', e.target.value)}
               />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
               <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 font-medium">Filters:</span>
               </div>

               {/* Facility ID Dropdown */}
               <Select value={filters.facility_id} onValueChange={(val) => handleChange('facility_id', val)}>
                  <SelectTrigger className="w-[160px] h-9 text-sm">
                     <SelectValue placeholder="Facility ID" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Facilities</SelectItem>
                     {uniqueFacilityIds.map(id => (
                        <SelectItem key={id} value={id}>{id}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               {/* Order ID Dropdown */}
               <Select value={filters.order_id} onValueChange={(val) => handleChange('order_id', val)}>
                  <SelectTrigger className="w-[160px] h-9 text-sm">
                     <SelectValue placeholder="Order ID" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Orders</SelectItem>
                     {uniqueOrderIds.map(id => (
                        <SelectItem key={id} value={id}>{id}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               {/* Status Dropdown */}
               <Select value={filters.status} onValueChange={(val) => handleChange('status', val)}>
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                     <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Statuses</SelectItem>
                     {Array.from(new Set(orders.map(o => o.status))).filter(Boolean).sort().map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               {/* Priority Dropdown */}
               <Select value={filters.priority} onValueChange={(val) => handleChange('priority', val)}>
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                     <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Priorities</SelectItem>
                     <SelectItem value="1">1 - Critical</SelectItem>
                     <SelectItem value="2">2 - High</SelectItem>
                     <SelectItem value="3">3 - Medium</SelectItem>
                     <SelectItem value="4">4 - Low</SelectItem>
                     <SelectItem value="5">5 - Minimal</SelectItem>
                  </SelectContent>
               </Select>

               {(filters.search || filters.facility_id !== 'all' || filters.order_id !== 'all' || filters.status !== 'all' || filters.priority !== 'all') && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 text-gray-500 hover:text-gray-700">
                     <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
               )}
            </div>
         </div>
      </div>
   );
}