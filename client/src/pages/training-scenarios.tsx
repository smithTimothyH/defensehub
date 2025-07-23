import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, BookOpen, Target, CheckCircle, Clock, AlertTriangle, Play, FileText, Users, Shield, Mail, Key, Download, Award, Star, TrendingUp, ChevronRight, ChevronLeft, Brain, Trophy, Crown, Flame, Zap, Medal, Sparkles } from "lucide-react";

export default function TrainingScenarios() {
  // Training scenarios with consistent "Start Training" buttons - force refresh
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
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState([
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
  ]);

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

  const handleBeginTraining = () => {
    setShowTrainingDialog(false);
    setShowExerciseModal(true);
    setCurrentExercise(selectedScenario);
    setExerciseStep(0);
    setSelectedAnswer("");
    setExerciseScore(0);
    setShowResults(false);
  };

  const completeTraining = (scenarioId: number) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario && !scenario.completed) {
      setScenarios(prevScenarios => 
        prevScenarios.map(s => 
          s.id === scenarioId 
            ? { ...s, completed: true }
            : s
        )
      );
      
      // Show XP reward notification
      toast({
        title: "Training Complete! 🎉",
        description: "+125 XP earned! Keep learning to unlock more achievements.",
      });
    }
  };

  const getExerciseTitle = (moduleTitle: string, step: number) => {
    const titles: Record<string, string[]> = {
      "Email Security Fundamentals": [
        "Phishing Email Recognition",
        "Sender Verification",
        "Safe Link Practices",
        "Attachment Security",
        "Email Headers Analysis",
        "Reporting Procedures"
      ],
      "Social Engineering Awareness": [
        "Phone Call Verification",
        "Physical Access Control",
        "Information Disclosure",
        "Pretexting Scenarios",
        "Authority Manipulation",
        "Urgency Tactics",
        "Baiting Attacks",
        "Tailgating Prevention"
      ],
      "Incident Response Procedures": [
        "Initial Detection",
        "Incident Classification",
        "Communication Protocols",
        "Evidence Preservation",
        "Containment Strategies",
        "Recovery Planning",
        "Documentation Requirements",
        "Lessons Learned",
        "Stakeholder Notifications",
        "Legal Considerations"
      ],
      "Password Security Best Practices": [
        "Password Strength",
        "Multi-Factor Authentication",
        "Password Manager Usage",
        "Account Recovery",
        "Shared Account Security"
      ]
    };
    return titles[moduleTitle]?.[step] || `Step ${step + 1}: Security Challenge`;
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
      "Social Engineering Awareness": [
        "Someone calls claiming to be from IT support, asking for your password to 'fix your account'. How do you respond?",
        "A person in a delivery uniform asks you to hold the door open to the secure office area. What should you do?",
        "During casual conversation, a stranger asks about your company's software systems. How do you handle this?",
        "You receive a call from someone claiming to be conducting a security audit, requesting employee information. What's your response?",
        "Someone wearing a company badge you don't recognize asks you to help them access a restricted area. What do you do?",
        "You get a call saying there's an urgent security issue and you must act immediately or lose access. How do you respond?",
        "A USB drive labeled 'Executive Bonus Information' is left in the parking lot. What should you do?",
        "Someone follows closely behind you into a secure building without badging in. What's your appropriate action?"
      ],
      "Incident Response Procedures": [
        "You discover malware on your computer. What's the immediate first step you should take?",
        "How do you determine if a security event qualifies as a major incident requiring escalation?",
        "Who should be notified first when you discover a potential data breach?",
        "What information should you preserve when you suspect a security incident?",
        "How do you safely contain a suspected malware infection without destroying evidence?",
        "What's the priority order for restoring systems after a security incident?",
        "What details must be documented during an incident response?",
        "How do you conduct a proper post-incident review?",
        "When should external parties (customers, partners) be notified of an incident?",
        "What legal requirements must be considered during incident response?"
      ],
      "Password Security Best Practices": [
        "What makes a password strong and secure against common attacks?",
        "When should you enable multi-factor authentication on your accounts?",
        "How should you safely store and manage multiple complex passwords?",
        "What steps should you take if you forget your password and need to recover access?",
        "How do you properly secure shared accounts used by multiple team members?"
      ]
    };
    return questions[moduleTitle]?.[step] || "What is the best security practice in this situation?";
  };

  // Function to check if answer is correct
  const isCorrectAnswer = (title: string, step: number, answer: string): boolean => {
    if (title === "Email Security Fundamentals") {
      const correctAnswers = ["verify", "call", "expand", "report", "report", "forward"];
      return answer === correctAnswers[step];
    }
    if (title === "Social Engineering Awareness") {
      const correctAnswers = ["verify", "ask", "deflect", "verify", "verify", "verify", "turn"];
      return answer === correctAnswers[step];
    }
    // Default fallback
    return false;
  };

  // Function to get explanation for each question
  const getExplanation = (title: string, step: number): string => {
    if (title === "Email Security Fundamentals") {
      const explanations = [
        "Always verify urgent requests through known channels. Attackers use urgency to bypass your judgment.",
        "Never use links in suspicious emails. Contact your bank directly using official contact information.",
        "Check where links actually lead before clicking. URL expanders reveal the real destination safely.",
        "Never open unexpected attachments. Report suspicious emails to IT security for proper analysis.",
        "Email headers can reveal spoofed addresses. Suspicious headers should be reported immediately.",
        "Forward phishing emails with full headers to IT security so they can analyze threats and protect others."
      ];
      return explanations[step] || "Always think before you click and verify suspicious requests.";
    }
    if (title === "Social Engineering Awareness") {
      const explanations = [
        "Legitimate IT support will never ask for passwords. Always verify identity through official channels.",
        "Tailgating is a common attack. Always verify identity before allowing access to secure areas.",
        "Social engineers gather information through casual conversation. Keep business information confidential.",
        "Verify all audit requests through official channels. Attackers often pose as auditors or consultants.",
        "Never grant access based on badges alone. Verify identity and authorization for sensitive areas.",
        "Create urgency is a manipulation tactic. Take time to verify all urgent requests properly.",
        "Unknown USB drives can contain malware. Always turn them in to security without connecting them."
      ];
      return explanations[step] || "Always verify identity and authority before sharing information or granting access.";
    }
    return "Always be cautious with unexpected requests and verify through official channels.";
  };

  // Function to get examples for each question
  const getExample = (title: string, step: number): string => {
    if (title === "Email Security Fundamentals") {
      const examples = [
        "Example: Instead of responding immediately, call the CEO's office directly to confirm they sent the request.",
        "Example: Call the number printed on your physical bank card, not any number provided in the email.",
        "Example: Use unshorten.it or similar services to reveal that 'bit.ly/update' actually leads to 'malicious-site.com'.",
        "Example: Email attachments claiming to be 'invoice.pdf' might actually be 'invoice.pdf.exe' - a malicious program.",
        "Example: Check if the sender's domain 'amaozn.com' matches the real 'amazon.com' - notice the missing 'z'.",
        "Example: Forward to security@company.com with subject 'PHISHING ALERT' so they can investigate and warn others."
      ];
      return examples[step] || "When in doubt, contact your IT security team for guidance.";
    }
    if (title === "Social Engineering Awareness") {
      const examples = [
        "Example: Say 'I'll need to verify your identity through our IT help desk first' and call IT directly.",
        "Example: Ask 'Can I see your employee badge?' and verify the photo and access level match their request.",
        "Example: When asked about company projects, say 'I can't discuss work details' and change the topic.",
        "Example: Ask for their supervisor's contact information and verify the audit request through official channels.",
        "Example: Say 'Let me escort you to security to verify your access level' rather than granting immediate access.",
        "Example: Tell them 'I'll need to verify this through our IT department' and call IT using the official number.",
        "Example: Report to security: 'Found USB drive in parking lot' without connecting it to any computer."
      ];
      return examples[step] || "Always verify through trusted channels before taking action.";
    }
    return "When in doubt, contact your security team for guidance.";
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
          { value: "click", label: "Click the shortened URL to see where it leads" },
          { value: "expand", label: "Use a URL expander tool to check the destination first" },
          { value: "ignore", label: "Delete the email immediately" },
          { value: "ask", label: "Ask IT if they sent this update" }
        ],
        [
          { value: "open", label: "Open the attachment to see what it contains" },
          { value: "scan", label: "Scan with antivirus before opening" },
          { value: "delete", label: "Delete the email and attachment immediately" },
          { value: "report", label: "Report to IT security without opening" }
        ],
        [
          { value: "ignore", label: "Ignore the headers and focus on the content" },
          { value: "report", label: "Report as suspicious to the security team" },
          { value: "reply", label: "Reply asking for clarification" },
          { value: "research", label: "Research the sending domain online" }
        ],
        [
          { value: "delete", label: "Just delete it and move on" },
          { value: "forward", label: "Forward to IT security with full headers" },
          { value: "warn", label: "Warning colleagues via company chat" },
          { value: "screenshot", label: "Take a screenshot and email it to security" }
        ]
      ],
      "Social Engineering Awareness": [
        [
          { value: "provide", label: "Provide your password since they're from IT" },
          { value: "verify", label: "Ask for their employee ID and verify through proper channels" },
          { value: "refuse", label: "Refuse and hang up immediately" },
          { value: "supervisor", label: "Ask to speak with their supervisor first" }
        ],
        [
          { value: "help", label: "Hold the door open to be helpful" },
          { value: "ask", label: "Ask to see their ID badge and verify their identity" },
          { value: "refuse", label: "Politely refuse and direct them to the main entrance" },
          { value: "escort", label: "Escort them to the reception desk" }
        ],
        [
          { value: "share", label: "Share general information since it seems harmless" },
          { value: "deflect", label: "Politely deflect and change the subject" },
          { value: "report", label: "Report the conversation to security" },
          { value: "lie", label: "Provide false information to mislead them" }
        ],
        [
          { value: "comply", label: "Provide the requested information to help the audit" },
          { value: "verify", label: "Verify their identity through official channels first" },
          { value: "refuse", label: "Refuse to provide any information" },
          { value: "redirect", label: "Redirect them to your supervisor" }
        ],
        [
          { value: "help", label: "Help them access the area since they have a badge" },
          { value: "verify", label: "Verify their identity and need for access first" },
          { value: "refuse", label: "Politely refuse and suggest they get proper authorization" },
          { value: "escort", label: "Escort them to security to verify their access" }
        ],
        [
          { value: "act", label: "Act immediately to prevent losing access" },
          { value: "verify", label: "Verify the urgency through official channels" },
          { value: "ignore", label: "Ignore the call completely" },
          { value: "callback", label: "Ask for a callback number and verify independently" }
        ],
        [
          { value: "use", label: "Use the USB drive to see what's on it" },
          { value: "turn", label: "Turn it in to security without using it" },
          { value: "ignore", label: "Leave it where you found it" },
          { value: "destroy", label: "Physically destroy the USB drive" }
        ],
        [
          { value: "ignore", label: "Ignore it since they're already inside" },
          { value: "challenge", label: "Politely challenge them to show their badge" },
          { value: "report", label: "Report the incident to security" },
          { value: "follow", label: "Follow them to see where they go" }
        ]
      ],
      "Incident Response Procedures": [
        [
          { value: "scan", label: "Run a full antivirus scan immediately" },
          { value: "disconnect", label: "Disconnect from the network and report to IT" },
          { value: "shutdown", label: "Shut down the computer completely" },
          { value: "continue", label: "Continue working while monitoring the situation" }
        ],
        [
          { value: "impact", label: "Based on potential business impact and data sensitivity" },
          { value: "time", label: "Based on how long the incident has been occurring" },
          { value: "systems", label: "Based on the number of systems affected" },
          { value: "users", label: "Based on the number of users complaining" }
        ],
        [
          { value: "manager", label: "Your direct manager first" },
          { value: "security", label: "The incident response team or security operations" },
          { value: "it", label: "The general IT help desk" },
          { value: "legal", label: "The legal department immediately" }
        ],
        [
          { value: "logs", label: "System logs and network traffic data" },
          { value: "screenshots", label: "Screenshots of error messages only" },
          { value: "emails", label: "Related email communications" },
          { value: "all", label: "All of the above and more" }
        ],
        [
          { value: "power", label: "Immediately power off all affected systems" },
          { value: "isolate", label: "Isolate affected systems from the network" },
          { value: "patch", label: "Apply security patches immediately" },
          { value: "backup", label: "Restore from the most recent backup" }
        ],
        [
          { value: "critical", label: "Critical business systems first" },
          { value: "clean", label: "Clean systems first, then infected ones" },
          { value: "user", label: "User workstations before servers" },
          { value: "network", label: "Network infrastructure first" }
        ],
        [
          { value: "basic", label: "Basic timeline and systems affected" },
          { value: "detailed", label: "Detailed timeline, actions taken, and evidence collected" },
          { value: "summary", label: "Brief summary for management" },
          { value: "technical", label: "Technical details only" }
        ],
        [
          { value: "immediately", label: "Immediately after containment" },
          { value: "weekly", label: "One week after resolution" },
          { value: "monthly", label: "One month after resolution" },
          { value: "never", label: "Reviews are not necessary" }
        ],
        [
          { value: "immediately", label: "Immediately upon discovery" },
          { value: "contained", label: "After the incident is contained" },
          { value: "resolved", label: "After the incident is fully resolved" },
          { value: "never", label: "Only if specifically required by contract" }
        ],
        [
          { value: "none", label: "No legal requirements for most incidents" },
          { value: "notification", label: "Data breach notification laws and regulations" },
          { value: "preservation", label: "Evidence preservation for potential litigation" },
          { value: "both", label: "Both notification requirements and evidence preservation" }
        ]
      ],
      "Password Security Best Practices": [
        [
          { value: "length", label: "Long passwords with a mix of characters, numbers, and symbols" },
          { value: "personal", label: "Personal information like birthdays and names" },
          { value: "common", label: "Common words from the dictionary" },
          { value: "simple", label: "Simple patterns like '123456' or 'password'" }
        ],
        [
          { value: "always", label: "On all accounts, especially those with sensitive data" },
          { value: "work", label: "Only on work-related accounts" },
          { value: "optional", label: "Only when the service requires it" },
          { value: "never", label: "It's too inconvenient to use regularly" }
        ],
        [
          { value: "memory", label: "Memorize all passwords and don't write them down" },
          { value: "manager", label: "Use a reputable password manager application" },
          { value: "document", label: "Keep them in a document on your computer" },
          { value: "reuse", label: "Use the same strong password for all accounts" }
        ],
        [
          { value: "guess", label: "Try to guess the password using personal information" },
          { value: "official", label: "Use the official account recovery process" },
          { value: "support", label: "Call tech support and ask them to reset it" },
          { value: "new", label: "Create a new account instead" }
        ],
        [
          { value: "single", label: "Use a single strong password that everyone knows" },
          { value: "individual", label: "Create individual accounts for each user" },
          { value: "rotate", label: "Regularly rotate the shared password" },
          { value: "post", label: "Post the password in a secure location" }
        ]
      ]
    };
    return options[moduleTitle]?.[step] || [
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B" },
      { value: "c", label: "Option C" },
      { value: "d", label: "Option D" }
    ];
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
                  className="bg-cyber-primary hover:bg-blue-700 text-white"
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
              <Button 
                className="bg-cyber-primary hover:bg-blue-700"
                onClick={handleBeginTraining}
              >
                <Play className="h-4 w-4 mr-2" />
                Begin Training
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Modal */}
      <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-cyber-primary" />
              <span>Interactive Training Exercise</span>
            </DialogTitle>
            <DialogDescription>
              Complete the training exercises to master {currentExercise?.title.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{exerciseStep + 1} of {currentExercise?.steps || 5}</span>
              </div>
              <Progress value={((exerciseStep + 1) / (currentExercise?.steps || 5)) * 100} className="h-2" />
            </div>

            {/* Exercise Content */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {currentExercise && (
                    <>
                      <h3 className="text-lg font-semibold">
                        {getExerciseTitle(currentExercise.title, exerciseStep)}
                      </h3>
                      <p className="text-gray-600">
                        {getExerciseQuestion(currentExercise.title, exerciseStep)}
                      </p>
                      
                      <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                        {getExerciseOptions(currentExercise.title, exerciseStep).map((option: {value: string, label: string}, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className="flex-1 cursor-pointer">{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {/* Immediate Feedback */}
                      {selectedAnswer && (
                        <div className={`mt-4 p-4 rounded-xl border-2 shadow-lg ${
                          isCorrectAnswer(currentExercise.title, exerciseStep, selectedAnswer)
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-red-50 border-red-300'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {isCorrectAnswer(currentExercise.title, exerciseStep, selectedAnswer) ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Target className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`font-medium ${
                              isCorrectAnswer(currentExercise.title, exerciseStep, selectedAnswer)
                                ? 'text-green-800' 
                                : 'text-red-800'
                            }`}>
                              {isCorrectAnswer(currentExercise.title, exerciseStep, selectedAnswer) ? 'Correct!' : 'Not quite right'}
                            </span>
                          </div>
                          <p className={`text-sm mb-3 ${
                            isCorrectAnswer(currentExercise.title, exerciseStep, selectedAnswer)
                              ? 'text-green-700' 
                              : 'text-red-700'
                          }`}>
                            {getExplanation(currentExercise.title, exerciseStep)}
                          </p>
                          <div className={`text-xs p-3 rounded-lg ${
                            isCorrectAnswer(currentExercise.title, exerciseStep, selectedAnswer)
                              ? 'bg-green-100 border border-green-200' 
                              : 'bg-red-100 border border-red-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="h-3 w-3" />
                              <span className="font-medium">Example:</span>
                            </div>
                            <p className={`${
                              isCorrectAnswer(currentExercise.title, exerciseStep, selectedAnswer)
                                ? 'text-green-800' 
                                : 'text-red-800'
                            }`}>
                              {getExample(currentExercise.title, exerciseStep)}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setExerciseStep(Math.max(0, exerciseStep - 1))}
                disabled={exerciseStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowExerciseModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    if (exerciseStep < (currentExercise?.steps || 5) - 1) {
                      setExerciseStep(exerciseStep + 1);
                      setSelectedAnswer("");
                    } else {
                      setShowResults(true);
                      setExerciseScore(85); // Simulated score
                    }
                  }}
                  disabled={!selectedAnswer}
                  className="bg-cyber-primary hover:bg-blue-700"
                >
                  {exerciseStep < (currentExercise?.steps || 5) - 1 ? (
                    <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
                  ) : (
                    <>Complete <CheckCircle className="h-4 w-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>

            {/* Compact Gamified Results */}
            {showResults && (
              <Card className="overflow-hidden">
                <CardContent className="p-4 text-center relative">
                  {/* Confetti Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 opacity-30"></div>
                  
                  <div className="relative z-10">
                    {/* Animated Trophy */}
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-3 animate-bounce shadow-lg">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    
                    {/* Achievement Celebration */}
                    <div className="flex justify-center items-center gap-2 mb-3">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        MISSION ACCOMPLISHED!
                      </h2>
                    </div>
                    
                    {/* Score-based message */}
                    <div className="mb-4">
                      {exerciseScore >= 90 && (
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-2">
                          <div className="flex items-center justify-center gap-2 text-green-800 text-sm">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-bold">EXCELLENT! You're a cybersecurity champion!</span>
                          </div>
                        </div>
                      )}
                      {exerciseScore >= 70 && exerciseScore < 90 && (
                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300 rounded-lg p-2">
                          <div className="flex items-center justify-center gap-2 text-blue-800 text-sm">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="font-bold">GREAT JOB! You've got solid security skills!</span>
                          </div>
                        </div>
                      )}
                      {exerciseScore < 70 && (
                        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300 rounded-lg p-2">
                          <div className="flex items-center justify-center gap-2 text-orange-800 text-sm">
                            <Brain className="h-4 w-4 text-orange-600" />
                            <span className="font-bold">GOOD START! Keep practicing!</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compact Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 border border-purple-300">
                        <div className="text-2xl font-bold text-purple-700">{exerciseScore}%</div>
                        <div className="text-xs text-purple-600 font-medium">Score</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg p-3 border border-green-300">
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <div className="text-2xl font-bold text-green-700">125</div>
                        </div>
                        <div className="text-xs text-green-600 font-medium">XP</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-200 rounded-lg p-3 border border-blue-300">
                        <div className="text-2xl font-bold text-blue-700">100%</div>
                        <div className="text-xs text-blue-600 font-medium">Complete</div>
                      </div>
                    </div>

                    {/* Achievement Badges */}
                    <div className="mb-4">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <div className="bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-lg p-2 border border-yellow-400">
                          <Medal className="h-4 w-4 text-yellow-700 mx-auto mb-1" />
                          <div className="text-xs font-medium text-yellow-800">Training Master</div>
                        </div>
                        {exerciseScore >= 80 && (
                          <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg p-2 border border-purple-400">
                            <Star className="h-4 w-4 text-purple-700 mx-auto mb-1" />
                            <div className="text-xs font-medium text-purple-800">High Achiever</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        if (currentExercise) {
                          completeTraining(currentExercise.id);
                        }
                        setShowExerciseModal(false);
                        setShowResults(false);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2"
                    >
                      Continue Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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