import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calculator, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PricingModel({ design, setDesign, readOnly = false }) {
  
  // Auto-calculate totals whenever specs change
  useEffect(() => {
    if (readOnly) return;

    const hwTotal = design.hardware_specs?.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0) || 0;
    // Simple logic for labor based on hardware count
    const labor = hwTotal * 0.15; 
    const recurring = hwTotal * 0.05; // 5% monthly support
    const discount = design.pricing?.discount || 0;
    
    setDesign(prev => ({
        ...prev,
        pricing: {
            ...prev.pricing,
            hardware_total: hwTotal,
            labor_cost: labor,
            recurring_monthly: recurring,
            discount: discount,
            total_upfront: (hwTotal + labor) - discount
        }
    }));
  }, [design.hardware_specs, design.pricing?.discount]); // Recalculate when items change

  const handleDiscountChange = (val) => {
      setDesign(prev => ({
          ...prev,
          pricing: { ...prev.pricing, discount: parseFloat(val) || 0 }
      }));
  };

  const formatCurrency = (val) => {
      return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(val || 0);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 border-b bg-gray-50/50">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <DollarSign className="w-5 h-5 text-green-600" />
            Pricing & Proposal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        
        <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Hardware Subtotal</span>
                <span className="font-medium">{formatCurrency(design.pricing?.hardware_total)}</span>
            </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Labor & Installation (Est.)</span>
                <span className="font-medium">{formatCurrency(design.pricing?.labor_cost)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Monthly Service (Recurring)</span>
                <span className="font-medium text-blue-600">{formatCurrency(design.pricing?.recurring_monthly)} / mo</span>
            </div>
             <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed">
                <span className="text-gray-600 flex items-center gap-1">Discount / Adj.</span>
                {readOnly ? (
                    <span className="text-red-500 font-medium">-{formatCurrency(design.pricing?.discount)}</span>
                ) : (
                    <div className="flex items-center gap-2">
                         <span className="text-gray-400 text-xs">-</span>
                         <Input 
                            type="number" 
                            className="w-24 h-7 text-right text-sm" 
                            value={design.pricing?.discount || 0}
                            onChange={(e) => handleDiscountChange(e.target.value)}
                         />
                    </div>
                )}
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Upfront</span>
                    <span className="font-bold text-xl text-gray-900">{formatCurrency(design.pricing?.total_upfront)}</span>
                </div>
                 <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Recurring Monthly</span>
                    <span className="text-xs font-medium text-blue-600">{formatCurrency(design.pricing?.recurring_monthly)}</span>
                </div>
            </div>
        </div>

        {!readOnly && (
            <div className="text-xs text-gray-400 italic text-center">
                * Pricing is auto-calculated based on BOM + Standard Rates.
            </div>
        )}

      </CardContent>
    </Card>
  );
}