import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, ArrowLeftRight, Zap } from "lucide-react";

export default function InventoryQuickActions({ onAdjustStock, onTransferStock, primaryColor, secondaryColor }) {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div 
        className="h-1"
        style={{ background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5" style={{ color: primaryColor }} />
          <h3 className="font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 hover:border-[#1EB053] hover:bg-[#1EB053]/5"
            onClick={onAdjustStock}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${primaryColor}20` }}
            >
              <Upload className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Adjust Stock</p>
              <p className="text-xs text-gray-500">Update quantities</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 hover:border-purple-500 hover:bg-purple-50"
            onClick={onTransferStock}
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Transfer Stock</p>
              <p className="text-xs text-gray-500">Move between locations</p>
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
}