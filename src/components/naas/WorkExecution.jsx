import React from 'react';
import {
    CheckSquare,
    Camera,
    UploadCloud,
    Eye,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

import rackImg from '@/assets/rack_installation.jpg';
import cablingImg from '@/assets/cabling_setup.jpg';

export default function WorkExecution({ siteId }) {
    // Fetch installation data
    const { data: installationData } = useQuery({
        queryKey: ['naas-installation', siteId],
        queryFn: () => base44.entities.NaasInstallationData.list(),
        select: (data) => data.find(d => d.facility_id === siteId),
    });

    const checklistProgress = installationData?.checklist_completion || 0;
    const [checklistItems, setChecklistItems] = React.useState([
        { id: 1, label: "Equipment received and verified against BOM", checked: true, description: "Check all serial numbers against the delivery note." },
        { id: 2, label: "Rack mounting completed according to design", checked: true, description: "Ensure 1U spacing between active equipment." },
        { id: 3, label: "Power and grounding connections secured", checked: true, description: "Verify redundant power supplies are connected to different PDUs." },
        { id: 4, label: "Uplink cabling (Fiber/Copper) installed", checked: false, description: "Label all cables at both ends." },
        { id: 5, label: "Out-of-band management connected", checked: false, description: "Connect console server or LTE modem." },
        { id: 6, label: "Initial power-on self-test (POST) passed", checked: false, description: "Verify no hardware alarms on boot." },
    ]);

    const handleCheck = (id) => {
        setChecklistItems(checklistItems.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const progress = checklistProgress;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Digital Checklist */}
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                        Installation Checklist
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
                        <Progress value={progress} className="w-24 h-2" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {checklistItems.map((item) => (
                            <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <Checkbox
                                    id={`item-${item.id}`}
                                    checked={item.checked}
                                    onCheckedChange={() => handleCheck(item.id)}
                                    className="mt-1"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor={`item-${item.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {item.label}
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full mt-2">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Full SOP
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Standard Operating Procedure (SOP)</DialogTitle>
                                    <DialogDescription>
                                        Detailed installation guidelines for Site Type B (Retail).
                                    </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="space-y-4 text-sm text-gray-600">
                                        <h4 className="font-semibold text-gray-900">1. Site Preparation</h4>
                                        <p>Ensure the rack location is clear of debris and has adequate ventilation. Verify power availability (2x 16A feeds).</p>

                                        <h4 className="font-semibold text-gray-900">2. Equipment Mounting</h4>
                                        <p>Mount the router at the top of the rack (U42). Switch stack should follow below (U40-U38). Use cage nuts provided in the kit.</p>

                                        <h4 className="font-semibold text-gray-900">3. Cabling Standards</h4>
                                        <p>All fiber patches must be cleaned before insertion. Use velcro ties for cable management; zip ties are prohibited. Label all cables within 10cm of the connector.</p>

                                        <div className="bg-yellow-50 p-3 rounded border border-yellow-100 flex gap-2">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                                            <p className="text-yellow-800 text-xs">Critical: Do not bend fiber cables beyond the minimum bend radius (30mm).</p>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            {/* Photo & Evidence Upload */}
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-600" />
                        Photo Evidence
                    </CardTitle>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        2 Pending
                    </Badge>
                </CardHeader>
                <CardContent>
                    {/* Drag & Drop Area */}
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                        <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                            <UploadCloud className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="mt-2 font-medium text-gray-900">Drop photos here</h3>
                        <p className="text-xs text-gray-500 mt-1">or click to browse (JPG, PNG)</p>
                    </div>

                    {/* AI Vision Analysis */}
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg flex items-start gap-3">
                        <Eye className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <div className="text-xs font-semibold text-purple-900">AI Vision Analysis</div>
                            <div className="text-xs text-purple-700 mt-0.5">
                                Last upload detected: <span className="font-medium">Cisco ISR 1100</span>.
                                <br />
                                Status: <span className="text-green-600 font-medium">Correctly Mounted</span>.
                            </div>
                        </div>
                    </div>

                    {/* Recent Uploads */}
                    <div className="mt-4 space-y-3">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Uploads</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                                <img src={rackImg} alt="Rack" className="object-cover w-full h-full" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="secondary" className="h-7 text-xs">View</Button>
                                </div>
                                <div className="absolute bottom-1 right-1">
                                    <div className="bg-green-500 rounded-full p-0.5">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                                <img src={cablingImg} alt="Cabling" className="object-cover w-full h-full" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="secondary" className="h-7 text-xs">View</Button>
                                </div>
                                <div className="absolute bottom-1 right-1">
                                    <div className="bg-green-500 rounded-full p-0.5">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Smartphone className="w-4 h-4" />
                            <span>Mobile App Upload Available</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                            Send Link to Tech
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
