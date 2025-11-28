import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, Activity, ShoppingCart, Bell, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardHeader({ role }) {
  // Mock Data
  const stats = [
    { title: "Total Sites", value: "1,248", trend: "+12 this week", trendDir: "up", icon: LayoutGrid, color: "bg-blue-500", show: "all" },
    { title: "In Progress", value: "342", trend: "+5% vs last mo", trendDir: "up", icon: Activity, color: "bg-indigo-500", show: "all" },
    { title: "RFS Ready", value: "892", trend: "+18 this week", trendDir: "up", icon: CheckCircle2, color: "bg-green-500", show: "all" },
    { title: "Critical Delays", value: "14", trend: "-2 vs yesterday", trendDir: "down", icon: AlertTriangle, color: "bg-red-500", show: "all" },
    { title: "Active Alerts", value: "8", trend: "New issues", trendDir: "up", icon: Bell, color: "bg-orange-500", show: "all" },
    { title: "New Orders", value: "24", trend: "This week", trendDir: "up", icon: ShoppingCart, color: "bg-purple-500", show: "manager" },
  ];

  const filteredStats = role === 'manager' ? stats : stats.filter(s => s.show === 'all');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {filteredStats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                {stat.trend && (
                  <div className={`flex items-center text-xs font-medium ${stat.trendDir === 'up' && stat.title !== 'Critical Delays' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendDir === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</h3>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}