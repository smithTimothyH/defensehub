import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Clock, Users, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getWebSocketManager } from "@/lib/websocket";

export default function CrisisSimulation() {
  const [selectedScenario, setSelectedScenario] = useState("");
  const [currentPhase, setCurrentPhase] = useState(0);
  const [simulationActive, setSimulationActive] = useState(false);
  const [scenarioData, setScenarioData] = useState<any>(null);
  const [wsManager] = useState(() => getWebSocketManager());
  const { toast } = useToast();

  useEffect(() => {
    // Initialize WebSocket connection
    wsManager.connect().catch(console.error);

    return () => {
      wsManager.disconnect();
    };
  }, [wsManager]);

  const generateScenarioMutation = useMutation({
    mutationFn: async (data: { scenarioType: string; complexity: string }) => {
      const response = await apiRequest("POST", "/api/crisis-scenarios", data);
      return response.json();
    },
    onSuccess: (data) => {
      setScenarioData(data);
      setSimulationActive(true);
      setCurrentPhase(0);
      toast({
        title: "Crisis Scenario Generated",
        description: "Your crisis simulation is now active. Make your decisions carefully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate crisis scenario. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateScenario = () => {
    if (!selectedScenario) {
      toast({
        title: "No Scenario Selected",
        description: "Please select a crisis scenario type.",
        variant: "destructive",
      });
      return;
    }

    generateScenarioMutation.mutate({
      scenarioType: selectedScenario,
      complexity: "intermediate",
    });
  };

  const handleDecision = (decision: string) => {
    // Send decision via WebSocket
    wsManager.sendMessage({
      type: "crisis_response",
      userId: 1, // Default user ID for demo
      simulationId: 1,
      decision,
      phase: currentPhase,
    });

    // Move to next phase
    if (scenarioData && currentPhase < scenarioData.phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    } else {
      // Simulation complete
      setSimulationActive(false);
      toast({
        title: "Simulation Complete",
        description: "Your crisis simulation has been completed. Review your performance in the reports section.",
      });
    }
  };

  const crisisTypes = [
    { value: "ransomware", label: "Ransomware Attack" },
    { value: "data_breach", label: "Data Breach" },
    { value: "insider_threat", label: "Insider Threat" },
    { value: "ddos", label: "DDoS Attack" },
    { value: "supply_chain", label: "Supply Chain Compromise" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crisis Simulation</h2>
          <p className="text-gray-600">Test your incident response and decision-making under pressure</p>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6 text-cyber-error" />
          <span className="text-sm font-medium text-cyber-error">High Severity Training</span>
        </div>
      </div>

      {!simulationActive ? (
        // Scenario Setup
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Generate Crisis Scenario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crisis Type
                </label>
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a crisis scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {crisisTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateScenario}
                disabled={generateScenarioMutation.isPending}
                className="w-full bg-cyber-error hover:bg-red-700"
              >
                {generateScenarioMutation.isPending ? "Generating Crisis..." : "Start Crisis Simulation"}
              </Button>

              {generateScenarioMutation.isPending && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-error"></div>
                    <span className="text-sm text-cyber-error">AI is creating a realistic crisis scenario...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Simulation Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-cyber-warning mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Time Pressure</p>
                  <p className="text-sm text-gray-600">Make decisions quickly but carefully</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-cyber-primary mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Stakeholders</p>
                  <p className="text-sm text-gray-600">Consider impact on all parties</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Communication</p>
                  <p className="text-sm text-gray-600">Clear and timely updates are crucial</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Active Simulation
        <div className="space-y-6">
          {/* Crisis Alert Header */}
          <Card className="border-cyber-error bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-cyber-error rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cyber-error">ACTIVE CRISIS SIMULATION</h3>
                  <p className="text-gray-700">{scenarioData?.title}</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="destructive" className="bg-cyber-error">
                    Phase {currentPhase + 1} of {scenarioData?.phases?.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Description */}
          {currentPhase === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Incident Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{scenarioData?.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Current Phase */}
          {scenarioData?.phases?.[currentPhase] && (
            <Card>
              <CardHeader>
                <CardTitle>{scenarioData.phases[currentPhase].phase}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  {scenarioData.phases[currentPhase].description}
                </p>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Choose your response:</h4>
                  <div className="space-y-3">
                    {scenarioData.phases[currentPhase].decisions?.map((decision: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left justify-start h-auto p-4"
                        onClick={() => handleDecision(decision)}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {decision}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Indicator */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Simulation Progress</span>
                <span className="text-sm text-gray-500">
                  {currentPhase + 1} / {scenarioData?.phases?.length}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-cyber-error h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((currentPhase + 1) / (scenarioData?.phases?.length || 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Simulations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Crisis Simulations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent crisis simulations found.</p>
            <p className="text-sm text-gray-400">Complete a simulation to see your performance history.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
