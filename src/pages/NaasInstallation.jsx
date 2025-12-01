import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  LayoutDashboard,
  Construction,
  Loader2,
  Clock
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
import ReplanButton from '@/components/ReplanButton';
import NaasReplanningModal from '@/components/naas/NaasReplanningModal';
import { detectAllIssues, isReplanningNeeded } from '@/utils/NaasAIDetection';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function NaasInstallation() {
  const urlParams = new URLSearchParams(window.location.search);
  const siteId = urlParams.get("siteId") || "SITE-SE-01"; // Default if missing
  const orderId = urlParams.get("orderId");
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [replanNeeded, setReplanNeeded] = useState(false);
  const [detectedIssues, setDetectedIssues] = useState([]);
  const [activeIssue, setActiveIssue] = useState(null);
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch order data for AI detection
  const { data: orderData } = useQuery({
    queryKey: ['naas-order', siteId, orderId],
    queryFn: () => base44.entities.FiberOrder.list(),
    select: (orders) => orders.find(o => o.facility_id === siteId),
    enabled: !!siteId
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FiberOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naas-order', siteId, orderId] });
    }
  });

  // AI Detection logic
  useEffect(() => {
    if (orderData) {
      const issues = detectAllIssues(orderData);
      setDetectedIssues(issues);
      setReplanNeeded(isReplanningNeeded(issues));

      // Auto-open modal if high-severity issues detected
      if (issues.length > 0 && isReplanningNeeded(issues)) {
        setActiveIssue(issues[0]); // Show first high-severity issue
      }
    }
  }, [orderData]);
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
    if (!orderData) return;
    setIsSaving(true);

    // In a real app, we would gather the state from child components here.
    // For now, we'll simulate saving by updating the 'updated_date' of the order
    // to show that we touched it.
    updateOrderMutation.mutate({
      id: orderData.id,
      data: {
        updated_date: new Date().toISOString(),
        // We could also save partial progress here if we had it in state
        // e.g., checklist_progress: currentChecklistState
      }
    }, {
      onSuccess: () => {
        setIsSaving(false);
        setLastSaved(new Date());
        setShowSaveSuccess(true);
      },
      onError: () => {
        setIsSaving(false);
        toast.error("Failed to save draft");
      }
    });
  };

  const handleCompleteInstallation = () => {
    if (!orderData) return;

    // Validate if ready (optional, but good practice)
    // if (orderData.checklist_completion < 100) { ... }

    const toastId = toast.loading("Finalizing installation...");

    updateOrderMutation.mutate({
      id: orderData.id,
      data: {
        status: 'installed', // or 'pending_rfs' depending on workflow
        installation_completed_date: new Date().toISOString(),
        rfs_status: 'pending' // Trigger RFS phase
      }
    }, {
      onSuccess: () => {
        toast.dismiss(toastId);
        toast.success("Installation marked as complete!");
        // Navigate to RFS page
        navigate(`${createPageUrl('Rfs')}?siteId=${siteId}&orderId=${orderId || ''}`);
      },
      onError: () => {
        toast.dismiss(toastId);
        toast.error("Failed to complete installation");
      }
    });
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
            <Button
              variant={replanNeeded ? "destructive" : "outline"}
              className={replanNeeded ? "animate-pulse shadow-md" : ""}
              onClick={() => {
                if (detectedIssues.length > 0) {
                  setActiveIssue(detectedIssues[0]);
                  setIsReplanModalOpen(true);
                } else {
                  toast.info("No issues detected. Installation is on track!");
                }
              }}
            >
              {replanNeeded ? "Replanning Required" : "AI Replan"}
            </Button>
            <Button variant="outline" onClick={() => setIsTimelineOpen(true)}>
              <Clock className="w-4 h-4 mr-2" /> Workflow Timeline
            </Button>
            <Button
              className="bg-[#0a1f33] hover:bg-[#153250]"
              onClick={handleCompleteInstallation}
            >
              Next: Ready For Service <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
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

      {/* NaaS AI Replanning Modal */}
      <NaasReplanningModal
        open={isReplanModalOpen}
        onOpenChange={setIsReplanModalOpen}
        detectedIssue={activeIssue}
        onKeepCurrent={() => {
          setIsReplanModalOpen(false);
        }}
        onManualEdit={(category) => {
          // Scroll to relevant section
          const sectionMap = {
            resource: 'Resource & Scheduling',
            schedule: 'Resource & Scheduling',
            execution: 'Work Execution',
            photo: 'Work Execution',
            config: 'Technical Configuration & Activation',
            activation: 'Technical Configuration & Activation'
          };
          const sectionTitle = sectionMap[category];
          // Note: jQuery-like :contains selector is not standard JS. 
          // Using a more robust finding method would be better, but keeping simple for now.
          const headings = Array.from(document.querySelectorAll('h2'));
          const element = headings.find(h => h.textContent.includes(sectionTitle));

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          toast.info("Please make manual edits in the highlighted section");
        }}
        onAcceptSuggestion={async (issue) => {
          if (!orderData) return;

          const toastId = toast.loading("Applying AI suggestion...");
          try {
            // Build update data based on issue category
            let updateData = {};

            switch (issue.category) {
              case 'resource':
                updateData = {
                  technician_team: issue.suggestedData.technician,
                  technician_status: issue.suggestedData.status
                };
                break;
              case 'schedule':
                updateData = {
                  scheduled_date: issue.suggestedData.date,
                  time_slot: issue.suggestedData.timeSlot,
                  weather_risk: issue.suggestedData.weatherRisk
                };
                break;
              case 'execution':
                updateData = {
                  checklist_completion: 100
                };
                break;
              case 'photo':
                updateData = {
                  photo_validation: 'pending'
                };
                break;
              case 'config':
                updateData = {
                  config_status: 'complete',
                  device_ip: issue.suggestedData.deviceIP,
                  subnet_mask: issue.suggestedData.subnetMask
                };
                break;
              case 'activation':
                updateData = {
                  activation_status: 'pending',
                  test_results: 'pending'
                };
                break;
            }

            await updateOrderMutation.mutateAsync({
              id: orderData.id,
              data: updateData
            });

            toast.dismiss(toastId);
            toast.success("AI suggestion applied successfully!");
            setIsReplanModalOpen(false);

            // Remove the resolved issue from detected issues
            const remainingIssues = detectedIssues.filter(i => i.category !== issue.category);
            setDetectedIssues(remainingIssues);
            setReplanNeeded(isReplanningNeeded(remainingIssues));
          } catch (error) {
            toast.dismiss(toastId);
            toast.error("Failed to apply suggestion. Please try again.");
            console.error("Apply suggestion error:", error);
          }
        }}
      />

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
          <Button
            className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
            onClick={handleCompleteInstallation}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Installation Completed
          </Button>
        </div>
      </div>
    </div>
  );
}