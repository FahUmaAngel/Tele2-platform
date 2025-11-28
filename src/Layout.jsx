import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import AIChatbot from './components/layout/AIChatbot';
import { Menu } from 'lucide-react';
import { Toaster } from "sonner";

export default function Layout({ children, currentPageName }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* Main Content Wrapper */}
      <div className="lg:ml-72 min-h-screen flex flex-col transition-all duration-300">
        
        {/* Top Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">T2</div>
            <span className="font-bold text-gray-900">Tele2</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>

      </div>
      
      <AIChatbot />
      <Toaster />
    </div>
  );
}