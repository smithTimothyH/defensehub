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
  Clock, Book, Users, MessageSquare, Lightbulb, ChevronRight
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
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
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Module Complete!</h2>
                <p className="text-gray-600">Congratulations on completing the {moduleData.title} module</p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{score}%</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{moduleData.xpReward}</div>
                  <div className="text-sm text-gray-600">XP Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{totalSteps}</div>
                  <div className="text-sm text-gray-600">Steps Completed</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={returnToHub} className="bg-purple-600 hover:bg-purple-700">
                  Return to Education Hub
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retake Module
                </Button>
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
                      <p className={`text-sm ${
                        selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {currentQuestion.explanation}
                      </p>
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