import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, FileWarning, Eye, Loader2 } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

export default function AlertsPanel() {
  const navigate = useNavigate();

  // Fetch FiberOrder data
  const { data: orders, isLoading } = useQuery({
    queryKey: ['fiber-orders-alerts'],
    queryFn: () => base44.entities.FiberOrder.list(),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Detect alerts from orders
  const detectAlerts = (orders) => {
    if (!orders) return [];

    const alerts = [];

    orders.forEach(order => {
      // Problem 1: Rescheduling
      if (order.status === 'Delayed' || order.delay_risk === 'Delayed') {
        alerts.push({
          id: `reschedule-${order.facility_id}`,
          title: "Rescheduling",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "schedule",
          severity: "high",
          timestamp: order.updated_date,
          link: `${createPageUrl('FiberOrdering')}?siteId=${order.facility_id}`
        });
      }

      // Problem 2: Missing photos
      if (order.geocoding_status === 'failed' || order.geocoding_status === 'pending') {
        alerts.push({
          id: `photos-${order.facility_id}`,
          title: "Missing photos",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "doc",
          severity: "medium",
          timestamp: order.updated_date,
          link: `${createPageUrl('NaasInstallation')}?siteId=${order.facility_id}`
        });
      }

      // Problem 3: Technician can't reach customer
      if (order.access_status === 'No Access' || order.status === 'Access Issue') {
        alerts.push({
          id: `access-${order.facility_id}`,
          title: "Technician can't reach customer",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "access",
          severity: "high",
          timestamp: order.updated_date,
          link: `${createPageUrl('SiteSurvey')}?siteId=${order.facility_id}`
        });
      }

      // Problem 4: Client hasn't approved the job
      if (order.rfs_status === 'pending_approval') {
        alerts.push({
          id: `approval-${order.facility_id}`,
          title: "Client hasn't approved the job",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "approval",
          severity: "medium",
          timestamp: order.updated_date,
          link: `${createPageUrl('Rfs')}?siteId=${order.facility_id}&tab=acceptance`
        });
      }

      // RFS: Installation not approved (AI Detected)
      if (order.acceptanceStatus === 'PENDING') {
        alerts.push({
          id: `rfs-not-approved-${order.facility_id}`,
          title: "Installation not approved",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "approval",
          severity: "high",
          timestamp: order.updated_date,
          link: `${createPageUrl('Rfs')}?siteId=${order.facility_id}&tab=acceptance`
        });
      }

      // NaaS Installation AI Detection Alerts

      // NaaS 1: Technician Assignment Issues
      if (order.technician_status === 'unavailable' || order.technician_status === 'sick' ||
        (order.technician_response_time && order.technician_response_time > 24)) {
        alerts.push({
          id: `naas-technician-${order.facility_id}`,
          title: "Technician assignment issue",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "resource",
          severity: "high",
          timestamp: order.updated_date,
          link: `${createPageUrl('NaasInstallation')}?siteId=${order.facility_id}&section=resource`
        });
      }

      // NaaS 2: Schedule Conflicts
      if (order.schedule_conflict || order.weather_risk === 'high' || order.traffic_alert) {
        alerts.push({
          id: `naas-schedule-${order.facility_id}`,
          title: "Installation schedule conflict",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "schedule",
          severity: "high",
          timestamp: order.updated_date,
          link: `${createPageUrl('NaasInstallation')}?siteId=${order.facility_id}&section=schedule`
        });
      }

      // NaaS 3: Incomplete Checklist
      if (order.checklist_completion && order.checklist_completion < 100 && order.status === 'In Progress') {
        alerts.push({
          id: `naas-checklist-${order.facility_id}`,
          title: "Installation checklist incomplete",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "execution",
          severity: "medium",
          timestamp: order.updated_date,
          link: `${createPageUrl('NaasInstallation')}?siteId=${order.facility_id}&section=execution`
        });
      }

      // NaaS 4: Missing or Invalid Photos
      if ((order.photo_count && order.photo_count < 2) || order.photo_validation === 'failed') {
        alerts.push({
          id: `naas-photo-${order.facility_id}`,
          title: "Missing or invalid photos",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "doc",
          severity: "high",
          timestamp: order.updated_date,
          link: `${createPageUrl('NaasInstallation')}?siteId=${order.facility_id}&section=photo`
        });
      }

      // NaaS 5: Configuration Issues
      if (order.config_status === 'incomplete' || order.config_validation === 'failed') {
        alerts.push({
          id: `naas-config-${order.facility_id}`,
          title: "Device configuration issue",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "config",
          severity: "high",
          timestamp: order.updated_date,
          link: `${createPageUrl('NaasInstallation')}?siteId=${order.facility_id}&section=config`
        });
      }

      // NaaS 6: Activation Test Failures
      if (order.activation_status === 'failed' || order.test_results === 'failed') {
        alerts.push({
          id: `naas-activation-${order.facility_id}`,
          title: "Service activation failed",
          facility_id: order.facility_id,
          order_id: order.order_id,
          type: "activation",
          severity: "high",
          timestamp: order.updated_date,
          link: `${createPageUrl('NaasInstallation')}?siteId=${order.facility_id}&section=activation`
        });
      }
    });

    // Sort by most recent first
    return alerts.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  const alerts = detectAlerts(orders);

  // Calculate time duration
  const getTimeDuration = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'N/A';
    }
  };

  // Navigate to specific site
  const handleViewSite = (link) => {
    navigate(link);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'delay': return <Clock className="w-4 h-4" />;
      case 'doc': return <FileWarning className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getColor = (severity) => {
    switch (severity) {
      case 'high': return "text-red-600 bg-red-50 border-red-100";
      case 'medium': return "text-amber-600 bg-amber-50 border-amber-100";
      default: return "text-blue-600 bg-blue-50 border-blue-100";
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alerts & Risks
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alerts & Risks
          </CardTitle>
          <Badge variant="destructive" className="rounded-full">{alerts.length} New</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No alerts at this time
            </div>
          ) : (
            alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border ${getColor(alert.severity)}`}>
                    {getIcon(alert.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="font-mono">{alert.facility_id}</span>
                      <span>•</span>
                      <span className="font-mono">{alert.order_id || 'N/A'}</span>
                      <span>•</span>
                      <span>{getTimeDuration(alert.timestamp)}</span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => handleViewSite(alert.link)}
                  title={`View ${alert.facility_id}`}
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            ))
          )}
        </div>
        {alerts.length > 0 && (
          <div className="p-3 border-t border-gray-100 text-center">
            <Link to={`${createPageUrl('SiteOverview')}?status=Delayed,Blocked`}>
              <Button variant="ghost" size="sm" className="text-xs w-full text-gray-500">
                View All Alerts
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}