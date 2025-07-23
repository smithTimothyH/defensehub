import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Fish, Zap, Brain, Target, Star, Shield, Mail, Eye, Play, AlertTriangle, Trophy, Users, FileText, CheckCircle, ArrowRight, TrendingUp, Lightbulb, Clock, Award, Building, UserCheck } from "lucide-react";

export default function PhishingSimulator() {
  const [selectedSimulation, setSelectedSimulation] = useState<number | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  const [showCoachDialog, setShowCoachDialog] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignEmails, setCampaignEmails] = useState("");
  const [targetingMode, setTargetingMode] = useState<"individual" | "departments">("individual");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  
  // Calculate real skill level from simulation data
  const { data: simulations } = useQuery({
    queryKey: ["/api/simulations"],
  });
  
  const phishingSimulations = (simulations as any)?.filter((sim: any) => sim.type === "phishing") || [];
  const completedSimulations = phishingSimulations.filter((sim: any) => sim.status === "completed").length;
  const totalSimulations = phishingSimulations.length;
  
  // Real skill calculation: 0-100 based on completion rate and complexity
  const baseSkill = totalSimulations > 0 ? (completedSimulations / totalSimulations) * 70 : 0;
  const bonusSkill = Math.min(30, completedSimulations * 5); // Bonus for experience
  const userSkillLevel = Math.round(baseSkill + bonusSkill);
  
  const [adaptiveSuggestions, setAdaptiveSuggestions] = useState<string[]>([]);
  const [coachingMessage, setCoachingMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Department email lists for targeting
  const departmentEmails = {
    executive: [
      "ceo@company.com",
      "cfo@company.com", 
      "cto@company.com",
      "coo@company.com",
      "president@company.com"
    ],
    legal: [
      "legal@company.com",
      "counsel@company.com",
      "compliance@company.com",
      "contracts@company.com",
      "legal.director@company.com"
    ],
    hr: [
      "hr@company.com",
      "recruiter@company.com",
      "benefits@company.com",
      "hr.director@company.com",
      "talent@company.com"
    ],
    customerService: [
      "support@company.com",
      "service@company.com",
      "help@company.com", 
      "care@company.com",
      "cs.manager@company.com"
    ],
    finance: [
      "finance@company.com",
      "accounting@company.com",
      "payroll@company.com",
      "billing@company.com",
      "finance.director@company.com"
    ],
    it: [
      "it@company.com",
      "support@company.com",
      "admin@company.com",
      "security@company.com",
      "it.director@company.com"
    ],
    marketing: [
      "marketing@company.com",
      "pr@company.com",
      "social@company.com",
      "campaigns@company.com",
      "marketing.director@company.com"
    ],
    sales: [
      "sales@company.com",
      "business@company.com",
      "sales.manager@company.com",
      "revenue@company.com",
      "account@company.com"
    ]
  };

  const departmentInfo = [
    { 
      id: "executive",
      name: "Executive Team", 
      description: "C-suite and senior leadership",
      count: departmentEmails.executive.length,
      icon: <Building className="h-4 w-4" />,
      riskLevel: "Critical"
    },
    { 
      id: "legal",
      name: "Legal Department", 
      description: "Legal and compliance team",
      count: departmentEmails.legal.length,
      icon: <FileText className="h-4 w-4" />,
      riskLevel: "High"
    },
    { 
      id: "hr",
      name: "Human Resources", 
      description: "HR and talent management",
      count: departmentEmails.hr.length,
      icon: <UserCheck className="h-4 w-4" />,
      riskLevel: "High"
    },
    { 
      id: "customerService",
      name: "Customer Service", 
      description: "Customer support and care",
      count: departmentEmails.customerService.length,
      icon: <Users className="h-4 w-4" />,
      riskLevel: "Medium"
    },
    { 
      id: "finance",
      name: "Finance & Accounting", 
      description: "Financial operations team",
      count: departmentEmails.finance.length,
      icon: <TrendingUp className="h-4 w-4" />,
      riskLevel: "High"
    },
    { 
      id: "it",
      name: "IT Department", 
      description: "Technology and security team",
      count: departmentEmails.it.length,
      icon: <Shield className="h-4 w-4" />,
      riskLevel: "Critical"
    },
    { 
      id: "marketing",
      name: "Marketing & PR", 
      description: "Marketing and communications",
      count: departmentEmails.marketing.length,
      icon: <Lightbulb className="h-4 w-4" />,
      riskLevel: "Medium"
    },
    { 
      id: "sales",
      name: "Sales Team", 
      description: "Business development and sales",
      count: departmentEmails.sales.length,
      icon: <Target className="h-4 w-4" />,
      riskLevel: "Medium"
    }
  ];

  const coachingSuggestions = [
    "Check sender address carefully for suspicious domains",
    "Look for urgent language and pressure tactics",
    "Verify requests through separate communication channels",
    "Be suspicious of unexpected attachments or links",
    "Pay attention to grammar and spelling inconsistencies"
  ];

  // Generate coaching based on real performance data
  useEffect(() => {
    const generateAdaptiveCoaching = () => {
      // Select suggestions based on actual skill level
      let suggestions = [];
      
      if (userSkillLevel < 30) {
        suggestions = coachingSuggestions.slice(0, 4); // More basic suggestions
        setCoachingMessage("Start with the basics of email security and phishing recognition.");
      } else if (userSkillLevel < 60) {
        suggestions = coachingSuggestions.slice(1, 4); // Intermediate suggestions
        setCoachingMessage("Good foundation! Focus on advanced threat recognition patterns.");
      } else if (userSkillLevel < 85) {
        suggestions = coachingSuggestions.slice(2, 5); // Advanced suggestions
        setCoachingMessage("Strong skills! Work on complex attack scenario identification.");
      } else {
        suggestions = [coachingSuggestions[4], "Train others on advanced threats", "Contribute to security policy development"];
        setCoachingMessage("Expert level! Consider mentoring others and policy development.");
      }
      
      setAdaptiveSuggestions(suggestions);
    };

    generateAdaptiveCoaching();
  }, [userSkillLevel, completedSimulations]);

  const generateScenarioMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/simulations/${data.simulationId}/phishing-scenario`, data.config);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scenario Generated",
        description: "AI has generated a new phishing scenario for your simulation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate phishing scenario. Please try again.",
        variant: "destructive",
      });
    },
  });

  const launchCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/phishing-campaigns", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign Launched",
        description: "Phishing simulation campaign has been successfully launched.",
      });
      setShowLaunchDialog(false);
      setCampaignName("");
      setCampaignEmails("");
      setTargetingMode("individual");
      setSelectedDepartments([]);
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to launch campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateScenario = () => {
    if (!selectedSimulation) {
      toast({
        title: "No Simulation Selected",
        description: "Please select a simulation to generate a phishing scenario for.",
        variant: "destructive",
      });
      return;
    }

    generateScenarioMutation.mutate({
      simulationId: selectedSimulation,
      config: {
        difficulty: "intermediate",
        targetAudience: "general",
        theme: "business_email"
      }
    });
  };

  const handleViewDetails = (simulation: any) => {
    setSelectedCampaign(simulation);
    setShowDetailsDialog(true);
  };

  const handleLaunchCampaign = (simulation: any) => {
    setSelectedCampaign(simulation);
    setCampaignName(simulation.name + " - " + new Date().toLocaleDateString());
    setTargetingMode("individual");
    setSelectedDepartments([]);
    setShowLaunchDialog(true);
  };

  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedDepartments(prev => 
      prev.includes(departmentId) 
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Critical": return "text-red-600 bg-red-50 border-red-200";
      case "High": return "text-orange-600 bg-orange-50 border-orange-200";
      case "Medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleLaunchSubmit = () => {
    let emails = "";
    
    if (targetingMode === "individual") {
      if (!campaignEmails.trim()) {
        toast({
          title: "Missing Email Addresses",
          description: "Please enter email addresses to send the campaign to.",
          variant: "destructive",
        });
        return;
      }
      emails = campaignEmails;
    } else {
      if (selectedDepartments.length === 0) {
        toast({
          title: "No Departments Selected",
          description: "Please select at least one department to target.",
          variant: "destructive",
        });
        return;
      }
      
      // Combine all emails from selected departments
      const departmentEmailsList = selectedDepartments.flatMap(dept => 
        departmentEmails[dept as keyof typeof departmentEmails] || []
      );
      
      // Add any additional manual emails
      const additionalEmails = campaignEmails.trim() ? campaignEmails.split("\n").filter(email => email.trim()) : [];
      const allEmails = [...departmentEmailsList, ...additionalEmails];
      emails = allEmails.join("\n");
    }

    launchCampaignMutation.mutate({
      campaignName,
      emails,
      simulationId: selectedCampaign.id,
      targetingMode,
      departments: targetingMode === "departments" ? selectedDepartments : undefined
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phishing Simulator</h2>
          <p className="text-gray-600">AI-powered phishing campaigns with adaptive coaching</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setShowCoachDialog(true)}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Coach
          </Button>
          <div className="flex items-center space-x-2">
            <Fish className="h-6 w-6 text-cyber-primary" />
            <Zap className="h-5 w-5 text-cyber-warning" />
          </div>
        </div>
      </div>

      {/* Real Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Skill Level</p>
                <p className="text-lg font-bold text-green-700">{userSkillLevel}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Completed</p>
                <p className="text-lg font-bold text-blue-700">{completedSimulations}/{totalSimulations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Success Rate</p>
                <p className="text-lg font-bold text-orange-700">
                  {totalSimulations > 0 ? Math.round((completedSimulations / totalSimulations) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Generator */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-cyber-warning" />
              <span>AI Scenario Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Simulation</Label>
              <Select value={selectedSimulation?.toString() || ""} onValueChange={(value) => setSelectedSimulation(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a phishing simulation" />
                </SelectTrigger>
                <SelectContent>
                  {phishingSimulations.map((sim: any) => (
                    <SelectItem key={sim.id} value={sim.id.toString()}>
                      {sim.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleGenerateScenario}
              disabled={!selectedSimulation || generateScenarioMutation.isPending}
              className="w-full bg-cyber-primary hover:bg-blue-700"
            >
              {generateScenarioMutation.isPending ? "Generating..." : "Generate AI Scenario"}
            </Button>
          </CardContent>
        </Card>

        {/* AI Coach Panel */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Brain className="h-5 w-5" />
              <span>AI Coach</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white p-3 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-700">{coachingMessage}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-purple-800 text-sm">Quick Tips:</h4>
              {adaptiveSuggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Lightbulb className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-purple-700">{suggestion}</p>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCoachDialog(true)}
              className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              View Full Analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-cyber-primary" />
            <span>Active Phishing Simulations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {phishingSimulations.length === 0 ? (
            <div className="text-center py-8">
              <Fish className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No phishing simulations available yet.</p>
              <p className="text-sm text-gray-400">Create a new simulation to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phishingSimulations.map((simulation: any) => (
                <Card key={simulation.id} className="border-l-4 border-l-cyber-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{simulation.name}</h4>
                      <Badge variant={simulation.status === "completed" ? "default" : "secondary"}>
                        {simulation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{simulation.description}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(simulation)}>
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button size="sm" onClick={() => handleLaunchCampaign(simulation)} className="bg-cyber-primary hover:bg-blue-700">
                        <Play className="h-3 w-3 mr-1" />
                        Launch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Coach Dialog */}
      <Dialog open={showCoachDialog} onOpenChange={setShowCoachDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>AI Security Coach Analysis</span>
            </DialogTitle>
            <DialogDescription>
              Personalized security awareness coaching based on your performance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Skill Assessment */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-purple-900">Current Skill Assessment</h3>
                  <Badge className="bg-purple-100 text-purple-700">{userSkillLevel}% Proficiency</Badge>
                </div>
                <Progress value={userSkillLevel} className="h-3 mb-2" />
                <p className="text-sm text-purple-700">{coachingMessage}</p>
              </CardContent>
            </Card>

            {/* Adaptive Recommendations */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Personalized Recommendations</h4>
              {adaptiveSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedSimulations}</div>
                <div className="text-sm text-gray-600">Simulations Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userSkillLevel}%</div>
                <div className="text-sm text-gray-600">Security Awareness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userSkillLevel >= 85 ? "Expert" : userSkillLevel >= 60 ? "Advanced" : userSkillLevel >= 30 ? "Intermediate" : "Beginner"}
                </div>
                <div className="text-sm text-gray-600">Skill Level</div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowCoachDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Launch Campaign Dialog */}
      <Dialog open={showLaunchDialog} onOpenChange={setShowLaunchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch Phishing Campaign</DialogTitle>
            <DialogDescription>
              Configure and launch a phishing simulation campaign
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>
            
            {/* Targeting Mode Selection */}
            <div>
              <Label className="text-base font-medium">Targeting Method</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="individual"
                    checked={targetingMode === "individual"}
                    onChange={(e) => setTargetingMode(e.target.value as "individual" | "departments")}
                    className="text-blue-600"
                  />
                  <span>Individual Email Addresses</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="departments"
                    checked={targetingMode === "departments"}
                    onChange={(e) => setTargetingMode(e.target.value as "individual" | "departments")}
                    className="text-blue-600"
                  />
                  <span>Target Departments</span>
                </label>
              </div>
            </div>

            {/* Individual Email Input */}
            {targetingMode === "individual" && (
              <div>
                <Label htmlFor="campaign-emails">Target Email Addresses</Label>
                <Textarea
                  id="campaign-emails"
                  value={campaignEmails}
                  onChange={(e) => setCampaignEmails(e.target.value)}
                  placeholder="Enter email addresses (one per line)"
                  rows={4}
                />
              </div>
            )}

            {/* Department Selection */}
            {targetingMode === "departments" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-2 block">Select Departments</Label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-md p-3">
                    {departmentInfo.map((dept) => (
                      <div key={dept.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={dept.id}
                          checked={selectedDepartments.includes(dept.id)}
                          onCheckedChange={() => handleDepartmentToggle(dept.id)}
                        />
                        <label
                          htmlFor={dept.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {dept.name} ({dept.count})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="additional-emails">Additional Email Addresses (optional)</Label>
                  <Textarea
                    id="additional-emails"
                    value={campaignEmails}
                    onChange={(e) => setCampaignEmails(e.target.value)}
                    placeholder="Add extra email addresses (one per line)"
                    rows={3}
                  />
                </div>

                {selectedDepartments.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Selected {selectedDepartments.length} department(s) with {
                      selectedDepartments.reduce((total, dept) => 
                        total + (departmentEmails[dept as keyof typeof departmentEmails]?.length || 0), 0
                      )
                    } email addresses
                  </div>
                )}
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowLaunchDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleLaunchSubmit}
                disabled={launchCampaignMutation.isPending}
                className="bg-cyber-primary hover:bg-blue-700"
              >
                {launchCampaignMutation.isPending ? "Launching..." : "Launch Campaign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulation Details</DialogTitle>
            <DialogDescription>
              View comprehensive details about this phishing simulation
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Name</h4>
                <p className="text-gray-600">{selectedCampaign.name}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="text-gray-600">{selectedCampaign.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Status</h4>
                <Badge variant={selectedCampaign.status === "completed" ? "default" : "secondary"}>
                  {selectedCampaign.status}
                </Badge>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}