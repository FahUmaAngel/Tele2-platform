import React, { useState } from 'react';
import { 
  Database, 
  Truck, 
  Activity, 
  ArrowRight, 
  FileText, 
  MapPin, 
  Users, 
  Layers, 
  Network, 
  CheckCircle, 
  Clock, 
  Server, 
  Box,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// --- MOCK DATA & CONFIGURATION ---

const DATA_STREAMS = [
  {
    id: 'site',
    title: 'Site & Contract Data',
    icon: MapPin,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Foundation data regarding location, ownership, and customer agreements.',
    fields: ['FacilityID', 'SiteID', 'Address', 'Municipality', 'Ownership', 'Access Type', 'Order Details', 'Frost Constraint'],
    workflowSteps: ['Fiber Ordering', 'Pre-Design', 'Survey', 'Design Approval']
  },
  {
    id: 'supply',
    title: 'Subcontractor & Supply',
    icon: Truck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Logistics, hardware procurement, and external workforce management.',
    fields: ['Subcontractor ID', 'Fiber Shutdown Sched', 'Hardware Status', 'Delivery Dates', 'Material BOM', 'Vendor SLA'],
    workflowSteps: ['Order Processing', 'Installation', 'RFS']
  },
  {
    id: 'install',
    title: 'Installation & Activation',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Technical execution, network configuration, and service validation.',
    fields: ['Tech Design Doc', 'Install Schedule', 'Network Health', 'RFS Confirmation', 'Billing Triggers', 'Test Results'],
    workflowSteps: ['Installation', 'RFS', 'Handover']
  }
];

const WORKFLOW_STAGES = [
  { id: 1, name: 'Fiber Ordering', streams: ['site'] },
  { id: 2, name: 'NaaS Pre-Design', streams: ['site', 'supply'] },
  { id: 3, name: 'Site Survey', streams: ['site', 'install'] },
  { id: 4, name: 'Design Approval', streams: ['site', 'install'] },
  { id: 5, name: 'Order Processing', streams: ['supply'] },
  { id: 6, name: 'Installation', streams: ['supply', 'install'] },
  { id: 7, name: 'Ready For Service', streams: ['install', 'site'] }
];

const SCHEMA_TABLES = [
  {
    name: 'Sites',
    pk: 'site_id',
    fields: [
      { name: 'facility_id', type: 'FK -> Facilities' },
      { name: 'address_line1', type: 'varchar' },
      { name: 'municipality', type: 'varchar' },
      { name: 'category', type: 'enum(S,M,L,VIP)' },
      { name: 'access_code', type: 'varchar' }
    ]
  },
  {
    name: 'Orders',
    pk: 'order_id',
    fields: [
      { name: 'site_id', type: 'FK -> Sites' },
      { name: 'contract_id', type: 'FK -> Contracts' },
      { name: 'status', type: 'enum' },
      { name: 'priority', type: 'int' },
      { name: 'req_delivery_date', type: 'date' }
    ]
  },
  {
    name: 'Subcontractors',
    pk: 'sub_id',
    fields: [
      { name: 'company_name', type: 'varchar' },
      { name: 'service_type', type: 'varchar' },
      { name: 'rating', type: 'float' },
      { name: 'active_contracts', type: 'int' }
    ]
  },
  {
    name: 'Installation',
    pk: 'install_id',
    fields: [
      { name: 'order_id', type: 'FK -> Orders' },
      { name: 'tech_id', type: 'FK -> Users' },
      { name: 'scheduled_start', type: 'datetime' },
      { name: 'completion_date', type: 'datetime' },
      { name: 'status', type: 'enum' }
    ]
  }
];

// --- SUB-COMPONENTS ---

const DataStreamCard = ({ stream, onClick, isActive }) => (
  <Card 
    className={`cursor-pointer transition-all hover:shadow-md border-2 ${isActive ? 'border-blue-500 shadow-md' : 'border-transparent'}`}
    onClick={onClick}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${stream.bgColor}`}>
          <stream.icon className={`w-6 h-6 ${stream.color}`} />
        </div>
        <Badge variant="outline" className="text-xs">Core Stream</Badge>
      </div>
      <CardTitle className="mt-4 text-lg">{stream.title}</CardTitle>
      <CardDescription className="line-clamp-2">{stream.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-xs text-gray-500 font-medium mb-2">USED IN:</div>
      <div className="flex flex-wrap gap-1">
        {stream.workflowSteps.slice(0, 3).map(step => (
          <span key={step} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded uppercase font-semibold">
            {step}
          </span>
        ))}
        {stream.workflowSteps.length > 3 && (
          <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] rounded">...</span>
        )}
      </div>
    </CardContent>
  </Card>
);

const DetailedBlock = ({ stream }) => {
  if (!stream) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${stream.bgColor}`}>
          <stream.icon className={`w-8 h-8 ${stream.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{stream.title}</h2>
          <p className="text-gray-500">Comprehensive data definition and flow mapping.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Field Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-400" /> Key Data Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stream.fields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-sm font-medium text-gray-700">{field}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action / Link Panel */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              Manage and audit this data stream in the respective modules.
            </p>
            {stream.id === 'site' && (
              <Link to={createPageUrl('FiberOrdering')}>
                <Button className="w-full bg-white text-gray-900 border hover:bg-gray-50 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" /> Site Registry
                </Button>
              </Link>
            )}
            {stream.id === 'supply' && (
              <Link to={createPageUrl('Supplier')}>
                <Button className="w-full bg-white text-gray-900 border hover:bg-gray-50 mb-2">
                  <Truck className="w-4 h-4 mr-2 text-orange-600" /> Supplier Portal
                </Button>
              </Link>
            )}
            {stream.id === 'install' && (
              <Link to={createPageUrl('NaasInstallation')}>
                <Button className="w-full bg-white text-gray-900 border hover:bg-gray-50 mb-2">
                  <Activity className="w-4 h-4 mr-2 text-green-600" /> Installation Hub
                </Button>
              </Link>
            )}
            <Link to={createPageUrl('DataSources')}>
              <Button variant="ghost" className="w-full text-gray-500">
                View Workflow Source
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const WorkflowViz = () => (
  <div className="relative py-8 overflow-x-auto">
    <div className="flex items-start min-w-[800px] justify-between relative z-10">
      {WORKFLOW_STAGES.map((stage, idx) => (
        <div key={stage.id} className="flex flex-col items-center group w-32">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-3 z-10 ring-4 ring-white group-hover:scale-110 transition-transform shadow-sm">
            {stage.id}
          </div>
          <div className="text-center px-2">
            <div className="text-xs font-bold text-slate-900 mb-1">{stage.name}</div>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {stage.streams.includes('site') && <div className="w-2 h-2 rounded-full bg-blue-500" title="Site Data" />}
              {stage.streams.includes('supply') && <div className="w-2 h-2 rounded-full bg-orange-500" title="Supply Data" />}
              {stage.streams.includes('install') && <div className="w-2 h-2 rounded-full bg-green-500" title="Install Data" />}
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* Connecting Line */}
    <div className="absolute top-[47px] left-16 right-16 h-0.5 bg-slate-200 z-0" />
  </div>
);

const SchemaTable = ({ table }) => (
  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
    <div className="bg-slate-50 px-4 py-2 border-b flex items-center justify-between">
      <span className="font-mono font-bold text-slate-700 text-sm">{table.name}</span>
      <Badge variant="secondary" className="text-[10px] h-5">PK: {table.pk}</Badge>
    </div>
    <div className="p-0">
      <table className="w-full text-xs text-left">
        <tbody>
          {table.fields.map((f, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="px-4 py-2 font-mono text-slate-600">{f.name}</td>
              <td className="px-4 py-2 text-slate-400">{f.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function CriticalDataStreams() {
  const [activeStreamId, setActiveStreamId] = useState('site');
  const activeStream = DATA_STREAMS.find(s => s.id === activeStreamId);

  return (
    <div className="space-y-10 pb-20">
      {/* SECTION 1 - Header */}
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Critical Data Streams</h1>
              <p className="text-gray-500 mt-1">Core datasets required across all 7 workflow stages of Network Rollout.</p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl('Home')}>
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link to={createPageUrl('DataSources')}>
                <Button variant="outline">Workflow Overview</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 space-y-12">
        
        {/* SECTION 2 - Summary Overview */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Data Stream Categories</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {DATA_STREAMS.map(stream => (
              <DataStreamCard 
                key={stream.id} 
                stream={stream} 
                isActive={activeStreamId === stream.id}
                onClick={() => setActiveStreamId(stream.id)} 
              />
            ))}
          </div>
        </section>

        {/* SECTION 3 - Detailed Block */}
        <section className="bg-white rounded-2xl p-8 border shadow-sm">
          <DetailedBlock stream={activeStream} />
        </section>

        {/* SECTION 4 - Workflow Visualization */}
        <section>
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-gray-900">Workflow Mapping</h3>
             <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Site Data
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" /> Supply Chain
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Installation
                </div>
             </div>
          </div>
          <div className="bg-white rounded-xl border p-6 overflow-hidden">
            <WorkflowViz />
          </div>
        </section>

        {/* SECTION 5 - Data Model */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-bold text-gray-900">Proposed Data Model Schema</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SCHEMA_TABLES.map((table, idx) => (
              <SchemaTable key={idx} table={table} />
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
            <Server className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Architectural Note:</strong> The three data streams are highly interdependent. The <code>Orders</code> table acts as the central nexus linking <code>Sites</code> (Stream A) with <code>Contracts</code> and <code>Installations</code> (Stream C). Supply chain data feeds into the <code>Installation</code> records to determine readiness.
            </div>
          </div>
        </section>

        {/* SECTION 6 - Footer Links */}
        <Separator />
        
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Site Management</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to={createPageUrl('FiberOrdering')} className="hover:text-blue-600 hover:underline">Site Registry</Link></li>
              <li><Link to={createPageUrl('SiteSurvey')} className="hover:text-blue-600 hover:underline">Survey Reports</Link></li>
              <li><Link to={createPageUrl('DataSources')} className="hover:text-blue-600 hover:underline">Data Sources</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Supply Chain</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to={createPageUrl('Supplier')} className="hover:text-blue-600 hover:underline">Suppliers & Vendors</Link></li>
              <li><Link to={createPageUrl('FiberOrdering')} className="hover:text-blue-600 hover:underline">Material Request</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Execution</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to={createPageUrl('NaasInstallation')} className="hover:text-blue-600 hover:underline">Installation Hub</Link></li>
              <li><Link to={createPageUrl('Rfs')} className="hover:text-blue-600 hover:underline">Ready For Service</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Analytics</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to={createPageUrl('Analytics')} className="hover:text-blue-600 hover:underline">Performance Metrics</Link></li>
              <li><Link to={createPageUrl('Home')} className="hover:text-blue-600 hover:underline">Executive Dashboard</Link></li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}