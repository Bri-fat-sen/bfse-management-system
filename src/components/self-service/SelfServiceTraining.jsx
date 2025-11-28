import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { GraduationCap, Award, Clock, ExternalLink, BookOpen } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function SelfServiceTraining({ employee }) {
  const trainingHistory = employee?.training_history || [];
  const certifications = employee?.certifications || [];
  const skills = employee?.skills || [];

  const totalTrainingHours = trainingHistory.reduce((sum, t) => sum + (t.duration_hours || 0), 0);

  const skillLevelColors = {
    beginner: 'bg-blue-100 text-blue-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-green-100 text-green-800',
    expert: 'bg-purple-100 text-purple-800'
  };

  const skillLevelProgress = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-t-4 border-t-[#1EB053]">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Training Completed</p>
                <p className="text-2xl font-bold">{trainingHistory.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#1EB053]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-[#0072C6]">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">{totalTrainingHours}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#0072C6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Certifications</p>
                <p className="text-2xl font-bold">{certifications.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1EB053]" />
              My Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Skills Recorded"
                description="Your skills will be displayed here when added by HR"
              />
            ) : (
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{skill.name}</span>
                      <Badge className={skillLevelColors[skill.level]}>
                        {skill.level}
                      </Badge>
                    </div>
                    <Progress value={skillLevelProgress[skill.level]} className="h-2" />
                    {skill.years_experience && (
                      <p className="text-xs text-gray-400 mt-1">{skill.years_experience} years experience</p>
                    )}
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
              <Award className="w-5 h-5 text-amber-600" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certifications.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No Certifications"
                description="Your professional certifications will appear here"
              />
            ) : (
              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  {certifications.map((cert, index) => {
                    const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{cert.name}</p>
                            <p className="text-xs text-gray-500">{cert.issuing_authority}</p>
                          </div>
                          {isExpired ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Issued: {cert.issue_date ? format(new Date(cert.issue_date), 'MMM yyyy') : 'N/A'}</span>
                          {cert.expiry_date && (
                            <span>Expires: {format(new Date(cert.expiry_date), 'MMM yyyy')}</span>
                          )}
                        </div>
                        {cert.document_url && (
                          <a 
                            href={cert.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-[#0072C6] hover:underline flex items-center gap-1 mt-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Certificate
                          </a>
                        )}
                      </div>
                    );
                  })}
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
            <GraduationCap className="w-5 h-5 text-[#1EB053]" />
            Training History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainingHistory.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No Training Records"
              description="Your completed training courses will be listed here"
            />
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {trainingHistory.map((training, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{training.title}</p>
                        <p className="text-sm text-gray-500">{training.provider}</p>
                        {training.notes && (
                          <p className="text-xs text-gray-400 mt-1">{training.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {training.completion_date ? format(new Date(training.completion_date), 'dd MMM yyyy') : 'N/A'}
                      </p>
                      {training.duration_hours && (
                        <Badge variant="outline">{training.duration_hours} hours</Badge>
                      )}
                      {training.certificate_url && (
                        <a 
                          href={training.certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-[#0072C6] hover:underline flex items-center gap-1 mt-1 justify-end"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Certificate
                        </a>
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