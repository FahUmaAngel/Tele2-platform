import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize2, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Fix for Leaflet default icon issues in some bundlers (though we use CircleMarker mostly)
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const staticSites = []; // Removed static sites to use real data only

const getColor = (status) => {
  switch(status) {
    case 'blocked': return '#ef4444'; // Red - Blocked
    case 'risk': return '#f59e0b';    // Yellow - At Risk
    case 'normal': return '#3b82f6';  // Blue - Smooth
    default: return '#9ca3af';
  }
};

const determineStatus = (order) => {
    if (order.status === 'Blocked' || order.status === 'Delayed' || order.status === 'exception') return 'blocked';
    if (order.delay_risk === 'At risk' || order.delay_risk === 'Delayed') return 'risk';
    return 'normal';
};

function MapBounds({ sites }) {
  const map = useMap();
  
  useEffect(() => {
    if (sites && sites.length > 0) {
      // Valid sites with coordinates
      const validSites = sites.filter(s => s.lat && s.lng);
      if (validSites.length > 0) {
        const bounds = L.latLngBounds(validSites.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [sites, map]);
  
  return null;
}

export default function MapWidget() {
  const queryClient = useQueryClient();

  const { data: fiberOrders } = useQuery({
    queryKey: ['fiber-orders-map'],
    queryFn: () => base44.entities.FiberOrder.list(),
    refetchInterval: 5000 
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FiberOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiber-orders-map'] });
      toast.success("Geocoding updated");
    }
  });

  const handleReGeocode = async (order) => {
      const fullAddress = `${order.address}, ${order.municipality || 'Stockholm'}`;
      toast.info(`Re-geocoding ${order.facility_id}...`);
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
        const results = await response.json();
        
        if (results && results.length > 0) {
            const lat = parseFloat(results[0].lat);
            const lng = parseFloat(results[0].lon);
            updateOrderMutation.mutate({
                id: order.id,
                data: {
                    lat, lng,
                    geocoding_status: "success",
                    geocoding_source: "OSM (Manual Retry)"
                }
            });
        } else {
            toast.error("Could not find coordinates for address");
            updateOrderMutation.mutate({
                id: order.id,
                data: { geocoding_status: "failed" }
            });
        }
      } catch (e) {
          toast.error("Geocoding service error");
      }
  };

  // Transform FiberOrders to Map Sites
  const dynamicSites = fiberOrders?.filter(o => o.lat && o.lng).map(order => ({
    id: order.facility_id || order.order_id,
    dbId: order.id,
    lat: order.lat,
    lng: order.lng,
    status: determineStatus(order), 
    address: order.address || "Unknown Address",
    customer: order.client || "Unknown Client",
    tech: order.technician_team || order.subcontractor || "Unassigned",
    pm: order.project_manager,
    startDate: order.project_start_date || order.created_date?.split('T')[0],
    error: order.status === 'Blocked' ? "Installation Blocked" : (order.delay_risk === 'At risk' ? "High Risk: Schedule Slip" : null),
    geoStatus: order.geocoding_status,
    rawOrder: order
  })) || [];

  // Filter out static sites that might collide with dynamic ones if needed, or just keep static for demo
  const allSites = [...staticSites, ...dynamicSites];

  return (
    <Card className="shadow-sm h-full flex flex-col border-gray-200">
      <CardHeader className="pb-2 bg-white z-10 border-b border-gray-100 flex-none">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Geographic Overview
            </CardTitle>
            <p className="text-xs text-gray-500">Real-time operational status across active sites</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"/> Stopped</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"/> At Risk</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> Normal</div>
          </div>
        </div>
      </CardHeader>
      
      <div className="flex-1 relative min-h-[500px] bg-gray-100 overflow-hidden rounded-b-lg">
        <MapContainer 
          center={[59.3293, 18.0686]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBounds sites={allSites} />

          {allSites.map((site, idx) => (
            <CircleMarker 
              key={`${site.id}-${idx}`}
              center={[site.lat, site.lng]}
              pathOptions={{ 
                color: 'white', 
                fillColor: getColor(site.status), 
                fillOpacity: 0.8, 
                weight: 2,
                radius: 12 
              }}
            >
              <Popup>
                <div className="min-w-[240px] p-1">
                  <div className="flex items-center justify-between mb-2 border-b pb-2">
                    <span className="font-bold text-sm truncate pr-2" title={`${site.id} - ${site.address}`}>
                        {site.id} - {site.address}
                    </span>
                    <div className="flex-shrink-0">
                        {site.status === 'blocked' && <AlertOctagon className="w-4 h-4 text-red-500" />}
                        {site.status === 'risk' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        {site.status === 'normal' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="grid grid-cols-[80px_1fr] gap-1">
                        <span className="font-semibold text-gray-500">Address:</span> 
                        <span>{site.address}</span>
                        
                        <span className="font-semibold text-gray-500">Customer:</span> 
                        <span>{site.customer}</span>
                        
                        <span className="font-semibold text-gray-500">Start Date:</span> 
                        <span>{site.startDate}</span>
                        
                        <span className="font-semibold text-gray-500">Team:</span> 
                        <span>{site.tech}</span>

                        {site.lat && site.lng && (
                           <>
                             <span className="font-semibold text-gray-500">Coords:</span>
                             <span className="font-mono text-[10px] pt-0.5">{site.lat.toFixed(4)}, {site.lng.toFixed(4)}</span>
                           </>
                        )}

                        {site.geoStatus && (
                           <>
                             <span className="font-semibold text-gray-500">Geocoding:</span>
                             <span className={site.geoStatus === 'success' ? 'text-green-600' : 'text-red-600'}>
                                {site.geoStatus}
                             </span>
                           </>
                        )}
                    </div>
                    
                    {site.error && (
                      <div className="p-2 bg-red-50 text-red-700 rounded border border-red-100 font-medium flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        {site.error}
                      </div>
                    )}

                    {site.rawOrder && (
                        <div className="flex gap-2 pt-2 border-t mt-2">
                             <Button size="sm" variant="outline" className="h-7 text-[10px] w-full" onClick={() => handleReGeocode(site.rawOrder)}>
                                <RefreshCw className="w-3 h-3 mr-1" /> Re-run Geo
                             </Button>
                             <Link to={`${createPageUrl('FiberOrdering')}?siteId=${site.id}`} className="w-full">
                               <Button size="sm" className="h-7 text-[10px] w-full bg-[#0a1f33] hover:bg-[#153250]">
                                  <ExternalLink className="w-3 h-3 mr-1" /> Details
                               </Button>
                             </Link>
                        </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
}