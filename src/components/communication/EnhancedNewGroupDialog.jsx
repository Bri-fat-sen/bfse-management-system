import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  X,
  Check,
  Truck,
  Package,
  ShoppingCart,
  DollarSign,
  Briefcase,
  Building2,
  Wrench,
  UserCog,
  ChevronRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Predefined team templates
const TEAM_TEMPLATES = [
  {
    id: 'transport',
    name: 'Transport Team',
    icon: Truck,
    color: 'from-blue-500 to-cyan-500',
    roles: ['driver', 'warehouse_manager', 'vehicle_sales'],
    description: 'Drivers, warehouse managers, and vehicle sales staff'
  },
  {
    id: 'inventory',
    name: 'Inventory Team',
    icon: Package,
    color: 'from-green-500 to-emerald-500',
    roles: ['warehouse_manager', 'retail_cashier'],
    description: 'Warehouse managers and stock controllers'
  },
  {
    id: 'sales',
    name: 'Sales Team',
    icon: ShoppingCart,
    color: 'from-purple-500 to-pink-500',
    roles: ['retail_cashier', 'vehicle_sales'],
    description: 'All sales and cashier staff'
  },
  {
    id: 'finance',
    name: 'Finance Team',
    icon: DollarSign,
    color: 'from-amber-500 to-orange-500',
    roles: ['accountant', 'payroll_admin'],
    description: 'Accountants and payroll administrators'
  },
  {
    id: 'hr',
    name: 'HR Team',
    icon: Briefcase,
    color: 'from-rose-500 to-red-500',
    roles: ['hr_admin', 'payroll_admin'],
    description: 'HR and payroll staff'
  },
  {
    id: 'management',
    name: 'Management',
    icon: UserCog,
    color: 'from-slate-600 to-slate-800',
    roles: ['super_admin', 'org_admin'],
    description: 'Administrators and managers'
  },
];

export default function EnhancedNewGroupDialog({
  open,
  onOpenChange,
  employees,
  currentEmployee,
  orgId,
  onGroupCreated
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('type'); // 'type', 'template', 'custom'
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const createGroupMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.create(data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      toast.success("Group created successfully");
      handleClose();
      if (onGroupCreated) onGroupCreated(room);
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setStep('type');
    setGroupName("");
    setGroupDescription("");
    setSelectedMembers([]);
    setSelectedTemplate(null);
    setSearchTerm("");
  };

  const toggleMember = (empId) => {
    setSelectedMembers(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setGroupName(template.name);
    
    // Auto-select employees matching the template roles
    const matchingEmployees = employees
      .filter(e => e.id !== currentEmployee?.id && template.roles.includes(e.role))
      .map(e => e.id);
    
    setSelectedMembers(matchingEmployees);
    setStep('custom');
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    const allParticipants = [currentEmployee?.id, ...selectedMembers];
    const participantNames = allParticipants.map(id => {
      if (id === currentEmployee?.id) return currentEmployee?.full_name;
      return employees.find(e => e.id === id)?.full_name;
    }).filter(Boolean);

    createGroupMutation.mutate({
      organisation_id: orgId,
      name: groupName,
      description: groupDescription,
      type: 'group',
      participants: allParticipants,
      participant_names: participantNames,
      admins: [currentEmployee?.id],
      is_active: true,
    });
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      e.id !== currentEmployee?.id &&
      (e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employees, currentEmployee, searchTerm]);

  // Group employees by department
  const groupedEmployees = useMemo(() => {
    const groups = {};
    filteredEmployees.forEach(emp => {
      const dept = emp.department || 'Other';
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(emp);
    });
    return groups;
  }, [filteredEmployees]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <div className="flex h-1 w-16 rounded-full overflow-hidden mb-2">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0072C6]" />
            Create Group Chat
          </DialogTitle>
          <DialogDescription>
            {step === 'type' && "Choose how to create your group"}
            {step === 'template' && "Select a team template"}
            {step === 'custom' && "Customize your group"}
          </DialogDescription>
        </DialogHeader>

        {step === 'type' && (
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full h-auto p-4 flex items-center justify-between"
              onClick={() => setStep('template')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Use Team Template</p>
                  <p className="text-xs text-gray-500">Quick setup for common teams</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto p-4 flex items-center justify-between"
              onClick={() => setStep('custom')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Custom Group</p>
                  <p className="text-xs text-gray-500">Create from scratch</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        )}

        {step === 'template' && (
          <div className="space-y-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('type')}
              className="text-xs text-gray-500"
            >
              ← Back
            </Button>
            
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {TEAM_TEMPLATES.map((template) => {
                  const matchingCount = employees.filter(
                    e => e.id !== currentEmployee?.id && template.roles.includes(e.role)
                  ).length;

                  return (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="w-full h-auto p-3 flex items-center justify-between"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                          <template.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {matchingCount} members
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {step === 'custom' && (
          <div className="space-y-4 overflow-hidden flex flex-col">
            {(step === 'custom' && !selectedTemplate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('type')}
                className="text-xs text-gray-500 self-start"
              >
                ← Back
              </Button>
            )}

            <div className="space-y-3">
              <div>
                <Label>Group Name *</Label>
                <Input
                  placeholder="e.g., Transport Team, Inventory Audit Group"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="What is this group for?"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="mt-1 h-16 resize-none"
                />
              </div>
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div>
                <Label className="text-xs text-gray-500">
                  Selected Members ({selectedMembers.length})
                </Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedMembers.slice(0, 8).map(id => {
                    const emp = employees.find(e => e.id === id);
                    return (
                      <Badge 
                        key={id} 
                        variant="secondary" 
                        className="flex items-center gap-1 pr-1 py-1"
                      >
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={emp?.profile_photo} />
                          <AvatarFallback className="text-[8px]">
                            {emp?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{emp?.full_name?.split(' ')[0]}</span>
                        <button 
                          onClick={() => toggleMember(id)}
                          className="ml-0.5 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    );
                  })}
                  {selectedMembers.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedMembers.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <Label>Add Members</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, department, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="flex-1 mt-2 border rounded-lg min-h-[150px] max-h-[200px]">
                <div className="p-2">
                  {Object.entries(groupedEmployees).map(([dept, emps]) => (
                    <div key={dept} className="mb-3 last:mb-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
                        {dept}
                      </p>
                      {emps.map((emp) => {
                        const isSelected = selectedMembers.includes(emp.id);
                        return (
                          <div
                            key={emp.id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#1EB053]/10' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => toggleMember(emp.id)}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={emp.profile_photo} />
                              <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-xs">
                                {emp.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{emp.full_name}</p>
                              <p className="text-xs text-gray-500 truncate">{emp.position || emp.role}</p>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#1EB053] flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!groupName.trim() || selectedMembers.length === 0 || createGroupMutation.isPending}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                {createGroupMutation.isPending ? 'Creating...' : `Create Group (${selectedMembers.length + 1})`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}