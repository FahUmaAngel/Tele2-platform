import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronRight, MessageSquare, CheckCircle2, Circle, Search, LayoutList, List, Filter, Calendar as CalendarIcon, Clock } from "lucide-react";
import { addDays, format, differenceInDays, startOfWeek, eachDayOfInterval, isSameDay, isValid, isWithinInterval, addMonths, startOfMonth, endOfMonth, eachMonthOfInterval, eachWeekOfInterval } from 'date-fns';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// Helper to ensure date is valid object
const safeDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isValid(d) ? d : null;
};

const STAGES = [
    { id: 'fiber_ordering', label: 'Fiber order & delivery', color: 'bg-emerald-500', duration: 16 },
    { id: 'naas_design', label: 'NaaS Pre-design', color: 'bg-blue-500', duration: 12 },
    { id: 'site_survey', label: 'Site-Survey & Documentation', color: 'bg-amber-500', duration: 15 },
    { id: 'design_customer', label: 'Design & Customer Eng.', color: 'bg-indigo-500', duration: 12 },
    { id: 'order_processing', label: 'Order Processing', color: 'bg-pink-500', duration: 10 },
    { id: 'naas_installation', label: 'NaaS Installation', color: 'bg-purple-600', duration: 9 },
];

export default function SiteProgressV2() {
    const { toast } = useToast();
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'detailed'
    
    // Message Modal State
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [activeMessageSite, setActiveMessageSite] = useState(null);
    const [messageText, setMessageText] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        facility: 'all',
        order: 'all',
        status: 'all',
        priority: 'all',
        dateRange: undefined
    });

    // Progress-based view - no calendar timeline needed

    const { data: fiberOrders } = useQuery({
        queryKey: ['fiber-orders-progress'],
        queryFn: () => base44.entities.FiberOrder.list()
    });

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleOpenMessage = (site) => {
        setActiveMessageSite(site);
        setMessageText('');
        setIsMessageOpen(true);
    };

    const handleSendMessage = () => {
        toast({
            title: "Message Sent",
            description: `Message sent to site ${activeMessageSite?.name}`,
        });
        setIsMessageOpen(false);
    };

    const sites = useMemo(() => {
        if (!fiberOrders) return [];

        return fiberOrders.map(order => {
            const startDate = safeDate(order.project_start_date) || safeDate(order.created_date) || new Date();
            
            // Create a simple hash from facility_id for consistent variation
            const hash = order.facility_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            
            // Generate phases with varied durations based on order characteristics
            let currentOffset = 0;
            const phases = STAGES.map((stage, idx) => {
                // Add variation to duration based on:
                // 1. Priority (higher priority = faster phases)
                // 2. Hash of facility_id (for consistent randomness)
                // 3. Stage type
                const priorityFactor = order.priority ? (6 - order.priority) / 5 : 1; // 1-5 priority, inverted
                const hashVariation = ((hash + idx * 7) % 5) - 2; // -2 to +2 days variation
                const baseDuration = stage.duration;
                
                // Calculate varied duration (keep it reasonable)
                let variedDuration = Math.round(baseDuration * (0.8 + priorityFactor * 0.4) + hashVariation);
                variedDuration = Math.max(5, Math.min(25, variedDuration)); // Clamp between 5-25 days
                
                const start = addDays(startDate, currentOffset);
                const end = addDays(start, variedDuration);
                currentOffset += variedDuration + 2; 
                
                return {
                    ...stage,
                    duration: variedDuration, // Use varied duration
                    start,
                    end,
                    dayRange: `D${differenceInDays(start, startDate)}-${differenceInDays(end, startDate)}`
                };
            });

            const installDate = phases[phases.length - 1].end;
            const totalDays = differenceInDays(installDate, startDate);
            
            // Use actual progress from order data, or calculate from status
            let progress = 0;
            if (order.progress) {
                // If progress field exists, parse it (e.g., "45%")
                progress = parseInt(order.progress) || 0;
            } else {
                // Otherwise, estimate from status
                const statusProgress = {
                    'Completed': 100,
                    'Delivered': 90,
                    'In Transit': 70,
                    'Confirming': 50,
                    'Delayed': 30,
                    'pending': 10
                };
                progress = statusProgress[order.status] || 20;
            }
            
            // Use actual priority from order data
            const priorityMap = {
                1: 'High',
                2: 'High',
                3: 'Medium',
                4: 'Low',
                5: 'Low'
            };
            const priority = priorityMap[order.priority] || 'Medium';

            const currentProgressDate = addDays(startDate, Math.floor((progress / 100) * totalDays));

            return {
                id: order.facility_id,
                name: `${order.facility_id} - ${order.address || order.facility_id}`,
                location: order.city || 'Stockholm',
                status: order.status || 'Planned',
                priority,
                progress,
                phases,
                totalDays,
                installDate,
                startDate,
                currentProgressDate,
                raw: order
            };
        }).filter(site => {
            // Apply Filters
            if (filters.search) {
                const s = filters.search.toLowerCase();
                if (!site.name.toLowerCase().includes(s) && 
                    !site.id.toLowerCase().includes(s) && 
                    !site.location.toLowerCase().includes(s)) {
                    return false;
                }
            }
            if (filters.facility !== 'all' && site.id !== filters.facility) return false;
            if (filters.order !== 'all' && site.id !== filters.order) return false; 
            if (filters.status !== 'all' && site.status !== filters.status) return false;
            if (filters.priority !== 'all' && site.priority !== filters.priority) return false;

            // Date Range Filter
            if (filters.dateRange?.from) {
                const { from, to } = filters.dateRange;
                if (to) {
                    if (!isWithinInterval(site.startDate, { start: from, end: to })) return false;
                } else {
                    if (site.startDate < from) return false;
                }
            }

            return true;
        });
    }, [fiberOrders, filters]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, viewMode]);

    // Pagination Logic
    const totalPages = Math.ceil(sites.length / itemsPerPage);
    const paginatedSites = sites.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    // Handle View Mode Change
    useEffect(() => {
        if (viewMode === 'detailed') {
            const allIds = new Set(sites.map(s => s.id));
            setExpandedRows(allIds);
        } else {
            setExpandedRows(new Set());
        }
    }, [viewMode, sites.length]); 

    // Calculate phase position as percentage of total project duration
    const getPhasePosition = (phases, phaseIndex, totalDays) => {
        let leftPercent = 0;
        
        // Sum up durations of all previous phases
        for (let i = 0; i < phaseIndex; i++) {
            leftPercent += (phases[i].duration / totalDays) * 100;
        }
        
        const widthPercent = (phases[phaseIndex].duration / totalDays) * 100;
        
        return { left: `${leftPercent}%`, width: `${widthPercent}%` };
    };

    // Calculate progress bar position based on phase timeline
    const getProgressPosition = (progress, phases, totalDays) => {
        if (progress >= 100) return 100;
        if (progress <= 0) return 0;
        
        // Calculate which phase we're in based on progress
        // Each phase represents an equal portion of the overall progress
        const phaseIndex = Math.min(
            phases.length - 1,
            Math.floor((progress / 100) * phases.length)
        );
        
        // Calculate progress within the current phase (0-1)
        const phaseProgress = ((progress / 100) * phases.length) % 1;
        
        // Calculate cumulative days up to current phase
        let cumulativeDays = 0;
        for (let i = 0; i < phaseIndex; i++) {
            cumulativeDays += phases[i].duration;
        }
        
        // Add progress within current phase
        const currentPhaseDays = cumulativeDays + (phaseProgress * phases[phaseIndex].duration);
        
        // Convert to percentage of total days
        return (currentPhaseDays / totalDays) * 100;
    };

    // Unique values for filters
    const uniqueFacilities = useMemo(() => [...new Set(fiberOrders?.map(o => o.facility_id) || [])], [fiberOrders]);
    const uniqueStatuses = useMemo(() => [...new Set(fiberOrders?.map(o => o.status || 'Planned') || [])], [fiberOrders]);

    return (
        <TooltipProvider>
            <div className="p-6 bg-gray-50 min-h-screen font-sans space-y-6">
                
                {/* Page Header */}
                <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium text-gray-900">Site Progress</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Site Progress</h1>
                            <p className="text-gray-500 text-sm">Track fiber delivery status and installation phases across all sites.</p>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1 text-sm bg-white border border-gray-200 shadow-sm">
                            {sites.length} Active Sites
                        </Badge>
                    </div>
                </div>

                {/* Top Bar: Filters & View Toggle */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
                    
                    {/* Filters Group */}
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="relative w-48">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search sites..." 
                                className="pl-8 h-9" 
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>

                        {/* Date Range Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal h-9",
                                        !filters.dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.dateRange?.from ? (
                                        filters.dateRange.to ? (
                                            <>
                                                {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                                                {format(filters.dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(filters.dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={filters.dateRange?.from}
                                    selected={filters.dateRange}
                                    onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        <Select value={filters.facility} onValueChange={(v) => setFilters(prev => ({ ...prev, facility: v }))}>
                            <SelectTrigger className="w-[130px] h-9">
                                <div className="flex items-center gap-2 truncate">
                                    <Filter className="w-3 h-3 text-gray-400" />
                                    <SelectValue placeholder="Facility" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Facilities</SelectItem>
                                {uniqueFacilities.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={filters.order} onValueChange={(v) => setFilters(prev => ({ ...prev, order: v }))}>
                            <SelectTrigger className="w-[120px] h-9">
                                 <div className="flex items-center gap-2 truncate">
                                    <Filter className="w-3 h-3 text-gray-400" />
                                    <SelectValue placeholder="Order" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Orders</SelectItem>
                                {uniqueFacilities.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                            <SelectTrigger className="w-[120px] h-9">
                                 <div className="flex items-center gap-2 truncate">
                                    <Filter className="w-3 h-3 text-gray-400" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={filters.priority} onValueChange={(v) => setFilters(prev => ({ ...prev, priority: v }))}>
                            <SelectTrigger className="w-[120px] h-9">
                                 <div className="flex items-center gap-2 truncate">
                                    <Filter className="w-3 h-3 text-gray-400" />
                                    <SelectValue placeholder="Priority" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* View Controls */}
                    <div className="flex flex-col gap-2 items-end">

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setViewMode('overview')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <LayoutList className="w-4 h-4" />
                                Overview
                            </button>
                            <button
                                onClick={() => setViewMode('detailed')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'detailed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <List className="w-4 h-4" />
                                Detailed
                            </button>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 px-1 py-2 bg-white border border-gray-200 rounded-lg text-xs">
                    <span className="font-semibold text-gray-700 mr-2">Legend:</span>
                    {STAGES.map(stage => (
                        <div key={stage.id} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                            <span className="text-gray-600">{stage.label}</span>
                        </div>
                    ))}
                </div>

                {/* Timeline Header - REMOVED as per request */}
                {/* <div className="flex mb-4 pl-[300px] pr-12 relative text-xs text-gray-500 font-medium border-b border-gray-200 pb-2 h-8">
                    {headers.map((h, i) => (
                        <div 
                            key={i} 
                            className="absolute transform -translate-x-1/2 flex flex-col items-center"
                            style={{ left: `${(h.dayIndex / timelineDays) * 100}%` }}
                        >
                            <span>{h.label}</span>
                            {h.subLabel && <span className="text-[10px] text-gray-400">{h.subLabel}</span>}
                        </div>
                    ))}
                </div> */}

                <div className="space-y-4">
                    {paginatedSites.map(site => {
                        const isExpanded = expandedRows.has(site.id);

                        return (
                            <Card key={site.id} className="overflow-hidden border-gray-200 shadow-sm">
                                {/* Main Row */}
                                <div className="flex items-center h-20 hover:bg-gray-50 transition-colors group">
                                    {/* Left Info Panel */}
                                    <div className="w-[300px] flex-shrink-0 flex items-center px-4 gap-3 border-r border-gray-100 h-full bg-white z-10">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-gray-400 hover:text-gray-600"
                                            onClick={() => toggleRow(site.id)}
                                        >
                                            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </Button>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-gray-900 truncate">{site.id}</div>
                                            <div className="text-xs text-gray-600 truncate">{site.raw.address || site.id}</div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                                <span className="truncate">{site.location}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className={`font-medium ${site.priority === 'High' ? 'text-red-500' : site.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`}>
                                                    {site.priority}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-24">
                                            <span className="text-xs font-bold text-gray-700">{site.progress}%</span>
                                            <Progress value={site.progress} className="h-2" />
                                        </div>
                                    </div>

                                    {/* Progress Bar Area */}
                                    <div className="flex-1 h-full relative px-4 overflow-hidden">
                                        {/* Percentage markers */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {[0, 25, 50, 75, 100].map((percent) => (
                                                <div 
                                                    key={percent} 
                                                    className="absolute h-full border-r border-gray-100"
                                                    style={{ left: `${percent}%` }}
                                                />
                                            ))}
                                        </div>

                                        {/* Phase Bars */}
                                        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                                            {site.phases.map((phase, idx) => {
                                                const pos = getPhasePosition(site.phases, idx, site.totalDays);
                                                const phaseProgressPercent = ((idx + 1) / site.phases.length) * 100;
                                                const isCompleted = site.progress >= phaseProgressPercent;
                                                const opacityClass = isCompleted ? 'opacity-40' : 'opacity-90 hover:opacity-100';

                                                return (
                                                    <Popover key={idx}>
                                                        <PopoverTrigger asChild>
                                                            <div 
                                                                className={`absolute h-4 rounded-sm ${phase.color} ${opacityClass} transition-opacity cursor-pointer`}
                                                                style={{ left: pos.left, width: pos.width }}
                                                            />
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-2">
                                                            <div className="text-xs">
                                                                <p className="font-semibold mb-1">{phase.label}</p>
                                                                <p className="text-gray-500">
                                                                    {format(phase.start, 'MMM d, yyyy')} - {format(phase.end, 'MMM d, yyyy')}
                                                                </p>
                                                                <p className="text-gray-400 text-[10px] mt-1">
                                                                    Duration: {phase.duration} days
                                                                </p>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                );
                                            })}
                                            
                                            {/* Blue Progress Line */}
                                            {site.progress < 100 && (
                                                <div 
                                                    className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-30 shadow-[0_0_4px_rgba(59,130,246,0.5)]"
                                                    style={{ left: `${Math.min(100, Math.max(0, getProgressPosition(site.progress, site.phases, site.totalDays)))}%` }}
                                                />
                                            )}
                                            
                                            {/* Red Install Date Line */}
                                            <div 
                                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                                                style={{ left: '100%' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Actions */}
                                    <div className="w-48 flex-shrink-0 flex flex-col justify-center items-end px-4 gap-1 border-l border-gray-100 h-full bg-white z-10">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-gray-600 border-gray-200 font-normal text-[10px]">
                                                {site.totalDays} Days
                                            </Badge>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 text-gray-400 hover:text-gray-600"
                                                onClick={() => handleOpenMessage(site)}
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            Install: {format(site.installDate, 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 bg-white">
                                        {site.phases.map((phase, idx) => {
                                            const isCompleted = site.progress > ((idx + 1) / site.phases.length) * 100; 

                                            return (
                                                <div key={idx} className="flex items-center h-12 hover:bg-gray-50/50 transition-colors">
                                                    {/* Left Label */}
                                                    <div className="w-[300px] flex-shrink-0 flex items-center px-12 gap-3 border-r border-gray-100 h-full">
                                                        {isCompleted ? 
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : 
                                                            <Circle className="h-4 w-4 text-gray-300" />
                                                        }
                                                        <span className="text-sm text-gray-600">{phase.label}</span>
                                                        {phase.id === 'naas_installation' && (
                                                            <Badge className="ml-auto bg-purple-100 text-purple-600 hover:bg-purple-200 border-none h-5 text-[10px]">M</Badge>
                                                        )}
                                                    </div>

                                                    {/* Progress Bar Row */}
                                                    <div className="flex-1 h-full relative px-4 overflow-hidden">
                                                         {/* Percentage markers (faint) */}
                                                        <div className="absolute inset-0 flex pointer-events-none">
                                                            {[0, 25, 50, 75, 100].map((percent) => (
                                                                <div 
                                                                    key={percent} 
                                                                    className="absolute h-full border-r border-gray-50"
                                                                    style={{ left: `${percent}%` }}
                                                                />
                                                            ))}
                                                        </div>

                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <div 
                                                                    className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-md ${phase.color} cursor-pointer ${isCompleted ? 'opacity-40' : 'hover:opacity-90'} transition-opacity`}
                                                                    style={{ left: getPhasePosition(site.phases, idx, site.totalDays).left, width: getPhasePosition(site.phases, idx, site.totalDays).width }}
                                                                />
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-2">
                                                                <div className="text-xs">
                                                                    <p className="font-semibold mb-1">{phase.label}</p>
                                                                    <p className="text-gray-500">
                                                                        {format(phase.start, 'MMM d, yyyy')} - {format(phase.end, 'MMM d, yyyy')}
                                                                    </p>
                                                                    <p className="text-gray-400 text-[10px] mt-1">
                                                                        Duration: {phase.duration} days
                                                                    </p>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                        
                                                        {/* Blue Progress Line in Detailed View */}
                                                        {site.progress < 100 && (
                                                            <div 
                                                                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-30 shadow-[0_0_4px_rgba(59,130,246,0.5)]"
                                                                style={{ left: `${Math.min(100, Math.max(0, getProgressPosition(site.progress, site.phases, site.totalDays)))}%` }}
                                                            />
                                                        )}
                                                        
                                                        {/* Red Install Date Line in Detailed View */}
                                                        <div 
                                                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                                                            style={{ left: '100%' }}
                                                        />
                                                    </div>

                                                    {/* Right Info */}
                                                    <div className="w-48 flex-shrink-0 flex items-center justify-end px-4 border-l border-gray-100 h-full text-xs text-gray-400">
                                                        {phase.duration}d
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, sites.length)}</span> of <span className="font-medium">{sites.length}</span> results
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message Modal */}
                <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Send Message</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="site">Site</Label>
                                <Input id="site" value={activeMessageSite?.name || ''} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea 
                                    id="message" 
                                    placeholder="Type your message here..." 
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Cancel</Button>
                            <Button onClick={handleSendMessage}>Send Message</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
