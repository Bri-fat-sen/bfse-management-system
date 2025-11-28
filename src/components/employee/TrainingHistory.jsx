import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, Award, Clock, Calendar, ExternalLink,
  BookOpen, Target, TrendingUp
} from "lucide-react";

export default function TrainingHistory({ employee }) {
  const trainingHistory = employee?.training_history || [];
  const certifications = employee?.certifications || [];
  const skills = employee?.skills || [];

  // Calculate total training hours
  const totalHours = trainingHistory.reduce((sum, t) => sum + (t.duration_hours || 0), 0);

  const skillLevelColors = {
    beginner: "bg-gray-100 text-gray-700",
    intermediate: "bg-blue-100 text-blue-700",
    advanced: "bg-purple-100 text-purple-700",
    expert: "bg-green-100 text-green-700"
  };

  const skillLevelProgress = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Trainings Completed</p>
                <p className="text-2xl font-bold text-purple-800">{trainingHistory.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Hours</p>
                <p className="text-2xl font-bold text-blue-800">{totalHours} hrs</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Certifications</p>
                <p className="text-2xl font-bold text-amber-800">{certifications.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#1EB053]" />
              My Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No skills recorded yet</p>
                <p className="text-sm">Skills will be added by HR after assessments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {skills.map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        <Badge className={skillLevelColors[skill.level]}>
                          {skill.level}
                        </Badge>
                      </div>
                      {skill.years_experience && (
                        <span className="text-sm text-gray-500">{skill.years_experience} yrs</span>
                      )}
                    </div>
                    <Progress 
                      value={skillLevelProgress[skill.level]} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No certifications yet</p>
                <p className="text-sm">Your professional certifications will appear here</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {certifications.map((cert, i) => (
                    <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-amber-900">{cert.name}</p>
                          <p className="text-sm text-amber-700">{cert.issuing_authority}</p>
                        </div>
                        {cert.document_url && (
                          <a href={cert.document_url} target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-amber-600">
                        {cert.issue_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Issued: {format(new Date(cert.issue_date), 'MMM yyyy')}
                          </span>
                        )}
                        {cert.expiry_date && (
                          <Badge variant={new Date(cert.expiry_date) < new Date() ? 'destructive' : 'outline'}>
                            Expires: {format(new Date(cert.expiry_date), 'MMM yyyy')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Training History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0072C6]" />
            Training History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainingHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No training records</p>
              <p className="text-sm">Your completed training courses will be listed here</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {trainingHistory.map((training, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{training.title}</p>
                          <p className="text-sm text-gray-500">{training.provider}</p>
                        </div>
                        {training.certificate_url && (
                          <a href={training.certificate_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Certificate
                            </Button>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {training.completion_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(training.completion_date), 'MMM d, yyyy')}
                          </span>
                        )}
                        {training.duration_hours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {training.duration_hours} hours
                          </span>
                        )}
                      </div>
                      {training.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{training.notes}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}