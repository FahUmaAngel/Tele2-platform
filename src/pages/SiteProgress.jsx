import React, { useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, isValid } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageFilter from '@/components/shared/PageFilter';

// Helper to ensure date is valid object
const safeDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isValid(d) ? d : null;
};

const STAGES = [
    { id: 'fiber_ordering', label: 'Fiber Ordering', color: 'bg-blue-500', duration: 14 },
    { id: 'naas_design', label: 'NaaS Design', color: 'bg-yellow-500', duration: 5 },
    { id: 'site_survey', label: 'Site Survey', color: 'bg-purple-500', duration: 3 },
    { id: 'approval', label: 'Approval', color: 'bg-orange-500', duration: 5 },
    { id: 'installation', label: 'Installation', color: 'bg-green-500', duration: 3 },
    { id: 'rfs', label: 'RFS', color: 'bg-teal-500', duration: 2 },
];

export default function SiteProgress() {
    const [pageFilters, setPageFilters] = useState({});
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data: fiberOrders } = useQuery({
        queryKey: ['fiber-orders-progress'],
        queryFn: () => base44.entities.FiberOrder.list()
    });

    // --- Data Processing ---
    const sites = useMemo(() => {
        if (!fiberOrders) return [];

        return fiberOrders.map(order => {
            // Base start date
            const startDate = safeDate(order.project_start_date) || safeDate(order.created_date) || new Date();
            const deliveryDate = safeDate(order.delivery_conf_date) || safeDate(order.delivery_est_date) || addDays(startDate, 20);
            const installDate = safeDate(order.scheduled_date) || addDays(deliveryDate, 5);

            // Calculate stage intervals (Mocking logic based on key dates)
            // In a real app, these would come from a "ProjectStages" entity or similar
            const stages = [];
            
            // 1. Fiber Ordering
            stages.push({
                id: 'fiber_ordering',
                name: 'Ordering & Delivery',
                start: startDate,
                end: deliveryDate,
                status: order.status === 'Planned' ? 'in_progress' : 'completed',
                color: 'bg-blue-500'
            });

            // 2. NaaS Design (Parallel start)
            const designStart = addDays(startDate, 2);
            stages.push({
                id: 'naas_design',
                name: 'Design',
                start: designStart,
                end: addDays(designStart, 5),
                status: 'completed', // Mock
                color: 'bg-yellow-500'
            });

            // 3. Survey
            const surveyStart = addDays(startDate, 5);
            stages.push({
                id: 'site_survey',
                name: 'Survey',
                start: surveyStart,
                end: addDays(surveyStart, 3),
                status: 'completed',
                color: 'bg-purple-500'
            });

            // 4. Installation
            stages.push({
                id: 'installation',
                name: 'Installation',
                start: installDate,
                end: addDays(installDate, 3), // Assume 3 days install
                status: order.status === 'Installation Scheduled' ? 'pending' : (order.status === 'Completed' ? 'completed' : 'pending'),
                color: 'bg-green-500'
            });

            // 5. RFS
            const rfsStart = addDays(installDate, 3);
            stages.push({
                id: 'rfs',
                name: 'RFS',
                start: rfsStart,
                end: addDays(rfsStart, 2),
                status: order.status === 'Completed' ? 'completed' : 'pending',
                color: 'bg-teal-500'
            });

            return {
                id: order.facility_id,
                name: order.address || order.facility_id,
                client: order.client,
                status: order.status,
                stages
            };
        }).filter(site => {
            const f = pageFilters;
            
            // Filter by Facility ID
            if (f.facility_id && f.facility_id !== 'all' && !site.id?.toLowerCase().includes(f.facility_id.toLowerCase())) return false;

            // Filter by Status (Map PageFilter status to internal logic if needed, or just direct match)
            if (f.status && f.status !== 'all' && site.status !== f.status) return false;

            // Search
            if (f.search) {
                const s = f.search.toLowerCase();
                const matchesSearch = 
                    site.id?.toLowerCase().includes(s) ||
                    site.name?.toLowerCase().includes(s) ||
                    site.client?.toLowerCase().includes(s);
                if (!matchesSearch) return false;
            }
            
            return true;
        });
    }, [fiberOrders, pageFilters]);

    const totalPages = Math.ceil(sites.length / pageSize);
    const paginatedSites = sites.slice((page - 1) * pageSize, page * pageSize);


    // --- Timeline Calculations ---
    const timelineStart = startOfWeek(currentDate);
    const timelineDays = 30; // Show 30 days window
    const timelineEnd = addDays(timelineStart, timelineDays);
    const days = eachDayOfInterval({ start: timelineStart, end: timelineEnd });

    const getGridStyle = () => {
        return { gridTemplateColumns: `250px repeat(${timelineDays}, minmax(40px, 1fr))` };
    };

    // Helpers
    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const getStageStyle = (stage) => {
        // Calculate position relative to timelineStart
        const startDiff = differenceInDays(stage.start, timelineStart);
        const duration = differenceInDays(stage.end, stage.start) + 1; // Inclusive

        // Clipping
        let effectiveStart = startDiff;
        let effectiveDuration = duration;

        if (effectiveStart < 0) {
            effectiveDuration += effectiveStart;
            effectiveStart = 0;
        }

        // Check visibility
        if (effectiveDuration <= 0 || effectiveStart >= timelineDays) return null;

        // Cap at end
        if (effectiveStart + effectiveDuration > timelineDays) {
            effectiveDuration = timelineDays - effectiveStart;
        }

        return {
            gridColumnStart: effectiveStart + 2, // +2 because col 1 is sidebar
            gridColumnEnd: `span ${effectiveDuration}`,
        };
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Site Progress</h1>
                    <p className="text-gray-500 mt-1">Gantt chart view of project workflows and timelines.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-lg border shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -14))}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-medium text-sm w-32 text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 14))}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
                <PageFilter onFilterChange={(f) => { setPageFilters(f); setPage(1); }} />
                
                <div className="flex justify-end gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500"/> Ordering</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500"/> Design</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500"/> Installation</div>
                </div>
            </div>

            {/* Gantt Chart Container */}
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <div className="min-w-[1200px] pb-4">
                        
                        {/* 1. Timeline Header */}
                        <div className="grid border-b border-gray-200 bg-gray-50/80" style={getGridStyle()}>
                            <div className="p-3 font-bold text-sm text-gray-700 sticky left-0 bg-gray-50 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                Site / Facility
                            </div>
                            {days.map((day, i) => (
                                <div key={i} className={`text-center py-2 border-r border-gray-100 text-xs ${isSameDay(day, new Date()) ? 'bg-blue-50 font-bold text-blue-600' : isWeekend(day) ? 'bg-gray-50 text-gray-400' : 'text-gray-600'}`}>
                                    <div className="font-medium">{format(day, 'd')}</div>
                                    <div className="text-[10px] uppercase">{format(day, 'EEEEE')}</div>
                                </div>
                            ))}
                        </div>

                        {/* Re-implementation for better layering: 
                            Row = Flex container. 
                            Left = Fixed width. 
                            Right = Scrollable Timeline.
                        */}
                        
                        {paginatedSites.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                No sites found matching your criteria.
                            </div>
                        )}

                        {paginatedSites.map(site => (
                           <div key={`row-${site.id}`} className="flex border-b border-gray-100 h-16 relative group">
                                {/* Fixed Left Column */}
                                <div className="w-[250px] flex-shrink-0 p-3 border-r border-gray-200 bg-white sticky left-0 z-20 group-hover:bg-gray-50 transition-colors flex flex-col justify-center">
                                    <div className="font-medium text-sm text-gray-900 truncate">{site.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{site.id}</div>
                                </div>

                                {/* Scrollable Right Side */}
                                <div className="flex-1 relative min-w-0" style={{ display: 'grid', gridTemplateColumns: `repeat(${timelineDays}, 1fr)` }}>
                                    {/* Background Grid */}
                                    {days.map((day, i) => (
                                        <div key={`grid-${i}`} className={`border-r border-gray-100 h-full ${isWeekend(day) ? 'bg-gray-50/50' : ''} ${isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''}`} />
                                    ))}

                                    {/* Bars Overlay */}
                                    <div className="absolute inset-y-0 left-0 right-0 py-4 pointer-events-none grid" style={{ gridTemplateColumns: `repeat(${timelineDays}, 1fr)` }}>
                                        {site.stages.map((stage, idx) => {
                                            const style = getStageStyle(stage);
                                            if (!style) return null;

                                            // Adjust for 0-based grid in this inner container (no sidebar col)
                                            const colStart = parseInt(style.gridColumnStart) - 1; // Sidebar was col 1, date 1 was col 2. Here date 1 is col 1.
                                            const newStyle = {
                                                gridColumnStart: colStart,
                                                gridColumnEnd: style.gridColumnEnd
                                            };

                                            return (
                                                <div 
                                                    key={idx}
                                                    style={newStyle}
                                                    className={`${stage.color} h-full rounded-full opacity-80 shadow-sm border border-white/20 relative group/bar pointer-events-auto hover:opacity-100 transition-opacity mx-0.5`}
                                                >
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bar:block bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-30 whitespace-nowrap">
                                                        <div className="font-bold">{stage.name}</div>
                                                        <div>{format(stage.start, 'MMM d')} - {format(stage.end, 'MMM d')}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                           </div> 
                        ))}

                    </div>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-200 bg-gray-50 p-3 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, sites.length)}</strong> of <strong>{sites.length}</strong> sites
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center justify-center px-2 text-sm font-medium">
                                Page {page} of {totalPages}
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <div className="bg-white p-4 rounded-lg border border-blue-100 bg-blue-50/50">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                       <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900">Planning Insight</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Site <strong>SITE-SE-01</strong> is projected to complete Installation phase <strong>2 days ahead of schedule</strong>. 
                            Consider rescheduling RFS validation to optimize technician utilization.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}