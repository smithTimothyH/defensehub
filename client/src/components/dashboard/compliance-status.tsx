import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Target, Trophy } from "lucide-react";

export default function SkillMastery() {
  // Educational skill categories with mastery tracking
  const skillCategories = [
    {
      category: "Email Security",
      description: "Phishing detection and email threat analysis",
      mastery: 92,
      icon: Target,
      skills: [
        { name: "Phishing Identification", level: "Expert", progress: 95 },
        { name: "Email Header Analysis", level: "Advanced", progress: 88 },
        { name: "Attachment Safety", level: "Expert", progress: 92 }
      ],
      badge: "Email Guardian",
      color: "bg-blue-500"
    },
    {
      category: "Incident Response", 
      description: "Crisis management and communication skills",
      mastery: 78,
      icon: Award,
      skills: [
        { name: "Threat Assessment", level: "Advanced", progress: 85 },
        { name: "Team Coordination", level: "Intermediate", progress: 70 },
        { name: "Documentation", level: "Advanced", progress: 80 }
      ],
      badge: "Crisis Manager",
      color: "bg-green-500"
    },
    {
      category: "Security Awareness",
      description: "Social engineering and human factor security", 
      mastery: 85,
      icon: Trophy,
      skills: [
        { name: "Social Engineering Detection", level: "Expert", progress: 90 },
        { name: "Password Security", level: "Expert", progress: 95 },
        { name: "Physical Security", level: "Advanced", progress: 75 }
      ],
      badge: "Security Champion",
      color: "bg-purple-500"
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Expert": return "text-green-700 bg-green-100";
      case "Advanced": return "text-blue-700 bg-blue-100";
      case "Intermediate": return "text-yellow-700 bg-yellow-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 90) return "text-green-600";
    if (mastery >= 75) return "text-blue-600";
    if (mastery >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="h-5 w-5 mr-2 text-cyber-primary" />
            Skill Mastery
          </h3>
          <Badge variant="outline" className="text-cyber-primary">
            3 Categories
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 ${category.color} rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{category.category}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getMasteryColor(category.mastery)}`}>
                      {category.mastery}%
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {category.badge}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700">{skill.name}</span>
                        <Badge className={`text-xs ${getLevelColor(skill.level)}`}>
                          {skill.level}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16">
                          <Progress value={skill.progress} className="h-1" />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{skill.progress}%</span>
                      </div>
                    </div>
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
