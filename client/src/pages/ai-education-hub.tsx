import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import AdaptiveCoach from "@/components/ai-coach/adaptive-coach";
import { 
  Brain, BookOpen, Play, Award, Star, Target, Zap, 
  Trophy, Medal, Crown, Flame, TrendingUp, Users, 
  Shield, Mail, Key, AlertTriangle, CheckCircle, Clock,
  Gamepad2, Sparkles, ChevronRight, BarChart, PieChart
} from "lucide-react";

interface LearningModule {
  id: number;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  completed: boolean;
  xpReward: number;
  type: "interactive" | "scenario" | "game" | "challenge";
  topics: string[];
  engagementLevel: "High" | "Medium" | "Low";
  adaptiveContent: boolean;
  prerequisite?: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface LearningPath {
  id: number;
  name: string;
  description: string;
  modules: number[];
  difficulty: string;
  estimatedTime: string;
  completion: number;
}

export default function AIEducationHub() {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("modules");
  const [userXP, setUserXP] = useState(375);
  const [userLevel, setUserLevel] = useState(2);
  const [streak, setStreak] = useState(3);
  const { toast } = useToast();

  const [learningModules] = useState<LearningModule[]>([
    {
      id: 1,
      title: "Email Security Masters",
      description: "Interactive email security training with real-world scenarios",
      difficulty: "Beginner",
      duration: "15 min",
      completed: true,
      xpReward: 125,
      type: "interactive",
      topics: ["Phishing", "Email Verification", "Safe Practices"],
      engagementLevel: "High",
      adaptiveContent: true
    },
    {
      id: 2,
      title: "Social Engineering Detective",
      description: "Become a detective and solve social engineering mysteries",
      difficulty: "Intermediate",
      duration: "25 min",
      completed: false,
      xpReward: 175,
      type: "game",
      topics: ["Social Engineering", "Psychology", "Detection"],
      engagementLevel: "High",
      adaptiveContent: true,
      prerequisite: 1
    },
    {
      id: 3,
      title: "Incident Response Hero",
      description: "Lead your team through cybersecurity incident scenarios",
      difficulty: "Advanced",
      duration: "30 min",
      completed: false,
      xpReward: 225,
      type: "scenario",
      topics: ["Incident Response", "Leadership", "Communication"],
      engagementLevel: "High",
      adaptiveContent: true,
      prerequisite: 2
    },
    {
      id: 4,
      title: "Password Fortress Builder",
      description: "Build the ultimate password security fortress",
      difficulty: "Beginner",
      duration: "20 min",
      completed: true,
      xpReward: 125,
      type: "interactive",
      topics: ["Passwords", "Authentication", "Security"],
      engagementLevel: "Medium",
      adaptiveContent: false
    },
    {
      id: 5,
      title: "Malware Hunter Challenge",
      description: "Hunt down malware threats in this exciting challenge",
      difficulty: "Intermediate",
      duration: "35 min",
      completed: false,
      xpReward: 200,
      type: "challenge",
      topics: ["Malware", "Detection", "Analysis"],
      engagementLevel: "High",
      adaptiveContent: true,
      prerequisite: 1
    },
    {
      id: 6,
      title: "Privacy Guardian",
      description: "Master data privacy and protection techniques",
      difficulty: "Intermediate",
      duration: "28 min",
      completed: false,
      xpReward: 175,
      type: "interactive",
      topics: ["Privacy", "Data Protection", "GDPR"],
      engagementLevel: "Medium",
      adaptiveContent: true
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: 1,
      title: "Email Expert",
      description: "Complete all email security modules",
      icon: "mail",
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: 2,
      title: "Learning Streak",
      description: "Maintain a 7-day learning streak",
      icon: "flame",
      unlocked: false,
      progress: 3,
      maxProgress: 7
    },
    {
      id: 3,
      title: "Security Champion",
      description: "Complete 5 training modules",
      icon: "crown",
      unlocked: false,
      progress: 2,
      maxProgress: 5
    },
    {
      id: 4,
      title: "XP Master",
      description: "Reach 500 XP",
      icon: "star",
      unlocked: false,
      progress: 375,
      maxProgress: 500
    }
  ]);

  const [learningPaths] = useState<LearningPath[]>([
    {
      id: 1,
      name: "Essential Security Foundations",
      description: "Start your cybersecurity journey with fundamental concepts",
      modules: [1, 4],
      difficulty: "Beginner",
      estimatedTime: "35 min",
      completion: 100
    },
    {
      id: 2,
      name: "Advanced Threat Detection",
      description: "Master advanced threat detection and response techniques",
      modules: [2, 3, 5],
      difficulty: "Advanced",
      estimatedTime: "90 min",
      completion: 0
    },
    {
      id: 3,
      name: "Complete Security Professional",
      description: "Comprehensive training for security professionals",
      modules: [1, 2, 3, 4, 5, 6],
      difficulty: "All Levels",
      estimatedTime: "2.5 hours",
      completion: 33
    }
  ]);

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "interactive": return <Brain className="h-5 w-5" />;
      case "scenario": return <Users className="h-5 w-5" />;
      case "game": return <Gamepad2 className="h-5 w-5" />;
      case "challenge": return <Target className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "High": return "text-green-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const startModule = (module: LearningModule) => {
    setSelectedModule(module);
    setShowModuleDialog(true);
  };

