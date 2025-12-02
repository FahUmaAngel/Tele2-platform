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
      deliveryEst: order.delivery_est_date || 'TBD',
      subcontractor: order.subcontractor || 'None',
      status: order.status
    }));

    // Filter by Facility ID
    if (filters.facility_id && filters.facility_id !== 'all') {
      data = data.filter(item => item.facilityId === filters.facility_id);
    }

    // Filter by Order ID
    if (filters.order_id && filters.order_id !== 'all') {
      // We need to match against the order_id from the raw data, but we didn't map it.
      // Let's check the raw orders for the match since we have the index or just filter the source first?
      // Better: add order_id to the mapped object.
      // Re-mapping above to include orderId
    }

    // Actually, let's re-map correctly above to include the order_id for filtering.
    // Since I can't change the map block easily in this thought process without rewriting the whole file content string,
    // I will rewrite the map block in the file content below.

    if (filters.status && filters.status !== 'all') {
      data = data.filter(item => item.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      data = data.filter(item => String(item.priority) === String(filters.priority));
    }

    if (filters.search) {
      data = data.filter(item =>
        (item.facilityId && item.facilityId.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    return data;
  }, [orders, filters]);

  // Wait, I need to fix the map function to include order_id for the filter to work if I filter by it.
  // The PageFilter passes 'order_id' which corresponds to 'order.order_id' (e.g. ORD-2025-01).
  // The mapped object has 'id' which is the DB ID.
  // I should add 'orderId' to the mapped object.

  const refinedFilteredData = useMemo(() => {
    if (!orders) return [];

    let data = orders.map(order => ({
      id: order.id,
      orderId: order.order_id, // Added for filtering
      facilityId: order.facility_id,
      progress: order.progress || '0%',
      progressColor: 'bg-blue-100 text-blue-800',
      location: order.address || 'Unknown',
      category: order.category || 'Fiber',
      priority: order.priority || 3,
      deliveryEst: order.delivery_est_date || 'TBD',
      subcontractor: order.subcontractor || 'None',
      status: order.status
    }));

    if (filters.facility_id && filters.facility_id !== 'all') {
      data = data.filter(item => item.facilityId === filters.facility_id);
    }

    if (filters.order_id && filters.order_id !== 'all') {
      data = data.filter(item => item.orderId === filters.order_id);
    }

    if (filters.status && filters.status !== 'all') {
      data = data.filter(item => item.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      data = data.filter(item => String(item.priority) === String(filters.priority));
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
                {refinedFilteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24 text-gray-500">
                      No sites found.
                    </TableCell>
                  </TableRow>
                ) : (
                  refinedFilteredData.map((row) => (
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