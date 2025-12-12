import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  UserMinus,
  Settings,
  Edit2,
  LogOut,
  Shield,
  X,
  Check,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function GroupSettings({ 
  room, 
  open, 
  onOpenChange, 
  currentEmployee, 
  orgId 
}) {
  const queryClient = useQueryClient();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(room?.name || "");
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = room?.admin_ids?.includes(currentEmployee?.id) || 
                  room?.created_by === currentEmployee?.id;

  const { data: allEmployees = [] } = useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => base44.entities.Employee.filter({ organisation_id: orgId, status: 'active' }),
    enabled: !!orgId && showAddMembers,
  });

  const nonMembers = allEmployees.filter(
    e => !room?.participants?.includes(e.id)
  ).filter(e => 
    e.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatRoom.update(room.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      toast.success("Group updated");
    },
  });

  const handleUpdateName = () => {
    if (newName.trim() && newName !== room.name) {
      updateRoomMutation.mutate({ name: newName.trim() });
    }
    setIsEditingName(false);
  };

  const handleAddMember = (employee) => {
    const newParticipants = [...(room.participants || []), employee.id];
    const newNames = [...(room.participant_names || []), employee.full_name];
    
    updateRoomMutation.mutate({
      participants: newParticipants,
      participant_names: newNames
    });
    toast.success(`${employee.full_name} added to group`);
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    
    const newParticipants = room.participants.filter(id => id !== memberToRemove.id);
    const newNames = room.participant_names.filter(n => n !== memberToRemove.name);
    
    updateRoomMutation.mutate({
      participants: newParticipants,
      participant_names: newNames
    });
    
    toast.success(`${memberToRemove.name} removed from group`);
    setMemberToRemove(null);
  };

  const handleMakeAdmin = (memberId) => {
    const newAdmins = [...(room.admin_ids || []), memberId];
    updateRoomMutation.mutate({ admin_ids: newAdmins });
    toast.success("Member is now an admin");
  };

  const handleLeaveGroup = () => {
    const newParticipants = room.participants.filter(id => id !== currentEmployee?.id);
    const newNames = room.participant_names.filter(n => n !== currentEmployee?.full_name);
    
    updateRoomMutation.mutate({
      participants: newParticipants,
      participant_names: newNames
    });
    
    onOpenChange(false);
    toast.success("You left the group");
  };

  if (!room) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Group Settings
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-6">
            {/* Group Info */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                    <Users className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                {isAdmin && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-center"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleUpdateName}>
                    <Check className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3">
                  <h3 className="font-semibold text-lg">{room.name}</h3>
                  {isAdmin && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditingName(true)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-500">{room.participants?.length || 0} members</p>
            </div>

            {/* Members List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Members</h4>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={() => setShowAddMembers(!showAddMembers)}>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>

              {showAddMembers && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <ScrollArea className="max-h-40">
                    {nonMembers.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">No employees found</p>
                    ) : (
                      <div className="space-y-1">
                        {nonMembers.map((emp) => (
                          <div 
                            key={emp.id} 
                            className="flex items-center justify-between p-2 hover:bg-white rounded cursor-pointer"
                            onClick={() => handleAddMember(emp)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={emp.profile_photo} />
                                <AvatarFallback>{emp.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{emp.full_name}</span>
                            </div>
                            <UserPlus className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}

              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {room.participants?.map((memberId, idx) => {
                    const memberName = room.participant_names?.[idx] || 'Unknown';
                    const isMemberAdmin = room.admin_ids?.includes(memberId);
                    const isCurrentUser = memberId === currentEmployee?.id;

                    return (
                      <div key={memberId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-sm">
                              {memberName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {memberName} {isCurrentUser && '(You)'}
                            </p>
                            {isMemberAdmin && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {isAdmin && !isCurrentUser && (
                          <div className="flex items-center gap-1">
                            {!isMemberAdmin && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7"
                                onClick={() => handleMakeAdmin(memberId)}
                              >
                                <Shield className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-red-500"
                              onClick={() => setMemberToRemove({ id: memberId, name: memberName })}
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Leave Group */}
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLeaveGroup}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from this group?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}