  const completeModule = (module: LearningModule) => {
    setUserXP(prev => prev + module.xpReward);
    toast({
      title: "Module Complete!",
      description: `You earned ${module.xpReward} XP! Keep learning!`,
    });
    setShowModuleDialog(false);
  };

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 200) + 1;
  };

  const getXPToNextLevel = (xp: number) => {
    const currentLevel = calculateLevel(xp);
    return (currentLevel * 200) - xp;
  };

  useEffect(() => {
    setUserLevel(calculateLevel(userXP));
  }, [userXP]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            AI-Powered Cybersecurity Education Hub
          </h1>
          <p className="text-lg text-gray-600">
            Learn cybersecurity through engaging, adaptive experiences designed just for you
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-8 w-8 text-yellow-300" />
                </div>
                <div className="text-3xl font-bold">{userXP}</div>
                <div className="text-sm opacity-90">Total XP</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-8 w-8 text-amber-300" />
                </div>
                <div className="text-3xl font-bold">Level {userLevel}</div>
                <div className="text-sm opacity-90">{getXPToNextLevel(userXP)} XP to next level</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="h-8 w-8 text-orange-300" />
                </div>
                <div className="text-3xl font-bold">{streak}</div>
                <div className="text-sm opacity-90">Day Streak</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Medal className="h-8 w-8 text-cyan-300" />
                </div>
                <div className="text-3xl font-bold">{achievements.filter(a => a.unlocked).length}</div>
                <div className="text-sm opacity-90">Achievements Unlocked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="modules">Learning Modules</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="coach">AI Coach</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningModules.map((module) => (
                <Card key={module.id} className={`relative transition-all duration-300 hover:shadow-lg ${
                  module.completed ? 'border-green-200 bg-green-50' : 'hover:border-purple-300'
                } ${module.prerequisite && !learningModules.find(m => m.id === module.prerequisite)?.completed ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${module.completed ? 'bg-green-100' : 'bg-purple-100'}`}>
                          {module.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            getModuleIcon(module.type)
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getDifficultyColor(module.difficulty)}>
                              {module.difficulty}
                            </Badge>
                            {module.adaptiveContent && (
                              <Badge variant="outline" className="text-purple-600 border-purple-200">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Adaptive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">{module.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{module.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-yellow-600">{module.xpReward} XP</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`h-4 w-4 ${getEngagementColor(module.engagementLevel)}`} />
                        <span className={getEngagementColor(module.engagementLevel)}>
                          {module.engagementLevel} Engagement
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {module.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      onClick={() => startModule(module)}
                      disabled={module.prerequisite && !learningModules.find(m => m.id === module.prerequisite)?.completed}
                      className={`w-full ${module.completed 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {module.completed ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Review Module
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Learning
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <div className="space-y-4">
              {learningPaths.map((path) => (
                <Card key={path.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{path.name}</h3>
                        <p className="text-gray-600">{path.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{path.completion}%</div>
                        <div className="text-sm text-gray-500">Complete</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className={getDifficultyColor(path.difficulty)}>
                        {path.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {path.estimatedTime}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        {path.modules.length} modules
                      </div>
                    </div>
                    
                    <Progress value={path.completion} className="mb-4" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {path.modules.slice(0, 5).map((moduleId, index) => {
                          const module = learningModules.find(m => m.id === moduleId);
                          return (
                            <div 
                              key={index}
                              className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium ${
                                module?.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {index + 1}
                            </div>
                          );
                        })}
                        {path.modules.length > 5 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
                            +{path.modules.length - 5}
                          </div>
                        )}
                      </div>
                      
                      <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                        Continue Path
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`transition-all duration-300 ${
                  achievement.unlocked ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {achievement.icon === 'mail' && <Mail className={`h-8 w-8 ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`} />}
                        {achievement.icon === 'flame' && <Flame className={`h-8 w-8 ${achievement.unlocked ? 'text-orange-600' : 'text-gray-400'}`} />}
                        {achievement.icon === 'crown' && <Crown className={`h-8 w-8 ${achievement.unlocked ? 'text-purple-600' : 'text-gray-400'}`} />}
                        {achievement.icon === 'star' && <Star className={`h-8 w-8 ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`} />}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'}`}>
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coach" className="space-y-6">
            <AdaptiveCoach />
          </TabsContent>
        </Tabs>

        {/* Module Learning Dialog */}
        <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedModule && getModuleIcon(selectedModule.type)}
                {selectedModule?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedModule && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                  <p className="text-purple-700 mb-4">{selectedModule.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span>
                      <div className="text-purple-600">{selectedModule.duration}</div>
                    </div>
                    <div>
                      <span className="font-medium">XP Reward:</span>
                      <div className="text-purple-600">{selectedModule.xpReward} XP</div>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <div className="text-purple-600 capitalize">{selectedModule.type}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Learning Objectives:</h4>
                  <div className="space-y-2">
                    {selectedModule.topics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedModule.adaptiveContent && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">AI-Adaptive Content</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      This module uses AI to adapt to your learning style and pace, 
                      providing personalized scenarios and feedback based on your progress.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowModuleDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => completeModule(selectedModule)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {selectedModule.completed ? 'Review Module' : 'Start Learning'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}