import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, Truck, X, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";

const expenseCategories = ["fuel", "tolls", "loading", "unloading", "repairs", "food", "accommodation", "other"];

export default function TruckContractDialog({ 
  open, 
  onOpenChange, 
  contract, 
  vehicles = [], 
  employees = [], 
  orgId 
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!contract;
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    pickup_location: '',
    delivery_location: '',
    cargo_description: '',
    cargo_weight_kg: '',
    contract_date: format(new Date(), 'yyyy-MM-dd'),
    delivery_date: '',
    contract_amount: '',
    vehicle_id: '',
    driver_id: '',
    status: 'pending',
    payment_status: 'unpaid',
    notes: '',
  });
  
  const [expenses, setExpenses] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const primaryColor = '#1EB053';
  const secondaryColor = '#0072C6';

  useEffect(() => {
    if (contract) {
      setFormData({
        client_name: contract.client_name || '',
        client_phone: contract.client_phone || '',
        pickup_location: contract.pickup_location || '',
        delivery_location: contract.delivery_location || '',
        cargo_description: contract.cargo_description || '',
        cargo_weight_kg: contract.cargo_weight_kg || '',
        contract_date: contract.contract_date || format(new Date(), 'yyyy-MM-dd'),
        delivery_date: contract.delivery_date || '',
        contract_amount: contract.contract_amount || '',
        vehicle_id: contract.vehicle_id || '',
        driver_id: contract.driver_id || '',
        status: contract.status || 'pending',
        payment_status: contract.payment_status || 'unpaid',
        notes: contract.notes || '',
      });
      setExpenses(contract.expenses || []);
      setShowAdvanced(true);
    } else {
      setFormData({
        client_name: '',
        client_phone: '',
        pickup_location: '',
        delivery_location: '',
        cargo_description: '',
        cargo_weight_kg: '',
        contract_date: format(new Date(), 'yyyy-MM-dd'),
        delivery_date: '',
        contract_amount: '',
        vehicle_id: '',
        driver_id: '',
        status: 'pending',
        payment_status: 'unpaid',
        notes: '',
      });
      setExpenses([]);
      setShowAdvanced(false);
    }
  }, [contract, open]);

  const drivers = employees.filter(e => e.role === 'driver' && e.status === 'active');
  const trucks = vehicles.filter(v => v.vehicle_type === 'truck' && v.status === 'active');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TruckContract.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckContracts'] });
      onOpenChange(false);
      toast.success("Contract created", "Truck contract has been created successfully");
    },
    onError: (error) => {
      console.error('Create contract error:', error);
      toast.error("Failed to create contract", error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.TruckContract.update(contract.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckContracts'] });
      onOpenChange(false);
      toast.success("Contract updated", "Contract has been updated successfully");
    },
    onError: (error) => {
      console.error('Update contract error:', error);
      toast.error("Failed to update contract", error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.TruckContract.delete(contract.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckContracts'] });
      onOpenChange(false);
      toast.success("Contract deleted", "Contract has been deleted successfully");
    },
    onError: (error) => {
      console.error('Delete contract error:', error);
      toast.error("Failed to delete contract", error.message);
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this contract? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const addExpense = () => {
    setExpenses([...expenses, { description: '', category: 'fuel', amount: 0 }]);
  };

  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];
    // Ensure amount is stored as a number
    if (field === 'amount') {
      updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setExpenses(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedVehicle = trucks.find(v => v.id === formData.vehicle_id);
    const selectedDriver = drivers.find(d => d.id === formData.driver_id);
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const contractAmount = parseFloat(formData.contract_amount) || 0;
    const netRevenue = contractAmount - totalExpenses;

    // Auto-generate contract number: TC-YYYYMMDD-XXXX
    const contractNumber = `TC-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const data = {
      organisation_id: orgId,
      contract_number: contract?.contract_number || contractNumber,
      client_name: formData.client_name,
      client_phone: formData.client_phone,
      pickup_location: formData.pickup_location,
      delivery_location: formData.delivery_location,
      cargo_description: formData.cargo_description,
      cargo_weight_kg: parseFloat(formData.cargo_weight_kg) || 0,
      contract_date: formData.contract_date,
      delivery_date: formData.delivery_date,
      contract_amount: contractAmount,
      vehicle_id: formData.vehicle_id,
      vehicle_registration: selectedVehicle?.registration_number || '',
      driver_id: formData.driver_id,
      driver_name: selectedDriver?.full_name || '',
      status: formData.status,
      payment_status: formData.payment_status,
      expenses: expenses,
      total_expenses: totalExpenses,
      net_revenue: netRevenue,
      notes: formData.notes,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Calculate totals - ensure we parse all amounts properly
  const totalExpenses = expenses.reduce((sum, exp) => {
    const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
    return sum + amount;
  }, 0);
  const contractAmount = parseFloat(formData.contract_amount) || 0;
  const netRevenue = contractAmount - totalExpenses;

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 w-[95vw] sm:w-full [&>button]:hidden">
        <div className="h-2 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="px-6 py-4 text-white border-b border-white/20" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{isEditing ? 'Edit Contract' : 'Truck Contract'}</h2>
                <p className="text-white/80 text-xs">Le {netRevenue.toLocaleString()} net</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-4">
            <div>
              <Label className="font-medium">Client Name *</Label>
              <Input value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} required autoFocus placeholder="Client/Company name" className="mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">From</Label>
                <Input value={formData.pickup_location} onChange={(e) => setFormData({...formData, pickup_location: e.target.value})} required placeholder="Pickup" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">To</Label>
                <Input value={formData.delivery_location} onChange={(e) => setFormData({...formData, delivery_location: e.target.value})} required placeholder="Delivery" className="mt-1.5" />
              </div>
            </div>

            <div className="p-4 rounded-xl border-2 border-[#1EB053]/30 bg-[#1EB053]/5">
              <Label className="text-[#1EB053] font-medium">Contract Amount *</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1EB053] font-bold">Le</span>
                <Input type="number" value={formData.contract_amount} onChange={(e) => setFormData({...formData, contract_amount: e.target.value})} required className="pl-10 text-lg font-semibold border-[#1EB053]/30 bg-white" />
              </div>
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-gray-600 hover:text-gray-900 text-left">
              {showAdvanced ? '− Hide' : '+ Show'} More Details
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Truck</Label>
                    <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({...formData, vehicle_id: v})}>
                      <SelectTrigger className="mt-1.5 text-xs h-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {trucks.map(v => (
                          <SelectItem key={v.id} value={v.id} className="text-xs">{v.registration_number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Driver</Label>
                    <Select value={formData.driver_id} onValueChange={(v) => setFormData({...formData, driver_id: v})}>
                      <SelectTrigger className="mt-1.5 text-xs h-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map(d => (
                          <SelectItem key={d.id} value={d.id} className="text-xs">{d.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Contract Date</Label>
                    <Input type="date" value={formData.contract_date} onChange={(e) => setFormData({...formData, contract_date: e.target.value})} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Delivery Date</Label>
                    <Input type="date" value={formData.delivery_date} onChange={(e) => setFormData({...formData, delivery_date: e.target.value})} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Cargo</Label>
                    <Input value={formData.cargo_description} onChange={(e) => setFormData({...formData, cargo_description: e.target.value})} placeholder="Description" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">Weight (kg)</Label>
                    <Input type="number" value={formData.cargo_weight_kg} onChange={(e) => setFormData({...formData, cargo_weight_kg: e.target.value})} placeholder="0" className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Expenses</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addExpense} className="h-7 text-xs">
                      <Plus className="w-3 h-3 mr-1" />Add
                    </Button>
                  </div>
                  {expenses.map((exp, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded mb-2">
                      <Input placeholder="Desc" value={exp.description} onChange={(e) => updateExpense(index, 'description', e.target.value)} className="flex-1 h-8 text-xs" />
                      <Input type="number" placeholder="0" value={exp.amount} onChange={(e) => updateExpense(index, 'amount', e.target.value)} className="w-20 h-8 text-xs" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeExpense(index)} className="h-7 w-7 text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-gray-100 rounded space-y-1 text-xs">
                  <div className="flex justify-between"><span>Contract:</span><span className="font-medium">Le {contractAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-red-600"><span>Expenses:</span><span>-Le {totalExpenses.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold border-t pt-1"><span>Net:</span><span className={netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}>Le {netRevenue.toLocaleString()}</span></div>
                </div>

                {isEditing && (
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending} className="w-full" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />Delete Contract
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none sm:w-24">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              {isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2" />{isEditing ? 'Update' : 'Create'}</>}
            </Button>
          </div>
        </form>

        <div className="h-1.5 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}