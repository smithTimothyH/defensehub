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
  const [userLevel, setUserLevel] = useState(12);
  const [experiencePoints, setExperiencePoints] = useState(2850);
  const [learningStreak, setLearningStreak] = useState(7);

  // Gamification data
  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first training module", icon: Star, unlocked: true, rarity: "common" },
    { id: 2, title: "Phishing Expert", description: "Identify 10 phishing emails correctly", icon: Shield, unlocked: true, rarity: "rare" },
    { id: 3, title: "Security Guardian", description: "Complete 5 security scenarios", icon: Crown, unlocked: false, rarity: "epic" },
    { id: 4, title: "Streak Master", description: "Maintain a 7-day learning streak", icon: Flame, unlocked: true, rarity: "rare" },
    { id: 5, title: "Knowledge Seeker", description: "Read all training materials", icon: BookOpen, unlocked: false, rarity: "common" },
    { id: 6, title: "Champion", description: "Reach level 15", icon: Trophy, unlocked: false, rarity: "legendary" }
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
      steps: 6,
      content: {
        overview: "Master the basics of email security with hands-on training in identifying phishing attempts, verifying sender authenticity, and implementing safe email practices.",
        objectives: [
          "Identify common phishing indicators and red flags",
          "Verify email sender authenticity using multiple methods",
          "Implement safe email handling procedures",
          "Report suspicious emails using proper channels",
          "Understand the psychology behind phishing attacks"
        ],
        modules: [
          {
            title: "Introduction to Email Threats",
            content: "Email remains the primary attack vector for cybercriminals. In this module, you'll learn about the various types of email-based attacks and why they're so effective.",
            keyPoints: [
              "95% of successful cyber attacks start with a phishing email",
              "Email attacks have increased 400% since remote work began",
              "Social engineering exploits human psychology, not just technology"
            ]
          },
          {
            title: "Identifying Phishing Indicators",
            content: "Learn to spot the telltale signs of phishing emails through practical examples and interactive exercises.",
            keyPoints: [
              "Suspicious sender addresses and domain spoofing",
              "Urgent language and artificial time pressure",
              "Unexpected attachments or links",
              "Grammar and spelling inconsistencies",
              "Requests for sensitive information"
            ]
          },
          {
            title: "Email Verification Techniques",
            content: "Master multiple methods to verify the authenticity of suspicious emails before taking any action.",
            keyPoints: [
              "Check sender's email address carefully",
              "Hover over links to preview destinations",
              "Verify through alternate communication channels",
              "Use corporate directory to confirm identities",
              "When in doubt, contact IT security team"
            ]
          }
        ],
        practicalExercises: [
          {
            title: "Phishing Email Analysis",
            description: "Analyze 10 real-world phishing examples and identify red flags",
            timeEstimate: "5 minutes"
          },
          {
            title: "Safe Link Verification",
            description: "Practice safe methods to verify suspicious links without clicking them",
            timeEstimate: "3 minutes"
          },
          {
            title: "Reporting Simulation",
            description: "Complete the email reporting process using your organization's procedures",
            timeEstimate: "2 minutes"
          }
        ]
      }
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
      steps: 8,
      content: {
        overview: "Understand the psychological tactics used by attackers to manipulate human behavior and learn defensive strategies to protect yourself and your organization.",
        objectives: [
          "Recognize common social engineering tactics and techniques",
          "Understand psychological principles exploited by attackers",
          "Develop verification procedures for unusual requests",
          "Build resistance to manipulation attempts",
          "Create organizational awareness and defense strategies"
        ],
        modules: [
          {
            title: "Psychology of Social Engineering",
            content: "Social engineering attacks exploit fundamental human tendencies like trust, authority, urgency, and helpfulness. Understanding these psychological principles is key to defense.",
            keyPoints: [
              "Authority: People tend to comply with perceived authority figures",
              "Urgency: Time pressure reduces critical thinking",
              "Trust: Attackers build rapport before making requests",
              "Reciprocity: People feel obligated to return favors",
              "Social proof: People follow others' actions in uncertain situations"
            ]
          },
          {
            title: "Common Attack Vectors",
            content: "Learn about the various channels and methods social engineers use to target victims.",
            keyPoints: [
              "Phone calls (vishing) - impersonating IT, executives, or vendors",
              "Email campaigns with personalized information",
              "Physical infiltration and tailgating",
              "Social media reconnaissance and pretexting",
              "USB drops and baiting attacks"
            ]
          }
        ],
        practicalExercises: [
          {
            title: "Phone Call Simulation",
            description: "Role-play scenarios where attackers try to extract information over the phone",
            timeEstimate: "8 minutes",
            type: "interactive",
            questions: [
              {
                scenario: "You receive a call from someone claiming to be from IT support asking for your login credentials to 'fix a security issue'.",
                question: "What is the FIRST thing you should do?",
                options: [
                  "Provide your username and password immediately",
                  "Ask for their employee ID and callback number",
                  "Hang up and contact IT through official channels",
                  "Ask them to prove they work for IT"
                ],
                correct: 2,
                explanation: "Always hang up and verify through official channels. Legitimate IT never asks for passwords over the phone."
              },
              {
                scenario: "The caller becomes aggressive and says 'Your account will be suspended in 5 minutes if you don't verify your credentials now!'",
                question: "This is an example of which social engineering tactic?",
                options: [
                  "Authority manipulation",
                  "Urgency and pressure",
                  "Trust exploitation",
                  "Technical intimidation"
                ],
                correct: 1,
                explanation: "Creating artificial urgency and time pressure is a classic social engineering tactic to bypass rational thinking."
              }
            ]
          },
          {
            title: "Pretext Recognition",
            description: "Identify social engineering attempts in realistic business scenarios",
            timeEstimate: "7 minutes",
            type: "interactive",
            questions: [
              {
                scenario: "You receive an email claiming to be from your CEO requesting urgent wire transfer information for a 'confidential acquisition'.",
                question: "What makes this email suspicious?",
                options: [
                  "Only the financial request",
                  "The confidentiality aspect",
                  "Combination of authority, urgency, secrecy, and financial request",
                  "Nothing - CEOs can request this information"
                ],
                correct: 2,
                explanation: "This email combines multiple social engineering tactics: authority (CEO), urgency (urgent), secrecy (confidential), and financial pressure."
              },
              {
                scenario: "The email has perfect grammar and comes from what appears to be the CEO's email address.",
                question: "Should you proceed with the request?",
                options: [
                  "Yes, since it looks legitimate",
                  "No, verify through a separate communication channel",
                  "Only if the amount is small",
                  "Yes, but ask for more details first"
                ],
                correct: 1,
                explanation: "Email addresses can be spoofed. Always verify high-stakes requests through known contact methods like calling the person directly."
              }
            ]
          }
        ]
      }
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
      steps: 10,
      content: {
        overview: "Master the critical skills needed to properly identify, respond to, and report security incidents. Learn the importance of quick, accurate response in minimizing damage and preserving evidence.",
        objectives: [
          "Identify different types of security incidents",
          "Execute proper incident response procedures",
          "Communicate effectively during security incidents",
          "Document incidents thoroughly for investigation",
          "Coordinate with relevant teams and stakeholders"
        ],
        modules: [
          {
            title: "Incident Identification and Classification",
            content: "Learn to recognize different types of security incidents and understand their potential impact on business operations.",
            keyPoints: [
              "Malware infections and system compromises",
              "Data breaches and unauthorized access",
              "Denial of service and system outages",
              "Insider threats and data exfiltration",
              "Physical security breaches"
            ]
          }
        ],
        practicalExercises: [
          {
            title: "Malware Incident Simulation",
            description: "Navigate a realistic malware infection scenario from detection to resolution",
            timeEstimate: "10 minutes"
          },
          {
            title: "Data Breach Response",
            description: "Respond to a simulated data breach with proper escalation and documentation",
            timeEstimate: "8 minutes"
          }
        ]
      }
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
      steps: 7,
      content: {
        overview: "Build strong account security through effective password management and multi-factor authentication. Learn to create unbreakable passwords and implement additional security layers.",
        objectives: [
          "Create strong, unique passwords for all accounts",
          "Understand and implement multi-factor authentication",
          "Use password managers effectively",
          "Recognize and avoid password-related threats"
        ],
        modules: [
          {
            title: "Password Fundamentals",
            content: "Understand what makes a password strong and why password security is critical in modern cybersecurity.",
            keyPoints: [
              "Length is more important than complexity",
              "Unique passwords for every account",
              "Avoid personal information in passwords",
              "Password complexity vs. passphrase strategies"
            ]
          }
        ],
        practicalExercises: [
          {
            title: "Password Strength Assessment",
            description: "Evaluate password strength and learn improvement techniques",
            timeEstimate: "5 minutes"
          },
          {
            title: "MFA Setup Practice",
            description: "Walk through setting up MFA on common platforms and applications",
            timeEstimate: "8 minutes"
          }
        ]
      }
    }
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

  const handleStartTraining = (scenario: any) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setShowTrainingDialog(true);
  };

  const handleNextStep = () => {
    if (selectedScenario && currentStep < selectedScenario.steps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepContent = (scenario: any, step: number) => {
    if (!scenario?.content) return null;

    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Training Overview</h3>
            <p className="text-gray-600">{scenario.content.overview}</p>
            <div>
              <h4 className="font-medium mb-2">Learning Objectives:</h4>
              <ul className="list-disc list-inside space-y-1">
                {scenario.content.objectives?.map((obj: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">{obj}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 1:
      case 2:
      case 3:
        const moduleIndex = step - 1;
        const module = scenario.content.modules?.[moduleIndex];
        if (!module) return null;
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{module.title}</h3>
            <p className="text-gray-600">{module.content}</p>
            <div>
              <h4 className="font-medium mb-2">Key Points:</h4>
              <ul className="list-disc list-inside space-y-1">
                {module.keyPoints?.map((point: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">{point}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        const exerciseIndex = step - 4;
        const exercise = scenario.content.practicalExercises?.[exerciseIndex];
        if (!exercise) return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-cyber-success mx-auto" />
            <h3 className="text-lg font-semibold">Training Complete!</h3>
            <p className="text-gray-600">You've successfully completed the {scenario.title} training module.</p>
            <Badge className="bg-cyber-success bg-opacity-20 text-cyber-success">
              Certificate Earned
            </Badge>
          </div>
        );
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Practical Exercise</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">{exercise.title}</h4>
              <p className="text-blue-800 mt-1">{exercise.description}</p>
              <p className="text-sm text-blue-600 mt-2">Estimated time: {exercise.timeEstimate}</p>
            </div>
            <Button 
              className="w-full bg-cyber-primary hover:bg-blue-700"
              onClick={() => {
                setCurrentExercise(exercise);
                setExerciseStep(0);
                setExerciseScore(0);
                setSelectedAnswer("");
                setShowResults(false);
                setShowExerciseModal(true);
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Exercise
            </Button>
          </div>
        );
    }
  };

  const renderTrainingContent = () => {
    if (!selectedScenario) return null;
    
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <p className="text-gray-600">{selectedScenario.content.overview}</p>
            <div>
              <h4 className="font-medium mb-2">Learning Objectives:</h4>
              <ul className="list-disc list-inside space-y-1">
                {selectedScenario.content.objectives.map((objective: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">{objective}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" disabled>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentStep(1)}
                className="bg-cyber-primary hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
      case 1:
      case 2:
      case 3:
        const moduleIndex = currentStep - 1;
        const module = selectedScenario.content.modules?.[moduleIndex];
        if (!module) return null;
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{module.title}</h3>
            <p className="text-gray-600">{module.content}</p>
            <div>
              <h4 className="font-medium mb-2">Key Points:</h4>
              <ul className="list-disc list-inside space-y-1">
                {module.keyPoints?.map((point: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">{point}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-cyber-primary hover:bg-blue-700"
              >
                {currentStep === 3 ? "Start Exercises" : "Next"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
      default:
        const exerciseIndex = currentStep - 4;
        const exercise = selectedScenario.content.practicalExercises?.[exerciseIndex];
        if (!exercise) return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-cyber-success mx-auto" />
            <h3 className="text-lg font-semibold">Training Complete!</h3>
            <p className="text-gray-600">You've successfully completed the {selectedScenario.title} training module.</p>
            <Badge className="bg-cyber-success bg-opacity-20 text-cyber-success">
              Certificate Earned
            </Badge>
          </div>
        );
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Practical Exercise</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">{exercise.title}</h4>
              <p className="text-blue-800 mt-1">{exercise.description}</p>
              <p className="text-sm text-blue-600 mt-2">Estimated time: {exercise.timeEstimate}</p>
            </div>
            <Button 
              className="w-full bg-cyber-primary hover:bg-blue-700"
              onClick={() => {
                setCurrentExercise(exercise);
                setExerciseStep(0);
                setExerciseScore(0);
                setSelectedAnswer("");
                setShowResults(false);
                setShowExerciseModal(true);
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Exercise
            </Button>
          </div>
        );
    }
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
                <span className="font-medium text-green-900">89% Success Rate</span>
              </div>
              <div className="text-sm text-green-700">Keep up the excellent work!</div>
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

      {/* Training Dialog */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedScenario && getTypeIcon(selectedScenario.type)}
              <span>{selectedScenario?.title}</span>
              <Badge className={selectedScenario && getDifficultyColor(selectedScenario.difficulty)}>
                {selectedScenario?.difficulty}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedScenario && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / selectedScenario.steps) * 100)}%</span>
                </div>
                <Progress value={((currentStep + 1) / selectedScenario.steps) * 100} />
                <p className="text-xs text-gray-500">
                  Step {currentStep + 1} of {selectedScenario.steps}
                </p>
              </div>

              {/* Training Content */}
              <div className="max-h-96 overflow-y-auto pr-4">
                {getStepContent(selectedScenario, currentStep)}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTrainingDialog(false)}
                  >
                    Exit Training
                  </Button>
                  
                  {currentStep < selectedScenario.steps - 1 ? (
                    <Button
                      onClick={handleNextStep}
                      className="bg-cyber-primary hover:bg-blue-700"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowTrainingDialog(false);
                      }}
                      className="bg-cyber-success hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Training
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Training Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Training Resources & Materials</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Email Security Guide</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Comprehensive guide to email security best practices</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open('/api/training-resources/email-security/download', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Incident Response Playbook</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Step-by-step incident response procedures and checklists</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open('/api/training-resources/incident-response/download', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Key className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Password Policy Template</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Organizational password policy template and guidelines</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open('/api/training-resources/password-policy/download', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium">Social Engineering Defense</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Training materials for recognizing social engineering attacks</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open('/api/training-resources/social-engineering/download', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">🚨 Phishing Red Flags</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Urgent language and time pressure</li>
                <li>• Requests for credentials or personal info</li>
                <li>• Unexpected attachments or links</li>
                <li>• Sender address doesn't match organization</li>
                <li>• Poor grammar and spelling errors</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Safe Email Practices</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Verify sender through separate channel</li>
                <li>• Hover over links to check destinations</li>
                <li>• Don't download unexpected attachments</li>
                <li>• Report suspicious emails to IT</li>
                <li>• Use organization's secure communication</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🔒 Strong Password Checklist</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• At least 12 characters long</li>
                <li>• Unique for every account</li>
                <li>• Use a password manager</li>
                <li>• Enable multi-factor authentication</li>
                <li>• Avoid personal information</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚡ Incident Response Steps</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Document what you observe</li>
                <li>• Don't panic or act hastily</li>
                <li>• Notify security team immediately</li>
                <li>• Preserve evidence - don't delete</li>
                <li>• Follow organization procedures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Progress Modal */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedScenario?.title}</DialogTitle>
          </DialogHeader>
          {selectedScenario && renderTrainingContent()}
        </DialogContent>
      </Dialog>

      {/* Interactive Exercise Modal */}
      <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-cyber-primary" />
              <span>{currentExercise?.title}</span>
            </DialogTitle>
            <DialogDescription>
              Interactive cybersecurity training exercise
            </DialogDescription>
          </DialogHeader>
          
          {currentExercise?.questions && !showResults && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Question {exerciseStep + 1} of {currentExercise.questions.length}
                </span>
                <Badge variant="outline">
                  Score: {exerciseScore}/{currentExercise.questions.length}
                </Badge>
              </div>
              
              <Progress 
                value={((exerciseStep) / currentExercise.questions.length) * 100} 
                className="w-full" 
              />
              
              {currentExercise.questions[exerciseStep] && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Scenario:</h4>
                    <p className="text-blue-800">{currentExercise.questions[exerciseStep].scenario}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">{currentExercise.questions[exerciseStep].question}</h4>
                    <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                      {currentExercise.questions[exerciseStep].options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setExerciseStep(Math.max(0, exerciseStep - 1))}
                      disabled={exerciseStep === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button 
                      onClick={() => {
                        const correct = parseInt(selectedAnswer) === currentExercise.questions[exerciseStep].correct;
                        if (correct) {
                          setExerciseScore(exerciseScore + 1);
                        }
                        
                        if (exerciseStep < currentExercise.questions.length - 1) {
                          setExerciseStep(exerciseStep + 1);
                          setSelectedAnswer("");
                        } else {
                          setShowResults(true);
                        }
                      }}
                      disabled={selectedAnswer === ""}
                      className="bg-cyber-primary hover:bg-blue-700"
                    >
                      {exerciseStep === currentExercise.questions.length - 1 ? "Finish" : "Next"}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {showResults && currentExercise && (
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                {exerciseScore === currentExercise.questions.length ? (
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                ) : exerciseScore >= currentExercise.questions.length * 0.7 ? (
                  <Award className="h-16 w-16 text-green-500 mx-auto" />
                ) : (
                  <Target className="h-16 w-16 text-blue-500 mx-auto" />
                )}
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">Exercise Complete!</h3>
                  <p className="text-lg mb-4">
                    You scored {exerciseScore} out of {currentExercise.questions.length}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-green-600 font-medium">Accuracy</div>
                      <div className="text-2xl font-bold text-green-700">
                        {Math.round((exerciseScore / currentExercise.questions.length) * 100)}%
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-blue-600 font-medium">Questions</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {currentExercise.questions.length}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-purple-600 font-medium">Time</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {currentExercise.timeEstimate}
                      </div>
                    </div>
                  </div>
                </div>
                
                {exerciseScore === currentExercise.questions.length && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">🏆 Perfect Score!</h4>
                    <p className="text-yellow-800">
                      Excellent work! You've demonstrated strong cybersecurity awareness skills.
                    </p>
                  </div>
                )}
                
                {exerciseScore < currentExercise.questions.length * 0.7 && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📚 Keep Learning!</h4>
                    <p className="text-blue-800">
                      Review the training materials and try again to improve your score.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setExerciseStep(0);
                    setExerciseScore(0);
                    setSelectedAnswer("");
                    setShowResults(false);
                  }}
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => setShowExerciseModal(false)}
                  className="bg-cyber-primary hover:bg-blue-700"
                >
                  Continue Training
                </Button>
              </div>
            </div>
          )}
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
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">🎯 Next Achievement</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Crown className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Security Guardian</p>
                    <p className="text-sm text-blue-700">Complete 5 security scenarios (3/5 completed)</p>
                  </div>
                </div>
                <Progress value={60} className="mt-3 h-2" />
              </CardContent>
            </Card>

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