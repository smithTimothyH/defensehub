import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Fish, Zap, Play, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PhishingSimulator() {
  const [selectedSimulation, setSelectedSimulation] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState("intermediate");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const phishingSimulations = (simulations as any)?.filter((sim: any) => sim.type === "phishing") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phishing Simulator</h2>
          <p className="text-gray-600">Create and manage AI-powered phishing campaigns for security awareness training</p>
        </div>
        <div className="flex items-center space-x-2">
          <Fish className="h-6 w-6 text-cyber-primary" />
          <Zap className="h-5 w-5 text-cyber-warning" />
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
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Launch New Campaign
            </Button>
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
                      <Button variant="outline" size="sm">
                        View Details
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
    </div>
  );
}
