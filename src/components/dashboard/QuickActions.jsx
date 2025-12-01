import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Calendar, UserPlus, FilePlus, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuickActions() {
  const actions = [
    { label: "New Fiber Order", icon: Plus, color: "bg-blue-600 hover:bg-blue-700", link: 'FiberOrdering' },
    { label: "Schedule Survey", icon: Calendar, color: "bg-indigo-600 hover:bg-indigo-700", link: 'SiteSurvey' },
    { label: "Assign Tech", icon: UserPlus, color: "bg-purple-600 hover:bg-purple-700", link: 'UserManagement' },
    { label: "Create Site", icon: FilePlus, color: "bg-emerald-600 hover:bg-emerald-700", link: 'FiberOrdering' },
    { label: "Data Inspector", icon: Database, color: "bg-gray-600 hover:bg-gray-700", link: 'DataViewer' },
  ];

  // Helper function to create page URL, assuming it's defined elsewhere or needs to be added
  // For this example, we'll just return the link as is, or you might need to define createPageUrl
  const createPageUrl = (link) => `/${link}`; // Placeholder, adjust as per your routing logic

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-2 flex items-center justify-center gap-2 overflow-x-auto">
        {actions.map((action, idx) => (
          <Link key={idx} to={action.link !== '#' ? createPageUrl(action.link) : '#'}>
            <Button
              size="sm"
              className={`${action.color} text-white shadow-sm border-0 flex items-center gap-2 whitespace-nowrap transition-all hover:-translate-y-0.5`}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}