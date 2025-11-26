import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  X,
  Check
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function NewGroupDialog({
  open,
  onOpenChange,
  employees,
  currentEmployee,
  orgId,
  onGroupCreated
}) {
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const createGroupMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.create(data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      toast.success("Group created successfully");
      onOpenChange(false);
      setGroupName("");
      setSelectedMembers([]);
      if (onGroupCreated) onGroupCreated(room);
    },
  });

  const toggleMember = (empId) => {
    setSelectedMembers(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
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
      type: 'group',
      participants: allParticipants,
      participant_names: participantNames,
      created_by: currentEmployee?.id,
      created_by_name: currentEmployee?.full_name,
      is_active: true,
    });
  };

  const filteredEmployees = employees.filter(e =>
    e.id !== currentEmployee?.id &&
    (e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0072C6]" />
            Create Group Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Group Name</Label>
            <Input
              placeholder="e.g., Marketing Team"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div>
              <Label className="text-xs text-gray-500">Selected ({selectedMembers.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMembers.map(id => {
                  const emp = employees.find(e => e.id === id);
                  return (
                    <Badge 
                      key={id} 
                      variant="secondary" 
                      className="flex items-center gap-1 pr-1"
                    >
                      {emp?.full_name}
                      <button 
                        onClick={() => toggleMember(id)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label>Add Members</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[200px] border rounded-lg">
            <div className="p-2 space-y-1">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedMembers.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#1EB053]/10' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleMember(emp.id)}
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={emp.profile_photo} />
                      <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-sm">
                        {emp.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{emp.full_name}</p>
                      <p className="text-xs text-gray-500">{emp.department || emp.position}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1EB053] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
          >
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}