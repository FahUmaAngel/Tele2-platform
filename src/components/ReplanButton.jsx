import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { replanFromStep } from "@/api/replan";

export default function ReplanButton({ siteId, orderId, currentStep, className, variant = "outline", children, ...props }) {
    const handleReplan = async () => {
        try {
            await replanFromStep({ siteId, orderId, currentStep });
            toast.success(`Replanning started from step ${currentStep}`);
        } catch (e) {
            toast.error(`Replan failed: ${e.message}`);
        }
    };

    return (
        <Button variant={variant} onClick={handleReplan} className={className} {...props}>
            <RefreshCcw className="w-4 h-4 mr-1" />
            {children || "AI Replan"}
        </Button>
    );
}
