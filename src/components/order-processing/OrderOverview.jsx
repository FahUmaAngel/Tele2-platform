import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OrderOverview({ order, siteId }) {
  if (!order) return null;

  const statusColors = {
    "pending": "bg-gray-100 text-gray-800",
    "processing": "bg-blue-100 text-blue-800",
    "installation": "bg-yellow-100 text-yellow-800",
    "active": "bg-green-100 text-green-800",
    "cancelled": "bg-red-100 text-red-800"
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">Order {order.order_id}</CardTitle>
            <p className="text-sm text-gray-500">{order.address || "No Address"}</p>
          </div>
          <Badge className={statusColors[order.status] || "bg-gray-100"}>
            {order.status?.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Facility</p>
            <p className="font-medium">{order.facility_id}</p>
          </div>
          {/* Customer removed */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Contact</p>
            <p className="font-medium">{order.site_contact || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Pricing</p>
            <p className="font-medium">{order.pricing_model || "Standard"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Priority</p>
            <Badge variant="outline" className={order.priority <= 2 ? "border-red-200 bg-red-50 text-red-700" : ""}>
              Level {order.priority}
            </Badge>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex gap-3 items-start">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-purple-900 text-sm">AI Order Readiness Summary</h4>
            <p className="text-sm text-purple-700 mt-1">
              Fiber dates are confirmed. Frost period constraint is currently inactive (April-Oct). 
              Hardware lead time (15 days) fits within the schedule. Customer approval pending final signature.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to={`${createPageUrl('FiberOrdering')}?siteId=${siteId}`}>
            <Button variant="outline" size="sm" className="h-8">
              <ExternalLink className="w-3 h-3 mr-2" /> Fiber Details
            </Button>
          </Link>
          <Link to={`${createPageUrl('DesignCustomer')}?siteId=${siteId}`}>
            <Button variant="outline" size="sm" className="h-8">
              <ExternalLink className="w-3 h-3 mr-2" /> Design & Pricing
            </Button>
          </Link>
          <Link to={`${createPageUrl('NaasInstallation')}?siteId=${siteId}`}>
             <Button variant="outline" size="sm" className="h-8">
              <ExternalLink className="w-3 h-3 mr-2" /> Installation Plan
            </Button>
          </Link>
          <Link to={`${createPageUrl('CriticalDataStreams')}?siteId=${siteId}`}>
             <Button variant="outline" size="sm" className="h-8">
              <ExternalLink className="w-3 h-3 mr-2" /> Data Streams
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}