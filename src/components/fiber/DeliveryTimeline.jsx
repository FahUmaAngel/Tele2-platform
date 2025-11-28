import React from 'react';
import { CheckCircle2, Circle, Truck, Package, Clock, CalendarCheck, CheckSquare } from 'lucide-react';

export default function DeliveryTimeline({ order }) {
  if (!order) return null;

  // Steps: Created -> Confirming -> Confirmed -> In Transit -> Delivered -> Installation Scheduled -> Completed
  const currentStatus = order.status;
  
  const isStatusPassed = (stepStatus) => {
      const flow = ['Planned', 'Confirming', 'Confirmed', 'In Transit', 'Delivered', 'Installation Scheduled', 'Completed'];
      return flow.indexOf(currentStatus) >= flow.indexOf(stepStatus);
  };

  const isStatusActive = (stepStatus) => currentStatus === stepStatus;

  const steps = [
    { id: 'created', label: 'Created', date: order.created_date ? new Date(order.created_date).toLocaleDateString() : '', status: 'completed', icon: Package },
    { id: 'planned', label: 'Planned', date: order.delivery_est_date, status: isStatusActive('Planned') ? 'active' : (isStatusPassed('Planned') ? 'completed' : 'pending'), icon: Clock },
    { id: 'confirmed', label: 'Confirmed', date: order.delivery_conf_date, status: isStatusActive('Confirmed') ? 'active' : (isStatusPassed('Confirmed') ? 'completed' : 'pending'), icon: CheckCircle2 },
    { id: 'in_transit', label: 'In Transit', date: null, status: isStatusActive('In Transit') ? 'active' : (isStatusPassed('In Transit') ? 'completed' : 'pending'), icon: Truck },
    { id: 'delivered', label: 'Delivered', date: null, status: isStatusActive('Delivered') ? 'active' : (isStatusPassed('Delivered') ? 'completed' : 'pending'), icon: CheckCircle2 },
    { id: 'scheduled', label: 'Scheduled', date: order.scheduled_date, status: isStatusActive('Installation Scheduled') ? 'active' : (isStatusPassed('Installation Scheduled') ? 'completed' : 'pending'), icon: CalendarCheck },
    { id: 'completed', label: 'Completed', date: null, status: isStatusActive('Completed') ? 'completed' : 'pending', icon: CheckSquare },
  ];

  return (
    <div className="py-4 overflow-x-auto">
       <h3 className="text-sm font-bold text-gray-900 mb-4">Order Status Timeline</h3>
       <div className="relative flex items-center justify-between min-w-[600px] px-2">
          {/* Line */}
          <div className="absolute left-0 top-[16px] w-full h-0.5 bg-gray-200 -z-10" />
          
          {steps.map((step, index) => {
              const isActive = step.status === 'active';
              const isCompleted = step.status === 'completed';
              const isPending = step.status === 'pending';
              
              return (
                  <div key={step.id} className="flex flex-col items-center z-10 min-w-[80px]">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                          ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                          ${isActive ? 'bg-white border-blue-600 text-blue-600 shadow-lg scale-110' : ''}
                          ${isPending ? 'bg-white border-gray-300 text-gray-300' : ''}
                      `}>
                          <step.icon className="w-4 h-4" />
                      </div>
                      <div className="mt-2 text-center">
                          <div className={`text-xs font-bold ${isActive ? 'text-blue-600' : (isCompleted ? 'text-green-700' : 'text-gray-400')}`}>{step.label}</div>
                          {step.date && <div className="text-[10px] text-gray-500 mt-0.5">{step.date}</div>}
                      </div>
                  </div>
              );
          })}
       </div>
    </div>
  );
}