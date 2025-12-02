import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PDFPreviewDialog({ open, onOpenChange, survey, order, onExport, onEdit }) {
    const printRef = useRef();

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowPrint = window.open('', '', 'width=800,height=600');
        windowPrint.document.write(`
            <html>
                <head>
                    <title>Site Survey Report - ${survey.facility_id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { color: #0a1f33; border-bottom: 2px solid #0a1f33; padding-bottom: 10px; }
                        h2 { color: #0a1f33; margin-top: 20px; font-size: 16px; }
                        .info-row { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; }
                        .value { color: #000; }
                        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                        .badge-green { background: #dcfce7; color: #166534; }
                        .badge-red { background: #fee2e2; color: #991b1b; }
                        .notes { background: #fef9c3; padding: 12px; border-left: 3px solid #eab308; margin-top: 10px; }
                        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <div class="footer">Tele2 Site Survey Report - Confidential</div>
                </body>
            </html>
        `);
        windowPrint.document.close();
        windowPrint.focus();
        windowPrint.print();
        windowPrint.close();
    };

    if (!survey) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Site Survey Report Preview</DialogTitle>
                    <p className="text-sm text-gray-500">
                        Generated: {new Date().toLocaleString()}
                    </p>
                </DialogHeader>

                {/* Preview Content */}
                <div ref={printRef} className="space-y-6 p-6 bg-white border rounded-lg">
                    {/* Header */}
                    <div className="text-center border-b pb-4">
                        <h1 className="text-3xl font-bold text-[#0a1f33]">Site Survey Report</h1>
                    </div>

                    {/* Survey Information */}
                    <div>
                        <h2 className="text-lg font-bold text-[#0a1f33] mb-3">Survey Information</h2>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-600">Facility ID:</span>
                                <span className="font-mono">{survey.facility_id || 'N/A'}</span>
                            </div>
                            {survey.order_id && (
                                <div className="flex gap-2">
                                    <span className="font-semibold text-gray-600">Order ID:</span>
                                    <span className="font-mono">{survey.order_id}</span>
                                </div>
                            )}
                            <div className="flex gap-2 items-center">
                                <span className="font-semibold text-gray-600">Feasibility:</span>
                                {survey.feasibility === 'feasible' ? (
                                    <Badge className="bg-green-50 text-green-700 border-green-200">Feasible</Badge>
                                ) : (
                                    <Badge className="bg-red-50 text-red-700 border-red-200">Issues</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Client Information */}
                    <div>
                        <h2 className="text-lg font-bold text-[#0a1f33] mb-3">Client Information</h2>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-600">Client:</span>
                                <span>{order?.client || survey.client || 'N/A'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-600">Address:</span>
                                <span>{survey.address || order?.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Survey Details */}
                    <div>
                        <h2 className="text-lg font-bold text-[#0a1f33] mb-3">Survey Details</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="font-semibold text-gray-600">Surveyor:</span>
                                <p>{survey.surveyor || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Survey Date:</span>
                                <p>{survey.date || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Installation Type:</span>
                                <p>{survey.installation_type || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Status:</span>
                                <p>{survey.status || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Special Requirements */}
                    <div>
                        <h2 className="text-lg font-bold text-[#0a1f33] mb-3">Special Requirements</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-600">Special Hardware:</span>
                                <Badge variant={survey.requires_special_hardware ? "default" : "outline"}>
                                    {survey.requires_special_hardware ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-600">Lift Required:</span>
                                <Badge variant={survey.requires_lift ? "default" : "outline"}>
                                    {survey.requires_lift ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Surveyor Notes */}
                    {survey.notes && (
                        <div>
                            <h2 className="text-lg font-bold text-[#0a1f33] mb-3">Surveyor Notes</h2>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <p className="text-gray-700 italic">"{survey.notes}"</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => {
                            onEdit();
                            onOpenChange(false);
                        }}
                        className="gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                    <Button
                        onClick={onExport}
                        className="bg-[#0a1f33] hover:bg-[#153250] gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
