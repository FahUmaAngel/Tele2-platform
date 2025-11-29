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
import {
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    FileWarning,
    TrendingDown,
    Zap,
    ArrowRight,
    Edit
} from "lucide-react";
import { toast } from "sonner";

export default function RfsReplanningModal({
    open,
    onOpenChange,
    detectedIssue,
    onKeepCurrent,
    onManualEdit,
    onAcceptSuggestion
}) {
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [analysisStep, setAnalysisStep] = useState(0);

    // Simulation of AI Analysis
    useEffect(() => {
        if (open && detectedIssue) {
            setIsAnalyzing(true);
            setAnalysisStep(0);

            const steps = [
                "Analyzing customer complaint...",
                "Checking network telemetry data...",
                "Evaluating performance metrics...",
                "Generating resolution plan..."
            ];

            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                setAnalysisStep(currentStep);

                if (currentStep >= steps.length) {
                    clearInterval(interval);
                    setIsAnalyzing(false);
                }
            }, 600);

            return () => clearInterval(interval);
        }
    }, [open, detectedIssue]);

    if (!detectedIssue) return null;

    const steps = [
        "Analyzing customer complaint...",
        "Checking network telemetry data...",
        "Evaluating performance metrics...",
        "Generating resolution plan..."
    ];

    const handleKeepCurrent = () => {
        if (onKeepCurrent) onKeepCurrent();
        onOpenChange(false);
        toast.info("Keeping current status - manual resolution required");
    };

    const handleManualEdit = () => {
        if (onManualEdit) onManualEdit();
        onOpenChange(false);
    };

    const handleAcceptSuggestion = async () => {
        if (onAcceptSuggestion) {
            await onAcceptSuggestion(detectedIssue);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        AI Automatic Replanning - Customer Acceptance
                    </DialogTitle>
                    <DialogDescription>
                        AI detected a customer acceptance issue and generated a resolution plan.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 min-h-[400px]">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25"></div>
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="font-medium text-gray-900">Analyzing Customer Acceptance Data</h3>
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* LEFT SIDE - Issue Description */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-lg border bg-red-50 border-red-200">
                                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-red-900">Installation Not Approved</h3>
                                        <p className="text-sm text-red-700 mt-1">
                                            Customer has not yet accepted the installation
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="bg-white text-red-700 border-red-200">
                                        HIGH
                                    </Badge>
                                </div>

                                {/* Customer Complaint */}
                                <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                                    <div className="flex items-start gap-2">
                                        <FileWarning className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-amber-900 mb-2">Customer Complaint</h4>
                                            <p className="text-sm text-amber-800 italic">
                                                "{detectedIssue.currentData.complaint}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Status */}
                                <div className="border rounded-lg p-4 space-y-3">
                                    <h4 className="font-semibold text-gray-900">Current Status</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Acceptance Status</span>
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                {detectedIssue.currentData.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Site ID</span>
                                            <span className="font-mono font-medium text-gray-900">
                                                {detectedIssue.currentData.siteId}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Reported</span>
                                            <span className="font-medium text-gray-900">
                                                {detectedIssue.currentData.reportedDate ?
                                                    new Date(detectedIssue.currentData.reportedDate).toLocaleDateString() :
                                                    'Recently'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                                    <p className="text-sm text-blue-900">
                                        <strong>Note:</strong> Status remains Pending until the issue is resolved and customer approves the installation.
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT SIDE - AI Recommendation Panel */}
                            <div className="border-2 border-indigo-100 rounded-xl p-5 bg-indigo-50/30 space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-medium">
                                    AI RECOMMENDED
                                </div>

                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        Resolution Plan
                                    </h4>
                                    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                        Automated
                                    </Badge>
                                </div>

                                {/* AI Recommendations */}
                                <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-indigo-900">Recommended Actions:</h5>
                                    <ul className="space-y-2">
                                        {detectedIssue.suggestedData.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-indigo-900">
                                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Resolution Details */}
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-200">
                                    <div>
                                        <span className="text-xs text-indigo-700/70">Estimated Resolution</span>
                                        <p className="font-bold text-indigo-900">
                                            {detectedIssue.suggestedData.estimatedResolution}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-indigo-700/70">Priority</span>
                                        <p className="font-bold text-indigo-900">
                                            {detectedIssue.suggestedData.priority}
                                        </p>
                                    </div>
                                </div>

                                {/* Next Steps */}
                                <div className="bg-white/50 border border-indigo-100 p-3 rounded-lg">
                                    <h5 className="text-sm font-medium text-indigo-900 mb-2">Next Steps:</h5>
                                    <ul className="space-y-1">
                                        {detectedIssue.suggestedData.nextSteps.map((step, index) => (
                                            <li key={index} className="flex items-center gap-2 text-xs text-indigo-800">
                                                <ArrowRight className="w-3 h-3" />
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                    <Button
                        variant="outline"
                        onClick={handleKeepCurrent}
                        disabled={isAnalyzing}
                        className="w-full sm:w-auto"
                    >
                        Keep Current
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={handleManualEdit}
                            disabled={isAnalyzing}
                            className="flex-1 sm:flex-none"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Do Manual
                        </Button>
                        <Button
                            onClick={handleAcceptSuggestion}
                            disabled={isAnalyzing}
                            className="bg-indigo-600 hover:bg-indigo-700 flex-1 sm:flex-none"
                        >
                            {isAnalyzing ? "Analyzing..." : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Accept AI Suggestion
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
