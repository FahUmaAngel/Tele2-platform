import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Construction, 
  Server, 
  ShieldCheck, 
  FileText, 
  Download,
  Share2,
  PlayCircle,
  Activity
} from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import NetworkHealthMonitor from '@/components/rfs/NetworkHealthMonitor';
import CustomerAcceptance from '@/components/rfs/CustomerAcceptance';
import InvoicingPanel from '@/components/rfs/InvoicingPanel';
import WorkflowTimeline from '@/components/shared/WorkflowTimeline';
import PageFilter from '@/components/shared/PageFilter';

export default function Rfs() {
  const urlParams = new URLSearchParams(window.location.search);
  const siteId = urlParams.get("siteId") || "SITE-SE-01";
  const orderId = urlParams.get("orderId");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("health");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [pageFilters, setPageFilters] = useState({});

  useEffect(() => {
      const fid = pageFilters.facility_id;
      const oid = pageFilters.order_id;
      
      let nextUrl = createPageUrl('Rfs');
      let params = new URLSearchParams();
      let hasChanges = false;

      if (fid && fid !== 'all') {
          params.set('siteId', fid);
          if (fid !== siteId) hasChanges = true;
      } else {
          params.set('siteId', siteId);
      }

      if (oid && oid !== 'all') {
          params.set('orderId', oid);
          if (oid !== orderId) hasChanges = true;
      } else if (orderId) {
          params.set('orderId', orderId);
      }

      if (hasChanges) {
          navigate(`${nextUrl}?${params.toString()}`);
      }
  }, [pageFilters, siteId, orderId, navigate]);

  // --- Data Fetching ---
  const { data: rfsReport } = useQuery({
    queryKey: ['rfsReport', siteId],
    queryFn: async () => {
      const reports = await base44.entities.RfsReport.list({ facility_id: siteId }, '-completion_date', 1);
      return reports?.[0] || null;
    }
  });

  const { data: fiberOrder } = useQuery({
    queryKey: ['fiberOrder', siteId, orderId],
    queryFn: async () => {
      const query = { facility_id: siteId };
      if (orderId) query.order_id = orderId;
      const orders = await base44.entities.FiberOrder.list(query);
      return orders?.[0] || { 
        client: "Unknown Client", 
        address: "Unknown Address", 
        municipality: "Unknown" 
      };
    }
  });

  // --- Mutations ---
  const createOrUpdateReport = useMutation({
    mutationFn: async (data) => {
      if (rfsReport) {
        return base44.entities.RfsReport.update(rfsReport.id, data);
      } else {
        return base44.entities.RfsReport.create({ ...data, facility_id: siteId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rfsReport', siteId]);
    }
  });

  const handleHealthUpdate = (healthData) => {
    // In a real app, we might save this periodically or on significant change
    // For now, we just use local state in the child component mostly, 
    // but let's save the score if it's the first time or significantly different
    // Always update report with latest health data
    createOrUpdateReport.mutate({
        health_score: healthData.score,
        anomalies_detected: healthData.anomalies,
        predictive_failure_prob: healthData.probability,
        kpi_metrics: healthData.kpis
    });
  };

  const handleSignOff = (signOffData) => {
    createOrUpdateReport.mutate({
      customer_signature: signOffData.name,
      customer_comments: signOffData.comments,
      signed_at: signOffData.signedAt,
      rfs_status: "ready" // Move to ready status
    });
    toast.success("Customer acceptance recorded successfully");
    setActiveTab("invoice");
  };

  const handleGenerateInvoice = () => {
    createOrUpdateReport.mutate({
      invoice_status: "generated"
    });
    toast.success("Invoice generated and sent to finance");
  };

  const handleCompleteRfs = () => {
    if (rfsReport?.health_score < 90) {
      toast.error("Cannot finalize: Network Health Score must be > 90.");
      return;
    }
    if (!rfsReport?.customer_signature) {
      toast.error("Cannot finalize: Customer Acceptance is missing.");
      return;
    }

    createOrUpdateReport.mutate({
      rfs_status: "completed",
      completion_date: new Date().toISOString()
    });
    setShowCompletionDialog(true);
  };

  const isRfsReady = rfsReport?.customer_signature && rfsReport?.health_score > 80;

  return (
    <div className="space-y-8 pb-20">
      <PageFilter onFilterChange={setPageFilters} defaultFilters={{ facility_id: siteId, order_id: orderId }} />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to={createPageUrl('Home')} className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <Link to={createPageUrl('SiteOverview')} className="hover:text-blue-600 transition-colors">
            Sites
          </Link>
          <span className="text-gray-300">/</span>
          <Link to={createPageUrl('NaasInstallation') + `?siteId=${siteId}&orderId=${orderId || ''}`} className="hover:text-blue-600 transition-colors">
            {siteId}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-900">{orderId || "Select Order"}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Ready For Service (RFS)
              </h1>
              {rfsReport?.rfs_status === 'completed' && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                 Order ID: <span className="font-semibold text-gray-900">{fiberOrder?.order_id || orderId || "N/A"}</span>
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="flex items-center gap-1">
                <Server className="w-4 h-4" /> Site ID: <span className="font-semibold text-gray-900">{siteId}</span>
              </span>
            </div>
          </div>

          <div className="flex gap-3">
             <Link to={createPageUrl('NaasInstallation') + `?siteId=${siteId}&orderId=${orderId || fiberOrder?.order_id || ''}`}>
                <Button variant="outline" className="bg-white">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Installation
                </Button>
             </Link>
             <Button variant="outline" className="bg-white">
               <Share2 className="w-4 h-4 mr-2" /> Share Report
             </Button>
             <Button 
               className={`${rfsReport?.rfs_status === 'completed' ? 'bg-gray-100 text-gray-400' : 'bg-[#0a1f33] hover:bg-[#153250]'}`}
               disabled={!isRfsReady || rfsReport?.rfs_status === 'completed'}
               onClick={handleCompleteRfs}
             >
               <PlayCircle className="w-4 h-4 mr-2" /> 
               {rfsReport?.rfs_status === 'completed' ? "RFS Completed" : "Finalize RFS"}
             </Button>
          </div>
        </div>
      </div>

      {/* Workflow Timeline */}
      <WorkflowTimeline currentStep={7} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white p-1 border border-gray-200 rounded-lg w-full md:w-auto flex-wrap h-auto">
          <TabsTrigger value="health" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Activity className="w-4 h-4 mr-2" /> Network Health (AI)
          </TabsTrigger>
          <TabsTrigger value="acceptance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <ShieldCheck className="w-4 h-4 mr-2" /> Customer Acceptance
          </TabsTrigger>
          <TabsTrigger value="invoice" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <FileText className="w-4 h-4 mr-2" /> Invoicing & Completion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">AI-Driven Network Monitoring</h3>
              <p className="text-sm text-blue-700">
                Real-time telemetry analysis is active. The AI model is monitoring for anomalies and predictive failure patterns.
                Ensure Health Score is above 90 before requesting customer sign-off.
              </p>
            </div>
          </div>
          
          <NetworkHealthMonitor 
            siteId={siteId} 
            onHealthUpdate={handleHealthUpdate} 
          />
        </TabsContent>

        <TabsContent value="acceptance" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="grid md:grid-cols-3 gap-8">
             <div className="md:col-span-2 space-y-6">
               <CustomerAcceptance 
                 onSignOff={handleSignOff} 
                 isSigned={!!rfsReport?.customer_signature}
                 signedData={rfsReport}
               />
             </div>
             <div className="space-y-6">
               <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                 <h3 className="font-semibold mb-4">Pre-Acceptance Checklist</h3>
                 <ul className="space-y-3">
                   {[
                     { label: "Physical Installation Verified", done: true },
                     { label: "Power & Cooling Tests", done: true },
                     { label: "Network Health Score > 90", done: (rfsReport?.health_score || 0) > 90 },
                     { label: "Failover Redundancy Test", done: true },
                     { label: "Port Configuration Audit", done: true }
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm">
                       <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                         <CheckCircle2 className="w-3 h-3" />
                       </div>
                       <span className={item.done ? 'text-gray-900' : 'text-gray-500'}>{item.label}</span>
                     </li>
                   ))}
                 </ul>
               </div>
             </div>
           </div>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid md:grid-cols-2 gap-8">
            <InvoicingPanel 
              status={rfsReport?.invoice_status} 
              onGenerateInvoice={handleGenerateInvoice}
              rfsReady={!!rfsReport?.customer_signature}
            />
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold mb-4">Completion Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Installation Phase</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Network Validation</span>
                    <Badge className={rfsReport?.health_score > 90 ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}>
                      {rfsReport?.health_score > 90 ? "Passed" : "Review Needed"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Customer Acceptance</span>
                    <Badge className={rfsReport?.customer_signature ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-100"}>
                      {rfsReport?.customer_signature ? "Signed" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Final Invoice</span>
                    <Badge className={rfsReport?.invoice_status === 'generated' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-100"}>
                      {rfsReport?.invoice_status === 'generated' ? "Sent" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" /> RFS Completed Successfully
            </DialogTitle>
            <DialogDescription className="pt-2">
              The site <strong>{siteId}</strong> is now officially live and marked as Ready For Service.
              <br /><br />
              • Operations team notified<br />
              • Billing cycle activated<br />
              • Warranty period started
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Link to={createPageUrl('Home')}>
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}