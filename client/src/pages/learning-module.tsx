import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Play, CheckCircle, Star, Target, Brain, 
  Mail, Shield, Key, AlertTriangle, Award, Trophy,
  Clock, Book, Users, MessageSquare, Lightbulb, ChevronRight,
  Zap, Crown, Gift, PartyPopper
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  example: string;
  difficulty: "easy" | "medium" | "hard";
}

interface LearningContent {
  id: number;
  title: string;
  content: string;
  type: "text" | "scenario" | "interactive";
  icon?: string;
}

interface ModuleData {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  xpReward: number;
  topics: string[];
  learningContent: LearningContent[];
  questions: Question[];
  prerequisites: string[];
  objectives: string[];
}

export default function LearningModule() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const { toast } = useToast();

  // Get module ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const moduleId = urlParams.get('id') || '1';

  const [moduleData] = useState<ModuleData>({
    id: parseInt(moduleId),
    title: "Email Security Masters",
    description: "Master email security through interactive scenarios and real-world examples",
    difficulty: "Beginner",
    duration: "15 min",
    xpReward: 125,
    topics: ["Phishing Detection", "Email Verification", "Safe Email Practices"],
    prerequisites: [],
    objectives: [
      "Identify common phishing indicators",
      "Verify sender authenticity",
      "Implement safe email practices",
      "Respond appropriately to suspicious emails"
    ],
    learningContent: [
      {
        id: 1,
        title: "Understanding Email Threats",
        type: "text",
        icon: "mail",
        content: "Email remains one of the most common attack vectors for cybercriminals. Understanding the various types of email threats is crucial for maintaining cybersecurity. Phishing attacks often disguise themselves as legitimate communications from trusted sources."
      },
      {
        id: 2,
        title: "Real-World Phishing Scenario",
        type: "scenario",
        icon: "alertTriangle",
        content: "You receive an email claiming to be from your bank asking you to verify your account information immediately. The email has your bank's logo and appears legitimate. What should you do?"
      },
      {
        id: 3,
        title: "Interactive Security Check",
        type: "interactive",
        icon: "shield",
        content: "Practice identifying suspicious email elements using our interactive email analyzer. Look for red flags like unusual sender addresses, urgent language, and suspicious links."
      }
    ],
    questions: [
      {
        id: 1,
        question: "Which of the following is a common indicator of a phishing email?",
        options: [
          "Professional email signature",
          "Urgent language demanding immediate action",
          "Company logo in the header",
          "Personalized greeting with your name"
        ],
        correctAnswer: 1,
        explanation: "Urgent language demanding immediate action is a classic phishing tactic designed to make you act without thinking carefully.",
        example: "Example: 'URGENT: Your account will be closed in 24 hours unless you verify immediately!' This creates false urgency to bypass your judgment.",
        difficulty: "easy"
      },
      {
        id: 2,
        question: "What should you do if you receive a suspicious email asking for personal information?",
        options: [
          "Reply with the requested information",
          "Click the link to verify it's legitimate",
          "Delete the email and report it to IT",
          "Forward it to colleagues for their opinion"
        ],
        correctAnswer: 2,
        explanation: "The safest approach is to delete suspicious emails and report them to your IT security team for proper handling.",
        example: "Example: If you receive an email claiming to be from your bank asking for passwords, don't click anything. Instead, call your bank directly using the number on your official bank card.",
        difficulty: "medium"
      },
      {
        id: 3,
        question: "Before clicking a link in an email, you should:",
        options: [
          "Click it immediately if it looks legitimate",
          "Hover over the link to see the actual destination URL",
          "Trust it if it's from a known sender",
          "Only click if the email has good formatting"
        ],
        correctAnswer: 1,
        explanation: "Always hover over links to see the actual destination URL. Malicious links often hide behind legitimate-looking text.",
        example: "Example: The text says 'Click here to login to Microsoft' but hovering reveals the URL 'malicious-site.com/fake-login' - this is a clear red flag!",
        difficulty: "medium"
      },
      {
        id: 4,
        question: "Which email element should you be most suspicious of?",
        options: [
          "An email from a colleague's address asking for sensitive data",
          "A company newsletter with multiple links",
          "An automated receipt from an online purchase",
          "A calendar invite for a team meeting"
        ],
        correctAnswer: 0,
        explanation: "Even emails from known addresses can be compromised. Always verify unusual requests through a separate communication channel.",
        example: "Example: If your colleague emails asking for payroll data, call them directly to confirm before sharing. Hackers often compromise email accounts to send convincing requests.",
        difficulty: "hard"
      }
    ]
  });

  const totalSteps = moduleData.learningContent.length + moduleData.questions.length;

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    moduleData.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / moduleData.questions.length) * 100);
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(((currentStep + 1) / totalSteps) * 100);
    } else {
      completeModule();
    }
  };

  const completeModule = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setProgress(100);
    setShowResults(true);
    
    // Show congratulations after a brief delay
    setTimeout(() => {
      setShowCongrats(true);
      toast({
        title: "Module Complete!",
        description: `You earned ${moduleData.xpReward} XP! Score: ${finalScore}%`,
      });
    }, 1500);
  };

  const returnToHub = () => {
    setLocation("/ai-education-hub");
  };

  const getCurrentContent = () => {
    if (currentStep < moduleData.learningContent.length) {
      return moduleData.learningContent[currentStep];
    }
    return null;
  };

  const getCurrentQuestion = () => {
    const questionIndex = currentStep - moduleData.learningContent.length;
    if (questionIndex >= 0 && questionIndex < moduleData.questions.length) {
      return moduleData.questions[questionIndex];
    }
    return null;
  };

  const isContentPhase = currentStep < moduleData.learningContent.length;
  const currentContent = getCurrentContent();
  const currentQuestion = getCurrentQuestion();

  const getContentIcon = (iconName: string) => {
    switch (iconName) {
      case "mail": return <Mail className="h-6 w-6" />;
      case "alertTriangle": return <AlertTriangle className="h-6 w-6" />;
      case "shield": return <Shield className="h-6 w-6" />;
      default: return <Book className="h-6 w-6" />;
    }
  };

  useEffect(() => {
    setProgress((currentStep / totalSteps) * 100);
  }, [currentStep, totalSteps]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={returnToHub}
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hub
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{moduleData.title}</h1>
            <p className="text-gray-600">{moduleData.description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-purple-100 text-purple-800">
              {moduleData.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {moduleData.duration}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Main Content */}
        {showResults ? (
          <Card className="mb-6 overflow-hidden">
            <CardContent className="p-8 text-center relative">
              {/* Confetti Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  {/* Animated Trophy */}
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 animate-bounce shadow-xl">
                    <Crown className="h-10 w-10 text-white" />
                  </div>
                  
                  {/* Achievement Celebration */}
                  <div className="flex justify-center items-center gap-2 mb-4">
                    <PartyPopper className="h-6 w-6 text-pink-500 animate-pulse" />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      MISSION ACCOMPLISHED!
                    </h2>
                    <PartyPopper className="h-6 w-6 text-pink-500 animate-pulse" />
                  </div>
                  
                  <p className="text-lg text-gray-700 mb-2">You've mastered the {moduleData.title} module!</p>
                  
                  {/* Score-based message */}
                  <div className="mb-4">
                    {score >= 90 && (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2 text-green-800">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <span className="font-bold">EXCELLENT! You're a cybersecurity champion!</span>
                          <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                      </div>
                    )}
                    {score >= 70 && score < 90 && (
                      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2 text-blue-800">
                          <Target className="h-5 w-5 text-blue-600" />
                          <span className="font-bold">GREAT JOB! You've got solid security skills!</span>
                        </div>
                      </div>
                    )}
                    {score < 70 && (
                      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2 text-orange-800">
                          <Lightbulb className="h-5 w-5 text-orange-600" />
                          <span className="font-bold">GOOD START! Keep practicing to strengthen your skills!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gamified Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 border-2 border-purple-300">
                    <div className="text-4xl font-bold text-purple-700">{score}%</div>
                    <div className="text-sm text-purple-600 font-medium">Security Score</div>
                    <div className="mt-1">
                      {score >= 90 && <Crown className="h-5 w-5 text-yellow-500 mx-auto" />}
                      {score >= 70 && score < 90 && <Star className="h-5 w-5 text-blue-500 mx-auto" />}
                      {score < 70 && <Target className="h-5 w-5 text-orange-500 mx-auto" />}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg p-4 border-2 border-green-300">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="h-6 w-6 text-yellow-500" />
                      <div className="text-4xl font-bold text-green-700">{moduleData.xpReward}</div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">XP Gained</div>
                    <div className="text-xs text-green-600 mt-1">+{Math.round(moduleData.xpReward * (score/100))} bonus XP</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-200 rounded-lg p-4 border-2 border-blue-300">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Gift className="h-6 w-6 text-pink-500" />
                      <div className="text-4xl font-bold text-blue-700">{totalSteps}</div>
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Challenges</div>
                    <div className="text-xs text-blue-600 mt-1">All completed!</div>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Achievements Unlocked</h3>
                  <div className="flex justify-center gap-4 flex-wrap">
                    <div className="bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-lg p-3 border-2 border-yellow-400">
                      <Award className="h-6 w-6 text-yellow-700 mx-auto mb-1" />
                      <div className="text-xs font-medium text-yellow-800">Module Master</div>
                    </div>
                    {score >= 80 && (
                      <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg p-3 border-2 border-purple-400">
                        <Star className="h-6 w-6 text-purple-700 mx-auto mb-1" />
                        <div className="text-xs font-medium text-purple-800">High Achiever</div>
                      </div>
                    )}
                    {score === 100 && (
                      <div className="bg-gradient-to-br from-pink-200 to-pink-300 rounded-lg p-3 border-2 border-pink-400">
                        <Crown className="h-6 w-6 text-pink-700 mx-auto mb-1" />
                        <div className="text-xs font-medium text-pink-800">Perfect Score</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={returnToHub} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-medium">
                    Continue Learning
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()} className="px-6 py-3">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {isContentPhase ? (
                  <>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {currentContent && getContentIcon(currentContent.icon || "book")}
                    </div>
                    <div>
                      <h3 className="text-xl">{currentContent?.title}</h3>
                      <Badge variant="outline" className="mt-1">
                        {currentContent ? currentContent.type.charAt(0).toUpperCase() + currentContent.type.slice(1) : ''} Content
                      </Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl">Knowledge Check</h3>
                      <Badge variant="outline" className="mt-1">
                        Question {(currentStep - moduleData.learningContent.length) + 1} of {moduleData.questions.length}
                      </Badge>
                    </div>
                  </>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {isContentPhase && currentContent ? (
                <div>
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {currentContent.content}
                    </p>
                  </div>

                  {currentContent.type === "scenario" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <span className="font-medium text-amber-800">Scenario Challenge</span>
                      </div>
                      <p className="text-amber-700 text-sm">
                        Think about how you would handle this situation before proceeding to the knowledge check.
                      </p>
                    </div>
                  )}

                  {currentContent.type === "interactive" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Interactive Learning</span>
                      </div>
                      <p className="text-blue-700 text-sm">
                        This section includes hands-on practice to reinforce your learning.
                      </p>
                    </div>
                  )}
                </div>
              ) : currentQuestion ? (
                <div>
                  <h4 className="text-lg font-medium mb-4">{currentQuestion.question}</h4>
                  
                  <RadioGroup 
                    value={selectedAnswers[currentQuestion.id]?.toString()} 
                    onValueChange={(value) => handleAnswer(currentQuestion.id, parseInt(value))}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {selectedAnswers[currentQuestion.id] !== undefined && (
                    <div className={`mt-4 p-4 rounded-lg border ${
                      selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Target className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer 
                            ? 'text-green-800' 
                            : 'text-red-800'
                        }`}>
                          {selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? 'Correct!' : 'Not quite right'}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 ${
                        selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {currentQuestion.explanation}
                      </p>
                      <div className={`text-xs p-3 rounded-lg ${
                        selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer 
                          ? 'bg-green-100 border border-green-200' 
                          : 'bg-red-100 border border-red-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className="h-3 w-3" />
                          <span className="font-medium">Example:</span>
                        </div>
                        <p className={`${
                          selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer 
                            ? 'text-green-800' 
                            : 'text-red-800'
                        }`}>
                          {currentQuestion.example}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <Button 
                  onClick={nextStep}
                  disabled={!isContentPhase && !!currentQuestion && selectedAnswers[currentQuestion.id] === undefined}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {currentStep === totalSteps - 1 ? 'Complete Module' : 'Next'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Module Info Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moduleData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{objective}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">XP Reward:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-yellow-600">{moduleData.xpReward} XP</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {moduleData.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Congratulations Dialog */}
        <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                Congratulations!
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p>You've successfully completed the <strong>{moduleData.title}</strong> module!</p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{moduleData.xpReward} XP</div>
                <div className="text-sm text-purple-700">Experience Points Earned</div>
              </div>
              <Button onClick={() => setShowCongrats(false)} className="w-full">
                Continue Learning
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}