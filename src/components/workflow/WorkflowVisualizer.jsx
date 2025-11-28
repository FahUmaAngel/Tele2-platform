import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ChevronRight, 
  PlayCircle, 
  RefreshCw,
  Truck,
  HardHat,
  FileText,
  Server,
  Wifi
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

// Stage Definitions
const WORKFLOW_STAGES = [
  {
    id: 'fiber',
    title: '1. Fiber Ordering & Delivery',
    icon: Truck,
    color: 'blue',
    description: 'Capture customer info, location, fiber availability, and assign contractor.',
    baseDuration: 14, // days
    dependencies: []
  },
  {
    id: 'predesign',
    title: '2. NaaS Pre-Design',
    icon: FileText,
    color: 'indigo',
    description: 'Initial technical assessment, solution type, and capacity planning.',
    baseDuration: 5,
    dependencies: ['fiber']
  },
  {
    id: 'survey',
    title: '3. Site Survey',
    icon: HardHat,
    color: 'amber',
    description: 'Physical site inspection, access checks, and documentation.',
    baseDuration: 7,
    dependencies: ['predesign']
  },
  {
    id: 'design',
    title: '4. Design & Engineering',
    icon: Server,
    color: 'purple',
    description: 'Final technical design creation and validation.',
    baseDuration: 10,
    dependencies: ['survey']
  },
  {
    id: 'processing',
    title: '5. Order Processing',
    icon: RefreshCw,
    color: 'cyan',
    description: 'Procurement, internal approvals, and logistics.',
    baseDuration: 5,
    dependencies: ['design']
  },
  {
    id: 'install',
    title: '6. NaaS Installation',
    icon: Wifi,
    color: 'orange',
    description: 'Equipment installation, cabling, and power-up.',
    baseDuration: 3,
    dependencies: ['processing']
  },
  {
    id: 'rfs',
    title: '7. Ready For Service (RFS)',
    icon: CheckCircle2,
    color: 'green',
    description: 'Final verification, testing, and customer activation.',
    baseDuration: 2,
    dependencies: ['install']
  }
];

const calculateTimeline = (delays = {}) => {
  let currentDay = 0;
  return WORKFLOW_STAGES.map(stage => {
    const delay = delays[stage.id] || 0;
    const duration = stage.baseDuration + delay;
    const startDay = currentDay;
    currentDay += duration;
    
    return {
      ...stage,
      startDay,
      duration,
      delay,
      endDay: startDay + duration
    };
  });
};

