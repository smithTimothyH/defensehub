import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Brain, Shield, Users } from "lucide-react";

export default function LearningProgress() {
  // Educational learning paths with realistic progress data
  const learningPaths = [
    {
      title: "Phishing Detection Basics",
      description: "Learn to identify common phishing techniques",
      progress: 85,
      icon: Shield,
      skills: ["Email Analysis", "URL Inspection", "Social Engineering"],
      level: "Beginner",
      estimatedTime: "2 hours",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Advanced Threat Recognition",
      description: "Master sophisticated attack vectors",
      progress: 60,
      icon: Brain,
      skills: ["APT Detection", "Spear Phishing", "Business Email Compromise"],
      level: "Advanced", 
      estimatedTime: "4 hours",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Incident Response Fundamentals",
      description: "Essential crisis management skills",
      progress: 40,
      icon: Users,
      skills: ["Communication", "Documentation", "Escalation"],
      level: "Intermediate",
      estimatedTime: "3 hours", 
      color: "bg-green-100 text-green-700"
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-cyber-primary" />
            Learning Progress
          </h3>
          <Badge variant="outline" className="text-cyber-primary">
            3 Active Paths
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {learningPaths.map((path, index) => {
            const Icon = path.icon;
            return (
              <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${path.color.split(' ')[0]} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${path.color.split(' ')[1]} ${path.color.split(' ')[2]}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{path.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{path.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {path.level}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{path.estimatedTime}</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{path.progress}%</span>
                  </div>
                  <Progress value={path.progress} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {path.skills.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
