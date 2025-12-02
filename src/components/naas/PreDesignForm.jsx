import React from 'react';
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, ArrowRight } from "lucide-react";

// Helper function to infer location type from fiberOrder data
const inferLocationType = (fiberOrder) => {
  if (!fiberOrder) return "Office";
  
  // Map install_type to location_type
  const installTypeMap = {
    "Underground": "Office Building",
    "Indoor": "Office",
    "Facade": "Retail Store",
    "Aerial": "Warehouse"
  };
  
  // Check client name for additional context
  const client = fiberOrder.client?.toLowerCase() || "";
  if (client.includes("hospital")) return "Hospital";
  if (client.includes("university") || client.includes("campus")) return "University Campus";
  if (client.includes("datacenter") || client.includes("data center")) return "Datacenter";
  if (client.includes("warehouse")) return "Warehouse";
  if (client.includes("retail") || client.includes("store")) return "Retail Store";
  if (client.includes("government")) return "Government Office";
  if (client.includes("port")) return "Port Authority";
  if (client.includes("research")) return "Research Park";
  if (client.includes("residential") || client.includes("apartment")) return "Residential Complex";
  
  // Fall back to install_type mapping
  return installTypeMap[fiberOrder.install_type] || "Office";
};

export default function PreDesignForm({ initialData, fiberOrder, orderId: filterOrderId, onSubmit, isGenerating, onGenerateAI }) {
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      site_category: "Medium",
      location_type: "Office",
      customer_requirements: "",
      order_id: filterOrderId || ""
    }
  });

  // Watch all fields to ensure controlled components update
  const category = watch("site_category");
  const locationType = watch("location_type");
  const formOrderId = watch("order_id");
  const requirements = watch("customer_requirements");

  // Update form when initialData changes or fiberOrder loads
  React.useEffect(() => {
    const targetOrderId = filterOrderId || initialData?.order_id || fiberOrder?.order_id || "";

    // Prioritize initialData if it exists (user has already saved preferences)
    if (initialData) {
      reset({
        site_category: initialData.site_category || "Medium",
        location_type: initialData.location_type || inferLocationType(fiberOrder),
        customer_requirements: initialData.customer_requirements || "",
        order_id: targetOrderId
      });
    } else if (fiberOrder) {
      // Auto-populate from fiberOrder data
      reset({
        site_category: fiberOrder.category || "Medium",
        location_type: inferLocationType(fiberOrder),
        customer_requirements: fiberOrder.requirements || "",
        order_id: targetOrderId
      });
    } else if (filterOrderId) {
      setValue("order_id", filterOrderId);
    }
  }, [initialData, fiberOrder, filterOrderId, reset, setValue]);

  const handleAI = () => {
    onGenerateAI({ category, locationType });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Site Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div className="space-y-2">
            <Label>Order ID</Label>
            <Input
              {...register("order_id")}
              placeholder="Linked Order ID"
              readOnly
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label>Site Category</Label>
            <Select
              value={category}
              onValueChange={(val) => setValue("site_category", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small">Small (Home/SoHo)</SelectItem>
                <SelectItem value="Medium">Medium (Branch/Retail)</SelectItem>
                <SelectItem value="Large">Large (HQ/Campus)</SelectItem>
                <SelectItem value="VIP">VIP (Critical Infra)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Determines default SLA and Hardware tier.</p>
          </div>

          <div className="space-y-2">
            <Label>Location Type</Label>
            <Select
              value={locationType}
              onValueChange={(val) => setValue("location_type", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hospital">Hospital</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Office Building">Office Building</SelectItem>
                <SelectItem value="Retail Center">Retail Center</SelectItem>
                <SelectItem value="University Campus">University Campus</SelectItem>
                <SelectItem value="Datacenter">Datacenter</SelectItem>
                <SelectItem value="Research Park">Research Park</SelectItem>
                <SelectItem value="Retail Store">Retail Store</SelectItem>
                <SelectItem value="Residential Complex">Residential Complex</SelectItem>
                <SelectItem value="Government Office">Government Office</SelectItem>
                <SelectItem value="Port Authority">Port Authority</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Customer Requirements</Label>
            <Textarea
              {...register("customer_requirements")}
              placeholder="e.g. Guest WiFi needed, 2 separate VLANs, redundancy required..."
              className="min-h-[120px]"
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleAI}
              disabled={isGenerating}
            >
              {isGenerating ? <Sparkles className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Auto-Generate Draft Design
            </Button>

            <Button type="submit" className="w-full bg-[#0a1f33]">
              <Save className="w-4 h-4 mr-2" /> Save Parameters
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}