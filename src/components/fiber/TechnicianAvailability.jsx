import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HardHat, MapPin, Search, Calendar, Zap, Thermometer, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

// Mock Data for Teams
const MOCK_TEAMS = [
    { id: 1, name: "Team Alpha", region: "Central", skill: "Fiber", baseLoad: 40 },
    { id: 2, name: "Team Beta", region: "Central", skill: "Fiber", baseLoad: 80 },
    { id: 3, name: "Team Gamma", region: "North", skill: "Fiber", baseLoad: 20 },
    { id: 4, name: "Team Delta", region: "South", skill: "Fiber", baseLoad: 60 },
    { id: 5, name: "Team Epsilon", region: "Central", skill: "NaaS", baseLoad: 50 },
    { id: 6, name: "Team Zeta", region: "Central", skill: "Fiber", baseLoad: 90 },
    { id: 7, name: "Team Eta", region: "North", skill: "Fiber", baseLoad: 10 },
];

export default function TechnicianAvailability({ currentOrder }) {
    const [date, setDate] = useState("");
    const [address, setAddress] = useState(""); // "Address" field
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const determineRegion = (lat) => {
        if (!lat) return "Central"; // Default
        if (lat > 62) return "North";
        if (lat < 58) return "South";
        return "Central";
    };

    const checkAvailability = async () => {
        if (!date) {
            toast.error("Please select a desired installation date");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            let targetLat = currentOrder?.lat;
            let usedAddress = currentOrder?.address;

            // 1. Region Determination
            if (address) {
                // Simulate Geocoding for entered address
                try {
                    // In a real app, we'd call a geocoding API. 
                    // Here we simulate a network delay and a result.
                    // If the user enters "North", we mock it to the north, etc for demo purposes.
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
                    const data = await res.json();
                    
                    if (data && data.length > 0) {
                        targetLat = parseFloat(data[0].lat);
                        usedAddress = address;
                    } else {
                        // Fallback simulation if geocoding fails or returns nothing for testing
                        targetLat = 59.3293; // Default Stockholm
                    }
                } catch (e) {
                    console.error("Geocoding error", e);
                }
            }

            const region = determineRegion(targetLat);

            // 2. Technician Team Load Evaluation
            const regionTeams = MOCK_TEAMS.filter(t => t.region === region);
            
            // Simulate load based on date (weekends are busier/unavailable)
            const selectedDateObj = new Date(date);
            const dayOfWeek = selectedDateObj.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            const processedTeams = regionTeams.map(team => {
                // Random fluctuation + weekend penalty
                const randomLoad = Math.floor(Math.random() * 30) - 10;
                let currentLoad = team.baseLoad + randomLoad + (isWeekend ? 40 : 0);
                currentLoad = Math.max(0, Math.min(100, currentLoad));
                
                let status = "Available";
                if (currentLoad > 90) status = "Not Available";
                else if (currentLoad > 60) status = "Partially Available";

                return {
                    ...team,
                    currentLoad,
                    status,
                    suitability: team.skill === "Fiber" ? "High Match" : "Secondary Match"
                };
            }).sort((a, b) => a.currentLoad - b.currentLoad); // Lowest load first

            const availableTeamsCount = processedTeams.filter(t => t.status !== "Not Available").length;

            // 3. AI Scheduling Feasibility Prediction
            let feasibility = "High Feasibility";
            let feasibilityColor = "text-green-600 bg-green-50 border-green-200";

            if (availableTeamsCount === 0) {
                feasibility = "Low Feasibility";
                feasibilityColor = "text-red-600 bg-red-50 border-red-200";
            } else if (availableTeamsCount < 2 || processedTeams.some(t => t.currentLoad > 80)) {
                feasibility = "Medium Feasibility";
                feasibilityColor = "text-yellow-600 bg-yellow-50 border-yellow-200";
            }

            // 4. Workload Heatmap Data
            const heatmap = [];
            for (let i = -2; i <= 2; i++) {
                const d = addDays(selectedDateObj, i);
                const dStr = format(d, 'MMM d');
                const load = Math.min(100, Math.max(20, 50 + (i * 5) + (Math.random() * 20)));
                heatmap.push({ date: dStr, load: Math.round(load), isSelected: i === 0 });
            }

            setTimeout(() => {
                setResult({
                    region,
                    availableCount: availableTeamsCount,
                    teams: processedTeams,
                    feasibility,
                    feasibilityColor,
                    heatmap
                });
                setLoading(false);
            }, 600);

        } catch (err) {
            toast.error("Error calculating availability");
            setLoading(false);
        }
    };

    const getLoadColor = (load) => {
        if (load < 50) return "bg-green-500";
        if (load < 80) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                        <Zap className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-gray-900">Technician Availability Window</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
                
                {/* INPUT FIELDS */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500 uppercase">Desired Installation Date <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input 
                                type="date" 
                                className="pl-9" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500 uppercase">Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder={currentOrder?.address || "Enter address..."}
                                className="pl-9" 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400">
                            Leaves site address unchanged. Used for calculation only.
                        </p>
                    </div>

                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 font-medium" 
                        onClick={checkAvailability}
                        disabled={loading || !date}
                    >
                        {loading ? "Processing..." : "Check Availability"}
                    </Button>
                </div>

                {/* OUTPUT SECTION */}
                {result && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-5 pt-4 border-t border-dashed border-gray-200">
                        
                        {/* 1. Technician Availability Summary */}
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-900 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">
                                {result.availableCount === 0 
                                    ? "No technician teams are available for the selected date." 
                                    : `${result.availableCount} technician teams are available for the selected date.`
                                }
                            </span>
                        </div>

                        {/* 3. AI Scheduling Feasibility (Moved up for visibility priority as per UI logic, usually feasibility is high level) */}
                        <div className={`p-4 rounded-md border flex items-center justify-between ${result.feasibilityColor}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/50 rounded-full">
                                    <Thermometer className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-base">{result.feasibility}</div>
                                    <div className="text-xs opacity-90">Based on team capacity & route</div>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-white/50 border-transparent">AI Prediction</Badge>
                        </div>

                        {/* 2. Recommended Technician Teams */}
                        <div>
                            <Label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">Recommended Teams</Label>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                {result.teams.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500 italic text-sm">No teams found in this region.</div>
                                ) : (
                                    result.teams.map(team => (
                                        <div key={team.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 transition-all">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900 text-sm">{team.name}</span>
                                                    {team.status === "Available" && <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] h-5">Available</Badge>}
                                                    {team.status === "Partially Available" && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] h-5">Partial</Badge>}
                                                    {team.status === "Not Available" && <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] h-5">Busy</Badge>}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <span>Load: {team.currentLoad}%</span>
                                                    <span>•</span>
                                                    <span>{team.suitability}</span>
                                                </div>
                                            </div>
                                            <div className={`w-1.5 h-8 rounded-full ${getLoadColor(team.currentLoad)}`} title={`Workload: ${team.currentLoad}%`}></div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 4. Workload Heatmap */}
                        <div>
                            <Label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">Regional Workload Heatmap</Label>
                            <div className="flex items-end gap-1 h-16 bg-gray-50 p-2 rounded border border-gray-100">
                                {result.heatmap.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group">
                                        <div 
                                            className={`w-full rounded-t mx-0.5 transition-all relative group-hover:opacity-80 ${getLoadColor(day.load)} ${day.isSelected ? 'ring-2 ring-blue-500 z-10' : 'opacity-70'}`}
                                            style={{ height: `${day.load}%` }}
                                        >
                                        </div>
                                        <span className={`text-[9px] leading-none ${day.isSelected ? 'font-bold text-blue-700' : 'text-gray-400'}`}>{day.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </CardContent>
        </Card>
    );
}