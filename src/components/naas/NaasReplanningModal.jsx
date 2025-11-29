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
    Users,
    Calendar,
    CheckSquare,
    Camera,
    Settings,
    Activity,
    ArrowRight,
    Edit
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_CONFIG = {
    resource: {
        icon: Users,
        title: "Resource & Scheduling Issue",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
    },
    schedule: {
        icon: Calendar,
        title: "Installation Schedule Conflict",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
    },
    execution: {
        icon: CheckSquare,
        title: "Work Execution Issue",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
    },
    photo: {
        icon: Camera,
        title: "Photo Evidence Issue",
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        borderColor: "border-pink-200"
    },
    config: {
        icon: Settings,
        title: "Technical Configuration Issue",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200"
    },
    activation: {
        icon: Activity,
        title: "Activation & Service Test Issue",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
    }
};

export default function NaasReplanningModal({
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
                "Analyzing current configuration...",
                "Checking resource availability...",
                "Evaluating alternative solutions...",
                "Generating optimized plan..."
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

    const config = CATEGORY_CONFIG[detectedIssue.category] || CATEGORY_CONFIG.resource;
    const Icon = config.icon;

    const steps = [
        "Analyzing current configuration...",
        "Checking resource availability...",
        "Evaluating alternative solutions...",
        "Generating optimized plan..."
    ];

    const handleKeepCurrent = () => {
        if (onKeepCurrent) onKeepCurrent();
        onOpenChange(false);
        toast.info("Keeping current plan");
    };

    const handleManualEdit = () => {
        if (onManualEdit) onManualEdit(detectedIssue.category);
        onOpenChange(false);
    };

    const handleAcceptSuggestion = async () => {
        if (onAcceptSuggestion) {
            await onAcceptSuggestion(detectedIssue);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        AI Automatic Replanning - NaaS Installation
                    </DialogTitle>
                    <DialogDescription>
                        AI detected issues and generated an optimized solution for your installation.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 min-h-[350px]">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25"></div>
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="font-medium text-gray-900">Analyzing Installation Data</h3>
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
                            {/* Issue Category Badge */}
                            <div className={`flex items-center gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                                <Icon className={`w-6 h-6 ${config.color}`} />
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${config.color}`}>{config.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {detectedIssue.issues.length} issue(s) detected
                                    </p>
                                </div>
                                <Badge variant="outline" className="bg-white">
                                    {detectedIssue.issues[0].severity.toUpperCase()}
                                </Badge>
                            </div>

                            {/* Issues List */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">Detected Issues:</h4>
                                {detectedIssue.issues.map((issue, index) => (
                                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-900">{issue.title}</p>
                                            <p className="text-xs text-red-700 mt-1">{issue.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Comparison Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Current Plan */}
                                <div className="border rounded-xl p-5 bg-gray-50/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-700">Current Configuration</h4>
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            Issues Detected
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {Object.entries(detectedIssue.currentData).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <span className="text-gray-500 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="font-medium text-gray-600">
                                                    {typeof value === 'object' ? JSON.stringify(value) : value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Optimized Plan */}
                                <div className="border-2 border-indigo-100 rounded-xl p-5 bg-indigo-50/30 space-y-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-medium">
                                        AI RECOMMENDED
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-indigo-900">Optimized Solution</h4>
                                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                            Issue Resolved
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {Object.entries(detectedIssue.suggestedData).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <span className="text-indigo-700/70 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="font-bold text-gray-900">
                                                    {typeof value === 'object' ? (
                                                        <ul className="text-xs space-y-1">
                                                            {Array.isArray(value) ? (
                                                                value.map((item, i) => <li key={i}>• {item}</li>)
                                                            ) : (
                                                                Object.entries(value).map(([k, v]) => (
                                                                    <li key={k}>{k}: {v}</li>
                                                                ))
                                                            )}
                                                        </ul>
                                                    ) : value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* AI Explanation */}
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium">Why this solution?</p>
                                    <p className="opacity-90 mt-1">
                                        {detectedIssue.issues[0].suggestion}
                                    </p>
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
                        Keep Current Plan
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={handleManualEdit}
                            disabled={isAnalyzing}
                            className="flex-1 sm:flex-none"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Do Manual Editing
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
