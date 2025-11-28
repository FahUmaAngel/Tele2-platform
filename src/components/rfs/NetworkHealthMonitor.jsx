import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  TrendingUp,
  Server,
  Wifi,
  ShieldCheck
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateMockTelemetry = () => {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      time: `${i}:00`,
      latency: 10 + Math.random() * 15,
      throughput: 800 + Math.random() * 200,
      jitter: Math.random() * 5
    });
  }
  return data;
};

export default function NetworkHealthMonitor({ siteId, onHealthUpdate }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [telemetryData, setTelemetryData] = useState(generateMockTelemetry());
  const [healthScore, setHealthScore] = useState(92);
  const [failureProb, setFailureProb] = useState(0.04);
  const [anomalies, setAnomalies] = useState([]);

  const runAIDiagnostics = () => {
    setIsAnalyzing(true);
    // Simulate analysis delay
    setTimeout(() => {
      const newScore = Math.floor(85 + Math.random() * 15);
      const newProb = Math.random() * 0.1;
      const detectedAnomalies = [];
      
      if (newScore < 90) detectedAnomalies.push("Latency spike detected in secondary link");
      if (newProb > 0.08) detectedAnomalies.push("Predictive Model: Hardware degradation pattern match (94%)");
      
      setHealthScore(newScore);
      setFailureProb(newProb);
      setAnomalies(detectedAnomalies);
      setTelemetryData(generateMockTelemetry());
      setIsAnalyzing(false);
      
      if (onHealthUpdate) {
        const avgLatency = telemetryData.reduce((a, b) => a + b.latency, 0) / telemetryData.length;
        const avgThroughput = telemetryData.reduce((a, b) => a + b.throughput, 0) / telemetryData.length;
        
        onHealthUpdate({ 
          score: newScore, 
          anomalies: detectedAnomalies, 
          probability: newProb,
          kpis: {
            latency: avgLatency.toFixed(2),
            throughput: avgThroughput.toFixed(2),
            jitter: "2.4"
          }
        });
      }
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-blue-600 flex items-center gap-1">
                  <Activity className="w-4 h-4" /> AI Health Score
                </p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{healthScore}/100</h3>
              </div>
              <div className={`p-2 rounded-full ${healthScore >= 90 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {healthScore >= 90 ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
            </div>
            <Progress value={healthScore} className="h-2 mt-2" />
            <p className="text-xs text-gray-500 mt-2">Based on 1.2M telemetry points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-purple-600 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Predictive Failure
                </p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{(failureProb * 100).toFixed(1)}%</h3>
              </div>
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Probability of critical failure in next 30 days.
            </p>
            <p className="text-xs text-gray-500 mt-1">Model: NET-PREDICT-V4</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center items-center p-6 border-dashed border-2">
          <Button 
            onClick={runAIDiagnostics} 
            disabled={isAnalyzing}
            className="w-full h-full flex flex-col gap-2 bg-white hover:bg-gray-50 text-gray-900 border shadow-sm"
          >
            <RefreshCw className={`w-8 h-8 text-blue-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span className="font-semibold">
              {isAnalyzing ? "Running Diagnostics..." : "Run AI Health Check"}
            </span>
          </Button>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wifi className="w-4 h-4 text-gray-500" /> Network Latency (ms)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip />
                <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-500" /> Throughput (Mbps)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip />
                <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies List */}
      {anomalies.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-semibold flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" /> Anomalies Detected
          </h4>
          <ul className="space-y-1">
            {anomalies.map((anomaly, idx) => (
              <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {anomaly}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-800 font-medium">No Anomalies Detected</p>
            <p className="text-green-700 text-sm">System is running within expected baselines.</p>
          </div>
        </div>
      )}
    </div>
  );
}