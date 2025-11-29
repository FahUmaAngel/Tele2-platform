import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

const COLORS = {
  // Status colors
  completed: '#10b981',    // Emerald 500
  inProgress: '#3b82f6',   // Blue 500
  delayed: '#ef4444',      // Red 500
  blocked: '#f59e0b',      // Amber 500
  delivered: '#8b5cf6',    // Violet 500
  // Service type colors
  fiber: '#3b82f6',        // Blue 500
  naas: '#8b5cf6',         // Violet 500
  // Progress colors
  progress1: '#60a5fa',    // Blue 400
  progress2: '#a78bfa',    // Violet 400
  progress5: '#f472b6',    // Pink 400
  progress6: '#fb923c',    // Orange 400
  progress7: '#10b981',    // Emerald 500
  // Monthly velocity colors
  fiberPlanned: '#93c5fd', // Blue 300
  fiberCompleted: '#3b82f6', // Blue 500
  naasPlanned: '#c4b5fd',  // Violet 300
  naasCompleted: '#8b5cf6' // Violet 500
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
    status: o.status || 'In Progress'
  }));

  const allOrders = [...normalizedFiberOrders, ...normalizedNaasOrders];

  // Chart 1: Completion Status by FiberOrder.status
  const statusGroups = {};
  allOrders.forEach(order => {
    const status = order.status || 'Unknown';
    // Group similar statuses
    let groupKey = status;
    if (['pending', 'Planned', 'Confirming', 'processing'].includes(status)) {
      groupKey = 'In Progress';
    } else if (status === 'Completed' || status === 'completed') {
      groupKey = 'Completed';
    } else if (status === 'Delayed') {
      groupKey = 'Delayed';
    } else if (status === 'Blocked') {
      groupKey = 'Blocked';
    } else if (status === 'Delivered' || status === 'In Transit') {
      groupKey = 'Delivered';
    } else if (status === 'Confirmed') {
      groupKey = 'Confirmed';
    }

    statusGroups[groupKey] = (statusGroups[groupKey] || 0) + 1;
  });

  const completionStatusData = Object.entries(statusGroups).map(([name, value]) => ({
    name,
    value,
    label: `${name} (${value})`
  }));

  // Chart 2: Type Distribution (completed orders only)
  const completedOrders = allOrders.filter(o =>
    o.status === 'Completed' || o.status === 'completed'
  );

  const fiberCompletedCount = completedOrders.filter(o =>
    o.service_type === 'fiber' || o.order_type === 'fiber'
  ).length;
  const naasCompletedCount = completedOrders.filter(o =>
    o.service_type === 'naas' || o.order_type === 'naas'
  ).length;

  const typeDistributionData = [
    { name: 'Fiber', value: fiberCompletedCount },
    { name: 'NaaS', value: naasCompletedCount }
  ].filter(item => item.value > 0);

  // Chart 3: Progress Distribution (based on SiteOverview logic)
  const progressGroups = {};
  allOrders.forEach(order => {
    let progress = "1. Fiber Ordering";

    if (order.status === 'Completed') {
      progress = "7. RFS Ready";
    } else if (order.status === 'Installation Scheduled') {
      progress = "6. Installation";
    } else if (order.status === 'Confirmed') {
      progress = "5. Order Processing";
    } else if (order.service_type === 'naas' || order.order_type === 'naas') {
      progress = "2. NaaS Pre-Design";
    }

    progressGroups[progress] = (progressGroups[progress] || 0) + 1;
  });

  const progressDistributionData = Object.entries(progressGroups).map(([name, value]) => ({
    name,
    value,
    label: `${name} (${value})`
  }));

  // Chart 4: Monthly Velocity (Planned vs Completed, grouped by service type)
  const monthlyGroups = {};

  // Process planned orders (using delivery_est_date)
  allOrders.forEach(order => {
    const dateStr = order.delivery_est_date;
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;

    const monthKey = format(date, 'MMM yyyy');

    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = {
        month: monthKey,
        fiberPlanned: 0,
        fiberCompleted: 0,
        naasPlanned: 0,
        naasCompleted: 0,
        sortTime: date.getTime()
      };
    }

    if (order.service_type === 'naas' || order.order_type === 'naas') {
      monthlyGroups[monthKey].naasPlanned += 1;
    } else {
      monthlyGroups[monthKey].fiberPlanned += 1;
    }
  });

  // Process completed orders (using delivery_conf_date)
  completedOrders.forEach(order => {
    const dateStr = order.delivery_conf_date || order.completion_date || order.updated_date;
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;

    const monthKey = format(date, 'MMM yyyy');

    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = {
        month: monthKey,
        fiberPlanned: 0,
        fiberCompleted: 0,
        naasPlanned: 0,
        naasCompleted: 0,
        sortTime: date.getTime()
      };
    }

    if (order.service_type === 'naas' || order.order_type === 'naas') {
      monthlyGroups[monthKey].naasCompleted += 1;
    } else {
      monthlyGroups[monthKey].fiberCompleted += 1;
    }
  });

  const monthlyVelocityData = Object.values(monthlyGroups).sort((a, b) => a.sortTime - b.sortTime);

  // Custom label renderer for pie charts
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    if (percent < 0.05) return null; // Don't show label if slice is too small
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {value}
      </text>
    );
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-2 border-b border-gray-100">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <PieChartIcon className="w-5 h-5 text-blue-600" />
          RFS Progress Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Chart 1: Completion Status by Status */}
          <div className="flex flex-col items-center border-b lg:border-b-0 pb-6 lg:pb-0">
            <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">Completion Status</h3>
            <div className="h-[220px] w-full max-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={renderCustomLabel}
                  >
                    {completionStatusData.map((entry, index) => {
                      let color = COLORS.inProgress;
                      if (entry.name === 'Completed') color = COLORS.completed;
                      else if (entry.name === 'Delayed') color = COLORS.delayed;
                      else if (entry.name === 'Blocked') color = COLORS.blocked;
                      else if (entry.name === 'Delivered') color = COLORS.delivered;
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Type Distribution (Completed Only) */}
          <div className="flex flex-col items-center border-b lg:border-b-0 pb-6 lg:pb-0">
            <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">Type Distribution (Completed)</h3>
            <div className="h-[220px] w-full max-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent, value }) => percent > 0 ? `${name}: ${value}` : ''}
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

          {/* Chart 3: Progress Distribution */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">Progress Distribution</h3>
            <div className="h-[220px] w-full max-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={renderCustomLabel}
                  >
                    {progressDistributionData.map((entry, index) => {
                      let color = COLORS.progress1;
                      if (entry.name.startsWith('2.')) color = COLORS.progress2;
                      else if (entry.name.startsWith('5.')) color = COLORS.progress5;
                      else if (entry.name.startsWith('6.')) color = COLORS.progress6;
                      else if (entry.name.startsWith('7.')) color = COLORS.progress7;
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Monthly Velocity (Planned vs Completed) */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-500 mb-4 text-center">Monthly Velocity</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyVelocityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
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
                  <Legend
                    wrapperStyle={{ fontSize: '11px' }}
                    iconType="rect"
                  />
                  <Bar dataKey="fiberPlanned" name="Fiber Planned" fill={COLORS.fiberPlanned} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fiberCompleted" name="Fiber Completed" fill={COLORS.fiberCompleted} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="naasPlanned" name="NaaS Planned" fill={COLORS.naasPlanned} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="naasCompleted" name="NaaS Completed" fill={COLORS.naasCompleted} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {monthlyVelocityData.length === 0 && (
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