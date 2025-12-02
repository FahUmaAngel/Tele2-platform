import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, ArrowLeft, Save, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Components
import DesignOverview from "@/components/design/DesignOverview";
import TechnicalSpecs from "@/components/design/TechnicalSpecs";
import PricingModel from "@/components/design/PricingModel";
import ApprovalTracker from "@/components/design/ApprovalTracker";
import AIInsights from "@/components/design/AIInsights";
import WorkflowTimeline from '@/components/shared/WorkflowTimeline';
import PageFilter from '@/components/shared/PageFilter';
import ReplanButton from '@/components/ReplanButton';

export default function DesignCustomer() {
    const urlParams = new URLSearchParams(window.location.search);
    const siteId = urlParams.get("siteId") || "SITE-SE-01";
    const orderIdParam = urlParams.get("orderId");

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
    const [replanNeeded, setReplanNeeded] = useState(false);
    const [pageFilters, setPageFilters] = useState({});

    // Local State for Design (to allow editing before save)
    const [localDesign, setLocalDesign] = useState(null);

    useEffect(() => {
        const fid = pageFilters.facility_id;
        const oid = pageFilters.order_id;

        let nextUrl = createPageUrl('DesignCustomer');
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

    // --- Data Fetching ---

    // 1. Fetch Fiber Order Data (For Customer/Order Info)
    const { data: fiberOrder } = useQuery({
        queryKey: ['fiberOrder', siteId, orderIdParam],
        queryFn: async () => {
            const query = { facility_id: siteId };
            if (orderIdParam) query.order_id = orderIdParam;
            const res = await base44.entities.FiberOrder.list(query);
            return res?.[0] || null;
        }
    });

    // 2. Fetch Site Survey Data (Existing Source)
    const { data: siteSurvey, isLoading: loadingSurvey } = useQuery({
        queryKey: ['siteSurvey', siteId],
        queryFn: async () => {
            const res = await base44.entities.SiteSurvey.list({ facility_id: siteId });
            return res?.[0] || null; // Return first match or null
        }
    });

    // 2. Fetch Existing Design or Initialize New
    const { data: designData, isLoading: loadingDesign } = useQuery({
        queryKey: ['networkDesign', siteId, orderIdParam],
        queryFn: async () => {
            const query = { facility_id: siteId };
            if (orderIdParam) query.order_id = orderIdParam;
            const res = await base44.entities.NetworkDesign.list(query);
            return res?.[0] || {
                facility_id: siteId,
                order_id: orderIdParam || fiberOrder?.order_id || "", // Initialize with order_id
                status: 'draft',
                version: 1,
                hardware_specs: [],
                pricing: { hardware_total: 0, labor_cost: 0, recurring_monthly: 0, discount: 0, total_upfront: 0 },
                customer_contact: { name: '', email: '', phone: '' },
                approval_history: []
            };
        }
    });

    // Check for replan conditions (e.g. design rejected or revision requested)
    useEffect(() => {
        if (designData) {
            const needsReplan = designData.status === 'revision_requested' || designData.status === 'rejected';
            setReplanNeeded(needsReplan);
        }
    }, [designData]);

    useEffect(() => {
        if (designData) {
            setLocalDesign(designData);
        }
    }, [designData]);

    // --- Mutations ---
    const saveDesignMutation = useMutation({
        mutationFn: async (data) => {
            const payload = {
                ...data,
                order_id: orderIdParam || fiberOrder?.order_id || data.order_id
            };
            if (data.id) {
                return base44.entities.NetworkDesign.update(data.id, payload);
            } else {
                return base44.entities.NetworkDesign.create(payload);
            }
        },
        onSuccess: (savedData) => {
            queryClient.setQueryData(['networkDesign', siteId, orderIdParam], savedData);
            setLocalDesign(savedData);
            toast.success("Design saved successfully");
            setIsSaving(false);
        },
        onError: () => {
            toast.error("Failed to save design");
            setIsSaving(false);
        }
    });

    const handleSave = () => {
        setIsSaving(true);
        saveDesignMutation.mutate(localDesign);
    };

    const handleStatusChange = (newStatus) => {
        const historyEntry = {
            date: new Date().toISOString(),
            action: `Status changed to ${newStatus}`,
            user: 'Amin (Manager)', // Mock user
            comments: newStatus === 'revision_requested' ? 'Customer requested changes to pricing.' : ''
        };

        const updatedDesign = {
            ...localDesign,
            status: newStatus,
            approval_history: [historyEntry, ...(localDesign.approval_history || [])]
        };

        setLocalDesign(updatedDesign);
        saveDesignMutation.mutate(updatedDesign);
    };

    if (loadingSurvey || loadingDesign || !localDesign) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    }

    const isLocked = localDesign.status === 'approved' || localDesign.status === 'locked';

    return (
        <div className="min-h-screen pb-24 bg-gray-50/50">
            <div className="space-y-8">
                <PageFilter onFilterChange={setPageFilters} defaultFilters={{ facility_id: siteId, order_id: orderIdParam }} />

                {/* Header & Breadcrumbs */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link to={createPageUrl('Home')} className="hover:text-blue-600 transition-colors">Dashboard</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link to={createPageUrl('FiberOrdering')} className="hover:text-blue-600 transition-colors">Sites</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link to={`${createPageUrl('FiberOrdering')}?siteId=${siteId}`} className="hover:text-blue-600 transition-colors">{siteId}</Link>
                        {(designData?.order_id || orderIdParam || fiberOrder?.order_id) && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="font-medium text-gray-500">
                                    {designData?.order_id || orderIdParam || fiberOrder?.order_id}
                                </span>
                            </>
                        )}
                        <ChevronRight className="w-4 h-4" />
                        <Link to={`${createPageUrl('SiteSurvey')}?siteId=${siteId}`} className="hover:text-blue-600 transition-colors">Survey</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium text-gray-900">Design & Approval</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Design & Customer Engineering</h1>
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-semibold border border-purple-100">Step 4 of 7</span>
                            </div>
                            <div className="text-gray-500 mt-1 text-sm flex items-center gap-3">
                                <span>Facility ID: <span className="font-mono text-gray-700">{siteId}</span></span>
                                {fiberOrder && (
                                    <>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span>Customer: <span className="font-medium text-gray-900">{fiberOrder.client}</span></span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span>Order: <span className="font-medium text-gray-900">{fiberOrder.order_id}</span></span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <ReplanButton
                                siteId={siteId}
                                orderId={orderIdParam}
                                currentStep={4}
                                variant={replanNeeded ? "destructive" : "outline"}
                                className={replanNeeded ? "animate-pulse shadow-md" : ""}
                            >
                                {replanNeeded ? "Replanning Required" : "AI Replan"}
                            </ReplanButton>
                            <Link to={createPageUrl('SiteSurvey') + `?siteId=${siteId}`}>
                                <Button variant="outline" className="bg-white">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Survey
                                </Button>
                            </Link>
                            <Link to={`${createPageUrl('OrderProcessing')}?siteId=${siteId}`}>
                                <Button className="bg-[#0a1f33] hover:bg-[#153250]">
                                    Next: Order Processing <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Workflow Timeline */}
                <WorkflowTimeline currentStep={4} />

                {/* Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (2/3) - Design & Pricing */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section 1: Imported Survey Data */}
                        <DesignOverview siteSurvey={siteSurvey} loading={loadingSurvey} />

                        {/* Section 2: Technical Design */}
                        <TechnicalSpecs
                            design={localDesign}
                            setDesign={setLocalDesign}
                            readOnly={isLocked}
                        />

                        {/* Section 3: Pricing */}
                        <PricingModel
                            design={localDesign}
                            setDesign={setLocalDesign}
                            readOnly={isLocked}
                        />
                    </div>

                    {/* RIGHT COLUMN (1/3) - Insights & Status */}
                    <div className="space-y-6">
                        {/* Section 4: Approval Tracker */}
                        <ApprovalTracker
                            design={localDesign}
                            onStatusChange={handleStatusChange}
                        />

                        {/* Section 5: AI Insights */}
                        <AIInsights
                            design={localDesign}
                            siteSurvey={siteSurvey}
                        />

                        {/* Sticky Action Panel (Mobile only, or bottom of desktop sidebar) */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                            <h4 className="font-semibold text-sm text-gray-900">Quick Actions</h4>
                            <Button variant="outline" className="w-full justify-start text-xs h-9" disabled={isLocked}>
                                <Save className="w-3 h-3 mr-2" /> Save Draft
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-xs h-9">
                                Export BOM (PDF)
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-xs h-9">
                                Email Quote to Customer
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:pl-72 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">Total Contract Value:</span>{' '}
                        {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(localDesign.pricing?.total_upfront || 0)}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setLocalDesign(designData)} disabled={isSaving || isLocked}>
                            Discard Changes
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving || isLocked} className="bg-blue-600 hover:bg-blue-700">
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save & Update
                        </Button>
                        <Link to={`${createPageUrl('OrderProcessing')}?siteId=${siteId}${orderIdParam ? `&orderId=${orderIdParam}` : ''}`}>
                            <Button className="bg-[#0a1f33] hover:bg-[#153250]">
                                Proceed to Order Processing <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}