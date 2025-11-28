import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, TrendingUp, AlertTriangle, BrainCircuit } from "lucide-react";

export default function AIInsights({ design, siteSurvey }) {
  
  // Mock Logic to generate insights
  const generateInsights = () => {
      const insights = [];
      const specs = design.hardware_specs || [];

      // 1. Anomaly Detection: Outdoor/Aerial check
      if (siteSurvey?.installation_type?.includes("Aerial") || siteSurvey?.installation_type?.includes("Outdoor")) {
          const hasRugged = specs.some(s => s.model.toLowerCase().includes('rugged') || s.model.toLowerCase().includes('outdoor') || s.model.toLowerCase().includes('industrial'));
          if (!hasRugged) {
              insights.push({
                  type: 'anomaly',
                  title: 'Environmental Mismatch Detected',
                  message: 'Survey indicates "Aerial/Outdoor" installation, but no ruggedized or outdoor-rated hardware was found in the BOM.',
                  severity: 'high'
              });
          }
      }

      // 2. Predictive Failure
      const hasOldTech = specs.some(s => s.model.includes('2960')); // Example older model
      if (hasOldTech) {
           insights.push({
                  type: 'risk',
                  title: 'End-of-Life Component Risk',
                  message: 'Selected "Cisco 2960" series has higher failure rates in modern high-throughput environments. Consider upgrading to Catalyst 9200.',
                  severity: 'medium'
              });
      }

      // 3. Optimization
      if (specs.length > 5 && !specs.some(s => s.category === 'Service')) {
           insights.push({
                  type: 'optimization',
                  title: 'Missing Installation Service',
                  message: 'Complex BOM detected without associated installation labor/service items. Recommend adding "ProInstall L3" bundle.',
                  severity: 'low'
              });
      }
      
      if (insights.length === 0) {
           insights.push({
                  type: 'optimization',
                  title: 'Design Looks Optimal',
                  message: 'AI analysis found no anomalies or significant risks based on current survey data.',
                  severity: 'low'
              });
      }

      return insights;
  };

  const insights = generateInsights();

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-900">
           <BrainCircuit className="w-5 h-5 text-indigo-600" />
           AI Design Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {insights.map((insight, i) => (
            <Alert key={i} className={`border-l-4 bg-white shadow-sm ${
                insight.type === 'anomaly' ? 'border-l-red-500' : 
                insight.type === 'risk' ? 'border-l-orange-500' : 'border-l-blue-500'
            }`}>
                <div className="flex gap-3">
                    <div className="mt-1">
                         {insight.type === 'anomaly' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                         {insight.type === 'risk' && <TrendingUp className="w-4 h-4 text-orange-600" />}
                         {insight.type === 'optimization' && <Sparkles className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                        <AlertTitle className="text-sm font-bold text-gray-900">{insight.title}</AlertTitle>
                        <AlertDescription className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {insight.message}
                        </AlertDescription>
                    </div>
                </div>
            </Alert>
        ))}

      </CardContent>
    </Card>
  );
}