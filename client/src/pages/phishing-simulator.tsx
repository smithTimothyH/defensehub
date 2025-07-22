import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fish, Zap, Play, AlertTriangle, Eye, Users, Calendar, Target, Brain, MessageSquare, Star, TrendingUp, CheckCircle, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PhishingSimulator() {
  const [selectedSimulation, setSelectedSimulation] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  const [showCoachDialog, setShowCoachDialog] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignEmails, setCampaignEmails] = useState("");
  const [userSkillLevel, setUserSkillLevel] = useState(75);
  const [adaptiveSuggestions, setAdaptiveSuggestions] = useState<string[]>([]);
  const [coachingMessage, setCoachingMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // AI coaching suggestions based on performance
  const coachingSuggestions = [
    "Focus on sender verification - check email addresses carefully",
    "Look for urgency tactics that pressure quick decisions",
    "Verify requests through alternative communication channels",
    "Be suspicious of unexpected attachments or links",
    "Pay attention to grammar and spelling inconsistencies"
  ];

  // Simulate adaptive AI coaching based on user performance
  useEffect(() => {
    const generateAdaptiveCoaching = () => {
      const suggestions = coachingSuggestions.filter(() => Math.random() > 0.5);
      setAdaptiveSuggestions(suggestions.slice(0, 3));
      
      if (userSkillLevel < 70) {
        setCoachingMessage("Your security awareness could use improvement. Let's focus on the fundamentals of phishing detection.");
      } else if (userSkillLevel < 85) {
        setCoachingMessage("Good progress! You're developing solid security instincts. Let's work on advanced techniques.");
      } else {
        setCoachingMessage("Excellent security awareness! You're ready for advanced scenarios and peer mentoring.");
      }
    };

    generateAdaptiveCoaching();
  }, [userSkillLevel]);

  const { data: simulations, isLoading } = useQuery({
    queryKey: ["/api/simulations"],
  });

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

  const handleGenerateScenario = () => {
    if (!selectedSimulation) {
      toast({
        title: "No Simulation Selected",
        description: "Please select a simulation to generate a phishing scenario for.",
        variant: "destructive",
      });
      return;
    }

    const config = {
      difficulty: difficulty as "basic" | "intermediate" | "advanced",
      targetAudience: ["All Employees"],
      companyName: "Your Organization",
      industry: "Technology",
    };

    generateScenarioMutation.mutate({
      simulationId: selectedSimulation,
      config,
    });
  };

  const launchCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const emails = data.emails.split('\n').filter((email: string) => email.trim());
      
      // Launch campaign by sending emails
      const responses = await Promise.all(
        emails.map(async (email: string) => {
          const response = await fetch('/api/email/phishing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email.trim(),
              scenario: {
                type: selectedCampaign?.configuration?.template || 'urgent-security',
                targetUrl: 'https://example.com'
              }
            })
          });
          return response.json();
        })
      );
      
      return { responses, count: emails.length };
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Launched",
        description: `Successfully sent ${data.count} phishing simulation emails.`,
      });
      setShowLaunchDialog(false);
      setCampaignName("");
      setCampaignEmails("");
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
    },
    onError: () => {
      toast({
        title: "Launch Failed",
        description: "Failed to launch phishing campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (simulation: any) => {
    setSelectedCampaign(simulation);
    setShowDetailsDialog(true);
  };

  const handleLaunchCampaign = (simulation: any) => {
    setSelectedCampaign(simulation);
    setCampaignName(simulation.name + " - " + new Date().toLocaleDateString());
    setShowLaunchDialog(true);
  };

  const handleLaunchSubmit = () => {
    if (!campaignEmails.trim()) {
      toast({
        title: "Missing Email Addresses",
        description: "Please enter email addresses to send the campaign to.",
        variant: "destructive",
      });
      return;
    }

    launchCampaignMutation.mutate({
      campaignName,
      emails: campaignEmails,
      simulationId: selectedCampaign.id
    });
  };

  const phishingSimulations = (simulations as any)?.filter((sim: any) => sim.type === "phishing") || [];

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

            <div>
              <Label>Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - Obvious red flags</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Moderate sophistication</SelectItem>
                  <SelectItem value="advanced">Advanced - Highly convincing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateScenario}
              disabled={generateScenarioMutation.isPending || !selectedSimulation}
              className="w-full bg-cyber-primary hover:bg-blue-700"
            >
              {generateScenarioMutation.isPending ? "Generating..." : "Generate AI Phishing Scenario"}
            </Button>

            {generateScenarioMutation.isPending && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-primary"></div>
                  <span className="text-sm text-cyber-primary">AI is crafting a personalized phishing scenario...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Campaigns</span>
              <Badge variant="secondary">{phishingSimulations.filter((s: any) => s.status === "active").length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Click Rate</span>
              <Badge variant="secondary" className="bg-cyber-warning bg-opacity-20 text-cyber-warning">23%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Report Rate</span>
              <Badge variant="secondary" className="bg-cyber-success bg-opacity-20 text-cyber-success">67%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Response Time</span>
              <Badge variant="secondary">4.2 min</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Phishing Campaigns</CardTitle>
            <Dialog open={showLaunchDialog} onOpenChange={setShowLaunchDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Launch New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Launch Phishing Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Campaign Name</Label>
                    <Input 
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div>
                    <Label>Target Email Addresses</Label>
                    <Textarea
                      value={campaignEmails}
                      onChange={(e) => setCampaignEmails(e.target.value)}
                      placeholder="Enter email addresses (one per line)&#10;example1@company.com&#10;example2@company.com"
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter one email address per line. The phishing simulation will be sent to all addresses.
                    </p>
                  </div>
                  {selectedCampaign && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Selected Simulation:</h4>
                      <p className="text-blue-800">{selectedCampaign.name}</p>
                      <p className="text-sm text-blue-600">
                        Difficulty: {selectedCampaign.configuration?.difficulty || 'intermediate'}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : phishingSimulations.length > 0 ? (
            <div className="space-y-4">
              {phishingSimulations.map((simulation: any) => (
                <div key={simulation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{simulation.name}</h4>
                      <p className="text-sm text-gray-500">
                        Target: {simulation.targetAudience?.join(", ") || "All Employees"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={
                          simulation.status === "active" 
                            ? "bg-cyber-success bg-opacity-20 text-cyber-success"
                            : "bg-gray-500 bg-opacity-20 text-gray-500"
                        }
                      >
                        {simulation.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(simulation)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleLaunchCampaign(simulation)}
                        className="bg-green-50 text-green-700 hover:bg-green-100"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Launch
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Fish className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No phishing campaigns found.</p>
              <p className="text-sm text-gray-400">Create your first phishing simulation to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name} - Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Target Audience
                  </Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {selectedCampaign.targetAudience?.join(", ") || "All Employees"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Difficulty Level
                  </Label>
                  <Badge variant="secondary">
                    {selectedCampaign.configuration?.difficulty || 'intermediate'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created
                  </Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {new Date(selectedCampaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge 
                    variant="secondary"
                    className={
                      selectedCampaign.status === "active" 
                        ? "bg-cyber-success bg-opacity-20 text-cyber-success"
                        : "bg-gray-500 bg-opacity-20 text-gray-500"
                    }
                  >
                    {selectedCampaign.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Template Type</Label>
                <p className="text-sm bg-blue-50 p-3 rounded">
                  <strong>{selectedCampaign.configuration?.template || 'urgent-security'}</strong>
                  <br />
                  <span className="text-gray-600">
                    {selectedCampaign.configuration?.template === 'urgent-security' && 'Urgent security alert requiring immediate action'}
                    {selectedCampaign.configuration?.template === 'software-update' && 'Critical software update notification'}
                    {selectedCampaign.configuration?.template === 'invoice-scam' && 'Fake invoice payment request'}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Industry Context</Label>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedCampaign.configuration?.industry || 'General'}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Training Simulation</h4>
                <p className="text-sm text-yellow-700">
                  All emails sent from this simulation will include training disclaimers and link to educational content.
                  No actual credentials or sensitive data will be collected.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailsDialog(false);
                    handleLaunchCampaign(selectedCampaign);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Launch Campaign
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Coaching Dialog */}
      <Dialog open={showCoachDialog} onOpenChange={setShowCoachDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              AI Security Coach
            </DialogTitle>
            <DialogDescription>
              Personalized coaching based on your phishing detection performance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Skill Level Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Security Awareness Level</h4>
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  {userSkillLevel >= 85 ? 'Expert' : userSkillLevel >= 70 ? 'Advanced' : 'Intermediate'}
                </Badge>
              </div>
              <Progress value={userSkillLevel} className="h-3" />
              <p className="text-sm text-gray-600">{userSkillLevel}% - {coachingMessage}</p>
            </div>

            {/* Adaptive Suggestions */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                Personalized Training Focus
              </h4>
              <div className="space-y-2">
                {adaptiveSuggestions.map((suggestion, index) => (
                  <Alert key={index} className="bg-blue-50 border-blue-200">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      {suggestion}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Strengths</p>
                      <p className="text-xs text-green-700">Email verification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Focus Area</p>
                      <p className="text-xs text-orange-700">Link analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowCoachDialog(false)}>
                Close
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setUserSkillLevel(prev => Math.min(100, prev + 5));
                  toast({
                    title: "Practice Session Started",
                    description: "AI coach will provide real-time feedback during training.",
                  });
                  setShowCoachDialog(false);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Guided Practice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
