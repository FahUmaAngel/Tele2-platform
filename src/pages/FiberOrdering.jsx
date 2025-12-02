import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    ChevronRight,
    Plus,
    Sparkles,
    AlertTriangle,
    Calendar as CalendarIcon,
    Users,
    MapPin,
    CheckCircle2,
    Truck,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ID Management
import { autoBindIDs, parseFacilitySuffix, getNextSuffix } from '@/utils/idManagement';

// Sub-components
import FiberStats from '@/components/fiber/FiberStats';
import FiberOrdersTable from '@/components/fiber/FiberOrdersTable';
// import MapRoutePanel from '@/components/fiber/MapRoutePanel'; // Removed as per request
import DeliveryTimeline from '@/components/fiber/DeliveryTimeline';
import AIInsightsDrawer from '@/components/fiber/AIInsightsDrawer';
import WorkflowTimeline from '@/components/shared/WorkflowTimeline';
import TechnicianAvailability from '@/components/fiber/TechnicianAvailability';
import AIReplanningModal from '@/components/fiber/AIReplanningModal';
import PageFilter from '@/components/shared/PageFilter';
import ReplanButton from '@/components/ReplanButton';

export default function FiberOrdering() {
    const [searchParams] = useSearchParams();
    const siteId = searchParams.get("siteId") || "SITE-SE-01";
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isReplanOpen, setIsReplanOpen] = useState(false);
    const [replanNeeded, setReplanNeeded] = useState(false);

    // Form states
    const [confirmDate, setConfirmDate] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");

    // Filter state
    const [pageFilters, setPageFilters] = useState({
        search: "",
        facility_id: "",
        order_id: "",
        status: "all",
        priority: "all"
    });

    // New Order / Site state
    const [isNewSiteMode, setIsNewSiteMode] = useState(false);
    const [newSiteId, setNewSiteId] = useState("");

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Sync page filters when facility_id is selected
    useEffect(() => {
        const fid = pageFilters.facility_id;
        if (fid && fid !== 'all' && fid !== siteId) {
            // Navigate to update URL, which will update siteId from urlParams on re-render
            navigate(`${createPageUrl('FiberOrdering')}?siteId=${fid}`);
        }
    }, [pageFilters.facility_id, siteId, navigate]);

    // --- Queries ---
    const { data: orders, isLoading } = useQuery({
        queryKey: ['fiber-orders'],
        queryFn: () => base44.entities.FiberOrder.list('-created_date'),
        initialData: []
    });



    // Calculate unique sites and next ID
    const uniqueSites = Array.from(new Set(orders.map(o => o.facility_id))).filter(Boolean).sort();

    useEffect(() => {
        if (isCreateOpen) {
            setIsNewSiteMode(false);
        }
    }, [isCreateOpen]);

    const generateNextSiteId = () => {
        // Use the utility function to get next suffix for Sweden
        const nextSuffix = getNextSuffix('SE', orders);
        return `SITE-SE-${nextSuffix}`;
    };

    const handleAddNewSiteClick = () => {
        setNewSiteId(generateNextSiteId());
        setIsNewSiteMode(true);
    };

    // Mock Site Details (Ideally would fetch from a Site entity)
    const siteDetails = {
        address: "Storgatan 42",
        municipality: "Stockholm",
        priority: 1,
        priorityLabel: "Critical",
        permitLeadTime: 14, // days
        frostConstraint: "Nov 15 - Mar 31"
    };

    const { data: subcontractors } = useQuery({
        queryKey: ['subcontractors'],
        queryFn: () => base44.entities.Subcontractor.list(),
        initialData: []
    });

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        // 1. Site Context Filter
        if (siteId && order.facility_id !== siteId) return false;

        // 2. Page Filters
        const f = pageFilters;
        if (f.facility_id && !order.facility_id?.toLowerCase().includes(f.facility_id.toLowerCase())) return false;
        if (f.order_id && !order.order_id?.toLowerCase().includes(f.order_id.toLowerCase())) return false;
        if (f.status !== 'all' && order.status !== f.status) return false;
        if (f.priority !== 'all' && order.priority.toString() !== f.priority) return false;

        if (f.search) {
            const searchLower = f.search.toLowerCase();
            const match =
                order.client?.toLowerCase().includes(searchLower) ||
                order.address?.toLowerCase().includes(searchLower) ||
                order.facility_id?.toLowerCase().includes(searchLower) ||
                order.order_id?.toLowerCase().includes(searchLower);
            if (!match) return false;
        }

        return true;
    });

    // Primary active order for top-level actions (Fallback logic)
    // Use filteredOrders to ensure we only pick from relevant context
    const primaryOrder = filteredOrders.find(o => !['Completed', 'Delayed', 'cancelled'].includes(o.status)) || filteredOrders[0];
    const activeOrder = selectedOrder || primaryOrder;

    // Check for Replanning Triggers (Delay or Frost)
    useEffect(() => {
        if (activeOrder) {
            const today = new Date();
            const deliveryDate = activeOrder.delivery_est_date ? new Date(activeOrder.delivery_est_date) : null;
            const confirmedDate = activeOrder.delivery_conf_date ? new Date(activeOrder.delivery_conf_date) : null;

            let needsReplan = false;

            // 1. Delay Detection: If confirmed date is significantly later than estimated (> 3 days)
            if (deliveryDate && confirmedDate) {
                const diffTime = confirmedDate - deliveryDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 3) needsReplan = true;
            }

            // 2. Frost Conflict: If scheduled install is in winter (Simple logic: Month is Nov-Mar)
            // In real app, use specific date ranges from siteDetails.frostConstraint
            if (activeOrder.scheduled_date) {
                const installDate = new Date(activeOrder.scheduled_date);
                const month = installDate.getMonth(); // 0-11
                if (month >= 10 || month <= 2) { // Nov, Dec, Jan, Feb, Mar
                    needsReplan = true;
                }
            }

            // 3. Status check
            if (activeOrder.status === 'Delayed' || activeOrder.status === 'Blocked') {
                needsReplan = true;
            }

            setReplanNeeded(needsReplan);
        }
    }, [activeOrder]);

    // --- Mutations ---
    const createOrderMutation = useMutation({
        mutationFn: (data) => base44.entities.FiberOrder.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fiber-orders', siteId] });
            setIsCreateOpen(false);
            toast.success("Fiber Order Created");
        }
    });

    const updateOrderMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.FiberOrder.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fiber-orders', siteId] });
            toast.success("Order Updated Successfully");
        }
    });

    // --- Handlers ---
    const handleCreate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const toastId = toast.loading("Creating order and geocoding address...");

        // Mock AI Estimation logic based on priority/site
        const aiEstDate = new Date();
        const priority = parseInt(formData.get('priority'));
        const daysToAdd = priority === 1 ? 7 : (priority === 2 ? 14 : 21);
        aiEstDate.setDate(aiEstDate.getDate() + daysToAdd);

        const address = formData.get('address') || siteDetails.address;
        const municipality = formData.get('municipality') || siteDetails.municipality;
        const fullAddress = `${address}, ${municipality}`;

        // Geocoding Logic
        let lat = null;
        let lng = null;
        let geocodingStatus = "pending";
        let geocodingSource = null;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
            const results = await response.json();
            if (results && results.length > 0) {
                lat = parseFloat(results[0].lat);
                lng = parseFloat(results[0].lon);
                geocodingStatus = "success";
                geocodingSource = "OpenStreetMap (Nominatim)";
            } else {
                geocodingStatus = "failed";
                geocodingSource = "OpenStreetMap (Nominatim) - No results";
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            geocodingStatus = "failed";
            geocodingSource = "OpenStreetMap (Nominatim) - Error";
        }

        const selectedFacilityId = isNewSiteMode ? newSiteId : formData.get('existing_facility_id');

        // Use autoBindIDs to generate matching OrderID
        const bindResult = autoBindIDs(selectedFacilityId, orders);

        if (!bindResult.success) {
            toast.dismiss(toastId);
            toast.error(bindResult.error);
            return;
        }

        const data = {
            facility_id: selectedFacilityId,
            client: formData.get('client') || "Tele2 Enterprise",
            order_id: bindResult.orderId, // Auto-generated matching ID
            status: 'Planned',
            delay_risk: 'None',
            priority: priority,
            subcontractor: formData.get('subcontractor'),
            delivery_est_date: formData.get('delivery_est_date') || aiEstDate.toISOString().split('T')[0],
            delivery_conf_date: formData.get('delivery_conf_date') || null,
            frost_constraint: siteDetails.frostConstraint,
            permit_lead_time: parseInt(formData.get('permit_lead_time')) || siteDetails.permitLeadTime,
            address: address,
            municipality: municipality,
            site_contact: formData.get('site_contact'),
            pricing_model: formData.get('pricing_model'),
            category: formData.get('category'),
            service_type: formData.get('service_type'),
            requirements: formData.get('requirements'),
            special_hw_needed: formData.get('special_hw_needed') === 'on',
            lift_required: formData.get('lift_required') === 'on',
            install_type: formData.get('install_type'),
            hw_lead_time: parseInt(formData.get('hw_lead_time')) || 0,
            notes: formData.get('notes'),
            lat: lat,
            lng: lng,
            geocoding_status: geocodingStatus,
            geocoding_source: geocodingSource,
            project_manager: formData.get('project_manager') || "Unassigned",
            technician_team: formData.get('technician_team') || "TBD",
            project_start_date: formData.get('project_start_date') || aiEstDate.toISOString().split('T')[0],
            created_date: new Date().toISOString()
        };

        console.log('Event emitted: fiber.order.created', data);

        createOrderMutation.mutate(data, {
            onSuccess: () => {
                // Invalidate all fiber-orders queries to ensure list updates regardless of filter
                queryClient.invalidateQueries({ queryKey: ['fiber-orders'] });

                // If we created a new site, navigate to it
                if (selectedFacilityId !== siteId) {
                    navigate(`${createPageUrl('FiberOrdering')}?siteId=${selectedFacilityId}`);
                }

                toast.dismiss(toastId);
                toast.success(geocodingStatus === 'success' ? "Order created & Geocoded!" : "Order created (Geocoding Failed)");
                setIsCreateOpen(false);
            },
            onError: () => {
                toast.dismiss(toastId);
                toast.error("Failed to create order");
            }
        });
    };

    const handleConfirmDelivery = () => {
        if (!activeOrder) return;

        if (!confirmDate) {
            toast.error("Please select a date");
            return;
        }

        // Calculate Delay Risk
        const aiDate = new Date(activeOrder.delivery_est_date);
        const confDate = new Date(confirmDate);
        const today = new Date();

        let newRisk = "None";

        // If confirmed date is later than AI prediction by > 3 days
        const diffTime = confDate - aiDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 3) {
            newRisk = "At risk";
        }

        // If confirmed date is in the past and not delivered (simplified check)
        if (confDate < today) {
            newRisk = "Delayed"; // Assuming if confirming a past date it might be late
        }

        updateOrderMutation.mutate({
            id: activeOrder.id,
            data: {
                delivery_conf_date: confirmDate,
                status: 'Confirmed',
                delay_risk: newRisk
            }
        });
        setIsConfirmOpen(false);
    };

    const handleScheduleInstallation = () => {
        if (!selectedOrder && !primaryOrder) return;
        const orderToUpdate = selectedOrder || primaryOrder;

        updateOrderMutation.mutate({
            id: orderToUpdate.id,
            data: {
                scheduled_date: scheduleDate,
                status: 'installation_scheduled'
            }
        });
        setIsScheduleOpen(false);
    };

    const handleCompleteWork = (order) => {
        if (confirm('Are you sure fiber work is complete?')) {
            updateOrderMutation.mutate({
                id: order.id,
                data: { status: 'completed' }
            });
        }
    };

    // Select order handler for table
    const handleSelectOrder = (order) => {
        setSelectedOrder(order);
    };

    // Open confirm dialog for primary order
    const openConfirmDialog = (order) => {
        setSelectedOrder(order);
        setConfirmDate(order?.delivery_est_date || "");
        setIsConfirmOpen(true);
    };

    return (
        <div className="min-h-screen pb-20 space-y-6">

            {/* 1. Header */}
            <PageFilter
                onFilterChange={setPageFilters}
                defaultFilters={{ facility_id: siteId }}
            />

            {/* 1. Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link to={createPageUrl('Home')} className="hover:text-blue-600 transition-colors">Dashboard</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link to={createPageUrl('SiteOverview')} className="hover:text-blue-600 transition-colors">Sites</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-gray-900">{siteId}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Fiber Ordering & Delivery</h1>
                            {activeOrder && (
                                <Badge className={activeOrder.priority === 1 ? "bg-red-100 text-red-700 border-red-200" : "bg-blue-100 text-blue-700"}>
                                    Priority: {activeOrder.priority}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {siteDetails.address}, {siteDetails.municipality}
                            </div>
                            <div className="w-px h-4 bg-gray-300" />
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Assigned to: <strong>{primaryOrder?.subcontractor || "Unassigned"}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {/* AI Replanning Button */}
                        <ReplanButton
                            siteId={siteId}
                            orderId={activeOrder?.order_id}
                            currentStep={1}
                            variant={replanNeeded ? "destructive" : "outline"}
                            className={replanNeeded ? "animate-pulse shadow-md" : ""}
                        >
                            {replanNeeded ? "Replanning Required" : "AI Replanning"}
                        </ReplanButton>

                        <Button variant="outline" onClick={() => setIsAiDrawerOpen(true)}>
                            Change Subcontractor
                        </Button>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#0a1f33] hover:bg-[#153250]" onClick={() => setIsCreateOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" /> Create Order
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Fiber Order</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4 mt-2">

                                    {/* Section 1: Site Selection */}
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                                        <Label className="block mb-2 font-semibold">Site Selection</Label>
                                        {!isNewSiteMode ? (
                                            <div className="flex gap-3 items-end">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs text-gray-500">Existing Sites</Label>
                                                    <Select name="existing_facility_id" defaultValue={siteId || uniqueSites[0]}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a Site" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {uniqueSites.map(site => (
                                                                <SelectItem key={site} value={site}>{site}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button type="button" onClick={handleAddNewSiteClick} variant="outline">
                                                    <Plus className="w-4 h-4 mr-2" /> Add New Site
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3 items-end">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs text-gray-500">New Facility ID (Auto-Generated)</Label>
                                                    <Input value={newSiteId} readOnly className="bg-white font-mono text-blue-600 font-bold" />
                                                </div>
                                                <Button type="button" onClick={() => setIsNewSiteMode(false)} variant="ghost">
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section 2: Contact & Address */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Customer Name</Label>
                                            <Input name="client" defaultValue="Tele2 Enterprise" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Site Contact</Label>
                                            <Input name="site_contact" placeholder="Name & Phone" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Address</Label>
                                            <Input name="address" defaultValue={isNewSiteMode ? "" : "Storgatan 42"} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Location (Municipality)</Label>
                                            <Input name="municipality" defaultValue={isNewSiteMode ? "" : "Stockholm"} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Project Manager</Label>
                                            <Input name="project_manager" defaultValue="Anders Svensson" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Technician Team</Label>
                                            <Select name="technician_team" defaultValue="Team Alpha">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Team Alpha">Team Alpha</SelectItem>
                                                    <SelectItem value="Team Beta">Team Beta</SelectItem>
                                                    <SelectItem value="Team Gamma">Team Gamma</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Section 2: Order Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Priority</Label>
                                            <Select name="priority" defaultValue="3">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1 - Critical</SelectItem>
                                                    <SelectItem value="2">2 - High</SelectItem>
                                                    <SelectItem value="3">3 - Medium</SelectItem>
                                                    <SelectItem value="4">4 - Low</SelectItem>
                                                    <SelectItem value="5">5 - Minimal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pricing Model</Label>
                                            <Select name="pricing_model" defaultValue="Fixed Price">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                                                    <SelectItem value="Time & Materials">Time & Materials</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select name="category" defaultValue="Medium">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Small">Small</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="Large">Large</SelectItem>
                                                    <SelectItem value="VIP">VIP</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select name="service_type" defaultValue="fiber">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fiber">Fiber</SelectItem>
                                                    <SelectItem value="naas">NaaS</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Section 3: Execution & Logistics */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Subcontractor</Label>
                                            <Select name="subcontractor" defaultValue="NordGrÃ¤v">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {subcontractors.map(s => (
                                                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                                    ))}
                                                    <SelectItem value="NordGrÃ¤v">NordGrÃ¤v (Best Match)</SelectItem>
                                                    <SelectItem value="Svea Fiber">Svea Fiber</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Installation Type</Label>
                                            <Select name="install_type" defaultValue="Underground">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Underground">Underground</SelectItem>
                                                    <SelectItem value="Aerial">Aerial</SelectItem>
                                                    <SelectItem value="Facade">Facade</SelectItem>
                                                    <SelectItem value="Indoor">Indoor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Permit Lead Time (Days)</Label>
                                            <Input name="permit_lead_time" type="number" defaultValue={siteDetails.permitLeadTime} />
                                        </div>
                                    </div>

                                    {/* Section 4: Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Project Start Date</Label>
                                            <Input name="project_start_date" type="date" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Est. Delivery</Label>
                                            <Input name="delivery_est_date" type="date" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Conf. Delivery (Optional)</Label>
                                            <Input name="delivery_conf_date" type="date" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>HW Lead Time (Days)</Label>
                                            <Input name="hw_lead_time" type="number" defaultValue="0" />
                                        </div>
                                    </div>

                                    {/* Section 5: Requirements & Constraints */}
                                    <div className="space-y-2">
                                        <Label>Customer Requirements</Label>
                                        <Textarea name="requirements" placeholder="Specific requirements..." className="h-16" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                                            <input type="checkbox" id="special_hw_needed" name="special_hw_needed" className="h-4 w-4" />
                                            <Label htmlFor="special_hw_needed" className="cursor-pointer">Special HW Needed</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                                            <input type="checkbox" id="lift_required" name="lift_required" className="h-4 w-4" />
                                            <Label htmlFor="lift_required" className="cursor-pointer">Lift Required</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Notes</Label>
                                        <Textarea name="notes" placeholder="Access codes, site constraints..." />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                        <Button type="submit">Submit Order</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Workflow Timeline */}
            <WorkflowTimeline currentStep={1} />

            {/* Replanning Banner (Conditional) */}
            {replanNeeded && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900">Schedule Conflict Detected</h3>
                            <p className="text-sm text-red-700">
                                Current installation plan conflicts with frost period or delivery delays. AI replanning is recommended.
                            </p>
                        </div>
                    </div>
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white shadow-sm whitespace-nowrap"
                        onClick={() => setIsReplanOpen(true)}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate New Plan (AI)
                    </Button>
                </div>
            )}

            {/* 2. AI Insights Row */}
            <FiberStats activeOrder={activeOrder} onConfirmDelivery={openConfirmDialog} />

            {/* 3. Main Layout: Table + Logistics */}
            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                {/* Left Column: Table (2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                    {/* 5. Timeline & Actions (Contextual to selected order) */}
                    {selectedOrder && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        Order Timeline: {selectedOrder.order_id}
                                        <Badge variant="secondary" className="text-xs">{selectedOrder.status}</Badge>
                                    </h3>
                                </div>

                                <div className="flex gap-2">
                                    {selectedOrder.status === 'processing' && (
                                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => openConfirmDialog(selectedOrder)}>
                                            Confirm Delivery
                                        </Button>
                                    )}
                                    {selectedOrder.status === 'confirmed' && (
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => { setSelectedOrder(selectedOrder); setIsScheduleOpen(true); }}>
                                            Schedule Install
                                        </Button>
                                    )}
                                    {selectedOrder.status === 'installation_scheduled' && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleCompleteWork(selectedOrder)}>
                                            Mark Complete
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <DeliveryTimeline order={selectedOrder} />
                        </div>
                    )}

                    <FiberOrdersTable orders={filteredOrders} onSelectOrder={handleSelectOrder} />
                </div>

                {/* Right Column: Technician Availability (Replaces Map) */}
                <div className="h-full space-y-4">
                    {/* Technician Availability - AI Planning */}
                    <TechnicianAvailability currentOrder={activeOrder} />

                    {/* Scheduling Plan (visible if Confirmed) */}
                    {(activeOrder?.status === 'Confirmed' || activeOrder?.status === 'Installation Scheduled') && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                                <h4 className="font-bold text-sm">Installation Plan</h4>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border border-blue-100 mb-3">
                                <div className="text-xs text-blue-700 mb-1 font-semibold">Recommended Window</div>
                                <div className="text-sm font-mono text-blue-900">
                                    Oct 26 - Oct 30
                                </div>
                                <div className="text-[10px] text-blue-600 mt-1">
                                    Considers: Lead Time (14d) & Frost Constraint
                                </div>
                            </div>
                            {activeOrder.scheduled_date ? (
                                <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                                    <CheckCircle2 className="w-4 h-4" /> Scheduled: {activeOrder.scheduled_date}
                                </div>
                            ) : (
                                <Button size="sm" className="w-full" onClick={() => setIsScheduleOpen(true)}>Schedule Now</Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}

            {/* Confirm Delivery Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delivery with Subcontractor</DialogTitle>
                        <DialogDescription>
                            Subcontractor: <strong>{selectedOrder?.subcontractor}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-3 bg-purple-50 rounded border border-purple-100">
                            <div className="text-xs font-bold text-purple-700 uppercase mb-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI Prediction
                            </div>
                            <div className="text-sm">
                                Most likely delivery: <strong>{selectedOrder?.delivery_est_date}</strong> (94% confidence)
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Confirmed Date</Label>
                            <Input type="date" value={confirmDate} onChange={(e) => setConfirmDate(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmDelivery}>Confirm Date</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Schedule Install Dialog */}
            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Installation</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Select Date</Label>
                            <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                            <p className="text-xs text-gray-500">
                                Must be after delivery date and outside frost constraints.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
                        <Button onClick={handleScheduleInstallation}>Schedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Insights Drawer */}
            <AIInsightsDrawer
                open={isAiDrawerOpen}
                onClose={() => setIsAiDrawerOpen(false)}
                siteId={siteId}
            />

            {/* AI Replanning Modal */}
            <AIReplanningModal
                open={isReplanOpen}
                onOpenChange={setIsReplanOpen}
                order={activeOrder}
                onApplyPlan={async (newPlan) => {
                    // Apply changes via mutation
                    if (activeOrder) {
                        const toastId = toast.loading("Applying new plan...");
                        try {
                            await updateOrderMutation.mutateAsync({
                                id: activeOrder.id,
                                data: {
                                    delivery_est_date: newPlan.deliveryDate,
                                    scheduled_date: null, // Clear invalid schedule
                                    subcontractor: newPlan.subcontractor,
                                    delay_risk: 'None',
                                    status: 'Planned', // Reset to planned
                                    notes: `${activeOrder.notes || ''}\n[AI Replan]: Rescheduled to ${newPlan.installWindow} due to constraints.`
                                }
                            });
                            toast.dismiss(toastId);
                            toast.success("New plan applied successfully!");
                            setIsReplanOpen(false);
                        } catch (error) {
                            toast.dismiss(toastId);
                            toast.error("Failed to apply new plan. Please try again.");
                            console.error("Replan error:", error);
                        }
                    }
                }}
            />

        </div>
    );
}
