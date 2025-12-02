import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SurveyCard from "@/components/site-survey/SurveyCard";
import WorkflowTimeline from '@/components/shared/WorkflowTimeline';
import PageFilter from '@/components/shared/PageFilter';
import ReplanButton from '@/components/ReplanButton';
import CreateSurveyDialog from "@/components/site-survey/CreateSurveyDialog";

export default function SiteSurvey() {
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get("siteId") || "";
  const orderId = searchParams.get("orderId") || "";

  const [isNewSurveyOpen, setIsNewSurveyOpen] = useState(false);
  const [replanNeeded, setReplanNeeded] = useState(false);

  // Mocking data since we might not have records yet, but using entity structure
  const { data: surveys } = useQuery({
    queryKey: ['site-surveys'],
    queryFn: () => base44.entities.SiteSurvey.list()
  });

  // Check for replan conditions (e.g. survey rejected or significant issues)
  useEffect(() => {
    if (surveys && surveys.length > 0) {
      const hasIssues = surveys.some(s => s.status === 'rejected' || s.feasibility === 'impossible');
      setReplanNeeded(hasIssues);
    }
  }, [surveys]);

  const [pageFilters, setPageFilters] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fid = pageFilters.facility_id;
    if (fid && fid !== 'all' && fid !== siteId) {
      navigate(`${createPageUrl('SiteSurvey')}?siteId=${fid}`);
    }
  }, [pageFilters.facility_id, siteId, navigate]);

  const filteredSurveys = surveys?.filter(survey => {
    // 1. Context Filter (Site + Order)
    if (siteId && survey.facility_id !== siteId) return false;
    if (orderId && survey.order_id && survey.order_id !== orderId) return false;

    // 2. Page Filters
    const f = pageFilters;
    if (f.facility_id && f.facility_id !== 'all' && !survey.facility_id?.toLowerCase().includes(f.facility_id.toLowerCase())) return false;

    if (f.search) {
      const s = f.search.toLowerCase();
      return survey.client?.toLowerCase().includes(s) || survey.address?.toLowerCase().includes(s) || survey.facility_id?.toLowerCase().includes(s);
    }
    return true;
  }) || [];

  return (
    <div className="space-y-8">
      <PageFilter onFilterChange={setPageFilters} defaultFilters={{ facility_id: siteId }} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Survey & Documentation</h1>
          <p className="text-gray-500 mt-1">Field reports and technical feasibility studies.</p>
          {orderId && <p className="text-xs text-blue-600 font-mono mt-1">Order Context: {orderId}</p>}
        </div>
        <div className="flex gap-3">
          <ReplanButton
            siteId={siteId}
            currentStep={3}
            variant={replanNeeded ? "destructive" : "outline"}
            className={replanNeeded ? "animate-pulse shadow-md" : ""}
          >
            {replanNeeded ? "Replanning Required" : "AI Replan"}
          </ReplanButton>
          <Button className="bg-[#0a1f33]" onClick={() => setIsNewSurveyOpen(true)}>New Survey</Button>
        </div>
      </div>

      {/* Workflow Timeline */}
      <WorkflowTimeline currentStep={3} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Empty State / Mock if no data */}
        {(!filteredSurveys || filteredSurveys.length === 0) && (
          <Card className="col-span-full p-12 text-center border-dashed">
            <div className="flex justify-center mb-4">
              <FileText className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Surveys Found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or create a new survey.</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsNewSurveyOpen(true)}>Create First Survey</Button>
          </Card>
        )}

        {filteredSurveys.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
      </div>

      <CreateSurveyDialog
        open={isNewSurveyOpen}
        onOpenChange={setIsNewSurveyOpen}
        siteId={siteId}
        orderId={orderId}
      />
    </div>
  );
}
