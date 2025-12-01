import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus } from 'lucide-react';
import PageFilter from "@/components/shared/PageFilter";

export default function SiteOverview() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');

  const [filters, setFilters] = useState({
    status: initialStatus || 'All',
    search: ''
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['fiber-orders'],
    queryFn: () => base44.entities.FiberOrder.list(),
  });

  const filteredData = useMemo(() => {
    if (!orders) return [];

    let data = orders.map(order => ({
      id: order.id,
      facilityId: order.facility_id,
      progress: order.progress || '0%',
      progressColor: 'bg-blue-100 text-blue-800', // Placeholder
      location: order.address || 'Unknown',
      category: order.category || 'Fiber',
      priority: order.priority || 3,
      deliveryEst: order.estimated_delivery_date || 'TBD',
      subcontractor: order.subcontractor || 'None',
      status: order.status
    }));

    if (filters.status && filters.status !== 'All') {
      const statusFilters = filters.status.split(',');
      data = data.filter(item => statusFilters.includes(item.status));
    }

    if (filters.search) {
      data = data.filter(item =>
        (item.facilityId && item.facilityId.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    return data;
  }, [orders, filters]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Site Overview</h1>
        <div className="flex items-center gap-4">
          <PageFilter
            filters={filters}
            onFilterChange={setFilters}
            defaultFilters={{ status: initialStatus }}
          />
          <div className="flex gap-3">
            <Link to={createPageUrl('FiberOrdering')}>
              <Button className="bg-[#0a1f33] hover:bg-[#153250]">
                <Plus className="w-4 h-4 mr-2" /> New Site Order
              </Button>
            </Link>
          </div>
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