import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function CreateSurveyDialog({ open, onOpenChange, siteId, orderId }) {
    const queryClient = useQueryClient();

    const createSurveyMutation = useMutation({
        mutationFn: (data) => base44.entities.SiteSurvey.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-surveys'] });
            toast.success("Survey Created Successfully");
            onOpenChange(false);
        },
        onError: () => {
            toast.error("Failed to create survey");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const data = {
            facility_id: siteId,
            order_id: orderId || `ORD-${Date.now().toString().slice(-6)}`, // Fallback if no orderId
            surveyor: formData.get('surveyor'),
            date: formData.get('date'),
            status: 'Scheduled',
            feasibility: 'Pending',
            notes: formData.get('notes'),
            installation_type: formData.get('installation_type'),
            requires_special_hardware: false,
            created_at: new Date().toISOString()
        };

        createSurveyMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule New Site Survey</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Facility ID</Label>
                            <Input value={siteId} disabled className="bg-gray-100" />
                        </div>
                        <div className="space-y-2">
                            <Label>Order ID</Label>
                            <Input value={orderId || "Linked to New Order"} disabled className="bg-gray-100" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Surveyor Name</Label>
                        <Input name="surveyor" placeholder="e.g. Sven Svensson" required />
                    </div>

                    <div className="space-y-2">
                        <Label>Scheduled Date</Label>
                        <Input name="date" type="date" required />
                    </div>

                    <div className="space-y-2">
                        <Label>Installation Type (Preliminary)</Label>
                        <Select name="installation_type" defaultValue="Underground">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Underground">Underground</SelectItem>
                                <SelectItem value="Aerial">Aerial</SelectItem>
                                <SelectItem value="Facade">Facade</SelectItem>
                                <SelectItem value="Indoor">Indoor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea name="notes" placeholder="Access instructions, key contacts..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Schedule Survey</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
