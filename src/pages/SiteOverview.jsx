import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageFilter from '@/components/shared/PageFilter';

export default function SiteOverview() {
  const [pageFilters, setPageFilters] = useState({});

  const { data: fiberOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['fiber-orders-overview'],
    queryFn: () => base44.entities.FiberOrder.list()
  });

  const { data: naasDesigns, isLoading: loadingNaas } = useQuery({
    queryKey: ['naas-designs-overview'],
    queryFn: () => base44.entities.NaasPreDesign.list()
  });

  const { data: siteSurveys, isLoading: loadingSurveys } = useQuery({
    queryKey: ['site-surveys-overview'],
    queryFn: () => base44.entities.SiteSurvey.list()
  });

  // Merge data based on facility_id
  const data = fiberOrders?.map(order => {
    const design = naasDesigns?.find(d => d.facility_id === order.facility_id) || {};
    // Calculate progress based on status and existence of other records
    let progress = "1. Fiber Ordering";
    let progressColor = "bg-blue-100 text-blue-700";
    
    if (order.status === 'Completed') {
        progress = "7. RFS Ready";
        progressColor = "bg-green-100 text-green-700";
    } else if (order.status === 'Installation Scheduled') {
        progress = "6. Installation";
        progressColor = "bg-purple-100 text-purple-700";
    } else if (order.status === 'Confirmed') {
        progress = "5. Order Processing";
        progressColor = "bg-indigo-100 text-indigo-700";
    } else if (design.facility_id) {
        progress = "2. NaaS Pre-Design";
        progressColor = "bg-yellow-100 text-yellow-700";
    }

    return {
      id: order.id,
      facilityId: order.facility_id,
      location: order.municipality,
      category: order.category || design.site_category || "N/A",
      priority: order.priority,
      deliveryEst: order.delivery_est_date,
      subcontractor: order.subcontractor,
      status: order.status,
      progress,
      progressColor
    };
  }) || [];

  const filteredData = data.filter(item => {
    // PageFilter Filtering Logic
    const f = pageFilters;
    if (f.facility_id && f.facility_id !== 'all' && !item.facilityId?.toLowerCase().includes(f.facility_id.toLowerCase())) return false;
    if (f.status && f.status !== 'all' && item.status !== f.status) return false;
    if (f.priority && f.priority !== 'all' && item.priority.toString() !== f.priority) return false;

    if (f.search) {
        const s = f.search.toLowerCase();
        const matches = 
            item.facilityId?.toLowerCase().includes(s) ||
            item.location?.toLowerCase().includes(s) ||
            item.subcontractor?.toLowerCase().includes(s);
        if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 p-8">
      <PageFilter onFilterChange={setPageFilters} className="mb-0" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Overview</h1>
          <p className="text-gray-500 mt-1">Manage and track all network sites and their current status.</p>
        </div>
        <div className="flex gap-3">
           <Link to={createPageUrl('FiberOrdering')}>
              <Button className="bg-[#0a1f33] hover:bg-[#153250]">
                <Plus className="w-4 h-4 mr-2" /> New Site Order
              </Button>
           </Link>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0 pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Facility ID</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Delivery Est.</TableHead>
                  <TableHead>Subcontractor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={9} className="text-center h-24 text-gray-500">
                            No sites found.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredData.map((row) => (
                      <TableRow key={row.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium">{row.facilityId}</TableCell>
                        <TableCell>
                            <Badge variant="secondary" className={row.progressColor}>
                                {row.progress}
                            </Badge>
                        </TableCell>
                        <TableCell>{row.location}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                             row.priority === 1 ? "bg-red-50 text-red-700 border-red-200" :
                             row.priority === 2 ? "bg-orange-50 text-orange-700 border-orange-200" :
                             "bg-blue-50 text-blue-700 border-blue-200"
                          }>
                            {row.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.deliveryEst}</TableCell>
                        <TableCell>{row.subcontractor}</TableCell>
                        <TableCell>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                             ${row.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                               row.status === 'Blocked' ? 'bg-red-100 text-red-800' : 
                               'bg-gray-100 text-gray-800'}`}>
                             {row.status}
                           </span>
                        </TableCell>
                        <TableCell>
                            <Link to={`${createPageUrl('FiberOrdering')}?siteId=${row.facilityId}`}>
                                <Button variant="ghost" size="icon">
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}