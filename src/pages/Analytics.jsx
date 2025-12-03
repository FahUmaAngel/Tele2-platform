import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Building2,
  Download,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

const COLORS = {
  primary: '#0a1f33',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  fiber: '#0ea5e9', // Bright cyan for better differentiation
  naas: '#f97316', // Orange for better differentiation
  completed: '#10b981',
  inProgress: '#3b82f6',
  delayed: '#ef4444',
  blocked: '#f59e0b',
};

// Color palette for geographic distribution bars
const GEO_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#a855f7', // Violet
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30');
  const [timePeriod, setTimePeriod] = useState('daily'); // daily, monthly, yearly

  // Fetch data
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

  // Combine and process data - FiberOrder already has service_type field
  const allOrders = useMemo(() => {
    const fiber = (fiberOrders || []).map(o => ({
      ...o,
      type: o.service_type || 'fiber', // Use actual service_type from data
      service_type: o.service_type || 'fiber' // Preserve original service_type
    }));
    const naas = (naasOrders || []).map(o => ({
      ...o,
      type: 'naas',
      service_type: 'naas'
    }));
    return [...fiber, ...naas];
  }, [fiberOrders, naasOrders]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = allOrders.length;
    const completed = allOrders.filter(o => o.status === 'Completed' || o.status === 'completed').length;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    const activeSites = allOrders.filter(o => o.status !== 'Completed' && o.status !== 'completed').length;

    return {
      totalOrders: total,
      completionRate,
      avgCycleTime: '12.5', // Placeholder
      activeSites
    };
  }, [allOrders]);

  // Order velocity data with time period support
  const velocityData = useMemo(() => {
    const groupedData = {};

    // Group orders by time period
    allOrders.forEach(order => {
      const dateStr = order.delivery_est_date || order.project_start_date || order.created_date;
      if (!dateStr) return;
      const orderDate = new Date(dateStr);
      let key;

      if (timePeriod === 'daily') {
        key = format(orderDate, 'MMM dd');
      } else if (timePeriod === 'monthly') {
        key = format(orderDate, 'MMM yyyy');
      } else { // yearly
        key = format(orderDate, 'yyyy');
      }

      if (!groupedData[key]) {
        groupedData[key] = { fiber: 0, naas: 0, date: key, sortDate: orderDate };
      }

      if (order.service_type === 'fiber') {
        groupedData[key].fiber++;
      } else if (order.service_type === 'naas') {
        groupedData[key].naas++;
      }
    });

    // Convert to array and sort by the actual date
    return Object.values(groupedData).sort((a, b) => {
      return a.sortDate - b.sortDate;
    });
  }, [allOrders, timePeriod]);

  // Status distribution
  const statusData = useMemo(() => {
    const groups = {};
    allOrders.forEach(order => {
      const status = order.status || 'Unknown';
      groups[status] = (groups[status] || 0) + 1;
    });

    return Object.entries(groups).map(([name, value]) => ({
      name,
      value
    }));
  }, [allOrders]);

  // Geographic distribution (top locations)
  const geoData = useMemo(() => {
    const locations = {};
    allOrders.forEach(order => {
      const loc = order.address || order.location || 'Unknown';
      const city = loc.split(',')[0].trim();
      locations[city] = (locations[city] || 0) + 1;
    });

    return Object.entries(locations)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [allOrders]);

  // Custom label renderer for Status Distribution - shows count inside near outer edge
  const renderInsideLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.75; // Position at 75% of radius (inside, near edge)
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
        style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.6)' }}
      >
        {value}
      </text>
    );
  };

  const isLoading = isLoadingFiber || isLoadingNaas;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics & Insights</h1>
            <p className="text-gray-500 mt-1">
              Comprehensive performance metrics and data visualization
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.totalOrders}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">+12.5%</span>
                      <span className="text-sm text-gray-500">vs last period</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.completionRate}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${kpis.completionRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg Cycle Time</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.avgCycleTime} <span className="text-lg text-gray-500">days</span></p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">-2.3 days</span>
                      <span className="text-sm text-gray-500">improvement</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Sites</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.activeSites}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex gap-2">
                        <span className="text-sm text-gray-600">In Progress</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Order Velocity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Order Velocity</CardTitle>
                <p className="text-sm text-gray-500">Order creation trends by time period</p>
              </div>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="fiber"
                      name="Fiber Orders"
                      stroke={COLORS.fiber}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="naas"
                      name="NaaS Orders"
                      stroke={COLORS.naas}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Status Distribution</CardTitle>
                <p className="text-sm text-gray-500">Orders by current status</p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderInsideLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GEO_COLORS[index % GEO_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        verticalAlign="top"
                        align="left"
                        layout="vertical"
                        wrapperStyle={{ paddingLeft: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Geographic Distribution</CardTitle>
                <p className="text-sm text-gray-500">Top 10 locations by order count</p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geoData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {geoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GEO_COLORS[index % GEO_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  );
}