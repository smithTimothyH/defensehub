import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Fish, Scale, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function RecentSimulations() {
  const { data: simulations, isLoading } = useQuery({
    queryKey: ["/api/simulations"],
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Simulations</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSimulationIcon = (type: string) => {
    switch (type) {
      case "crisis":
        return <AlertTriangle className="text-cyber-error" />;
      case "phishing":
        return <Fish className="text-cyber-primary" />;
      case "compliance":
        return <Scale className="text-purple-600" />;
      default:
        return <AlertTriangle className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-cyber-warning bg-opacity-20 text-cyber-warning">In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-cyber-success bg-opacity-20 text-cyber-success">Completed</Badge>;
      case "paused":
        return <Badge variant="secondary" className="bg-gray-500 bg-opacity-20 text-gray-500">Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Simulations</h3>
          <Button variant="ghost" size="sm" className="text-cyber-primary hover:text-blue-700">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(simulations as any)?.slice(0, 3).map((simulation: any) => (
            <div key={simulation.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  {getSimulationIcon(simulation.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{simulation.name}</p>
                  <p className="text-sm text-gray-500">
                    {simulation.createdAt ? formatDistanceToNow(new Date(simulation.createdAt), { addSuffix: true }) : 'Recently'} • {simulation.targetAudience?.join(", ") || "All Departments"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(simulation.status)}
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {!simulations || (simulations as any)?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No simulations found. Start your first simulation to begin training.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
