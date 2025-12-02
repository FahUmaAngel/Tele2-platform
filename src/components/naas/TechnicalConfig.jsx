import React from 'react';
import {
  Activity,
  Server,
  Wifi,
  ShieldCheck,
  Cpu,
  Download,
  RotateCcw,
  FileCode,
  Play,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function TechnicalConfig({ siteId }) {
  // Fetch installation data
  const { data: installationData } = useQuery({
    queryKey: ['naas-installation', siteId],
    queryFn: () => base44.entities.NaasInstallationData.list(),
    select: (data) => data.find(d => d.facility_id === siteId),
  });

  const deviceModel = installationData?.device_model || 'Cisco ISR 1100';
  const deviceSerial = installationData?.device_serial || 'FGL234910XQ';
  const deviceMac = installationData?.device_mac || '00:1B:44:11:3A:B7';
  const configStatus = installationData?.config_status || 'Pending';
  const wifiSsid = installationData?.wifi_ssid || 'Tele2-Guest';
  const initialWanActive = installationData?.wan_active || false;
  const initialSecurityApplied = installationData?.security_applied || false;
  const testLatency = installationData?.test_latency || 14;
  const testThroughput = installationData?.test_throughput || 940;
  const testPacketLoss = installationData?.test_packet_loss || 0.0;
  const testJitter = installationData?.test_jitter || 12;
  const defaultConfig = `interface GigabitEthernet0/0/0
 description WAN_UPLINK
 ip address dhcp
 ip nat outside
 negotiation auto
!
interface GigabitEthernet0/0/1
 description LAN_MANAGEMENT
 ip address 192.168.10.1 255.255.255.0
 ip nat inside
 negotiation auto`;

  const previousConfig = `interface GigabitEthernet0/0/0
 description WAN_UPLINK
 ip address dhcp
 ip nat outside
 negotiation auto
!
interface GigabitEthernet0/0/1
 description LAN_MANAGEMENT
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
 negotiation auto`;

  const [config, setConfig] = React.useState(defaultConfig);
  const [status, setStatus] = React.useState(configStatus);
  const [isApplying, setIsApplying] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [tempConfig, setTempConfig] = React.useState(config);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  // Activation & Tests State
  const [wanActive, setWanActive] = React.useState(initialWanActive);
  const [securityApplied, setSecurityApplied] = React.useState(initialSecurityApplied);
  const [isRunningTests, setIsRunningTests] = React.useState(false);
  const [testResults, setTestResults] = React.useState({
    latency: testLatency,
    throughput: testThroughput,
    packetLoss: testPacketLoss,
    jitter: testJitter
  });
  const [wifiConfig, setWifiConfig] = React.useState({ ssid: wifiSsid, password: "" });
  const [isWifiOpen, setIsWifiOpen] = React.useState(false);

  const handleActivateWan = () => {
    setWanActive(true);
  };

  const handleApplySecurity = () => {
    setSecurityApplied(true);
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      setTestResults({
        latency: Math.floor(Math.random() * 20) + 5,
        throughput: Math.floor(Math.random() * 100) + 900,
        packetLoss: 0.0,
        jitter: Math.floor(Math.random() * 15) + 1
      });
      setIsRunningTests(false);
    }, 2000);
  };

  const handleRollback = () => {
    setConfig(previousConfig);
    setStatus('Rolled Back');
  };

  const handleApply = () => {
    setIsApplying(true);
    // Simulate network delay
    setTimeout(() => {
      setIsApplying(false);
      setStatus('Applied');
    }, 1500);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const aiConfig = `interface GigabitEthernet0/0/0
 description WAN_UPLINK_OPTIMIZED
 ip address dhcp
 ip nat outside
 negotiation auto
 service-policy output QOS_VOIP
!
interface GigabitEthernet0/0/1
 description LAN_MANAGEMENT
 ip address 192.168.10.1 255.255.255.0
 ip nat inside
 negotiation auto
!
ip route 0.0.0.0 0.0.0.0 dhcp`;
      setConfig(aiConfig);
      setStatus('Pending');
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Device Configuration Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            Device Configuration
          </CardTitle>
          <Badge
            variant="outline"
            className={`
              ${status === 'Applied' ? 'bg-green-50 text-green-700 border-green-200' : ''}
              ${status === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
              ${status === 'Rolled Back' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
            `}
          >
            Config Status: {status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Device Model</div>
              <div className="font-medium">{deviceModel}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Serial Number</div>
              <div className="font-medium font-mono">{deviceSerial}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">MAC Address</div>
              <div className="font-medium font-mono">{deviceMac}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">License</div>
              <div className="font-medium text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Configuration Preview</h4>
              <div className="flex gap-2">
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setTempConfig(config)}>
                      <FileCode className="w-3 h-3 mr-1" /> Edit Config
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Edit Configuration</DialogTitle>
                      <DialogDescription>
                        Make changes to the device configuration below. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Textarea
                        value={tempConfig}
                        onChange={(e) => setTempConfig(e.target.value)}
                        className="font-mono text-xs min-h-[300px]"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={() => { setConfig(tempConfig); setStatus('Pending'); setIsEditOpen(false); }}>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-purple-600 border-purple-200 hover:bg-purple-50"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" /> Generate (AI)
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-slate-900 text-slate-50 p-4 rounded-md font-mono text-xs overflow-x-auto">
              <pre>{config}</pre>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRollback}
                disabled={isApplying || config === previousConfig}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Rollback
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleApply}
                disabled={isApplying || status === 'Applied'}
              >
                {isApplying ? (
                  <>Applying...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Apply Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activation & Service Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Activation & Service Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activation Actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Service Activation</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded border">
                      <Server className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-sm">WAN Uplink</span>
                  </div>
                  {wanActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="h-8 bg-white" onClick={handleActivateWan}>Activate</Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded border">
                      <Wifi className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-sm">WiFi / SSID</span>
                  </div>
                  <Dialog open={isWifiOpen} onOpenChange={setIsWifiOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 bg-white">Configure</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Configure WiFi</DialogTitle>
                        <DialogDescription>Set up the SSID and password for the site.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="ssid">SSID</Label>
                          <Input id="ssid" value={wifiConfig.ssid} onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" value={wifiConfig.password} onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })} placeholder="Enter password" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => setIsWifiOpen(false)}>Save Configuration</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded border">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-sm">Security Policies</span>
                  </div>
                  {securityApplied ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Applied</Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="h-8 bg-white" onClick={handleApplySecurity}>Apply</Button>
                  )}
                </div>
              </div>
            </div>

            {/* Real-time Tests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Live Test Results</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-blue-600"
                  onClick={handleRunTests}
                  disabled={isRunningTests}
                >
                  {isRunningTests ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
                  {isRunningTests ? "Running..." : "Run All Tests"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Latency (Ping)</div>
                  <div className="text-xl font-bold text-green-600">{testResults.latency} ms</div>
                  <Progress value={Math.max(0, 100 - testResults.latency)} className="h-1 mt-2 bg-green-100" indicatorClassName="bg-green-600" />
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Throughput</div>
                  <div className="text-xl font-bold text-blue-600">{testResults.throughput} Mbps</div>
                  <Progress value={testResults.throughput / 10} className="h-1 mt-2 bg-blue-100" indicatorClassName="bg-blue-600" />
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Packet Loss</div>
                  <div className="text-xl font-bold text-green-600">{testResults.packetLoss}%</div>
                  <Progress value={100 - (testResults.packetLoss * 10)} className="h-1 mt-2 bg-green-100" indicatorClassName="bg-green-600" />
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Jitter</div>
                  <div className="text-xl font-bold text-orange-500">{testResults.jitter} ms</div>
                  <Progress value={Math.max(0, 100 - testResults.jitter * 2)} className="h-1 mt-2 bg-orange-100" indicatorClassName="bg-orange-500" />
                </div>
              </div>

              {/* AI Anomaly Detection */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-blue-900">AI Analysis</div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    Network performance is within optimal range. Slight jitter detected but within tolerance for VoIP.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Upload({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}