/**
 * ID Integrity Dashboard Component
 * Displays data integrity status and provides auto-fix controls
 */

import React from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

export default function IdIntegrityPanel({ report, onAutoFix, isFixing }) {
    const [showDetails, setShowDetails] = React.useState(false);

    if (!report) {
        return null;
    }

    const hasIssues = report.invalid > 0;

    return (
        <>
            <div className={`p-4 rounded-lg border ${hasIssues ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {hasIssues ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        <div>
                            <h3 className={`font-semibold ${hasIssues ? 'text-red-900' : 'text-green-900'}`}>
                                ID Integrity: {report.healthScore}%
                            </h3>
                            <p className={`text-sm ${hasIssues ? 'text-red-700' : 'text-green-700'}`}>
                                {report.valid} valid, {report.invalid} issues detected
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {hasIssues && (
                            <Button
                                onClick={onAutoFix}
                                disabled={isFixing}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isFixing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Fixing...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Auto-Fix All
                                    </>
                                )}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setShowDetails(true)}
                        >
                            View Details
                        </Button>
                    </div>
                </div>

                {hasIssues && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-white p-2 rounded border border-red-100">
                            <div className="text-xs text-gray-500">Suffix Mismatches</div>
                            <div className="text-lg font-bold text-red-600">
                                {report.issues.suffixMismatches}
                            </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-red-100">
                            <div className="text-xs text-gray-500">Duplicates</div>
                            <div className="text-lg font-bold text-red-600">
                                {report.issues.duplicateFacilities}
                            </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-red-100">
                            <div className="text-xs text-gray-500">Invalid Formats</div>
                            <div className="text-lg font-bold text-red-600">
                                {report.issues.invalidFacilityFormats + report.issues.invalidOrderFormats}
                            </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-red-100">
                            <div className="text-xs text-gray-500">Missing IDs</div>
                            <div className="text-lg font-bold text-red-600">
                                {report.issues.missingIds}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Details Dialog */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>ID Integrity Report</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of FacilityID-OrderID integrity issues
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-sm text-gray-500">Total Orders</div>
                                <div className="text-2xl font-bold">{report.totalOrders}</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded">
                                <div className="text-sm text-green-700">Valid</div>
                                <div className="text-2xl font-bold text-green-600">{report.valid}</div>
                            </div>
                            <div className="bg-red-50 p-3 rounded">
                                <div className="text-sm text-red-700">Issues</div>
                                <div className="text-2xl font-bold text-red-600">{report.invalid}</div>
                            </div>
                        </div>

                        {/* Mismatched Orders */}
                        {report.details.mismatchedOrders.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Mismatched Orders</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {report.details.mismatchedOrders.map((mismatch, idx) => (
                                        <div key={idx} className="bg-red-50 p-3 rounded border border-red-200">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-mono text-sm">
                                                        {mismatch.order.facility_id} → {mismatch.order.order_id}
                                                    </div>
                                                    <div className="text-xs text-red-700 mt-1">
                                                        {mismatch.description}
                                                    </div>
                                                    {mismatch.correctOrderId && (
                                                        <div className="text-xs text-green-700 mt-1">
                                                            Should be: <span className="font-mono font-bold">{mismatch.correctOrderId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge variant="destructive">{mismatch.issue}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Duplicate Facilities */}
                        {report.details.duplicateGroups.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Duplicate FacilityIDs</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {report.details.duplicateGroups.map((duplicate, idx) => (
                                        <div key={idx} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                            <div className="font-mono text-sm font-bold mb-1">
                                                {duplicate.facility_id}
                                            </div>
                                            <div className="text-xs text-yellow-700">
                                                {duplicate.count} orders found with this FacilityID
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                {duplicate.orders.map((order, orderIdx) => (
                                                    <div key={orderIdx} className="text-xs font-mono bg-white p-1 rounded">
                                                        OrderID: {order.order_id}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetails(false)}>
                            Close
                        </Button>
                        {hasIssues && (
                            <Button
                                onClick={() => {
                                    setShowDetails(false);
                                    onAutoFix();
                                }}
                                disabled={isFixing}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Auto-Fix All Issues
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
