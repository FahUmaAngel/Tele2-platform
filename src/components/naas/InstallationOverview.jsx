import React from 'react';
import { 
  Link as LinkIcon, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Info, 
  TrendingUp,
  FileText,
  Network
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function InstallationOverview({ siteId, orderId }) {
  const { data: orders } = useQuery({
    queryKey: ['order', siteId, orderId],
    queryFn: async () => {
        const query = { facility_id: siteId };
        if (orderId) query.order_id = orderId;
        // If orderId is specific, we want that one. If not, we take the latest for the site.
        // list(query, sort, limit)
        return base44.entities.FiberOrder.list(query, '-created_date', 1);
    }
  });
  
  const order = orders?.[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overall Status Card */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200 mb-4 border border-blue-500/30">
                <Clock className="w-3 h-3 mr-1" /> In Progress
              </div>
              <h2 className="text-2xl font-bold mb-2">Installation & Activation Phase</h2>
              <p className="text-slate-300 text-sm max-w-lg">
                Technicians are currently on-site. Hardware mounting is complete, pending configuration and activation tests.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center border-4 border-blue-500/30">
                <span className="text-xl font-bold">65%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
             <Link to={createPageUrl('FiberOrdering') + `?siteId=${siteId}`} className="group">
              <div className="bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors border border-white/10">
                <div className="flex items-center gap-2 mb-1 text-slate-300">
                  <Network className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Fiber Status</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                  <CheckCircle className="w-4 h-4" /> Ready / Lit
                </div>
              </div>
            </Link>

            <Link to={createPageUrl('OrderProcessing') + `?siteId=${siteId}&orderId=${order?.order_id || orderId || ''}`} className="group">
              <div className="bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors border border-white/10">
                <div className="flex items-center gap-2 mb-1 text-slate-300">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Order ID</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  {order?.order_id || orderId || 'N/A'}
                </div>
                {order && (
                  <div className="text-xs text-slate-400 mt-1">
                    Cust: {order.client}
                  </div>
                )}
              </div>
            </Link>

            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-1 text-slate-300">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Est. Completion</span>
              </div>
              <div className="text-sm font-semibold text-white">
                Today, 14:00
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insight Box */}
      <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm">
        <CardContent className="p-6 flex flex-col h-full justify-center">
          <div className="mb-4 p-2 w-fit rounded-lg bg-indigo-100 text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-indigo-950 mb-2">AI Prediction</h3>
          <p className="text-sm text-indigo-800/80 mb-4">
            Based on current progress and technician velocity, installation is likely to finish 
            <span className="font-semibold text-indigo-600"> 45 minutes ahead of schedule</span>.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                View Velocity Details
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Installation Velocity Metrics</DialogTitle>
                <DialogDescription>
                  Real-time analysis of technician progress and task completion rates.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="text-xs text-indigo-600 uppercase font-medium">Current Velocity</div>
                    <div className="text-2xl font-bold text-indigo-900">2.5 <span className="text-sm font-normal text-indigo-700">tasks/hr</span></div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-xs text-green-600 uppercase font-medium">Efficiency Score</div>
                    <div className="text-2xl font-bold text-green-900">94%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Stage Breakdown</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Hardware Mounting</span>
                      <span className="font-medium text-green-600">Completed (45m ahead)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cabling</span>
                      <span className="font-medium text-blue-600">In Progress (On Track)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Configuration</span>
                      <span className="text-gray-400">Pending</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Projection based on last 3 site installations by this team.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}