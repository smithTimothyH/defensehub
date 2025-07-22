import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: string;
}

export default function SimulationModal({ isOpen, onClose, actionType }: SimulationModalProps) {
  const [simulationType, setSimulationType] = useState("phishing");
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [complexity, setComplexity] = useState("intermediate");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSimulationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/simulations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Simulation Created",
        description: "Your simulation has been successfully created and is now running.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Simulation creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create simulation: ${error.message || "Please try again."}`,
        variant: "destructive",
      });
    },
  });

  const handleTargetAudienceChange = (audience: string, checked: boolean) => {
    if (checked) {
      setTargetAudience([...targetAudience, audience]);
    } else {
      setTargetAudience(targetAudience.filter(item => item !== audience));
    }
  };

  const handleSubmit = () => {
    if (targetAudience.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one target audience.",
        variant: "destructive",
      });
      return;
    }

    const simulationData = {
      name: `${simulationType.charAt(0).toUpperCase() + simulationType.slice(1)} Simulation - ${new Date().toLocaleDateString()}`,
      type: simulationType,
      configuration: {
        complexity,
        actionType,
      },
      targetAudience,
      createdBy: 2, // Use existing demo user ID
    };

    createSimulationMutation.mutate(simulationData);
  };

  const getSimulationTypeFromAction = (action: string) => {
    switch (action) {
      case "phishing":
        return "phishing";
      case "crisis":
        return "crisis";
      default:
        return "phishing";
    }
  };

  // Set simulation type based on action
  useState(() => {
    if (actionType) {
      setSimulationType(getSimulationTypeFromAction(actionType));
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start New Simulation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Simulation Type
            </Label>
            <Select value={simulationType} onValueChange={setSimulationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phishing">Phishing Campaign</SelectItem>
                <SelectItem value="crisis">Ransomware Crisis</SelectItem>
                <SelectItem value="training">Data Breach Response</SelectItem>
                <SelectItem value="compliance">Regulatory Audit</SelectItem>
                <SelectItem value="insider">Insider Threat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Target Audience
            </Label>
            <div className="flex flex-wrap gap-4">
              {["All Employees", "IT Department", "Management", "HR", "Finance"].map((audience) => (
                <div key={audience} className="flex items-center space-x-2">
                  <Checkbox
                    id={audience}
                    checked={targetAudience.includes(audience)}
                    onCheckedChange={(checked) => handleTargetAudienceChange(audience, checked as boolean)}
                  />
                  <Label htmlFor={audience} className="text-sm text-gray-700">
                    {audience}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              AI Complexity Level
            </Label>
            <Select value={complexity} onValueChange={setComplexity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (Template-based)</SelectItem>
                <SelectItem value="intermediate">Intermediate (GPT-Enhanced)</SelectItem>
                <SelectItem value="advanced">Advanced (Multi-Agent Crisis)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createSimulationMutation.isPending}
            className="bg-cyber-primary hover:bg-blue-700"
          >
            {createSimulationMutation.isPending ? "Creating..." : "Start Simulation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
