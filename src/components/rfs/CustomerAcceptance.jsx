import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileSignature, PenTool, AlertTriangle, FileWarning } from "lucide-react";
import { format } from "date-fns";

export default function CustomerAcceptance({ onSignOff, isSigned, signedData, acceptanceStatus, customerComplaint }) {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    comments: "",
    agreedToTerms: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreedToTerms) return;

    onSignOff({
      ...formData,
      signedAt: new Date().toISOString()
    });
  };

  // ACCEPTED STATE
  if (acceptanceStatus === 'ACCEPTED') {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" /> Customer Acceptance Completed
            </CardTitle>
            <Badge className="bg-green-600 hover:bg-green-700">ACCEPTED</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-green-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold block">Signed By:</span>
              {signedData?.name || "John Doe"}
            </div>
            <div>
              <span className="font-semibold block">Title:</span>
              {signedData?.title || "IT Director"}
            </div>
            <div>
              <span className="font-semibold block">Date:</span>
              {signedData?.signed_at ? format(new Date(signedData.signed_at), 'PPP p') : format(new Date(), 'PPP p')}
            </div>
            <div>
              <span className="font-semibold block">Reference:</span>
              DIG-SIG-{Math.floor(Math.random() * 100000)}
            </div>
          </div>
          {signedData?.comments && (
            <div className="mt-4 p-3 bg-white/50 rounded border border-green-100 text-sm italic">
              "{signedData.comments}"
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // PENDING STATE
  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-yellow-700" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-900">Acceptance Pending</h3>
            <p className="text-sm text-yellow-700">Installation is awaiting formal customer approval.</p>
          </div>
        </div>
        <Badge variant="outline" className="border-yellow-300 text-yellow-800 bg-yellow-100">
          PENDING
        </Badge>
      </div>

      {/* Customer Complaint Box (Only if PENDING) */}
      {acceptanceStatus === 'PENDING' && customerComplaint && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-red-800 flex items-center gap-2">
              <FileWarning className="w-4 h-4" /> Customer Reported Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-white rounded border border-red-100 text-red-700 italic">
              "{customerComplaint}"
            </div>
            <p className="text-xs text-red-600 mt-2 font-medium">
              * Acceptance blocked until this issue is resolved.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sign-off Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-blue-600" /> Formal Acceptance
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Signatory Name</Label>
                <Input
                  placeholder="Full Name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  placeholder="e.g. CTO, Site Manager"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Comments / Feedback (Optional)</Label>
              <Textarea
                placeholder="Any specific notes about the installation..."
                value={formData.comments}
                onChange={e => setFormData({ ...formData, comments: e.target.value })}
              />
            </div>

            <div className="flex items-start gap-2 p-4 bg-gray-50 rounded border">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={c => setFormData({ ...formData, agreedToTerms: c })}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that the service has been installed, tested, and meets the agreed specifications.
                </label>
                <p className="text-sm text-muted-foreground">
                  By checking this box, you formally accept the handover of the service.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!formData.agreedToTerms}
            >
              <PenTool className="w-4 h-4 mr-2" /> Sign & Accept Handover
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}