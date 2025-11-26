import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Settings,
  UserPlus,
  UserMinus,
  Edit2,
  Trash2,
  LogOut,
  Shield
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function GroupSettingsDialog({
  open,
  onOpenChange,
  room,
  employees = [],
  currentEmployee,
  onRoomUpdated
}) {
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState(room?.name || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = room?.admin_ids?.includes(currentEmployee?.id) || room?.created_by === currentEmployee?.email;
  const currentParticipants = room?.participants || [];
  const currentParticipantNames = room?.participant_names || [];

  const updateRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.update(room.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      toast.success("Group updated");
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: () => base44.entities.ChatRoom.delete(room.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      onOpenChange(false);
      onRoomUpdated?.(null);
      toast.success("Group deleted");
    },
  });

  const handleUpdateName = () => {
    if (groupName.trim() && groupName !== room.name) {
      updateRoomMutation.mutate({ name: groupName.trim() });
    }
  };

  const handleAddMember = (emp) => {
    if (currentParticipants.includes(emp.id)) return;
    
    updateRoomMutation.mutate({
      participants: [...currentParticipants, emp.id],
      participant_names: [...currentParticipantNames, emp.full_name],
    });
  };

  const handleRemoveMember = (empId, empName) => {
    updateRoomMutation.mutate({
      participants: currentParticipants.filter(p => p !== empId),
      participant_names: currentParticipantNames.filter(n => n !== empName),
    });
  };

  const handleLeaveGroup = () => {
    handleRemoveMember(currentEmployee?.id, currentEmployee?.full_name);
    onOpenChange(false);
    onRoomUpdated?.(null);
    toast.success("You left the group");
  };

  const handleDeleteGroup = () => {
    deleteRoomMutation.mutate();
  };

  const nonMembers = employees.filter(e => !currentParticipants.includes(e.id));
  const filteredNonMembers = nonMembers.filter(e =>
    e.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!room || room.type !== 'group') return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Group Settings
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="members" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="flex-1 overflow-hidden flex flex-col mt-4">
              {/* Current Members */}
              <div className="mb-4">
                <Label className="text-sm text-gray-500">
                  {currentParticipants.length} Members
                </Label>
                <ScrollArea className="h-[150px] mt-2 border rounded-lg">
                  <div className="p-2 space-y-1">
                    {currentParticipants.map((id, idx) => {
                      const name = currentParticipantNames[idx];
                      const emp = employees.find(e => e.id === id);
                      const isCurrentUser = id === currentEmployee?.id;
                      const isMemberAdmin = room.admin_ids?.includes(id);

                      return (
                        <div key={id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={emp?.profile_photo} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                                {name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {name} {isCurrentUser && "(You)"}
                              </p>
                              {isMemberAdmin && (
                                <Badge variant="secondary" className="text-xs h-4">
                                  <Shield className="w-2.5 h-2.5 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isAdmin && !isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600"
                              onClick={() => handleRemoveMember(id, name)}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Add Members */}
              {isAdmin && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <Label className="text-sm text-gray-500 mb-2">Add Members</Label>
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <ScrollArea className="flex-1 border rounded-lg">
                    <div className="p-2 space-y-1">
                      {filteredNonMembers.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No employees to add</p>
                      ) : (
                        filteredNonMembers.map((emp) => (
                          <div
                            key={emp.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleAddMember(emp)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={emp.profile_photo} />
                                <AvatarFallback className="text-xs bg-gray-200">
                                  {emp.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{emp.full_name}</p>
                                <p className="text-xs text-gray-500">{emp.department}</p>
                              </div>
                            </div>
                            <UserPlus className="w-4 h-4 text-[#1EB053]" />
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-4 space-y-4">
              {isAdmin && (
                <div>
                  <Label>Group Name</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                    <Button onClick={handleUpdateName} disabled={!groupName.trim()}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-amber-600 hover:text-amber-700"
                  onClick={() => setShowLeaveConfirm(true)}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Group
                </Button>
                
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Group
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Leave Confirmation */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Group?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer receive messages from this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroup} className="bg-amber-600 hover:bg-amber-700">
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group and all messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}