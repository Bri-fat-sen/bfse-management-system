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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
    }
  }, [contract, open]);

  const drivers = employees.filter(e => e.role === 'driver' && e.status === 'active');
  const trucks = vehicles.filter(v => v.vehicle_type === 'truck' && v.status === 'active');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TruckContract.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckContracts'] });
      onOpenChange(false);
      toast.success("Contract created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.TruckContract.update(contract.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckContracts'] });
      onOpenChange(false);
      toast.success("Contract updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.TruckContract.delete(contract.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truckContracts'] });
      onOpenChange(false);
      toast.success("Contract deleted successfully");
    },
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
    updated[index] = { ...updated[index], [field]: value };
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

  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const netRevenue = (parseFloat(formData.contract_amount) || 0) - totalExpenses;

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle>{isEditing ? 'Edit Contract' : 'New Truck Contract'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client Name *</Label>
                <Input 
                  value={formData.client_name}
                  onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Client Phone</Label>
                <Input 
                  value={formData.client_phone}
                  onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Route & Cargo */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Route & Cargo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pickup Location *</Label>
                <Input 
                  value={formData.pickup_location}
                  onChange={(e) => setFormData({...formData, pickup_location: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Delivery Location *</Label>
                <Input 
                  value={formData.delivery_location}
                  onChange={(e) => setFormData({...formData, delivery_location: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Cargo Description</Label>
                <Input 
                  value={formData.cargo_description}
                  onChange={(e) => setFormData({...formData, cargo_description: e.target.value})}
                  placeholder="e.g., Building materials, Food supplies"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Cargo Weight (kg)</Label>
                <Input 
                  type="number"
                  value={formData.cargo_weight_kg}
                  onChange={(e) => setFormData({...formData, cargo_weight_kg: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Assignment & Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Assignment & Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Truck</Label>
                <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({...formData, vehicle_id: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select truck" />
                  </SelectTrigger>
                  <SelectContent>
                    {trucks.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.registration_number} - {v.brand} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Driver</Label>
                <Select value={formData.driver_id} onValueChange={(v) => setFormData({...formData, driver_id: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contract Date *</Label>
                <Input 
                  type="date"
                  value={formData.contract_date}
                  onChange={(e) => setFormData({...formData, contract_date: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Delivery Date</Label>
                <Input 
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Financials</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contract Amount (Le) *</Label>
                <Input 
                  type="number"
                  value={formData.contract_amount}
                  onChange={(e) => setFormData({...formData, contract_amount: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment</Label>
                  <Select value={formData.payment_status} onValueChange={(v) => setFormData({...formData, payment_status: v})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-sm text-gray-700">Trip Expenses</h3>
              <Button type="button" variant="outline" size="sm" onClick={addExpense}>
                <Plus className="w-4 h-4 mr-1" />
                Add Expense
              </Button>
            </div>
            
            {expenses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No expenses added yet</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((exp, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Input 
                        placeholder="Description"
                        value={exp.description}
                        onChange={(e) => updateExpense(index, 'description', e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex gap-2">
                        <Select 
                          value={exp.category} 
                          onValueChange={(v) => updateExpense(index, 'category', v)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input 
                          type="number"
                          placeholder="Amount"
                          value={exp.amount}
                          onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeExpense(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Contract Amount:</span>
                <span className="font-medium">Le {(parseFloat(formData.contract_amount) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Total Expenses:</span>
                <span className="font-medium">-Le {totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2">
                <span>Net Revenue:</span>
                <span className={netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}>
                  Le {netRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes..."
              className="mt-1"
            />
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Update Contract' : 'Create Contract'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}