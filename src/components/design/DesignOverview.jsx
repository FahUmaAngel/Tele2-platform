import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User, AlertTriangle, Construction, CheckCircle2 } from "lucide-react";

export default function DesignOverview({ siteSurvey, loading }) {
  if (loading) return <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />;
  if (!siteSurvey) return null;

  // Note: Parent component should fetch and pass customer info if needed, or we display what we have
  return (
    <Card className="border-l-4 border-l-blue-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Site Overview
          </div>
          <Badge variant="outline" className="font-mono text-xs">
             {siteSurvey.facility_id || 'NO-ID'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <span className="text-gray-500 text-xs uppercase block mb-1">Site Name</span>
                <span className="font-medium">{siteSurvey.site_name}</span>
            </div>
             <div>
                <span className="text-gray-500 text-xs uppercase block mb-1">Address</span>
                <span className="font-medium">{siteSurvey.address}</span>
            </div>
             <div>
                <span className="text-gray-500 text-xs uppercase block mb-1">Surveyor</span>
                <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span>{siteSurvey.surveyor}</span>
                </div>
            </div>
             <div>
                <span className="text-gray-500 text-xs uppercase block mb-1">Date</span>
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{siteSurvey.date}</span>
                </div>
            </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
            <span className="text-gray-500 text-xs uppercase block mb-2">Site Conditions & Tags</span>
            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={siteSurvey.feasibility === 'feasible' ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}>
                    {siteSurvey.feasibility === 'feasible' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                    {siteSurvey.feasibility}
                </Badge>
                {siteSurvey.requires_lift && (
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100">
                        <Construction className="w-3 h-3 mr-1" /> Lift Required
                    </Badge>
                )}
                 {siteSurvey.requires_special_hardware && (
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">
                        Special HW
                    </Badge>
                )}
                <Badge variant="outline" className="text-gray-600">
                    {siteSurvey.installation_type}
                </Badge>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}