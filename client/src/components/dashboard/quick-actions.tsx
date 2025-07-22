import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fish, AlertTriangle, BarChart, Bot, ChevronRight } from "lucide-react";
import SimulationModal from "@/components/modals/simulation-modal";

export default function QuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  const actions = [
    {
      id: "phishing",
      title: "New Phishing Test",
      description: "AI-generated campaign",
      icon: Fish,
      bgColor: "bg-blue-100",
      iconColor: "text-cyber-primary",
    },
    {
      id: "crisis",
      title: "Crisis Simulation",
      description: "Tabletop exercise",
      icon: AlertTriangle,
      bgColor: "bg-red-100",
      iconColor: "text-cyber-error",
    },
    {
      id: "report",
      title: "Generate Report",
      description: "Compliance audit trail",
      icon: BarChart,
      bgColor: "bg-green-100",
      iconColor: "text-cyber-success",
    },
    {
      id: "coach",
      title: "AI Coach",
      description: "Get training insights",
      icon: Bot,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-auto"
                onClick={() => handleActionClick(action.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`${action.iconColor} h-4 w-4`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <SimulationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actionType={selectedAction}
      />
    </>
  );
}
