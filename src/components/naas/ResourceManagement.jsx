import React from 'react';
import {
  Users,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  UserPlus,
  CalendarCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ResourceManagement({ siteId }) {
  const [date, setDate] = React.useState(new Date());

  // Fetch order data
  const { data: orders } = useQuery({
    queryKey: ['fiber-orders', siteId],
    queryFn: () => base44.entities.FiberOrder.list(),
    select: (orders) => orders.find(o => o.facility_id === siteId),
  });

  const scheduledDate = orders?.scheduled_date ? new Date(orders.scheduled_date) : new Date();
  const technicianTeam = orders?.technician_team || 'Team Alpha';
  const subcontractor = orders?.subcontractor || 'NordGräv AB';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Technician Assignment Panel */}
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Technician Assignment
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <UserPlus className="w-4 h-4 mr-2" /> Assign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Assign Technician</DialogTitle>
                <DialogDescription>
                  Select a technician to assign to this installation site.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="field_tech">
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="field_tech">Field Technician</SelectItem>
                      <SelectItem value="remote_eng">Remote Engineer</SelectItem>
                      <SelectItem value="fiber_spec">Fiber Specialist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="technician">Technician</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech1">Marcus L. (Nearby)</SelectItem>
                      <SelectItem value="tech2">Sarah J. (Available)</SelectItem>
                      <SelectItem value="tech3">David K. (On Call)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Assignment Notes</Label>
                  <Input id="notes" placeholder="Optional instructions..." />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => alert("Technician assigned successfully!")}>Assign Technician</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Field Tech */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src="https://i.pravatar.cc/150?u=tech1" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Field Technician • {subcontractor}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">On Site</Badge>
          </div>

          {/* Remote Engineer */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src="https://i.pravatar.cc/150?u=tech2" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900">Alice Smith</p>
                <p className="text-xs text-gray-500">Remote Network Engineer • Tele2</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Remote</Badge>
          </div>

          {/* AI Suggestion */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-indigo-900">AI Recommendation</h4>
                <p className="text-xs text-indigo-700 mt-1">
                  Based on site complexity, we recommend adding a Fiber Specialist.
                  <span className="font-medium ml-1">Marcus L. is available nearby.</span>
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="mt-2 bg-white text-xs h-7 shadow-sm hover:bg-gray-50">
                      View Suggestion
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        AI Resource Recommendation
                      </DialogTitle>
                      <DialogDescription>
                        Analysis based on site complexity, location, and technician availability.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-indigo-900">Recommended Action</span>
                          <Badge className="bg-indigo-600 hover:bg-indigo-700">High Confidence</Badge>
                        </div>
                        <p className="text-sm text-indigo-800">
                          Assign <strong>Marcus L.</strong> (Fiber Specialist) to this site.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Why this recommendation?</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            <span>Marcus is currently 15km away from the site location.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            <span>Site has "VIP" category requiring senior certification which Marcus holds.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            <span>Historical data shows 20% faster completion for this site type with a specialist.</span>
                          </li>
                        </ul>
                      </div>

                      <DialogFooter className="sm:justify-start">
                        <Button type="button" variant="secondary" className="w-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => alert("Recommendation accepted. Marcus L. assigned.")}>
                          Accept Recommendation
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Scheduling */}
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Installation Schedule
          </CardTitle>
          <Badge className="bg-blue-600">Confirmed</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium uppercase">Date</label>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                {format(scheduledDate, "MMMM d, yyyy")}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium uppercase">Time Slot</label>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="w-4 h-4 text-gray-400" />
                09:00 AM - 01:00 PM
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Reschedule Installation
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* AI Optimizer */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-green-900">Optimization Insight</h4>
                <p className="text-xs text-green-800 mt-1">
                  Weather forecast is clear for the selected date. Fiber readiness confirmed.
                  <br />
                  <span className="font-medium">This slot has a 98% success probability.</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}