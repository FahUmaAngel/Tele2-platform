import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, FileSignature, PenTool } from "lucide-react";
import { format } from "date-fns";

export default function CustomerAcceptance({ onSignOff, isSigned, signedData }) {
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

  if (isSigned) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" /> Customer Acceptance Completed
          </CardTitle>
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
              DIG-SIG-{Math.floor(Math.random()*100000)}
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

  return (
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
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input 
                placeholder="e.g. CTO, Site Manager" 
                required
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Comments / Feedback (Optional)</Label>
            <Textarea 
              placeholder="Any specific notes about the installation..." 
              value={formData.comments} 
              onChange={e => setFormData({...formData, comments: e.target.value})}
            />
          </div>

          <div className="flex items-start gap-2 p-4 bg-gray-50 rounded border">
            <Checkbox 
              id="terms" 
              checked={formData.agreedToTerms}
              onCheckedChange={c => setFormData({...formData, agreedToTerms: c})}
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
  );
}