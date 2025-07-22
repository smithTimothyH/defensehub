import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Target, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function TrainingScenarios() {
  const scenarios = [
    {
      id: 1,
      title: "Email Security Fundamentals",
      description: "Learn to identify and report suspicious emails",
      difficulty: "Beginner",
      duration: "15 min",
      completed: true,
      type: "interactive",
      topics: ["Phishing", "Email Verification", "Safe Practices"],
    },
    {
      id: 2,
      title: "Social Engineering Awareness",
      description: "Recognize and defend against social engineering attacks",
      difficulty: "Intermediate",
      duration: "25 min",
      completed: false,
      type: "scenario",
      topics: ["Psychology", "Manipulation", "Verification"],
    },
    {
      id: 3,
      title: "Incident Response Procedures",
      description: "Step-by-step guide to reporting security incidents",
      difficulty: "Advanced",
      duration: "30 min",
      completed: false,
      type: "simulation",
      topics: ["Incident Response", "Communication", "Documentation"],
    },
    {
      id: 4,
      title: "Password Security & MFA",
      description: "Best practices for password management and multi-factor authentication",
      difficulty: "Beginner",
      duration: "20 min",
      completed: true,
      type: "interactive",
      topics: ["Passwords", "MFA", "Account Security"],
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-cyber-success bg-opacity-20 text-cyber-success";
      case "Intermediate":
        return "bg-cyber-warning bg-opacity-20 text-cyber-warning";
      case "Advanced":
        return "bg-cyber-error bg-opacity-20 text-cyber-error";
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "interactive":
        return <BookOpen className="h-4 w-4" />;
      case "scenario":
        return <Target className="h-4 w-4" />;
      case "simulation":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Scenarios</h2>
          <p className="text-gray-600">Interactive cybersecurity training modules and scenarios</p>
        </div>
        <Button className="bg-cyber-primary hover:bg-blue-700">
          <GraduationCap className="h-4 w-4 mr-2" />
          Create Custom Scenario
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-cyber-success" />
              <div>
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-cyber-warning" />
              <div>
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-cyber-primary" />
              <div>
                <p className="text-2xl font-bold text-gray-900">85%</p>
                <p className="text-sm text-gray-600">Avg. Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">4.2h</p>
                <p className="text-sm text-gray-600">Time Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(scenario.type)}
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                </div>
                {scenario.completed && (
                  <CheckCircle className="h-5 w-5 text-cyber-success" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{scenario.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {scenario.topics.map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={getDifficultyColor(scenario.difficulty)}>
                    {scenario.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500">{scenario.duration}</span>
                </div>
                
                <Button 
                  variant={scenario.completed ? "outline" : "default"}
                  size="sm"
                  className={!scenario.completed ? "bg-cyber-primary hover:bg-blue-700" : ""}
                >
                  {scenario.completed ? "Review" : "Start Training"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommended Learning Path */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Learning Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-cyber-success rounded-full flex items-center justify-center text-white text-sm font-medium">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Foundation Knowledge</h4>
                <p className="text-sm text-gray-600">Complete basic security awareness modules</p>
              </div>
              <CheckCircle className="h-5 w-5 text-cyber-success" />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-cyber-warning rounded-full flex items-center justify-center text-white text-sm font-medium">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Practical Application</h4>
                <p className="text-sm text-gray-600">Apply knowledge in realistic scenarios</p>
              </div>
              <Clock className="h-5 w-5 text-cyber-warning" />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-500">Advanced Simulations</h4>
                <p className="text-sm text-gray-500">Master complex security challenges</p>
              </div>
              <div className="w-5 h-5"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
