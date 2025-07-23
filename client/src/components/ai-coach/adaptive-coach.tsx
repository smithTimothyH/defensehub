import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, Bot, Star, TrendingUp, Target, Award, 
  Zap, Trophy, Crown, Medal, Flame, ChevronRight,
  BookOpen, Users, Shield, MessageSquare, Lightbulb
} from "lucide-react";

interface UserBehaviorData {
  completedModules: string[];
  strengths: string[];
  weaknesses: string[];
  learningStyle: "visual" | "interactive" | "reading" | "hands-on";
  engagementLevel: "low" | "medium" | "high";
  difficultyPreference: "basic" | "intermediate" | "advanced";
  totalXP: number;
  streak: number;
}

interface AdaptiveCoachingResponse {
  personalizedMessage: string;
  recommendedActions: string[];
  nextLearningPath: string[];
  motivationalContent: string;
  adaptedDifficulty: string;
  gamificationElements: {
    badgesEarned: string[];
    streakBonus: number;
    nextMilestone: string;
  };
}

export default function AdaptiveCoach() {
  const [showCoachDialog, setShowCoachDialog] = useState(false);
  const [coachingData, setCoachingData] = useState<AdaptiveCoachingResponse | null>(null);
  const [currentTopic, setCurrentTopic] = useState("General Security");
  const { toast } = useToast();

  // Mock user behavior data - in real app this would come from database
  const [userBehavior] = useState<UserBehaviorData>({
    completedModules: ["Email Security Fundamentals", "Password Security Best Practices"],
    strengths: ["Pattern Recognition", "Quick Learning", "Attention to Detail"],
    weaknesses: ["Advanced Threats", "Social Engineering"],
    learningStyle: "interactive",
    engagementLevel: "high",
    difficultyPreference: "intermediate",
    totalXP: 375,
    streak: 3
  });

  const adaptiveCoachingMutation = useMutation({
    mutationFn: async (data: { userBehavior: UserBehaviorData; currentTopic: string; recentPerformance: any[] }) => {
      const response = await fetch('/api/ai-coach/adaptive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get coaching');
      }
      
      return response.json() as Promise<AdaptiveCoachingResponse>;
    },
    onSuccess: (data: AdaptiveCoachingResponse) => {
      setCoachingData(data);
      setShowCoachDialog(true);
      toast({
        title: "AI Coach Ready!",
        description: "Your personalized coaching session is ready.",
      });
    },
    onError: () => {
      toast({
        title: "Coaching Unavailable",
        description: "AI coach is temporarily unavailable. Try again later.",
        variant: "destructive",
      });
    },
  });

  const getCoaching = () => {
    adaptiveCoachingMutation.mutate({
      userBehavior,
      currentTopic,
      recentPerformance: [
        { module: "Email Security", score: 85, timeSpent: 15 },
        { module: "Password Security", score: 95, timeSpent: 12 }
      ]
    });
  };

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case "visual": return <Target className="h-4 w-4" />;
      case "interactive": return <Users className="h-4 w-4" />;
      case "reading": return <BookOpen className="h-4 w-4" />;
      case "hands-on": return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "high": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Coach Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-800">AI Learning Coach</h3>
              <p className="text-sm text-purple-600 font-normal">Personalized cybersecurity education</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Learning Profile */}
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                {getLearningStyleIcon(userBehavior.learningStyle)}
                <span className="font-medium text-sm">Learning Style</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {userBehavior.learningStyle}
              </Badge>
            </div>

            {/* Engagement Level */}
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium text-sm">Engagement</span>
              </div>
              <Badge className={`capitalize ${getEngagementColor(userBehavior.engagementLevel)}`}>
                {userBehavior.engagementLevel}
              </Badge>
            </div>

            {/* Learning Streak */}
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4" />
                <span className="font-medium text-sm">Learning Streak</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-orange-600">{userBehavior.streak}</span>
                <span className="text-sm text-gray-600">days</span>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg p-4 border border-purple-100 mb-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Learning Progress
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Total XP</span>
                  <span className="font-bold text-purple-600">{userBehavior.totalXP} XP</span>
                </div>
                <Progress value={(userBehavior.totalXP / 500) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {500 - userBehavior.totalXP} XP to next milestone
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Completed Modules</span>
                  <span className="font-bold">{userBehavior.completedModules.length}/6</span>
                </div>
                <Progress value={(userBehavior.completedModules.length / 6) * 100} className="h-2" />
              </div>
            </div>
          </div>

          {/* Get Personalized Coaching */}
          <Button 
            onClick={getCoaching}
            disabled={adaptiveCoachingMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {adaptiveCoachingMutation.isPending ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-spin" />
                AI Coach is analyzing...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Get Personalized Coaching
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Trophy className="h-5 w-5" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userBehavior.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <Star className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Target className="h-5 w-5" />
              Growth Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userBehavior.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">{weakness}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adaptive Coaching Dialog */}
      <Dialog open={showCoachDialog} onOpenChange={setShowCoachDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              Your AI Coach Recommendations
            </DialogTitle>
          </DialogHeader>
          
          {coachingData && (
            <div className="space-y-6">
              {/* Personalized Message */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">Personal Message</h4>
                <p className="text-purple-700">{coachingData.personalizedMessage}</p>
              </div>

              {/* Motivational Content */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Achievement Celebration</h4>
                <p className="text-yellow-700">{coachingData.motivationalContent}</p>
              </div>

              {/* Recommended Actions */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Recommended Next Steps
                </h4>
                <div className="space-y-2">
                  {coachingData.recommendedActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <span className="text-sm text-blue-800">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Learning Path */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Suggested Learning Path
                </h4>
                <div className="flex flex-wrap gap-2">
                  {coachingData.nextLearningPath.map((module, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Gamification Elements */}
              {coachingData.gamificationElements && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                    <Medal className="h-4 w-4" />
                    Achievements & Rewards
                  </h4>
                  
                  <div className="space-y-3">
                    {coachingData.gamificationElements.badgesEarned.length > 0 && (
                      <div>
                        <p className="text-sm text-amber-700 mb-2">New Badges Earned:</p>
                        <div className="flex flex-wrap gap-2">
                          {coachingData.gamificationElements.badgesEarned.map((badge, index) => (
                            <Badge key={index} className="bg-amber-100 text-amber-800">
                              <Crown className="w-3 h-3 mr-1" />
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {coachingData.gamificationElements.streakBonus > 0 && (
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-amber-700">
                          Streak Bonus: +{coachingData.gamificationElements.streakBonus} XP
                        </span>
                      </div>
                    )}
                    
                    <div className="bg-white p-3 rounded border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>Next Milestone:</strong> {coachingData.gamificationElements.nextMilestone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => setShowCoachDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Got it!
                </Button>
                <Button 
                  onClick={getCoaching}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Get New Coaching
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}