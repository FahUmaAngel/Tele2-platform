import React from 'react';
import WorkflowVisualizer from '@/components/workflow/WorkflowVisualizer';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from '@/utils';

export default function WorkflowPresentation() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Simple Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-gray-900">Operational Workflow Guide</h1>
          </div>
        </div>
      </div>

      <div className="py-10">
        <WorkflowVisualizer />
      </div>
    </div>
  );
}