import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FiberOrdersTable({ orders, onSelectOrder }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Planned': return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Confirming': return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
      case 'Confirmed': return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      case 'In Transit': return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'Delivered': return 'bg-green-50 text-green-600 border border-green-200';
      case 'Installation Scheduled': return 'bg-purple-50 text-purple-600 border border-purple-200';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'Delayed': return 'bg-red-50 text-red-600 border border-red-200';
      case 'pending': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">Fiber Orders</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs">Filter</Button>
            <Button variant="ghost" size="sm" className="text-xs">Sort by ETA</Button>
          </div>
        </div>
      </CardHeader>
      <div className="overflow-auto flex-1">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[100px]">Order ID</TableHead>
              <TableHead>Subcontractor</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>AI ETA</TableHead>
              <TableHead>Confirmed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => onSelectOrder(order)}>
                <TableCell className="font-mono font-medium text-blue-600 text-xs">
                  {order.order_id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {order.subcontractor?.charAt(0) || "U"}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{order.subcontractor || "Unassigned"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${order.priority === 1 ? 'bg-red-50 text-red-700 border-red-200' :
                      order.priority <= 3 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700'
                    }`}>
                    {order.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {order.delivery_est_date || "-"}
                </TableCell>
                <TableCell className="text-xs">
                  {order.delivery_conf_date ? (
                    <span className="text-green-700 font-medium">{order.delivery_conf_date}</span>
                  ) : (
                    <span className="text-gray-400 italic">Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status === 'In Transit' && <Truck className="w-3 h-3 mr-1" />}
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`${createPageUrl('NaasPreDesign')}?siteId=${order.facility_id}&orderId=${order.order_id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No active fiber orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}