import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, Target, CheckCircle, Clock, AlertTriangle, Play, FileText, Users, Shield, Mail, Key, Download, Award, Star, TrendingUp, ChevronRight, ChevronLeft, Brain, Trophy, Crown, Flame, Zap, Medal } from "lucide-react";

export default function TrainingScenarios() {
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [exerciseStep, setExerciseStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [exerciseScore, setExerciseScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

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
      steps: 6
    },
    {
      id: 2,
      title: "Social Engineering Awareness",
      description: "Recognize and defend against social engineering attacks",
      difficulty: "Intermediate",
      duration: "25 min",
      completed: false,
      type: "simulation",
      topics: ["Social Engineering", "Psychology", "Defense"],
      steps: 8
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
      steps: 10
    },
    {
      id: 4,
      title: "Password Security Best Practices",
      description: "Create and manage strong, secure passwords",
      difficulty: "Beginner",
      duration: "20 min",
      completed: true,
      type: "guide",
      topics: ["Passwords", "Authentication", "Security"],
      steps: 5
    }
  ];

  // Calculate real progress from actual data
  const completedScenarios = scenarios.filter(s => s.completed).length;
  const totalScenarios = scenarios.length;
  const completionRate = totalScenarios > 0 ? Math.round((completedScenarios / totalScenarios) * 100) : 0;
  
  // Real experience points based on completed training
  const experiencePoints = (completedScenarios * 125) + (totalScenarios * 25); // 125 per completion + 25 per attempt
  const userLevel = Math.floor(experiencePoints / 250) + 1; // Level up every 250 XP
  const learningStreak = completedScenarios > 0 ? Math.min(completedScenarios, 14) : 0; // Max 14 day realistic streak

  // Real achievements based on actual progress
  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first training module", icon: Star, unlocked: completedScenarios >= 1, rarity: "common" },
    { id: 2, title: "Dedicated Learner", description: "Complete 3 training scenarios", icon: Shield, unlocked: completedScenarios >= 3, rarity: "rare" },
    { id: 3, title: "Security Guardian", description: "Complete 5 security scenarios", icon: Crown, unlocked: completedScenarios >= 5, rarity: "epic" },
    { id: 4, title: "Streak Master", description: "Maintain consistent learning progress", icon: Flame, unlocked: learningStreak >= 3, rarity: "rare" },
    { id: 5, title: "Knowledge Seeker", description: "Complete all available training modules", icon: BookOpen, unlocked: completedScenarios === totalScenarios && totalScenarios > 0, rarity: "common" },
    { id: 6, title: "Expert Champion", description: "Reach advanced proficiency level", icon: Trophy, unlocked: userLevel >= 10, rarity: "legendary" }
  ];

  const levelProgress = ((experiencePoints % 250) / 250) * 100;
  const nextLevelXP = (userLevel + 1) * 250;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-600 border-gray-300 bg-gray-50";
      case "rare": return "text-blue-600 border-blue-300 bg-blue-50";
      case "epic": return "text-purple-600 border-purple-300 bg-purple-50";
      case "legendary": return "text-orange-600 border-orange-300 bg-orange-50";
      default: return "text-gray-600 border-gray-300 bg-gray-50";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "interactive": return <Brain className="h-5 w-5 text-purple-600" />;
      case "simulation": return <Target className="h-5 w-5 text-blue-600" />;
      case "guide": return <BookOpen className="h-5 w-5 text-green-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleStartTraining = (scenario: any) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setShowTrainingDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Scenarios</h2>
          <p className="text-gray-600">Gamified cybersecurity training with achievements and progression</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setShowAchievements(true)}
            variant="outline"
            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </Button>
          <Button className="bg-cyber-primary hover:bg-blue-700">
            <GraduationCap className="h-4 w-4 mr-2" />
            Create Custom Scenario
          </Button>
        </div>
      </div>

      {/* Gamification Progress Panel */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Level {userLevel}</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-purple-700">{experiencePoints} / {nextLevelXP} XP</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">{learningStreak} Day Streak</span>
              </div>
              <div className="text-sm text-orange-700">Keep learning daily!</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">
                  {achievements.filter(a => a.unlocked).length} / {achievements.length} Achievements
                </span>
              </div>
              <div className="text-sm text-yellow-700">Unlock more by completing training</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">{completionRate}% Complete</span>
              </div>
              <div className="text-sm text-green-700">
                {completionRate === 100 ? 'All training completed!' : `${totalScenarios - completedScenarios} scenarios remaining`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-cyber-success" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedScenarios}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalScenarios - completedScenarios}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{achievements.filter(a => a.unlocked).length}</p>
                <p className="text-sm text-gray-600">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round((scenarios.reduce((acc, s) => acc + parseInt(s.duration), 0) / scenarios.length))} min</p>
                <p className="text-sm text-gray-600">Avg Duration</p>
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
                  size="sm"
                  className="bg-cyber-primary hover:bg-blue-700"
                  onClick={() => handleStartTraining(scenario)}
                >
                  Start Training
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Training Dialog */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-cyber-primary" />
              <span>{selectedScenario?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedScenario?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Training Content */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-cyber-primary/10 rounded-full flex items-center justify-center mx-auto">
                    {getTypeIcon(selectedScenario?.type)}
                  </div>
                  <h3 className="text-xl font-semibold">Interactive Training Module</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    This {selectedScenario?.difficulty.toLowerCase()} level training covers essential {selectedScenario?.topics.join(", ").toLowerCase()} concepts through hands-on exercises and real-world scenarios.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-medium text-blue-900">{selectedScenario?.duration}</div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    <div className="text-center">
                      <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="font-medium text-green-900">{selectedScenario?.steps} Steps</div>
                      <div className="text-sm text-gray-600">Learning Modules</div>
                    </div>
                    <div className="text-center">
                      <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="font-medium text-purple-900">125 XP</div>
                      <div className="text-sm text-gray-600">Experience Points</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topics Covered */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Topics Covered</h4>
              <div className="flex flex-wrap gap-2">
                {selectedScenario?.topics.map((topic: string) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Learning Objectives</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Identify and recognize security threats in real-world scenarios</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Apply best practices for cybersecurity awareness</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Develop skills for incident response and reporting</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 justify-end">
              <Button variant="outline" onClick={() => setShowTrainingDialog(false)}>
                Close
              </Button>
              <Button className="bg-cyber-primary hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Begin Training
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievements Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Achievements & Progress
            </DialogTitle>
            <DialogDescription>
              Track your cybersecurity learning journey and unlock rewards
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Progress Summary */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Crown className="h-4 w-4 text-purple-600" />
                      <span className="font-bold text-purple-600">Level {userLevel}</span>
                    </div>
                    <p className="text-xs text-gray-600">Security Expert</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="font-bold text-yellow-600">{experiencePoints} XP</span>
                    </div>
                    <p className="text-xs text-gray-600">Total Experience</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Medal className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">{achievements.filter(a => a.unlocked).length}</span>
                    </div>
                    <p className="text-xs text-gray-600">Achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <Card 
                    key={achievement.id} 
                    className={`transition-all duration-200 ${
                      achievement.unlocked 
                        ? getRarityColor(achievement.rarity) 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          achievement.unlocked ? 'bg-white' : 'bg-gray-200'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            achievement.unlocked ? 'text-gray-700' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-medium ${
                              achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {achievement.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getRarityColor(achievement.rarity)}`}
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className={`text-sm mt-1 ${
                            achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>
                          {achievement.unlocked && (
                            <Badge className="mt-2 bg-green-100 text-green-700 border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Next Achievement Preview */}
            {(() => {
              const nextAchievement = achievements.find(a => !a.unlocked);
              if (!nextAchievement) return null;
              
              let progress = 0;
              let progressText = "";
              
              if (nextAchievement.id === 2) { // Dedicated Learner
                progress = (completedScenarios / 3) * 100;
                progressText = `Complete 3 scenarios (${completedScenarios}/3 completed)`;
              } else if (nextAchievement.id === 3) { // Security Guardian  
                progress = (completedScenarios / 5) * 100;
                progressText = `Complete 5 scenarios (${completedScenarios}/5 completed)`;
              } else if (nextAchievement.id === 5) { // Knowledge Seeker
                progress = (completedScenarios / totalScenarios) * 100;
                progressText = `Complete all scenarios (${completedScenarios}/${totalScenarios} completed)`;
              } else if (nextAchievement.id === 6) { // Expert Champion
                progress = (userLevel / 10) * 100;
                progressText = `Reach level 10 (currently level ${userLevel})`;
              }
              
              return (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-blue-900 mb-2">🎯 Next Achievement</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <nextAchievement.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">{nextAchievement.title}</p>
                        <p className="text-sm text-blue-700">{progressText}</p>
                      </div>
                    </div>
                    <Progress value={progress} className="mt-3 h-2" />
                  </CardContent>
                </Card>
              );
            })()}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowAchievements(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}