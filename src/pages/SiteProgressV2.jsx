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
    const [timeScale, setTimeScale] = useState('week'); // 'week' | 'month'
    
    // Message Modal State
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [activeMessageSite, setActiveMessageSite] = useState(null);
    const [messageText, setMessageText] = useState('');

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        facility: 'all',
        order: 'all',
        status: 'all',
        priority: 'all',
        dateRange: undefined
    });

    // Timeline configuration based on scale
    // Align start to the beginning of the current week (Monday)
    const timelineStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    timelineStart.setHours(0, 0, 0, 0);

    let timelineDays = 0;
    let headers = [];

    if (timeScale === 'week') {
        const timelineWeeks = 28;
        timelineDays = timelineWeeks * 7;
        const end = addDays(timelineStart, timelineDays);
        // Generate weeks
        for (let i = 0; i <= timelineWeeks; i += 2) {
            headers.push({ label: `W${i}`, dayIndex: i * 7 });
        }
    } else if (timeScale === 'month') {
        const monthsToShow = 12;
        const end = addMonths(timelineStart, monthsToShow);
        timelineDays = differenceInDays(end, timelineStart);
        const months = eachMonthOfInterval({ start: timelineStart, end });
        headers = months.map(m => ({
            label: format(m, 'MMMM'),
            dayIndex: differenceInDays(m, timelineStart)
        }));
    }

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
            
            // Generate phases based on start date
            let currentOffset = 0;
            const phases = STAGES.map(stage => {
                const start = addDays(startDate, currentOffset);
                const end = addDays(start, stage.duration);
                currentOffset += stage.duration + 2; 
                
                return {
                    ...stage,
                    start,
                    end,
                    dayRange: `D${differenceInDays(start, startDate)}-${differenceInDays(end, startDate)}`
                };
            });

            const installDate = phases[phases.length - 1].end;
            const totalDays = differenceInDays(installDate, startDate);
            const progress = Math.floor(Math.random() * 80) + 10; 
            
            // Mock Priority
            const priorities = ['High', 'Medium', 'Low'];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];

            return {
                id: order.facility_id,
                name: order.address || `Site ${order.facility_id}`,
                location: order.city || 'Stockholm',
                status: order.status || 'Planned',
                priority,
                progress,
                phases,
                totalDays,
                installDate,
                startDate,
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

    // Handle View Mode Change
    useEffect(() => {
        if (viewMode === 'detailed') {
            const allIds = new Set(sites.map(s => s.id));
            setExpandedRows(allIds);
        } else {
            setExpandedRows(new Set());
        }
    }, [viewMode, sites.length]); 

    const getBarPosition = (start, end) => {
        // Calculate position relative to timelineStart
        const startDiff = differenceInDays(start, timelineStart);
        const duration = differenceInDays(end, start);
        
        let left = (startDiff / timelineDays) * 100;
        let width = (duration / timelineDays) * 100;

        // Handle clipping if start is before timelineStart
        if (left < 0) {
            // Add the negative left value to width to shrink it from the left
            width += left; 
            left = 0;
        }

        // If bar is completely off-screen to the left
        if (width <= 0) {
            return null;
        }

        return { left: `${left}%`, width: `${width}%` };
    };

    // Unique values for filters
    const uniqueFacilities = useMemo(() => [...new Set(fiberOrders?.map(o => o.facility_id) || [])], [fiberOrders]);
    const uniqueStatuses = useMemo(() => [...new Set(fiberOrders?.map(o => o.status || 'Planned') || [])], [fiberOrders]);

    return (
        <TooltipProvider>
            <div className="p-6 bg-gray-50 min-h-screen font-sans space-y-6">
                
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
                        {/* Time Scale Toggle */}
                        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setTimeScale('week')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeScale === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setTimeScale('month')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeScale === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Month
                            </button>
                        </div>

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

                {/* Timeline Header */}
                <div className="flex mb-4 pl-[300px] pr-12 relative text-xs text-gray-500 font-medium border-b border-gray-200 pb-2 h-8">
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
                </div>

                <div className="space-y-4">
                    {sites.map(site => {
                        const isExpanded = expandedRows.has(site.id);
                        const installDayIndex = differenceInDays(site.installDate, timelineStart);
                        const installLeft = (installDayIndex / timelineDays) * 100;

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
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold text-gray-900 truncate">{site.name}</div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
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

                                    {/* Gantt Area */}
                                    <div className="flex-1 h-full relative px-4 overflow-hidden">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {headers.map((h, i) => (
                                                <div 
                                                    key={i} 
                                                    className="absolute h-full border-r border-gray-100 transform -translate-x-1/2"
                                                    style={{ left: `${(h.dayIndex / timelineDays) * 100}%` }}
                                                />
                                            ))}
                                        </div>

                                        {/* Overview Bars */}
                                        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                                            {site.phases.map((phase, idx) => {
                                                const pos = getBarPosition(phase.start, phase.end);
                                                if (!pos) return null; // Skip if off-screen

                                                return (
                                                    <Tooltip key={idx}>
                                                        <TooltipTrigger asChild>
                                                            <div 
                                                                className={`absolute h-4 rounded-sm ${phase.color} opacity-90 hover:opacity-100 transition-opacity cursor-pointer`}
                                                                style={{ left: pos.left, width: pos.width }}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <div className="text-xs">
                                                                <p className="font-semibold">{phase.label}</p>
                                                                <p>{format(phase.start, 'MMM d, yyyy')} - {format(phase.end, 'MMM d, yyyy')}</p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                            
                                            {/* Red Hard Stop Line */}
                                            {installLeft >= 0 && installLeft <= 100 && (
                                                <div 
                                                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                                                    style={{ left: `${installLeft}%` }}
                                                />
                                            )}
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
                                            const pos = getBarPosition(phase.start, phase.end);
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

                                                    {/* Gantt Bar Row */}
                                                    <div className="flex-1 h-full relative px-4 overflow-hidden">
                                                         {/* Grid Lines (faint) */}
                                                        <div className="absolute inset-0 flex pointer-events-none">
                                                            {headers.map((h, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    className="absolute h-full border-r border-gray-50 transform -translate-x-1/2"
                                                                    style={{ left: `${(h.dayIndex / timelineDays) * 100}%` }}
                                                                />
                                                            ))}
                                                        </div>

                                                        {pos && (
                                                            <div 
                                                                className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-md ${phase.color}`}
                                                                style={{ left: pos.left, width: pos.width }}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Right Info */}
                                                    <div className="w-48 flex-shrink-0 flex items-center justify-end px-4 border-l border-gray-100 h-full text-xs text-gray-400">
                                                        {phase.dayRange}
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
