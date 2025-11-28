import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, User } from "lucide-react";

export default function MapRoutePanel({ siteId, selectedOrder }) {
  return (
    <Card className="h-full border-none shadow-sm flex flex-col">
      <CardHeader className="px-4 py-3 border-b border-gray-100 bg-white flex flex-row justify-between items-center">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Logistics Map
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs h-7">Full Screen</Button>
      </CardHeader>
      <div className="flex-1 bg-gray-100 relative min-h-[300px] w-full overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-multiply" />
        
        {/* Site Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-pulse">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="mt-2 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-gray-800 group-hover:scale-105 transition-transform">
            {siteId}
          </div>
        </div>

        {/* Subcontractor Marker (Mock) */}
        {selectedOrder && (
          <div className="absolute top-1/3 left-1/3 flex flex-col items-center group cursor-pointer">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Truck className="w-4 h-4 text-white" />
            </div>
             <div className="mt-1 bg-white px-2 py-0.5 rounded shadow text-[10px] font-bold text-gray-800">
                {selectedOrder.subcontractor}
            </div>
            {/* Mock Route Line */}
            <svg className="absolute top-4 left-4 w-32 h-32 pointer-events-none overflow-visible">
               <path d="M0 0 Q 50 50 100 100" stroke="#f97316" strokeWidth="2" strokeDasharray="4 2" fill="none" />
            </svg>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-100">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                      <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                      <div className="text-xs font-medium text-gray-500 uppercase">Est. Travel Time</div>
                      <div className="text-sm font-bold text-gray-900">2h 15m</div>
                  </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                  Suggest Route
              </Button>
           </div>
        </div>
      </div>
    </Card>
  );
}

import { Truck } from 'lucide-react';