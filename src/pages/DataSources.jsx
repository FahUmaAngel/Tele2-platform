import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";

export default function DataSources() {
  const { data: fiberOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['fiber-orders-ds'],
    queryFn: () => base44.entities.FiberOrder.list()
  });

  const { data: naasDesigns, isLoading: loadingNaas } = useQuery({
    queryKey: ['naas-designs-ds'],
    queryFn: () => base44.entities.NaasPreDesign.list()
  });

  const { data: siteSurveys, isLoading: loadingSurveys } = useQuery({
    queryKey: ['site-surveys-ds'],
    queryFn: () => base44.entities.SiteSurvey.list()
  });

  // Merge data based on facility_id
  const data = fiberOrders?.map(order => {
    const design = naasDesigns?.find(d => d.facility_id === order.facility_id) || {};
    const survey = siteSurveys?.find(s => s.facility_id === order.facility_id) || {};
    
    return {
      contact: order.site_contact,
      pricing: order.pricing_model,
      facilityId: order.facility_id,
      address: order.address,
      location: order.municipality,
      subcontractor: order.subcontractor,
      frostConstraint: order.frost_constraint,
      deliveryEst: order.delivery_est_date,
      deliveryConf: order.delivery_conf_date,
      permitLead: order.permit_lead_time,
      priority: order.priority,
      siteCat: order.category || design.site_category,
      locType: order.service_type || design.location_type,
      requirements: order.requirements || design.customer_requirements,
      hardware: (order.special_hw_needed || survey.requires_special_hardware) ? "Yes" : "No",
      lift: (order.lift_required || survey.requires_lift) ? "Yes" : "No",
      installType: order.install_type || survey.installation_type,
      leadTime: order.hw_lead_time || (survey.requires_special_hardware ? 60 : 30)
    };
  }) || [];

  if (loadingOrders || loadingNaas || loadingSurveys) return <div className="p-8">Loading data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Overview</h1>
          <p className="text-gray-500 mt-1">Comprehensive view of all project data points.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button className="bg-[#0a1f33]">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse min-w-[1800px]">
              <TableHeader className="bg-gray-100/80">
                <TableRow className="hover:bg-transparent border-b border-gray-200">
                  <TableHead colSpan={2} className="text-center border-r border-gray-200 font-bold text-gray-900 bg-gray-50">Customer Info</TableHead>
                  <TableHead colSpan={9} className="text-center border-r border-gray-200 font-bold text-gray-900 bg-blue-50/50">Fiber Ordering & Delivery</TableHead>
                  <TableHead colSpan={3} className="text-center border-r border-gray-200 font-bold text-gray-900 bg-green-50/50">NaaS Pre-Design</TableHead>
                  <TableHead colSpan={3} className="text-center border-r border-gray-200 font-bold text-gray-900 bg-orange-50/50">Site Survey & Documentation</TableHead>
                  <TableHead colSpan={1} className="text-center font-bold text-gray-900 bg-purple-50/50">Supplier</TableHead>
                </TableRow>
                <TableRow className="hover:bg-transparent bg-gray-50/50">
                  {/* Customer Info */}
                  <TableHead className="min-w-[150px]">Site Contact</TableHead>
                  <TableHead className="min-w-[120px] border-r border-gray-200">Pricing Model</TableHead>
                  
                  {/* Fiber Ordering */}
                  <TableHead className="min-w-[100px]">Facility ID</TableHead>
                  <TableHead className="min-w-[200px]">Address</TableHead>
                  <TableHead className="min-w-[120px]">Location</TableHead>
                  <TableHead className="min-w-[150px]">Subcontractor</TableHead>
                  <TableHead className="min-w-[150px]">Frost Period</TableHead>
                  <TableHead className="min-w-[120px]">Est. Delivery</TableHead>
                  <TableHead className="min-w-[120px]">Conf. Delivery</TableHead>
                  <TableHead className="min-w-[100px]">Permit (Days)</TableHead>
                  <TableHead className="min-w-[80px] border-r border-gray-200">Priority</TableHead>

                  {/* NaaS */}
                  <TableHead className="min-w-[100px]">Category</TableHead>
                  <TableHead className="min-w-[120px]">Type</TableHead>
                  <TableHead className="min-w-[150px] border-r border-gray-200">Requirements</TableHead>

                  {/* Site Survey */}
                  <TableHead className="min-w-[100px]">Special HW</TableHead>
                  <TableHead className="min-w-[80px]">Lift Req.</TableHead>
                  <TableHead className="min-w-[150px] border-r border-gray-200">Install Type</TableHead>

                  {/* Supplier */}
                  <TableHead className="min-w-[120px]">HW Lead Time (Days)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{row.contact}</TableCell>
                    <TableCell className="border-r border-gray-100">{row.pricing}</TableCell>
                    
                    <TableCell>{row.facilityId}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.subcontractor}</TableCell>
                    <TableCell>
                      {row.frostConstraint !== "None" ? (
                        <span className="text-orange-600 text-xs font-medium bg-orange-50 px-2 py-1 rounded">{row.frostConstraint}</span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>{row.deliveryEst}</TableCell>
                    <TableCell>{row.deliveryConf}</TableCell>
                    <TableCell className="text-center">{row.permitLead}</TableCell>
                    <TableCell className="border-r border-gray-100 text-center">
                      <Badge variant="outline" className={`
                        ${row.priority === 1 ? 'bg-red-50 text-red-700 border-red-200' : ''}
                        ${row.priority === 2 ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                        ${row.priority >= 3 ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      `}>
                        {row.priority}
                      </Badge>
                    </TableCell>

                    <TableCell>{row.siteCat}</TableCell>
                    <TableCell>{row.locType}</TableCell>
                    <TableCell className="border-r border-gray-100 text-xs text-gray-600">{row.requirements}</TableCell>

                    <TableCell className="text-center">
                      {row.hardware === "Yes" ? <span className="text-blue-600 font-bold">Yes</span> : <span className="text-gray-400">No</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.lift === "Yes" ? <span className="text-orange-600 font-bold">Yes</span> : <span className="text-gray-400">No</span>}
                    </TableCell>
                    <TableCell className="border-r border-gray-100 text-xs">{row.installType}</TableCell>

                    <TableCell className="text-center font-medium">{row.leadTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}