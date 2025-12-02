import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  MapPin,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Construction,
  AlertTriangle,
  FileText,
  Download,
  PenTool
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import PDFPreviewDialog from './PDFPreviewDialog';

export default function SurveyCard({ survey }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  const { data: order } = useQuery({
    queryKey: ['fiber-order-client', survey.facility_id],
    queryFn: async () => {
      if (!survey.facility_id) return null;
      const res = await base44.entities.FiberOrder.list({ facility_id: survey.facility_id });
      return res?.[0] || null;
    },
    enabled: !!survey.facility_id
  });

  const queryClient = useQueryClient();

  const updateSurveyMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.SiteSurvey.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-surveys'] });
    },
    onError: (err) => {
      console.error("Failed to update survey:", err);
      alert(`Failed to update survey: ${err.message}`);
    }
  });

  const handleComplete = (e) => {
    e.stopPropagation();
    if (confirm("Mark survey as completed?")) {
      updateSurveyMutation.mutate({ id: survey.id, status: 'Completed' });
    }
  };

  const generatePDFDoc = () => {
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Site Survey Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

    // Line separator
    yPosition += 10;
    doc.setDrawColor(200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);

    // Survey IDs
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text('Survey Information', 20, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Facility ID: ${survey.facility_id || 'N/A'}`, 20, yPosition);

    if (survey.order_id) {
      yPosition += 6;
      doc.text(`Order ID: ${survey.order_id}`, 20, yPosition);
    }

    // Client Information
    yPosition += 12;
    doc.setFont(undefined, 'bold');
    doc.text('Client Information', 20, yPosition);

    yPosition += 8;
    doc.setFont(undefined, 'normal');
    doc.text(`Client: ${order?.client || survey.client || 'N/A'}`, 20, yPosition);

    yPosition += 6;
    const address = survey.address || order?.address || 'N/A';
    doc.text(`Address: ${address}`, 20, yPosition);

    // Survey Details
    yPosition += 12;
    doc.setFont(undefined, 'bold');
    doc.text('Survey Details', 20, yPosition);

    yPosition += 8;
    doc.setFont(undefined, 'normal');
    doc.text(`Surveyor: ${survey.surveyor || 'N/A'}`, 20, yPosition);

    yPosition += 6;
    doc.text(`Survey Date: ${survey.date || 'N/A'}`, 20, yPosition);

    yPosition += 6;
    doc.text(`Feasibility: ${survey.feasibility || 'N/A'}`, 20, yPosition);

    yPosition += 6;
    doc.text(`Installation Type: ${survey.installation_type || 'N/A'}`, 20, yPosition);

    // Requirements
    yPosition += 12;
    doc.setFont(undefined, 'bold');
    doc.text('Special Requirements', 20, yPosition);

    yPosition += 8;
    doc.setFont(undefined, 'normal');
    doc.text(`Special Hardware: ${survey.requires_special_hardware ? 'Yes' : 'No'}`, 20, yPosition);

    yPosition += 6;
    doc.text(`Lift Required: ${survey.requires_lift ? 'Yes' : 'No'}`, 20, yPosition);

    // Notes
    if (survey.notes) {
      yPosition += 12;
      doc.setFont(undefined, 'bold');
      doc.text('Surveyor Notes', 20, yPosition);

      yPosition += 8;
      doc.setFont(undefined, 'normal');
      const splitNotes = doc.splitTextToSize(survey.notes, pageWidth - 40);
      doc.text(splitNotes, 20, yPosition);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Tele2 Site Survey Report - Confidential', pageWidth / 2, footerY, { align: 'center' });

    return doc;
  };

  const handleDownloadPDF = (e) => {
    if (e) e.stopPropagation();

    try {
      const doc = generatePDFDoc();
      const filename = `Survey_${survey.facility_id}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Generate PDF as blob
      const pdfBlob = doc.output('blob');

      // Use FileSaver.js to download with proper filename
      saveAs(pdfBlob, filename);

      console.log('PDF download initiated with FileSaver:', filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShowPreview = (e) => {
    e.stopPropagation();
    setShowPDFPreview(true);
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.3, type: "spring" } }}
      className="h-full"
    >
      <Card className={`h-full transition-shadow duration-300 ${isExpanded ? 'shadow-lg ring-1 ring-blue-100' : 'hover:shadow-md'}`}>
        <CardHeader className="pb-3 cursor-pointer" onClick={toggleExpand}>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                {order?.client || survey.client}
              </CardTitle>
              <span className="text-xs font-mono text-gray-500 ml-6">
                {survey.facility_id || "NO-ID"}
                {survey.order_id && <span className="mx-2 text-gray-300">|</span>}
                {survey.order_id && <span>{survey.order_id}</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {survey.feasibility === 'feasible' ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                  <CheckCircle className="w-3 h-3" /> Feasible
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                  <XCircle className="w-3 h-3" /> Issues
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Collapsed Content (Always Visible) */}
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs">
                <User className="w-3 h-3 text-gray-400" />
                <span className="font-medium text-gray-900">{survey.surveyor}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>{survey.date}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {survey.installation_type || "Standard"}
              </Badge>
              {survey.requires_special_hardware && (
                <Badge variant="outline" className="text-xs font-normal bg-purple-50 text-purple-700 border-purple-100">
                  Special HW
                </Badge>
              )}
              {survey.requires_lift && (
                <Badge variant="outline" className="text-xs font-normal bg-orange-50 text-orange-700 border-orange-100">
                  Lift Req.
                </Badge>
              )}
            </div>
          </div>

          {/* Expand Trigger */}
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
              className="w-full h-6 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4 border-t border-gray-100 mt-2">

                  {/* Detailed Address */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Address</span>
                    <p className="text-sm text-gray-800">{survey.address || "No address recorded"}</p>
                  </div>

                  {/* Detailed Requirements Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Construction className="w-3 h-3" /> Installation
                      </span>
                      <p className="text-sm font-medium">{survey.installation_type}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Constraints
                      </span>
                      <p className="text-sm text-gray-700">
                        {survey.requires_lift ? "Lift Needed, " : ""}
                        {survey.requires_special_hardware ? "Custom HW" : "Standard"}
                      </p>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {survey.notes && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Surveyor Notes
                      </span>
                      <div className="text-sm text-gray-600 bg-yellow-50/50 p-3 rounded border border-yellow-100 italic">
                        "{survey.notes}"
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        survey.onEdit?.(survey);
                      }}
                    >
                      <PenTool className="w-3 h-3 mr-2" /> Edit
                    </Button>
                    <Link
                      to={`${createPageUrl('DesignCustomer')}?siteId=${survey.facility_id}&orderId=${survey.order_id || order?.order_id}`}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button className="w-full bg-[#0a1f33] hover:bg-[#153250] h-8 text-xs">
                        Design
                      </Button>
                    </Link>
                    {survey.status !== 'Completed' && (
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-xs"
                        onClick={handleComplete}
                      >
                        <CheckCircle className="w-3 h-3 mr-2" /> Complete
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={handleShowPreview}
                    >
                      <Download className="w-3 h-3 mr-2" /> PDF Report
                    </Button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        survey={survey}
        order={order}
        onExport={handleDownloadPDF}
        onEdit={() => survey.onEdit?.(survey)}
      />
    </motion.div >
  );
}