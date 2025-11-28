import React, { useEffect } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2,
  LayoutDashboard,
  Construction,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Import Section Components
import InstallationOverview from '@/components/naas/InstallationOverview';
import ResourceManagement from '@/components/naas/ResourceManagement';
import WorkExecution from '@/components/naas/WorkExecution';
import TechnicalConfig from '@/components/naas/TechnicalConfig';
import WorkflowTimeline from '@/components/shared/WorkflowTimeline';
import PageFilter from '@/components/shared/PageFilter';

export default function NaasInstallation() {
  const urlParams = new URLSearchParams(window.location.search);
  const siteId = urlParams.get("siteId") || "SITE-SE-01"; // Default if missing
  const orderId = urlParams.get("orderId");
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState(null);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const [pageFilters, setPageFilters] = React.useState({});

  useEffect(() => {
      const fid = pageFilters.facility_id;
      const oid = pageFilters.order_id;
      
      let nextUrl = createPageUrl('NaasInstallation');
      let params = new URLSearchParams();
      let hasChanges = false;

      if (fid && fid !== 'all') {
          params.set('siteId', fid);
          if (fid !== siteId) hasChanges = true;
      } else {
          params.set('siteId', siteId);
      }

      if (oid && oid !== 'all') {
          params.set('orderId', oid);
          if (oid !== orderId) hasChanges = true;
      } else if (orderId) {
          params.set('orderId', orderId);
      }

      if (hasChanges) {
          navigate(`${nextUrl}?${params.toString()}`);
      }
  }, [pageFilters, siteId, orderId, navigate]);

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      setShowSaveSuccess(true);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-20">
      <PageFilter onFilterChange={setPageFilters} defaultFilters={{ facility_id: siteId, order_id: orderId }} />

      {/* SECTION 1 — Header */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to={createPageUrl('Home')} className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={createPageUrl('SiteOverview')} className="hover:text-blue-600 transition-colors">
            Sites
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={createPageUrl('FiberOrdering') + `?siteId=${siteId}`} className="hover:text-blue-600 transition-colors">
            {siteId}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">{orderId || "Select Order"}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              NaaS Installation & Activation
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                Facility ID: {siteId} • Order ID: {orderId || "N/A"}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-sm text-gray-500">Retail / Enterprise</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-sm text-gray-500">Stockholm Municipality</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to={createPageUrl('DataSources')}>
              <Button variant="outline" className="bg-white">
                Workflow Timeline
              </Button>
            </Link>
            <Link to={createPageUrl('Rfs') + `?siteId=${siteId}&orderId=${orderId || ''}`}>
              <Button className="bg-[#0a1f33] hover:bg-[#153250]">
                Next: Ready For Service <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Workflow Timeline */}
      <WorkflowTimeline currentStep={6} />

      {/* SECTION 2 — Overview & Status */}
      <InstallationOverview siteId={siteId} orderId={orderId} />

      <Separator className="my-6" />

      {/* SECTION 3 & 4 — Resources & Scheduling */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Resource & Scheduling</h2>
        <ResourceManagement siteId={siteId} />
      </div>

      {/* SECTION 5 & 6 — Execution & Evidence */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Work Execution</h2>
        <WorkExecution siteId={siteId} />
      </div>

      {/* SECTION 7 & 8 — Technical Configuration */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Technical Configuration & Activation</h2>
        <TechnicalConfig siteId={siteId} />
      </div>

      {/* Save Success Popup */}
      <Dialog open={showSaveSuccess} onOpenChange={setShowSaveSuccess}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Draft Saved
            </DialogTitle>
            <DialogDescription>
              Your installation progress has been successfully saved to the system. You can resume later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSaveSuccess(false)}>Continue Working</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SECTION 9 — Completion Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:pl-80 z-40 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Phase</span>
            <div className="font-bold text-gray-900">Step 6 of 7: Installation</div>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden md:block" />
          <div className="text-sm">
            <span className="text-gray-500">Pending:</span> <span className="font-medium text-orange-600">Activation Tests</span>
          </div>
          {lastSaved && (
            <>
              <div className="h-8 w-px bg-gray-200 hidden md:block" />
              <div className="text-sm text-gray-500 italic">
                Draft saved {lastSaved.toLocaleTimeString()}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Link to={createPageUrl('Rfs') + `?siteId=${siteId}&orderId=${orderId || ''}`}>
            <Button className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Installation Completed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}