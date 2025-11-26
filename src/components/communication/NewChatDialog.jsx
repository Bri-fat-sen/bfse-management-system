import React, { useState } from "react";
import {
  Search,
  Users,
  MessageSquare,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NewChatDialog({
  open,
  onOpenChange,
  employees,
  currentEmployee,
  onStartDirectChat,
  onCreateGroup
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("direct");
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const filteredEmployees = employees.filter(emp => 
    emp.id !== currentEmployee?.id &&
    (emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     emp.department?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleMember = (emp) => {
    setSelectedMembers(prev => 
      prev.some(m => m.id === emp.id)
        ? prev.filter(m => m.id !== emp.id)
        : [...prev, emp]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    onCreateGroup(groupName, selectedMembers);
    setGroupName("");
    setSelectedMembers([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setSearchTerm("");
    setGroupName("");
    setSelectedMembers([]);
    setActiveTab("direct");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Direct Message
            </TabsTrigger>
            <TabsTrigger value="group" className="gap-2">
              <Users className="w-4 h-4" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <TabsContent value="direct" className="mt-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        onStartDirectChat(emp);
                        handleClose();
                      }}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={emp.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                          {emp.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{emp.full_name}</p>
                        <p className="text-sm text-gray-500">{emp.department || emp.position || emp.role?.replace(/_/g, ' ')}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {emp.status}
                      </Badge>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No employees found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="group" className="mt-0 space-y-4">
              <div>
                <Label>Group Name</Label>
                <Input
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="mt-1"
                />
              </div>

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <Badge
                      key={member.id}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-red-100"
                      onClick={() => toggleMember(member)}
                    >
                      {member.full_name?.split(' ')[0]}
                      <span className="text-red-500">×</span>
                    </Badge>
                  ))}
                </div>
              )}

              <div>
                <Label className="text-sm text-gray-500">
                  Select members ({selectedMembers.length} selected)
                </Label>
                <ScrollArea className="h-[200px] mt-2 border rounded-lg">
                  <div className="p-2 space-y-1">
                    {filteredEmployees.map((emp) => {
                      const isSelected = selectedMembers.some(m => m.id === emp.id);
                      return (
                        <div
                          key={emp.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#1EB053]/10' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleMember(emp)}
                        >
                          <Checkbox checked={isSelected} />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={emp.profile_photo} />
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {emp.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{emp.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{emp.department}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                  className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                >
                  Create Group
                </Button>
              </DialogFooter>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}