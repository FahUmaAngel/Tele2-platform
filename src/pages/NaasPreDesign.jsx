import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Components
import PreDesignWorkflow from "@/components/naas/PreDesignWorkflow";
import PreDesignForm from "@/components/naas/PreDesignForm";
import DraftDesignPreview from "@/components/naas/DraftDesignPreview";
import PageFilter from '@/components/shared/PageFilter';

export default function NaasPreDesign() {
  const urlParams = new URLSearchParams(window.location.search);
  const siteId = urlParams.get("siteId") || "SITE-SE-01";
  const orderIdParam = urlParams.get("orderId");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageFilters, setPageFilters] = useState({});

  // Sync page filters when facility_id or order_id is selected
  useEffect(() => {
      const fid = pageFilters.facility_id;
      const oid = pageFilters.order_id;
      
      let nextUrl = createPageUrl('NaasPreDesign');
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
          if (oid !== orderIdParam) hasChanges = true;
      } else if (orderIdParam) {
          params.set('orderId', orderIdParam);
      }

      if (hasChanges) {
          navigate(`${nextUrl}?${params.toString()}`);
      }
  }, [pageFilters, siteId, orderIdParam, navigate]);

  // 1. Fetch Data
  const { data: preDesign, isLoading } = useQuery({
    queryKey: ['naasPreDesign', siteId, orderIdParam],
    queryFn: async () => {
      const query = { facility_id: siteId };
      if (orderIdParam) query.order_id = orderIdParam;
      const res = await base44.entities.NaasPreDesign.list(query);
      return res?.[0] || null;
    }
  });

  const { data: fiberOrder } = useQuery({
    queryKey: ['fiberOrder', siteId, orderIdParam],
    queryFn: async () => {
      const query = { facility_id: siteId };
      if (orderIdParam) query.order_id = orderIdParam;
      const res = await base44.entities.FiberOrder.list(query);
      return res?.[0] || null;
    }
  });

  // 2. Mutations
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Ensure order_id is synced from fiberOrder if available
      const payload = {
          ...data,
          facility_id: siteId,
          order_id: fiberOrder?.order_id || data.order_id
      };

      if (preDesign?.id) {
        return base44.entities.NaasPreDesign.update(preDesign.id, payload);
      } else {
        return base44.entities.NaasPreDesign.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['naasPreDesign', siteId]);
      toast.success("Pre-design parameters saved successfully.");
    }
  });

  const handleGenerateAI = async (params) => {
    setIsGenerating(true);
    // Simulate AI Delay
    setTimeout(() => {
      const mockBOM = params.site_category === 'Small' ? [
         { name: "Cisco Meraki MX68", qty: 1, cost: 8500 },
         { name: "Cisco Meraki MR44 WiFi 6", qty: 2, cost: 4200 }
      ] : params.site_category === 'Medium' ? [
         { name: "Cisco Catalyst 9200L 24P", qty: 1, cost: 15000 },
         { name: "Cisco Catalyst 9115AX AP", qty: 4, cost: 3500 },
         { name: "UPS 1500VA", qty: 1, cost: 2500 }
      ] : [
         { name: "Cisco Catalyst 9300 48P", qty: 2, cost: 35000 },
         { name: "Cisco Catalyst 9120AX AP", qty: 12, cost: 4200 },
         { name: "Fiber Uplink Module 10G", qty: 2, cost: 8000 }
      ];

      setGeneratedDraft({
        site_category: params.category,
        location_type: params.locationType,
        bom: mockBOM
      });
      setIsGenerating(false);
      toast.success("Draft design generated.");
    }, 2000);
  };

  const onSubmit = (data) => {
    saveMutation.mutate(data);
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen pb-24 space-y-8">
      <PageFilter onFilterChange={setPageFilters} defaultFilters={{ facility_id: siteId, order_id: orderIdParam }} />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to={createPageUrl('Home')} className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={createPageUrl('SiteOverview')} className="hover:text-blue-600 transition-colors">Sites</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={createPageUrl('FiberOrdering') + `?siteId=${siteId}`} className="hover:text-blue-600 transition-colors">{siteId}</Link>
          {(preDesign?.order_id || orderIdParam || fiberOrder?.order_id) && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-gray-500">
                    {preDesign?.order_id || orderIdParam || fiberOrder?.order_id}
                </span>
              </>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">NaaS Pre-Design</h1>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold border border-blue-100">Step 2 of 7</span>
             </div>
             <p className="text-gray-500 mt-1">
                Preliminary network design and feasibility assessment.
             </p>
          </div>

          <div className="flex gap-3">
             <Link to={createPageUrl('FiberOrdering') + `?siteId=${siteId}`}>
                <Button variant="outline" className="bg-white">
                   <ArrowLeft className="w-4 h-4 mr-2" /> Back to Fiber
                </Button>
             </Link>
             <Link to={createPageUrl('SiteSurvey') + `?siteId=${siteId}`}>
                <Button className="bg-[#0a1f33] hover:bg-[#153250]">
                   Proceed to Survey <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
             </Link>
          </div>
        </div>
      </div>

      {/* Workflow Timeline */}
      <PreDesignWorkflow currentStep={2} />

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-8">
         {/* Inputs (2 cols) */}
         <div className="lg:col-span-2">
            <PreDesignForm 
              initialData={preDesign} 
              fiberOrder={fiberOrder}
              orderId={orderIdParam}
              onSubmit={onSubmit} 
              isGenerating={isGenerating}
              onGenerateAI={handleGenerateAI}
            />
         </div>

         {/* Outputs (3 cols) */}
         <div className="lg:col-span-3">
            <DraftDesignPreview design={generatedDraft} />
         </div>
      </div>

      {/* Fiber Status Context */}
      {fiberOrder && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 flex justify-between items-center">
           <div>
              <strong>Fiber Status:</strong> {fiberOrder.status}
           </div>
           <div>
              <strong>Est. Delivery:</strong> {fiberOrder.delivery_est_date || "Pending"}
           </div>
        </div>
      )}

    </div>
  );
}