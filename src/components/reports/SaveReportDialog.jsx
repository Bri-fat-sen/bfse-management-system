import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SaveReportDialog({ 
  open, 
  onOpenChange, 
  orgId, 
  currentEmployeeId,
  currentEmployeeName,
  filters, 
  reportType = 'custom',
  widgets = [] 
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState(reportType);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (open) {
      resetForm();
      setSelectedType(reportType);
    }
  }, [open, reportType]);

  const saveReportMutation = useMutation({
    mutationFn: (reportData) => base44.entities.SavedReport.create(reportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      toast.success("Report saved successfully");
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to save report");
    }
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedType(reportType);
    setIsFavorite(false);
    setIsShared(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a report name");
      return;
    }

    saveReportMutation.mutate({
      organisation_id: orgId,
      created_by_id: currentEmployeeId,
      created_by_name: currentEmployeeName,
      name: name.trim(),
      description: description.trim(),
      report_type: selectedType,
      filters: filters,
      widgets: widgets,
      is_favorite: isFavorite,
      is_shared: isShared
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-[#1EB053]" />
            Save Report Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Report Name *</Label>
            <Input
              placeholder="My Sales Report"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Brief description of this report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>

          <div>
            <Label>Report Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Report</SelectItem>
                <SelectItem value="expenses">Expenses Report</SelectItem>
                <SelectItem value="inventory">Inventory Report</SelectItem>
                <SelectItem value="transport">Transport Report</SelectItem>
                <SelectItem value="hr">HR Report</SelectItem>
                <SelectItem value="custom">Custom Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="favorite"
                checked={isFavorite}
                onCheckedChange={setIsFavorite}
              />
              <label htmlFor="favorite" className="text-sm cursor-pointer">
                Add to Favorites
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shared"
                checked={isShared}
                onCheckedChange={setIsShared}
              />
              <label htmlFor="shared" className="text-sm cursor-pointer">
                Share with team
              </label>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-600">
              <strong>Saved filters:</strong> Date range, {filters?.employee_ids?.length || 0} employees, 
              {filters?.categories?.length || 0} categories, {filters?.payment_methods?.length || 0} payment methods,
              {filters?.statuses?.length || 0} statuses
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveReportMutation.isPending}
            className="bg-[#1EB053] hover:bg-[#178f43]"
          >
            {saveReportMutation.isPending ? 'Saving...' : 'Save Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}