import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function EditSurveyDialog({ open, onOpenChange, survey }) {
    const queryClient = useQueryClient();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const updateSurveyMutation = useMutation({
        mutationFn: (data) => base44.entities.SiteSurvey.update(survey.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-surveys'] });
            toast.success("Survey Updated Successfully");
            onOpenChange(false);
        },
        onError: (err) => {
            toast.error(`Failed to update survey: ${err.message}`);
        }
    });

    const deleteSurveyMutation = useMutation({
        mutationFn: () => base44.entities.SiteSurvey.delete(survey.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-surveys'] });
            toast.success("Survey Deleted Successfully");
            onOpenChange(false);
            setShowDeleteConfirm(false);
        },
        onError: (err) => {
            toast.error(`Failed to delete survey: ${err.message}`);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const data = {
            surveyor: formData.get('surveyor'),
            date: formData.get('date'),
            feasibility: formData.get('feasibility'),
            installation_type: formData.get('installation_type'),
            notes: formData.get('notes'),
            requires_special_hardware: formData.get('requires_special_hardware') === 'true',
            requires_lift: formData.get('requires_lift') === 'true',
        };

        updateSurveyMutation.mutate(data);
    };

    const handleDelete = () => {
        deleteSurveyMutation.mutate();
    };

    if (!survey) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Site Survey</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        {survey.facility_id} {survey.order_id && `• ${survey.order_id}`}
                    </p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Surveyor Name</Label>
                            <Input name="surveyor" defaultValue={survey.surveyor} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Survey Date</Label>
                            <Input name="date" type="date" defaultValue={survey.date} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Feasibility</Label>
                            <Select name="feasibility" defaultValue={survey.feasibility}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="feasible">Feasible</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="impossible">Impossible</SelectItem>
                                    <SelectItem value="requires_approval">Requires Approval</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Installation Type</Label>
                            <Select name="installation_type" defaultValue={survey.installation_type}>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Special Hardware Required</Label>
                            <Select name="requires_special_hardware" defaultValue={survey.requires_special_hardware ? 'true' : 'false'}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="false">No</SelectItem>
                                    <SelectItem value="true">Yes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Lift Required</Label>
                            <Select name="requires_lift" defaultValue={survey.requires_lift ? 'true' : 'false'}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="false">No</SelectItem>
                                    <SelectItem value="true">Yes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea name="notes" defaultValue={survey.notes} placeholder="Survey notes and observations..." rows={3} />
                    </div>

                    <DialogFooter className="flex justify-between items-center">
                        <div className="flex-1">
                            {!showDeleteConfirm ? (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={deleteSurveyMutation.isPending}
                                    >
                                        {deleteSurveyMutation.isPending ? "Deleting..." : "Confirm Delete"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                            <Button type="submit" disabled={updateSurveyMutation.isPending}>
                                {updateSurveyMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
