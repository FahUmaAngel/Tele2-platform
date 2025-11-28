import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Calendar, Users, AlertTriangle, CheckCircle2, Sparkles, Thermometer, Truck } from "lucide-react";
import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { toast } from "sonner";

export default function AIReplanningModal({ open, onOpenChange, order, onApplyPlan }) {
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [newPlan, setNewPlan] = useState(null);

    // Simulation of AI Analysis
    useEffect(() => {
        if (open && order) {
            setIsAnalyzing(true);
            setAnalysisStep(0);
            setNewPlan(null);

            const steps = [
                "Detecting scheduling conflicts...",
                "Analyzing frost period constraints...",
                "Evaluating subcontractor capacity...",
                "Optimizing installation window..."
            ];

            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                setAnalysisStep(currentStep);
                
                if (currentStep >= steps.length) {
                    clearInterval(interval);
                    generateNewPlan(order);
                }
            }, 800);

            return () => clearInterval(interval);
        }
    }, [open, order]);

    const generateNewPlan = (currentOrder) => {
        // Mock AI Logic
        // 1. Calculate new dates to avoid frost (assuming frost is Nov 15 - Mar 31)
        // 2. Find new subcontractor if current one is overloaded (randomly decided here)
        
        const today = new Date();
        const currentDelivery = currentOrder.delivery_est_date ? new Date(currentOrder.delivery_est_date) : today;
        
        // Simulate a push-out of 14 days due to "delay"
        const newDeliveryDate = addDays(currentDelivery, 14);
        
        // Simulate finding a frost-safe window
        // For demo purposes, let's just say it pushes installation to April if currently in winter
        let newInstallWindowStart = addDays(newDeliveryDate, 5);
        const month = newInstallWindowStart.getMonth(); // 0-11
        
        let frostWarning = false;
        // If Nov(10) to Mar(2), push to April 1st
        if (month >= 10 || month <= 2) {
            frostWarning = true;
            // Simple logic: Set to next April 15th
            const year = month >= 10 ? newInstallWindowStart.getFullYear() + 1 : newInstallWindowStart.getFullYear();
            newInstallWindowStart = new Date(year, 3, 15); // April 15
        }

        const newInstallWindowEnd = addDays(newInstallWindowStart, 5);

        setNewPlan({
            deliveryDate: format(newDeliveryDate, 'yyyy-MM-dd'),
            installWindow: `${format(newInstallWindowStart, 'MMM d')} - ${format(newInstallWindowEnd, 'MMM d')}`,
            subcontractor: currentOrder.subcontractor === "NordGräv" ? "Svea Fiber" : "NordGräv", // Suggest switch
            subcontractorReason: "Better availability in new window",
            riskScore: "Low",
            frostSafe: true,
            confidence: "96%"
        });
        setIsAnalyzing(false);
    };

    const handleApply = () => {
        if (onApplyPlan && newPlan) {
            onApplyPlan(newPlan);
            onOpenChange(false);
        }
    };

    const steps = [
        "Detecting scheduling conflicts...",
        "Analyzing frost period constraints...",
        "Evaluating subcontractor capacity...",
        "Optimizing installation window..."
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        AI Automatic Replanning
                    </DialogTitle>
                    <DialogDescription>
                        Generating optimized plan based on delays, frost constraints, and resource availability.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 min-h-[300px]">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25"></div>
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="font-medium text-gray-900">Analyzing Project Constraints</h3>
                                <p className="text-sm text-gray-500 h-6 transition-all duration-300">
                                    {steps[Math.min(analysisStep, steps.length - 1)]}
                                </p>
                            </div>
                            <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                                    style={{ width: `${(analysisStep / steps.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Comparison Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Current Plan */}
                                <div className="border rounded-xl p-5 bg-gray-50/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-700">Current Plan (At Risk)</h4>
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Conflict Detected</Badge>
                                    </div>
                                    
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <Truck className="w-4 h-4" /> Delivery Est.
                                            </span>
                                            <span className="font-medium line-through text-gray-400">
                                                {order?.delivery_est_date || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> Install Window
                                            </span>
                                            <span className="font-medium text-red-600 flex items-center gap-1">
                                                {order?.scheduled_date || "Pending"}
                                                <AlertTriangle className="w-3 h-3" />
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Subcontractor
                                            </span>
                                            <span className="font-medium text-gray-600">
                                                {order?.subcontractor || "Unassigned"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <Thermometer className="w-4 h-4" /> Frost Risk
                                            </span>
                                            <span className="font-medium text-red-600">High Impact</span>
                                        </div>
                                    </div>
                                </div>

                                {/* New Plan */}
                                <div className="border-2 border-indigo-100 rounded-xl p-5 bg-indigo-50/30 space-y-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-medium">
                                        AI RECOMMENDED
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-indigo-900">Optimized Plan</h4>
                                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Frost Safe</Badge>
                                    </div>
                                    
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-indigo-700/70 flex items-center gap-2">
                                                <Truck className="w-4 h-4" /> New Delivery
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">{newPlan.deliveryDate}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-indigo-700/70 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> New Window
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">{newPlan.installWindow}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-indigo-700/70 flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Suggested Team
                                            </span>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-900 block">{newPlan.subcontractor}</span>
                                                <span className="text-[10px] text-green-600">{newPlan.subcontractorReason}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                                            <span className="text-indigo-700/70 flex items-center gap-2">
                                                Confidence
                                            </span>
                                            <span className="font-bold text-indigo-700">{newPlan.confidence}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium">Why this plan?</p>
                                    <p className="opacity-90 mt-1">
                                        Current schedule overlaps with municipality frost constraints (Nov 15 - Mar 31). 
                                        The AI has shifted installation to the first available safe window in Spring and reassigned 
                                        resources to optimize for the new timeline.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between items-center gap-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Keep Current Plan
                    </Button>
                    <Button 
                        onClick={handleApply} 
                        disabled={isAnalyzing}
                        className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]"
                    >
                        {isAnalyzing ? "Analyzing..." : "Apply New Plan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}