export default function WorkflowVisualizer() {
  const [activeStageId, setActiveStageId] = useState('fiber');
  const [delays, setDelays] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeline, setTimeline] = useState(calculateTimeline());

  // Simulation effect
  useEffect(() => {
    setTimeline(calculateTimeline(delays));
  }, [delays]);

  const handleSimulateDisruption = (stageId, days) => {
    setDelays(prev => ({
      ...prev,
      [stageId]: (prev[stageId] || 0) + days
    }));
  };

  const resetSimulation = () => {
    setDelays({});
    setActiveStageId('fiber');
  };

  const totalDuration = timeline[timeline.length - 1].endDay;
  const activeStageIndex = WORKFLOW_STAGES.findIndex(s => s.id === activeStageId);

  const nextStage = () => {
    if (activeStageIndex < WORKFLOW_STAGES.length - 1) {
      setActiveStageId(WORKFLOW_STAGES[activeStageIndex + 1].id);
    }
  };

  const prevStage = () => {
    if (activeStageIndex > 0) {
      setActiveStageId(WORKFLOW_STAGES[activeStageIndex - 1].id);
    }
  };

  const ActiveIcon = WORKFLOW_STAGES.find(s => s.id === activeStageId).icon;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Delivery Workflow</h2>
          <p className="text-gray-500">Interactive visualization of the 7-stage delivery lifecycle.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSimulation} className="text-sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Reset Scenario
          </Button>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Stage Details (Slide) */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStageId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`border-l-4 border-l-${WORKFLOW_STAGES[activeStageIndex].color}-500 h-full shadow-md`}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-lg bg-${WORKFLOW_STAGES[activeStageIndex].color}-50 text-${WORKFLOW_STAGES[activeStageIndex].color}-600`}>
                      <ActiveIcon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="uppercase tracking-wider text-[10px]">
                      Stage {activeStageIndex + 1} of 7
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{WORKFLOW_STAGES[activeStageIndex].title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {WORKFLOW_STAGES[activeStageIndex].description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Stage Specific Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Standard Duration: {WORKFLOW_STAGES[activeStageIndex].baseDuration} Days
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md text-sm space-y-2 border border-gray-100">
                      <p className="font-medium text-gray-700">Key Activities:</p>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        {activeStageId === 'fiber' && (
                          <>
                            <li>Verify fiber availability at address</li>
                            <li>Select optimal subcontractor</li>
                            <li>Generate initial order ID</li>
                          </>
                        )}
                        {activeStageId === 'predesign' && (
                          <>
                            <li>Assess power & cooling needs</li>
                            <li>Define hardware BOM</li>
                            <li>Draft network topology</li>
                          </>
                        )}
                        {activeStageId === 'survey' && (
                          <>
                            <li>Coordinate building access</li>
                            <li>Physical path inspection</li>
                            <li>Validate cabling routes</li>
                          </>
                        )}
                        {activeStageId === 'design' && (
                          <>
                            <li>Finalize Low Level Design (LLD)</li>
                            <li>Customer technical sign-off</li>
                            <li>Resource allocation</li>
                          </>
                        )}
                         {activeStageId === 'processing' && (
                          <>
                            <li>Hardware procurement</li>
                            <li>Shipment tracking generation</li>
                            <li>Warehouse kitting</li>
                          </>
                        )}
                         {activeStageId === 'install' && (
                          <>
                            <li>On-site engineering visit</li>
                            <li>Rack & Stack hardware</li>
                            <li>Patch cabling & labeling</li>
                          </>
                        )}
                         {activeStageId === 'rfs' && (
                          <>
                            <li>End-to-end connectivity test</li>
                            <li>Throughput validation</li>
                            <li>Handover documentation</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Interactive Disruption Trigger */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Simulate Disruption
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                       {activeStageId === 'survey' ? (
                         <Button variant="outline" size="sm" onClick={() => handleSimulateDisruption('survey', 5)} className="text-xs border-amber-200 hover:bg-amber-50 text-amber-800">
                           Scenario: Access Denied (+5d)
                         </Button>
                       ) : activeStageId === 'install' ? (
                         <Button variant="outline" size="sm" onClick={() => handleSimulateDisruption('install', 3)} className="text-xs border-red-200 hover:bg-red-50 text-red-800">
                           Scenario: Missing Parts (+3d)
                         </Button>
                       ) : (
                         <Button variant="outline" size="sm" onClick={() => handleSimulateDisruption(activeStageId, 2)} className="text-xs">
                           Generic Delay (+2 Days)
                         </Button>
                       )}
                    </div>
                    {delays[activeStageId] > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold">Impact:</span> This delay pushes the start date of all subsequent stages by {delays[activeStageId]} days.
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4 mt-auto">
                    <Button variant="ghost" onClick={prevStage} disabled={activeStageIndex === 0}>
                      Previous
                    </Button>
                    <Button onClick={nextStage} disabled={activeStageIndex === WORKFLOW_STAGES.length - 1}>
                      Next Stage <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Dynamic Timeline Visualization */}
        <div className="lg:col-span-7">
          <Card className="h-full shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Project Timeline Impact</CardTitle>
              <CardDescription>
                Total Estimated Duration: <span className="font-bold text-gray-900">{totalDuration} Days</span>
                {Object.values(delays).reduce((a, b) => a + b, 0) > 0 && (
                  <span className="text-red-600 font-medium ml-2">
                    (+{Object.values(delays).reduce((a, b) => a + b, 0)} days delay)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative min-h-[400px]">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
              
              <div className="space-y-6 pl-8 relative">
                {timeline.map((stage, index) => {
                  const isActive = stage.id === activeStageId;
                  const hasDelay = stage.delay > 0;
                  const isPast = index < activeStageIndex;

                  return (
                    <motion.div 
                      key={stage.id}
                      layout
                      className={`relative group cursor-pointer ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-90'}`}
                      onClick={() => setActiveStageId(stage.id)}
                    >
                      {/* Connector Dot */}
                      <div className={`absolute -left-[39px] top-3 w-5 h-5 rounded-full border-2 z-10 bg-white transition-colors duration-300
                        ${isActive ? `border-${stage.color}-500 text-${stage.color}-500 scale-110` : 
                          isPast ? 'border-gray-400 bg-gray-100' : 'border-gray-300'}
                      `}>
                        <div className={`w-2 h-2 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          ${isActive ? `bg-${stage.color}-500` : ''}
                        `} />
                      </div>

                      {/* Content Block */}
                      <div className={`p-3 rounded-lg border transition-all duration-300
                        ${isActive ? `bg-${stage.color}-50 border-${stage.color}-200 shadow-sm` : 'bg-white border-gray-100'}
                      `}>
                        <div className="flex justify-between items-center mb-2">
                          <h5 className={`font-semibold text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                            {stage.title}
                          </h5>
                          <span className="text-xs font-mono text-gray-500">
                             Day {stage.startDay} - {stage.endDay}
                          </span>
                        </div>

                        {/* Visual Bar */}
                        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden w-full">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            className={`absolute top-0 left-0 h-full bg-${stage.color}-500 opacity-80`}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          />
                          {hasDelay && (
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(stage.delay / stage.duration) * 100}%` }}
                              className="absolute top-0 right-0 h-full bg-red-500 pattern-diagonal-stripes"
                            />
                          )}
                        </div>

                        {/* Dependency Line (Visual cue) */}
                        {index < timeline.length - 1 && (
                          <div className="absolute left-4 bottom-[-24px] w-0.5 h-6 bg-gray-200" />
                        )}
                        
                        {/* Disruption Label */}
                        {hasDelay && (
                           <motion.div 
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             className="flex items-center gap-1 text-xs text-red-600 mt-1 font-medium"
                           >
                             <AlertTriangle className="w-3 h-3" />
                             Delay: +{stage.delay} days
                           </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}