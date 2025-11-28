import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Dashboard Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WorkflowPipeline from '@/components/dashboard/WorkflowPipeline';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import ActivitySchedule from '@/components/dashboard/ActivitySchedule';
import MapWidget from '@/components/dashboard/MapWidget';
import SubcontractorStatus from '@/components/dashboard/SubcontractorStatus';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import RFSProgressOverview from '@/components/dashboard/RFSProgressOverview';

export default function Home() {
  const [role, setRole] = useState('manager'); // 'manager' or 'operator'

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* Page Header & Role Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, Amin. Here's your operational overview for today.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
            <span className={`text-sm font-medium ${role === 'operator' ? 'text-blue-600' : 'text-gray-500'}`}>Operator View</span>
            <Switch 
              checked={role === 'manager'}
              onCheckedChange={(checked) => setRole(checked ? 'manager' : 'operator')}
            />
            <span className={`text-sm font-medium ${role === 'manager' ? 'text-blue-600' : 'text-gray-500'}`}>Manager View</span>
          </div>
        </div>

        {/* A. Header KPIs (Hidden) */}
        {/* <DashboardHeader role={role} /> */}

        {/* B. Main Body Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Row 1: Pipeline (Hidden) */}
          {/* <div className="xl:col-span-4">
            <WorkflowPipeline />
          </div> */}

          {/* Row 1: Map - Taking center stage */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="xl:col-span-8 xl:row-span-2 min-h-[500px]"
          >
            <MapWidget />
          </motion.div>

          {/* Side Column: Alerts & Schedule */}
          <div className="xl:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            >
              <AlertsPanel />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            >
              <ActivitySchedule />
            </motion.div>
            </div>

            {/* Row 2: Analytics */}
            <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
             className="xl:col-span-12"
            >
             <RFSProgressOverview />
            </motion.div>

            {/* Hidden Components */}
          {/* <div className="xl:col-span-1 space-y-6">
            {role === 'manager' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <SubcontractorStatus />
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <RecentActivity />
            </motion.div>
          </div> */}

        </div>

      </div>

      {/* C. Footer Shortcuts */}
      <QuickActions />
    </div>
  );
}