import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AdaptiveCoach from "@/components/ai-coach/adaptive-coach";
import { 
  Brain, BookOpen, Play, Award, Star, Target, Zap, 
  Trophy, Medal, Crown, Flame, TrendingUp, Users, 
  Shield, Mail, Key, AlertTriangle, CheckCircle, Clock,
  Gamepad2, Sparkles, ChevronRight, BarChart, PieChart, ChevronLeft, X
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
  const [, setLocation] = useLocation();
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("modules");
  const [userXP, setUserXP] = useState(375);
  const [userLevel, setUserLevel] = useState(2);
  const [streak, setStreak] = useState(3);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { toast } = useToast();

  const [learningModules] = useState<LearningModule[]>([
    {
      id: 1,
      title: "Email Security Fundamentals",
      description: "Master phishing detection and email security best practices",
      difficulty: "Beginner",
      duration: "15 min",
      completed: true,
      xpReward: 125,
      type: "interactive",
      topics: ["Phishing Detection", "Email Verification", "Suspicious Links"],
      engagementLevel: "High",
      adaptiveContent: true
    },
    {
      id: 2,
      title: "Social Engineering Defense",
      description: "Learn to recognize and counter social manipulation attacks",
      difficulty: "Intermediate",
      duration: "25 min",
      completed: false,
      xpReward: 200,
      type: "scenario",
      topics: ["Psychology", "Manipulation Tactics", "Human Firewall"],
      engagementLevel: "High",
      adaptiveContent: true
    },
    {
      id: 3,
      title: "Incident Response Protocol",
      description: "Essential steps for handling cybersecurity incidents effectively",
      difficulty: "Advanced",
      duration: "35 min",
      completed: false,
      xpReward: 300,
      type: "scenario",
      topics: ["Crisis Management", "Evidence Preservation", "Communication"],
      engagementLevel: "Medium",
      adaptiveContent: true
    },
    {
      id: 4,
      title: "Password Security Mastery",
      description: "Advanced password management and multi-factor authentication",
      difficulty: "Beginner",
      duration: "20 min",
      completed: false,
      xpReward: 150,
      type: "interactive",
      topics: ["Strong Passwords", "MFA", "Password Managers"],
      engagementLevel: "High",
      adaptiveContent: true
    },
    {
      id: 5,
      title: "Network Security Basics",
      description: "Understanding network threats and safe browsing practices",
      difficulty: "Intermediate",
      duration: "30 min",
      completed: false,
      xpReward: 250,
      type: "game",
      topics: ["WiFi Security", "VPN Usage", "Safe Browsing"],
      engagementLevel: "High",
      adaptiveContent: true
    },
    {
      id: 6,
      title: "Data Protection & Privacy",
      description: "GDPR compliance and personal data protection strategies",
      difficulty: "Advanced",
      duration: "40 min",
      completed: false,
      xpReward: 350,
      type: "challenge",
      topics: ["GDPR", "Data Classification", "Privacy Rights"],
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
      description: "Perfect starting point for cybersecurity beginners",
      modules: [1, 4],
      difficulty: "Beginner",
      estimatedTime: "35 min",
      completion: 50
    },
    {
      id: 2,
      name: "Human Security Specialist",
      description: "Master social engineering defense and incident response",
      modules: [2, 3],
      difficulty: "Intermediate to Advanced",
      estimatedTime: "60 min",
      completion: 0
    },
    {
      id: 3,
      name: "Technical Security Expert",
      description: "Advanced network security and data protection",
      modules: [5, 6],
      difficulty: "Intermediate to Advanced",
      estimatedTime: "70 min",
      completion: 0
    },
    {
      id: 4,
      name: "Complete Cybersecurity Professional",
      description: "Full comprehensive training covering all security domains",
      modules: [1, 2, 3, 4, 5, 6],
      difficulty: "All Levels",
      estimatedTime: "2.5 hours",
      completion: 17
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
    // Start interactive training directly in this component
    setCurrentModule(module);
    setCurrentStep(0);
    setSelectedAnswer("");
    setShowExplanation(false);
    setShowResults(false);
    setScore(0);
    setShowTrainingModal(true);
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

  // Training functions from training-scenarios.tsx
  const getExerciseTitle = (moduleTitle: string, step: number) => {
    const titles: Record<string, string[]> = {
      "Email Security Fundamentals": [
        "Identifying Suspicious Emails",
        "Verifying Email Sources", 
        "Handling Suspicious Links",
        "Managing Email Attachments",
        "Reporting Security Threats",
        "Email Security Best Practices"
      ],
      "Social Engineering Defense": [
        "Recognizing Social Engineering",
        "Phone-based Social Engineering",
        "Physical Social Engineering", 
        "Information Gathering Attacks",
        "Authority-based Manipulation",
        "Urgency-based Manipulation",
        "Trust and Verification"
      ],
      "Incident Response Protocol": [
        "Initial Incident Detection",
        "Incident Classification",
        "Response Team Notification",
        "Evidence Preservation",
        "Containment Strategies",
        "System Recovery",
        "Documentation Requirements",
        "Post-Incident Analysis",
        "External Notifications",
        "Legal Compliance"
      ],
      "Password Security Mastery": [
        "Strong Password Creation",
        "Multi-Factor Authentication",
        "Password Manager Usage",
        "Account Recovery",
        "Shared Account Security"
      ],
      "Network Security Basics": [
        "WiFi Security Assessment",
        "VPN Usage Guidelines",
        "Safe Browsing Practices",
        "Network Threat Recognition",
        "Public Network Safety",
        "Network Monitoring",
        "Firewall Configuration",
        "Network Access Control"
      ],
      "Data Protection & Privacy": [
        "Data Classification",
        "GDPR Compliance",
        "Privacy Impact Assessment",
        "Data Retention Policies",
        "Cross-border Data Transfers",
        "Subject Access Requests",
        "Data Breach Notifications",
        "Privacy by Design",
        "Consent Management",
        "Data Minimization",
        "Third-party Data Sharing",
        "Data Subject Rights"
      ]
    };
    return titles[moduleTitle]?.[step] || "Security Challenge";
  };

  const getExerciseQuestion = (moduleTitle: string, step: number) => {
    const questions: Record<string, string[]> = {
      "Email Security Fundamentals": [
        "You receive an urgent email from 'CEO@yourcompany.co' asking for sensitive financial data. The real company domain is 'yourcompany.com'. What's your first action?",
        "An email claims to be from your bank asking you to verify account details. How do you verify if it's legitimate?",
        "You get an email with a shortened URL (bit.ly link) claiming to be an important security update. What should you do?",
        "An email attachment named 'Invoice.pdf.exe' arrives from an unknown sender. How should you handle this?",
        "You notice an email has suspicious headers showing it originated from a different domain than claimed. What's your next step?",
        "After identifying a phishing email, what's the proper way to report it to your security team?"
      ],
      "Social Engineering Defense": [
        "Someone calls claiming to be from IT support, asking for your password to 'fix your account'. How do you respond?",
        "A person in a delivery uniform asks you to hold the door open to the secure office area. What should you do?",
        "During casual conversation, a stranger asks about your company's software systems. How do you handle this?",
        "You receive a call from someone claiming to be conducting a security audit, requesting employee information. What's your response?",
        "Someone wearing a company badge you don't recognize asks you to help them access a restricted area. What do you do?",
        "You get a call saying there's an urgent security issue and you must act immediately or lose access. How do you respond?",
        "A USB drive labeled 'Executive Bonus Information' is left in the parking lot. What should you do?"
      ]
    };
    return questions[moduleTitle]?.[step] || "What is the best security practice in this situation?";
  };

  const getModuleQuestionCount = (moduleTitle: string) => {
    const counts: Record<string, number> = {
      "Email Security Fundamentals": 6,
      "Social Engineering Defense": 7,
      "Incident Response Protocol": 10,
      "Password Security Mastery": 5,
      "Network Security Basics": 8,
      "Data Protection & Privacy": 12
    };
    return counts[moduleTitle] || 6;
  };

  const getExerciseOptions = (moduleTitle: string, step: number) => {
    const options: Record<string, Array<Array<{value: string, label: string}>>> = {
      "Email Security Fundamentals": [
        [
          { value: "reply", label: "Reply immediately with the requested information" },
          { value: "verify", label: "Contact the CEO through known channels to verify the request" },
          { value: "ignore", label: "Delete the email without taking action" },
          { value: "forward", label: "Forward to IT security for investigation" }
        ],
        [
          { value: "click", label: "Click the link in the email to verify" },
          { value: "call", label: "Call the bank using the number on your official bank card" },
          { value: "search", label: "Search online for the bank's contact information" },
          { value: "wait", label: "Wait for another email to confirm it's real" }
        ],
        [
          { value: "click", label: "Click the link immediately to update" },
          { value: "expand", label: "Hover over or expand the URL to see the real destination" },
          { value: "trust", label: "Trust it since it says it's a security update" },
          { value: "copy", label: "Copy the link and paste it in a new browser" }
        ],
        [
          { value: "open", label: "Open it since it looks like a PDF" },
          { value: "scan", label: "Scan it with antivirus first" },
          { value: "report", label: "Report it to IT security and do not open" },
          { value: "save", label: "Save it to your desktop for later review" }
        ],
        [
          { value: "ignore", label: "Ignore the headers and focus on the content" },
          { value: "report", label: "Report the suspicious headers to IT security" },
          { value: "reply", label: "Reply to ask about the domain mismatch" },
          { value: "delete", label: "Delete the email immediately" }
        ],
        [
          { value: "delete", label: "Delete it and don't report anything" },
          { value: "forward", label: "Forward to IT security with full headers" },
          { value: "warn", label: "Warning colleagues via company chat" },
          { value: "screenshot", label: "Take a screenshot and email it to security" }
        ]
      ],
      "Social Engineering Defense": [
        [
          { value: "provide", label: "Provide your password since they're from IT" },
          { value: "verify", label: "Ask for their employee ID and verify through proper channels" },
          { value: "refuse", label: "Refuse and hang up immediately" },
          { value: "supervisor", label: "Ask to speak with their supervisor first" }
        ],
        [
          { value: "hold", label: "Hold the door open since they look professional" },
          { value: "ask", label: "Ask to see their delivery receipt and contact the recipient" },
          { value: "ignore", label: "Ignore them and let them figure it out" },
          { value: "badge", label: "Let them in if they show any kind of badge" }
        ],
        [
          { value: "share", label: "Share general information since it's just casual conversation" },
          { value: "deflect", label: "Deflect with vague answers and change the subject" },
          { value: "detail", label: "Give detailed explanations to be helpful" },
          { value: "business", label: "Refer them to your business card for official inquiries" }
        ],
        [
          { value: "comply", label: "Comply immediately since it's a security audit" },
          { value: "verify", label: "Verify their identity and authority through official channels" },
          { value: "refuse", label: "Refuse and hang up without verification" },
          { value: "transfer", label: "Transfer them to HR without verification" }
        ],
        [
          { value: "help", label: "Help them immediately since they have a badge" },
          { value: "verify", label: "Verify their identity and authorization first" },
          { value: "ignore", label: "Ignore their request completely" },
          { value: "escort", label: "Escort them to security without questions" }
        ],
        [
          { value: "act", label: "Act immediately to avoid losing access" },
          { value: "verify", label: "Verify through official channels before taking action" },
          { value: "wait", label: "Wait and do nothing" },
          { value: "colleague", label: "Ask a colleague what to do" }
        ],
        [
          { value: "plug", label: "Plug it in to see what executive bonuses are planned" },
          { value: "turn", label: "Turn it in to security without connecting it" },
          { value: "take", label: "Take it home to check it safely" },
          { value: "ignore", label: "Ignore it and leave it there" }
        ]
      ]
    };
    return options[moduleTitle]?.[step] || [
      { value: "safe", label: "Choose the safest security practice" },
      { value: "verify", label: "Verify through official channels first" },
      { value: "report", label: "Report to security team immediately" },
      { value: "wait", label: "Wait and gather more information" }
    ];
  };

  const isCorrectAnswer = (title: string, step: number, answer: string): boolean => {
    if (title === "Email Security Fundamentals") {
      const correctAnswers = ["verify", "call", "expand", "report", "report", "forward"];
      return answer === correctAnswers[step];
    }
    if (title === "Social Engineering Defense") {
      const correctAnswers = ["verify", "ask", "deflect", "verify", "verify", "verify", "turn"];
      return answer === correctAnswers[step];
    }
    return answer === "verify" || answer === "report";
  };

  const getExplanation = (title: string, step: number, userAnswer: string): string => {
    if (title === "Email Security Fundamentals") {
      const explanations = [
        "Always verify urgent requests through known channels. Attackers use urgency to bypass your judgment. Example: Call the CEO's assistant or use the company directory to verify unusual requests.",
        "Never use links in suspicious emails. Contact your bank directly using official contact information. Example: Use the phone number on your debit card or bank statements, not the one in the email.",
        "Check where links actually lead before clicking. URL expanders reveal the real destination safely. Example: Hover over the link to see 'malicious-site.com' instead of the claimed security update site.",
        "Never open unexpected attachments. Report suspicious emails to IT security for proper analysis. Example: '.exe' files disguised as PDFs are common malware delivery methods.",
        "Email headers can reveal spoofed addresses. Suspicious headers should be reported immediately. Example: The 'From' field shows your domain but the actual sending server is external.",
        "Forward phishing emails with full headers to IT security so they can analyze threats and protect others. Example: Use 'Forward as Attachment' to preserve all technical details for investigation."
      ];
      return explanations[step] || "Always prioritize security verification over convenience.";
    }
    if (title === "Social Engineering Defense") {
      const explanations = [
        "IT will never ask for passwords over the phone. Always verify through official channels. Example: Hang up and call IT directly using the company directory number.",
        "Verify delivery requests through proper channels. Example: Contact the intended recipient to confirm they're expecting a delivery before allowing access.",
        "Deflect information gathering attempts politely but firmly. Example: 'I'm not the right person to ask about technical details. You should contact our public relations team.'",
        "Security audits follow formal procedures with proper authorization. Example: Real auditors will have official documentation and can be verified through your compliance department.",
        "Badges can be forged. Always verify identity and authorization. Example: Call the person they claim to be visiting or check with security before granting access.",
        "Urgent security threats are verified through official channels, not random phone calls. Example: Your IT department will send official communications through established channels.",
        "USB drives found in public areas are often baiting attacks. Example: Turn it in to security - these devices commonly contain malware designed to compromise your computer."
      ];
      return explanations[step] || "Always verify identity and authority before taking action.";
    }
    return "Security requires verification and following proper procedures.";
  };

  const handleAnswerSubmit = () => {
    if (!currentModule || !selectedAnswer) return;
    
    const correct = isCorrectAnswer(currentModule.title, currentStep, selectedAnswer);
    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!currentModule) return;
    
    const totalQuestions = getModuleQuestionCount(currentModule.title);
    const nextStep = currentStep + 1;
    
    if (nextStep >= totalQuestions) {
      setShowResults(true);
    } else {
      setCurrentStep(nextStep);
      setSelectedAnswer("");
      setShowExplanation(false);
    }
  };

  const completeTraining = () => {
    if (!currentModule) return;
    
    setUserXP(prev => prev + currentModule.xpReward);
    setShowResults(false);
    setShowTrainingModal(false);
    setShowCelebration(true);
    
    toast({
      title: "Module Complete! 🎉",
      description: `You earned ${currentModule.xpReward} XP!`,
    });
  };

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
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Learning
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
                      
                      <Button 
                        onClick={() => {
                          const nextModule = learningModules.find(m => 
                            path.modules.includes(m.id) && m.completed === false
                          );
                          if (nextModule) {
                            startModule(nextModule);
                          }
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Start Learning
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

        {/* Interactive Training Modal */}
        <Dialog open={showTrainingModal} onOpenChange={setShowTrainingModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {currentModule?.title}
              </DialogTitle>
            </DialogHeader>
            
            {currentModule && !showResults ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Progress value={(currentStep / getModuleQuestionCount(currentModule.title)) * 100} className="flex-1 mr-4" />
                  <span className="text-sm text-gray-500">{currentStep + 1} of {getModuleQuestionCount(currentModule.title)}</span>
                </div>
                
                {!showExplanation ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Step {currentStep + 1}: {getExerciseTitle(currentModule.title, currentStep)}
                    </h3>
                    
                    <p className="text-gray-700 leading-relaxed">
                      {getExerciseQuestion(currentModule.title, currentStep)}
                    </p>
                    
                    <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                      {getExerciseOptions(currentModule.title, currentStep).map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (currentStep > 0) {
                            setCurrentStep(currentStep - 1);
                            setSelectedAnswer("");
                            setShowExplanation(false);
                          }
                        }}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      
                      <Button 
                        onClick={handleAnswerSubmit}
                        disabled={!selectedAnswer}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Submit Answer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <div className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        <strong>Your answer:</strong> {getExerciseOptions(currentModule.title, currentStep).find(opt => opt.value === selectedAnswer)?.label}
                      </div>
                      
                      {!isCorrect && (
                        <div className="text-sm text-green-700 mt-2">
                          <strong>Correct answer:</strong> {getExerciseOptions(currentModule.title, currentStep).find(opt => 
                            isCorrectAnswer(currentModule.title, currentStep, opt.value))?.label}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700 text-sm leading-relaxed">
                        {getExplanation(currentModule.title, currentStep, selectedAnswer)}
                      </p>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleNextQuestion}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {currentStep + 1 >= getModuleQuestionCount(currentModule.title) ? 'Finish Module' : 'Next Question'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : showResults && currentModule ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Training Complete!</h3>
                  <p className="text-gray-600">
                    Great job completing {currentModule.title}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">+{currentModule.xpReward}</div>
                    <div className="text-sm text-purple-600">XP Earned</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{score}/{getModuleQuestionCount(currentModule.title)}</div>
                    <div className="text-sm text-green-600">Correct</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{Math.round((score / getModuleQuestionCount(currentModule.title)) * 100)}%</div>
                    <div className="text-sm text-blue-600">Score</div>
                  </div>
                </div>
                
                <Button 
                  onClick={completeTraining}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Collect Rewards
                </Button>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Celebration Modal */}
        <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
          <DialogContent className="max-w-md">
            <div className="text-center space-y-6 py-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Crown className="h-16 w-16 text-yellow-500 animate-bounce" />
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
                <p className="text-gray-600">
                  You've successfully completed {currentModule?.title}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-purple-600">
                  <Star className="h-5 w-5" />
                  +{currentModule?.xpReward} XP Earned
                </div>
                
                <div className="text-sm text-gray-500">
                  Keep learning to unlock more achievements!
                </div>
              </div>
              
              <Button 
                onClick={() => setShowCelebration(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Continue Learning
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}