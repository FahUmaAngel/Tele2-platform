import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

const COLORS = {
  completed: '#10b981', // Emerald 500
  pending: '#e5e7eb',   // Gray 200
  fiber: '#3b82f6',     // Blue 500
  naas: '#8b5cf6'       // Violet 500
};

export default function RFSProgressOverview() {
  // Fetch both Fiber and NaaS orders
  const { data: fiberOrders, isLoading: isLoadingFiber } = useQuery({
    queryKey: ['fiber-orders-analytics'],
    queryFn: () => base44.entities.FiberOrder.list(),
    refetchInterval: 10000
  });

  const { data: naasOrders, isLoading: isLoadingNaas } = useQuery({
    queryKey: ['naas-orders-analytics'],
    queryFn: () => base44.entities.NaasPreDesign.list(),
    refetchInterval: 10000
  });

  if (isLoadingFiber || isLoadingNaas) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // 1. Combine and normalize data from both sources
  const normalizedFiberOrders = (fiberOrders || []).map(o => ({
    ...o,
    order_type: 'fiber',
    service_type: o.service_type || 'fiber'
  }));

  const normalizedNaasOrders = (naasOrders || []).map(o => ({
    ...o,
    order_type: 'naas',
    service_type: 'naas',
    // NaaS orders are considered "Completed" if they have been updated recently
    // In a real scenario, you'd check a specific status field
    status: o.status || 'In Progress'
  }));

  const allOrders = [...normalizedFiberOrders, ...normalizedNaasOrders];

  // Chart 1: Completion Status (all orders combined)
  const completedCount = allOrders.filter(o =>
    o.status === 'Completed' || o.status === 'completed'
  ).length;
  const totalCount = allOrders.length;
  const pendingCount = totalCount - completedCount;

  const completionData = [
    { name: 'Completed', value: completedCount },
    { name: 'In Progress', value: pendingCount }
  ];

  // Chart 2: Type Distribution (all orders, not just completed)
  const fiberCount = allOrders.filter(o =>
    o.service_type === 'fiber' || o.order_type === 'fiber'
  ).length;
  const naasCount = allOrders.filter(o =>
    o.service_type === 'naas' || o.order_type === 'naas'
  ).length;

  const typeShareData = [
    { name: 'Fiber', value: fiberCount },
    { name: 'NaaS', value: naasCount }
  ];

  // Chart 3: Monthly Progress (completed orders from both types)
  const completedOrders = allOrders.filter(o =>
    o.status === 'Completed' || o.status === 'completed'
  );

  const monthlyGroups = {};

  completedOrders.forEach(order => {
    // Use delivery_conf_date, completion_date, or updated_date as completion date proxy
    const dateStr = order.delivery_conf_date || order.completion_date || order.updated_date;
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;

    const monthKey = format(date, 'MMM yyyy'); // e.g. "Nov 2025"

    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = { month: monthKey, fiber: 0, naas: 0, sortTime: date.getTime() };
    }

    if (order.service_type === 'naas' || order.order_type === 'naas') {
      monthlyGroups[monthKey].naas += 1;
    } else {
      monthlyGroups[monthKey].fiber += 1;
    }
  });

  const monthlyData = Object.values(monthlyGroups).sort((a, b) => a.sortTime - b.sortTime);

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-2 border-b border-gray-100">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <PieChartIcon className="w-5 h-5 text-blue-600" />
          RFS Progress Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Column 1: Completed vs In Progress */}
          <div className="flex flex-col items-center border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">Completion Status</h3>
            <div className="h-[220px] w-full max-w-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="cell-completed" fill={COLORS.completed} />
                    <Cell key="cell-pending" fill={COLORS.pending} />
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-[-10px]">
              <span className="text-2xl font-bold text-gray-900">{Math.round((completedCount / (totalCount || 1)) * 100)}%</span>
              <p className="text-xs text-gray-400">Done</p>
            </div>
          </div>

          {/* Column 2: Fiber vs NaaS Share */}
          <div className="flex flex-col items-center border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">Type Distribution</h3>
            <div className="h-[220px] w-full max-w-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeShareData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                  >
                    <Cell key="cell-fiber" fill={COLORS.fiber} />
                    <Cell key="cell-naas" fill={COLORS.naas} />
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Column 3: Monthly Progress Bar Chart */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">Monthly Velocity</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="fiber" name="Fiber" stackId="a" fill={COLORS.fiber} radius={[0, 0, 2, 2]} />
                  <Bar dataKey="naas" name="NaaS" stackId="a" fill={COLORS.naas} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {monthlyData.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs mt-[-180px]">
                  No data
                </div>
              )}
            </div>

          </div>
        </div>

      </CardContent>
    </Card>
  );
}