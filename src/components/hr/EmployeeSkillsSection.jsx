import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Award,
  GraduationCap,
  Briefcase,
  Plus,
  X,
  Edit2,
  Upload,
  FileText,
  ExternalLink,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner", color: "bg-gray-100 text-gray-700" },
  { value: "intermediate", label: "Intermediate", color: "bg-blue-100 text-blue-700" },
  { value: "advanced", label: "Advanced", color: "bg-green-100 text-green-700" },
  { value: "expert", label: "Expert", color: "bg-purple-100 text-purple-700" },
];

export default function EmployeeSkillsSection({ employee, canEdit = false }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("skills");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("skill");
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Employee.update(employee?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Updated successfully");
      setDialogOpen(false);
      setFormData({});
      setEditingIndex(null);
    },
  });

  const skills = employee?.skills || [];
  const certifications = employee?.certifications || [];
  const trainingHistory = employee?.training_history || [];

  const openAddDialog = (type) => {
    setDialogType(type);
    setEditingIndex(null);
    setFormData({});
    setDialogOpen(true);
  };

  const openEditDialog = (type, index, data) => {
    setDialogType(type);
    setEditingIndex(index);
    setFormData(data);
    setDialogOpen(true);
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [fieldName]: file_url }));
      toast.success("File uploaded");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    let updatedArray;
    let fieldName;

    if (dialogType === "skill") {
      fieldName = "skills";
      updatedArray = [...skills];
    } else if (dialogType === "certification") {
      fieldName = "certifications";
      updatedArray = [...certifications];
    } else {
      fieldName = "training_history";
      updatedArray = [...trainingHistory];
    }

    if (editingIndex !== null) {
      updatedArray[editingIndex] = formData;
    } else {
      updatedArray.push(formData);
    }

    updateMutation.mutate({ [fieldName]: updatedArray });
  };

  const handleDelete = (type, index) => {
    let fieldName;
    let updatedArray;

    if (type === "skill") {
      fieldName = "skills";
      updatedArray = skills.filter((_, i) => i !== index);
    } else if (type === "certification") {
      fieldName = "certifications";
      updatedArray = certifications.filter((_, i) => i !== index);
    } else {
      fieldName = "training_history";
      updatedArray = trainingHistory.filter((_, i) => i !== index);
    }

    updateMutation.mutate({ [fieldName]: updatedArray });
  };

  const getSkillLevelInfo = (level) => {
    return SKILL_LEVELS.find(l => l.value === level) || SKILL_LEVELS[0];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1EB053]" />
            Skills & Development
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="skills" className="flex-1 text-xs sm:text-sm">
              <Briefcase className="w-4 h-4 mr-1" />
              Skills ({skills.length})
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex-1 text-xs sm:text-sm">
              <Award className="w-4 h-4 mr-1" />
              Certifications ({certifications.length})
            </TabsTrigger>
            <TabsTrigger value="training" className="flex-1 text-xs sm:text-sm">
              <GraduationCap className="w-4 h-4 mr-1" />
              Training ({trainingHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="space-y-3">
              {skills.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No skills added yet</p>
              ) : (
                skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{skill.name}</span>
                        <Badge className={getSkillLevelInfo(skill.level).color}>
                          {getSkillLevelInfo(skill.level).label}
                        </Badge>
                      </div>
                      {skill.years_experience && (
                        <p className="text-sm text-gray-500 mt-1">
                          {skill.years_experience} {skill.years_experience === 1 ? 'year' : 'years'} experience
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEditDialog("skill", index, skill)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete("skill", index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
              {canEdit && (
                <Button variant="outline" className="w-full" onClick={() => openAddDialog("skill")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications">
            <div className="space-y-3">
              {certifications.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No certifications added yet</p>
              ) : (
                certifications.map((cert, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{cert.name}</span>
                          {cert.expiry_date && new Date(cert.expiry_date) < new Date() && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{cert.issuing_authority}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          {cert.issue_date && (
                            <span>Issued: {format(new Date(cert.issue_date), 'MMM d, yyyy')}</span>
                          )}
                          {cert.expiry_date && (
                            <span>Expires: {format(new Date(cert.expiry_date), 'MMM d, yyyy')}</span>
                          )}
                          {cert.credential_id && <span>ID: {cert.credential_id}</span>}
                        </div>
                        {cert.document_url && (
                          <a href={cert.document_url} target="_blank" rel="noopener noreferrer" 
                             className="inline-flex items-center gap-1 text-sm text-[#0072C6] mt-2 hover:underline">
                            <FileText className="w-3 h-3" />
                            View Certificate
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog("certification", index, cert)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete("certification", index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {canEdit && (
                <Button variant="outline" className="w-full" onClick={() => openAddDialog("certification")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certification
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training">
            <div className="space-y-3">
              {trainingHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No training history yet</p>
              ) : (
                trainingHistory.map((training, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="font-medium">{training.title}</span>
                        <p className="text-sm text-gray-500">{training.provider}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          {training.completion_date && (
                            <span>Completed: {format(new Date(training.completion_date), 'MMM d, yyyy')}</span>
                          )}
                          {training.duration_hours && (
                            <span>{training.duration_hours} hours</span>
                          )}
                        </div>
                        {training.notes && (
                          <p className="text-sm text-gray-600 mt-2">{training.notes}</p>
                        )}
                        {training.certificate_url && (
                          <a href={training.certificate_url} target="_blank" rel="noopener noreferrer" 
                             className="inline-flex items-center gap-1 text-sm text-[#0072C6] mt-2 hover:underline">
                            <FileText className="w-3 h-3" />
                            View Certificate
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog("training", index, training)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete("training", index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {canEdit && (
                <Button variant="outline" className="w-full" onClick={() => openAddDialog("training")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Training
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? "Edit" : "Add"} {dialogType === "skill" ? "Skill" : dialogType === "certification" ? "Certification" : "Training"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {dialogType === "skill" && (
                <>
                  <div>
                    <Label>Skill Name *</Label>
                    <Input 
                      value={formData.name || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Microsoft Excel, Forklift Operation"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Proficiency Level</Label>
                    <Select value={formData.level || "beginner"} onValueChange={(val) => setFormData(prev => ({ ...prev, level: val }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Years of Experience</Label>
                    <Input 
                      type="number" 
                      value={formData.years_experience || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseFloat(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {dialogType === "certification" && (
                <>
                  <div>
                    <Label>Certification Name *</Label>
                    <Input 
                      value={formData.name || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., First Aid Certificate"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Issuing Authority</Label>
                    <Input 
                      value={formData.issuing_authority || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, issuing_authority: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Issue Date</Label>
                      <Input 
                        type="date" 
                        value={formData.issue_date || ""} 
                        onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Expiry Date</Label>
                      <Input 
                        type="date" 
                        value={formData.expiry_date || ""} 
                        onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Credential ID</Label>
                    <Input 
                      value={formData.credential_id || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, credential_id: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Certificate Document</Label>
                    <div className="mt-1">
                      {formData.document_url ? (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm flex-1">Document uploaded</span>
                          <Button size="sm" variant="ghost" onClick={() => setFormData(prev => ({ ...prev, document_url: "" }))}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Input type="file" onChange={(e) => handleFileUpload(e, "document_url")} disabled={uploading} />
                      )}
                    </div>
                  </div>
                </>
              )}

              {dialogType === "training" && (
                <>
                  <div>
                    <Label>Training Title *</Label>
                    <Input 
                      value={formData.title || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Safety Training Course"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Training Provider</Label>
                    <Input 
                      value={formData.provider || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Completion Date</Label>
                      <Input 
                        type="date" 
                        value={formData.completion_date || ""} 
                        onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Duration (hours)</Label>
                      <Input 
                        type="number" 
                        value={formData.duration_hours || ""} 
                        onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseFloat(e.target.value) || 0 }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea 
                      value={formData.notes || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Certificate Document</Label>
                    <div className="mt-1">
                      {formData.certificate_url ? (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm flex-1">Document uploaded</span>
                          <Button size="sm" variant="ghost" onClick={() => setFormData(prev => ({ ...prev, certificate_url: "" }))}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Input type="file" onChange={(e) => handleFileUpload(e, "certificate_url")} disabled={uploading} />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={updateMutation.isPending || uploading}
                className="bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}