import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { 
  LayoutDashboard, 
  Network, 
  FileText, 
  PenTool, 
  ShoppingCart, 
  Server, 
  CheckCircle, 
  Users, 
  Settings, 
  BarChart2, 
  Database, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from "@/api/base44Client";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "Home" },
  { icon: MapPin, label: "Site Overview", path: "SiteOverview" },
  { icon: BarChart2, label: "Site Progress", path: "SiteProgress" },
  { icon: Network, label: "Fiber Ordering & Delivery", path: "FiberOrdering" },
  { icon: PenTool, label: "NaaS Pre-Design", path: "NaasPreDesign" },
  { icon: FileText, label: "Site Survey & Documentation", path: "SiteSurvey" },
  { icon: PenTool, label: "Design & Customer Eng.", path: "DesignCustomer" },
  { icon: ShoppingCart, label: "Order Processing", path: "OrderProcessing" },
  { icon: Server, label: "NaaS Installation", path: "NaasInstallation" },
  { icon: CheckCircle, label: "Ready For Service (RFS)", path: "Rfs" },
  { icon: Users, label: "User Management", path: "UserManagement" },
  { icon: Settings, label: "Settings", path: "Settings" },
  { icon: BarChart2, label: "Analytics", path: "Analytics" },
  { icon: Database, label: "Data Sources", path: "DataSources" },
  { icon: User, label: "My Account", path: "MyAccount" },
  { icon: Phone, label: "Contact", path: "Contact" },
  { icon: Truck, label: "Supplier", path: "Supplier" },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 h-screen bg-[#0a1f33] text-white z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-72'}
          flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
              T2
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Tele2 Platform</h1>
              <span className="text-xs text-blue-300 font-medium px-1.5 py-0.5 bg-blue-900/50 rounded">Enterprise</span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* User Profile Snippet */}
        <div className="px-6 py-6 border-b border-gray-700/50 bg-[#0d253b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-sm font-bold">
              AM
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Amin</p>
              <p className="text-xs text-blue-200">Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <nav className="space-y-1 px-3">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={createPageUrl(item.path)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-blue-600/20 hover:text-white transition-colors group"
              >
                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-[#0d253b]">
          <button 
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          <div className="mt-4 text-xs text-center text-gray-500">
            © 2024 Tele2 AB
          </div>
        </div>
      </aside>
    </>
  );
}