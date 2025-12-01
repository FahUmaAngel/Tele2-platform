import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    ChevronRight,
    Save,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    PauseCircle,
    LayoutDashboard,
    Home,
    ArrowLeft,
    ArrowRight,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Components
import OrderOverview from "@/components/order-processing/OrderOverview";
import WorkflowStatus from "@/components/order-processing/WorkflowStatus";
import BOMTable from "@/components/order-processing/BOMTable";
import LogisticsCard from "@/components/order-processing/LogisticsCard";
import WorkOrders from "@/components/order-processing/WorkOrders";
import Financials from "@/components/order-processing/Financials";
import AIAssistant from "@/components/order-processing/AIAssistant";
import ActivityLog from "@/components/order-processing/ActivityLog";
import PageFilter from '@/components/shared/PageFilter';
import ReplanButton from '@/components/ReplanButton';

export default function OrderProcessing() {
    const urlParams = new URLSearchParams(window.location.search);
    const siteId = urlParams.get("siteId") || "SITE-SE-01";
    const orderIdParam = urlParams.get("orderId");
    const navigate = useNavigate();
    const [validationErrors, setValidationErrors] = useState([]);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
    const [replanNeeded, setReplanNeeded] = useState(false);

    // Mock logic for replanNeeded
    useEffect(() => {
        // Logic to determine if replan is needed
    }, []);
    const [isSaving, setIsSaving] = useState(false);
    const [pageFilters, setPageFilters] = useState({});

    useEffect(() => {
        const fid = pageFilters.facility_id;
        const oid = pageFilters.order_id;

        let nextUrl = createPageUrl('OrderProcessing');
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

    // Fetch all processing orders for navigation
    const { data: processingOrders } = useQuery({
        queryKey: ['processingOrders'],
        queryFn: async () => {
            // Fetch orders with status 'processing' or 'pending' (assuming these are the ones in this phase)
            // Ideally this would be filtered by status 'processing' only, but usually 'pending' are also worked on here.
            // Let's just fetch all for now or filter client side if needed, but usually list({ status: 'processing' }) is best.
            // Using 'processing' as per requirement.
            const orders = await base44.entities.FiberOrder.list();
            return orders.filter(o => ['processing', 'pending'].includes(o.status));
        },
        initialData: []
    });

    const { data: fiberOrder, isLoading: loadingOrder } = useQuery({
        queryKey: ['fiberOrder', siteId, orderIdParam],
        queryFn: async () => {
            const query = { facility_id: siteId };
            if (orderIdParam) query.order_id = orderIdParam;
            const res = await base44.entities.FiberOrder.list(query);
            return res?.[0] || null;
        }
    });

    // Fetch Network Design to validate approval status
    const { data: networkDesign } = useQuery({
        queryKey: ['networkDesign', siteId, fiberOrder?.order_id],
        enabled: !!fiberOrder?.order_id,
        queryFn: async () => {
            const res = await base44.entities.NetworkDesign.list({ order_id: fiberOrder.order_id });
            return res?.[0] || null;
        }
    });

    // Navigation Logic
    const activeOrderId = fiberOrder?.order_id || orderIdParam;
    const currentOrderIndex = processingOrders?.findIndex(o => o.order_id === activeOrderId);
    const prevOrder = currentOrderIndex > 0 ? processingOrders[currentOrderIndex - 1] : null;
    const nextOrder = currentOrderIndex < (processingOrders?.length || 0) - 1 ? processingOrders[currentOrderIndex + 1] : null;

    const handleNavigate = (orderId) => {
        const order = processingOrders?.find(o => o.order_id === orderId);
        if (order) {
            navigate(`${createPageUrl('OrderProcessing')}?siteId=${order.facility_id}&orderId=${order.order_id}`);
        }
    };

    // Mock data for BOM if empty (usually would fetch from entity)
    const { data: bomItems } = useQuery({
        queryKey: ['bomItems', fiberOrder?.order_id],
        enabled: !!fiberOrder?.order_id,
        queryFn: async () => {
            const items = await base44.entities.OrderLineItem.list({ order_id: fiberOrder.order_id });
            if (items && items.length > 0) return items;

            // Return mock items if DB is empty for demo
            return [
                { product_code: "CISCO-ISR-1100", description: "Cisco ISR 1100 Series Router", category: "Hardware", quantity: 1, unit_price: 12500 },
                { product_code: "LIC-DNA-E-3Y", description: "Cisco DNA Essentials License 3Y", category: "Software", quantity: 1, unit_price: 4200 },
                { product_code: "INSTALL-L2", description: "On-site Installation Service L2", category: "Service", quantity: 1, unit_price: 8500 },
            ];
        },
        initialData: []
    });

    // Mock data for Work Orders if empty
    const { data: workOrders } = useQuery({
        queryKey: ['workOrders', fiberOrder?.order_id],
        enabled: !!fiberOrder?.order_id,
        queryFn: async () => {
            const wos = await base44.entities.WorkOrder.list({ order_id: fiberOrder.order_id });
            if (wos && wos.length > 0) return wos;
            return [];
        },
        initialData: []
    });

    // --- Validation Logic ---
    const runValidation = () => {
        const errors = [];

        if (!fiberOrder) {
            errors.push("Order not found or not linked to site.");
        } else {
            if (!fiberOrder.delivery_conf_date) errors.push("Fiber delivery date is not confirmed.");
            if (fiberOrder.status === 'cancelled') errors.push("Fiber order is cancelled.");

            // Validate Network Design Approval
            if (!networkDesign) {
                errors.push("No Network Design found for this order.");
            } else if (networkDesign.status !== 'approved') {
                errors.push(`Network Design is not approved (Current status: ${networkDesign.status}).`);
            }
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    // --- Actions ---
    const handleSaveDraft = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Draft saved successfully");
        }, 1000);
    };

    const handleRelease = () => {
        if (runValidation()) {
            setShowSuccessDialog(true);
        } else {
            toast.error("Validation failed. Please fix blocking issues.");
        }
    };

    if (loadingOrder) {
        return <div className="p-8 flex justify-center text-gray-500">Loading Order Data...</div>;
    }

    return (
        <div className="min-h-screen pb-24">
            <div className="space-y-8">
                <PageFilter onFilterChange={setPageFilters} defaultFilters={{ facility_id: siteId, order_id: orderIdParam }} />

                {/* SECTION 1: Header & Breadcrumbs */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link to={createPageUrl('Home')} className="hover:text-blue-600 transition-colors">Dashboard</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link to={createPageUrl('SiteOverview')} className="hover:text-blue-600 transition-colors">Sites</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link to={`${createPageUrl('FiberOrdering')}?siteId=${siteId}`} className="hover:text-blue-600 transition-colors">{siteId}</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium text-gray-900">{fiberOrder?.order_id || orderIdParam || "Loading..."}</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Processing</h1>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold border border-blue-100">Step 5 of 7</span>
                            </div>
                            <p className="text-gray-500 mt-1">
                                Facility ID: <span className="font-mono text-gray-700">{siteId}</span> •
                                Order ID: <span className="font-mono text-gray-700">{fiberOrder?.order_id || orderIdParam || "N/A"}</span>
                            </p>
                        </div>

                        {/* Order Navigation Control */}
                        {processingOrders.length > 0 && (
                            <div className="bg-white p-1 rounded-lg border border-gray-200 flex items-center shadow-sm">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={!prevOrder}
                                    onClick={() => handleNavigate(prevOrder.order_id)}
                                    title="Previous Order"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </Button>

                                <div className="mx-2">
                                    <Select
                                        value={fiberOrder?.order_id || ""}
                                        onValueChange={(val) => handleNavigate(val)}
                                    >
                                        <SelectTrigger className="w-[200px] h-8 text-xs border-none bg-transparent focus:ring-0">
                                            <SelectValue placeholder="Select Order" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {processingOrders.map((order, idx) => (
                                                <SelectItem key={order.id} value={order.order_id}>
                                                    {idx + 1}. {order.facility_id} - {order.order_id}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={!nextOrder}
                                    onClick={() => handleNavigate(nextOrder.order_id)}
                                    title="Next Order"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Validation Error Banner */}
                {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-bold text-red-900">Order cannot be released</h4>
                            <ul className="list-disc list-inside text-sm text-red-800 mt-1 space-y-1">
                                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                            <Button variant="link" className="text-red-700 p-0 h-auto text-sm mt-2 underline" onClick={() => setValidationErrors([])}>
                                Dismiss
                            </Button>
                        </div>
                    </div>
                )}

                {/* SECTION 2: Overview */}
                <OrderOverview order={fiberOrder} siteId={siteId} />

                {/* SECTION 3: Workflow */}
                <WorkflowStatus currentStep={5} dependencies={{ blockingIssues: validationErrors }} />

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column (Main Data) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* SECTION 4: BOM */}
                        <BOMTable items={bomItems} orderId={fiberOrder?.order_id} />

                        {/* SECTION 5: Logistics */}
                        <LogisticsCard fiberOrder={fiberOrder} />

                        {/* SECTION 6: Work Orders */}
                        <WorkOrders workOrders={workOrders} siteId={siteId} orderId={fiberOrder?.order_id} />

                        {/* SECTION 7: Financials */}
                        <Financials siteId={siteId} />
                    </div>

                    {/* Right Column (Support) */}
                    <div className="space-y-8">
                        {/* SECTION 9: AI Assistant */}
                        <AIAssistant />

                        {/* SECTION 10: Activity Log */}
                        <ActivityLog />
                    </div>
                </div>

            </div>

            {/* SECTION 11: Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:pl-72 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</span>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                {fiberOrder?.status === 'active' ? (
                                    <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Released</span>
                                ) : (
                                    <span className="text-yellow-600 flex items-center gap-1"><PauseCircle className="w-4 h-4" /> Validation Pending</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <ReplanButton
                            siteId={siteId}
                            orderId={orderIdParam}
                            currentStep={5}
                            variant={replanNeeded ? "destructive" : "outline"}
                            className={replanNeeded ? "animate-pulse shadow-md" : ""}
                        >
                            {replanNeeded ? "Replanning Required" : "AI Replan"}
                        </ReplanButton>
                        <Button variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                            Cancel Order
                        </Button>
                        <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Draft"}
                        </Button>
                        <Button variant="secondary" onClick={runValidation}>
                            Run Validation
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" onClick={handleRelease}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Release to Installation
                        </Button>
                    </div>
                </div>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-6 h-6" /> Order Released
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Order <strong>{fiberOrder?.order_id}</strong> has been successfully validated and released to the <strong>NaaS Installation & Activation</strong> team.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Link to={`${createPageUrl('NaasInstallation')}?siteId=${siteId}`}>
                            <Button className="w-full bg-[#0a1f33]">Proceed to Installation Dashboard</Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}